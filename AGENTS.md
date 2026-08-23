# AI Agent 工作指南

> **所有 AI agent（Claude、Gemini、Codex、Cursor 等）進入本 repo 的第一份文件。**
> 本文件取代任何 agent 專屬指引。CLAUDE.md 和 .cursorrules 只包含各自平台的技術設定，工作規範以本文件為準。

---

## 你在哪裡

這是一個**原創小說出版平台**的 monorepo。包含：
- 10 部小說的創作工作區（`projects/`）
- Astro 靜態網站（`site/`），部署在 Cloudflare Pages
- 建構與發布工具（`scripts/`）
- 中央設定檔（`novels.config.json`）

**作者筆名**：林雨果（Hugo Lin）
**網站**：https://novels.cqi365.net

---

## 開始工作前：三步

1. **讀本文件**（你正在讀）
2. **讀 `STYLE_GUIDE.md`** — 林雨果風寫作規範，適用所有小說
3. **進入目標專案** → 讀 `projects/{slug}/_CONTEXT.md`

---

## 專案列表

> 章數以 `site/src/data/novels-stats.json` 為準（`npm run build` 自動重算）。
> 手改本表時請一併核對，不要憑印象填。

| slug | 書名 | 類型 | 狀態 | 章數 | 說明 |
|------|------|------|------|------|------|
| `BlindOrbit` | 盲軌：2028 | 軍事驚悚 | completed | 35 | 台海戰爭架空小說 |
| `2040Iris` | 2040IRIS 三部曲 | AI 科幻 | completed | 41 | AI 治理崩潰的三部曲 |
| `TheCrease` | 摺痕 | 硬科幻 | completed | 30 | 量子意識與時空摺疊 |
| `LostInRetrospect` | 白露未晞 | 文學 | completed | 4 | 三世輪迴·修錶師視角 |
| `FrozenInForesight` | 白露成霜 | 文學 | completed | 4 | 同一故事·妻子視角（角色共用 LostInRetrospect） |
| `3-07AM` | 凌晨三點零七 | 文學短篇 | completed | 1 | 一個男人與 AI 的深夜對話 |
| `HalfFinished` | 半成品 | 文學 | completed | 13 | 建築師繼承日本半成品民宿 |
| `NotWavingButDrowning` | 溺墨 | 後設小說 | **draft** | 7 | 作家的無限嵌套救贖（初稿已完成） |
| `WhiteDewOnTheReeds` | 蒹葭蒼蒼 | 文學 | **draft** | 5 | 妻子在丈夫遺留的 AI 對話中考古 |
| `Hypothermia` | 失溫 | 文學 | **draft** | 1 | 把婚姻當 KPI 解的男人·她走了三次 |

> **draft 狀態的專案**：網站只顯示封面和簡介，不顯示章節內容。

---

## 目錄結構

```
/
├── AGENTS.md              ← 你在這裡。所有 AI 的入口
├── STYLE_GUIDE.md         ← 寫作風格規範（所有專案共用）
├── novels.config.json     ← 網站中央設定（書名、封面、狀態）
├── projects/              ← 9 個小說專案
│   └── {slug}/
│       ├── _CONTEXT.md        ← 專案入口（30秒摘要 + 檔案地圖）
│       ├── _meta/             ← 規劃文件
│       │   ├── agent_guidelines.md  ← 該專案的寫作鐵律
│       │   ├── outline.md           ← 章節大綱
│       │   ├── chapter_order.md     ← 章節順序與檔名
│       │   ├── creative_plan.md     ← 創作計畫
│       │   └── planning/            ← 深入規劃（角色心理、物件表等）
│       ├── chapters/          ← 正文（Markdown）
│       ├── _publish/          ← 出版相關（面向讀者）
│       │   ├── front_matter/  ←   書前：題詞、獻詞、序
│       │   ├── back_matter/   ←   書後：後記、致謝、作者簡介
│       │   └── assets/        ←   圖片：封面、章節插圖
│       └── _dev/              ← 創作素材（面向作者/Agent）
│           ├── characters/    ←   角色設定
│           ├── world/         ←   世界觀
│           ├── archives/      ←   舊版本
│           └── media/         ←   影片/圖片生成素材
├── scripts/               ← 建構工具
├── site/                  ← Astro 網站原始碼
└── _output/               ← 產出（EPUB、ISBN、進度紀錄）
```

---

## 寫作工作流

### 寫章節

