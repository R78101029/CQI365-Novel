---
name: novel_publishing
description: 小說發布流程 - 自動化圖檔生成、內容同步與網站部署
---

# Novel Publishing Skill

本 Skill 提供小說發布的標準化工作流程，整合了圖片生成、內容同步與 Cloudflare Pages 部署。

---

## 📚 核心概念

本流程依賴於專案跟目錄下的 `scripts/` 工具集與 `site/` 網站專案。

### 關鍵組件

1.  **Image Generator** (`scripts/auto-insert-images.js`):
    *   自動讀取 `_assets/chapters/` 中的圖片。
    *   根據檔名規則 (`ch01-cover.jpg`, `ch01-scene-battle.jpg`) 插入到 Markdown 章節中。
    *   自動更新 Frontmatter 中的 cover 欄位。

2.  **Content Syncer** (`scripts/sync-chapters.js`):
    *   將 `projects/{novel}/chapters/*.md` 同步到 `site/src/content/novels/{novel}/`。
    *   將 `projects/{novel}/_assets/` 同步到 `site/public/assets/{novel}/`。
    *   自動轉換 Markdown 中的圖片路徑為網站絕對路徑。

3.  **Site Builder** (`site/`):
    *   基於 Astro 框架的靜態網站生成器。
    *   支援多小說專案 (Multi-Project Support)。

---

## 🚀 工作流程

### Phase 1: 資源準備 (Image Generation)

在發布前，需先準備好章節封面與場景圖。

#### 步驟 1.1: 生成圖片
使用 Agent 的 `generate_image` 工具生成圖片，並儲存到 `projects/{novel}/_assets/chapters/`。

**命名規範**:
*   **小說封面**: `{novel}_cover.jpg` (e.g., `2040Iris_cover.jpg`)
*   **章節封面**: `ch{XX}-cover.jpg` (e.g., `ch01-cover.jpg`)
*   **場景圖片**: `ch{XX}-scene-{desc}.jpg` (e.g., `ch03-scene-taipei-rain.jpg`)

#### 步驟 1.2: 執行圖片插入腳本
此腳本會修改原始 Markdown 文件，插入圖片標籤。

```bash
node scripts/auto-insert-images.js {novel-name}
# Example: node scripts/auto-insert-images.js 2040Iris
```

> [!WARNING]
> 若圖片生成服務不可用 (503 Error)，請**跳過**此步驟，以免產生破圖連結。

---

### Phase 2: 內容同步 (Content Sync)

將準備好的 Markdown 與圖片同步到網站目錄。

#### 步驟 2.1: 執行同步腳本

```bash
node scripts/sync-chapters.js {novel-name}
# Example: node scripts/sync-chapters.js 2040Iris
```

此步驟會：
1.  複製章節 MD 檔到 `site/src/content`。
2.  複製圖片資源到 `site/public/assets`。
3.  轉換圖片路徑。

---

### Phase 3: 建置與預覽 (Build & Preview)

在本地驗證網站顯示效果。

#### 步驟 3.1: 建置網站

```bash
cd site
npm run build
```

#### 步驟 3.2: 本地預覽 (可選)

```bash
npm run preview
```

---

### Phase 4: 部署 (Deployment)

將變更推送到 Git，觸發 Cloudflare Pages 自動部署。

#### 步驟 4.1: Git 提交

```bash
git add site/src/content site/public/assets projects/{novel}/chapters
git commit -m "Publish: Update content for {novel}"
git push origin main
```

---

## 🛠️ 自動化腳本 (One-Click Publish)

可以使用以下 PowerShell 腳本一次完成所有步驟：

`scripts/publish_novel.ps1`

```powershell
param(
    [string]$NovelName = "2040Iris",
    [switch]$SkipImages = $false
)

Write-Host "🚀 Starting Publish Process for '$NovelName'..." -ForegroundColor Cyan

# 1. Insert Images
if (-not $SkipImages) {
    Write-Host "`n📸 Step 1: Auto-inserting images..." -ForegroundColor Yellow
    node scripts/auto-insert-images.js $NovelName
} else {
    Write-Host "`n⏭️ Step 1: Skipping image insertion (Text-Only Mode)." -ForegroundColor Gray
}

# 2. Sync Content
Write-Host "`n🔄 Step 2: Syncing chapters and assets..." -ForegroundColor Yellow
node scripts/sync-chapters.js $NovelName

# 3. Build Site
Write-Host "`n🏗️ Step 3: Building Astro site..." -ForegroundColor Yellow
Set-Location site
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Build Successful!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Build Failed!" -ForegroundColor Red
        exit 1
    }
} finally {
    Set-Location ..
}

Write-Host "`n✨ Done! Ready to commit and push." -ForegroundColor Cyan
```

---

## 📋 發布前檢查清單

- [ ] 所有新章節都已寫入 `chapter_order.md`。
- [ ] 所有圖片都已生成並存入正確目錄 (除非 Text-Only)。
- [ ] 執行過 `sync-chapters.js` 且無錯誤。
- [ ] 本地 `npm run build` 成功。
