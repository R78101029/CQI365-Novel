#!/usr/bin/env node
/**
 * assemble.mjs — 把影片片段接成成品：剪輯 + 旁白 + 天數標記 + 尾幀停留。
 *
 *   node scripts/video/assemble.mjs --shots projects/HalfFinished/_dev/media/ep01/02_shots.json
 *   node scripts/video/assemble.mjs --shots <file> --no-vo        # 只出畫面
 *   node scripts/video/assemble.mjs --clips <dir> --out x.mp4     # 舊用法：純接片
 *
 * 讀 shots.json 的三軌：畫面（clips/）、旁白（audio/ + vo_track 的時間點）、
 * 天數標記（shot.day_marker）。與 animatic.mjs 同一套時間軸，所以動態腳本
 * 調好的節奏可以直接搬過來。
 *
 * 各家模型的輸出尺寸不保證一致（Kling 要 720x1280 會給 716x1284），
 * 所以一律重新縮放對齊，不用 stream copy。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const has = (n) => args.includes(`--${n}`);

function findFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  const base = path.join('C:/Users', process.env.USERNAME || '', 'AppData/Local/Microsoft/WinGet/Packages');
  if (!fs.existsSync(base)) return null;
  const stack = fs.readdirSync(base).filter((d) => /ffmpeg/i.test(d)).map((d) => path.join(base, d));
  while (stack.length) {
    const cur = stack.pop();
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (/^ffmpeg\.exe$/i.test(e.name)) return full;
    }
  }
  return null;
}
const FFMPEG = findFfmpeg();
if (!FFMPEG) { console.error('找不到 ffmpeg。winget install Gyan.FFmpeg'); process.exit(1); }

// ffmpeg 失敗時把 stderr 印出來。沉默的 ffmpeg 失敗最難查。
function ffmpegOrDie(ffArgs) {
  try {
    execFileSync(FFMPEG, ffArgs, { stdio: ['ignore', 'ignore', 'pipe'], cwd: ROOT });
  } catch (e) {
    const err = (e.stderr?.toString() ?? '').split('\n').filter(Boolean);
    console.error('ffmpeg 失敗：');
    console.error(err.slice(-14).join('\n'));
    process.exit(1);
  }
}

const [W, H] = flag('size', '720x1280').split('x').map(Number);
const FPS = Number(flag('fps', 24));

// --- 來源：shots.json（完整成品）或 --clips 目錄（純接片） ---
const shotsPath = flag('shots');
let doc = null, clips = [], outDefault = 'out.mp4';
if (shotsPath) {
  doc = JSON.parse(fs.readFileSync(shotsPath, 'utf8'));
  const epDir = path.join(ROOT, '_output', 'video', doc.novel, doc.episode);
  outDefault = path.join(epDir, 'out', `${doc.episode}.mp4`);
  clips = doc.shots.map((s) => {
    const f = path.join(epDir, 'clips', `${s.id}.mp4`);
    if (!fs.existsSync(f)) { console.error(`缺片段：${s.id}.mp4`); process.exit(1); }
    return { ...s, file: f };
  });
} else {
  const dir = flag('clips');
  if (!dir) { console.error('要 --shots <02_shots.json> 或 --clips <目錄>'); process.exit(1); }
  clips = fs.readdirSync(dir).filter((f) => f.endsWith('.mp4')).sort()
    .map((f) => ({ id: path.basename(f, '.mp4'), file: path.join(dir, f) }));
}
const out = flag('out', outDefault);
if (!clips.length) { console.error('沒有片段'); process.exit(1); }

const hold = Number(doc?.timeline?.hold_last_frame ?? 0);

// --- 旁白 ---
const vos = (!has('no-vo') && doc?.vo_track)
  ? doc.vo_track.map((v) => {
      const f = path.join(ROOT, '_output', 'video', doc.novel, doc.episode, 'audio', `vo_${v.id}.wav`);
      return fs.existsSync(f) ? { ...v, file: f } : null;
    }).filter(Boolean)
  : [];

// --- 配樂 ---
// 既有規範：配樂是背景音床，絕不與旁白搶。預設壓 22dB。
const bgmFile = (!has('no-bgm') && doc)
  ? path.join(ROOT, '_output', 'video', doc.novel, doc.episode, 'audio', 'bgm.mp3')
  : null;
const bgm = bgmFile && fs.existsSync(bgmFile) ? bgmFile : null;
const bgmDb = Number(flag('bgm-db', -22));

const inputs = [];
clips.forEach((c) => inputs.push('-i', c.file));
vos.forEach((v) => inputs.push('-i', v.file));
if (bgm) inputs.push('-i', bgm);

// 每段縮放對齊；最後一段用 tpad 凍結尾幀，把收尾的沉默留出來
const vparts = clips.map((c, i) => {
  const last = i === clips.length - 1 && hold > 0;
  return `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
    `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${FPS}` +
    (last ? `,tpad=stop_mode=clone:stop_duration=${hold}` : '') + `[v${i}]`;
}).join(';');
const vchain = clips.map((_, i) => `[v${i}]`).join('');
let filter = `${vparts};${vchain}concat=n=${clips.length}:v=1:a=0[cat]`;

// --- 天數標記 ---
// 字型路徑裡的冒號會被 ffmpeg 的 filter 解析器當成選項分隔符，加引號也沒用。
// 所以複製一份到專案內，用不含冒號的相對路徑。
const marks = [];
if (doc) {
  let cursor = 0;
  for (const s of doc.shots) {
    if (s.day_marker) marks.push({ text: s.day_marker, at: cursor });
    cursor += s.duration;
  }
}
if (marks.length) {
  const FONT_SRC = flag('font', path.join(process.env.SystemRoot || 'C:/Windows', 'Fonts', 'msjhl.ttc'));
  const fontRel = path.posix.join('_output', 'video', '.fonts', 'cjk.ttc');
  const fontAbs = path.join(ROOT, fontRel);
  if (!fs.existsSync(fontAbs)) {
    if (!fs.existsSync(FONT_SRC)) { console.error(`找不到中文字型：${FONT_SRC}`); process.exit(1); }
    fs.mkdirSync(path.dirname(fontAbs), { recursive: true });
    fs.copyFileSync(FONT_SRC, fontAbs);
  }
  const dwell = Number(flag('marker-dwell', 2.6));
  const draws = marks.map((m) =>
    `drawtext=fontfile=${fontRel}:text='${m.text}'` +
    `:fontsize=44:fontcolor=white@0.88:shadowcolor=black@0.55:shadowx=2:shadowy=2` +
    `:x=64:y=h-190:enable='between(t,${m.at.toFixed(2)},${(m.at + dwell).toFixed(2)})'`).join(',');
  filter += `;[cat]${draws}[outv]`;
} else {
  filter += ';[cat]null[outv]';
}

const maps = ['-map', '[outv]'];
const total = clips.reduce((a, c) => a + (c.duration ?? 0), 0) + hold;
const alabels = [];
if (vos.length) {
  // amix 會跟著第一個輸入的取樣率／聲道走。旁白是 24kHz mono，
  // 不先統一格式的話，44.1kHz 立體聲的配樂會被降格成 24k mono，弦樂會糊掉。
  filter += ';' + vos.map((v, k) =>
    `[${clips.length + k}:a]aresample=48000,aformat=channel_layouts=stereo,` +
    `adelay=${Math.round(v.start * 1000)}|${Math.round(v.start * 1000)}[a${k}]`).join(';');
  vos.forEach((_, k) => alabels.push(`[a${k}]`));
}
if (bgm) {
  const idx = clips.length + vos.length;
  const fadeOut = Math.max(0, total - 5);
  filter += `;[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,` +
    `volume=${bgmDb}dB,atrim=0:${total},asetpts=N/SR/TB,` +
    `afade=t=in:st=0:d=3,afade=t=out:st=${fadeOut}:d=5[bg]`;
  alabels.push('[bg]');
}
if (alabels.length) {
  filter += `;${alabels.join('')}amix=inputs=${alabels.length}:normalize=0:dropout_transition=0[outa]`;
  maps.push('-map', '[outa]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2');
} else {
  maps.push('-an');
}

const visual = clips.reduce((a, c) => a + (c.duration ?? 0), 0) + hold;
console.log(`${clips.length} 段｜${W}x${H} @${FPS}fps｜畫面 ${visual || '?'}s`);
console.log(`旁白 ${vos.length} 句${vos.length ? `，結束於 ${doc.timeline?.vo_ends_at}s` : '（無）'}｜配樂 ${bgm ? bgmDb + 'dB' : '無'}｜天數標記 ${marks.length} 個`);

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
ffmpegOrDie([
  '-y', ...inputs, '-filter_complex', filter, ...maps,
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
  out,  // 不要 -shortest：收尾的沉默是刻意的，會被它切掉
]);
console.log(`✓ ${path.relative(ROOT, out)}  ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