1. 讀 `projects/{slug}/_CONTEXT.md`
2. 讀 `_meta/agent_guidelines.md`（該專案的寫作鐵律）
3. 讀 `_meta/outline.md`（該章的大綱）
4. 讀 `STYLE_GUIDE.md`（林雨果風）
5. 開寫。存到 `chapters/` 目錄

### 章節 Frontmatter 格式

```yaml
---
title: "章名"
book: 書名
part: 1          # 1=第一部, 2=第二部...
status: draft    # draft / skeleton / v0.1 / completed
version: 0.1
date: 2026-MM-DD
order: 1         # 依 chapter_order.md
---
```

### 寫完後自檢

1. 有沒有違反 `agent_guidelines.md` 的禁忌？
2. 有沒有違反 `STYLE_GUIDE.md` 的規則？
3. 結尾是不是停在半途？（林雨果風要求）
4. 有沒有命名情緒？（用身體動作替代）
5. 字數統計：`node scripts/chapter-stats.mjs --novel={slug} --verbose`

---

## 寫作風格速查

> 完整規範見 `STYLE_GUIDE.md`。以下是最常違反的規則。

- ❌ 明喻（像⋯⋯、彷彿⋯⋯、宛如⋯⋯）
- ❌ 情緒形容詞（悲傷、焦慮、恐懼）
- ❌ 程度副詞（很、非常、極其）
- ❌ 角色「意識到」「突然明白」
- ❌ 裸斷句——用「應該是」「大概」等連結詞
- ✅ 簡潔但有連結
- ✅ 身體代言情緒（手冷、舌頭不會動、膝蓋遲疑）
- ✅ 數字取代副詞（「兩分鐘」不是「很久」）
- ✅ 每章至少一個不象徵任何事的細節

---

## 設定系統

### novels.config.json

所有小說的 metadata 集中在此：標題、描述、標籤、封面路徑、狀態、parts 結構。

- `status: "completed"` → 網站正常顯示
- `status: "ongoing"` → 網站正常顯示
- `status: "draft"` → 網站只顯示封面和簡介，隱藏章節

**不要在網頁程式碼裡 hardcode 小說資料，一律從 config 讀。**

### 字數統計

```bash
node scripts/chapter-stats.mjs --novel={slug} --verbose
```

自動計算純漢字數。

---

## 建構與發布

```bash
cd site
npm run build     # sync chapters + generate stats + astro build
npm run preview   # 本地預覽
```

- **平台**：Cloudflare Pages
- **觸發**：push to `main` 自動部署
- **網址**：https://novels.cqi365.net

---

## Git 規則

- `main` 是 remote source of truth
- 開始工作前先 `git pull origin main`
- commit message 用中文或英文皆可，格式：`type: description`
- 不要在一個 commit 裡混太多不相關的變更
- **draft 小說的章節內容可以 push**（網站不會顯示）

---

## 跨專案注意事項

| 情況 | 處理方式 |
|------|---------|
| 白露系列（LostInRetrospect + FrozenInForesight） | **共用同一組角色**。角色檔在 LostInRetrospect/_dev/characters/。FrozenInForesight 的 _CONTEXT.md 有說明 |
| 蒹葭蒼蒼 vs 3:07AM | 不同故事，但都涉及 AI 對話主題。風格和角色完全不同 |
| 所有文學類作品 | 共用 STYLE_GUIDE.md 的「林雨果風」|

---

## 封面圖片

- 工具：Google Gemini
- 風格：電影感場景插畫，**圖中不放任何文字**
- 命名：`{chapterNum}-cover.png`
- 位置：`projects/{slug}/_publish/assets/chapters/` + `site/public/assets/{slug}/chapters/`
- Frontmatter：`cover: "01-cover.png"`

---

## 常用指令

