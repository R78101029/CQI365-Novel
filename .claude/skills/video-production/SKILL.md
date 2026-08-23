---
name: video-production
description: 小說轉微短劇影片的完整管線——劇本、分鏡 shots.json、角色/場景/道具參考圖鎖定、首幀出圖、圖生影片、旁白與 ffmpeg 合成。用於「把某章做成影片」「做 EP0X」「分鏡」「角色參考圖」「出片」「一致性跑掉了」等任務。
---

# 影片製作管線

執行規範在 repo 的正本：**先完整讀 `.agent/skills/video_production/SKILL.md`**，然後依它的階段執行。

參考檔（依需要讀，不要一次全讀）：
- `.agent/skills/video_production/references/script_format.md` — 階段 1，小說→劇本
- `.agent/skills/video_production/references/shots_schema.json` — 階段 2，分鏡表 schema
- `.agent/skills/video_production/references/prompt_rules.md` — 階段 4–5，prompt 編譯規則
- `.agent/skills/video_production/references/models.json` — 模型註冊表（endpoint / 參數對應 / 價格）
- `.agent/skills/video_production/references/api_reference.md` — API 細節與模型探索方式
- `.agent/skills/video_production/PLAN.md` — 設計理由與選型評估（只在要改架構時讀）

正本放在 `.agent/skills/` 是為了讓 Gemini / Codex / Cursor 也讀得到（repo 慣例）。本檔只是讓 Claude Code 能用 `/video-production` 叫起來。
