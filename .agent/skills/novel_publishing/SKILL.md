---
name: novel_publishing
description: Standard workflow for publishing novel chapters to the website (Astro/Cloudflare).
---

# Novel Publishing Skill

本 Skill 定義將小說內容發布到網站的標準流程。包含圖片生成、內容同步與建置部署。

---

## 🚀 核心流程 (Core Workflow)

發布流程由 `scripts/publish_novel.ps1` 腳本自動化執行，主要包含以下步驟：

1.  **Metadata Sync (`apply-titles.js`)**:
    - 讀取 `_meta/chapter_order.md`。
    - 更新所有章節 Markdown 的 `title` 和 `order` Frontmatter。
    - 確保三部曲 (Book I, II, III) 的章節順序正確 (e.g., 1.01 -> Order 101)。

2.  **Asset Generation (`auto-insert-images.js`)**:
    - **正式模式**: 掃描 `_publish/assets/chapters`，自動將圖片插入對應章節。
    - **Placeholder 模式** (`-UsePlaceholders`): 若圖片服務無法使用，自動生成 1x1 佔位圖片，確保發布流程不中斷。

3.  **Content Sync (`sync-chapters.js`)**:
    - 將 `projects/{novel}/chapters` 複製到 `site/src/content/novels/{novel}`。
    - 將 `projects/{novel}/_publish/assets` 複製到 `site/public/assets/{novel}`。
    - 自動轉換圖片路徑為網站絕對路徑。

4.  **Site Build & Deploy**:
    - 執行 `npm run build` (Astro Build)。
    - 透過 Git Push 觸發 Cloudflare Pages 自動部署。

---

## 🛠️ 自動化指令 (Automation)

使用 PowerShell 腳本執行一鍵發布：

```powershell
# 標準發布 (若圖片已備妥)
./scripts/publish_novel.ps1 -NovelName "2040Iris"

# 純文字/佔位圖模式 (若圖片服務不可用)
./scripts/publish_novel.ps1 -NovelName "2040Iris" -UsePlaceholders
```

### 參數說明
- `-NovelName`: 專案名稱 (預設 "2040Iris")。
- `-SkipImages`: 跳過圖片處理步驟 (僅同步文字)。
- `-UsePlaceholders`: 自動生成缺少的封面與插圖 (1x1 像素灰色圖片)，確保版面結構完整。

---

## 📂 檔案結構依賴

確保專案符合以下結構以支援自動化：

```
projects/{novel}/
├── _meta/
│   └── chapter_order.md     # 定義章節標題與順序 (Schema: | ID | File | Title | ...)
├── _assets/
│   └── chapters/            # 存放圖片 (Naming: ch01-cover.jpg, ch01-scene-battle.jpg)
└── chapters/
    └── Book1_Chap01_...md   # Markdown 內文
```

## ⚠️ 常見問題排除

1.  **Git 鎖定 (`index.lock`)**:
    - 若發生 `File exists` 錯誤，請關閉所有 VS Code 視窗或終端機，手動執行 `rm .git/index.lock`。

2.  **圖片未顯示**:
    - 檢查 `_assets/chapters` 內的檔名是否符合 `ch{NO}-cover.jpg` 格式。
    - 確認 `auto-insert-images.js` 有成功執行並顯示 `✓ Set cover`。

3.  **章節順序錯誤**:
    - 檢查 `_meta/chapter_order.md` 的編號 (e.g., 1.01, 2.05)。
    - 執行 `node scripts/apply-titles.js {novel}` 手動修復 Frontmatter。
