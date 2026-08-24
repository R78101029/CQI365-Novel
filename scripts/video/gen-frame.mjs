#!/usr/bin/env node
/**
 * gen-frame.mjs — 產生分鏡首幀圖（OpenRouter Image API）。
 *
 *   node scripts/video/gen-frame.mjs --prompt-file p.txt --out frame.jpg
 *   node scripts/video/gen-frame.mjs --prompt-file p.txt --ref a.jpg --ref b.jpg --model pro
 *
 * --via    gemini（預設，直打 Google，較便宜）| openrouter（備援，同一把 OPENROUTER_API_KEY）
 * --model  draft | pro（預設 pro）
 * --size   1K | 2K | 4K（預設 2K）      --aspect 9:16（預設）
 * --ref    參考圖，可重複。順序要跟 prompt 裡的 CHARACTER 1/2 對應（上限 14 張）
 *
 * 能力與價格：node scripts/video/video-models.mjs 之外，
 * 圖片端是 https://openrouter.ai/api/v1/images/models/{model}/endpoints
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
if (!KEY) { console.error('.env 缺 OPENROUTER_API_KEY'); process.exit(1); }

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const all = (n) => args.reduce((a, v, i) => (v === `--${n}` ? [...a, args[i + 1]] : a), []);

const via = flag('via', 'gemini');
const MODELS = {
  gemini: { draft: 'gemini-3.1-flash-image', pro: 'gemini-3-pro-image' },
  openrouter: { draft: 'google/gemini-3.1-flash-image', pro: 'google/gemini-3-pro-image' },
}[via];
if (!MODELS) { console.error(`--via 只能是 gemini 或 openrouter`); process.exit(1); }
const m = flag('model', 'pro');
const model = MODELS[m] ?? m;
const out = flag('out', 'frame.jpg');
const promptFile = flag('prompt-file');
const prompt = promptFile ? fs.readFileSync(promptFile, 'utf8').trim() : flag('prompt');
if (!prompt) { console.error('要 --prompt 或 --prompt-file'); process.exit(1); }

const mime = (f) => (/\.png$/i.test(f) ? 'image/png' : /\.webp$/i.test(f) ? 'image/webp' : 'image/jpeg');
const refs = all('ref');
if (refs.length > 14) { console.error('參考圖上限 14 張'); process.exit(1); }

const aspect = flag('aspect', '9:16');
const size = flag('size', '2K');

let url, headers, body;
if (via === 'gemini') {
  if (!env.GOOGLE_API_KEY) { console.error('.env 缺 GOOGLE_API_KEY'); process.exit(1); }
  url = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  headers = { 'x-goog-api-key': env.GOOGLE_API_KEY, 'Content-Type': 'application/json' };
  body = {
    model,
    input: [
      { type: 'text', text: prompt },
      ...refs.map((f) => ({ type: 'image', mime_type: mime(f), data: fs.readFileSync(f).toString('base64') })),
    ],
    response_format: { type: 'image', aspect_ratio: aspect, image_size: size },
  };
} else {
  url = 'https://openrouter.ai/api/v1/images';
  headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
  body = { model, prompt, aspect_ratio: aspect, resolution: size, n: 1 };
  if (refs.length) {
    body.input_references = refs.map((f) => ({
      type: 'image_url',
      image_url: { url: `data:${mime(f)};base64,${fs.readFileSync(f).toString('base64')}` },
    }));
  }
}

console.log(`${via} · ${model}｜${aspect} ${size}｜參考圖 ${refs.length} 張`);
const t0 = Date.now();

const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
const text = await res.text();
if (!res.ok) { console.error(`HTTP ${res.status}\n${text.slice(0, 1200)}`); process.exit(1); }

let json;
try { json = JSON.parse(text); } catch { console.error('回應不是 JSON:', text.slice(0, 400)); process.exit(1); }

// 兩家的回應結構不同：
//   OpenRouter  data[0].b64_json
//   Gemini      steps[].content[] 裡 type==='image' 的那個 { data, mime_type }
// 不要用「找最大的 base64 字串」當保險——Gemini 的 steps[0].signature（thought 簽章）
// 有 1.4MB，比圖還大，會抓錯。
let b64 = json.data?.[0]?.b64_json ?? null;
let mimeOut = json.data?.[0]?.media_type ?? 'image/jpeg';
if (!b64) {
  for (const step of json.steps ?? []) {
    for (const c of step.content ?? []) {
      if (c.type === 'image' && c.data) { b64 = c.data; mimeOut = c.mime_type || mimeOut; break; }
    }
    if (b64) break;
  }
}
if (!b64) {
  const dump = path.join(path.dirname(out), 'gen-frame-response.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(dump, JSON.stringify(json, null, 2));
  console.error('回應裡沒有 b64_json。頂層欄位：', Object.keys(json).join(', '));
  console.error(`完整回應存到 ${dump}`);
  process.exit(1);
}

const buf = Buffer.from(b64, 'base64');

// 存檔前驗 magic bytes。抓錯欄位卻存成 .jpg 是最難查的那種錯——
// 下游（影片 API）只會回一句 "Image format is invalid"。
const MAGIC = [
  [Buffer.from([0xff, 0xd8, 0xff]), 'image/jpeg', '.jpg'],
  [Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'image/png', '.png'],
  [Buffer.from('RIFF'), 'image/webp', '.webp'],
];
const hit = MAGIC.find(([sig]) => buf.subarray(0, sig.length).equals(sig));
if (!hit) {
  console.error(`取到的資料不是圖片（開頭 ${buf.subarray(0, 4).toString('hex')}，宣稱 ${mimeOut}）。沒有存檔。`);
  process.exit(1);
}
const want = hit[2];
const final = path.extname(out).toLowerCase() === want ? out : out.replace(/\.[^.]*$/, want);
fs.mkdirSync(path.dirname(final), { recursive: true });
fs.writeFileSync(final, buf);
const secs = ((Date.now() - t0) / 1000).toFixed(0);
console.log(`✓ ${final}  ${(buf.length / 1024).toFixed(0)} KB  ${hit[1]}  ${secs}s`);
// OpenRouter 會回 usage.cost；Google 只回 token 數，價格要自己查表。
// 表格取自 ai.google.dev/gemini-api/docs/pricing（2026-08-22 查證），單位是「每張圖」。
const LIST = {
  'gemini-3-pro-image': { '1K': 0.134, '2K': 0.134, '4K': 0.24 },
  'gemini-3.1-flash-image': { '1K': 0.034, '2K': 0.050, '4K': 0.076 },
  'gemini-3.1-flash-lite-image': { '1K': 0.0336 },
};
const u = json.usage ?? {};
if (u.cost != null) {
  console.log(`   花費 $${u.cost.toFixed(4)}（實收）  tokens ${u.total_tokens ?? '?'}`);
} else {
  const est = LIST[model]?.[size];
  console.log(`   ${est != null ? `牌價 $${est.toFixed(4)}／張（Google 不回 cost 欄位）` : '（無價格資料）'}  usage ${JSON.stringify(u)}`);
}
