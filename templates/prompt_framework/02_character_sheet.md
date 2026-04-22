# 角色建檔範本 (Character Sheet Template - DALL-E/Gemini)

> **使用說明**：對話式 AI 沒有角色參考參數。你唯一能保證他長相不變的方法，就是「用字遣詞必須像定海神針一樣永遠不變」。

## 1. 角色基本設定 (Core Identity)
*   **角色姓名**：[角色名稱]
*   **核心氣質**：[e.g., 憂鬱、平靜、內向]

## 2. 永遠不變的外貌特徵通稿 (Fixed Appearance Prompt)
請將這個角色的臉部與服裝，寫成一段簡練、精準的英文描述。**未來每一次要畫這個角色，都必須「一字不漏」地複製這段話。哪怕少了一個詞，AI 都可能給他換一張臉。**

**標準外觀描寫 (Fixed Prompt)**:
> `a [年齡] Asian [性別, e.g. man], [髮型, e.g. short messy dark hair], [臉部特徵/氣質, e.g. deeply melancholic tired eyes, pale skin], wearing a [不變的服裝，e.g. dark grey turtleneck sweater and a black apron].`

---

## 3. 定妝照生成咒語 (First Image Generation)
在新的 ChatGPT 或 Gemini 對話窗內，貼入以下指令以取得這部劇角色的基礎長相。
*(強烈建議：一部劇的所有角色都在「同一個對話窗」裡面去生成，AI 會根據前文去捕捉一致的畫風。)*

**測試咒語**:
> `Please generate a vertical 9:16 aspect ratio image. A portrait of [貼上你的不變特徵通稿]. The character is looking straight at the camera with a [表情, e.g. deeply sad expression]. Simple dark grey background. Photorealistic cinematic film still, shot on 35mm lens, highly detailed. Cold blue and grey cinematic color grading, moody lighting.`
