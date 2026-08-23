---
name: video_production
description: 小說 → 微短劇影片的完整管線。劇本、分鏡（shots.json）、角色/場景/道具參考圖鎖定、首幀出圖、圖生影片、旁白與合成。用於「把某章做成影片／短劇」「做 EP0X」「分鏡」「角色參考圖」「出片」等任務。
---

# 小說 → AI 影片 管線

> 設計理由與選型評估見 [PLAN.md](PLAN.md)。本文件是執行規範。

## 核心原則（違反這幾條，後面全部白做）

1. **身份鎖在圖，不鎖在影片。** 人臉一致性用「參考圖 + 首幀出圖」解決；影片模型只負責讓已經正確的畫面動起來。任何有人臉的鏡頭都不准走純文字生影片。
2. **不准用真人明星當外貌錨點。** 現有舊劇本裡的「resembling 金城武／湯唯」要全部換成 `cast/` 的參考圖 + `profile.yaml` 的文字描述。API 對真人肖像有政策限制，而且明星臉本身就不穩定。
3. **旁白與影片分離。** 影片 prompt 只寫畫面動態，絕不內嵌 voiceover 指令。旁白單獨 TTS 或自錄，後期混音。（既有規範，勿改）
4. **`shots.json` 是唯一真實來源。** 所有 prompt 由它編譯產生，不要每次自由發揮。要改鏡頭就改 json 再重跑該鏡。
5. **花錢前先過 gate。** 出片是整條管線最貴的一步，首幀沒定稿不准出片。

## 前置檢查

```bash
grep -c "GOOGLE_API_KEY\|OPENROUTER_API_KEY" .env   # 應為 2。出圖 + 出片
command -v ffmpeg || echo "ffmpeg MISSING -> winget install Gyan.FFmpeg"
```

金鑰一律放 repo 根目錄 `.env`，腳本用 dotenv 讀（`scripts/*.mjs` 現有作法）。
`OPENROUTER_API_KEY` 與 `SEEDANCE2` 是同一把，別名是為了讓 OpenRouter 官方 skill 也讀得到。
不需要設系統環境變數，也不需要重開 Claude Code。

## 目錄

```
projects/{slug}/_dev/media/
  cast/{ENTITY_ID}/profile.yaml + ref_*.jpg     # 資產聖經，跨集共用
  {epNN}/01_script.md 02_shots.json
         frames/_drafts/        # 試錯圖，不進版本庫
         frames/s01.jpg ...     # 定稿首幀，進版本庫
         clips/ audio/ out/     # 產物，不進版本庫（可由 frames + shots.json 重生）
         manifest.json cost.md
```

實體 ID 命名：`CHAR-*`（角色）、`LOC-*`（場景）、`PROP-*`（道具）。
`_dev/media/` 不會被 `sync-chapters.js` 同步到網站。

---

## 階段 1：選材 → 劇本

**輸入**：`projects/{slug}/chapters/*.md`、`_dev/characters/`、`STYLE_GUIDE.md`
**輸出**：`{epNN}/01_script.md`
**規則**：見 [references/script_format.md](references/script_format.md)

一集 60–90 秒、6–9 個鏡頭。挑的是「一條可獨立成立的情緒線」，不是章節摘要。
林雨果風的轉譯鐵律：**旁白不准解釋情緒，情緒交給畫面**。旁白說「她笑了一整天」，畫面就不要再配一張哭臉去對比——那是替讀者把答案寫完。

**Gate 1（免費）**：把 script 給使用者看。確認鏡頭數、旁白稿、哪些鏡有人臉。

## 階段 2：劇本 → `shots.json`

**輸出**：`{epNN}/02_shots.json`，schema 見 [references/shots_schema.json](references/shots_schema.json)

填表原則：
- `cast` / `location` / `props` 一律填實體 ID，不要在這裡寫外貌描述（外貌在 `profile.yaml`）。
- `motion_prompt` 只寫「會動的東西」。不要寫外貌、不要寫光線（那些已經固化在首幀裡）。
- 需要接續動作的鏡頭填 `continuity.from_tail_of`，出片時用前一鏡的尾幀當首幀。
- `engine` 預設 `i2v`。角色要出現在靜態圖建立不了的環境時才用 `ref2v`。

**Gate 2（免費）**：確認總時長、engine 選擇、有沒有鏡頭超過模型單次長度上限。

## 階段 3：資產聖經（一次做好，跨集重用）

**輸出**：`cast/{ID}/profile.yaml` + 3–5 張鎖定參考圖

角色參考圖組（character sheet）標準：
- `ref_front.jpg` 正面、`ref_34.jpg` 四分之三側、`ref_full.jpg` 全身、`ref_hands.jpg` 手部（修錶師的手是敘事重點）
- **中性光、純色背景、同一套服裝、無情緒表情**。參考圖是身份定義，不是劇照。
- 來源：既有的 `_dev/characters/*_portrait.png` 當種子，用 `gemini-3-pro-image` 多角度重繪。

