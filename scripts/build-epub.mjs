#!/usr/bin/env node
/**
 * build-epub.mjs
 *
 * 統一 EPUB 3 builder。整合 _front_matter/、chapters/、_back_matter/
 * 並從 novels.config.json 讀取 metadata。
 *
 * 用法：
 *   node scripts/build-epub.mjs <slug>             # 單本
 *   node scripts/build-epub.mjs --all              # 所有非 draft 小說
 *   node scripts/build-epub.mjs <slug> --validate  # 產出後跑 epubcheck
 *   node scripts/build-epub.mjs <slug> -o <path>   # 自訂輸出路徑
 *   node scripts/build-epub.mjs --help
 *
 * 輸出：_output/epub/<slug>.epub
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";
import minimist from "minimist";
import JSZip from "jszip";
import { marked } from "marked";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "novels.config.json");
const PROJECTS_DIR = path.join(ROOT, "projects");
const SITE_PUBLIC = path.join(ROOT, "site", "public");
const OUTPUT_DIR = path.join(ROOT, "_output", "epub");

const DEFAULT_AUTHOR = "林雨果（Hugo Lin）";
const DEFAULT_PUBLISHER = "獨立出版";
const DEFAULT_RIGHTS = "© 2026 林雨果（Hugo Lin）. All rights reserved.";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = minimist(process.argv.slice(2), {
  boolean: ["all", "validate", "help", "verbose"],
  alias: { o: "output", h: "help", v: "verbose" },
});

if (argv.help) {
  console.log(`Usage:
  node scripts/build-epub.mjs <slug>             單本
  node scripts/build-epub.mjs --all              所有非 draft 小說
  node scripts/build-epub.mjs <slug> --validate  跑 epubcheck（需另裝）
  node scripts/build-epub.mjs <slug> -o <path>   自訂輸出檔
  node scripts/build-epub.mjs --verbose          顯示詳細日誌
`);
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const slugArg = argv._[0];

let targets;
if (argv.all) {
  targets = config.novels.filter((n) => n.status !== "draft");
} else if (slugArg) {
  const found = config.novels.find((n) => n.slug === slugArg);
  if (!found) {
    console.error(`找不到小說：${slugArg}`);
    console.error(`可選：${config.novels.map((n) => n.slug).join(", ")}`);
    process.exit(1);
  }
  targets = [found];
} else {
  console.error("請指定 <slug> 或 --all。用 --help 看用法。");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = (...args) => argv.verbose && console.log(" ", ...args);

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function stripHtmlComments(s) {
  return s.replace(/<!--[\s\S]*?-->/g, "");
}

function isEffectivelyEmpty(body) {
  // body 已去除 frontmatter；若去掉 H1、HTML 註解、空白後仍有東西才算非空
  const stripped = stripHtmlComments(body)
    .replace(/^#\s+.*$/m, "") // 移除第一個 H1
    .trim();
  return stripped.length === 0;
}

function mdToXhtml(markdown) {
  // 移除 HTML 註解
  const cleaned = stripHtmlComments(markdown);
  // marked 預設 GFM；確保 XHTML 自封合
  return marked.parse(cleaned, { gfm: true, breaks: false });
}

function detectMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    }[ext] || "application/octet-stream"
  );
}

function todayIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

// ---------------------------------------------------------------------------
// 解析 isbn_application.md（取 description, keywords, isbn 號碼若有）
// ---------------------------------------------------------------------------

function parseIsbnApplication(novelDir) {
  const p = path.join(novelDir, "_meta", "isbn_application.md");
  const text = readIfExists(p);
  if (!text) return {};

  const sections = {};
  let current = null;
  let buf = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      if (current) sections[current] = buf.join("\n").trim();
      current = m[1];
      buf = [];
    } else if (current) {
      buf.push(line);
    }
  }
  if (current) sections[current] = buf.join("\n").trim();

  return {
    description: sections["本書簡介"] || sections["簡介"] || null,
    keywords: sections["建議關鍵詞"] || sections["關鍵詞"] || null,
    toc: sections["目次"] || null,
  };
}

function parseIsbnNumber(novelDir) {
  // 支援多種來源：_meta/isbn.json、_meta/isbn.txt
  const jsonPath = path.join(novelDir, "_meta", "isbn.json");
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    return data.epub || data.isbn || null;
  }
  const txtPath = path.join(novelDir, "_meta", "isbn.txt");
  if (fs.existsSync(txtPath)) {
    return fs.readFileSync(txtPath, "utf8").trim() || null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 找封面圖實體檔
// ---------------------------------------------------------------------------

function resolveCoverPath(novel) {
  // 1. novels.config.json coverUrl 是站台路徑（/assets/...），對應到 site/public
  if (novel.coverUrl) {
    const sitePath = path.join(SITE_PUBLIC, novel.coverUrl.replace(/^\//, ""));
    if (fs.existsSync(sitePath)) return sitePath;
    // 1b. 同名檔案在 projects/{slug}/_assets/* 下
    const basename = path.basename(novel.coverUrl);
    const searchDirs = [
      path.join(PROJECTS_DIR, novel.slug, "_assets"),
      path.join(PROJECTS_DIR, novel.slug, "_assets", "covers"),
      path.join(PROJECTS_DIR, novel.slug, "_assets", "chapters"),
      path.join(PROJECTS_DIR, novel.slug),
    ];
    for (const d of searchDirs) {
      const p = path.join(d, basename);
      if (fs.existsSync(p)) return p;
    }
  }
  // 2. 退而求其次：在常見位置找 Cover_* 或 cover_*
  const fallbackDirs = [
    path.join(PROJECTS_DIR, novel.slug, "_assets", "covers"),
    path.join(PROJECTS_DIR, novel.slug, "_assets"),
    path.join(PROJECTS_DIR, novel.slug, "_assets", "chapters"),
    path.join(PROJECTS_DIR, novel.slug),
  ];
  for (const d of fallbackDirs) {
    if (!fs.existsSync(d)) continue;
    const candidates = fs
      .readdirSync(d)
      .filter((f) => /^cover/i.test(f) && /\.(jpg|jpeg|png)$/i.test(f));
    if (candidates.length > 0) return path.join(d, candidates[0]);
  }
  return null;
}

// ---------------------------------------------------------------------------
// 章節插圖路徑解析（從 frontmatter cover 欄位）
// ---------------------------------------------------------------------------

function resolveChapterIllustration(novelDir, coverFilename) {
  if (!coverFilename) return null;
  const candidates = [
    path.join(novelDir, "_assets", "chapters", coverFilename),
    path.join(novelDir, "_assets", coverFilename),
    path.join(SITE_PUBLIC, "assets", path.basename(novelDir), "chapters", coverFilename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 讀取目錄下符合條件的 .md 檔（依檔名排序）
// ---------------------------------------------------------------------------

function readMdDir(dir, { includeReadme = false } = {}) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => includeReadme || f.toLowerCase() !== "readme.md")
    .sort()
    .map((f) => ({ name: f, path: path.join(dir, f) }));
}

// ---------------------------------------------------------------------------
// CSS（中文文學排版）
// ---------------------------------------------------------------------------

const BOOK_CSS = `@charset "utf-8";

body {
  font-family: "Noto Serif TC", "Source Han Serif TC", "PMingLiU", "MingLiU", serif;
  line-height: 1.85;
  margin: 5%;
  color: #222;
  font-size: 1em;
  text-align: justify;
}

h1 {
  text-align: center;
  margin: 1.5em 0 2em;
  font-size: 1.8em;
  letter-spacing: 0.15em;
  font-weight: normal;
  page-break-before: always;
  page-break-after: avoid;
  break-before: page;
  break-after: avoid;
}

h2 {
  margin: 2.2em 0 1em;
  font-size: 1.3em;
  text-align: center;
  font-weight: normal;
  letter-spacing: 0.08em;
  color: #444;
}

h3 {
  margin: 1.8em 0 0.8em;
  font-size: 1.1em;
  text-align: center;
  font-weight: normal;
  color: #555;
}

p {
  margin: 0 0 0.5em 0;
  text-indent: 2em;
}

blockquote {
  margin: 1.2em 1.5em;
  color: #555;
  border-left: 3px solid #ccc;
  padding-left: 1em;
  font-style: italic;
}

blockquote p { text-indent: 0; }

hr {
  border: 0;
  text-align: center;
  margin: 2em 0;
  page-break-after: avoid;
}

hr:after {
  content: "* * *";
  letter-spacing: 0.6em;
  color: #aaa;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
}

ul, ol {
  margin: 0.5em 0 0.5em 2em;
}

li { margin: 0.2em 0; }

em { font-style: italic; }
strong { font-weight: bold; letter-spacing: 0.05em; }

/* 特殊頁型 */
.cover-page { margin: 0; padding: 0; text-align: center; }
.cover-page img { max-width: 100%; max-height: 100vh; margin: 0; }

