# 小說 → AI 影片：管線設計提案

> 狀態：**提案，尚未實作**。2026-08-22 評估。
> 目標：在 Claude Code + 本 repo 內完成「小說 → 劇本 → 分鏡 → 出圖 → 出片 → 合成」，外部 API 付費，人臉/場景/道具跨鏡頭一致。

---

## 0. 現況盤點

**已經有的**
- `projects/LostInRetrospect/_meta/scripts/ep0{1,2,3}_short.md` — 手寫劇本，已含 Character Bible、每鏡的出圖 prompt + 影片 prompt + 旁白稿。格式其實已經很接近分鏡表。
- `projects/LostInRetrospect/_publish/assets/storyboards/ep01/` — 7 張已生成的分鏡圖。
- `projects/*/_dev/characters/*_portrait.png` — 角色定妝照（白露系列已有兩張）。
- `scripts/generate-images.js` — Gemini 出圖腳本（章節封面用）。
- `.env` 有 `GOOGLE_API_KEY`。

**缺的**
- 分鏡沒有機器可讀格式 → 每次都要人肉複製 prompt 到網頁 UI。
- 沒有「資產聖經」：角色/場景/道具沒有鎖定的參考圖，一致性靠 prompt 文字描述硬撐。
- 沒有影片 API 串接、沒有成本紀錄、沒有重試/續跑。
- 沒有 ffmpeg（本機 `command -v ffmpeg` 沒有東西）→ 合成這段目前是空的。

**現有 prompt 的兩個地雷**
1. 用「facial features resembling 金城武 / 湯唯」當一致性錨點 → 多數 API 對真人名人肖像有內容政策限制，會拒生成或降級。要改成參考圖錨定。
2. 影片 prompt 內嵌中文 voiceover → 已知中文語音品質不足（見 memory）。維持旁白分離。

---

## 1. 核心判斷：一致性鎖在「圖」這一層，不是影片層

問題問的是「要用文字還是範例圖片」。答案是：**兩者都要，但分工要對。**

- 純文字 → 影片（t2v）：臉是模型每次從 prompt 重新採樣，跨鏡頭必漂移。**不要用在有人臉的鏡頭。**
- 正確做法：**身份在靜態圖階段解決，影片階段只負責「動」**。
  1. 每個角色先做一組鎖定的參考圖（character sheet：正面 / 3-4 側 / 全身 / 手部特寫，中性光）。
  2. 每一個分鏡的**首幀**用 Nano Banana Pro（`gemini-3-pro-image`）生成，把該鏡出場角色的參考圖一起餵進去（最多 14 張輸入圖 / 5 個角色）。這一步便宜，可以無限重試到臉對為止。
  3. 首幀定稿後才送影片 API 做**圖生影片（i2v）**。影片模型拿到的是一張已經正確的臉，它只要讓它動起來。
  4. 需要角色出現在靜態圖建立不了的環境時，才用 **reference-to-video**（`input_references[]`）。
  5. 連續動作跨鏡頭：用 ffmpeg 抽上一鏡的尾幀當下一鏡的首幀（API 不回傳尾幀，自己抽反而能先看一眼再決定用不用）。

一致性不只是人臉。本系列的道具是敘事核心（錶、藍絲巾、銀手鐲、斑馬線）——道具與場景同樣要建 ref 圖，同樣餵進首幀生成。

---

## 2. 目錄結構

```
projects/{slug}/_dev/media/
  cast/                          # 資產聖經（跨集共用，git 追蹤）
    CHAR-M/
      profile.yaml               # canonical 英文描述 + 禁止詞 + 服裝變體
      ref_front.jpg  ref_34.jpg  ref_full.jpg  ref_hands.jpg
    CHAR-F/ ...
    LOC-WORKSHOP/  PROP-WATCH/  ...
  ep02/
    01_script.md                 # 劇本（人審 gate 1）
    02_shots.json                # 分鏡表 — 唯一真實來源（人審 gate 2）
    frames/  s01_v3.jpg ...      # 首幀圖（人審 gate 3）
    clips/   s01.mp4 ...         # 影片片段
    audio/   vo_s01.wav  bgm.wav
    out/     ep02.mp4  ep02.srt
    manifest.json                # 每鏡狀態 / 用了哪個模型 / 花了多少 / 檔案 hash
    cost.md                      # 成本帳（人看的）
```

`_dev/media/` 不會被 `sync-chapters.js` 同步到網站，安全。

---

## 3. `shots.json` — 管線的唯一真實來源

