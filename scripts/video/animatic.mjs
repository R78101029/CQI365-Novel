#!/usr/bin/env node
/**
 * animatic.mjs — 用分鏡圖 + 旁白做動態腳本（無影片生成，成本為零）。
 *
 *   node scripts/video/animatic.mjs --shots projects/HalfFinished/_dev/media/ep01/02_shots.json
 *
 * 這是花錢出片之前的最後一道關。分鏡圖靜止不動，旁白照實測時間點鋪上去，
 * 看的是「節奏對不對」——哪一鏡太長、哪一句擠、哪個切點該提前。
 * 節奏在這裡調到對，才去跑 gen-clip.mjs。
 *
 * 同時輸出 .srt，方便邊看邊對旁白。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

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
if (!FFMPEG) { console.error('找不到 ffmpeg'); process.exit(1); }

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

const shotsPath = flag('shots');
if (!shotsPath) { console.error('要 --shots <02_shots.json>'); process.exit(1); }
const doc = JSON.parse(fs.readFileSync(shotsPath, 'utf8'));

const epDir = path.join(ROOT, '_output', 'video', doc.novel, doc.episode);
const framesDir = path.join(epDir, 'frames');
const audioDir = path.join(epDir, 'audio');
const outDir = path.join(epDir, 'out');
fs.mkdirSync(outDir, { recursive: true });
const out = flag('out', path.join(outDir, 'animatic.mp4'));

const [W, H] = flag('size', '720x1280').split('x').map(Number);
const FPS = Number(flag('fps', 24));
const hold = Number(doc.timeline?.hold_last_frame ?? 0);

// --- 畫面：每張分鏡圖依鏡長停留 ---
const shots = doc.shots.map((s, i) => {
  const f = path.join(framesDir, `${s.id}.jpg`);
  if (!fs.existsSync(f)) { console.error(`缺分鏡圖：${s.id}.jpg`); process.exit(1); }
  const extra = i === doc.shots.length - 1 ? hold : 0;
  return { ...s, file: f, hold: s.duration + extra };
});

// --- 旁白：照 vo_track 的實測起點鋪上去 ---
const vos = (doc.vo_track ?? []).map((v) => {
  const f = path.join(audioDir, `vo_${v.id}.wav`);
  return fs.existsSync(f) ? { ...v, file: f } : null;
}).filter(Boolean);

const inputs = [];
shots.forEach((s) => inputs.push('-loop', '1', '-t', String(s.hold), '-i', s.file));
vos.forEach((v) => inputs.push('-i', v.file));

const vparts = shots.map((_, i) =>
  `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
  `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${FPS}[v${i}]`).join(';');
const vchain = shots.map((_, i) => `[v${i}]`).join('');
let filter = `${vparts};${vchain}concat=n=${shots.length}:v=1:a=0[cat]`;

// --- 天數標記：打在時間跳躍的鏡頭開頭，讓觀眾知道跳了多久 ---
// 字型路徑裡的冒號會被 ffmpeg 的 filter 解析器當成選項分隔符，加引號也沒用，
// 而轉義字元穿過多層字串很容易出錯。所以複製一份到專案內，用不含冒號的相對路徑。
const FONT_SRC = flag('font', path.join(process.env.SystemRoot || 'C:/Windows', 'Fonts', 'msjhl.ttc'));
const fontRel = path.posix.join('_output', 'video', '.fonts', 'cjk.ttc');
const fontAbs = path.join(ROOT, fontRel);
if (!fs.existsSync(fontAbs)) {
  if (!fs.existsSync(FONT_SRC)) { console.error(`找不到中文字型：${FONT_SRC}`); process.exit(1); }
  fs.mkdirSync(path.dirname(fontAbs), { recursive: true });
  fs.copyFileSync(FONT_SRC, fontAbs);
  console.log(`已複製字型 → ${fontRel}`);
}
let cursor = 0;
const marks = [];
for (const s of shots) {
  if (s.day_marker) marks.push({ text: s.day_marker, at: cursor });
  cursor += s.hold;
}
if (marks.length) {
  const dwell = Number(flag('marker-dwell', 2.6));
  const draws = marks.map((m) =>
    `drawtext=fontfile=${fontRel}:text='${m.text}'` +
    `:fontsize=44:fontcolor=white@0.88:shadowcolor=black@0.55:shadowx=2:shadowy=2` +
    `:x=64:y=h-190:enable='between(t,${m.at.toFixed(2)},${(m.at + dwell).toFixed(2)})'`,
  ).join(',');
  filter += `;[cat]${draws}[outv]`;
  console.log(`天數標記 ${marks.length} 個：` + marks.map((m) => `${m.text}@${m.at}s`).join('  '));
} else {
  filter += ';[cat]null[outv]';
}

const maps = ['-map', '[outv]'];
if (vos.length) {
  const aparts = vos.map((v, k) =>
    `[${shots.length + k}:a]adelay=${Math.round(v.start * 1000)}|${Math.round(v.start * 1000)}[a${k}]`).join(';');
  const achain = vos.map((_, k) => `[a${k}]`).join('');
  filter += `;${aparts};${achain}amix=inputs=${vos.length}:normalize=0:dropout_transition=0[outa]`;
  maps.push('-map', '[outa]', '-c:a', 'aac', '-b:a', '192k');
} else {
  maps.push('-an');
}

const visual = shots.reduce((a, s) => a + s.hold, 0);
const voEnd = doc.timeline?.vo_ends_at ?? 0;
console.log(`${shots.length} 張分鏡圖｜畫面 ${visual}s｜旁白 ${vos.length} 句，結束於 ${voEnd}s`);
if (voEnd > visual) console.log(`⚠ 旁白比畫面長 ${(voEnd - visual).toFixed(1)}s——最後會有聲音沒有畫面`);

ffmpegOrDie([
  '-y', ...inputs, '-filter_complex', filter, ...maps,
  '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p',
  out,  // 不要 -shortest：旁白結束後的沉默是刻意的，會被它切掉
]);
console.log(`✓ ${path.relative(ROOT, out)}  ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);

// --- 字幕 ---
const ts = (s) => {
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor(s / 60) % 60).padStart(2, '0');
  const sec = (s % 60).toFixed(3).padStart(6, '0').replace('.', ',');
  return `${h}:${m}:${sec}`;
};
const srt = vos.map((v, i) =>
  `${i + 1}\n${ts(v.start)} --> ${ts(v.start + v.duration)}\n${v.text}\n`).join('\n');
const srtPath = out.replace(/\.[^.]+$/, '.srt');
fs.writeFileSync(srtPath, srt, 'utf8');
console.log(`✓ ${path.relative(ROOT, srtPath)}`);
