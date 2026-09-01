#!/usr/bin/env node
/**
 * build-edit.mjs — 依剪輯表把現有片段切碎重組成成品（預告片用）。
 *
 *   node scripts/video/build-edit.mjs --edit projects/HalfFinished/_dev/media/trailer/02_edit.json
 *
 * 與 assemble.mjs 的差別：assemble 是「一鏡一段、照順序接」，
 * 這支是「同一支片段可以切成多段、重複使用、任意排序」——預告片的做法。
 *
 * 讀 02_edit.json 的五軌：
 *   cuts      從 source_episode 的 clips/ 取 in–out
 *   cards     打在畫面上的字（drawtext，時間區間）
 *   end_card  片名卡（黑底多行）
 *   vo_track  旁白，起點是固定的秒數不是依序排
 *   bgm       配樂，淡入淡出
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
if (!FFMPEG) { console.error('找不到 ffmpeg'); process.exit(1); }

function ffmpegOrDie(ffArgs) {
  try {
    execFileSync(FFMPEG, ffArgs, { stdio: ['ignore', 'ignore', 'pipe'], cwd: ROOT });
  } catch (e) {
    const err = (e.stderr?.toString() ?? '').split('\n').filter(Boolean);
    console.error('ffmpeg 失敗：');
    console.error(err.slice(-16).join('\n'));
    process.exit(1);
  }
}

const editPath = flag('edit');
if (!editPath) { console.error('要 --edit <02_edit.json>'); process.exit(1); }
const doc = JSON.parse(fs.readFileSync(editPath, 'utf8'));

const [W, H] = (doc.size ?? '720x1280').split('x').map(Number);
const FPS = Number(doc.fps ?? 24);
const epDir = path.join(ROOT, '_output', 'video', doc.novel, doc.episode);
const srcDir = path.join(ROOT, '_output', 'video', doc.novel, doc.source_episode, 'clips');
const out = flag('out', path.join(epDir, 'out', `${doc.episode}.mp4`));

// 字型：路徑裡的冒號會被 ffmpeg 的 filter 解析器當成選項分隔符，所以用不含冒號的相對路徑
const FONT_SRC = flag('font', path.join(process.env.SystemRoot || 'C:/Windows', 'Fonts', 'msjhl.ttc'));
const fontRel = path.posix.join('_output', 'video', '.fonts', 'cjk.ttc');
const fontAbs = path.join(ROOT, fontRel);
if (!fs.existsSync(fontAbs)) {
  fs.mkdirSync(path.dirname(fontAbs), { recursive: true });
  fs.copyFileSync(FONT_SRC, fontAbs);
}

// --- 檢查剪輯表：來源存在、in/out 合法、時間軸連續 ---
let cursor = 0;
for (const c of doc.cuts) {
  const f = path.join(srcDir, `${c.src}.mp4`);
  if (!fs.existsSync(f)) { console.error(`缺來源片段：${c.src}.mp4`); process.exit(1); }
  if (c.out <= c.in) { console.error(`${c.src} 的 out 不大於 in`); process.exit(1); }
  if (Math.abs(c.at - cursor) > 0.01) {
    console.error(`剪輯表不連續：${c.src} 標 ${c.at}s，但前面累積到 ${cursor.toFixed(2)}s`);
    process.exit(1);
  }
  cursor += c.out - c.in;
  c.file = f;
}
const cutsEnd = cursor;
const endDur = doc.end_card?.duration ?? 0;
const total = cutsEnd + endDur;

// --- 輸入 ---
const inputs = [];
for (const c of doc.cuts) inputs.push('-ss', String(c.in), '-t', String(c.out - c.in), '-i', c.file);
const endIdx = doc.cuts.length;
if (endDur) inputs.push('-f', 'lavfi', '-t', String(endDur), '-i', `color=c=black:s=${W}x${H}:r=${FPS}`);

const vos = (doc.vo_track ?? []).map((v) => {
  const f = path.join(epDir, 'audio', `vo_${v.id}.wav`);
  return fs.existsSync(f) ? { ...v, file: f } : null;
}).filter(Boolean);
const voBase = endIdx + (endDur ? 1 : 0);
vos.forEach((v) => inputs.push('-i', v.file));

const bgmFile = path.join(epDir, 'audio', 'bgm.mp3');
const bgm = !has('no-bgm') && fs.existsSync(bgmFile) ? bgmFile : null;
if (bgm) inputs.push('-i', bgmFile);
const bgmIdx = voBase + vos.length;

// --- 畫面：每段縮放對齊後串接 ---
const parts = doc.cuts.map((_, i) =>
  `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
  `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${FPS}[v${i}]`);

// 片名卡：黑底多行，整體垂直置中
if (endDur) {
  const lines = doc.end_card.lines ?? [];
  const blockH = lines.reduce((a, l) => a + l.size + (l.gap ?? 0), 0);
  let y = -blockH / 2;
  const draws = lines.map((l) => {
    const expr = `(h-text_h)/2+${Math.round(y)}`;
    y += l.size + (l.gap ?? 0);
    return `drawtext=fontfile=${fontRel}:text='${l.text}':fontsize=${l.size}` +
      `:fontcolor=white:x=(w-text_w)/2:y=${expr}`;
  }).join(',');
  parts.push(`[${endIdx}:v]${draws},fps=${FPS},setsar=1[vend]`);
}

const chain = doc.cuts.map((_, i) => `[v${i}]`).join('') + (endDur ? '[vend]' : '');
let filter = parts.join(';') + `;${chain}concat=n=${doc.cuts.length + (endDur ? 1 : 0)}:v=1:a=0[cat]`;

// --- 字卡 ---
const cards = doc.cards ?? [];
if (cards.length) {
  const draws = cards.map((c) => {
    const pos = c.pos === 'center'
      ? `x=(w-text_w)/2:y=(h-text_h)/2`
      : `x=64:y=h-190`;
    return `drawtext=fontfile=${fontRel}:text='${c.text}':fontsize=${c.size ?? 40}` +
      `:fontcolor=white@0.92:shadowcolor=black@0.6:shadowx=2:shadowy=2:${pos}` +
      `:enable='between(t,${c.from},${c.to})'`;
  }).join(',');
  filter += `;[cat]${draws}[outv]`;
} else {
  filter += ';[cat]null[outv]';
}

// --- 音軌：旁白定點 + 配樂淡入淡出，統一 48k 立體聲再混 ---
const maps = ['-map', '[outv]'];
const alabels = [];
if (vos.length) {
  filter += ';' + vos.map((v, k) =>
    `[${voBase + k}:a]aresample=48000,aformat=channel_layouts=stereo,` +
    `adelay=${Math.round(v.start * 1000)}|${Math.round(v.start * 1000)}[a${k}]`).join(';');
  vos.forEach((_, k) => alabels.push(`[a${k}]`));
}
if (bgm) {
  const db = doc.bgm_db ?? -18;
  const fadeOut = Math.max(0, total - 4);
  filter += `;[${bgmIdx}:a]aresample=48000,aformat=channel_layouts=stereo,` +
    `volume=${db}dB,atrim=0:${total},asetpts=N/SR/TB,` +
    `afade=t=in:st=0:d=2,afade=t=out:st=${fadeOut}:d=4[bg]`;
  alabels.push('[bg]');
}
if (alabels.length) {
  filter += `;${alabels.join('')}amix=inputs=${alabels.length}:normalize=0:dropout_transition=0[outa]`;
  maps.push('-map', '[outa]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2');
} else {
  maps.push('-an');
}

console.log(`${doc.title ?? doc.episode}`);
console.log(`${doc.cuts.length} 切（${cutsEnd}s）+ 片名卡 ${endDur}s = ${total}s`);
console.log(`字卡 ${cards.length}｜旁白 ${vos.length} 句，最後一句收在 ${vos.length ? (vos.at(-1).start + vos.at(-1).duration).toFixed(1) : 0}s｜配樂 ${bgm ? (doc.bgm_db ?? -18) + 'dB' : '無'}`);
const reuse = Object.entries(doc.cuts.reduce((a, c) => { a[c.src] = (a[c.src] || 0) + 1; return a; }, {}))
  .filter(([, n]) => n > 1).map(([k, n]) => `${k}×${n}`);
if (reuse.length) console.log(`重複使用：${reuse.join(' ')}`);

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
ffmpegOrDie([
  '-y', ...inputs, '-filter_complex', filter, ...maps,
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
  out,
]);
console.log(`✓ ${path.relative(ROOT, out)}  ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
