# Chapter Order｜檔名與順序對照

> 寫每章時·檔名嚴格按本表。frontmatter 的 `order` 直接抄此處數字。
> sync-chapters.js 與 chapter-stats.mjs 都依本表掃描。

| order | 檔名 | 暫定章名 | 季 |
|------:|------|---------|-----|
|  1 | `01-信.md` | 信 | 春 |
|  2 | `02-到達.md` | 到達 | 春 |
|  3 | `03-第一批客人.md` | 第一批客人 | 春 |
|  4 | `04-合約.md` | 合約 | 春 |
|  5 | `05-第一次鬆動.md` | 第一次鬆動 | 夏 |
|  6 | `06-旺季開始.md` | 旺季開始 | 夏 |
|  7 | `07-颱風前.md` | 颱風前 | 夏 |
|  8 | `08-放棄.md` | 放棄 | 夏 |
|  9 | `09-夏末.md` | 夏末 | 夏 |
| 10 | `10-她回來.md` | 她回來 | 秋 |
| 11 | `11-她第二次來.md` | 她第二次來 | 秋 |
| 12 | `12-對話.md` | 對話 | 秋 |
| 13 | `13-她第三次來.md` | 她第三次來 | 秋 |
| 14 | `14-颱風後的冬天前.md` | 颱風後的冬天前 | 秋 |
| 15 | `15-她沒來.md` | 她沒來 | 秋 |
| 16 | `16-冬天沒有人.md` | 冬天沒有人 | 冬 |
| 17 | `17-事務所的來信.md` | 事務所的來信 | 冬 |
| 18 | `18-她還是沒來.md` | 她還是沒來 | 冬 |
| 19 | `19-陽台.md` | 陽台 | 冬 |
| 20 | `20-春天又要來.md` | 春天又要來 | 冬 |

---

## Frontmatter 範本

每章 .md 檔的開頭固定如下:

```yaml
---
title: "信"
book: 待定
part: 1                 # 1=春 / 2=夏 / 3=秋 / 4=冬
status: draft
version: 0.1
date: 2026-MM-DD
order: 1
---
```

寫到第 10 章後決定書名·屆時統一更新所有 `book` 欄位。

## novels.config.json 設計（待加入）

第 1 章定稿後加入。建議結構:

```json
{
  "slug": "Kenting",
  "title": "（暫名）",
  "titleEn": "Kenting Inn",
  "genre": "文學",
  "description": "一個律師繼承墾丁姨婆的民宿。一年。一個常客。一個他直到冬天才看見的下午。",
  "status": "ongoing",
  "statusText": "連載中",
  "tags": ["文學", "當代", "長篇", "克制"],
  "coverUrl": "/assets/Kenting/Kenting_cover.jpg",
  "wordpress": { "category": "（待定）", "coverMediaId": null },
  "parts": [
    { "title": "第一部｜春", "range": [1, 4] },
    { "title": "第二部｜夏", "range": [5, 9] },
    { "title": "第三部｜秋", "range": [10, 15] },
    { "title": "第四部｜冬", "range": [16, 20] }
  ]
}
```
