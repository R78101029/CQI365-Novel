# API 速查（查證日：2026-08-22）

**全部走 skill + 腳本，不用 MCP。** 參數對應表在 [models.json](models.json)，腳本從那裡讀。

## 模型探索：不需要 MCP

fal 每個模型都有公開的機器可讀 schema，一個 fetch 就拿得到：

```bash
node scripts/video/fal-schema.mjs bytedance/seedance-2.5/image-to-video   # 人看的
node scripts/video/fal-schema.mjs <endpoint> --raw                        # 完整 OpenAPI
```

- OpenAPI：`https://fal.ai/api/openapi/queue/openapi.json?endpoint_id={endpoint}`（不需 key）
- LLM 版文件：`https://fal.ai/models/{endpoint}/llms.txt`
- 找新模型：`https://fal.ai/models`，或用 firecrawl 搜。

**寫任何 adapter 前先跑 `fal-schema.mjs`。** 各家參數名稱差很多，照抄別的模型必錯。
驗過的結果回填到 `models.json` 並標上 `verified` 日期。

---

## 出圖：Gemini（`GOOGLE_API_KEY` 已在 repo `.env`）

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
    { "type": "image", "mime_type": "image/jpeg", "data": "<BASE64 ref_front>" },
    { "type": "image", "mime_type": "image/jpeg", "data": "<BASE64 ref_34>" }
  ],
  "response_format": { "type": "image", "aspect_ratio": "9:16", "image_size": "2K" }
}
```

輸入圖計費 $0.0011/張，可忽略。輸入圖順序要與 prompt 裡 CHARACTER 1/2 的順序一致。
repo 現有的 `@google/generative-ai` 是舊 SDK，圖片走上面的 REST 直接 fetch 即可。
產出含 SynthID 隱形浮水印。

---

## 出片：fal（`FAL_KEY` 放 repo `.env`，腳本用 dotenv 讀）

```bash
npm install --save @fal-ai/client
```

```js
import { fal } from '@fal-ai/client';
fal.config({ credentials: process.env.FAL_KEY });

// 影片一定要走 queue，不要用同步呼叫
const { request_id } = await fal.queue.submit('bytedance/seedance-2.5/image-to-video', { input });
const status = await fal.queue.status(endpoint, { requestId: request_id, logs: true });
const result = await fal.queue.result(endpoint, { requestId: request_id });
```

**檔案輸入**：可以直接塞 base64 data URI，不必先上傳（首幀 JPG 約 150KB，完全夠用）。
需要 CDN URL 時用 `fal.storage.upload(file)`。

### Seedance 2.5 image-to-video（已驗證）

| 參數 | 值 | 備註 |
|---|---|---|
| `image_url` *(必填)* | 首幀圖 URL 或 data URI | JPEG/PNG/WebP，上限 30MB |
| `prompt` *(必填)* | 動作描述 | 只寫會動的東西 |
| `end_image_url` | 尾幀圖 | **填了就是首尾幀模式**，不需要另一個 endpoint |
| `duration` | `"4"`–`"30"` 或 `"auto"`（字串！） | 單鏡最長 **30 秒** |
| `resolution` | `480p` / `720p` / `1080p` | 預設 720p |
| `generate_audio` | **預設 true，一律設 false** | 我們旁白分離，而且音訊會加價 |
| `aspect_ratio` | i2v 恆為 `auto` | **畫幅由輸入圖決定** → 9:16 在出圖階段就定了 |

回傳 `{ video, seed }`。**注意：fal 不回傳尾幀圖**（火山引擎 Ark 才有）。
要接續鏡頭就自己抽：`ffmpeg -sseof -0.1 -i clips/s03.mp4 -frames:v 1 frames/s04_from_tail.jpg`。
自己抽其實更好——可以先看一眼再決定用不用。

### Seedance 2.5 reference-to-video（已驗證）

`image_urls[]` / `video_urls[]` / `audio_urls[]`，prompt 內用 `[Image1]` `[Video1]` `[Audio1]` 位置式指涉。
這個 endpoint 的 `aspect_ratio` 可以明確給 `9:16`。

### 其他候選（endpoint 未驗證，用前先跑 fal-schema.mjs）

| 模型 | 價格 | 用途 |
|---|---|---|
| MiniMax H3 | $0.08/s @768p | 跑草片、確認節奏 |
| Vidu Q3 ref2v | ~$0.11–0.13/s，1–4 張參考圖 | 一致性 CP 值最高 |
| LTX-2.5 Pro | $0.12/s @720p | 中間帶 |
| Kling O3 | $0.42/s @4K | 高階備案 |

---

## 一集成本（8 鏡 × 10 秒 = 80 秒）

| 項目 | 省 | 標準 | 全開 |
|---|---|---|---|
| 首幀（含試錯） | $2 | $3 | $5 |
| 影片 | $6（H3 768p） | $18（Seedance 480p） | $38（Seedance 720p） |
| 重試係數 | ×1.5 | ×1.5 | ×2 |
| 旁白 + 配樂 | $1 | $2 | $3 |
| **合計** | **~$13** | **~$34** | **~$89** |

Seedance 單鏡可以到 30 秒，長鏡頭比多鏡拼接省錢也省連戲工，但**長鏡頭的動作 prompt 更難寫**，
且失敗重跑一次就燒掉三倍。先用 10 秒鏡建立節奏，確定要長鏡再放。