.title-page {
  text-align: center;
  margin-top: 25%;
}
.title-page h1 {
  font-size: 2.4em;
  letter-spacing: 0.3em;
  margin: 0 0 0.5em;
  page-break-before: avoid;
}
.title-page .subtitle {
  font-size: 1em;
  color: #666;
  letter-spacing: 0.15em;
  margin-top: 1em;
}
.title-page .author {
  margin-top: 6em;
  font-size: 0.95em;
  color: #888;
  letter-spacing: 0.1em;
}

.epigraph {
  font-style: italic;
  text-align: center;
  margin: 6em 2em;
  color: #555;
}
.epigraph p { text-indent: 0; }
.epigraph .source {
  margin-top: 1em;
  font-size: 0.9em;
  color: #888;
  font-style: normal;
}

.dedication {
  text-align: center;
  margin-top: 30%;
  color: #555;
  font-style: italic;
}
.dedication p { text-indent: 0; }

.chapter-illustration {
  text-align: center;
  margin: 1.5em 0 2em;
  page-break-after: avoid;
}
.chapter-illustration img {
  max-width: 90%;
  margin: 0 auto;
}

nav#toc ol { list-style: none; padding: 0; }
nav#toc li { margin: 0.4em 0; text-indent: 0; }
nav#toc a { text-decoration: none; color: #333; }
`;

// ---------------------------------------------------------------------------
// XHTML 模板
// ---------------------------------------------------------------------------

function xhtmlPage({ title, body, bodyClass = "" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh-TW" lang="zh-TW">
<head>
<meta charset="utf-8"/>
<title>${escapeXml(title)}</title>
<link rel="stylesheet" type="text/css" href="style/book.css"/>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
${body}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// 主要建構流程
// ---------------------------------------------------------------------------

async function buildEpub(novel) {
  console.log(`\n📖 [${novel.slug}] ${novel.title}`);
  const novelDir = path.join(PROJECTS_DIR, novel.slug);
  if (!fs.existsSync(novelDir)) {
    console.error(`  ✗ 專案目錄不存在：${novelDir}`);
    return false;
  }

  const isbnData = parseIsbnApplication(novelDir);
  const isbn = parseIsbnNumber(novelDir);
  const author = novel.author || DEFAULT_AUTHOR;
  const description = novel.description || isbnData.description || "";
  const keywords = (isbnData.keywords || (novel.tags || []).join(";"))
    .split(/[;,，；]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const uid = isbn ? `urn:isbn:${isbn}` : `urn:uuid:cqi365-${novel.slug.toLowerCase()}`;
  if (!isbn) console.log(`  ⚠️  無 ISBN，使用 URN：${uid}`);
  else console.log(`  ✓ ISBN：${isbn}`);

  const zip = new JSZip();

  // mimetype 必須第一個、不壓縮
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // META-INF/container.xml
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`,
  );

  const oebps = zip.folder("OEBPS");
  oebps.file("style/book.css", BOOK_CSS);

  const manifest = []; // {id, href, mediaType, properties?}
  const spine = []; // [id, ...]
  const navItems = []; // {label, href}
  const addedImages = new Map(); // absPath → {id, href, mediaType}

  // ----- 封面 -----
  const coverPath = resolveCoverPath(novel);
  let coverImageHref = null;
  if (coverPath) {
    const ext = path.extname(coverPath);
    const coverFilename = `images/cover${ext}`;
    oebps.file(coverFilename, fs.readFileSync(coverPath));
    coverImageHref = coverFilename;
    manifest.push({
      id: "cover-image",
      href: coverFilename,
      mediaType: detectMime(coverPath),
      properties: "cover-image",
    });
    log(`封面：${path.relative(ROOT, coverPath)}`);

    // cover.xhtml
    const coverXhtml = xhtmlPage({
      title: "Cover",
      bodyClass: "cover-page",
      body: `<div><img src="${coverFilename}" alt="${escapeXml(novel.title)}"/></div>`,
    });
    oebps.file("cover.xhtml", coverXhtml);
    manifest.push({ id: "cover-page", href: "cover.xhtml", mediaType: "application/xhtml+xml" });
    spine.push("cover-page");
  } else {
    console.log(`  ⚠️  找不到封面圖`);
  }

  // ----- 內部書名頁 -----
  const titlePageBody = `<div>
  <h1>${escapeXml(novel.title)}</h1>
  ${novel.titleEn && novel.titleEn !== novel.title ? `<p class="subtitle">${escapeXml(novel.titleEn)}</p>` : ""}
  <p class="author">${escapeXml(author)}</p>
</div>`;
  oebps.file(
    "title.xhtml",
    xhtmlPage({ title: novel.title, body: titlePageBody, bodyClass: "title-page" }),
  );
  manifest.push({ id: "title-page", href: "title.xhtml", mediaType: "application/xhtml+xml" });
  spine.push("title-page");

  // ----- 處理 markdown 檔的共用函式 -----
  const sectionCounters = {};
  function processMdFile({ file, idPrefix, navLabel, sectionClass = "" }) {
    const raw = fs.readFileSync(file.path, "utf8");
    const { data: fm, content } = matter(raw);

    if (isEffectivelyEmpty(content)) {
      log(`跳過空白：${path.relative(ROOT, file.path)}`);
      return null;
    }
    sectionCounters[idPrefix] = (sectionCounters[idPrefix] || 0) + 1;
    const seq = String(sectionCounters[idPrefix]).padStart(2, "0");

    // 章節插圖（frontmatter cover）
    let illustrationHtml = "";
    if (fm.cover) {
      const ill = resolveChapterIllustration(novelDir, fm.cover);
      if (ill) {
        const imgFilename = `images/${path.basename(ill)}`;
        if (!addedImages.has(ill)) {
          oebps.file(imgFilename, fs.readFileSync(ill));
          const imgId = `img-${addedImages.size + 1}`;
          addedImages.set(ill, { id: imgId, href: imgFilename, mediaType: detectMime(ill) });
          manifest.push({ id: imgId, href: imgFilename, mediaType: detectMime(ill) });
        }
        illustrationHtml = `<div class="chapter-illustration"><img src="${imgFilename}" alt=""/></div>\n`;
      }
    }

    // 處理 inline markdown 圖
    const processedMd = content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (m, alt, rel) => {
        let imgPath = null;
        if (rel.startsWith("../")) {
          imgPath = path.normalize(path.join(path.dirname(file.path), rel));
        } else if (path.isAbsolute(rel)) {
          imgPath = rel;
        } else {
          imgPath = path.join(path.dirname(file.path), rel);
        }
        if (!fs.existsSync(imgPath)) return ""; // 找不到就移除
        const imgFilename = `images/${path.basename(imgPath)}`;
        if (!addedImages.has(imgPath)) {
          oebps.file(imgFilename, fs.readFileSync(imgPath));
          const imgId = `img-${addedImages.size + 1}`;
          addedImages.set(imgPath, { id: imgId, href: imgFilename, mediaType: detectMime(imgPath) });
          manifest.push({ id: imgId, href: imgFilename, mediaType: detectMime(imgPath) });
        }
        return `![${alt}](${imgFilename})`;
      },
    );

    const html = mdToXhtml(processedMd);
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    const pageTitle = fm.title || (titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "") : navLabel);

    const id = `${idPrefix}-${seq}`;
    const href = `${idPrefix}-${seq}.xhtml`;

    oebps.file(
      href,
      xhtmlPage({
        title: pageTitle,
        bodyClass: sectionClass,
        body: illustrationHtml + html,
      }),
    );
    manifest.push({ id, href, mediaType: "application/xhtml+xml" });
    spine.push(id);
    navItems.push({ label: pageTitle, href });
    return { id, href, title: pageTitle };
  }

  // ----- _front_matter -----
  const frontDir = path.join(novelDir, "_front_matter");
  for (const f of readMdDir(frontDir)) {
    const sectionMap = {
      "01-epigraph.md": { label: "題詞", class: "epigraph" },
      "02-dedication.md": { label: "獻詞", class: "dedication" },
      "03-preface.md": { label: "自序", class: "" },
    };
    const meta = sectionMap[f.name] || { label: f.name.replace(/\.md$/, ""), class: "" };
    if (f.name.startsWith("04-foreword")) {
      meta.label = "推薦序";
    }
    processMdFile({
      file: f,
      idPrefix: "front",
      navLabel: meta.label,
      sectionClass: meta.class,
    });
  }

  // ----- chapters -----
  const chaptersDir = path.join(novelDir, "chapters");
  for (const f of readMdDir(chaptersDir)) {
    processMdFile({ file: f, idPrefix: "chap", navLabel: f.name });
  }

  // ----- _back_matter -----
  const backDir = path.join(novelDir, "_back_matter");
  for (const f of readMdDir(backDir)) {
    const sectionMap = {
      "01-afterword.md": { label: "後記" },
      "02-acknowledgments.md": { label: "致謝" },
      "03-about-the-author.md": { label: "關於作者" },
      "04-other-works.md": { label: "同作者作品" },
      "05-series-preview.md": { label: "系列預告" },
    };
    const meta = sectionMap[f.name] || { label: f.name.replace(/\.md$/, "") };
    processMdFile({
      file: f,
      idPrefix: "back",
      navLabel: meta.label,
    });
  }

  // ----- 版權頁（向下相容 _meta/colophon_draft.md） -----
  const colophon = path.join(novelDir, "_meta", "colophon_draft.md");
  if (fs.existsSync(colophon)) {
    processMdFile({
      file: { name: "colophon.md", path: colophon },
      idPrefix: "back",
      navLabel: "版權頁",
    });
  }

  // ----- nav.xhtml（EPUB 3）-----
  const navBody = `<nav id="toc" epub:type="toc">
  <h1>目次</h1>
  <ol>
${navItems.map((n) => `    <li><a href="${escapeXml(n.href)}">${escapeXml(n.label)}</a></li>`).join("\n")}
  </ol>
</nav>
<nav epub:type="landmarks" hidden="hidden">
  <h2>地標</h2>
  <ol>
${coverImageHref ? '    <li><a epub:type="cover" href="cover.xhtml">封面</a></li>' : ""}
    <li><a epub:type="titlepage" href="title.xhtml">書名頁</a></li>
${navItems[0] ? `    <li><a epub:type="bodymatter" href="${escapeXml(navItems[0].href)}">正文起點</a></li>` : ""}
  </ol>
</nav>`;
  oebps.file("nav.xhtml", xhtmlPage({ title: "目次", body: navBody }));
  manifest.push({
    id: "nav",
    href: "nav.xhtml",
    mediaType: "application/xhtml+xml",
    properties: "nav",
  });

  // ----- toc.ncx（向下相容 EPUB 2 reader）-----
  const ncxBody = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${escapeXml(uid)}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(novel.title)}</text></docTitle>
  <docAuthor><text>${escapeXml(author)}</text></docAuthor>
  <navMap>
