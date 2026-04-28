# 《白露未晞》微短劇 第 3 集：齒輪

- **預估時長**：1 分 20 秒（每段固定 10 秒 × 8 段）
- **配音設定**：男主旁白 (VO-M) + 女主旁白 (VO-F)
- **製作流程**：Grok 出圖 → Grok 圖生影片 → 旁白另外錄製後混音
- **旁白與影片分離**：Grok 中文語音品質不足，影片 prompt 只處理畫面動態，旁白獨立錄製後疊加

---

## 角色設定 Prompt（Character Bible）

### 角色 A：男主（修錶師）`[CHAR-M]`

> A breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武). Elegant and refined without being rough. Slightly long messy black hair parted in the middle. Deep soulful melancholic eyes, clean-shaven. Wearing a dark grey high-neck sweater and a charcoal craftsman apron (when in workshop) or a simple dark coat (when outdoors). Slim but not fragile build. His hands are a watchmaker's hands — precise, slightly stained with oil.

### 角色 B：女主（沈宜）`[CHAR-F]`

> A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯). Refined and quiet beauty, minimal or no makeup. Long straight black hair, sometimes loosely tied. Slim figure, pale complexion. A faint 2cm pale scar on her right inner wrist (only visible in close-up shots). She wears understated muted-tone clothing — grey knit cardigan with slightly long sleeves, soft beige scarves, charcoal wool coats. Her eyes hold a precise, calculating sadness. Always slightly backlit (逆光) to keep her face partially in shadow.

### 角色 C：許敬庭 `[CHAR-X]`（S4 單次出場）

> An Asian man around 35 years old, clean-cut, short neat black hair. Wearing a crisp white dress shirt with sleeves rolled to the forearm. Friendly, warm face — a doctor's face. He looks concerned but not intrusive. He is NOT the romantic rival — he is an unwitting pawn.

---

## S1：重生·3:07 (0-10s)

**出場角色：`[CHAR-M]` 單人（女主僅以身形/呼吸暗示存在）**

**旁白 (VO-M)**：
「然後我睜開眼。她在我旁邊。手機螢幕亮著——三點零七分。我記得那條斑馬線。我記得車燈逼過來。我沒躲。但我活著。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Extreme close-up of a man lying on his back in bed in the dark, eyes wide open, staring at the ceiling. Only the upper half of his face is visible.

CHARACTER (male, single visible face): A breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武), slightly long messy black hair spread on the pillow. His eyes are open — not panicked, but frozen in recognition. His irises reflect a faint blue glow from a phone screen off-frame.

The room is almost completely dark. A smartphone on the bedside table emits a cold blue glow showing "3:07" on the lock screen. Next to him, only the silhouette of a woman's shoulder and hair is barely visible under the blanket — she is asleep, facing away.

Photorealistic cinematic film still, shot on 35mm lens. Near-total darkness with cold blue phone glow as the only light source. Intimacy and dread. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
Static camera. The man's eyes are open, unblinking, staring at the ceiling. The phone screen glows "3:07" — the light flickers once. His chest rises very slowly with one deep breath. The woman's silhouette beside him does not move. Complete silence except a faint ticking sound. Cinematic stillness. Hold for 10 seconds.
```

---

## S2：緊繃三週·紅燒肉 (10-20s)

**出場角色：`[CHAR-M]` + `[CHAR-F]`（雙人）**

**旁白 (VO-M)**：
「第四天她煮了紅燒肉。她以前愛煮這道菜——在她打算離開我之前。我坐在對面吃。她看著我。我低頭吃蛋。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Medium two-shot at a small dining table in a modest apartment. Warm overhead kitchen light.

CHARACTER 1 (male, foreground, head slightly bowed): A breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武), slightly long messy black hair, wearing a dark grey high-neck sweater. He is eating with chopsticks, head down, not looking up. His posture is tense — shoulders slightly raised.

CHARACTER 2 (female, background, watching him): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), long straight black hair loosely tied, wearing a soft grey knit cardigan. She sits across the table, her chopsticks resting on the bowl untouched. She is watching him eat. Her expression is unreadable — love or surveillance, the viewer cannot tell.

On the table: a clay pot of braised pork (紅燒肉), two rice bowls, warm yellow light. Photorealistic cinematic film still, shot on 35mm lens. Warm tungsten kitchen light + cold ambient shadows. Two people in frame. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
Static camera. The man picks up food with chopsticks, head down. The woman watches him across the table — her chopsticks do not move. Steam rises gently from the clay pot between them. After 5 seconds, she slowly picks up her chopsticks but does not eat — she puts them down again. Warm kitchen light. Two people. Domestic tension.
```

