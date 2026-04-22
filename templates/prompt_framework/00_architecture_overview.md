# 微短劇 AI 繪圖提示詞架構總則 (For GPT/Gemini/Grok)

在對話式 AI 平台（如 ChatGPT 配合 DALL-E 3、Gemini 配合 Imagen 3、Grok）上生成連續圖片，與使用 Midjourney 的運作邏輯（抽卡、參數）完全不同。**對話式 AI 更容易過度理解或自行加戲**，因此提示詞必須像「控制碼」一樣精確。

為了確保微短劇（Micro-drama）的**角色一致性**與**電影感風格統一**，所有的提示詞 (Prompt) 必須遵循高度模板化的自然語言架構。

## 💡 提示詞標準拼裝公式

對話式 AI 的 Prompt 必須是一個明確完整的段落，請按照以下結構拼接：

> `[畫面比例指令] + [攝影機與運鏡] + [專案統一風格] + [死磕到底的角色特徵] + [具體場景與動作]`

---

## 1. 畫面比例與攝影機 (Camera & Layout)
這類 AI 不能吃 `--ar 9:16` 這種指令，必須**第一句話就大聲用自然語言告訴它**：
*   「請生成一張 9:16 垂直比例的直式全螢幕畫面... (Generate a vertical 9:16 aspect ratio image...)」
*   **攝影語言**：「近景特寫 (Close up)」、「中景 (Medium shot)」、「全身遠景 (Wide shot)」。

## 2. 專案統一視覺風格 (Global Style Suffix)
對話式 AI 很容易每次生成的畫風都不一樣（一下美漫、一下水彩、一下 3D 動畫）。
**你必須把「風格字眼」緊緊綁死在每次對話中。**
例如：`Photorealistic, cinematic film still, moody lighting, shot on 35mm lens, 8k resolution.`

## 3. 角色一致性解決方案 (Character Consistency)
GPT 或 Gemini 沒有 Midjourney 那種貼照片（`--cref`）綁長相的功能。要讓同一個角色不走鐘，必須做到：
1. **同一個對話窗**：把該角色的所有鏡頭，放在同一個 GPT 或 Gemini 視窗對話串裡生成。
2. **鎖死特徵描述**：每次提到該角色，都必須「一字不漏」地貼上他的長相與服裝描述。絕對不能偷懶只寫「男主角」三個字。
   *(正確示範：那個 38 歲、臉色蒼白、留著微亂短髮、下巴有鬍渣、穿著深灰色高領毛衣與炭黑色圍裙的亞洲男人)*

## 💡 接下來的操作步驟：
1. **建立專案風格**：使用 `01_style_guidelines.md` 定義該劇的視覺基調（自然語言格式）。
2. **建立角色庫**：使用 `02_character_sheet.md` 把角色的長相特徵寫成「不變的通稿」。
3. **對話式分鏡生成**：使用 `03_scene_generation.md` 來組裝最終要發給 GPT/Gemini 的話。
