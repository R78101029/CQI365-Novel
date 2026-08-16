#!/usr/bin/env node
/**
 * build-cover.mjs
 *
 * 從底圖 + 文字資訊產出正式書封面 (1600x2400, 300dpi-ready)。
 * 底圖保持無文字，HTML 模板疊上 標題 + subtitle + 作者名，Playwright 截圖輸出。
 *
 * 用法：
 *   node scripts/build-cover.mjs <slug>       # 單本
 *   node scripts/build-cover.mjs --all        # 所有有底圖的小說
 *   node scripts/build-cover.mjs --preview    # 只產 HTML 不截圖（用瀏覽器預覽）
 *
 * 底圖來源：projects/{slug}/_publish/assets/covers/cover-bg.{png|jpg}
 * 若不存在則使用 cover.{png|jpg} 作為底圖。
 *
 * 輸出：
 *   projects/{slug}/_publish/assets/covers/cover.png  (覆寫)
 *   site/public/assets/{slug}/covers/cover.png        (同步)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "novels.config.json");
const TEMPLATE_PATH = path.join(__dirname, "cover-template.html");

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

// Subtitle map — edit here to change subtitles
const SUBTITLES = {
  BlindOrbit: "當世界失去連線",
  "2040Iris": "AI 驚悚三部曲",
  TheCrease: "四條時間線·一道褶痕",
  LostInRetrospect: "三世輪迴·同一張婚床",
  FrozenInForesight: "她從頭到尾都知道",
  "3-07AM": "一個男人·一台機器·一整夜",
  HalfFinished: "房子可以賣了。她還沒簽。",
  NotWavingButDrowning: "她沒有在揮手",
  WhiteDewOnTheReeds: "數位靈魂考古",
};

const args = process.argv.slice(2);
const doAll = args.includes("--all");
const previewOnly = args.includes("--preview");
const slugArg = args.find((a) => !a.startsWith("--"));

function findBgImage(slug) {
  const coversDir = path.join(ROOT, "projects", slug, "_publish", "assets", "covers");
  // Prefer cover-bg.* (dedicated background without text)
  for (const ext of ["png", "jpg", "jpeg"]) {
    const p = path.join(coversDir, `cover-bg.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  // Fallback to cover.* (current cover, may have AI-generated text)
  for (const ext of ["png", "jpg", "jpeg"]) {
    const p = path.join(coversDir, `cover.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function buildHtml(novel, bgPath) {
  const bgUrl = "file:///" + bgPath.replace(/\\/g, "/");
  // novels.config.json 的 subtitle 優先，其次才是本檔的對照表
  const subtitle = novel.subtitle || SUBTITLES[novel.slug] || "";

  return template
    .replace("BG_IMAGE_URL", bgUrl)
    .replace("TITLE_ZH", novel.title)
    .replace("TITLE_EN", novel.titleEn || "")
    .replace("SUBTITLE", subtitle);
}

async function buildCover(novel) {
  const bgPath = findBgImage(novel.slug);
  if (!bgPath) {
    console.log(`  [${novel.slug}] skip: no background image found`);
    return null;
  }

  const html = buildHtml(novel, bgPath);
  const tmpHtml = path.join(ROOT, "_output", `_cover_${novel.slug}.html`);
  fs.mkdirSync(path.dirname(tmpHtml), { recursive: true });
  fs.writeFileSync(tmpHtml, html, "utf8");

  if (previewOnly) {
    console.log(`  [${novel.slug}] preview: ${tmpHtml}`);
    return tmpHtml;
  }

  // Playwright screenshot
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 2400 } });
  await page.goto("file:///" + tmpHtml.replace(/\\/g, "/"), { waitUntil: "networkidle" });

  // Output paths
  const srcOut = path.join(ROOT, "projects", novel.slug, "_publish", "assets", "covers", "cover.png");
  const pubOut = path.join(ROOT, "site", "public", "assets", novel.slug, "covers", "cover.png");
  fs.mkdirSync(path.dirname(srcOut), { recursive: true });
  fs.mkdirSync(path.dirname(pubOut), { recursive: true });

  await page.screenshot({ path: srcOut, fullPage: false });
  fs.copyFileSync(srcOut, pubOut);

  await page.close();
  await browser.close();

  // Clean up temp HTML
  fs.unlinkSync(tmpHtml);

  const sizeKB = (fs.statSync(srcOut).size / 1024).toFixed(0);
  console.log(`  [${novel.slug}] ${novel.title} -> cover.png (1600x2400, ${sizeKB}KB)`);
  return srcOut;
}

// Main
const targets = doAll
  ? config.novels.filter((n) => findBgImage(n.slug))
  : slugArg
    ? config.novels.filter((n) => n.slug === slugArg)
    : [];

if (!targets.length) {
  if (slugArg) {
    console.error(`找不到小說 ${slugArg} 或其沒有底圖。`);
    console.error(`底圖應放在: projects/${slugArg}/_publish/assets/covers/cover-bg.{png|jpg}`);
  } else {
    console.error("Usage: node scripts/build-cover.mjs <slug> | --all [--preview]");
  }
  process.exit(1);
}

console.log(`Building covers for ${targets.length} novel(s)...`);
for (const novel of targets) {
  await buildCover(novel);
}
console.log("Done.");