---

## S3：她沒買絲巾 (20-30s)

**出場角色：`[CHAR-F]` 單人**

**旁白 (VO-M)**：
「她走進那家賣絲巾的店。我記得那條藍——跟蜜月那條不一樣的藍。她站了十五分鐘。她走出來。手上什麼都沒有。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Medium shot through a boutique store window from outside, looking in. Late afternoon, street reflections on the glass.

CHARACTER (female, single person in frame): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), wearing a charcoal wool coat. She is standing inside the shop, her right hand resting on a folded deep cobalt blue silk scarf displayed on a wooden table. Her fingers touch the fabric but do not grip it. Her face is reflected faintly in the window glass — expression conflicted, almost pained.

The shop interior is warmly lit. The street outside is grey and cold. The glass creates a layer of separation between her and the viewer. Photorealistic cinematic film still, shot on 35mm lens. Warm interior vs cold exterior contrast. Single person in frame. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
Static camera from outside the shop window. The woman's hand rests on the blue scarf for 5 seconds. She slowly lifts her hand away. She turns and walks toward the shop door. The scarf remains on the table, untouched. Her reflection fades from the glass as she moves. Single person. Cinematic slow pace.
```

---

## S4：咖啡館·落地窗外 (30-40s)

**出場角色：`[CHAR-F]` + `[CHAR-X]`（雙人·男主不在畫面中）**

**旁白 (VO-M)**：
「我從玻璃外看見她。對面那個男人掏出一張名片推給她。她搖頭。他收回去。然後他的手靠近她的手——她沒移開。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Shot through a coffee shop floor-to-ceiling window from outside, looking in. Dusk, street lights beginning to glow.

CHARACTER 1 (female, sitting by window): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), wearing a charcoal wool coat, sitting at a small round table by the window. Her face is slightly pale. She is looking down at a white business card on the table between them.

CHARACTER 2 (male, sitting across from her): An Asian man around 35 years old, clean-cut short neat black hair, wearing a crisp white dress shirt with sleeves rolled up. He is leaning slightly forward with concern. His right hand rests on the table, close to hers but not touching.

The glass window has faint street reflections — a ghostly outline of a man standing across the street watching (the viewer's POV is this man). Two people visible inside, one ghostly reflection outside. Photorealistic cinematic film still, shot on 50mm lens, shallow depth of field. Cold exterior, warm interior. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
Static camera from outside the glass. Inside, the man in the white shirt slides a business card across the table. The woman shakes her head slowly. He picks up the card. His hand remains on the table near hers. She does not pull away. Street reflections shift slightly on the glass. Two people inside the cafe. Cold exterior atmosphere. Hold for 10 seconds.
```

---

## S5：「妳自己知道。」 (40-50s)

**出場角色：`[CHAR-M]` + `[CHAR-F]`（雙人）**

**旁白 (VO-M)**：
「隔天清晨。我說：我搬出去。她說：為什麼？我說：妳自己知道。——她不知道。她不知道我說的跟她想的是兩件事。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Early morning bedroom scene. Cold blue dawn light from a window.

CHARACTER 1 (male, standing, mid-action): A breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武), slightly long messy black hair, wearing a wrinkled dark grey sweater. He is standing by an open wardrobe, pulling a small travel suitcase out. His jaw is set. He is not looking at her.

CHARACTER 2 (female, sitting up in bed): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), long black hair disheveled from sleep, wearing a white cotton sleep shirt. She has just sat up in bed, blanket pooled at her waist. Her eyes are wide — not with understanding, but with pure confusion. Her lips are slightly parted.

