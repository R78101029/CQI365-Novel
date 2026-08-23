#!/usr/bin/env node
/**
 * generate-illustrations.mjs
 *
 * 依 prompt 產生章節插圖（xAI Grok Imagine）。
 *
 * Prompt 有兩個來源，會自動判斷：
 *   A) projects/{slug}/_meta/image_prompts.md   （溺墨、新專案用這個）
 *   B) 章節 frontmatter 的 image_prompt + cover （2040Iris 這種舊專案）
 * 用 --source md|frontmatter 可以強制指定。
 *
 * 用法：
 *   node scripts/generate-illustrations.mjs <slug> --dry
 *   node scripts/generate-illustrations.mjs <slug> --only 2.06,2.13,2.14 --force
 *   node scripts/generate-illustrations.mjs <slug> --ch 1
 *   node scripts/generate-illustrations.mjs <slug> --ref --wire
 *
 * .env 需要 XAI_API_KEY 或 GROK_API_KEY（console.x.ai 申請，並購買額度）。
 *
 * 模型（2026-08 由 docs.x.ai 公開清單取得）：
 *   grok-imagine-image          最便宜，1K/2K 同價，支援 batch
 *   grok-imagine-image-2.0      quality low/medium（預設）
 *   grok-imagine-image-quality  最貴，別名 grok-imagine-image-pro
 * 三個都吃 TEXT+IMAGE 輸入，所以 --ref 可以丟參考圖鎖角色一致性。
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(path.join(ROOT, 'site', 'package.json'));
const sharp = require('sharp');
const matter = require('gray-matter');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1].toUpperCase()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const val = (n, d) => {
  const i = args.indexOf('--' + n);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const NAMED = ['ch', 'model', 'only', 'source'];
const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && NAMED.includes(args[i - 1].replace(/^--/, ''))));

if (!slug) {
  console.error('用法: node scripts/generate-illustrations.mjs <slug> [--dry] [--only 2.06,2.13] [--ch N] [--ref] [--force] [--wire]');
  process.exit(1);
}

const MODEL = val('model', 'grok-imagine-image-2.0');
const ONLY = (val('only', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const CH = val('ch', null);
const DRY = flag('dry');
const chDir = path.join(ROOT, 'projects', slug, 'chapters');
const outDir = path.join(ROOT, 'projects', slug, '_publish', 'assets', 'chapters');

// ---------- 來源 A：_meta/image_prompts.md ----------
function fromMarkdown() {
  const f = path.join(ROOT, 'projects', slug, '_meta', 'image_prompts.md');
  if (!fs.existsSync(f)) return [];
  const md = fs.readFileSync(f, 'utf8');
  const marks = [];
  const re = /^###\s*(\d+)[｜|]\s*(.+)$/gm;
  let m;
  while ((m = re.exec(md))) marks.push({ num: m[1], title: m[2].trim(), at: m.index });
  const out = [];
  marks.forEach((mk, i) => {
    const body = md.slice(mk.at, i + 1 < marks.length ? marks[i + 1].at : md.length);
    const p = body.match(/\*\*Prompt\*\*:\s*([\s\S]*?)\n-\s/);
    const fn = body.match(/\*\*預定檔名\*\*:\s*`([^`]+)`/);
    if (p && fn) out.push({ key: mk.num, num: mk.num, title: mk.title, prompt: p[1].trim(), file: fn[1].trim() });
  });
  return out;
}

// ---------- 來源 B：章節 frontmatter ----------
function fromFrontmatter() {
  if (!fs.existsSync(chDir)) return [];
  const out = [];
  fs.readdirSync(chDir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .forEach((f) => {
      const g = matter(fs.readFileSync(path.join(chDir, f), 'utf8'));
      const prompt = g.data.image_prompt;
      const cover = g.data.cover;
      if (!prompt || !cover) return;
      out.push({
        key: String(cover).replace(/-cover\.(jpe?g|png)$/i, ''),
        num: g.data.order != null ? g.data.order : '',
        title: g.data.title || f,
        prompt: String(prompt).trim(),
        file: cover,
        chapterFile: f,
      });
    });
  return out;
}

const source = val('source', null);
let items = [];
let used = '';
if (source === 'md') {
  items = fromMarkdown();
  used = '_meta/image_prompts.md';
} else if (source === 'frontmatter') {
  items = fromFrontmatter();
  used = '章節 frontmatter';
} else {
  items = fromMarkdown();
  used = '_meta/image_prompts.md';
  if (!items.length) {
    items = fromFrontmatter();
    used = '章節 frontmatter';
  }
}

if (!items.length) {
  console.error(`找不到任何 prompt。檢查 projects/${slug}/_meta/image_prompts.md，或章節 frontmatter 的 image_prompt + cover。`);
  process.exit(1);
}

let targets = items;
if (ONLY.length) targets = items.filter((x) => ONLY.includes(x.key) || ONLY.includes(x.file));
else if (CH) targets = items.filter((x) => String(x.num) === String(CH) || x.key === CH);

if (!targets.length) {
  console.error('選取條件沒有命中任何項目。可用的 key：\n  ' + items.map((i) => i.key).join(', '));
  process.exit(1);
}

console.log(`《${slug}》 prompt 來源：${used}`);
console.log(`${targets.length} / ${items.length} 張  模型 ${MODEL}${DRY ? '  [DRY RUN]' : ''}`);
console.log(`輸出到 ${path.relative(ROOT, outDir)}\n`);

if (DRY) {
  targets.forEach((t) => {
    console.log(`  ${String(t.key).padEnd(6)} ${t.title}  ->  ${t.file}`);
    console.log(`         ${t.prompt.slice(0, 88)}...`);
  });
  process.exit(0);
}

const env = loadEnv();
const KEY = (env.XAI_API_KEY || env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GROK_API_KEY || '').trim();
if (!KEY) {
  console.error('.env 裡找不到 XAI_API_KEY 或 GROK_API_KEY。');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

async function generate(item, refDataUri) {
  const body = { model: MODEL, prompt: item.prompt, n: 1, response_format: 'b64_json' };
  if (refDataUri) body.images = [refDataUri];
  const r = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) {
    let msg = text.slice(0, 300);
    try {
      const j = JSON.parse(text);
      msg = j.error || j.message || msg;
    } catch (_) { /* 保持原文 */ }
    const e = new Error(`HTTP ${r.status} — ${msg}`);
    e.status = r.status;
    throw e;
  }
  const j = JSON.parse(text);
  const d = j.data && j.data[0];
  if (!d) throw new Error('回應沒有 data');
  if (d.b64_json) return Buffer.from(d.b64_json, 'base64');
  if (d.url) return Buffer.from(await (await fetch(d.url)).arrayBuffer());
  throw new Error('回應既沒有 b64_json 也沒有 url');
}

