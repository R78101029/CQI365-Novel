/**
 * rehype-chapter-images
 *
 * 章節內文圖片的效能修補。Astro 不會自動幫 markdown 圖片加任何屬性，
 * 結果是整本書的插圖在開頁時一次全抓（摺痕 30 張 = 5.8 MB），
 * 而且每張圖載入完成都會改變版面高度，逼瀏覽器對整份長文件重新排版。
 *
 * 這個 plugin 對每張內文圖片補上：
 *   - loading="lazy"      捲到附近才抓
 *   - decoding="async"    解碼不擋主執行緒
 *   - width / height      從檔案標頭讀真實尺寸，讓瀏覽器預留空間、不再跳版
 *
 * 兩種來源都要處理：
 *   - markdown 的 ![](...)      → hast element 節點
 *   - 直接寫在 markdown 裡的 <img> → raw 節點（盲軌用這種寫法）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "..", "public");

const sizeCache = new Map();

// --- 影像標頭解析（不引入相依套件；站上素材目前全是 JPG）-------------------

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xff) { i++; continue; }
    // 無長度欄位的獨立標記
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; }
    if (i + 4 > buf.length) break;
    const len = buf.readUInt16BE(i + 2);
    // SOF0-SOF15，扣掉 DHT(C4) / JPG(C8) / DAC(CC)
    const isSOF =
      marker >= 0xc0 && marker <= 0xcf &&
      marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      if (i + 9 > buf.length) break;
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    if (len < 2) break;
    i += 2 + len;
  }
  return null;
}

function pngSize(buf) {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function gifSize(buf) {
  if (buf.length < 10 || buf.subarray(0, 3).toString("ascii") !== "GIF") return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

export function readSize(src) {
  if (sizeCache.has(src)) return sizeCache.get(src);

  let result = null;
  // 只處理站內絕對路徑；外部 URL 讀不到檔案
  if (src.startsWith("/") && !src.startsWith("//") && !/\.svg$/i.test(src)) {
    const file = path.join(PUBLIC_DIR, decodeURIComponent(src.split("?")[0]));
    try {
      if (fs.existsSync(file)) {
        const buf = fs.readFileSync(file);
        result = jpegSize(buf) || pngSize(buf) || gifSize(buf);
      }
    } catch {
      result = null;
    }
  }

  sizeCache.set(src, result);
  return result;
}

// --- plugin ----------------------------------------------------------------

export default function rehypeChapterImages() {
  return function transformer(tree) {
    walk(tree);
  };
}

function walk(node) {
  if (!node || typeof node !== "object") return;

  if (node.type === "element" && node.tagName === "img") {
    patchElement(node);
  } else if (node.type === "raw" && typeof node.value === "string" && node.value.includes("<img")) {
    node.value = patchRawHtml(node.value);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child);
  }
}

function patchElement(node) {
  const props = (node.properties ||= {});
  if (!props.loading) props.loading = "lazy";
  if (!props.decoding) props.decoding = "async";

  const src = typeof props.src === "string" ? props.src : null;
  if (!src || props.width || props.height) return;

  const dim = readSize(src);
  if (dim) {
    props.width = dim.width;
    props.height = dim.height;
  }
}

function patchRawHtml(html) {
  return html.replace(/<img\b([^>]*)>/gi, (tag, attrs) => {
    let out = attrs;
    if (!/\bloading\s*=/i.test(out)) out += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(out)) out += ' decoding="async"';

    if (!/\bwidth\s*=/i.test(out) && !/\bheight\s*=/i.test(out)) {
      const m = out.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
      const dim = m ? readSize(m[1]) : null;
      if (dim) out += ` width="${dim.width}" height="${dim.height}"`;
    }
    return `<img${out}>`;
  });
}
