# Prompt 編譯規則

`shots.json` → 各家 API 的 prompt。這是**腳本做的機械轉換**，不是每次重新創作。

## 首幀圖 prompt（`gemini-3-pro-image` / `gemini-3.1-flash-image`）

組裝順序固定：

```
1. 畫幅          Generate a vertical 9:16 aspect ratio image.
2. 場景 + 光線    {LOC profile 的 canonical 描述} + {shot.light}
3. 景別          {shot.framing}
4. 每個角色      CHARACTER {n} ({性別}, {主體/局部}): {CHAR profile 的 canonical 描述} + 這一鏡的姿態/動作/服裝變體
5. 道具          {PROP profile 的 canonical 描述} + 在畫面中的位置
6. 額外指示      {shot.frame_prompt_extra}
7. 風格尾綴      {episode.style}
8. 人數標註      Single person in frame. / Two people in frame. / No people in frame.
```

**附圖**：該鏡 `cast` + `props` + `location` 的全部 ref 圖（上限 14 張輸入圖、5 個角色）。
輸入圖的順序要跟 prompt 裡 CHARACTER 1/2 的順序一致。

### 禁止詞（出現就改掉）
- 任何真人姓名（金城武、湯唯、Takeshi Kaneshiro、Tang Wei…）→ 改用 ref 圖 + profile 描述
- `beautiful` / `stunning` / `breathtaking` 之類的空形容 → 換成具體五官與骨架描述
- 圖中文字：一律加 `NO TEXT NO WORDS NO LETTERS anywhere`
- `illustration` / `anime` / `3D render`（除非該集就是那個風格）→ 加 `Do NOT make it look like an illustration`

### 連戲檢查（編譯時就擋）
- 同一場景跨鏡：`light` 描述必須方向一致（不能上一鏡逆光、下一鏡順光）
- 同一角色跨鏡：服裝變體必須是同一個 key，除非劇本明確換場換衣

## 影片 prompt（i2v）

**只寫會動的東西。** 首幀已經把外貌、光線、構圖固定了，在影片 prompt 裡重述會讓模型重新繪製主體，臉就跑掉了。

```
{shot.camera}. {shot.motion_prompt} {人數標註}
```

範例對照：

| ❌ 錯 | ✅ 對 |
|---|---|
| A beautiful Asian woman in a grey cardigan reaches for a book, golden light... | Static camera. Her hand rises to the shelf; she turns her head slightly toward camera; dust motes drift. Two people in frame — only the man's hand visible. |
| ...她轉頭，旁白：「她二十歲那年…」 | （旁白不寫進去，另外 TTS） |

### 動作幅度
- 一鏡一個動作。兩個以上動作模型會做爛，寧可拆鏡。
- 8–10 秒的鏡頭只夠一個「小」動作 + 一個環境動態（風、塵、雨）。
- 不要要求鏡頭做複雜運鏡 + 主體大動作，二選一。

## `ref2v`（Seedance 2.5 reference-to-video）

參考輸入是**位置式**的，在 prompt 裡用 `[Image1]` `[Image2]` `[Video1]` `[Audio1]` 指涉：

```
[Image1] 走進 [Image2] 的房間，在窗邊停下。Static camera, slow push-in.
```
→ Image1 = 角色 ref、Image2 = 場景 ref。

Vidu Q3 ref2v 則是 1–4 張參考圖，靠 prompt 文字描述主體，不用位置標記。**寫 adapter 前先用 fal MCP 查該 endpoint 的 input schema，各家差很多。**

## SRT 字幕

從 `vo.text` + 每鏡累積 duration 生成。中文一行不超過 16 字，超過就在標點處斷成兩行。