${navItems
  .map(
    (n, i) => `    <navPoint id="navpoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(n.label)}</text></navLabel>
      <content src="${escapeXml(n.href)}"/>
    </navPoint>`,
  )
  .join("\n")}
  </navMap>
</ncx>
`;
  oebps.file("toc.ncx", ncxBody);
  manifest.push({ id: "ncx", href: "toc.ncx", mediaType: "application/x-dtbncx+xml" });

  // ----- CSS 進 manifest -----
  manifest.push({ id: "css", href: "style/book.css", mediaType: "text/css" });

  // ----- content.opf -----
  const metadataXml = [
    `<dc:identifier id="bookid">${escapeXml(uid)}</dc:identifier>`,
    `<dc:title>${escapeXml(novel.title)}</dc:title>`,
    novel.titleEn && novel.titleEn !== novel.title
      ? `<dc:title id="title-en" xml:lang="en">${escapeXml(novel.titleEn)}</dc:title>`
      : null,
    `<dc:creator>${escapeXml(author)}</dc:creator>`,
    `<dc:language>zh-TW</dc:language>`,
    `<dc:publisher>${escapeXml(novel.publisher || DEFAULT_PUBLISHER)}</dc:publisher>`,
    `<dc:date>${escapeXml(novel.date || new Date().toISOString().slice(0, 10))}</dc:date>`,
    description ? `<dc:description>${escapeXml(description)}</dc:description>` : null,
    novel.genre ? `<dc:subject>${escapeXml(novel.genre)}</dc:subject>` : null,
    ...keywords.map((k) => `<dc:subject>${escapeXml(k)}</dc:subject>`),
    `<dc:rights>${escapeXml(novel.rights || DEFAULT_RIGHTS)}</dc:rights>`,
    `<meta property="dcterms:modified">${todayIso()}</meta>`,
    coverImageHref ? `<meta name="cover" content="cover-image"/>` : null,
  ]
    .filter(Boolean)
    .map((line) => "    " + line)
    .join("\n");

  const manifestXml = manifest
    .map(
      (m) =>
        `    <item id="${escapeXml(m.id)}" href="${escapeXml(m.href)}" media-type="${escapeXml(m.mediaType)}"${m.properties ? ` properties="${escapeXml(m.properties)}"` : ""}/>`,
    )
    .join("\n");

  const spineXml = spine
    .map((id) => `    <itemref idref="${escapeXml(id)}"/>`)
    .join("\n");

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="zh-TW">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
${metadataXml}
  </metadata>
  <manifest>
${manifestXml}
  </manifest>
  <spine toc="ncx">
${spineXml}
  </spine>
</package>
`;
  oebps.file("content.opf", opf);

  // ----- 輸出 -----
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = argv.output || path.join(OUTPUT_DIR, `${novel.slug}.epub`);
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  fs.writeFileSync(outputPath, buffer);

  const sizeKB = (buffer.length / 1024).toFixed(1);
  console.log(`  ✓ ${path.relative(ROOT, outputPath)} (${sizeKB} KB)`);
  console.log(`    章節 ${navItems.length} 篇 / 圖片 ${addedImages.size + (coverImageHref ? 1 : 0)} 張`);

  if (argv.validate) {
    runEpubcheck(outputPath);
  }

  return outputPath;
}

// ---------------------------------------------------------------------------
// epubcheck（可選；需另裝）
// ---------------------------------------------------------------------------

function runEpubcheck(epubPath) {
  console.log(`  → 執行 epubcheck...`);
  const candidates = ["epubcheck", "java"];
  let cmd, args;
  try {
    execSync("which epubcheck", { stdio: "ignore" });
    cmd = "epubcheck";
    args = [epubPath];
  } catch {
    console.log(`  ⚠️  epubcheck 未安裝。可透過：brew install epubcheck 或 npm i -g epubcheck`);
    return;
  }
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status === 0) console.log(`  ✓ epubcheck 通過`);
  else console.log(`  ✗ epubcheck 有警告 / 錯誤`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  let okCount = 0;
  for (const novel of targets) {
    try {
      const result = await buildEpub(novel);
      if (result) okCount++;
    } catch (err) {
      console.error(`  ✗ ${novel.slug} 失敗：${err.message}`);
      if (argv.verbose) console.error(err.stack);
    }
  }
  console.log(`\n完成：成功 ${okCount} / ${targets.length} 本`);
})();
