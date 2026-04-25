# 《白露未晞》微短劇 第 2 集：逆光裡的她

- **預估時長**：1 分 20 秒（每段固定 10 秒 × 8 段）
- **配音設定**：男主旁白 (VO-M) + 女主旁白 (VO-F)
- **製作流程**：先用 DALL-E 出圖 → 再用圖生影片（Grok / Kling）→ 最後加旁白混音

---

## 角色設定 Prompt（Character Bible）

### 角色 A：男主（修錶師）

> **在 DALL-E prompt 中使用此段描述（標記為 `[CHAR-M]`）：**
>
> A breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武). Elegant and refined without being rough. Slightly long messy black hair parted in the middle. Deep soulful melancholic eyes, clean-shaven. Wearing a dark grey high-neck sweater and a charcoal craftsman apron (when in workshop) or a simple dark coat (when outdoors). Slim but not fragile build. His hands are a watchmaker's hands — precise, slightly stained with oil.

### 角色 B：女主（沈宜）

> **在 DALL-E prompt 中使用此段描述（標記為 `[CHAR-F]`）：**
>
> A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯). Refined and quiet beauty, minimal or no makeup. Long straight black hair, sometimes loosely tied. Slim figure, pale complexion. A faint 2cm pale scar on her right inner wrist (only visible in close-up shots). She wears understated muted-tone clothing — grey knit cardigan with slightly long sleeves, soft beige scarves, charcoal wool coats. Her eyes hold a precise, calculating sadness — the look of someone who has already decided. Always slightly backlit (逆光) to keep her face partially in shadow.

---

## S1：初遇·圖書館 (0-10s)

**出場角色：`[CHAR-M]` + `[CHAR-F]`（雙人）**

**旁白 (VO-M·約 8 秒)**：
「她二十歲那年。書架另一頭。我看見她右腕內側·有一道淡淡的疤。我一輩子沒問。」

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Soft backlit medium shot in a university library aisle, late afternoon golden hour light streaming through tall windows.

CHARACTER 1 (female, main subject): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), refined and quiet beauty, minimal makeup, long straight black hair loosely tied, wearing a soft grey knit cardigan with slightly long sleeves. She is standing on tiptoe reaching for a book on a high shelf. Her face is in three-quarter view, lit from behind so her profile is softly silhouetted.

CHARACTER 2 (male, partial): Only his right hand and forearm visible from the right edge of the frame, reaching past her to grab the book. His fingers are slightly stained with watchmaker oil. He wears a dark grey high-neck sweater sleeve.

Photorealistic cinematic film still, shot on 35mm lens, dust particles floating in the warm light beam, highly detailed. Cinematic warm tungsten + cold blue ambient contrast. Do NOT make it look like an illustration. Two people in frame.
```

**影片動態 prompt（圖生影片）**：
```
Static camera. The man's hand smoothly reaches in from the right edge and grasps the book. The woman slightly turns her head toward the camera. Dust motes drifting in the backlit golden light. Subtle cinematic slow motion. Two people in frame — only the man's hand is visible, the woman is the main subject.
```

---

## S2：十年婚姻·希臘 (10-20s)

**出場角色：`[CHAR-F]` 單人（男主不入鏡）**

**旁白 (VO-M·約 8 秒)**：
「我們結婚那年去希臘。她看聖托里尼的藍·看了一整天。那是我見過她最笑的一天。」

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Sun-drenched Santorini blue and white rooftop terrace overlooking the Aegean sea.

CHARACTER (female, single person in frame): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), wearing a simple white linen dress and a sky-blue soft cotton scarf wrapped loosely around her neck. She is laughing softly at something off-frame, her hand brushing wind-blown hair from her cheek. Her smile is genuine and unguarded — a face that has not yet decided. On her left wrist, a thin plain silver bracelet is faintly visible.

Late afternoon warm directional light. Photorealistic cinematic film still, shot on 35mm lens, slight film grain. Bright Mediterranean palette. Only one person in frame. Do NOT make it look like an illustration.
```

**影片動態 prompt（圖生影片）**：
```
Slight handheld camera drift. Wind blows her hair softly. Her laughter motion lingers — eyes crinkle, then she turns her head slowly toward the camera. The blue scarf flutters gently. Sunlit cinematic slow motion. Single person in frame.
```

---

## S3：麥當勞·確診 (20-30s)

**出場角色：`[CHAR-F]` 單人**

**旁白 (VO-F·首次出場·約 9 秒)**：
「我拆開那封信。是陽性。我的反應是——對·我就知道。我一直在等這張紙。」

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Wide-medium shot of a cheap fluorescent-lit fast food restaurant corner booth at midday.

