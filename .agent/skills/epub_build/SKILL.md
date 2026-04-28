---
name: epub_build
description: |
  打包 EPUB 3 電子書供 Readmoo / Google Play Books / Kobo 等平台上架。
  當使用者問「壓 EPUB」「產 EPUB」「打包電子書」「上架前打包」「epub」
  或要把寫好的小說輸出成電子書檔時，呼叫 `scripts/build-epub.mjs`。
  **不要自己手刻 EPUB**，用此腳本以保證 metadata、CSS、結構口徑一致。
---

# EPUB Build Skill

本 Skill 提供小說打包成 EPUB 3 電子書的**標準呼叫方式**。

腳本：`scripts/build-epub.mjs`

---

## 🎯 何時使用

使用者說出以下任一關鍵字時自動調用：

- 壓 EPUB / 產 EPUB / 打包 EPUB
- 上架前打包 / 上架 Readmoo / 上架 Google Play Books / 上架 Kobo
- 電子書 / e-book / 出書檔
- 「幫我把 ___ 變成 EPUB」

---

## 🛠️ 用法

### 單本

```bash
node scripts/build-epub.mjs <slug>
```

例：`node scripts/build-epub.mjs LostInRetrospect`

### 全部（自動跳過 status: draft 的小說）

```bash
node scripts/build-epub.mjs --all
```

### 加跑 epubcheck 驗證

```bash
node scripts/build-epub.mjs <slug> --validate
```

需另裝 `epubcheck`（Mac: `brew install epubcheck`；Linux: `apt install epubcheck`）。

### 詳細日誌

```bash
node scripts/build-epub.mjs <slug> --verbose
```

### 自訂輸出檔

```bash
node scripts/build-epub.mjs <slug> -o /tmp/my.epub
```

### 看完整參數

```bash
node scripts/build-epub.mjs --help
```

---

## 📦 輸出位置

預設：`_output/epub/{slug}.epub`

該目錄已加入 `.gitignore`（產出物不入版本控制）。

---

## 🧱 EPUB 內部結構

腳本依下列順序組裝：

```
mimetype                          ← 必為第一個、未壓縮
META-INF/container.xml
OEBPS/
├── content.opf                   ← metadata + manifest + spine
├── toc.ncx                       ← 向下相容 EPUB 2 reader
├── nav.xhtml                     ← EPUB 3 目次 + landmarks
├── cover.xhtml                   ← 封面頁
├── title.xhtml                   ← 內部書名頁
├── front-01.xhtml ~ front-NN.xhtml   ← 自序、題詞、獻詞、推薦序
├── chap-01.xhtml ~ chap-NN.xhtml     ← 正文章節
├── back-01.xhtml ~ back-NN.xhtml     ← 後記、致謝、作者簡介、系列預告
├── style/book.css
└── images/cover.{jpg|png}, ...
```

### 內容來源（依優先序）

| 內容 | 來源 |
|---|---|
| 標題 / 副標 / 描述 / tags | `novels.config.json` |
| 描述（覆寫）/ 關鍵詞 | `projects/{slug}/_meta/isbn_application.md`「本書簡介」「建議關鍵詞」section |
| ISBN | `projects/{slug}/_meta/isbn.json`（`{"epub": "978-..."}`）或 `_meta/isbn.txt` |
| 封面圖 | `coverUrl` → `site/public/{path}`，找不到則 fallback 到 `projects/{slug}/_publish/assets/covers/` 等 |
| 書前內容 | `projects/{slug}/_publish/front_matter/*.md`（依檔名排序） |
| 章節 | `projects/{slug}/chapters/*.md`（依檔名排序） |
| 章節插圖 | 章節 frontmatter 的 `cover:` 欄位 |
| 書後內容 | `projects/{slug}/_publish/back_matter/*.md`（依檔名排序） |
| 版權頁（向下相容） | `projects/{slug}/_meta/colophon_draft.md`（若存在則加在最後） |

### 空白檔案自動跳過

若 `_publish/front_matter/` 或 `_publish/back_matter/` 內某檔案在去除 frontmatter、HTML 註解、H1 後仍是空的，會自動跳過不放進 EPUB。這意味**模板可以先建好，內容慢慢填**。

---

## 🔑 ISBN 設定

預設使用 `urn:uuid:cqi365-{slug}` 作為 identifier。**正式上架前必須**填入真實 ISBN，做法：

```bash
echo "978-986-xxxxx-xx-x" > projects/{slug}/_meta/isbn.txt
```

