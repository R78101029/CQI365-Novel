#!/usr/bin/env node
/**
 * remove-watermark.mjs
 *
 * 移除舊繪圖工具烙在右下角的生成浮水印（一顆四角星）。
 *
 * 背景：2040Iris 有一批 1600x872 的章首圖出自某個舊工具，每張右下角都被打了
 * 浮水印。那是已發布的書籍素材，不該掛著工具商標。實測位置固定：
 * 54x54 的方塊，距右緣與下緣各 37px。
 *
 * 作法：不裁切。取浮水印左邊同高的一塊當來源，羽化邊緣後蓋上去。
 * 這批圖的右下角幾乎都是地板、暗部或漸層，橫向取樣接得起來；
 * 真的接不好的個案再單獨處理。
 *
 * 用法：
 *   node scripts/remove-watermark.mjs <slug> --dry
 *   node scripts/remove-watermark.mjs <slug>
 *   node scripts/remove-watermark.mjs <slug> --size 1600x872   只處理指定尺寸
 *   node scripts/remove-watermark.mjs <slug> --only 2.07,3.02
 *
 * 原圖都在 git 裡，覆蓋後可用 git checkout 還原。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const require = createRequire(path.join(ROOT, "site", "package.json"));
const sharp = require("sharp");

const args = process.argv.slice(2);
const flag = (n) => args.includes("--" + n);
const val = (n, d) => {
  const i = args.indexOf("--" + n);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
const NAMED = ["size", "only"];
const slug = args.find(
  (a, i) => !a.startsWith("--") && !(i > 0 && NAMED.includes(args[i - 1].replace(/^--/, ""))),
);

if (!slug) {
  console.error("用法: node scripts/remove-watermark.mjs <slug> [--dry] [--size 1600x872] [--only 2.07,3.02]");
  process.exit(1);
}

const DRY = flag("dry");
const SIZE = val("size", "1600x872");
const ONLY = (val("only", "") || "").split(",").map((s) => s.trim()).filter(Boolean);

// 實測值（見檔頭）。距右緣/下緣的偏移是固定的，換尺寸時等比不成立，
// 所以只對已知尺寸動手，其他尺寸要先量過再加進來。
const BOXES = {
  "1600x872": { w: 54, h: 54, right: 37, bottom: 37 },
};

const dir = path.join(ROOT, "projects", slug, "_publish", "assets", "chapters");
if (!fs.existsSync(dir)) {
  console.error(`找不到 ${path.relative(ROOT, dir)}`);
  process.exit(1);
}

const box = BOXES[SIZE];
if (!box) {
  console.error(`沒有 ${SIZE} 的浮水印座標。已知：${Object.keys(BOXES).join(", ")}`);
  process.exit(1);
}

/** 羽化的橢圓遮罩：中心全不透明，邊緣漸淡，接縫才不會出現硬邊。 */
function featherMask(w, h) {
  const buf = Buffer.alloc(w * h);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot((x - cx) / cx, (y - cy) / cy); // 0 = 中心, 1 = 邊緣
      // 0.55 以內全遮，之後平滑收尾
      const a = d <= 0.55 ? 1 : d >= 1 ? 0 : 1 - (d - 0.55) / 0.45;
      buf[y * w + x] = Math.round(a * a * (3 - 2 * a) * 255); // smoothstep
    }
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
}

const PAD = 14; // 修補塊比浮水印大一圈，讓羽化有空間

const files = fs
  .readdirSync(dir)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort();

let done = 0;
let skipped = 0;

for (const f of files) {
  const key = f.replace(/-cover\.(jpe?g|png)$/i, "").replace(/\.(jpe?g|png)$/i, "");
  if (ONLY.length && !ONLY.includes(key) && !ONLY.includes(f)) continue;

  const p = path.join(dir, f);
  const buf = fs.readFileSync(p);
  const m = await sharp(buf).metadata();
  if (`${m.width}x${m.height}` !== SIZE) {
    skipped++;
    continue;
  }

  const pw = box.w + PAD * 2;
  const ph = box.h + PAD * 2;
  const left = m.width - box.right - box.w - PAD;
  const top = m.height - box.bottom - box.h - PAD;

  // 來源：浮水印左邊、同一條水平帶。往左讓一整塊寬度，避開浮水印本身。
  const srcLeft = Math.max(0, left - pw);

  if (DRY) {
    console.log(`  ${f}  修補 ${pw}x${ph} @ (${left},${top})  取樣自 x=${srcLeft}`);
    done++;
    continue;
  }

  const patch = await sharp(buf)
    .extract({ left: srcLeft, top, width: pw, height: ph })
    .blur(1.2)
    .png()
    .toBuffer();

  const mask = await featherMask(pw, ph);
  const masked = await sharp(patch)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const out = await sharp(buf)
    .composite([{ input: masked, left, top }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(p, out);
  console.log(`  ✓ ${f}  (${(out.length / 1024).toFixed(0)} KB)`);
  done++;
}

console.log(
  `\n${DRY ? "預演" : "完成"} ${done} 張${skipped ? `，略過 ${skipped} 張（尺寸不是 ${SIZE}）` : ""}。`,
);
if (!DRY && done) console.log("原圖在 git 裡，不滿意可 git checkout 還原。");