`profile.yaml` 內容：canonical 英文外貌描述、服裝變體（依時間線）、禁止詞、辨識特徵（疤、手鐲）。

道具與場景同樣建 ref。本系列的物件（錶、藍絲巾、銀手鐲、斑馬線）是敘事核心，長歪了比臉歪更傷。

**Gate 3**：使用者選定參考圖後鎖定。之後不要再改，改了整集的臉就會變。

## 階段 4：首幀出圖

**模型**：草稿 `gemini-3.1-flash-image`（$0.034/張）→ 定稿 `gemini-3-pro-image`（$0.134/張，支援 14 張輸入圖 / 5 個角色）
**編譯規則**：見 [references/prompt_rules.md](references/prompt_rules.md)
**輸出**：`frames/s{NN}_v{N}.jpg`

每一鏡把該鏡 `cast` + `props` + `location` 的參考圖全部附上。臉不對就重跑，這一步便宜。

**Gate 4**：把整集首幀排成一張 contact sheet 給使用者看。判準只有一個——
**這 8 張裡的男主是不是同一個人**。過不了不准往下走。

## 階段 5：出片

**參數對應**：[references/models.json](references/models.json)（腳本從這裡讀，不要 hardcode）
**細節**：[references/api_reference.md](references/api_reference.md)
**輸出**：`clips/s{NN}.mp4`

先用便宜模型（MiniMax H3 $0.08/s）把整集跑完確認節奏，再挑 2–3 個關鍵鏡頭用 Seedance 2.5 720p 重跑。
不要第一次就全開高階，動作 prompt 通常要改兩三輪。

走 OpenRouter `/api/v1/videos`（非同步 submit → poll → download），一把 key 打 24 個模型。

**送出前必跑**，各參數都是逐模型限定，送錯值直接 400：

```bash
node scripts/video/video-models.mjs --i2v      # 支援首幀的模型 + 一鏡成本
```

四件會咬人的事：
- **只能用 `supported_frame_images` 含 `first_frame` 的模型**——臉鎖在首幀是本管線的地基。
  `openai/sora-2-pro` 不支援首幀，不能用。
- `generate_audio` 預設 **true**，一律設 false。旁白分離，而且音訊加價。
- `supported_durations` 常是離散值（Veo 只有 4/6/8 秒），不是範圍。節奏設計要先看模型。
- **只有 `seedance-2.0-mini` 會回尾幀圖**（passthrough `return_last_frame`）。其他模型要接續鏡頭自己抽：
  `ffmpeg -sseof -0.1 -i clips/s03.mp4 -frames:v 1 frames/s04_from_tail.jpg`

Seedance 2.5 單鏡可到 30 秒。長鏡頭省連戲工，但動作 prompt 更難寫、重跑一次燒三倍——
先用 10 秒鏡建立節奏，確定要長鏡再放。

每一次呼叫都要寫進 `manifest.json`：模型、參數、seed、花費、產出 hash。續跑靠它。

## 階段 6：音軌與合成

- 旁白：TTS 或自錄，一句一檔 `audio/vo_s{NN}.wav`
- 配樂：Google Lyria，純弦樂、無固定節拍、動態壓在 pp–mp（既有規範，prompt 見 memory）
- 合成：ffmpeg。旁白 -3dB、BGM -22dB（壓在旁白底下）、字幕從 `shots.json` 的 `vo` 欄位生成 SRT

## 階段 7：QC

抽每個 clip 的首/中/尾幀拼 contact sheet，檢查：
1. 身份漂移（臉、髮型、服裝）
2. 道具連續性（同一支錶、同一條絲巾）
3. 光線方向與色溫跨鏡是否打架
4. 有沒有出現文字／浮水印／多餘的手指

---

## 目前實作狀態

| 階段 | 工具 | 狀態 |
|---|---|---|
| 1–3 | Claude + 本 skill | ✅ 可用 |
| 模型探索 | `scripts/video/video-models.mjs` | ✅ 可用 |
| 4 出圖 | `scripts/video/gen-frames.mjs` | ⬜ 未實作 |
| 5 出片 | `scripts/video/gen-clips.mjs` | ⬜ 未實作 |
| 6 合成 | `scripts/video/assemble.mjs` | ⬜ 未實作（本機還沒裝 ffmpeg） |

## 為什麼不用 MCP

評估過 fal 官方 MCP，拿掉了。它唯一不可替代的是模型與 schema 查詢，
而這些資料本來就是公開的機器可讀端點——OpenRouter 是 `GET /api/v1/videos/models`，
一個 fetch 就有每個模型的 `supported_durations` / `supported_frame_images` / `pricing_skus`。

全走 skill + 腳本換到的東西：金鑰只需放 `.env`（不必設系統環境變數、不必重開）、
能力表可以 pin 進 git 而不是每次線上查、Gemini/Codex/Cursor 也能用同一套、
context 不必常駐一堆 MCP tool 定義。
