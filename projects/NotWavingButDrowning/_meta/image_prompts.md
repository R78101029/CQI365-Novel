# 《溺墨》插圖規劃與 Prompt 清單 (Image Prompts) v2.0

本文件定義《溺墨》(Not Waving but Drowning) 各章節的視覺風格與 AI 生成 Prompt。

> **v2.0 全面重寫（2026-08-17）。** v1.0 的 prompt 產出的圖與正文牴觸：
> 主角被畫成白人男性、Ch06 直接要求在畫面裡寫出 `'HOLLOW'` 字樣、
> Ch07 畫成關著的門（結尾是全書唯一一次門開著）、Ch03 畫成裂開的天花板
> （正文的重點是天花板**乾的、沒有裂縫**）。舊圖全數作廢。

---

## 硬規則（每一張都適用）

1. **畫面中不得出現任何文字、字母、數字、書名、招牌、螢幕上可辨識的字。**
   這是 repo 全站規範（見 `CLAUDE.md` / `AGENTS.md`）。螢幕要有光，但不要有字。
2. **主角是台灣男性，35 歲。** 東亞臉孔，黑髮，偏瘦，鬍子沒刮乾淨但不是落腮鬍。
   不要畫成西方人。不要畫成日本人。
3. **不是恐怖片。** 沒有鬼、沒有扭曲的臉、沒有血、沒有 jump scare 的構圖。
   調性是沉靜、內省、疲倦、克制。參考的是 Noir 的**光**，不是 Noir 的**驚悚**。
4. **墨的量要跟正文一致。** 這本書的滲透是漸進的：Ch1 只有指節一小點，
   到 Ch5 才是地板薄薄一層。不要一開始就淹掉。
5. **她永遠不露臉。** 讀者只能從碎片拼湊她。背影、剪影、手、肩膀可以；
   五官不行。
6. **地點是基隆。** 老公寓、鐵皮屋頂、鋁窗、水泥外牆的水漬、窄巷。
   不是東京，不是紐約，不是任何有霓虹招牌的城市。

**尺寸**：1:1 正方形（與既有章節插圖一致）。
**風格**：cinematic scene illustration，photorealistic，自然光或單一光源。

---

## 章節 Prompt 清單

### 01｜墨起 (Ink Rising)
- **視覺重點**：基隆雨夜的四坪書房。第一抹墨漬，小到幾乎看不見。
- **Prompt**: Cinematic photorealistic scene, no text no words no letters anywhere. A cramped four-ping study in an old Keelung apartment at night. A 35-year-old Taiwanese man, thin, black hair, unshaven, sits at a wooden desk lit only by a warm desk lamp and the pale glow of an open laptop (screen glow only, no readable content). A mug of cold coffee with a dried ring at the rim. A stack of unused yellow sticky notes and one blunt pencil. Aluminium-framed window, water running down the glass, beyond it a narrow alley and the wet concrete wall of the opposite building. Closed pale-yellow wooden door at the edge of frame. Camera close on his right hand resting near the keyboard — a single small black ink stain on the outer knuckle of the index finger, the size of a third of a fingernail. Quiet, tired, restrained. Warm lamp against cold window light. 1:1.
- **預定檔名**: `illus_ch01_ink_rising.jpg`

### 02｜墨影 (Ink Shadow)
- **視覺重點**：門的另一邊。她跪著，額頭貼在門板上。不露臉。
- **Prompt**: Cinematic photorealistic scene, no text no words no letters anywhere. A narrow apartment corridor at night, seen from behind. A woman kneels on cold white floor tiles facing a closed pale-yellow wooden door, her forehead resting against the wood, both palms flat on the door panel. Seen entirely from behind — her face is not visible at all. Wet dark hair against her neck and shoulders, a soaked deep-blue silk scarf around her neck. Water damage stain running along the wall near the ceiling. A thin line of rainwater tracking down the wall into the skirting board. A small patch of paint peeled off the lower door panel, about 2cm square, ninety centimetres from the floor. Warm light leaking under the door in a single thin band. No ink anywhere in this image. Still, quiet, unbearably ordinary. 1:1.
- **預定檔名**: `illus_ch02_ink_shadow.jpg`

