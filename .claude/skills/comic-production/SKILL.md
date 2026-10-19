---
name: comic-production
description: 小說轉寫實 AI 條漫的管線——實體聖經（角色依年份分版本）、02_strip.json 分格表、validate、prompt 編譯、一格一圖、HTML 嵌字排版、contact sheet 一致性關卡。用於「把某章做成漫畫／條漫」「分格」「嵌字」「漫畫角色跑掉了」等任務。
---

# 條漫製作管線

執行規範在 repo 的正本：**先完整讀 `.agent/skills/comic_production/SKILL.md`**，然後依它的階段執行。
實體聖經與出圖工具跟影片管線共用（`.agent/skills/video_production/`、`scripts/video/gen-frame.mjs`）。

正本放在 `.agent/skills/` 是為了讓其他 agent 也讀得到（repo 慣例）。本檔只是讓 Claude Code 能用 `/comic-production` 叫起來。