或建立 JSON 區分電子書 / 紙本 ISBN：

```json
// projects/{slug}/_meta/isbn.json
{
  "epub": "978-986-xxxxx-xx-x",
  "print": "978-986-xxxxx-yy-y"
}
```

ISBN 申請流程見 `.agent/skills/isbn_batch/SKILL.md`。

---

## 🎨 中文文學排版

腳本內建 CSS（OEBPS/style/book.css）已處理：

- **字型 stack**：`Noto Serif TC, Source Han Serif TC, PMingLiU, MingLiU, serif`（不嵌入字型，由裝置決定）
- **行高 1.85**（中文閱讀建議值）
- **首行縮排 2em**（中文傳統，blockquote 與特殊頁型例外）
- **章節標題**：居中、`page-break-before: always`
- **場景分隔線 `hr`**：CSS 自動渲染為居中「* * *」
- **特殊頁型**：cover-page、title-page、epigraph、dedication 各有對應 class

如需客製 CSS，編輯 `scripts/build-epub.mjs` 中的 `BOOK_CSS` 常數。

---

## ✅ 上架前檢查清單

在按下平台上傳鍵之前：

- [ ] `node scripts/build-epub.mjs <slug> --validate` 通過 epubcheck
- [ ] ISBN 已填入 `_meta/isbn.txt` 或 `_meta/isbn.json`
- [ ] 至少完成 `_publish/front_matter/03-preface.md`（自序）
- [ ] 至少完成 `_publish/back_matter/03-about-the-author.md`（作者簡介）
- [ ] 封面圖尺寸至少 1600×2560（縱長），檔案 < 2MB
- [ ] 用 Apple Books / Calibre / Sigil 預覽過實際章節分頁
- [ ] `dc:description` 是讀者導向的行銷文案，不是 `_CONTEXT.md` 的設定描述
- [ ] 各平台 metadata 一致（標題、作者、ISBN）

---

## 🧩 多平台差異提醒

| 平台 | 特殊要求 |
|---|---|
| **Google Play Books** | epubcheck 必過；ISBN 必填 |
| **Readmoo 讀墨** | EPUB 2/3 都收，相對寬鬆 |
| **Kobo Writing Life** | 封面建議 1600×2560 |
| **Amazon KDP** | 上傳後自動轉 KPF；複雜 CSS 會被簡化 |
| **Apple Books** | 要求最嚴：epubcheck 0 error 0 warning |

建議先上 Readmoo（寬鬆）→ Google Play Books → Apple Books（最嚴），逐步驗證。

---

## 🐛 常見問題

| 症狀 | 原因 / 解法 |
|---|---|
| `找不到封面圖` | `novels.config.json` 的 `coverUrl` 對應檔案不存在；確認 `site/public/{path}` 或 `_publish/assets/covers/` 有實體檔 |
| `跳過空白：...preface.md` | 模板沒填內容，正常行為。要納入則填入真實內容 |
| 章節順序錯 | 檔名要能字典序排序；建議 `01-`、`02-` 數字前綴 |
| 章節插圖沒出現 | 章節 frontmatter 的 `cover:` 欄位指向的檔名要存在於 `_publish/assets/chapters/` 或同等路徑 |
| 字體跑掉 | 不要在書中嵌字型，靠裝置 fallback；或在 `BOOK_CSS` 修改字型 stack |

---

## 🔄 工作流程（出版前完整流程）

1. **填寫 front_matter / back_matter**：至少 `03-preface.md` + `03-about-the-author.md`
2. **申請 ISBN**：依 `.agent/skills/isbn_batch/SKILL.md`
3. **填入 ISBN**：寫 `_meta/isbn.txt` 或 `_meta/isbn.json`
4. **打包**：`node scripts/build-epub.mjs <slug> --validate`
5. **本地預覽**：用 Calibre 或 Sigil 開 `_output/epub/{slug}.epub` 檢查
6. **多平台上架**：依平台規格逐一上傳

---

## 📁 相關檔案

| 用途 | 路徑 |
|---|---|
| 主腳本 | `scripts/build-epub.mjs` |
| 中央 metadata | `novels.config.json` |
| 書前 / 書後模板 | `projects/{slug}/_publish/front_matter/`, `_publish/back_matter/` |
| 模板生成腳本 | `scripts/scaffold-book-matter.mjs` |
| ISBN 申請流程 | `.agent/skills/isbn_batch/SKILL.md` |
| 輸出資料夾 | `_output/epub/`（gitignored） |
