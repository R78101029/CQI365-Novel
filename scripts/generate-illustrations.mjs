#!/usr/bin/env node
/**
 * generate-illustrations.mjs
 *
 * 依 _meta/image_prompts.md 產生章節插圖（xAI Grok Imagine）。
 *
 * 取代舊的 generate-images.js——那支是 hardcode 給 2040Iris 的，
 * 而且請文字模型產 SVG 程式碼，不是真的算圖。
 *
 * 用法：
 *   node scripts/generate-illustrations.mjs <slug> --dry     # 只列出要產什麼
 *   node scripts/generate-illustrations.mjs <slug>           # 全部產
 *   node scripts/generate-illustrations.mjs <slug> --ch 1    # 只產第 1 章
 *   node scripts/generate-illustrations.mjs <slug> --ref     # 用第一張當參考圖鎖角色
 *   node scripts/generate-illustrations.mjs <slug> --force   # 覆蓋已存在的檔案
 *   node scripts/generate-illustrations.mjs <slug> --wire    # 產完寫進章節 frontmatter
 *
 * 需要 .env 裡有 XAI_API_KEY（到 console.x.ai 申請）。
 *
 * 模型（2026-08 由 docs.x.ai 的公開清單取得）：
 *   grok-imagine-image          最便宜，1K/2K 同價
 *   grok-imagine-image-2.0      支援 quality low/medium（預設）
 *   grok-imagine-image-quality  最貴，別名 grok-imagine-image-pro
 * 三個都吃 TEXT + IMAGE 輸入，所以可以丟參考圖鎖角色一致性。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(path.join(ROOT, 'site', 'package.json'));
const sharp = require('sharp');

// --- 讀 .env（不用 dotenv，避免多一個相依）---
function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const val = (n, d) => {
  const i = args.indexOf('--' + n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const slug = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--ch' && args[args.indexOf(a) - 1] !== '--model');

if (!slug) {
  console.error('用法: node scripts/generate-illustrations.mjs <slug> [--dry] [--ch N] [--ref] [--force] [--wire]');
  process.exit(1);
}

const MODEL = val('model', 'grok-imagine-image-2.0');
const ONLY = val('ch', null);
const DRY = flag('dry');

// --- 解析 image_prompts.md ---
const promptFile = path.join(ROOT, 'projects', slug, '_meta', 'image_prompts.md');
if (!fs.existsSync(promptFile)) {
  console.error(`找不到 ${promptFile}`);
  process.exit(1);
}
const md = fs.readFileSync(promptFile, 'utf8');

const items = [];
const secRe = /^###\s*(\d+)[｜|]\s*(.+)$/gm;
let m;
const marks = [];
while ((m = secRe.exec(md))) marks.push({ num: m[1], title: m[2].trim(), at: m.index });
marks.forEach((mk, i) => {
  const body = md.slice(mk.at, i + 1 < marks.length ? marks[i + 1].at : md.length);
  const p = body.match(/\*\*Prompt\*\*:\s*([\s\S]*?)\n-\s/);
  const f = body.match(/\*\*預定檔名\*\*:\s*`([^`]+)`/);
  if (p && f) items.push({ num: mk.num, title: mk.title, prompt: p[1].trim(), file: f[1].trim() });
});

if (!items.length) {
  console.error('image_prompts.md 裡沒有解析到任何 Prompt / 預定檔名 配對');
  process.exit(1);
}

const targets = ONLY ? items.filter((x) => Number(x.num) === Number(ONLY)) : items;
const outDir = path.join(ROOT, 'projects', slug, '_publish', 'assets', 'chapters');

console.log(`《${slug}》 ${targets.length} 張  模型 ${MODEL}${DRY ? '  [DRY RUN]' : ''}`);
console.log(`輸出到 ${path.relative(ROOT, outDir)}\n`);

if (DRY) {
  targets.forEach((t) => {
    console.log(`  ${t.num}. ${t.title} -> ${t.file}`);
    console.log(`     ${t.prompt.slice(0, 90)}...`);
  });
  process.exit(0);
}

const KEY = (loadEnv().XAI_API_KEY || process.env.XAI_API_KEY || '').trim();
if (!KEY) {
  console.error('沒有 XAI_API_KEY。到 console.x.ai 申請後加進 .env：\n  XAI_API_KEY=xai-...');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

async function generate(item, refDataUri) {
  const body = { model: MODEL, prompt: item.prompt, n: 1, response_format: 'b64_json' };
  if (refDataUri) body.images = [refDataUri];

  const r = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const d = j.data?.[0];
  if (!d) throw new Error('回應沒有 data');
  if (d.b64_json) return Buffer.from(d.b64_json, 'base64');
  if (d.url) return Buffer.from(await (await fetch(d.url)).arrayBuffer());
  throw new Error('回應既沒有 b64_json 也沒有 url');
}

let ref = null;
let ok = 0;
for (const item of targets) {
  const dest = path.join(outDir, item.file);
  if (fs.existsSync(dest) && !flag('force')) {
    console.log(`  跳過（已存在）${item.file}`);
    continue;
  }
  process.stdout.write(`  ${item.num}. ${item.title} ... `);
  try {
    const raw = await generate(item, flag('ref') ? ref : null);
    // 一律存成 JPG（見 AGENTS.md 圖片規範）
    const jpg = await sharp(raw).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    fs.writeFileSync(dest, jpg);
    if (flag('ref') && !ref) ref = `data:image/jpeg;base64,${jpg.toString('base64')}`;
    console.log(`${(jpg.length / 1024).toFixed(0)} KB -> ${item.file}`);
    ok++;
  } catch (e) {
    console.log(`失敗: ${e.message}`);
  }
}

// --- 選配：寫進章節 frontmatter ---
if (flag('wire') && ok) {
  const chDir = path.join(ROOT, 'projects', slug, 'chapters');
  const files = fs.readdirSync(chDir).filter((f) => f.endsWith('.md')).sort();
  let n = 0;
  targets.forEach((item) => {
    const ch = files[Number(item.num) - 1];
    if (!ch) return;
    const p = path.join(chDir, ch);
    let s = fs.readFileSync(p, 'utf8');
    if (/^cover:/m.test(s)) return;
    s = s.replace(/^(---\n[\s\S]*?)(\n---)/, `$1\ncover: "${item.file}"$2`);
    fs.writeFileSync(p, s);
    n++;
  });
  console.log(`\n寫入 ${n} 個章節的 frontmatter cover:`);
}

console.log(`\n完成 ${ok} 張。記得跑 npm run build 同步到網站。`);
