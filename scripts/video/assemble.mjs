#!/usr/bin/env node
/**
 * assemble.mjs — 把分鏡片段接成一支影片。
 *
 *   node scripts/video/assemble.mjs --clips path/to/cuts --out ep.mp4
 *   node scripts/video/assemble.mjs --clips dir --out ep.mp4 --size 720x1280 --fps 24
 *   node scripts/video/assemble.mjs --clips dir --out ep.mp4 --keep-audio
 *
 * 預設剝掉音軌——旁白與配樂另外混（既有規範）。Grok 出的片一定帶音軌，這裡會清掉。
 * 各家輸出尺寸不保證一致（Kling 要 720x1280 會給 716x1284），所以一律重新縮放對齊，
 * 不用 stream copy。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const has = (n) => args.includes(`--${n}`);

function findFfmpeg() {
  for (const c of ['ffmpeg', 'ffmpeg.exe']) {
    try { execFileSync(c, ['-version'], { stdio: 'ignore' }); return c; } catch {}
  }
  const winget = 'C:/Users/' + (process.env.USERNAME || '') + '/AppData/Local/Microsoft/WinGet/Packages';
  if (fs.existsSync(winget)) {
    for (const d of fs.readdirSync(winget)) {
      if (!/ffmpeg/i.test(d)) continue;
      const stack = [path.join(winget, d)];
      while (stack.length) {
        const cur = stack.pop();
        for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
          const full = path.join(cur, e.name);
          if (e.isDirectory()) stack.push(full);
          else if (/^ffmpeg\.exe$/i.test(e.name)) return full;
        }
      }
    }
  }
  return null;
}

const FFMPEG = findFfmpeg();
if (!FFMPEG) { console.error('找不到 ffmpeg。winget install Gyan.FFmpeg'); process.exit(1); }

const dir = flag('clips');
const out = flag('out', 'out.mp4');
const [W, H] = flag('size', '720x1280').split('x').map(Number);
const fps = Number(flag('fps', 24));
if (!dir) { console.error('要 --clips <目錄>'); process.exit(1); }

const clips = fs.readdirSync(dir).filter((f) => f.endsWith('.mp4')).sort()
  .map((f) => path.join(dir, f));
if (!clips.length) { console.error(`${dir} 裡沒有 .mp4`); process.exit(1); }

console.log(`ffmpeg: ${path.basename(FFMPEG)}`);
console.log(`${clips.length} 段 → ${W}x${H} @${fps}fps${has('keep-audio') ? '' : '（去音軌）'}`);
clips.forEach((c, i) => console.log(`  ${i + 1}. ${path.basename(c)}`));

// scale + pad 到統一畫布，setsar 避免像素比不一致，再 concat
const parts = clips.map((_, i) =>
  `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
  `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}[v${i}]`).join(';');
const chain = clips.map((_, i) => `[v${i}]`).join('');
const filter = `${parts};${chain}concat=n=${clips.length}:v=1:a=0[outv]`;

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const ffArgs = [
  '-y', ...clips.flatMap((c) => ['-i', c]),
  '-filter_complex', filter, '-map', '[outv]',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
  '-an', out,
];
execFileSync(FFMPEG, ffArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
const size = fs.statSync(out).size;
console.log(`✓ ${out}  ${(size / 1024 / 1024).toFixed(2)} MB`);
