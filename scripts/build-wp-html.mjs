#!/usr/bin/env node
/**
 * build-wp-html.mjs
 *
 * 把已完成的小說章節轉成「可直接貼進 WordPress 的純 HTML」。
 * 所有樣式都內嵌在 style 屬性裡，不需要在 WP 佈景主題加任何 CSS。
 * 圖片一律引用小說站的絕對網址，不需要上傳到 WP 媒體庫。
 *
 * 輸入：site/src/content/novels/<slug>/*.md
 *   （用 site/ 而不是 projects/，因為 sync-chapters.js 已經把圖片路徑
 *     改寫成 /assets/<slug>/... 的絕對路徑了）
 * 輸出：_output/wp/<slug>/<章節檔名>.html + index.md（貼稿清單）
 *
 * 用法：
 *   node scripts/build-wp-html.mjs <slug>              整本，每章一檔
 *   node scripts/build-wp-html.mjs <slug> --ch 3       只出第 3 章（閱讀順序，1 起算）
 *   node scripts/build-wp-html.mjs <slug> --ch 3-5     第 3 到 5 章
 *   node scripts/build-wp-html.mjs <slug> --ch 1,4,9   指定數章
 *   node scripts/build-wp-html.mjs <slug> --ch 3 --clip  順便複製到剪貼簿
 *   node scripts/build-wp-html.mjs <slug> --list       只列出章節與編號
 *   node scripts/build-wp-html.mjs --all               所有已完結小說
 *   node scripts/build-wp-html.mjs --all --drafts      連草稿小說一起
 *
 * 其他選項：
 *   --site <url>    小說站網址（預設 https://novels.cqi365.net）
 *   --out <dir>     輸出目錄（預設 _output/wp）
 *   --no-cover      不要在章首放章節封面圖
 *   --no-footer     不要在章尾放導流區塊
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import minimist from "minimist";
import { marked } from "marked";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "novels.config.json");
const CONTENT_DIR = path.join(ROOT, "site", "src", "content", "novels");

const argv = minimist(process.argv.slice(2), {
  boolean: ["all", "drafts", "clip", "list", "help", "cover", "footer"],
  string: ["site", "out", "ch"],
  alias: { h: "help", c: "ch", o: "out" },
  default: { cover: true, footer: true },
});

if (argv.help || (!argv.all && !argv._[0])) {
  console.log(
    `用法：
  node scripts/build-wp-html.mjs <slug>              整本，每章一檔
  node scripts/build-wp-html.mjs <slug> --ch 3       只出第 3 章
  node scripts/build-wp-html.mjs <slug> --ch 3-5     第 3 到 5 章
  node scripts/build-wp-html.mjs <slug> --ch 1,4,9   指定數章
  node scripts/build-wp-html.mjs <slug> --list       列出章節編號
  node scripts/build-wp-html.mjs <slug> --ch 3 --clip  複製到剪貼簿
  node scripts/build-wp-html.mjs --all               所有已完結小說
  node scripts/build-wp-html.mjs --all --drafts      連草稿一起

選項：
  --site <url>   小說站網址（預設 https://novels.cqi365.net）
  --out <dir>    輸出目錄（預設 _output/wp）
  --no-cover     章首不放章節封面圖
  --no-footer    章尾不放導流區塊
`,
  );
  process.exit(0);
}

const SITE = (argv.site || "https://novels.cqi365.net").replace(/\/+$/, "");
const OUT_ROOT = argv.out ? path.resolve(argv.out) : path.join(ROOT, "_output", "wp");

// ---------------------------------------------------------------------------
// 樣式：對應 site/src/styles/global.css 的 .chapter-content（淺色模式取值）
// WordPress 貼上後不吃佈景主題的 CSS，所以每個標籤都要自帶 style。
// ---------------------------------------------------------------------------

const C = {
  text: "#1e293b",
  textSecondary: "#475569",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  primary: "#1e3a5f",
  accent: "#0d9488",
  border: "#e2e8f0",
  bgSecondary: "#f8fafc",
  bgCode: "#f1f5f9",
};

const FONT =
  "'Noto Sans TC','Noto Sans SC','Microsoft JhengHei','PingFang TC',-apple-system,BlinkMacSystemFont,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace";
const SHADOW_MD = "0 4px 12px rgba(0,0,0,0.08)";
const SHADOW_LG = "0 12px 24px rgba(0,0,0,0.12)";

const S = {
  wrapper: `font-family:${FONT};font-size:1.08rem;line-height:2;color:${C.text};text-align:justify;`,
  p: `text-indent:2em;text-align:justify;margin:0 0 1.15em;color:${C.text};font-weight:400;`,
  pFirst: `text-indent:0;text-align:justify;margin:0 0 1.15em;color:${C.text};font-weight:400;`,
  h2: `font-weight:700;color:${C.primary};margin:2.5rem 0 1.5rem;font-size:1.4rem;border-bottom:2px solid ${C.accent};padding-bottom:0.5rem;text-indent:0;line-height:1.5;`,
  h3: `font-weight:600;color:${C.primary};margin:2rem 0 1rem;font-size:1.2rem;text-indent:0;line-height:1.6;`,
  h4: `font-weight:600;color:${C.primary};margin:1.75rem 0 0.9rem;font-size:1.08rem;text-indent:0;line-height:1.6;`,
  hr: `border:none;height:1px;background:linear-gradient(to right,transparent,${C.border},transparent);margin:3rem 0;`,
  figure: `margin:2.5rem 0;text-align:center;`,
  img: `display:block;max-width:min(100%,680px);height:auto;margin:0 auto;border-radius:8px;box-shadow:${SHADOW_MD};`,
  strong: `font-weight:700;color:${C.text};`,
  a: `color:${C.accent};text-decoration:none;`,
  ul: `margin:1.2rem 0;padding-left:2.2em;`,
  ol: `margin:1.2rem 0;padding-left:2.2em;`,
  li: `margin:0.4em 0;text-indent:0;text-align:justify;`,
  pre: `background:${C.bgSecondary};border:1px solid ${C.border};border-radius:8px;padding:1rem 1.25rem;margin:1.6rem 0;overflow-x:auto;font-family:${MONO};font-size:0.9rem;line-height:1.65;text-indent:0;color:${C.textSecondary};`,
  code: `background:${C.bgCode};border-radius:4px;padding:0.1em 0.35em;font-family:${MONO};font-size:0.92em;`,
  // 嵌套引文：層級本身是敘事（《溺墨》），所以每層都要看得出差別，
  // 同時縮排必須遞減，否則第五層在手機上會被擠爆。
  blockquote: [
    `border-left:3px solid ${C.accent};padding:1rem 1.5rem;margin:2rem 0;background:${C.bgSecondary};border-radius:0 8px 8px 0;font-style:italic;color:${C.textSecondary};`,
    `border-left:2px solid ${C.accent};padding:0.1rem 0 0.1rem 1rem;margin:1.15rem 0 0.35rem;background:transparent;border-radius:0;font-style:italic;font-size:0.98em;color:${C.textSecondary};`,
    `border-left:2px dashed ${C.accent};padding:0.1rem 0 0.1rem 0.75rem;margin:1rem 0 0.3rem;background:transparent;border-radius:0;font-style:italic;font-size:0.98em;letter-spacing:0.01em;color:${C.textSecondary};`,
    `border-left:2px dotted ${C.accent};padding:0.1rem 0 0.1rem 0.5rem;margin:0.9rem 0 0.25rem;background:transparent;border-radius:0;font-style:italic;font-size:0.98em;line-height:1.75;color:${C.textSecondary};`,
    `border-left:2px dotted ${C.textLight};padding:0.1rem 0 0.1rem 0.5rem;margin:0.8rem 0 0.2rem;background:transparent;border-radius:0;font-style:italic;font-size:0.98em;line-height:1.7;color:${C.textMuted};`,
  ],
  sceneMark: `text-align:center;text-indent:0;color:${C.textLight};letter-spacing:0.6em;margin:2.4rem 0;font-size:1rem;`,
  sceneSpace: `text-align:center;text-indent:0;margin:2rem 0;`,
  footnoteBox: `margin:2.5rem 0 0;padding-top:0.5rem;font-size:0.92rem;line-height:1.85;color:${C.textMuted};`,
  footnoteTitle: `text-indent:0;margin:0 0 0.8rem;font-weight:700;color:${C.primary};font-size:1rem;`,
  footnoteItem: `text-indent:0;text-align:justify;margin:0 0 0.6rem;color:${C.textMuted};`,
  footerNote: `text-align:center;text-indent:0;color:${C.textMuted};font-size:0.95rem;line-height:1.9;margin:0 0 1rem;`,
};

const bqStyle = (depth) => S.blockquote[Math.min(depth, S.blockquote.length) - 1];

// ---------------------------------------------------------------------------
// Markdown → HTML
// ---------------------------------------------------------------------------

function stripHtmlComments(s) {
  return s.replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * 抽出 Markdown 註腳定義（`[^1]: 說明`），並把內文的 `[^1]` 換成上標錨點。
 * marked 會把註腳定義當成 link reference definition 直接吃掉，所以必須先抽走。
 * 有些章節只有定義、沒有內文引用（孤兒定義），這些照樣列進註釋區，只是不做回跳連結。
 */
