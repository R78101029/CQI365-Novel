#!/usr/bin/env node
/**
 * gen-clip.mjs — 首幀圖 → 影片（OpenRouter /api/v1/videos，非同步）。
 *
 *   node scripts/video/gen-clip.mjs --image frames/s01.jpg --prompt-file motion.txt --out clips/s01.mp4
 *   node scripts/video/gen-clip.mjs ... --model bytedance/seedance-2.5 --size 720x1280 --duration 10
 *   node scripts/video/gen-clip.mjs ... --last-frame frames/s02.jpg      # 首尾幀
 *   node scripts/video/gen-clip.mjs ... --tail-frame                     # 要求回傳尾幀（僅 2.0-mini）
 *
 * 預設 bytedance/seedance-2.0-mini（草片）。定稿改 --model bytedance/seedance-2.5。
 * 送出前先跑 video-models.mjs 確認 duration / size 在該模型的支援集合內，送錯值會 400。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/))
    .filter(Boolean).map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, '')]),
);
const KEY = env.OPENROUTER_API_KEY || env.SEEDANCE2;
const AUTH = { Authorization: `Bearer ${KEY}` };

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const has = (n) => args.includes(`--${n}`);

const image = flag('image');
const out = flag('out', 'clip.mp4');
const promptFile = flag('prompt-file');
const prompt = promptFile ? fs.readFileSync(promptFile, 'utf8').trim() : flag('prompt');
if (!image || !prompt) { console.error('要 --image 與 --prompt/--prompt-file'); process.exit(1); }

const mime = (f) => (/\.png$/i.test(f) ? 'image/png' : /\.webp$/i.test(f) ? 'image/webp' : 'image/jpeg');
const dataUri = (f) => `data:${mime(f)};base64,${fs.readFileSync(f).toString('base64')}`;

const model = flag('model', 'bytedance/seedance-2.0-mini');
const body = {
  model,
  prompt,
  duration: Number(flag('duration', 10)),
  size: flag('size', '480x854'),
  generate_audio: false,          // 旁白分離，音訊也加價
  frame_images: [{ type: 'image_url', image_url: { url: dataUri(image) }, frame_type: 'first_frame' }],
};
if (flag('last-frame')) {
  body.frame_images.push({ type: 'image_url', image_url: { url: dataUri(flag('last-frame')) }, frame_type: 'last_frame' });
}
if (flag('seed')) body.seed = Number(flag('seed'));
// 廠商專屬參數：--pass key=value（可重複）。允許的 key 見該模型的
// allowed_passthrough_parameters，語意要查上游廠商文件。
const passthrough = {};
if (has('tail-frame')) passthrough.return_last_frame = true;
for (const [i, v] of args.entries()) {
  if (v !== '--pass') continue;
  const [k, ...rest] = String(args[i + 1] ?? '').split('=');
  let val = rest.join('=');
  if (val === 'true') val = true; else if (val === 'false') val = false;
  else if (val !== '' && !Number.isNaN(Number(val))) val = Number(val);
  if (k) passthrough[k] = val;
}
if (Object.keys(passthrough).length) {
  const slug = model.split('/')[0];
  body.provider = { options: { [slug]: { parameters: passthrough } } };
  console.log('   passthrough:', JSON.stringify(passthrough));
}

console.log(`${model}｜${body.size} ${body.duration}s｜首幀 ${path.basename(image)}`);
const t0 = Date.now();

const sub = await fetch('https://openrouter.ai/api/v1/videos', {
  method: 'POST', headers: { ...AUTH, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const subText = await sub.text();
if (!sub.ok) { console.error(`submit HTTP ${sub.status}\n${subText.slice(0, 1200)}`); process.exit(1); }
const job = JSON.parse(subText);
console.log(`已送出 ${job.id}  狀態 ${job.status}`);

const pollUrl = job.polling_url || `https://openrouter.ai/api/v1/videos/${job.id}`;
let resp = job;
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 15000));
  const p = await fetch(pollUrl, { headers: AUTH });
  resp = await p.json();
  const el = ((Date.now() - t0) / 1000).toFixed(0);
  process.stdout.write(`\r   ${el}s  ${resp.status}      `);
  if (resp.status === 'completed') break;
  if (['failed', 'cancelled', 'expired'].includes(resp.status)) {
    console.error(`\n生成 ${resp.status}：${JSON.stringify(resp.error ?? 'unknown')}`);
    process.exit(1);
  }
}
console.log('');
if (resp.status !== 'completed') { console.error('等太久，job 還在跑：', job.id); process.exit(1); }

fs.mkdirSync(path.dirname(out), { recursive: true });
const urls = resp.unsigned_urls?.length ? resp.unsigned_urls
  : [`https://openrouter.ai/api/v1/videos/${job.id}/content?index=0`];
for (const [i, url] of urls.entries()) {
  const r = await fetch(url, { headers: AUTH, redirect: 'follow' });
  if (!r.ok) { console.error(`下載失敗 HTTP ${r.status} ${url}`); process.exit(1); }
  const file = i === 0 ? out : out.replace(/(\.[^.]+)$/, `_$${i}$1`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  console.log(`✓ ${file}  ${(fs.statSync(file).size / 1024 / 1024).toFixed(2)} MB`);
}
const secs = ((Date.now() - t0) / 1000).toFixed(0);
console.log(`   總耗時 ${secs}s`);
if (resp.usage) console.log(`   花費 $${(resp.usage.cost ?? 0).toFixed(4)}  ${JSON.stringify(resp.usage)}`);
fs.writeFileSync(out.replace(/\.[^.]+$/, '.job.json'), JSON.stringify(resp, null, 2));