let ref = null;
let ok = 0;
const done = [];

for (const item of targets) {
  const dest = path.join(outDir, item.file);
  if (fs.existsSync(dest) && !flag('force')) {
    console.log(`  跳過（已存在，要覆蓋加 --force）${item.file}`);
    continue;
  }
  process.stdout.write(`  ${String(item.key).padEnd(6)} ${item.title} ... `);
  try {
    const raw = await generate(item, flag('ref') ? ref : null);
    const jpg = await sharp(raw).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    fs.writeFileSync(dest, jpg);
    if (flag('ref') && !ref) ref = 'data:image/jpeg;base64,' + jpg.toString('base64');
    console.log(`${(jpg.length / 1024).toFixed(0)} KB`);
    ok++;
    done.push(item);
  } catch (e) {
    console.log('失敗: ' + e.message);
    if (e.status === 403) {
      console.error('\n  403 通常是團隊還沒有額度。到 https://console.x.ai 購買後再跑。');
      break;
    }
  }
}

// --wire：把 cover 寫回章節 frontmatter（只有 md 來源需要，frontmatter 來源本來就有）
if (flag('wire') && done.length && used.indexOf('_meta') === 0) {
  const files = fs.readdirSync(chDir).filter((f) => f.endsWith('.md')).sort();
  let n = 0;
  done.forEach((item) => {
    const ch = files[Number(item.num) - 1];
    if (!ch) return;
    const p = path.join(chDir, ch);
    let s = fs.readFileSync(p, 'utf8');
    if (/^cover:/m.test(s)) return;
    const eol = s.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
    s = s.replace(/^(---\r?\n)/, `$1cover: "${item.file}"${eol}`);
    fs.writeFileSync(p, s);
    n++;
  });
  if (n) console.log(`\n寫入 ${n} 個章節的 frontmatter cover:`);
}

// 重複檢查——這次的問題就是重複圖，順手擋掉下一次
if (ok) {
  const hashes = {};
  fs.readdirSync(outDir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .forEach((f) => {
      const h = crypto.createHash('md5').update(fs.readFileSync(path.join(outDir, f))).digest('hex');
      if (!hashes[h]) hashes[h] = [];
      hashes[h].push(f);
    });
  const dups = Object.keys(hashes).map((k) => hashes[k]).filter((v) => v.length > 1);
  if (dups.length) {
    console.log('\n注意：這個目錄裡仍有內容完全相同的圖');
    dups.forEach((v) => console.log('  ' + v.join(' = ')));
  } else {
    console.log('\n重複檢查：沒有內容相同的圖。');
  }
}

console.log(`\n完成 ${ok} 張。記得跑 npm run build 同步到網站。`);
