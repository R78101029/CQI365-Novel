# AI Agent 工作指南

> **所有 AI agent（Claude、Gemini、Codex、Cursor 等）進入本 repo 的第一份文件。**
> 本文件取代任何 agent 專屬指引。CLAUDE.md 和 .cursorrules 只包含各自平台的技術設定，工作規範以本文件為準。

---

## 你在哪裡

這是一個**原創小說出版平台**的 monorepo。包含：
- 9 部小說的創作工作區（`projects/`）
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

| slug | 書名 | 類型 | 狀態 | 章數 | 說明 |
|------|------|------|------|------|------|
| `BlindOrbit` | 盲軌：2028 | 軍事驚悚 | completed | 34 | 台海戰爭架空小說 |
| `2040Iris` | 2040IRIS 三部曲 | AI 科幻 | completed | 36 | AI 治理崩潰的三部曲 |
| `TheCrease` | 摺痕 | 硬科幻 | completed | 30 | 量子意識與時空摺疊 |
| `LostInRetrospect` | 白露未晞 | 文學 | completed | 4 | 三世輪迴·修錶師視角 |
| `FrozenInForesight` | 白露成霜 | 文學 | completed | 4 | 同一故事·妻子視角（角色共用 LostInRetrospect） |
| `3-07AM` | 凌晨三點零七 | 文學短篇 | completed | 1 | 一個男人與 AI 的深夜對話 |
| `HalfFinished` | 半成品 | 文學 | **draft** | 15 | 建築師繼承日本半成品民宿 |
| `WhiteDewOnTheReeds` | 蒹葭蒼蒼 | 文學 | **draft** | 5 | 妻子在丈夫遺留的 AI 對話中考古 |
| `NotWavingButDrowning` | 溺墨 | 後設小說 | **draft** | 0/7 | 作家的無限嵌套救贖 |

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
│       ├── _characters/       ← 角色設定
│       ├── chapters/          ← 正文（Markdown）
│       ├── _front_matter/     ← 書前內容（題詞、獻詞、序）
│       ├── _back_matter/      ← 書後內容（後記、致謝）
│       ├── _assets/           ← 圖片（封面、插圖）
│       └── _archives/         ← 舊版本
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
| 白露系列（LostInRetrospect + FrozenInForesight） | **共用同一組角色**。角色檔在 LostInRetrospect/_characters/。FrozenInForesight 的 _CONTEXT.md 有說明 |
| 蒹葭蒼蒼 vs 3:07AM | 不同故事，但都涉及 AI 對話主題。風格和角色完全不同 |
| 所有文學類作品 | 共用 STYLE_GUIDE.md 的「林雨果風」|

---

## 封面圖片

- 工具：Google Gemini
- 風格：電影感場景插畫，**圖中不放任何文字**
- 命名：`{chapterNum}-cover.png`
- 位置：`projects/{slug}/_assets/chapters/` + `site/public/assets/{slug}/chapters/`
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
```
