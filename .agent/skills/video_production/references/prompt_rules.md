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

## 表演指導（有臉入鏡的鏡頭才需要）

來源是一份 AI 表演提示詞教學（FACS/AU 微表情編碼 + 情緒曲線 + 八維公式）。
**只採用其中一部分**，因為它的目標與本系列相反——它要「奧斯卡級演技」，
我們要的是克制。技術可以搬，目標不能搬。

### 採用：時間碼分節

> **2026-08-25 實測**：beats 套在 `veo-3.1-lite` 上，補不上 Lite 與 Fast 之間的品質差距。
> 模型階級的影響大於 prompt 結構——**先選對模型，再談 prompt**。
> beats 疊在 Fast 上是否再加分尚未測。


`motion_prompt` 寫成一句話，模型自己決定什麼時候做——8 秒的鏡頭這樣太鬆。
改成在鏡內切時間段：

```
0-2s: 手停在扶手上，沒有動。
3-5s: 手掌抹過扶手，灰揚起來。
6-8s: 手離開畫面，灰還在光裡飄。
```

`shots.json` 用 `beats` 欄位表達，編譯時展開成上面的形式。

### 採用：AU 編碼當肌肉記法

FACS 的 Action Unit 描述的是**肌肉**不是情緒，這跟 STYLE_GUIDE 的
「不命名情緒、身體代言情緒」完全一致。所以它不是外來規範，是同一件事的精確寫法。

| AU | 動作 |
|---|---|
| AU1 | 眉毛內側抬起 |
| AU4 | 眉毛下壓／皺眉 |
| AU7 | 眼瞼收緊 |
| AU15 | 嘴角下沉 |
| AU17 | 下巴繃緊抬起 |
| AU25 / AU26 | 嘴唇分開／下顎張開 |

強度用 A–E，並標注開始／峰值／消退。**寫法：先用自然語言描述具體動作，
AU 編碼放在後面當校準**，不要只給編碼。

```
Her jaw tightens very slightly and holds; the corners of the mouth pull down a trace.
(AU17 intensity B, onset 4s, no release. AU15 trace only.)
```

⚠ **Veo 對 AU 編碼有沒有反應，我們沒有測過。** 要用之前先挑一鏡跑兩版
（有 AU／無 AU）對照，確認有效再全面套用。

### 採用：禁止反應清單（對本系列最重要的一條）

模型的預設是加戲——流淚、嘴唇顫抖、搖頭、深呼吸。這會直接毀掉這幾本書的克制。
**每個有臉的鏡頭都要寫明禁止什麼**：

```
Do NOT: tears, trembling lip, head shake, hand covering mouth, sharp inhale,
eyes squeezing shut, any expression that reads as performed grief.
Her face must stay unreadable — the change is a few millimetres, not a reaction.
```

### 不採用：情緒曲線與台詞觸發

- **情緒曲線**（憤怒→崩潰→坦白的階梯式推進）：林若筠不崩潰。她的變化「不穩定、
  不線性、不完整」，而且「絕不讓她想通什麼」（見 `_dev/characters/protagonist.md`）。
  把戲劇性的情緒弧線寫進 prompt，等於把角色改寫成另一個人。
- **台詞觸發點**：我們旁白分離，畫面裡沒有對白、不做嘴型同步。
  影片 prompt 一律不含 voiceover（既有規範）。真要對位，是「旁白某句進來時
  畫面上發生什麼」，那屬於剪輯層，不是 prompt 層。

### 我們的版本：五維（不是八維）

原教學的八維裡，聲音／呼吸／台詞三維對我們不適用。留下五維：

1. **時間段**（鏡內切到秒）
2. **動機**（她此刻在做什麼事——不是她感覺什麼）
3. **面部與肌肉**（自然語言 + AU 校準）
4. **目光與身體**（視線落點、重心、手）
5. **禁止反應**（最重要）

## `ref2v`（參考圖生影片）

OpenRouter 走 `input_references[]`（結構同 `frame_images[]` 但沒有 `frame_type`）。
兩個陣列都給時 `frame_images` 優先——所以要 ref2v 就**不要**同時送首幀。

Seedance 系模型本身吃**位置式**指涉，prompt 裡用 `[Image1]` `[Image2]` 對應送進去的順序：

```
[Image1] 走進 [Image2] 的房間，在窗邊停下。Static camera, slow push-in.
```
→ Image1 = 角色 ref、Image2 = 場景 ref。

其他家（Kling、Wan）多半是靠 prompt 文字描述主體，不用位置標記。
**第一次用某個模型的 ref2v 時先單獨試一鏡**，確認它認不認位置標記，再批次跑。

## SRT 字幕

從 `vo.text` + 每鏡累積 duration 生成。中文一行不超過 16 字，超過就在標點處斷成兩行。
