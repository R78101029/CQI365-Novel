# Chapter Order｜檔名與順序對照

> 寫每章時·檔名嚴格按本表。frontmatter 的 `order` 直接抄此處數字。
> sync-chapters.js 與 chapter-stats.mjs 都依本表掃描。

| order | 檔名 | 暫定章名 | 季 |
|------:|------|---------|-----|
|  1 | `01-信.md` | 信 | 春 |
|  2 | `02-到達.md` | 到達 | 春 |
|  3 | `03-第一批客人.md` | 第一批客人 | 春 |
|  4 | `04-合約.md` | 合約 | 春 |
|  5 | `05-電話.md` | 電話 | 夏 |
|  6 | `06-冷氣.md` | 冷氣 | 夏 |
|  7 | `07-颱風.md` | 颱風 | 夏 |
|  8 | `08-木桌.md` | 木桌 | 夏 |
|  9 | `09-停電.md` | 停電 | 夏 |
| 10 | `10-九月.md` | 九月 | 秋 |
| 11 | `11-十月底.md` | 十月底 | 秋 |
| 12 | `12-橘子.md` | 橘子 | 秋 |
| 13 | `13-十一月.md` | 十一月 | 秋 |
| 14 | `14-十二月.md` | 十二月 | 秋 |
| 15 | `15-冬天沒有人.md` | 冬天沒有人 | 冬 |
| 16 | `16-事務所的來信.md` | 事務所的來信 | 冬 |
| 17 | `17-過年.md` | 過年 | 冬 |
| 18 | `18-陽台.md` | 陽台 | 冬 |
| 19 | `19-春天又要來.md` | 春天又要來 | 冬 |

---

## Frontmatter 範本

每章 .md 檔的開頭固定如下:

```yaml
---
title: "信"
book: 半成品
part: 1                 # 1=春 / 2=夏 / 3=秋 / 4=冬
status: draft
version: 0.1
date: 2026-MM-DD
order: 1
---
```

## novels.config.json 設計（待加入）

第 1 章定稿後加入。建議結構:

```json
{
  "slug": "HalfFinished",
  "title": "半成品",
  "titleEn": "Half-Finished",
  "genre": "文學",
  "description": "一個律師繼承前妻留給他的墾丁民宿。一年。一些沒有答案的東西留下來。",
  "status": "ongoing",
  "statusText": "連載中",
  "tags": ["文學", "當代", "長篇", "克制"],
  "coverUrl": "/assets/HalfFinished/HalfFinished_cover.jpg",
  "wordpress": { "category": "（待定）", "coverMediaId": null },
  "parts": [
    { "title": "第一部｜春", "range": [1, 4] },
    { "title": "第二部｜夏", "range": [5, 9] },
    { "title": "第三部｜秋", "range": [10, 14] },
    { "title": "第四部｜冬", "range": [15, 19] }
  ]
}
```