function extractFootnotes(markdown, idPrefix) {
  const defs = new Map();
  const body = markdown.replace(/^\[\^([^\]]+)\]:[ \t]*(.*)$/gm, (_m, key, text) => {
    defs.set(key, text.trim());
    return "";
  });

  const referenced = new Set();
  const withRefs = body.replace(/\[\^([^\]]+)\]/g, (m, key) => {
    if (!defs.has(key)) return m;
    referenced.add(key);
    return `<sup id="${idPrefix}-ref-${key}" style="line-height:0;"><a href="#${idPrefix}-note-${key}" style="color:${C.accent};text-decoration:none;">[${key}]</a></sup>`;
  });

  return { body: withRefs, defs, referenced };
}

function renderFootnotes(defs, referenced, idPrefix) {
  if (defs.size === 0) return "";
  const items = [...defs.entries()].map(([key, text]) => {
    const label = referenced.has(key)
      ? `<a href="#${idPrefix}-ref-${key}" style="color:${C.accent};text-decoration:none;font-weight:700;">[${key}]</a>`
      : `<strong style="color:${C.textSecondary};">[${key}]</strong>`;
    const content = marked.parseInline(text, { gfm: true });
    return `<p id="${idPrefix}-note-${key}" style="${S.footnoteItem}">${label} ${content}</p>`;
  });
  return [
    `<hr style="${S.hr}"/>`,
    `<div style="${S.footnoteBox}">`,
    `<p style="${S.footnoteTitle}">註釋</p>`,
    ...items,
    `</div>`,
  ].join("\n");
}