Cold blue dawn light. The bedroom is otherwise dark. Two people in frame. The emotional gap between them is visible in their body language. Photorealistic cinematic film still, shot on 35mm lens. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
The man pulls the suitcase from the wardrobe in one deliberate motion. He does not look at the woman. She sits up slowly — her hand reaches toward him but stops halfway, fingers curling back. He zips the suitcase. Cold blue dawn light shifts slowly across the room. Two people in frame. No words — pure body language. Cinematic tension.
```

---

## S6：他獨居·雨夜斑馬線 (50-60s)

**出場角色：`[CHAR-M]` 單人**

**旁白 (VO-F)**：
「他走了以後我站在窗邊。我不記得自己什麼時候站到這裡的。——而他，在城郊的街上走。他第一世就是在斑馬線上被車撞的。這一世他又走那條路。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Wide shot of a rain-soaked city street at night. A single pedestrian stands on a zebra crossing (crosswalk), seen from behind.

CHARACTER (male, single person in frame): A breathtakingly handsome Asian man around 30 years old, facial features resembling Takeshi Kaneshiro (金城武), slightly long messy black hair plastered wet against his face. He is wearing a dark coat, soaked through, standing still in the middle of the zebra crossing. He is not walking — he has stopped. His silhouette is backlit by approaching car headlights from the far end of the street. His head is slightly bowed. He is not looking at the oncoming light.

Rain falls heavily. The white stripes of the crosswalk are reflecting the headlights and street lamps. The traffic light above shows green for vehicles. He is standing where he should not be standing. Single person in frame. Photorealistic cinematic film still, shot on 35mm anamorphic lens. Rain streaks, lens flare from headlights, cold blue-white palette. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
Wide shot, static camera. Rain pours. The man stands motionless on the zebra crossing. Approaching headlights from the far end of the street grow brighter, casting his long shadow forward. He does not move. He does not look up. Rain streaks diagonally across the frame. The headlights bloom larger — then abruptly cut to black before any contact. Single person. Cinematic slow motion rain. 10 seconds.
```

---

## S7：燒絲巾 (60-70s)

**出場角色：`[CHAR-F]`（手部特寫為主）**

**旁白 (VO-M)**：
「她從衣櫃深處拿出那條藍色絲巾。她走到水槽邊。她點了火。——這件事我是從她寫給我的第六封信裡才知道的。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Extreme close-up of a woman's hands over a stainless steel kitchen sink. Her hands are pale, fingers slender.

CHARACTER (female, hands only): The hands of a breathtakingly elegant Asian woman, pale complexion, a faint 2cm scar visible on the right inner wrist. She is holding a deep cobalt blue silk scarf that is on fire — the edges curling black, flames licking upward with orange and blue. The silk is half-consumed, warping and shrinking. Her fingers hold the burning fabric steadily — she is not flinching.

The kitchen sink below catches ash. A small lighter lies on the counter edge. The background is dark — only the fire illuminates the scene with flickering warm light against cold steel. Photorealistic cinematic film still, extreme macro, shot on 50mm lens. Fire as the only light source. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
Extreme close-up static camera on hands and sink. The blue silk scarf burns slowly — edges curling, blackening, shrinking. Small flames flicker. Ash falls into the stainless steel sink. Her fingers remain steady, holding the fabric until the last piece turns to grey ash. She opens her fingers and lets the final fragment drop. Then she turns on the faucet — water rushes over the ash. Hold on the running water for 3 seconds. Single person (hands only). Cinematic fire light.
```

---

## S8：浴缸·第二世 (70-80s)

**出場角色：`[CHAR-F]` 單人**

**旁白 (VO-M)**：
「三天後。電話響。——她寫了十三封信。我那夜讀了一封。剩下十二封，很久以後才讀完。」

**Grok 出圖 prompt**：
```
Generate a vertical 9:16 aspect ratio image.

Wide shot of a dim bathroom. An old bathtub is filled with still water. Steam has mostly dissipated — the water has gone cold.

CHARACTER (female, single person in frame): A breathtakingly elegant Asian woman around 30 years old, facial features resembling Tang Wei (湯唯), lies in the bathtub, submerged to her shoulders. Her eyes are closed. Her long black hair fans out in the grey water. Her left hand hangs over the edge of the tub — a plain silver bracelet on her wrist catches a thin line of light from the doorway.

The bathroom is lit only by a sliver of light from a half-open door. On a small wooden stool beside the tub: a closed wooden box tied with a blue rubber band — the letter box. The water surface is perfectly still — no ripples, no steam. The scene is cold, not warm.

