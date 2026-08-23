# API 速查（查證日：2026-08-23）

全部走 skill + 腳本，不用 MCP。參數對應在 [models.json](models.json)，
OpenRouter 影片 API 的完整規格在 [openrouter_video_api.md](openrouter_video_api.md)（官方原文）。

**兩把 key，都在 repo 根目錄 `.env`：** `GOOGLE_API_KEY` 出圖、`OPENROUTER_API_KEY` 出片
（＝ `SEEDANCE2`，同一把，別名是為了讓官方 skill 也讀得到）。

---

## 出圖：Gemini

`POST https://generativelanguage.googleapis.com/v1beta/interactions`，header `x-goog-api-key`。

| model | 角色一致性上限 | 輸入圖上限 | 價格/張 | 用途 |
|---|---|---|---|---|
| `gemini-3-pro-image` | 5 個角色 | 14 張 | $0.134 (1K/2K)、$0.24 (4K) | 定稿首幀 |
| `gemini-3.1-flash-image` | 4 個角色 | 14 張 | $0.034 (1K)、$0.05 (2K) | 草稿試錯 |

```jsonc
{
  "model": "gemini-3-pro-image",
  "input": [
    { "type": "text", "text": "<編譯好的首幀 prompt>" },
    { "type": "image", "mime_type": "image/jpeg", "data": "<BASE64 ref_front>" }
  ],
  "response_format": { "type": "image", "aspect_ratio": "9:16", "image_size": "2K" }
}
```

輸入圖順序要與 prompt 裡 CHARACTER 1/2 的順序一致。輸入圖計費 $0.0011/張，可忽略。
repo 現有的 `@google/generative-ai` 是舊 SDK，直接 fetch 上面的 REST 即可。產出含 SynthID 隱形浮水印。

---

## 出片：OpenRouter `/api/v1/videos`

一把 key 打 24 個影片模型（Seedance、Veo、Kling、Hailuo、Wan、Runway、Grok、Sora）。
**非同步**：submit → poll → download，一鏡 30 秒到幾分鐘。

```
POST /api/v1/videos              → { id, polling_url, status: "pending" }
GET  {polling_url}               → 每 ~30s 一次，直到 status: "completed"
                                   終止失敗態：failed / cancelled / expired（把 error 原文吐出來）
GET  /api/v1/videos/{id}/content?index=0   → MP4 bytes（要帶 auth header）
```

### 送出前必做

```bash
node scripts/video/video-models.mjs --i2v          # 列出支援首幀的模型 + 成本估算
node scripts/video/video-models.mjs bytedance/seedance-2.5   # 單一模型完整能力
```

`duration` / `resolution` / `aspect_ratio` / `frame_type` **都是逐模型限定**，
送不在 `supported_*` 集合裡的值會 400。`supported_durations` 常是離散值（Veo 只有 4/6/8）而不是範圍。

### 請求主體

```jsonc
{
  "model": "bytedance/seedance-2.0-mini",
  "prompt": "<動作 prompt，只寫會動的東西>",
  "duration": 10,
  "size": "720x1280",          // 9:16 直式。size 等同 resolution + aspect_ratio
  "generate_audio": false,     // 一律 false：旁白分離，音訊也加價
  "seed": 12345,               // 有 seed 能力的模型才生效，記進 manifest
  "frame_images": [
    { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." },
      "frame_type": "first_frame" }
  ]
}
```

- `frame_images[]`：圖生影片。`frame_type` 只能用該模型 `supported_frame_images` 列的值。
  首尾幀就送兩個 entry（`first_frame` + `last_frame`）。
- `input_references[]`：參考圖生影片，同樣結構但**沒有** `frame_type`。
  兩個陣列都給時 `frame_images` 優先。
- 圖片可以直接塞 data URI，不必先上傳。首幀 JPG 約 150KB，完全夠用。
- 廠商專屬參數走 `provider.options.<slug>.parameters.<key>`，允許的 key 見該模型的
  `allowed_passthrough_parameters`，語意要查上游廠商文件（Google 用 camelCase，多數其他家用 snake_case）。

### 支援首幀的模型與一鏡成本（9:16 720p，無音訊）

