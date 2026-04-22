# 分鏡提示詞組合工具 (Scene Generation Template - DALL-E/Gemini)

> **使用說明**：在對話式 AI 中生成分鏡時，**必須每一句話都完整帶入「角色特徵通稿」與「全局風格通稿」**。不要指望 AI 自己記得！

## 提示詞拼圖 (Prompt Builder)

當你需要生成一個畫面，請照順序將以下積木組合成一段流暢的自然語言段落（英文最佳）：

### [A] 強制畫面比例與鏡頭尺寸 (Aspect Ratio & Camera)
*   極特寫：`Generate a vertical 9:16 aspect ratio image. Extreme close-up shot of [部位, e.g., hand/eyes],`
*   特寫：`Generate a vertical 9:16 aspect ratio image. Close up shot of`
*   中景：`Generate a vertical 9:16 aspect ratio image. Medium shot of`
*   遠景/大遠景：`Generate a vertical 9:16 aspect ratio image. Wide establishing shot of`

### [B] 一字不漏的角色描述 (Character - 來自 02_character_sheet)
*   `[e.g., a 38-year-old Asian man, short messy dark hair, deeply melancholic tired eyes, pale skin, wearing a dark grey turtleneck sweater and a black apron],`

### [C] 動作、表情與場景細節 (Action & Environment)
*   `[e.g., sitting on the edge of an unmade bed in a dark room. He is looking down sadly, holding a small silver bracelet. Dust particles in the air.]`

### [D] 統一風格段落 (Style Suffix - 來自 01_style_guidelines)
*   `[e.g., Photorealistic cinematic film still, shot on 35mm lens, highly detailed, 8k resolution. Cold blue and grey cinematic color grading, moody tungsten lighting contrast, melancholic atmosphere. Do NOT make it look like an illustration or 3D render, it must look like a high-end emotional movie frame.]`

---

## ✅ 實際拼裝範例 (Example)

**最終拼好、要發送給 ChatGPT / Gemini 的 Prompt**:
> `Generate a vertical 9:16 aspect ratio image. Medium shot of a 38-year-old Asian man, short messy dark hair, deeply melancholic tired eyes, pale skin, wearing a dark grey turtleneck sweater and a black apron, sitting on the edge of an unmade bed in a dark room. He is looking down sadly, holding a small silver bracelet. Dust particles in the air. Photorealistic cinematic film still, shot on 35mm lens, highly detailed, 8k resolution. Cold blue and grey cinematic color grading, moody tungsten lighting contrast, melancholic atmosphere. Do NOT make it watch like an illustration or 3D render, it must look like a high-end emotional movie frame.`
