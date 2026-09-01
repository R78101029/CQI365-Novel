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

## 動手之前先跑這個

```bash
node scripts/video/status.mjs --shots <02_shots.json>
```

報告走到哪一步、下一步該做什麼、以及**哪些下游比上游新**（改了 shots.json 卻沿用舊的
animatic，看到的節奏就不是實際會出的節奏——那是最容易靜悄悄出錯的地方）。

**一次只做一步，做完給使用者看，確認再往下。** 要批次處理時先做一個樣本確認格式。
這條是硬規定：EP01 就是因為跳關才會先出圖才想到資產聖經、13 支片段批次跑掉漏了一支
還退出碼 0。文件寫了 gate 是不夠的，每次開工先看 status。

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
projects/{slug}/_dev/media/            ← 進版本庫。只放小的、決定性的東西
  cast/{ENTITY_ID}/profile.yaml
  cast/{ENTITY_ID}/ref_*.jpg           # 角色/場景/道具參考圖（身份定義，要版控）
  {epNN}/01_script.md
  {epNN}/02_shots.json                 # 分鏡表

_output/video/{slug}/{epNN}/           ← 不進版本庫（_output/* 已整個 ignore）
  frames/   clips/   audio/   out/
  manifest.json   cost.md
```

**產出一律放 `_output/video/`。** 不要放進 `projects/`——這個 repo 的 `.git` 曾經因為
EPUB 膨脹到 900MB 以上，影片單檔就是幾十 MB。`_dev/media/` 底下另有副檔名層級的保險
規則擋影音檔，但別依賴它：習慣就是產出去 `_output/`。

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

## 階段 3.5：先錄旁白（決定鏡長的是音檔，不是估算）

```bash
node scripts/video/gen-vo.mjs --shots <02_shots.json> --voice Aoede --pace normal
```

**鏡頭長度要照實際音檔定。** 實測過的語速差很大，同一句 31 字：

| 語氣指示 | 長度 | 語速 |
|---|---|---|
| 「平穩克制、**語速偏慢**」 | 13.2s | 2.42 字/秒 |
| 「平穩克制」 | 10.1s | 3.08 字/秒 |
| 無指示（`--pace normal`） | 8.2s | 3.98 字/秒 |

拇指法則「中文 4 字/秒」只有在無語氣指示時才成立。用錯會讓整集鏡長全部算錯——
第一次做 EP01 就是這樣，11 鏡全部塞不下，旁白比畫面長了 30 秒。

`gen-vo.mjs` 錄完會把實測長度與重排的時間軸寫回 `shots.json`，換聲音或改稿重跑即可。

**旁白軌與畫面軌是分開的。** 一句旁白可以橫跨兩個鏡頭，一個鏡頭也可以沒有旁白。
不要寫成「一鏡一句」——那會跟 Veo 最長 8 秒的限制打架，逼出無解的死結。

聲音：`gemini-3.1-flash-tts-preview`。錄一句試不同 voice 再決定（幾乎不計費）。

## 階段 3.6：動態腳本 animatic（花錢前的最後一關）

```bash
node scripts/video/animatic.mjs --shots <02_shots.json>
```

分鏡圖靜止不動 + 旁白照實測時間點鋪上去 + 天數標記，**影片生成費用為零**。
看的是節奏：哪一鏡太長、哪一句擠、哪個切點該提前、總長是不是過長。

節奏在這裡調到對，才去跑 `gen-clip.mjs`。改鏡長只要改 `shots.json` 重跑，不用錢；
出片之後才發現太趕，一支就是 $0.24 起跳。

**天數標記**：時間跳躍的鏡頭用 `shot.day_marker` 標「第 N 天」。
用天數不用日期——那是書本身的計數方式，也符合「數字取代副詞」。

## 階段 4：首幀出圖

**模型**：草稿 `google/gemini-3.1-flash-image` → 定稿 `google/gemini-3-pro-image`（14 張輸入圖 / 5 個角色）
**預設直打 Gemini**（`--via gemini`，2026-08-24 起專案已開帳單）。
OpenRouter 是備援（`--via openrouter`）：定稿模型兩邊同價，草稿直打便宜一半。

```bash
node scripts/video/gen-frame.mjs --prompt-file p.txt --out frames/s01.jpg --ref cast/CHAR-F/ref_front.jpg
```
**編譯規則**：見 [references/prompt_rules.md](references/prompt_rules.md)
**輸出**：`frames/s{NN}_v{N}.jpg`

每一鏡把該鏡 `cast` + `props` + `location` 的參考圖全部附上。臉不對就重跑，這一步便宜。

**Gate 4**：把整集首幀排成一張 contact sheet 給使用者看。判準只有一個——
**這 8 張裡的男主是不是同一個人**。過不了不准往下走。

## 階段 5：出片

**參數對應**：[references/models.json](references/models.json)（腳本從這裡讀，不要 hardcode）
**細節**：[references/api_reference.md](references/api_reference.md)
**輸出**：`clips/s{NN}.mp4`

```bash
# 有人臉的鏡頭
node scripts/video/gen-clip.mjs --image frames/s01.jpg --prompt-file motion.txt \
  --out clips/s01.mp4 --model google/veo-3.1-lite --size 720x1280 --duration 8 \
  --pass personGeneration=allow_adult

# 靜物／空景鏡頭（便宜，且 2.0-mini 可回尾幀）
node scripts/video/gen-clip.mjs --image frames/s04.jpg --prompt-file motion.txt \
  --out clips/s04.mp4 --model bytedance/seedance-2.0-mini --size 720x1280 --duration 10 --tail-frame
```

**先照「這一鏡有沒有人臉」分流**，再談省不省錢——這是硬限制，不是偏好：

| 鏡頭 | 模型 | 720p 每秒 | 時長 | 音訊可關 | seed |
|---|---|---|---|---|---|
| 有人臉（預設） | `google/veo-3.1-lite` + `personGeneration=allow_adult` | $0.030 | 4/6/8 | ✅ | ✅ |
| 有人臉·要 3–15 秒 | `kwaivgi/kling-v3.0-std` | $0.084 | 3–15 | ✅ | ❌ |
| 有人臉·要 1–2 秒短切 | `x-ai/grok-imagine-video` | $0.070 | 1–15 | ❌ | ❌ |
| 靜物、空景 | `bytedance/seedance-2.0-mini` | $0.076 | 4–15 | ✅ | ✅ |
| 靜物定稿 | `bytedance/seedance-2.5` | $0.231 | 4–30 | ✅ | ✅ |

以上都是實測（2026-08-24）。Seedance 拒收寫實人臉，另外三家都收。

Veo 只吃 4/6/8 秒，所以有人臉的鏡頭節奏預設要遷就它——它是唯一有 seed 的，
跑出好的一鏡可以重現。Kling 慢（5 秒要跑 150 秒）且輸出尺寸會被它自己調
（要 720x1280 給 716x1284），合成前要 ffmpeg scale 統一。Grok 一定帶音軌，要 `-an` 剝掉。

動作 prompt 通常要改兩三輪，先跑一鏡確認，不要一次全開。

走 OpenRouter `/api/v1/videos`（非同步 submit → poll → download），一把 key 打 24 個模型。

**送出前必跑**，各參數都是逐模型限定，送錯值直接 400：

```bash
node scripts/video/video-models.mjs --i2v      # 支援首幀的模型 + 一鏡成本
```

**最重要的一條（2026-08-23 實測）：Seedance 拒收含真人的寫實首幀。**
送 `bytedance/seedance-2.0-mini` 一張寫實人物首幀，submit 直接 400：
`InputImageSensitiveContentDetected.PrivacyInformation`（不計費）。
**有人臉的鏡頭一律走 `google/veo-3.1-lite`，並帶 passthrough `personGeneration=allow_adult`**——
實測可過，720x1280 8 秒 94 秒完成 $0.24。Seedance 留給靜物與空景鏡頭。

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

## 階段 6：合成

```bash
node scripts/video/assemble.mjs --shots <02_shots.json>
```

讀同一份 `shots.json` 的三軌：畫面（`clips/`）、旁白（`audio/` + `vo_track` 時間點）、
天數標記。與 animatic 同一套時間軸，所以動態腳本調好的節奏直接沿用。

- 各段一律重新縮放對齊，**不用 stream copy**——Kling 要 720x1280 會給 716x1284
- 最後一段用 `tpad` 凍結尾幀，把收尾的沉默留出來
- **不要用 `-shortest`**：旁白結束後的沉默是刻意的，會被它切掉

配樂另外掛：Lyria（`lyria-3-pro-preview`，Google 直打或 OpenRouter 都有）。
純弦樂、無固定節拍、動態壓在 pp–mp，壓在旁白底下。

## 階段 7：QC

抽每個 clip 的首/中/尾幀拼 contact sheet，檢查：
1. 身份漂移（臉、髮型、服裝）
2. 道具連續性（同一支錶、同一條絲巾）
3. 光線方向與色溫跨鏡是否打架
4. 有沒有出現文字／浮水印／多餘的手指

---

## 腳本

| 階段 | 腳本 | 說明 |
|---|---|---|
| 模型探索 | `video-models.mjs` | 查影片模型能力與一鏡成本，送出前必跑 |
| 3.5 旁白 | `gen-vo.mjs` | Gemini TTS，錄完把實測時間軸寫回 shots.json |
| 3.6 動態腳本 | `animatic.mjs` | 分鏡圖 + 旁白，零成本，出片前的節奏關 |
| 4 出圖 | `gen-frame.mjs` | `--via gemini`（預設）/ `openrouter`；`--ref` 鎖場景與角色 |
| 5 出片 | `gen-clip.mjs` | submit → poll → download，`--pass` 廠商專屬參數 |
| 6 合成 | `assemble.mjs` | 剪輯 + 旁白 + 天數標記 + 尾幀停留 |

單鏡與整集都可用。還沒做的是 manifest 記帳（每鏡用了哪個模型／seed／花多少）。

## 一集的實際流程（EP01 半成品做過一輪）

```bash
# 1-2 劇本與分鏡表由 Claude 寫，人審
# 3.5 旁白先行——鏡長照音檔定
node scripts/video/gen-vo.mjs   --shots <shots.json> --voice Aoede --pace normal
# 4 分鏡圖（鏈式參考圖鎖同場景：先出一張，後面的 --ref 它）
node scripts/video/gen-frame.mjs --prompt-file <p.txt> --out frames/s01.jpg --model pro --size 2K
# 3.6 動態腳本——零成本，節奏不對就回去改 shots.json 重跑
node scripts/video/animatic.mjs --shots <shots.json>
# 5 出片（13 支要跑 20 分鐘以上，放背景）
node scripts/video/gen-clip.mjs --image frames/s01.jpg --prompt-file clips/s01.motion.txt   --out clips/s01.mp4 --model google/veo-3.1-lite --size 720x1280 --duration 8   --pass personGeneration=allow_adult
# 6 合成
node scripts/video/assemble.mjs --shots <shots.json>
```

## 為什麼不用 MCP

評估過 fal 官方 MCP，拿掉了。它唯一不可替代的是模型與 schema 查詢，
而這些資料本來就是公開的機器可讀端點——OpenRouter 是 `GET /api/v1/videos/models`，
一個 fetch 就有每個模型的 `supported_durations` / `supported_frame_images` / `pricing_skus`。

全走 skill + 腳本換到的東西：金鑰只需放 `.env`（不必設系統環境變數、不必重開）、
能力表可以 pin 進 git 而不是每次線上查、Gemini/Codex/Cursor 也能用同一套、
context 不必常駐一堆 MCP tool 定義。