只有 `supported_frame_images` 含 `first_frame` 的模型能用——臉鎖在首幀是本管線的地基。
**`openai/sora-2-pro` 不支援首幀，不能用。**

| 用途 | 模型 | 一鏡 | 備註 |
|---|---|---|---|
| 草片 | `bytedance/seedance-2.0-mini` | $0.76 / 10s | 與定稿同家族，動作 prompt 反應接近 |
| 最省 | `google/veo-3.1-lite` | $0.24 / 8s | 只支援 4/6/8 秒，節奏要遷就模型 |
| 標準 | `bytedance/seedance-2.0` | $1.51 / 10s | 有 1080p / 4K |
| 定稿 | `bytedance/seedance-2.5` | $2.31 / 10s（480p $1.03） | 單鏡最長 30 秒、多模態參考 |
| 備選 | `kwaivgi/kling-v3.0-std` | $0.84 / 10s | 支援首尾幀 |

完整表跑 `video-models.mjs`。Seedance 系是 token 計價：`tokens = (W×H×秒×24)/1024`，
單價見 `pricing_skus.video_tokens`。**OpenRouter 的 Seedance 單價是 fal 的一半。**
上表是推估，第一鏡跑完用回傳的 `usage` 校正。

### 廠商專屬參數（`provider.options.<slug>.parameters`，實際查到的）

| 模型 | 可用 key | 值得用的 |
|---|---|---|
| `bytedance/seedance-2.0-mini` | `watermark` `req_key` `return_last_frame` | **`return_last_frame`：唯一會回尾幀圖的模型**，草片階段規劃連戲很方便 |
| `bytedance/seedance-2.5` | `watermark` `req_key` `output_format` | — |
| `bytedance/seedance-2.0` / `-fast` / `1-5-pro` | `watermark` `req_key` | — |
| `kwaivgi/kling-v3.0-*` | `negative_prompt` `cfg_scale` | 兩個都有用，可以壓掉不要的東西 |
| `google/veo-3.1*` | `personGeneration` `negativePrompt` `conditioningScale` `enhancePrompt` | **`personGeneration`：Veo 對生成真人有預設限制，拍人一定要處理** |
| `alibaba/wan-2.7` | `last_image` `negative_prompt` `prompt_extend` 等 | `last_image` 是它的尾幀入口 |

完整清單看該模型的 `allowed_passthrough_parameters`；語意要查上游廠商文件。

### 三個會咬人的地方

- `generate_audio` 預設 true，**一律設 false**。旁白分離，而且音訊加價。
- **除了 `seedance-2.0-mini`，其他模型不回傳尾幀圖。** 要接續鏡頭自己抽：
  `ffmpeg -sseof -0.1 -i clips/s03.mp4 -frames:v 1 frames/s04_from_tail.jpg`
  自己抽其實更好——可以先看一眼再決定用不用。
- Seedance 有 `watermark` passthrough 參數。**第一鏡跑完先看右下角有沒有浮水印**，
  有的話送 `watermark: false`（沒實測過預設值，別假設）。

影片生成不適用 ZDR（供應商要暫存輸出供下載）。

---

## 一集成本（8 鏡 × 10 秒 = 80 秒，9:16 720p）

| 項目 | 省 | 標準 | 全開 |
|---|---|---|---|
| 首幀（含試錯） | $2 | $3 | $5 |
| 影片 | $6.1（2.0-mini） | $12.1（2.0） | $18.5（2.5） |
| 重試係數 | ×1.5 | ×1.5 | ×2 |
| 旁白 + 配樂 | $1 | $2 | $3 |
| **合計** | **~$13** | **~$25** | **~$50** |

Seedance 2.5 單鏡可到 30 秒。長鏡頭省連戲工，但動作 prompt 更難寫、重跑一次燒三倍——
先用 10 秒鏡建立節奏，確定要長鏡再放。

---

## fal（備案，目前未使用）

同樣的 Seedance 2.5 在 fal 上單價是 OpenRouter 的兩倍，且要另開帳號。
只有在 OpenRouter 拿不到某個模型時才考慮。fal 的 schema 查詢：
`https://fal.ai/api/openapi/queue/openapi.json?endpoint_id={endpoint}`。