Claude 負責「填這張表」，腳本負責「把表編譯成各家 API 的 prompt」。不要讓模型每次自由發揮 prompt，否則不可重現、不可 diff、不可局部重跑。

```jsonc
{
  "episode": "ep02",
  "novel": "LostInRetrospect",
  "aspect": "9:16",
  "shots": [
    {
      "id": "s01",
      "duration": 10,
      "cast": ["CHAR-F", "CHAR-M"],        // 對應 cast/ 目錄
      "location": "LOC-LIBRARY",
      "props": ["PROP-SCAR"],
      "framing": "medium shot, backlit, three-quarter view",
      "action": "她踮腳拿書，他的手從畫面右側伸入",
      "camera": "static, 35mm",
      "light": "late afternoon golden hour, backlit, dust motes",
      "frame_prompt_extra": "",            // 首幀圖額外指示
      "motion_prompt": "手伸入抓書；她微微轉頭；塵埃緩慢飄動",  // 影片層只寫「動」
      "vo": { "speaker": "VO-M", "text": "她二十歲那年。..." },
      "continuity": { "from_tail_of": null },   // 要接上一鏡尾幀就填 shot id
      "engine": "i2v"                       // i2v | first_last | ref2v
    }
  ]
}
```

編譯規則（腳本做，不是模型做）：
- `frame_prompt = 場景/光線/構圖 + 每個 cast 的 profile.yaml canonical 描述 + 9:16 + 攝影風格尾綴`，並附上 cast/props 的 ref 圖。
- `video_prompt = motion_prompt + 人數標註`，**不含旁白、不含角色外貌**（外貌已經在首幀裡了，重複描述反而會讓模型重畫臉）。
- SRT 字幕從 `vo` 欄位 + 每鏡 duration 自動生成。

---

## 4. 選型與成本（2026-08 查證）

**出圖（一致性層）**
| 模型 | 參考圖能力 | 價格/張 | 用途 |
|---|---|---|---|
| `gemini-3-pro-image`（Nano Banana Pro） | 最多 14 張輸入圖，5 個角色一致性 | $0.134 (1K/2K) | **定稿首幀** |
| `gemini-3.1-flash-image`（Nano Banana 2） | 4 個角色 | $0.034 (1K) / $0.05 (2K) | 草稿、構圖試錯 |

已有 `GOOGLE_API_KEY`，不必開新帳號。注意 SDK：`@google/generative-ai` 已是舊版，圖片走新的 `/v1beta/interactions` endpoint 或 `@google/genai`。

**出片**
| 模型 | 取得管道 | 價格 | 備註 |
|---|---|---|---|
| `bytedance/seedance-2.5` | OpenRouter | $2.31 / 10s | 單鏡最長 30 秒、多模態參考，定稿用 |
| `bytedance/seedance-2.0` | OpenRouter | $1.51 / 10s | 有 1080p/4K |
| `bytedance/seedance-2.0-mini` | OpenRouter | $0.76 / 10s | 草片首選，與定稿同家族 |
| `google/veo-3.1-lite` | OpenRouter | $0.24 / 8s | 最省，但只支援 4/6/8 秒 |
| `kwaivgi/kling-v3.0-std` | OpenRouter | $0.84 / 10s | 備選，支援首尾幀 |

（成本為 9:16 720p 無音訊的一鏡估算，跑 `video-models.mjs` 看完整表）

**走 OpenRouter 當統一入口**：`/api/v1/videos` 一把 key 打 24 個影片模型，換模型只改 config 一行。
使用者本來就有 key（`.env` 的 `SEEDANCE2`）。同樣的 Seedance 2.5，OpenRouter 單價是 fal 的一半
（$0.0000107 vs $0.0000214 每 token），而且不必另開帳號、不必中國實名。

**硬限制**：只能用 `supported_frame_images` 含 `first_frame` 的模型——臉鎖在首幀是整條管線的地基。
`openai/sora-2-pro` 不支援首幀，直接出局。

**一集（8 鏡 × 10 秒 = 80 秒）粗估**
- 首幀：草稿 30 張 flash ($1.5) + 定稿 12 張 pro ($1.6) ≈ **$3**
- 影片：2.0-mini $6.1／2.0 $12.1／2.5 $18.5；重試係數 ×1.5–2
- 旁白 TTS + BGM：$1–3
- **合計：省著做 ~$13／集；標準 ~$25／集；Seedance 2.5 全開 ~$50／集**

先用 2.0-mini 跑完整集確認節奏，再挑 2–3 個關鍵鏡頭用 2.5 重跑。