CHARACTER (female, single person in frame): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), wearing a charcoal grey wool coat over a beige knit top, sitting alone in the booth. An opened white medical envelope rests on the table beside an untouched paper cup of coffee. She is reading a single sheet of medical paper. Her face is completely still — no shock, no tears, no relief — just a quiet, exact recognition. Her right hand rests on the table, perfectly still. A faint 2cm pale scar visible on her right inner wrist.

The fluorescent light is harsh and cold; outside the window midday sunlight is bright. Photorealistic cinematic film still, shot on 35mm lens, slight desaturation. Banal everyday tragedy. Only one person in frame. Do NOT make it look like an illustration.
```

**影片動態 prompt（圖生影片）**：
```
Static camera. The woman's eyes very slowly move down the page, then back up to the top. She blinks once, slowly. Her right hand on the table is perfectly still. Background sounds of children laughing go soft and blurry. Cold cinematic stillness. Single person in frame.
```

---

## S4：半年的線索·物件特寫 (30-40s)

**出場角色：無人物（靜物特寫）**

**旁白 (VO-M·約 9 秒)**：
「春天她變了。一條陌生的藍絲巾。一瓶不是給自己聞的古龍水。手機螢幕亮起·『明天咖啡記得』。」

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Tight detail still life composition in vertical layout, no people in frame.

TOP THIRD: a folded silk blue scarf hanging on a wooden coat hanger — a deep, cold cobalt blue. MIDDLE THIRD: a glass cologne bottle with amber liquid sitting upright on a dark wooden bedside table, lit from a dramatic side angle. BOTTOM THIRD: an iPhone screen face-up on a marble coffee table, screen glowing with a partial visible LINE message notification reading "明天咖啡記得" — the contact name deliberately blurred.

Each item photographed in cinematic style with deep moody shadows and a single dramatic key light. Photorealistic film still, shot on 35mm lens. Cold blue + warm amber contrast. No people in frame. Do NOT make it look like an illustration.
```

**影片動態 prompt（圖生影片）**：
```
Slow vertical pan downward across the three objects. The scarf sways slightly as if from a passing draft. The cologne bottle catches a slow shifting light. The phone screen pulses softly — once, twice. Cinematic moody slow motion. No people in frame — objects only.
```

---

## S5：「妳有別人？」「是。」 (40-50s)

**出場角色：`[CHAR-M]` + `[CHAR-F]`（雙人）**

**旁白 (VO-M·約 8 秒)**：
「我說：『妳有別人？』她的眼睛沒躲。她說：『是。』那一夜我裝了行李·走出家門。」

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Two-shot composition in a dim apartment living room. Two people in frame.

CHARACTER 1 (male, foreground, back to camera): A breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武), slightly long messy black hair, wearing a dark grey high-neck sweater. He is standing, seen from behind (back of head and shoulders visible). His posture is rigid, fists slightly clenched at his sides.

CHARACTER 2 (female, background, facing camera): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), sitting on a low grey sofa. She is looking straight up at him. Her face is calm — her eyes meet his with a precise, exhausted resolve. She wears a navy blue blouse. Her hands rest on her knees, still.

The room is lit only by a single floor lamp casting dramatic shadows. A wall clock visible reads roughly 8 PM. Photorealistic cinematic film still, shot on 35mm lens. Cold blue ambient + warm tungsten lamp contrast. Heavy emotional silence. Two people in frame. Do NOT make it look like an illustration.
```

**影片動態 prompt（圖生影片）**：
```
Static camera. The woman holds his gaze unflinchingly for a long beat — she does NOT blink first. The man's silhouette in the foreground is perfectly still — only his shoulders rise and fall once with a deep breath. Wall clock second hand ticking audibly. Cinematic emotional standoff. Two people in frame.
```

---

## S6：隧道·「我沒閃。」 (50-60s)

**出場角色：`[CHAR-M]` 單人（車內反射）**

**旁白 (VO-M·約 7 秒 + 停頓 1 秒)**：
「第六個月雨夜·隧道口大卡車逼近。我那時候想的是那張希臘合照——」
**(停頓 1 秒·男聲加粗)**：「**我沒閃。**」

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Driver's POV through a rain-streaked windshield at night, inside the mouth of a long road tunnel.

CHARACTER (male, reflected in windshield): Faint ghostly reflection of a breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武), slightly long messy black hair. His reflected eyes are wide open, jaw slack — NOT bracing for impact. Expression of hollow acceptance.

Two enormous oncoming truck headlights blast directly into the camera, oversaturated white halos with lens flare diagonals. A blurred dashboard in the lower frame. On the passenger seat: a single faded photograph of a Santorini blue rooftop with a woman in a white dress smiling.

Photorealistic cinematic film still, shot on 35mm anamorphic lens. Ultra high contrast, motion blur on rain streaks, sense of inevitable collision. Single person (reflected). Do NOT make it look like an illustration.
```

