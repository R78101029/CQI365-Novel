# Chapter Order｜檔名與順序對照

> 寫每章時·檔名嚴格按本表。frontmatter 的 `order` 直接抄此處數字。
> sync-chapters.js 與 chapter-stats.mjs 都依本表掃描。

| order | 檔名 | 暫定章名 | 季 |
|------:|------|---------|-----|
|  1 | `01-信.md` | 信 | 春 |
|  2 | `02-到達.md` | 到達 | 春 |
|  3 | `03-第一位客人.md` | 第一位客人 | 春 |
|  4 | `04-回去.md` | 回去 | 春 |
|  5 | `05-再到.md` | 再到 | 春 |
|  6 | `06-第一批客人.md` | 第一批客人 | 夏 |
|  7 | `07-電話與冷氣.md` | 電話與冷氣 | 夏 |
|  8 | `08-颱風與木桌.md` | 颱風與木桌 | 夏 |
|  9 | `09-九月.md` | 九月 | 秋 |
| 10 | `10-橘子.md` | 橘子 | 秋 |
| 11 | `11-十二月.md` | 十二月 | 秋 |
| 12 | `12-冬天沒有人.md` | 冬天沒有人 | 冬 |
| 13 | `13-過年.md` | 過年 | 冬 |
| 14 | `14-縁側.md` | 縁側 | 冬 |
| 15 | `15-春天又要來.md` | 春天又要來 | 冬 |

---

## Frontmatter 範本

```yaml
---
title: "信"
book: 半成品
part: 1
status: draft
version: 0.1
date: 2026-MM-DD
order: 1
---
```

## novels.config.json 設計（待加入）

```json
{
  "slug": "HalfFinished",
  "title": "半成品",
  "titleEn": "Half-Finished",
  "genre": "文學",
  "description": "一個建築師繼承丈夫留給她的日本小島民宿。一年。一些沒有答案的東西留下來。",
  "status": "ongoing",
  "statusText": "連載中",
  "tags": ["文學", "當代", "長篇", "克制"],
  "coverUrl": "/assets/HalfFinished/HalfFinished_cover.jpg",
  "parts": [
    { "title": "第一部｜春", "range": [1, 5] },
    { "title": "第二部｜夏", "range": [6, 8] },
    { "title": "第三部｜秋", "range": [9, 11] },
    { "title": "第四部｜冬", "range": [12, 15] }
  ]
}
```
