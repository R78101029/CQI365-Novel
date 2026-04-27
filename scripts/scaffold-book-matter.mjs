#!/usr/bin/env node
/**
 * scaffold-book-matter.mjs
 *
 * 為每部小說建立商業出版所需的「書前內容」(_front_matter) 與
 * 「書後內容」(_back_matter) 結構與空白模板。
 *
 * 用法：
 *   node scripts/scaffold-book-matter.mjs            # 為所有小說建立
 *   node scripts/scaffold-book-matter.mjs <slug>     # 只為指定小說建立
 *   node scripts/scaffold-book-matter.mjs --force    # 覆寫已存在的模板
 *
 * 安全保證：
 *   - 預設不覆寫已存在的檔案（保護你寫過的內容）
 *   - 只建立模板骨架，實際內容由作者填入
 *   - 不會動到 chapters/ 或其他既有檔案
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "novels.config.json");
const PROJECTS_DIR = path.join(ROOT, "projects");

const args = process.argv.slice(2);
const force = args.includes("--force");
const targetSlug = args.find((a) => !a.startsWith("--"));

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const author = config.site?.author || "CQI365";

const novels = targetSlug
  ? config.novels.filter((n) => n.slug === targetSlug)
  : config.novels;

if (novels.length === 0) {
  console.error(`找不到小說：${targetSlug}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 模板定義
// ---------------------------------------------------------------------------

const fm = (type, novel, extra = "") =>
  `---
type: ${type}
novel: ${novel.slug}
title: ${novel.title}
author: ${author}
status: draft
${extra}---

`;

const FRONT_README = (novel) => `# 書前內容（Front Matter）— ${novel.title}

商業出版書籍正文之前的標準結構，依下列順序排列於 EPUB / 紙本：

| # | 檔案 | 用途 | 必要性 |
|---|------|------|--------|
| 1 | \`01-epigraph.md\` | 題詞（書前一段詩 / 引文 / 哲思） | 選填 |
| 2 | \`02-dedication.md\` | 獻詞（短句，例如「獻給某人」） | 選填 |
| 3 | \`03-preface.md\` | **自序 / 創作緣起**（作者親筆） | **建議** |
| 4 | \`04-foreword.md\` | 推薦序（邀請他人撰寫，可有多篇） | 加分項 |

> **書名頁與版權頁**由 \`isbn_batch\` skill 另行產出（\`_output/isbn_batch/\`），
> 不放在本目錄。
>
> 不需要的檔案可保留為空白（產出 EPUB 時會自動略過）。
`;

const BACK_README = (novel) => `# 書後內容（Back Matter）— ${novel.title}

商業出版書籍正文之後的標準結構：

| # | 檔案 | 用途 | 必要性 |
|---|------|------|--------|
| 1 | \`01-afterword.md\` | **後記 / 寫作筆記**（創作幕後、研究過程） | **建議** |
| 2 | \`02-acknowledgments.md\` | 致謝 | 建議 |
| 3 | \`03-about-the-author.md\` | **作者簡介** | **必要** |
| 4 | \`04-other-works.md\` | 同作者其他作品列表 | 建議 |
| 5 | \`05-series-preview.md\` | 系列預告 / 下集試讀 | 系列作必要 |

> 不需要的檔案可保留為空白（產出 EPUB 時會自動略過）。
`;

const FRONT_TEMPLATES = {
  "01-epigraph.md": (novel) =>
    fm("epigraph", novel) +
    `# 題詞

<!--
書前一段引文，建議 2~6 行。可選自：
  - 既有詩詞 / 名言（記得標註出處）
  - 本書內某句台詞或敘述（自我引用）
  - 與主題呼應的歌詞 / 哲學文本

範例：
> 當凝視深淵的時候，深淵也凝視著你。
> ——尼采，《善惡的彼岸》
-->
`,

  "02-dedication.md": (novel) =>
    fm("dedication", novel) +
    `# 獻詞

<!--
一句話的奉獻，獨立成頁。常見格式：
  獻給 ___
  For ___
  To ___

範例：
  獻給所有在資訊黑暗中仍試圖看見彼此的人。
-->
`,

  "03-preface.md": (novel) =>
    fm("preface", novel) +
    `# 自序

<!--
作者親筆的開場白，建議 800~2000 字，可包含：

1. 創作緣起：為什麼想寫這本書？最初的觸發點是什麼？
2. 核心關懷：你想透過這部作品討論什麼問題？
3. 研究與田野：寫作過程中接觸了哪些素材 / 訪談 / 文獻？
4. 給讀者的話：希望讀者帶著什麼樣的心情閱讀？

注意：
  - 自序是讀者進入正文前的「最後一道門」，定調整本書的氣味
  - 避免劇透
  - 避免過度自謙或過度宣傳
-->
`,

  "04-foreword.md": (novel) =>
    fm("foreword", novel, "by: \nrelation: \n") +
    `# 推薦序

<!--
邀請他人撰寫的推薦文，可有多篇（複製本檔案改名 04-foreword-2.md 等）。

候選人方向（依本書類型挑選）：
  - 同領域作家
  - 評論者 / 文學研究者
  - 該題材的專業人士（例如軍事顧問、AI 研究員、心理師）

邀請信建議內容：
  - 附上本書一頁簡介 + 樣章 1~2 章
  - 建議字數（500~1500 字）
  - 給予截稿日（一個月為宜）
  - 說明會如何標註其姓名 / 頭銜

填寫 frontmatter 的 by: 與 relation: 欄位以記錄推薦者身份。
-->
`,
};

const BACK_TEMPLATES = {
  "01-afterword.md": (novel) =>
    fm("afterword", novel) +
    `# 後記

<!--
作者的寫作後記，建議 1000~3000 字，可包含：

1. 寫作歷程：這本書寫了多久？經過哪些版本？
2. 取材與考據：哪些細節有所本？哪些是虛構？
3. 角色背後：某個角色的原型 / 靈感來源
4. 沒寫進去的東西：原本想寫但割捨的支線
5. 對讀者問題的預先回應：如果讀者讀完會困惑什麼，這裡可以解答

後記比自序更私人、更鬆弛，適合放幕後故事。
-->
`,

  "02-acknowledgments.md": (novel) =>
    fm("acknowledgments", novel) +
    `# 致謝

<!--
感謝協助本書完成的人事物。建議分組列出：

## 內容協助
  - 取材對象 / 受訪者
  - 專業顧問
  - 試讀者與意見回饋者

## 出版協助
  - 編輯
  - 設計師
  - 行銷

## 私人感謝
  - 家人 / 伴侶 / 朋友

## 工具與環境
  - AI 工具（如本書創作過程使用了 Claude / Gemini 等）
  - 寫作期間的咖啡店 / 駐村場所

注意：
  - 寫真名前先取得對方同意
  - 順序通常依「對本書貢獻度」而非親疏
-->
`,

  "03-about-the-author.md": (novel) =>
    fm("about_author", novel) +
    `# 關於作者

<!--
標準作者簡介，建議 100~300 字。出版社 / 平台會直接抓這段去用。

建議結構：
  1. 一句話定位（你是誰、寫什麼）
  2. 背景與資歷（學經歷 / 專業）
  3. 已出版作品列表（可省略，因為 04-other-works.md 會列）
  4. 創作關懷（核心題材 / 風格）
  5. 聯絡方式或網站

範例骨架：
  ${author}，台灣作家，專注於 ___ 題材。
  曾於 ___ 任職，作品融合 ___ 與 ___。
  著有《___》、《___》。
  個人網站：https://___
-->
`,

  "04-other-works.md": (novel) =>
    fm("other_works", novel) +
    `# 同作者作品

<!--
列出 ${author} 其他已出版 / 連載中的作品。

建議格式（依類型分組）：

## 軍事驚悚
- **《盲軌：2028》** — 當量子攻擊癱瘓全球通訊…

## 科幻
- **《2040IRIS》** — 三部曲。在透明的監視與隱蔽的權力之間…
- **《摺痕》** — 四條橫跨兩千年的時間線…

## 文學
- **《白露未晞》** — 三世輪迴·同一張婚床…
- （依此類推）

注意：
  - 同步從 novels.config.json 取資料以保持一致
  - 上架後可加 ASIN / ISBN / 平台連結
-->
`,

  "05-series-preview.md": (novel) =>
    fm("series_preview", novel) +
    `# 系列預告 / 下集試讀

<!--
僅適用於系列作（多本一系列、三部曲等）。單本作品可刪除此檔。

本作所屬系列：
  ${
    novel.parts && novel.parts.some((p) => p.book)
      ? "（自動偵測：本作為多書系列）"
      : "（請確認本作是否屬於系列）"
  }

建議內容：
  1. 系列總覽（有幾本、各本標題、出版進度）
  2. 下集導讀（200~500 字介紹）
  3. 下集試讀（第一章前 1500~2500 字）
  4. 預計上市時間

放在書末是「轉換漏斗」最有效的位置：讀完本書的人最有可能買下集。
-->
`,
};

// ---------------------------------------------------------------------------
// 執行
// ---------------------------------------------------------------------------

function writeIfAbsent(filePath, content) {
  if (fs.existsSync(filePath) && !force) {
    return { status: "skip", path: filePath };
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return { status: force && fs.existsSync(filePath) ? "overwrite" : "create", path: filePath };
}

const stats = { create: 0, skip: 0, overwrite: 0 };

for (const novel of novels) {
  const novelDir = path.join(PROJECTS_DIR, novel.slug);
  if (!fs.existsSync(novelDir)) {
    console.warn(`  ! 跳過 ${novel.slug}（目錄不存在）`);
    continue;
  }

  console.log(`\n[${novel.slug}] ${novel.title}`);

  const frontDir = path.join(novelDir, "_front_matter");
  const backDir = path.join(novelDir, "_back_matter");

  // README
  for (const [dir, readme] of [
    [frontDir, FRONT_README(novel)],
    [backDir, BACK_README(novel)],
  ]) {
    const result = writeIfAbsent(path.join(dir, "README.md"), readme);
    stats[result.status]++;
    console.log(`  ${result.status === "create" ? "+" : "·"} ${path.relative(ROOT, result.path)}`);
  }

  // Front matter
  for (const [name, render] of Object.entries(FRONT_TEMPLATES)) {
    const result = writeIfAbsent(path.join(frontDir, name), render(novel));
    stats[result.status]++;
    console.log(`  ${result.status === "create" ? "+" : "·"} ${path.relative(ROOT, result.path)}`);
  }

  // Back matter
  for (const [name, render] of Object.entries(BACK_TEMPLATES)) {
    const result = writeIfAbsent(path.join(backDir, name), render(novel));
    stats[result.status]++;
    console.log(`  ${result.status === "create" ? "+" : "·"} ${path.relative(ROOT, result.path)}`);
  }
}

console.log(
  `\n完成：建立 ${stats.create} 個檔案，跳過 ${stats.skip} 個（已存在），覆寫 ${stats.overwrite} 個。`,
);
if (stats.skip > 0 && !force) {
  console.log(`提示：使用 --force 可覆寫已存在的模板。`);
}
