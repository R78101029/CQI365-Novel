---
name: isbn_batch
description: 國家圖書館 ISBN 批次申請流程。建立書名頁/版權頁/封面，填寫 Excel，集中輸出至 _output/isbn_batch/。
---

# ISBN 批次申請 Skill

本 Skill 處理向國家圖書館 ISBN 中心提交電子書 ISBN 申請的完整流程。

---

## 適用時機

- 新小說完結需要申請 ISBN
- 批次申請多本 ISBN
- 套書（如白露系列）需要獨立 ISBN

---

## 前置條件

每部要申請的小說必須已有以下檔案：

| 檔案 | 路徑 | 說明 |
|------|------|------|
| 書名頁 HTML | `projects/{slug}/_meta/title_page.html` | A5 尺寸，含中英文書名 + 作者 + 獨立出版 |
| 版權頁 HTML | `projects/{slug}/_meta/copyright_page.html` | A5 尺寸，含出版資訊 + 版權聲明 |
| 版權頁 MD | `projects/{slug}/_meta/colophon_draft.md` | Markdown 版（EPUB 用） |
| ISBN 資料 | `projects/{slug}/_meta/isbn_application.md` | 關鍵詞、簡介、目次 |
| 封面圖片 | 各小說封面路徑（見 `novels.config.json` coverUrl） | 須含中英文書名 + 作者名 |

若尚未建立，依照下方「建立出版頁面」步驟製作。

---

## Step 1：建立出版頁面（如尚未有）

### 書名頁 (title_page.html)

模板：`projects/TheCrease/_meta/title_page.html`

- 格式：A5（148mm x 210mm）
- 字型：Noto Serif TC / Source Han Serif TC / PMingLiU
- 內容：中文書名 → 英文書名 → 分隔線 → 林雨果 / Hugo Lin → 獨立出版
- 字型大小依書名長度調整：2-3字 46-48pt、4字 42pt、5-6字 36pt

### 版權頁 (copyright_page.html)

模板：`projects/TheCrease/_meta/copyright_page.html`

- 格式：A5，內容置底
- 欄位：作者、封面設計、（內頁插圖）、出版者、聯絡信箱、個人網站
- 出版資訊：初版一刷、電子書版、檔案格式 EPUB
- 版權聲明 + 虛構作品免責條款

### ISBN 申請資料 (isbn_application.md)

格式：

```markdown
# ISBN 申請資料

## 書名
中文書名（English Title）

## 作者
林雨果（Hugo Lin）

## 建議關鍵詞
關鍵詞1;關鍵詞2;關鍵詞3（半形分號分隔，10-12 個）

## 本書簡介
（100-6000 字，無 emoji，適合國家圖書館全國新書資訊網顯示）

## 目次
（章節標題完整列表，含部/卷/季分組）
```

---

## Step 2：填寫批次 Excel

### 範本檔案

`bookBatchAddSample.xlsx`（國家圖書館提供）

### 欄位對照表

| 欄 | 欄位名稱 | 必填 | 固定值 |
|----|---------|:--:|--------|
| A | 項次 | | 流水號 1, 2, 3... |
| B | *書名及副書名 | * | 中文書名（English Title） |
| C | *著者 | * | 林雨果（Hugo Lin）著 |
| D | 版次 | | 初版 |
| E | *作品語文 | * | `chi` |
| G | *適讀對象 | * | `m`（成人一般） |
| H | *建議上架分類 | * | `2`（小說） |
| K | *圖書主題 | * | `9`（語言/文學） |
| L | *分級註記 | * | `1`（普遍級） |
| M | *是否為引進版權著作 | * | `否` |
| S | *填表人 | * | 林雨果 |
| T | *填表人電話 | * | **（手動填入）** |
| X | *填表人e-mail | * | vierylin@gmail.com |
| Y | *檔案格式 | * | `EPUB` |
| AB | *預計出版年月 | * | `YYYY-MM`（如 2026-04） |
| AC | 國家語言 | | `271`（臺灣華語） |
| AF | *舊書改版 | * | `否` |
| AI | 關鍵字 | | 從 isbn_application.md 取 |
| AJ | 簡介 | | 從 isbn_application.md 取 |
| AK | 目次 | | 從 isbn_application.md 取 |
| AL | *書名頁（檔案名稱） | * | `title_{slug}.png` |
| AM | *版權頁（檔案名稱） | * | `copyright_{slug}.png` |
| AP | 封面（檔案名稱） | | `cover_{slug}.png` |

最後一列 A 欄填 `END`。

### 套書處理

套書（如白露系列）需要額外一列：
- B 欄：套書名稱（含所有子書中英文名）
- 書名頁/版權頁：另建 `title_page_set.html` / `copyright_page_set.html`
- 簡介：整合所有子書的核心概念
- 目次：合併所有子書的目次

---

## Step 3：轉檔與集中輸出

### 輸出資料夾

`_output/isbn_batch/`

### 需要的檔案（每本書 3 個）

1. **書名頁 PNG**：從 `title_page.html` 用 Playwright 截圖（viewport 559x794 = A5 at 96dpi）
2. **版權頁 PNG**：從 `copyright_page.html` 用 Playwright 截圖
3. **封面 PNG**：從各書封面圖複製並重命名

### 轉檔方法（Python + Playwright）

```python
from playwright.async_api import async_playwright

async with async_playwright() as p:
    browser = await p.chromium.launch()
    page = await browser.new_page(viewport={'width': 559, 'height': 794})
    await page.goto(f'file:///{html_path}', wait_until='networkidle')
    await page.screenshot(path=output_png, full_page=False)
    await page.close()
    await browser.close()
```

### 檔案命名規則

- 書名頁：`title_{slug}.png`
- 版權頁：`copyright_{slug}.png`
- 封面：`cover_{slug}.png`
- 套書：`title_BailuSet.png`、`copyright_BailuSet.png`、`cover_BailuSet.png`

**重要**：整份上傳中所有檔案名稱不可重複。

---

## Step 4：上傳前檢查清單

- [ ] Excel T 欄（填表人電話）已填入
- [ ] 每本書的 B 欄有中英文書名
- [ ] 每本書的封面圖含中英文書名 + 作者名
- [ ] `_output/isbn_batch/` 內檔案數 = (書籍數 x 3) + 1（Excel）
- [ ] 所有 PNG 檔名與 Excel 中 AL/AM/AP 欄一致
- [ ] 最後一列為 END

---

## 已完成的申請記錄

| 書名 | ISBN 狀態 | 申請日期 |
|------|----------|---------|
| 摺痕（The Crease） | 已申請 | 2026-04 |
| 凌晨三點零七（3:07AM） | 已申請 | 2026-04 |
| 盲軌：2028（Blind Orbit） | 已申請 | 2026-04 |
| 2040IRIS | 已申請 | 2026-04 |
| 白露未晞（Lost in Retrospect） | 已申請 | 2026-04 |
| 白露成霜（Frozen in Foresight） | 已申請 | 2026-04 |
| 白露系列套書 | 已申請 | 2026-04 |
| 半成品（Half-Finished） | 未完成，暫不申請 | — |

---

## 相關檔案

| 檔案 | 路徑 |
|------|------|
| 批次範本（原始） | `bookBatchAddSample.xlsx` |
| 已填寫的批次檔 | `bookBatchAdd_filled.xlsx` |
| 集中輸出資料夾 | `_output/isbn_batch/` |
| 書名頁/版權頁模板 | `projects/TheCrease/_meta/title_page.html` / `copyright_page.html` |
