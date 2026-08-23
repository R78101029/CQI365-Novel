#!/usr/bin/env node
/**
 * check-chapter-images.mjs
 *
 * 稽核每一章的插圖是否接上。網站（site/src/pages/novel/[novelSlug]/index.astro）
 * 與 WordPress（build-wp-html.mjs）都是讀章節 frontmatter 的 cover:，
 * 沒寫就兩邊都不會有圖——圖檔存在也沒用。
 *
 *   node scripts/check-chapter-images.mjs              全部小說
 *   node scripts/check-chapter-images.mjs HalfFinished 單一小說
 *   node scripts/check-chapter-images.mjs --fix        把能唯一配對的 cover 寫回 frontmatter
 *
 * --fix 只在「檔名數字與章節數字唯一對應」時才動手。配不出來或有歧義一律不碰，
 * 留給人決定——圖跟章節的對應是內容判斷，不是字串比對。
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const FIX = args.includes('--fix');
const only = args.find((a) => !a.startsWith('--'));

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'novels.config.json'), 'utf8'));
const novels = (config.novels ?? config).length ? (config.novels ?? config) : Object.values(config.novels ?? config);
const slugs = (Array.isArray(novels) ? novels : Object.values(novels))
  .map((n) => n.slug)
  .filter((s) => s && (!only || s === only));

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const num = (s) => { const m = String(s).match(/(\d{1,3})/); return m ? m[1].padStart(2, '0') : null; };

let totalProblems = 0;

for (const slug of slugs) {
  const chDir = path.join(ROOT, 'projects', slug, 'chapters');
  const imgDir = path.join(ROOT, 'site', 'public', 'assets', slug, 'chapters');
  if (!fs.existsSync(chDir)) continue;

  const chapters = fs.readdirSync(chDir).filter((f) => f.endsWith('.md')).sort();
  const images = fs.existsSync(imgDir) ? fs.readdirSync(imgDir).filter((f) => IMG_RE.test(f)) : [];

  const rows = [];
  const usedImages = new Set();
  const fixes = [];

  for (const file of chapters) {
    const full = path.join(chDir, file);
    const src = fs.readFileSync(full, 'utf8');
    const fm = (src.match(/^---\r?\n([\s\S]*?)\r?\n---/) ?? [])[1] ?? '';
    const cover = (fm.match(/^cover:\s*["']?([^"'\r\n]+)/m) ?? [])[1]?.trim() ?? null;
    // 內文圖有兩種寫法：markdown ![](...) 與裸 <img src="...">（BlindOrbit 用後者）
    const inline = [
      ...[...src.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]),
      ...[...src.matchAll(/<img[^>]*\ssrc=["']([^"']+)["']/gi)].map((m) => m[1]),
    ];

    let status, detail = '';
    if (cover) {
      usedImages.add(cover);
      const exists = fs.existsSync(path.join(imgDir, cover));
      status = exists ? 'ok' : '檔案不存在';
      if (!exists) detail = cover;
    } else if (inline.length) {
      // 內文已經有圖，再加 cover 會讓同一張圖出現兩次
      inline.forEach((u) => usedImages.add(path.basename(u.split('?')[0])));
      status = `ok（內文圖 ${inline.length}）`;
    } else {
      // 沒 cover：試著用章節數字找唯一候選
      const n = num(file);
      const cand = n ? images.filter((f) => num(f) === n) : [];
      if (cand.length === 1) { status = '未接上'; detail = `可配 ${cand[0]}`; fixes.push({ full, file, img: cand[0] }); }
      else if (cand.length > 1) { status = '未接上'; detail = `候選多個：${cand.join(', ')}`; }
      else { status = '未接上'; detail = '找不到對應圖'; }
    }
    if (status !== 'ok' && !status.startsWith('ok')) totalProblems++;
    rows.push({ file, cover: cover ?? '—', status, detail });
  }

  const orphans = images.filter((f) => !usedImages.has(f) && !fixes.some((x) => x.img === f));

  // 內容重複（同一本書裡兩張圖檔內容一模一樣）
  const byHash = new Map();
  for (const f of images) {
    const h = crypto.createHash('sha256').update(fs.readFileSync(path.join(imgDir, f))).digest('hex');
    byHash.set(h, [...(byHash.get(h) ?? []), f]);
  }
  const dups = [...byHash.values()].filter((v) => v.length > 1);

  const bad = rows.filter((r) => !r.status.startsWith('ok'));
  const head = `${slug}  章:${chapters.length} 圖:${images.length}`;
  if (!bad.length && !orphans.length && !dups.length) { console.log(`✓ ${head}`); continue; }

  // 只有多餘檔案（書封、備用圖）不算錯，用 · 標示，不要跟真的沒接上混在一起
  if (!bad.length && !dups.length) {
    console.log(`· ${head}  沒被任何章引用：${orphans.join(', ')}`);
    continue;
  }

  console.log(`\n✗ ${head}`);
  for (const r of bad) console.log(`   ${r.file.padEnd(46)} ${r.status}  ${r.detail}`);
  if (dups.length) { totalProblems += dups.length; dups.forEach((d) => console.log(`   !! 內容重複的圖：${d.join(' = ')}`)); }
  if (orphans.length) console.log(`   沒被任何章引用：${orphans.join(', ')}`);

  if (FIX && fixes.length) {
    for (const { full, file, img } of fixes) {
      let s = fs.readFileSync(full, 'utf8');
      s = s.replace(/^(---\r?\n)/, `$1cover: "${img}"\n`);
      fs.writeFileSync(full, s);
      console.log(`   → 已寫入 ${file}  cover: "${img}"`);
    }
    console.log(`   ${fixes.length} 章已接上。記得跑 node scripts/sync-chapters.js`);
  } else if (fixes.length) {
    console.log(`   （${fixes.length} 章可用 --fix 自動接上）`);
  }
}

console.log(totalProblems ? `\n共 ${totalProblems} 個問題。` : '\n全部正常。');