/**
 * 逐一走過 HTML 標籤，把 style 內嵌進去。
 * 需要狀態的地方有三處：blockquote 巢狀深度、每個容器的「第一段」、以及 pre 區塊內不加工。
 */
function applyInlineStyles(html) {
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)\s*>/g;
  let out = "";
  let cursor = 0;
  let bqDepth = 0;
  let preDepth = 0;
  // CSS 的 :first-of-type 是「每個父層各自算」，所以首段偵測必須跟著容器堆疊走。
  const containers = []; // 目前開著的容器標籤（blockquote / figure）
  const pSeen = [0]; // 每個容器層級已出現幾個 <p>
  let inP = false; // 用來判斷 <img> 是內文插圖還是獨立區塊

  const setStyle = (attrs, style) => {
    const cleaned = attrs.replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, "");
    return `${cleaned.trim() ? " " + cleaned.trim() : ""} style="${style}"`;
  };

  let m;
  while ((m = tagRe.exec(html)) !== null) {
    out += html.slice(cursor, m.index);
    cursor = tagRe.lastIndex;

    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3] || "";
    const selfClose = m[4] === "/";
    const end = selfClose ? "/>" : ">";

    // <pre> 裡的內容原樣保留，只給 <pre> 本身加樣式
    if (tag === "pre") {
      if (closing) preDepth = Math.max(0, preDepth - 1);
      out += closing ? "</pre>" : `<pre${setStyle(attrs, S.pre)}>`;
      if (!closing) preDepth++;
      continue;
    }
    if (preDepth > 0) {
      out += m[0];
      continue;
    }

    if (closing) {
      if (tag === "p") inP = false;
      if ((tag === "blockquote" || tag === "figure") && containers.at(-1) === tag) {
        containers.pop();
        pSeen.pop();
        if (tag === "blockquote") bqDepth = Math.max(0, bqDepth - 1);
      }
      out += `</${tag}>`;
      continue;
    }

    switch (tag) {
      case "p": {
        const first = pSeen[pSeen.length - 1] === 0;
        pSeen[pSeen.length - 1]++;
        inP = true;
        out += `<p${setStyle(attrs, first ? S.pFirst : S.p)}>`;
        break;
      }
      case "blockquote":
        bqDepth++;
        containers.push("blockquote");
        pSeen.push(0);
        out += `<blockquote${setStyle(attrs, bqStyle(bqDepth))}>`;
        break;
      case "hr": {
        // 場景分隔符的佔位標記（在 markdown 預處理階段種下）
        if (/data-cq\s*=\s*["']scene["']/.test(attrs)) {
          out += `<p style="${S.sceneMark}">※</p>`;
        } else if (/data-cq\s*=\s*["']space["']/.test(attrs)) {
          out += `<p style="${S.sceneSpace}">&nbsp;</p>`;
        } else {
          out += `<hr${setStyle(attrs, S.hr)}/>`;
        }
        break;
      }
      case "h1":
      case "h2":
        out += `<h2${setStyle(attrs, S.h2)}>`;
        break;
      case "h3":
        out += `<h3${setStyle(attrs, S.h3)}>`;
        break;
      case "h4":
      case "h5":
      case "h6":
        out += `<${tag}${setStyle(attrs, S.h4)}>`;
        break;
      case "figure":
        containers.push("figure");
        pSeen.push(0);
        out += `<figure${setStyle(attrs, S.figure)}>`;
        break;
      case "img": {
        let a = attrs;
        if (!/\sloading\s*=/i.test(a)) a += ' loading="lazy"';
        const img = `<img${setStyle(a, S.img)}/>`;
        // 已經在 <figure> 或段落裡的維持原樣；獨立成塊的（BlindOrbit 直接寫 HTML
        // 的寫法，marked 會把它跟後面的 <hr> 併成同一行）補上 figure 外框。
        out += containers.at(-1) === "figure" || inP ? img : `<figure style="${S.figure}">${img}</figure>`;
        break;
      }
      case "strong":
      case "b":
        out += `<strong${setStyle(attrs, S.strong)}>`;
        break;
      case "a":
        out += `<a${setStyle(attrs, S.a)}>`;
        break;
      case "ul":
        out += `<ul${setStyle(attrs, S.ul)}>`;
        break;
      case "ol":
        out += `<ol${setStyle(attrs, S.ol)}>`;
        break;
      case "li":
        out += `<li${setStyle(attrs, S.li)}>`;
        break;
      case "code":
        out += `<code${setStyle(attrs, S.code)}>`;
        break;
      default:
        out += `<${tag}${attrs}${end}`;
    }
  }
  out += html.slice(cursor);
  return out;
}