---

## 5. 音軌與合成

維持既有規範（見 memory `video_production_guide`）：旁白分離、Lyria 純弦樂、影片 prompt 不寫 voiceover。

- 旁白 TTS：ElevenLabs / MiniMax speech 的中文品質目前優於影片模型內建。或維持人聲自錄。
- 合成：ffmpeg concat + 音軌混音（旁白 -3dB，BGM -22dB 壓在底下）+ 燒字幕。
- **前置需求：本機要裝 ffmpeg**（`winget install Gyan.FFmpeg`）。

---

## 6. 為什麼是 Skill + Node 腳本，不是 MCP

- 這是長時間非同步工作（影片 API 是 submit → poll，一鏡可能幾分鐘）、大量檔案落地、要能斷點續跑、要記帳。MCP 適合互動式單次呼叫，不適合這種批次管線。
- OpenRouter / Gemini 都是純 HTTP，Node 直接打就好，跟 repo 現有 `scripts/*.mjs` 風格一致。
- 曾經考慮 fal 官方 MCP（`mcp.fal.ai/mcp`），唯一的賣點是模型與 schema 查詢——但這些資料本來就是
  公開的機器可讀端點（OpenRouter 是 `GET /api/v1/videos/models`），一個 fetch 就有，而且可以 pin 進 git。
  已改由 `scripts/video/video-models.mjs` 提供，MCP 拿掉。
- OpenRouter 官方有一份 `openrouter-video` skill，已收進 `references/openrouter_video_api.md`（原文）。
- Skill 負責「Claude 該怎麼想」（劇本、分鏡、審圖），腳本負責「機器該怎麼做」（呼叫、重試、記帳、合成）。兩者不要混。

規劃中的腳本：
```
scripts/video/
  video-models.mjs    # ✅ 已完成。查影片模型能力與成本（取代 MCP 的 schema lookup）
  cast-sheet.mjs      # 從 portrait 生成角色多角度參考圖 → cast/
  gen-frames.mjs      # shots.json → frames/（--shot s03 可單鏡重跑）
  gen-clips.mjs       # frames/ → clips/（OpenRouter submit → poll → download）
  gen-audio.mjs       # vo → TTS wav；bgm 另外掛
  assemble.mjs        # ffmpeg 合成 + SRT
  qc-sheet.mjs        # 每個 clip 抽首/中/尾幀拼成 contact sheet 供人審與 Claude 審
  lib/ manifest.mjs cost.mjs adapters/
```

Skill：
```
.agent/skills/video_production/          # 正本（Gemini/Codex/Cursor 也讀得到）
  SKILL.md            # 觸發詞、流程、每個 gate 要問什麼
  references/
    script_format.md  # 小說 → 劇本的規則（鏡頭語言、每鏡 8-10 秒的旁白字數上限）
    shots_schema.json # 分鏡表 schema
    prompt_rules.md   # 首幀 prompt / 動作 prompt 的編譯規則與禁止詞
    models.json       # 模型註冊表：endpoint、參數對應、價格、verified 日期
    api_reference.md  # API 細節與探索方式
    openrouter_video_api.md  # OpenRouter 影片 API 官方規格（原文）
.claude/skills/video-production/SKILL.md # 薄殼，讓 Claude Code 能用 /video-production
```

---

## 7. 人審 Gate（花錢前一定要卡）

1. **劇本** — 免費。哪些場景入鏡、旁白稿。
2. **分鏡表** — 免費。鏡頭數、時長、engine 選擇。
3. **角色參考圖** — $ 少。一次做好可跨集重用，這關最值得磨。
4. **首幀圖** — $ 少。臉錯就重跑，這關過不了不准往下走。
5. **試片（1–2 鏡低價模型）** — $ 少。確認動作 prompt 有效。
6. **全集出片** — $$$。

---

## 8. 落地順序

**Phase 1（半天，先證明能跑通）**
- `cast-sheet.mjs` + `gen-frames.mjs`
- 拿 `ep02_short.md` 手動轉一份 `02_shots.json`
- 目標：8 張首幀圖，兩個角色的臉在 8 張裡是同一個人

**Phase 2（一天）**
- OpenRouter adapter + `gen-clips.mjs` + manifest/成本記帳
- 裝 ffmpeg，`assemble.mjs` 出第一支完整 EP

**Phase 3**
- `SKILL.md` + 小說→劇本→shots.json 自動化
- `qc-sheet.mjs` 一致性審查
- 回頭把 ep01/ep03 重製