```bash
# 字數統計
node scripts/chapter-stats.mjs --novel=HalfFinished --verbose

# 同步章節到網站
node scripts/sync-chapters.js

# 建構網站
cd site && npm run build

# 本地預覽
cd site && npm run preview

# 建立新小說的書前/書後模板
node scripts/scaffold-book-matter.mjs {slug}

# 打包 EPUB
node scripts/build-epub.mjs {slug}

# 圖片壓縮（PNG → JPG，一併改掉章節與 config 的引用）
node scripts/compress-assets.mjs {slug}        # 先加 --dry 看會改什麼
node scripts/compress-assets.mjs --all --dry

# 產生書封（讀 _publish/assets/covers/cover-bg.*）
node scripts/build-cover.mjs {slug}

# 產生首頁分享卡（og-default.jpg），換封面或加新書後重跑
node scripts/build-og-image.mjs

# 產生可貼進 WordPress 的章節 HTML（每章一檔，輸出到 _output/wp/{slug}/）
node scripts/build-wp-html.mjs {slug}              # 整本
node scripts/build-wp-html.mjs {slug} --list       # 先看章節編號
node scripts/build-wp-html.mjs {slug} --ch 3 --clip  # 單章並複製到剪貼簿
node scripts/build-wp-html.mjs --all               # 所有已完結小說

# 作品介紹頁（每本一張，含封面、書籍資訊、目錄）
node scripts/build-wp-html.mjs {slug} --intro          # 單本
node scripts/build-wp-html.mjs --all --drafts --intro  # 全部十本
```

### WordPress 轉貼

**一律手動貼上，不做全自動發布。** 產生 HTML → 使用者自己貼進 WordPress。原因是自動發布常常出格式錯誤，
而且是上線之後才發現；手動貼多花的幾十秒，換的是貼之前能先看一眼。

`scripts/publish-to-wp.js`（REST API 直接發草稿）**已停用**，不要提議也不要執行。

`build-wp-html.mjs` 讀 `site/src/content/novels/`（不是 `projects/`），因為 sync-chapters.js
已經把圖片路徑改寫成 `/assets/{slug}/...`。所以**跑之前要先 `node scripts/sync-chapters.js`**，
否則貼出去的是舊稿。

產出是樣式全內嵌的純 HTML，貼進 WordPress 的「自訂 HTML」區塊（或 Classic Editor 的「文字」分頁）即可，
不需要在佈景主題加任何 CSS。圖片一律直連 `https://novels.cqi365.net/assets/...`，不用上傳到 WP 媒體庫。
每個小說資料夾會附一份 `index.md`，列出每章的建議 WP 標題與檔名。

### 作品的序

每本書的序寫成兩份 markdown，放在 `projects/{slug}/_publish/`：

| 檔案 | 內容 | 用在哪 |
|------|------|--------|
| `intro_excerpt.md` | 冷開場：正文切片 + 「接下去讀」連結 | 只有獨立介紹文 |
| `intro_preface.md` | 序：這本書是什麼 | 小說站書首 · WP 第一章 · 獨立介紹文 |

**切片不進小說站與第一章貼文**——那段是正文原文，放在正文正上方會讓讀者連讀兩遍。

三個去處吃同一份 `intro_preface.md`，改一次三處同步：

- **小說站**：`sync-chapters.js` 把它搬到 `site/src/content/intros/{slug}.md`（順便把 `※` 換成
  `<p class="scene-mark">`，否則會變成縮排的普通段落），由小說頁的 `.book-intro` 區塊渲染。
- **WordPress 第一章**：`build-wp-html.mjs` 產第 1 章時自動掛在正文前面，套一個「關於本書」框。
- **獨立介紹文**：`--intro` 產出 `_intro.html` = 封面 + 書名資訊 + 切片 + 序 + 閱讀 CTA。

沒寫序的小說，`--intro` 會印警告並改用 config 的 `description` 頂替。

### 影片製作

小說 → 微短劇的完整管線（劇本 → 分鏡 → 參考圖鎖臉 → 出圖 → 出片 → 合成）規範在
`.agent/skills/video_production/SKILL.md`。Claude Code 可用 `/video-production` 叫起。

```bash
node scripts/video/fal-schema.mjs <fal_endpoint>   # 查模型參數，寫 adapter 前必跑
```

金鑰放根目錄 `.env`（`GOOGLE_API_KEY` 出圖、`FAL_KEY` 出片）。
影片產物（`clips/ out/ audio/`）不進版本庫，只追蹤 `cast/` 參考圖、`frames/` 定稿首幀與 `shots.json`。

### 圖片規範

- **正文與封面一律用 JPG**，不要用 PNG。PNG 的檔案大小是 JPG 的 5–10 倍，而這些都是照片式插畫，用 PNG 沒有任何好處。
- 新增圖片後跑一次 `node scripts/compress-assets.mjs {slug}`。
- `_publish/assets/` 底下這些目錄**不會**被同步到網站：`_archive/`、`raw_pngs/`、`storyboards/`，以及 `cover-bg.*`（那是 build-cover.mjs 的底圖來源）。
