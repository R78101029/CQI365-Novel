---
name: comic_production
description: 小說 → 寫實風 AI 條漫管線。實體聖經（角色依年份分版本）、02_strip.json 分格表、驗證、prompt 編譯、一格一圖、HTML 嵌字排版、contact sheet 一致性關卡。用於「把某章做成漫畫／條漫」「分格」「嵌字」「漫畫角色跑掉了」等任務。
---

# 小說 → AI 條漫 管線

影片管線（`video_production`）的姊妹管線，**共用同一份實體聖經**（`_dev/media/character_refs/`、`asset_refs/`）。
角色在漫畫和影片裡必須是同一張臉，所以 ref 圖只做一次。

## 核心原則

1. **一格一張圖。** 不准叫模型畫整頁多格——多格之間一定換臉。
2. **字不進圖。** 對白、旁白、音效、白板字全部是 `build-strip.mjs` 疊的 HTML 層。改字不重出圖。
3. **`02_strip.json` 是唯一真實來源。** prompt 由 `compile.mjs` 編譯，不手寫。
4. **結構鎖，不靠檢查鎖。** 光線、服裝、角色版本寫在 **scene** 層，格子無法各自改——連戲錯誤從結構上就不可能發生。
5. **花錢前先過 validate。** 有 ERROR 不准出圖。

## 檔案

```
projects/{slug}/_dev/media/
  character_refs/CHAR-*.md          # frontmatter：canonical（不隨時間變）+ variants（依年份）
  character_refs/CHAR-*/{variant}/ref_*.jpg
  asset_refs/{LOC,PROP,STYLE}-*.md  (+ 同名資料夾放 ref)
  continuity.yaml                   # 跨章帳本：每章的版本／服裝／狀態
  comic/{epNN}/01_beats.md          # 節拍：取捨 + 格表
  comic/{epNN}/02_strip.json        # 分格表
_output/comic/{slug}/{epNN}/        # 不進版控：prompts/ panels/ strip.html strip.png contact_*.png
```

### 實體的幾個 IRIS 慣例
- **時間版本**：`variants.y2026.years: [2026, 2029]`。scene 給 `year`，自動挑版本。老化版用前一版定稿 ref 當種子產生後鎖死；不准單格寫 "older"。
- **畫風是實體**：`STYLE-*` 有 `suffix`、`palette.reserved`（保留色，例：紅色只屬於監視器紅點）、`forbid_words`、mood ref。
- **場景光線是預設**：`LOC-*.light_presets`，scene 指定一個 key。
- **文字表面**：道具 `text_surface: true`（白板、螢幕）→ 出圖要求留白，字走 `letters[].type: board`。
- **設定衝突**：人物總表與正文衝突時，裁決寫在該角色 md 正文（例：林彥廷 2026 年的連帽衫）。

## 流程（一次一步，做完給使用者看）

| 關 | 做什麼 | 指令 |
|---|---|---|
| 0 | 設定抽取：每部書一個 sub-agent，抽外貌／場景／道具描寫＋出處，列出衝突 | — |
| 1 | 畫風 ref（3 張 mood），使用者選定後鎖 | `gen-frame.mjs` |
| 2 | 角色／場景／道具 ref（正面、3/4、全身、手；中性光、純背景），選定後鎖 | `gen-frame.mjs` |
| 3 | 節拍 `01_beats.md` → `02_strip.json` | Claude 撰寫 |
| 3.5 | 驗證 | `node scripts/comic/validate.mjs --strip <json>` |
| 3.6 | 占位排版：還沒出圖就先看節奏、留白、對白框位置（免費） | `node scripts/comic/build-strip.mjs --strip <json> --png` |
| 4 | 編譯＋出圖（先 draft，一格一格看） | `node scripts/comic/compile.mjs --strip <json> [--panel p04] [--run] [--model draft\|pro]` |
| 5 | **一致性關卡**：每個角色一張 contact sheet，判準只有「是不是同一個人」 | `build-strip.mjs --contact CHAR-X --png` |
| 6 | 成品排版 | `build-strip.mjs --png` |

## `02_strip.json` 要點

- `scenes[]`：`year`、`location`、`light`（preset key）、`cast: {CHAR-ID: wardrobe_key}`。
- `panels[]`：`scene`、`aspect`（1:1 3:4 4:3 4:5 5:4 9:16 16:9 21:9）、`gap_before`（none/normal/long——條漫的時間感靠留白）、
  `cast[{id, visible, pose, face}]`（`face` 用 AU 肌肉記法，不命名情緒）、`props[{id, place}]`、`view`、`framing`、`action`（中文給人看）、`extra`、`letters[]`。
- `letters[]`：`type` = speech／caption／sfx／board；`x y w` 為格內百分比；`tail` = bottom-left 等；`speaker` 必須在格內，否則 `offscreen: true`。
  compile 會依對白位置要求那一區留白、不放臉。

## validate 擋什麼

實體不存在｜沒有涵蓋該年份的版本｜服裝 key 不存在｜與 continuity.yaml 不符｜格內角色沒登記在 scene｜
說話者不在格內｜嵌字出界｜禁止詞（真人名、空形容、anime…）｜保留色被別的東西用掉｜參考圖 > 14、角色 > 5。
WARN：ref 未建（臉只靠文字會飄）、對白 > 28 字。
