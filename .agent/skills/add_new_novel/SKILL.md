---
name: add_new_novel
description: Workflow for adding a new novel project to the system.
---

# Add New Novel Skill

本 Skill 定義新增一本小說到系統的標準流程。包括建立目錄結構、設定 Config 與發布頁面。

---

## 🚀 新增流程 (Add Workflow)

### 1. 建立專案目錄
在 `projects/` 下建立新的小說目錄：

```bash
mkdir projects/MyNewNovel
mkdir projects/MyNewNovel/chapters
mkdir projects/MyNewNovel/_assets
mkdir projects/MyNewNovel/_meta
```

### 2. 初始化 Metadata
在 `_meta` 目錄中建立 `chapter_order.md` (可選，若使用 `scripts/apply-titles.js` 則需要)。

### 3. 更新 `novels.config.json`
在根目錄的 `novels.config.json` 中新增小說設定：

```json
{
  "slug": "MyNewNovel",          // 用於網址: /novel/MyNewNovel
  "title": "我的新小說",          // 顯示標題
  "titleEn": "My New Novel",     // 英文標題
  "genre": "科幻",               // 類別
  "description": "小說簡介...",   // 首頁與目錄頁顯示的簡介
  "status": "ongoing",           // 狀態: ongoing, completed
  "statusText": "連載中",
  "tags": ["Tag1", "Tag2"],
  "coverUrl": "/assets/MyNewNovel/cover.jpg",
  "wordpress": { ... },
  "parts": [                     // 定義目錄頁的分卷結構
    { "title": "第一部", "range": [0, 99] },
    { "title": "第二部", "range": [100, 199] }
  ]
}
```

### 4. 準備封面圖片
將小說封面放入 `projects/MyNewNovel/_assets/`，建議命名為 `MyNewNovel_cover.jpg`。
並將章節圖片放入 `projects/MyNewNovel/_assets/chapters/`。

### 5. 發布
執行發布腳本：

```powershell
./scripts/publish_novel.ps1 -NovelName "MyNewNovel"
```

此腳本會自動：
1.  同步章節與圖片到 `site/`。
2.  更新統計資料。
3.  建置網站。

---

## 📂 系統架構說明

### 動態路由 (Dynamic Routing)
系統使用 Astro 動態路由自動生成小說頁面，**無需手動建立 `.astro` 檔案**。
- `site/src/pages/novel/[novelSlug]/index.astro`: 小說目錄頁 (讀取 `config.parts`)
- `site/src/pages/novel/[novelSlug]/[...slug].astro`: 章節閱讀頁

### 配置檔 (Config)
所有小說的 Metadata 都在 `novels.config.json` 中統一管理。修改 Config 後需重新執行 `publish_novel.ps1` (或 `npm run build`) 才會生效。
