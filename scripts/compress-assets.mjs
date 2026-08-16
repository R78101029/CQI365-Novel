#!/usr/bin/env node
/**
 * compress-assets.mjs
 *
 * 把 _publish/assets 底下的 PNG 轉成 JPG，並把所有引用一起改掉。
 * 封面與章節插圖用 PNG 存沒有意義（都是照片式插畫），轉 JPG 通常省 80–90%。
 *
 * 用法：
 *   node scripts/compress-assets.mjs <slug>              # 單本
 *   node scripts/compress-assets.mjs --all               # 全部
 *   node scripts/compress-assets.mjs <slug> --dry        # 只看會改什麼，不動檔案
 *   node scripts/compress-assets.mjs <slug> --quality=90 # 預設 85
 *   node scripts/compress-assets.mjs <slug> --keep       # 保留原 PNG
 *
 * 會一起更新的引用：
 *   - 章節內文 Markdown  ![alt](../_publish/assets/…png)
 *   - 章節內文 HTML      <img src="../_publish/assets/…png">
 *   - 章節 frontmatter   cover: "xx.png"
 *   - novels.config.json coverUrl
 *
 * 不碰：_archive/、raw_pngs/、cover-bg.*（cover-bg 是 build-cover.mjs 的底圖來源）
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'novels.config.json');

// sharp 裝在 site/ 底下（Astro 的相依）
const require = createRequire(path.join(ROOT, 'site', 'package.json'));
const sharp = require('sharp');

const args = process.argv.slice(2);
const doAll = args.includes('--all');
const dry = args.includes('--dry');
const keep = args.includes('--keep');
const quality = Number((args.find((a) => a.startsWith('--quality=')) || '').split('=')[1]) || 85;
const skip = ((args.find((a) => a.startsWith('--skip=')) || '').split('=')[1] || '')
  .split(',')
  .filter(Boolean);
const slugArg = args.find((a) => !a.startsWith('--'));

const SKIP_DIRS = ['_archive', 'raw_pngs'];
const SKIP_NAMES = [/^cover-bg\./i];

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.includes(e.name)) continue;
      walk(path.join(dir, e.name), out);
    } else if (/\.png$/i.test(e.name) && !SKIP_NAMES.some((r) => r.test(e.name))) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const fmt = (b) => `${(b / 1048576).toFixed(2)} MB`;

async function compressNovel(novel) {
  const assetsDir = path.join(ROOT, 'projects', novel.slug, '_publish', 'assets');
  const pngs = walk(assetsDir);

  if (!pngs.length) {
    console.log(`\n[${novel.slug}] ${novel.title} — 沒有可轉換的 PNG`);
    return { before: 0, after: 0, n: 0 };
  }

  console.log(`\n[${novel.slug}] ${novel.title} — ${pngs.length} 個 PNG`);

  let before = 0;
  let after = 0;
  let converted = 0;
  const renames = new Map(); // basename.png -> basename.jpg

  for (const png of pngs) {
    const jpg = png.replace(/\.png$/i, '.jpg');
    const srcSize = fs.statSync(png).size;

    let buf;
    try {
      buf = await sharp(png).flatten({ background: '#000000' }).jpeg({ quality, mozjpeg: true }).toBuffer();
    } catch (err) {
      console.log(`  ! ${path.basename(png)} — 轉換失敗，跳過 (${err.message})`);
      continue;
    }

    if (buf.length >= srcSize) {
      console.log(`  = ${path.basename(png)} — JPG 沒有比較小，保留 PNG`);
      continue;
    }

    before += srcSize;
    after += buf.length;
    converted++;
    renames.set(path.basename(png), path.basename(jpg));

    const pct = ((1 - buf.length / srcSize) * 100).toFixed(0);
    console.log(`  ✓ ${path.basename(png)}  ${fmt(srcSize)} → ${fmt(buf.length)}  (−${pct}%)`);

    if (dry) continue;

    fs.writeFileSync(jpg, buf);
    if (!keep) fs.unlinkSync(png);

    // 同步刪掉 site/public 底下對應的舊 PNG（build 時會重新複製 JPG 過去）
    const rel = path.relative(assetsDir, png);
    const pub = path.join(ROOT, 'site', 'public', 'assets', novel.slug, rel);
    if (!keep && fs.existsSync(pub)) fs.unlinkSync(pub);
  }

  if (!converted) return { before, after, n: 0 };

  // ---- 改寫章節引用 ----
  const chaptersDir = path.join(ROOT, 'projects', novel.slug, 'chapters');
  let touched = 0;
  if (fs.existsSync(chaptersDir)) {
    for (const file of fs.readdirSync(chaptersDir).filter((f) => f.endsWith('.md'))) {
      const p = path.join(chaptersDir, file);
      const orig = fs.readFileSync(p, 'utf8');
      let next = orig;
      for (const [from, to] of renames) {
        next = next.split(from).join(to);
      }
      if (next !== orig) {
        touched++;
        if (!dry) fs.writeFileSync(p, next);
      }
    }
  }
  if (touched) console.log(`  → 更新 ${touched} 個章節檔的圖片引用`);

  // ---- 改寫 novels.config.json 的 coverUrl ----
  const entry = config.novels.find((n) => n.slug === novel.slug);
  if (entry?.coverUrl) {
    const base = path.basename(entry.coverUrl);
    if (renames.has(base)) {
      entry.coverUrl = entry.coverUrl.replace(base, renames.get(base));
      console.log(`  → coverUrl 改為 ${entry.coverUrl}`);
    }
  }

  return { before, after, n: converted };
}

const targets = (doAll
  ? config.novels
  : slugArg
    ? config.novels.filter((n) => n.slug === slugArg)
    : []
).filter((n) => !skip.includes(n.slug));

if (!targets.length) {
  console.error('Usage: node scripts/compress-assets.mjs <slug> | --all [--dry] [--keep] [--quality=85]');
  process.exit(1);
}

console.log(`JPEG quality ${quality}${dry ? '  [DRY RUN — 不會寫檔]' : ''}`);

let totalBefore = 0;
let totalAfter = 0;
let totalN = 0;
for (const novel of targets) {
  const r = await compressNovel(novel);
  totalBefore += r.before;
  totalAfter += r.after;
  totalN += r.n;
}

if (!dry && totalN) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

console.log(`\n${'='.repeat(56)}`);
console.log(`${totalN} 個檔案  ${fmt(totalBefore)} → ${fmt(totalAfter)}`);
if (totalBefore) {
  console.log(`共省下 ${fmt(totalBefore - totalAfter)} (−${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
}
if (!dry && totalN) console.log('\n記得跑 npm run build 讓 site/public 重新同步。');
