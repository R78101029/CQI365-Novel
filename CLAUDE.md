# Claude Code 專屬設定

> **先讀 `AGENTS.md`** — 那裡有完整的 repo 結構、專案列表、寫作規範和工作流程。
> 本文件只包含 Claude Code 平台專屬的技術設定。

---

## 工作規範

**所有工作規範、寫作風格、專案列表、目錄結構說明，請參照 `AGENTS.md`。**

---

## Claude Code 專屬設定

### Skills（可呼叫的技能）

| Skill | Path | When to use |
|-------|------|-------------|
| **chapter_stats** | `.agent/skills/chapter_stats/SKILL.md` | 字數/章數/進度查詢。呼叫 `scripts/chapter-stats.mjs` |
| git_sync | `.agent/skills/git_sync/scripts/sync_dev.ps1` | 同步 main 到 dev |
| add_new_novel | `.agent/skills/add_new_novel/SKILL.md` | 新增小說專案 |
| novel_publishing | `.agent/skills/novel_publishing/SKILL.md` | 發布流程 |
| isbn_batch | `.agent/skills/isbn_batch/SKILL.md` | ISBN 批次申請 |
| epub_build | `.agent/skills/epub_build/SKILL.md` | 打包 EPUB 電子書 |

### 封面圖片

- **Tool**: Google Gemini (Nano Banana model)
- **Style**: Cinematic scene illustration, photorealistic — NO text/words/titles/names in image
- **Prompt prefix**: `Cinematic scene illustration, NO TEXT NO WORDS NO LETTERS anywhere.`
- **Naming**: `{chapterNum}-cover.png`
- **Locations** (must exist in both):
  - `projects/{novel}/_publish/assets/chapters/` (source)
  - `site/public/assets/{novel}/chapters/` (published)
- **Frontmatter**: Add `cover: "01-cover.png"` to the chapter `.md` file

### Multi-Agent 分析

深度分析任務（連續性審查、角色一致性、情節線索）可用 Task sub-agents 平行處理：
- 每部小說一個 agent
- 用 TaskCreate/TaskUpdate 追蹤進度
- 最後整合報告