**影片動態 prompt（圖生影片）**：
```
Camera slowly pushes forward toward the headlights — the lights bloom larger and brighter. Rain streaks accelerate diagonally across the windshield. The man's reflected eyes in the glass do not blink. Sound drops to complete silence at the brightest peak. Cinematic slow motion — cut to maximum white-out. NEVER show actual collision. Single person (windshield reflection only).
```

---

## S7：墓前·「我算錯了他。」 (60-70s)

**出場角色：`[CHAR-F]` 單人**

**旁白 (VO-F·約 7 秒 + 停頓 1 秒)**：
「報紙角落一則小消息——他半年就死了。我蹲在他墓前。我這輩子算過所有事——」
**(停頓 1 秒·女聲微顫)**：「**我算錯了他。**」

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Wide low-angle shot of a quiet hillside graveyard at dusk.

CHARACTER (female, single person in frame): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), kneeling on the grass beside a simple grey granite gravestone. The carved date "1987 - 2022" is partially visible on the stone. She wears a long charcoal wool coat over dark clothing. Her right hand rests on top of the gravestone — fingers slightly trembling. A single uprooted blade of grass lies on the stone next to her hand. On her left wrist, a plain silver bracelet catches the last light. Her face is in profile, backlit — eyes open but unfocused, no tears, only the dawn of an impossible recognition.

Wide cold blue dusk sky transitioning to deep indigo. Photorealistic cinematic film still, shot on 35mm lens, golden hour vanishing. Single person in frame. Do NOT make it look like an illustration.
```

**影片動態 prompt（圖生影片）**：
```
Static camera. The woman's hand on the gravestone trembles once. She does not move otherwise. Wind shifts a strand of her hair. The light slowly drains from the sky over the ten-second hold. A single silent tear forms but does not fall. Cinematic devastating stillness. Single person in frame.
```

---

## S8：浴缸·呼應 EP1 (70-80s)

**出場角色：`[CHAR-F]` 單人**

**旁白 (VO-F·極輕聲·約 5 秒)**：
「十二天後。我放了熱水。我進浴缸。」
**(剩餘 5 秒：無旁白·只有水聲與微弱管線回音·畫面淡出)**

**DALL-E 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Overhead bird's-eye view shot of an old-fashioned cast iron bathtub filled with steaming hot water in a small dim bathroom.

CHARACTER (female, single person in frame): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), fully submerged up to her shoulders, eyes closed peacefully, long black hair fanned out in the water. Her left hand rests on the bathtub edge — a faint plain silver bracelet visible on her wrist. Her right inner wrist with its faint scar is just below the waterline.

The water surface is perfectly still. Steam rises in soft vertical columns. The bathroom is lit only by a single bare bulb outside the frame, casting deep cinematic shadows. A small stool beside the tub holds an untouched bento box (visual callback to EP1). Photorealistic cinematic film still, shot on 35mm lens, hauntingly serene. Single person in frame. NOT graphic, NOT bloody — only quiet inevitability. Do NOT make it look like an illustration.
```

**影片動態 prompt（圖生影片）**：
```
Static overhead camera. Steam rises in slow vertical columns. The water surface is perfectly still — no ripples. Her closed eyes do NOT open. The light very slowly dims to near-black over the final 3 seconds. NO movement of the body. Pure cinematic stillness — fade to black with the sound of a single dripping faucet. Single person in frame.
```

---

## 分鏡角色出場總覽

| 分鏡 | 秒數 | 旁白 | 出場角色 | 人數 |
|------|------|------|---------|------|
| S1 圖書館 | 0-10 | VO-M | `[CHAR-M]`（手部）+ `[CHAR-F]` | 2 |
| S2 希臘 | 10-20 | VO-M | `[CHAR-F]` | 1 |
| S3 麥當勞 | 20-30 | VO-F | `[CHAR-F]` | 1 |
| S4 線索物件 | 30-40 | VO-M | 無（靜物） | 0 |
| S5 承認 | 40-50 | VO-M | `[CHAR-M]` + `[CHAR-F]` | 2 |
| S6 隧道 | 50-60 | VO-M | `[CHAR-M]`（反射） | 1 |
| S7 墓前 | 60-70 | VO-F | `[CHAR-F]` | 1 |
| S8 浴缸 | 70-80 | VO-F | `[CHAR-F]` | 1 |

---

## 製作執行 checklist

- [ ] 8 張 storyboard 圖（DALL-E·9:16）→ 存 `_assets/storyboards/ep02/ep02_s{1-8}_*.png`
- [ ] 8 段 image-to-video（Grok / Kling·每段 10 秒）·共 80 秒
- [ ] 旁白配音（男聲沿用 EP1 + 女聲首次出場）
- [ ] 音樂混音
- [ ] 剪接合成 mp4
- [ ] 上傳 YouTube Shorts
- [ ] 在 `chapters/02-逆光.md` frontmatter 加 `video` 欄位
- [ ] commit + push
