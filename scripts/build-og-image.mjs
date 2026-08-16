#!/usr/bin/env node
/**
 * build-og-image.mjs
 *
 * 產生首頁分享用的 Open Graph 卡片 (1200x630)。
 * 貼到 LINE / Facebook / X 時顯示的就是這張。
 *
 * 用法：node scripts/build-og-image.mjs
 * 輸出：site/public/og-default.jpg
 *
 * 書封面換了、書名數量變了，重跑一次即可。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'novels.config.json'), 'utf8'));
const OUT = path.join(ROOT, 'site', 'public', 'og-default.jpg');

// 挑 5 本已完結的當視覺，封面路徑轉成 file:// 讓 Playwright 讀得到
const shelf = config.novels
  .filter((n) => n.status !== 'draft' && n.coverUrl)
  .slice(0, 5)
  .map((n) => {
    const p = path.join(ROOT, 'site', 'public', n.coverUrl.replace(/^\//, ''));
    return fs.existsSync(p) ? 'file:///' + p.replace(/\\/g, '/') : null;
  })
  .filter(Boolean);

const totalChapters = (() => {
  try {
    const stats = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/src/data/novels-stats.json'), 'utf8'));
    return Object.values(stats).reduce((s, v) => s + (v.chapters || 0), 0);
  } catch {
    return 0;
  }
})();

const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden;
    background:#12161a;
    font-family:"Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif;
    color:#fff; display:flex; flex-direction:column; justify-content:space-between;
    padding:64px 72px;
    position:relative;
  }
  .glow {
    position:absolute; top:-240px; right:-180px; width:720px; height:720px;
    background:radial-gradient(circle, rgba(200,164,92,0.20) 0%, transparent 68%);
  }
  .top { position:relative; z-index:2; display:flex; flex-direction:column; gap:20px; }
  .brand { display:flex; align-items:center; gap:14px; }
  .mark {
    width:44px; height:44px; border-radius:10px; background:#c8a45c; color:#12161a;
    font-size:26px; font-weight:700; display:flex; align-items:center; justify-content:center;
  }
  .brand-name { font-size:26px; font-weight:600; letter-spacing:0.04em; }
  h1 {
    font-family:"Noto Serif TC","PMingLiU",serif;
    font-size:62px; font-weight:600; line-height:1.25; letter-spacing:0.02em;
    max-width:15em;
  }
  .meta { font-size:24px; color:#9aa4ad; letter-spacing:0.05em; }
  .meta b { color:#c8a45c; font-weight:600; }
  .shelf { position:relative; z-index:2; display:flex; gap:18px; align-items:flex-end; }
  .shelf img {
    width:150px; height:225px; object-fit:cover; border-radius:4px;
    box-shadow:0 12px 32px rgba(0,0,0,0.55);
  }
  .author {
    position:absolute; right:72px; bottom:64px; z-index:3;
    font-family:"Noto Serif TC","PMingLiU",serif;
    font-size:30px; letter-spacing:0.28em; color:#e6e9ec;
    writing-mode:vertical-rl;
  }
</style></head><body>
  <div class="glow"></div>
  <div class="top">
    <div class="brand"><div class="mark">N</div><div class="brand-name">${config.site.name}</div></div>
    <h1>${config.site.subtitle}</h1>
    <div class="meta"><b>${config.novels.length}</b> 部原創小說　·　<b>${totalChapters}</b> 章　·　${config.site.tagline}</div>
  </div>
  <div class="shelf">${shelf.map((s) => `<img src="${s}">`).join('')}</div>
  <div class="author">${config.site.author}</div>
</body></html>`;

const tmp = path.join(ROOT, '_output', '_og.html');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, html, 'utf8');

const { chromium } = await import('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await page.screenshot({ path: OUT, type: 'jpeg', quality: 88 });
await browser.close();
fs.unlinkSync(tmp);

console.log(`og-default.jpg -> ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB  (1200x630, ${shelf.length} 本書封)`);