Photorealistic cinematic film still, shot on 35mm lens. Desaturated cold blue-grey palette. NOT graphic — hauntingly still. Single person in frame. Do NOT make it look like an illustration.
```

**Grok 影片 prompt**：
```
Static wide camera. The bathroom is still. The water does not move. Her closed eyes do not open. The only motion: the sliver of light from the half-open door slowly narrows as the door drifts shut by itself — the light shrinks to a thin line, then disappears. Total darkness for the final 2 seconds. A single drip from the faucet echoes. Single person in frame. Fade to black.
```

---

## 分鏡角色出場總覽

| 分鏡 | 秒數 | 旁白 | 出場角色 | 人數 |
|------|------|------|---------|------|
| S1 重生 3:07 | 0-10 | VO-M | `[CHAR-M]`（+ 女主身形暗示） | 1 (+1 silhouette) |
| S2 紅燒肉 | 10-20 | VO-M | `[CHAR-M]` + `[CHAR-F]` | 2 |
| S3 沒買絲巾 | 20-30 | VO-M | `[CHAR-F]` | 1 |
| S4 咖啡館 | 30-40 | VO-M | `[CHAR-F]` + `[CHAR-X]` | 2 |
| S5 離家 | 40-50 | VO-M | `[CHAR-M]` + `[CHAR-F]` | 2 |
| S6 雨夜斑馬線 | 50-60 | VO-F | `[CHAR-M]` | 1 |
| S7 燒絲巾 | 60-70 | VO-M | `[CHAR-F]`（手部） | 1 |
| S8 浴缸 | 70-80 | VO-M | `[CHAR-F]` | 1 |

---

## 旁白錄音稿（獨立錄製·後期混音疊加）

| 段 | 角色 | 情緒指示 | 中文旁白 |
|----|------|---------|---------|
| S1 | VO-M | 低沉·剛從死亡醒來的茫然 | 「然後我睜開眼。她在我旁邊。手機螢幕亮著——三點零七分。我記得那條斑馬線。我記得車燈逼過來。我沒躲。但我活著。」 |
| S2 | VO-M | 壓抑·警覺·吃飯時的緊繃 | 「第四天她煮了紅燒肉。她以前愛煮這道菜——在她打算離開我之前。我坐在對面吃。她看著我。我低頭吃蛋。」 |
| S3 | VO-M | 平靜敘述·暗流 | 「她走進那家賣絲巾的店。我記得那條藍——跟蜜月那條不一樣的藍。她站了十五分鐘。她走出來。手上什麼都沒有。」 |
| S4 | VO-M | 語速稍快·嫉妒與恐懼湧上 | 「我從玻璃外看見她。對面那個男人掏出一張名片推給她。她搖頭。他收回去。然後他的手靠近她的手——她沒移開。」 |
| S5 | VO-M | 前半冷硬·最後兩句放軟（事後的懊悔） | 「隔天清晨。我說：我搬出去。她說：為什麼？我說：妳自己知道。——她不知道。她不知道我說的跟她想的是兩件事。」 |
| S6 | VO-F | 平板·飄忽·帶一絲恐懼 | 「他走了以後我站在窗邊。我不記得自己什麼時候站到這裡的。——而他，在城郊的街上走。他第一世就是在斑馬線上被車撞的。這一世他又走那條路。」 |
| S7 | VO-M | 平靜但帶一絲顫抖·在信中讀到這件事 | 「她從衣櫃深處拿出那條藍色絲巾。她走到水槽邊。她點了火。——這件事我是從她寫給我的第六封信裡才知道的。」 |
| S8 | VO-M | 極低·接近耳語·最後一句留長停頓 | 「三天後。電話響。——她寫了十三封信。我那夜讀了一封。剩下十二封，很久以後才讀完。」 |

---

## EP3 與前兩集的結構呼應

- **EP1**（Part I）：男主走進空房子，發現遺物，得知真相
- **EP2**（Part II）：第一世全景——她的策劃、他的死、她的自盡
- **EP3**（Part III）：第二世——他帶著記憶重來，卻犯了更精準的錯

EP3 的核心悲劇：**輪迴不是開外掛，是帶著創傷重新犯罪。** 他記得一切，卻把她的每一次修正都讀成更高明的演技。

下一集 EP4 預告：第三世。「我有 FTD。」「我知道。」「妳死的那天。」——斑馬線。

---

## 製作執行 checklist

- [ ] 8 張 storyboard 圖（Grok·9:16）→ 存 `_publish/assets/storyboards/ep03/ep03_s{1-8}_*.png`
- [ ] 8 段 image-to-video（Grok·每段 10 秒）·共 80 秒
- [ ] 旁白錄音（男聲 + 女聲 S6）·依上方錄音稿
- [ ] 音樂混音（開場低頻嗡鳴·S4 起懸疑撥弦·S7 火焰噼啪聲·S8 水滴迴音後完全靜音）
- [ ] 剪接合成 mp4
- [ ] 上傳 YouTube Shorts
- [ ] 在 `chapters/03-齒輪.md` frontmatter 加 `video` 欄位
- [ ] commit + push