function mdToWpHtml(markdown, idPrefix) {
  let cleaned = stripHtmlComments(markdown);

  const { body, defs, referenced } = extractFootnotes(cleaned, idPrefix);
  cleaned = body;

  // 場景分隔符 → 佔位標記（用 [ \t]* 而非 \s*，\s* 會吞掉前後空行，
  // 導致 marked 把後續的 ** 誤判成 HTML block）
  cleaned = cleaned.replace(/^[ \t]*※[ \t]*$/gm, '<hr data-cq="scene"/>');
  cleaned = cleaned.replace(/^[ \t]*&nbsp;[ \t]*$/gm, '<hr data-cq="space"/>');

  let html = marked.parse(cleaned, { gfm: true, breaks: false });

  // 獨立成段的圖片包成 <figure>（其餘裸 <img> 由 applyInlineStyles 依容器補框）
  html = html.replace(/<p>\s*(<img\s[^>]*>)\s*<\/p>/g, "<figure>$1</figure>");

  html = applyInlineStyles(html);
  html += renderFootnotes(defs, referenced, idPrefix);

  return html;
}

/** 圖片相對路徑 → 小說站絕對網址 */
function absolutizeAssets(html) {
  return html
    .replace(/(src|href)="\/assets\//g, `$1="${SITE}/assets/`)
    .replace(/(src|href)='\/assets\//g, `$1='${SITE}/assets/`);
}

/**
 * 收掉空行。Classic Editor 的 wpautop 會把連續換行補成 <p>，
 * 在已經是完整 HTML 的內容上會生出一堆空段落。<pre> 內容先保護起來。
 */
function collapseBlankLines(html) {
  const blocks = [];
  const guarded = html.replace(/<pre[\s\S]*?<\/pre>/g, (m) => {
    blocks.push(m);
    return `\u0001PRE${blocks.length - 1}\u0001`;
  });
  const collapsed = guarded.replace(/\n{2,}/g, "\n").trim();
  return collapsed.replace(/\u0001PRE(\d+)\u0001/g, (_m, i) => blocks[Number(i)]);
}

// ---------------------------------------------------------------------------
// 章節組裝
// ---------------------------------------------------------------------------

function chapterCoverUrl(novelSlug, data) {
  if (data.cover_url) return data.cover_url;
  if (data.cover) return `${SITE}/assets/${novelSlug}/chapters/${data.cover}`;
  return null;
}

function absolutize(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function buildChapterHtml(novel, ch, index, total) {
  // 章節站上錨點：Astro 的 glob loader 會把檔名（去掉 .md）轉小寫當 collection id，
  // 頁面再直接拿它當 section 的 id，所以這裡也要跟著轉小寫，否則錨點跳不到。
  const chapterUrl = `${SITE}/novel/${novel.slug}/#${encodeURIComponent(ch.fileSlug.toLowerCase())}`;

  const parts = [];
  parts.push(
    `<!-- ${novel.title} 第 ${index} / ${total} 章｜建議標題：${ch.wpTitle}｜原稿：${ch.fileSlug}.md -->`,
  );
  parts.push(`<div class="novel-chapter" style="${S.wrapper}">`);

  if (argv.cover) {
    const cover = chapterCoverUrl(novel.slug, ch.data);
    if (cover) {
      parts.push(
        `<figure style="${S.figure}"><img src="${cover}" alt="${escapeAttr(ch.title)}" loading="lazy" style="${S.img}"/></figure>`,
      );
    }
  }

  parts.push(ch.bodyHtml);

  if (argv.footer) {
    const novelCover = absolutize(novel.coverUrl);
    parts.push(`<hr style="${S.hr}"/>`);
    if (novelCover) {
      parts.push(
        `<div style="text-align:center;margin:2.5rem 0 1.25rem;">` +
          `<a href="${chapterUrl}" target="_blank" rel="noopener">` +
          `<img src="${novelCover}" alt="${escapeAttr(novel.title)}" loading="lazy" style="display:block;max-width:300px;width:100%;height:auto;margin:0 auto;border-radius:8px;box-shadow:${SHADOW_LG};"/>` +
          `</a></div>`,
      );
    }
    const titleLine = novel.titleEn ? `《${novel.title}》（${novel.titleEn}）` : `《${novel.title}》`;
    parts.push(
      `<p style="${S.footerNote}">本章節出自 ${titleLine}，作者 林雨果。<br/>` +
        `<a href="${chapterUrl}" target="_blank" rel="noopener" style="color:${C.accent};font-weight:700;text-decoration:none;">前往 Novels365 閱讀全書 →</a></p>`,
    );
  }

  parts.push(`</div>`);
  return collapseBlankLines(absolutizeAssets(parts.join("\n")));
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// ---------------------------------------------------------------------------
// 讀取章節
// ---------------------------------------------------------------------------

function loadChapters(novel) {
  const dir = path.join(CONTENT_DIR, novel.slug);
  if (!fs.existsSync(dir)) {
    throw new Error(`找不到章節目錄：${dir}\n請先跑 node scripts/sync-chapters.js ${novel.slug}`);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const chapters = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const fileSlug = file.replace(/\.md$/, "");

    // 首個 H1 是章名，WP 文章標題已經是它了，留著會重複
    let body = content;
    let h1 = null;
    const h1Match = body.match(/^[ \t]*#[ \t]+(.+?)[ \t]*$/m);
    if (h1Match) {
      h1 = h1Match[1].trim();
      body = body.replace(h1Match[0], "");
    }

    const title = h1 || data.title || fileSlug;
    return {
      file,
      fileSlug,
      data,
      order: typeof data.order === "number" ? data.order : Number(data.order) || 0,
      title,
      wpTitle: `【${novel.title}】${title}`,
      rawBody: body,
    };
  });

  chapters.sort((a, b) => a.order - b.order);
  return chapters;
}

function parseChapterSelector(spec, total) {
  if (!spec) return null;
  const picked = new Set();
  for (const part of String(spec).split(",")) {
    const range = part.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const [a, b] = [Number(range[1]), Number(range[2])];
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) picked.add(i);
    } else if (/^\d+$/.test(part.trim())) {
      picked.add(Number(part.trim()));
    } else if (part.trim()) {
      throw new Error(`無法解析 --ch 的值：${part}`);
    }
  }
  const bad = [...picked].filter((n) => n < 1 || n > total);
  if (bad.length) throw new Error(`章節編號超出範圍（1-${total}）：${bad.join(", ")}`);
  return picked;
}

function copyToClipboard(filePath) {
  if (process.platform !== "win32") {
    console.log("  （--clip 目前只支援 Windows，已略過）");
    return;
  }
  const r = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Get-Content -Raw -Encoding UTF8 -LiteralPath '${filePath.replace(/'/g, "''")}' | Set-Clipboard`,
    ],
    { stdio: "ignore" },
  );
  if (r.status === 0) console.log("  ✓ 已複製到剪貼簿，直接到 WordPress 貼上即可");
  else console.log("  ⚠ 複製到剪貼簿失敗，請手動開啟檔案複製");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

