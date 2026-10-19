#!/usr/bin/env node
/**
 * build-strip.mjs — 排版與嵌字。把每格圖 + letters 疊成一條直式條漫。
 *
 *   node scripts/comic/build-strip.mjs --strip <02_strip.json>                 # → strip.html
 *   node scripts/comic/build-strip.mjs --strip <02_strip.json> --png           # 另存 strip.png
 *   node scripts/comic/build-strip.mjs --strip <02_strip.json> --contact CHAR-CHENYU --png
 *                                                                              # Gate：同一角色的所有格 + ref
 *
 * 字不畫進圖：對白、旁白、音效、白板字都是這裡疊上去的 HTML 層，改字不必重出圖。
 * 還沒出圖的格會畫成占位卡（格號、動作、出場實體），版面節奏照樣看得出來。
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadStrip, loadEntity, pickVariant, panelImage } from './lib.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const ctx = loadStrip(flag('strip'));
const { doc, outDir, scenes, mediaDir } = ctx;
const contact = flag('contact');
const W = doc.width ?? 800;
const GAP = { none: 6, normal: 40, long: 120 };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/\n/g, '<br>');
const ratio = (a) => a.replace(':', ' / ');
const relOut = (p) => path.relative(outDir, p).split(path.sep).join('/');

function placeholder(p) {
  const sc = scenes[p.scene];
  const chips = [...(p.cast ?? []).map((c) => c.id), ...(p.props ?? []).map((x) => x.id)];
  return `<div class="ph ${sc.light}"><b>${p.id}</b><span>${esc(p.action)}</span>
    <i>${esc(p.framing)}</i><em>${chips.map((c) => `<u>${c}</u>`).join('')}</em><small>未出圖</small></div>`;
}

function letter(l) {
  const style = `left:${l.x}%;top:${l.y}%;width:${l.w ?? 30}%;${l.color ? `color:${l.color};` : ''}${l.align ? `text-align:${l.align};` : ''}`;
  const cls = ['lt', l.type, l.tail ? `tail-${l.tail}` : '', l.emphasis ? 'em' : '', l.plain ? 'plain' : ''].join(' ');
  return `<div class="${cls}" style="${style}"><span>${esc(l.text)}</span></div>`;
}

function panelHtml(p, { letters = true, label = false } = {}) {
  const img = panelImage(outDir, p.id);
  const body = img ? `<img src="${relOut(img)}" alt="${p.id}">` : placeholder(p);
  return `<figure class="panel" style="aspect-ratio:${ratio(p.aspect)}">${body}
    ${letters ? (p.letters ?? []).map(letter).join('') : ''}${label ? `<figcaption>${p.id}</figcaption>` : ''}</figure>`;
}

const CSS = `
:root{--bg:#0b0f14;--ink:#111;--paper:#fbfbf8}
*{box-sizing:border-box;margin:0}
body{background:var(--bg);color:#cbd5e1;font-family:"Noto Sans TC","WenQuanYi Zen Hei","PingFang TC","Microsoft JhengHei",sans-serif}
.strip{width:${W}px;margin:0 auto;padding:0 0 160px}
header{padding:120px 48px 100px;text-align:center}
header h1{font-size:40px;color:#e2e8f0;letter-spacing:.08em;font-weight:700}
header p{margin-top:14px;font-size:15px;color:#64748b;letter-spacing:.2em}
.panel{position:relative;width:100%;overflow:hidden;background:#000}
.panel img{width:100%;height:100%;object-fit:cover;display:block}
.ph{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:8% 10%;text-align:center;
  background:radial-gradient(120% 90% at 15% 50%,#3a2f1f 0%,#0f1d26 45%,#060a0e 100%);border:1px dashed #1e3a4a}
.ph.lights_off{background:radial-gradient(90% 70% at 20% 55%,#241c12 0%,#06090c 60%,#020304 100%)}
.ph b{font:700 30px/1 ui-monospace,monospace;color:#38bdf8;opacity:.8}
.ph span{font-size:21px;color:#e2e8f0;line-height:1.5}
.ph i{font-size:13px;color:#64748b;font-style:normal;max-width:90%}
.ph em{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font-style:normal}
.ph u{text-decoration:none;font:12px ui-monospace,monospace;padding:3px 8px;border-radius:99px;background:#0b2533;color:#7dd3fc}
.ph small{position:absolute;right:14px;bottom:10px;font-size:12px;color:#475569}
.lt{position:absolute;z-index:2;font-size:19px;line-height:1.5}
.lt span{display:block}
.speech span{background:var(--paper);color:var(--ink);padding:14px 20px;border-radius:44% / 50%;text-align:center;box-shadow:0 1px 0 #0003;font-weight:500}
.speech.em span{font-weight:900;font-size:22px}
.speech::after{content:"";position:absolute;width:0;height:0;border:12px solid transparent}
.tail-bottom-left::after{left:22%;bottom:-20px;border-top:16px solid var(--paper);border-left:6px solid transparent}
.tail-bottom-right::after{right:22%;bottom:-20px;border-top:16px solid var(--paper);border-right:6px solid transparent}
.tail-top-left::after{left:22%;top:-20px;border-bottom:16px solid var(--paper);border-left:6px solid transparent}
.tail-top-right::after{right:22%;top:-20px;border-bottom:16px solid var(--paper);border-right:6px solid transparent}
.caption span{background:#0b1117e6;color:#e2e8f0;padding:10px 16px;border-left:3px solid #f59e0b;font-size:17px;letter-spacing:.04em}
.caption.plain span{background:none;border:0;color:#94a3b8;font-size:16px;letter-spacing:.3em}
.sfx span{font:italic 900 34px/1 sans-serif;color:#f8fafc;-webkit-text-stroke:1.5px #0b1117;transform:rotate(-6deg);opacity:.9}
.board span{font-family:"Zhi Mang Xing","Long Cang","WenQuanYi Zen Hei",cursive;font-size:22px;transform:rotate(-1.2deg);opacity:.88}
.board.em span{font-size:34px;font-weight:700}
.sheet{width:1200px;margin:0 auto;padding:40px}
.sheet h1{font-size:24px;color:#e2e8f0}.sheet p{color:#64748b;margin:8px 0 24px;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:start}
.grid .panel figcaption{position:absolute;left:0;bottom:0;right:0;padding:6px 10px;font:12px ui-monospace,monospace;background:#000b;color:#e2e8f0}
.refs{display:flex;gap:12px;margin-bottom:28px}.refs img{height:200px;border:2px solid #f59e0b}.refs .none{padding:24px;border:1px dashed #475569;color:#64748b;font-size:14px}
`;

const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Zhi+Mang+Xing&display=swap">';
let html, name;
if (contact) {
  const ent = loadEntity(mediaDir, contact);
  if (!ent) { console.error(`實體不存在：${contact}`); process.exit(1); }
  const hits = doc.panels.filter((p) => (p.cast ?? []).some((c) => c.id === contact));
  const years = [...new Set(hits.map((p) => scenes[p.scene].year))];
  const refImgs = years.flatMap((y) => {
    const [vk, v] = pickVariant(ent, y);
    return Object.values(v?.refs ?? {}).filter((f) => !String(f).startsWith('⬜'))
      .map((f) => path.join(mediaDir, 'character_refs', contact, vk, f)).filter((f) => fs.existsSync(f));
  });
  html = `<div class="sheet"><h1>Contact sheet｜${contact} ${esc(ent.name ?? '')}</h1>
    <p>判準只有一個：這 ${hits.length} 格裡是不是同一個人。檢查清單：${esc(ent.identity_marks?.checklist ?? '—')}</p>
    <div class="refs">${refImgs.length ? refImgs.map((f) => `<img src="${relOut(f)}">`).join('') : '<div class="none">ref 未建——Gate 3 未過，這張表現在只能看版面</div>'}</div>
    <div class="grid">${hits.map((p) => panelHtml(p, { letters: false, label: true })).join('')}</div></div>`;
  name = `contact_${contact}`;
} else {
  html = `<div class="strip"><header><h1>${esc(doc.title)}</h1><p>IRIS · ${doc.episode.toUpperCase()}</p></header>
    ${doc.panels.map((p) => `<div style="height:${GAP[p.gap_before ?? 'normal']}px"></div>${panelHtml(p)}`).join('\n')}</div>`;
  name = 'strip';
}

fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${name}.html`);
fs.writeFileSync(out, `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${esc(doc.title)}</title>${fonts}<style>${CSS}</style></head><body>${html}</body></html>`);
const done = doc.panels.filter((p) => panelImage(outDir, p.id)).length;
console.log(`✓ ${path.relative(ROOT, out)}  （${done}/${doc.panels.length} 格已出圖，其餘為占位）`);

if (args.includes('--png')) {
  const { chromium } = await import('playwright');
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((f) => fs.existsSync(f));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: contact ? 1280 : W, height: 1000 }, deviceScaleFactor: contact ? 1 : 1.35 });
  await page.goto('file://' + out, { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  const png = out.replace(/\.html$/, '.png');
  await page.screenshot({ path: png, fullPage: true });
  await browser.close();
  console.log(`✓ ${path.relative(ROOT, png)}`);
}
