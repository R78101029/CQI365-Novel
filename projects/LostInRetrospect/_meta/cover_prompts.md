# 《白露未晞》封面與配圖 · Nano Banana 提示詞

> 用於 Google Gemini (Nano Banana) 模型生成
> 所有圖片：**無任何文字、字母、標題、名字**
> 風格：文學電影感·冷調·克制·攝影寫實
> 非賽博龐克（不套用 BlindOrbit / 2040Iris 的 cyberpunk noir）
> 比例：2:3 直式（portrait）

---

## 1. 書籍封面 · `00-cover.png`

**意象**：藍色絨布盒中的銀手環·昏暗燈光

```
Cinematic scene illustration, NO TEXT NO WORDS NO LETTERS anywhere.

A single silver bangle bracelet resting inside an open blue velvet
ring box on a dark worn wooden nightstand. The bracelet is simple
matte silver with slight oxidation—old, modest, belovedly handled.
One corner of folded cream-colored paper peeks from beneath the
velvet insert. Soft amber lamplight from one side casts long
shadows. Very shallow depth of field, the bracelet in sharp focus.

Photorealistic, literary, melancholic. Muted color palette:
faded denim blue, tarnished silver, dark walnut, warm amber highlight.
Film grain. 2:3 portrait orientation. The mood is quiet grief
and preserved memory.
```

---

## 2. Part I · 空房子 · `01-cover.png`

**意象**：黎明前的空臥室·床頭抽屜拉開·藍絨布盒在地板上

```
Cinematic scene illustration, NO TEXT NO WORDS NO LETTERS anywhere.

An empty apartment bedroom at dawn. The bed is neatly made with
folded pajamas on the pillow. One bedside drawer at floor level
is pulled out. A blue velvet box sits open on the wooden floor
beside it. Soft pre-dawn light filters through half-open curtains.
A thin crack runs across the ceiling from the lamp base toward
the window. No people visible—only the absence.

Photorealistic, desolate, literary. Color palette: pale blue-grey
dawn, cream bedding, faded wood, warm amber crack of dawn through
window. 2:3 portrait orientation. The mood is someone has just
left and will never return.
```

---

## 3. Part II · 逆光 · `02-cover.png`

**意象**：年輕女子背影·逆光·右手腕舊疤隱約可見

```
Cinematic scene illustration, NO TEXT NO WORDS NO LETTERS anywhere.

A young woman in her twenties stands with her back to the viewer
at a tall apartment window, backlit by late afternoon sunlight.
Her silhouette is mostly in shadow. Her right arm hangs loose at
her side, hand caught in light—a faint two-centimeter pale scar
visible on her inner right wrist. She wears a long gray knit
cardigan with sleeves slightly past her wrists. Dust motes float
in the golden light.

Photorealistic, melancholy, literary. Golden hour backlight, warm
muted palette (honey gold, warm shadow, cream cardigan, dark hair).
2:3 portrait orientation. The mood is quiet longing, carried secrets.
```

---

## 4. Part III · 齒輪 · `03-cover.png`

**意象**：修錶師昏黃工作室·懷錶停在 3:07·零件散亂

```
Cinematic scene illustration, NO TEXT NO WORDS NO LETTERS anywhere.

A watchmaker's dim solitary workshop desk at night. A single antique
pocket watch lies open face-up, its hands clearly frozen at 3:07.
Tiny brass gears, springs, and a mainspring coil scattered across
a worn leather desk mat. A watchmaker's loupe rests nearby. A cup
of cold tea, half-drunk. A single desk lamp casts warm amber light
onto the work surface, rest of room in dark shadow. A folded old
photograph lies at the edge of the desk, face down. No people.

Photorealistic, lonely, literary. Cool dark palette (black, deep
brown leather, tarnished brass, warm amber spot of lamplight).
2:3 portrait orientation. The mood is suspended time, obsessive
precision, grief rehearsed into ritual.
```

---

## 5. Part IV · 斑馬線 · `04-cover.png`

**意象**：雨後黃昏斑馬線·兩個成年人背影·牽手過馬路

```
Cinematic scene illustration, NO TEXT NO WORDS NO LETTERS anywhere.

An urban crosswalk at dusk after rain. Wet asphalt reflects the
green traffic light and soft warm city lights. Two adult silhouettes,
a man and a woman both in their thirties, walk side by side across
the zebra crossing, seen from behind, their hands loosely joined.
The woman is slightly ahead, half a step. They wear simple everyday
clothes—she in a cream-colored linen shirt, he in a dark gray shirt.
Soft city lights blur in the background bokeh. Shallow street puddles
reflect the sky. No other people.

Photorealistic, melancholy but gently hopeful, literary.
Color palette: wet dark asphalt, warm sodium orange street lamp,
cool blue-green traffic light reflection, cream and gray clothing.
2:3 portrait orientation. The mood is quiet reconciliation after
long grief, a shared ordinary moment.
```

---

## 生成與部署步驟

1. 將上述 5 段 prompt 依序餵給 Google Gemini（Nano Banana 模型）
2. 下載生成的 PNG 檔案
3. 命名並放置於兩個位置：
   - `projects/LostInRetrospect/_publish/assets/chapters/{N}-cover.png`（source）
   - `site/public/assets/LostInRetrospect/chapters/{N}-cover.png`（published）
4. 章節 frontmatter 已加 `cover:` 與 `image_prompt:` 欄位（見下面各章節檔案）

## 圖片可替換原則

若某張生成效果不理想：
- 可重試並調整 prompt 強度
- 可換 composition（廣角/特寫）
- 但**禁止**在圖片中加入任何中文、英文字、姓名、標題——這是系列視覺一致性鐵律
- 風格必須保持「文學電影」調性·不可滑向「言情」「小說封面常見套路」