let targets;
if (argv.all) {
  targets = argv.drafts ? config.novels : config.novels.filter((n) => n.status !== "draft");
} else {
  const found = config.novels.find((n) => n.slug === argv._[0]);
  if (!found) {
    console.error(`找不到小說：${argv._[0]}`);
    console.error(`可選：${config.novels.map((n) => n.slug).join(", ")}`);
    process.exit(1);
  }
  targets = [found];
}

let grandTotal = 0;

for (const novel of targets) {
  const chapters = loadChapters(novel);

  if (argv.list) {
    console.log(`\n${novel.title}（${novel.slug}）－ ${chapters.length} 章`);
    chapters.forEach((c, i) => {
      console.log(`  ${String(i + 1).padStart(3)}  ${c.title}   [${c.fileSlug}.md]`);
    });
    continue;
  }

  const selector = parseChapterSelector(argv.ch, chapters.length);
  const outDir = path.join(OUT_ROOT, novel.slug);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n=== ${novel.title}（${novel.slug}）===`);

  const written = [];
  chapters.forEach((ch, i) => {
    const index = i + 1;
    if (selector && !selector.has(index)) return;

    ch.bodyHtml = mdToWpHtml(ch.rawBody, `${novel.slug}-${index}`);
    const html = buildChapterHtml(novel, ch, index, chapters.length);
    const outFile = path.join(outDir, `${ch.fileSlug}.html`);
    fs.writeFileSync(outFile, html, "utf8");
    written.push({ index, ch, outFile, bytes: Buffer.byteLength(html, "utf8") });
    console.log(
      `  ✓ ${String(index).padStart(3)}  ${ch.title}  →  ${path.relative(ROOT, outFile)}  (${(written.at(-1).bytes / 1024).toFixed(1)} KB)`,
    );
  });

  grandTotal += written.length;

  // 貼稿清單
  const indexLines = [
    `# ${novel.title} － WordPress 貼稿清單`,
    "",
    `小說站：${SITE}/novel/${novel.slug}/`,
    `產生時間：${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
    "",
    "## 貼上步驟",
    "",
    "1. WordPress 後台 → 新增文章，把「建議標題」貼進標題欄",
    "2. 內文區塊選「自訂 HTML」（或 Classic Editor 切到「文字」分頁）",
    "3. 開啟對應 .html 檔，全選複製，貼進去",
    "4. 分類設為：" + (novel.wordpress?.category || novel.title),
    "",
    "> 圖片全部直接引用小說站網址，不需要上傳到 WP 媒體庫。",
    "> 精選圖片（featured image）需要另外在 WP 媒體庫上傳，或直接沿用文章內的章首圖。",
    "",
    "## 章節",
    "",
    "| # | 建議標題 | 檔案 |",
    "|---|---------|------|",
    ...written.map(
      (w) => `| ${w.index} | ${w.ch.wpTitle} | \`${path.basename(w.outFile)}\` |`,
    ),
    "",
  ];
  fs.writeFileSync(path.join(outDir, "index.md"), indexLines.join("\n"), "utf8");

  if (argv.clip) {
    if (written.length === 1) copyToClipboard(written[0].outFile);
    else console.log(`  （--clip 需搭配單一章節，本次產出 ${written.length} 章，已略過）`);
  }
}

if (!argv.list) {
  console.log(`\n完成：${grandTotal} 章 → ${path.relative(ROOT, OUT_ROOT)}/`);
}