### 03｜墨雨 (Ink Rain)
- **視覺重點**：一滴黑色液體停在指節上。天花板是乾的——這是重點。
- **Prompt**: Cinematic photorealistic scene, no text no words no letters anywhere. Extreme close-up of a man's right hand over a laptop keyboard in dim lamplight, two fingers stained dark grey-black along the knuckles. A single bead of black liquid, the size of a grain of rice, rests on the index knuckle, held by surface tension, catching one highlight. Shallow depth of field. Far behind and out of focus, the ceiling corner shows an old pale-grey water stain that is completely dry and intact — no crack, no drip, no wet patch, nothing falling. Three stacked instant-noodle bowls at the edge of the frame. The contradiction between the wet bead and the dry ceiling is the subject. Cold screen light, warm lamp. 1:1.
- **預定檔名**: `illus_ch03_ink_rain.jpg`

### 04｜墨鏡 (Ink Mirror)
- **視覺重點**：浴室鏡子。鏡中的他慢了一拍。
- **Prompt**: Cinematic photorealistic scene, no text no words no letters anywhere. A small tiled bathroom, harsh low-wattage white bulb. A 35-year-old Taiwanese man, thin face, hollow under the eyes, three days unshaven, stands at the sink having just lowered a towel — his hand is already down at his side. In the mirror, his reflection is still holding the towel up beside its face, caught a beat behind him. The two poses do not match. Both faces are the same East Asian face, calm, not frightened. Water beading on the mirror's lower edge. A bar of white soap split in two on the dish, the smaller half on the rim. No ghost, no distortion, no horror — just a reflection that is late. 1:1.
- **預定檔名**: `illus_ch04_ink_mirror.jpg`

### 05｜墨沉 (Ink Submersion)
- **視覺重點**：地板一層兩毫米的黑水。他赤腳，繼續打字。
- **Prompt**: Cinematic photorealistic scene, no text no words no letters anywhere. A small study seen from floor level. The entire wooden floor is covered by a shallow film of black liquid roughly two millimetres deep — a mirror-flat black surface reflecting the ceiling, not a flood. A 35-year-old Taiwanese man sits at his desk, barefoot, both feet submerged only to the ankle, typing on a glowing laptop (screen glow only, no readable content). The chair legs and desk legs stand in the black film. Walls, ceiling and skirting are completely dry — the liquid has no source and no splash. A two-seat sofa on ten-centimetre legs stands clear of it. The study door is open, and the black film stops precisely at the threshold. Calm, matter-of-fact, not panicked. 1:1.
- **預定檔名**: `illus_ch05_ink_submersion.jpg`

### 06｜墨空 (Ink Void)
- **視覺重點**：全黑的螢幕。上面反射一張臉。畫面上不能有任何字。
- **Prompt**: Cinematic photorealistic scene, absolutely no text no words no letters no symbols anywhere, including on the screen. A laptop screen gone entirely black but still backlit — a flat even dark grey rectangle, completely empty, not a single character on it. On its glossy surface, the soft blurred reflection of a 35-year-old Taiwanese man's face, looking straight at it, expression neutral and spent. The keyboard below in shallow focus. A coffee mug whose dried residue has cracked into fine lines at the bottom. Beside the screen, a small yellow sticky note stuck to the bezel, its writing turned away and illegible. The power LED glows green. Emptiness without menace. 1:1.
- **預定檔名**: `illus_ch06_ink_void.jpg`

### 07｜墨末 (Ink Disappearance)
- **視覺重點**：門是開的。全書唯一一次。白色晨光，走廊空的。
- **Prompt**: Cinematic photorealistic scene, no text no words no letters anywhere. Morning after rain in Keelung. A pale-yellow wooden study door standing OPEN at about forty-five degrees — open, not closed. Beyond it a narrow corridor with cream-yellow walls leading to a living room where an uncurtained window throws one long band of flat white light across the tiled floor. The light is diffuse and shadowless, from a thick bright overcast sky. The corridor is completely empty — no person, no letter on the floor, no water, no ink, nothing. On the lower panel of the open door, one small patch of peeled paint about 2cm square, ninety centimetres from the floor, the only mark left anywhere. Clean, dry, quiet. Cold clarity rather than relief. 1:1.
- **預定檔名**: `illus_ch07_ink_disappearance.jpg`

---

## 生成後檢查表

每一張出圖後逐項確認，任一項不過就重生：

- [ ] 畫面裡完全沒有文字／字母／數字（含螢幕、書背、招牌）
- [ ] 主角是東亞臉孔，不是西方人
- [ ] 墨的量符合該章進度（Ch1 一小點 → Ch5 兩毫米，不要提前淹）
- [ ] 她沒有露臉
- [ ] Ch07 的門是**開的**
- [ ] Ch03 的天花板是**乾的、沒有裂縫**
- [ ] 沒有恐怖片元素（鬼影、扭曲、血）
- [ ] 場景是基隆老公寓，不是霓虹都市
