# Novels365 — 多小說創作與發布工作區

Novels365 是一個「創作中台 + 發布管線」專案：
- 以 `projects/` 管理多本小說的創作素材與章節。
- 以 Astro 靜態站（`site/`）對外發布閱讀頁。
- 透過腳本自動同步章節、統計字數，並可選擇發布到 WordPress。

**小說網站**: https://novels.cqi365.net  
**WordPress 部落格**: https://blog.cqi365.net

---

## 核心功能

- **Multi-Project 創作工作區**：同一 repo 內維護多部小說。
- **Config-Driven**：以 `novels.config.json` 作為小說清單與站點設定單一來源。
- **章節同步**：`scripts/sync-chapters.js` 將 `projects/*/chapters` 同步到 `site/src/content/novels`。
- **統計生成**：`scripts/generate-stats.js` 產生各小說章節與字數統計。
- **靜態發布**：Astro + Cloudflare Pages。
- **可選 WP 發布**：`scripts/publish-to-wp.js` 將章節推送到 WordPress。

---

## 專案結構

```text
/
├── projects/                    # 小說創作來源
│   └── {novel-slug}/
│       ├── _CONTEXT.md          # 專案快速上下文
│       ├── _meta/               # 大綱、規劃、出版資料
│       ├── _world/              # 世界觀（可選）
│       ├── _characters/         # 角色設定
│       ├── chapters/            # 章節 Markdown
│       ├── _assets/             # 該小說圖片/封面/影片
│       └── _archives/           # 舊版本存檔
│
├── site/                        # Astro 網站
│   ├── src/pages/
│   ├── src/content/novels/      # 同步後章節內容
│   └── public/assets/           # 同步後公開素材
│
├── scripts/                     # 同步/統計/發布工具
├── novels.config.json           # 小說清單與站點設定（單一真相來源）
├── PROGRESS_LOG.md              # 里程碑與進度紀錄
└── README.md
```

---

## 目前小說清單（依 `novels.config.json`）

> 最後更新：2026-04-26

| slug | 書名 | 狀態 |
|---|---|---|
| `BlindOrbit` | 盲軌：2028 | 已完結 |
| `2040Iris` | 2040IRIS | 連載中 |
| `TheCrease` | 摺痕 | 已完結 |
| `LostInRetrospect` | 白露未晞 | 已完結 |
| `FrozenInForesight` | 白露成霜 | 已完結 |
| `3-07AM` | 凌晨三點零七 | 已完結 |
| `HalfFinished` | 半成品 | 連載中 |
| `NotWavingButDrowning` | 泛彼柏舟 | 連載中 |

> 備註：`WindAmongTheReeds` 已有企劃與章節草稿，但尚未納入 `novels.config.json` 前，不會出現在網站首頁與自動同步清單。
>
> 另：`NotWavingButDrowning` 已註冊於 config；若本地缺少 `projects/NotWavingButDrowning/chapters`，`sync-chapters` 會中止。

---

## 快速開始

### 1) 安裝網站依賴

```bash
cd site
npm install
```

### 2) 同步章節與素材

```bash
# 在 repo root 執行
node scripts/sync-chapters.js

# 或只同步單一小說
node scripts/sync-chapters.js BlindOrbit
```

### 3) 產生統計

```bash
node scripts/generate-stats.js
```

### 4) 啟動本地開發

```bash
cd site
npm run dev
```

### 5) 建置網站

```bash
cd site
npm run build
```

---

## 新增小說標準流程

### Step 1 — 建立專案骨架

```bash
mkdir -p projects/{novel-slug}/{_meta,_world,_characters,chapters,_assets,_archives}
```

至少建立：
- `projects/{novel-slug}/_CONTEXT.md`
- `projects/{novel-slug}/_meta/outline.md`
- `projects/{novel-slug}/_meta/chapter_order.md`
- `projects/{novel-slug}/_meta/agent_guidelines.md`

### Step 2 — 註冊到 `novels.config.json`

在 `novels.config.json` 的 `novels` 陣列新增一筆：

```json
{
  "slug": "{novel-slug}",
  "title": "小說名稱",
  "titleEn": "English Title",
  "genre": "文學",
  "description": "一句話簡介",
  "status": "ongoing",
  "statusText": "連載中",
  "tags": ["標籤1", "標籤2"],
  "coverUrl": "/assets/{novel-slug}/covers/cover.png",
  "videoUrl": "/assets/{novel-slug}/covers/cover_mv.mp4",
  "wordpress": {
    "category": "小說名稱 (English Title)",
    "coverMediaId": null
  },
  "parts": [
    { "title": "Part 1", "range": [1, 10] }
  ]
}
```

### Step 3 — 撰寫章節

將章節放在：

```text
projects/{novel-slug}/chapters/*.md
```

建議檔名以章號開頭（例如 `01-序章.md`），方便排序。

### Step 4 — 同步 + 本地驗證

```bash
node scripts/sync-chapters.js {novel-slug}
node scripts/generate-stats.js {novel-slug}
cd site && npm run build
```

### Step 5 — 提交與部署

```bash
git add .
git commit -m "feat({novel-slug}): initialize project and publish metadata"
git push
```

推送後，Cloudflare Pages 會自動建置。

---

## WordPress 發布（可選）

### 必要環境變數

- `WP_URL`（預設可用 `https://blog.cqi365.net`）
- `WP_USER`
- `WP_APP_PASSWORD`
- `NOVEL_SITE_URL`（預設 `https://novels.cqi365.net`）

### 手動發布

```bash
node scripts/publish-to-wp.js projects/{novel-slug}/chapters/01-xxx.md
```

### GitHub Actions 自動發布

當 `projects/*/chapters/*.md` 有變更並推送到 `main`，可觸發自動發布流程（視 workflow 設定）。

---

## 給 AI Agent / 協作者

1. 先讀 `CLAUDE.md`（整體協作規則）。
2. 再讀目標小說的 `projects/{novel-slug}/_CONTEXT.md`。
3. 撰寫章節時遵守 `_meta/agent_guidelines.md` 與 `STYLE_GUIDE.md`。
4. 異動章節後，執行同步與建置檢查。
5. 重要變更同步記錄至 `PROGRESS_LOG.md`。

---

## License

All rights reserved. Content is for personal use only.
