# Image Generation Templates — Blind Orbit (盲軌：2028)
# 圖像生成模板 (Midjourney / Flux)

> 用於生成角色定裝、場景概念圖、情緒板、分鏡畫面等靜態素材。

---

## 通用風格關鍵詞 (Style Keywords)

以下關鍵詞應加入所有 prompt 尾端以維持視覺統一：

```
photorealistic, cinematic lighting, film grain, 8K resolution,
military thriller aesthetic, Tom Clancy visual style,
desaturated color palette, anamorphic lens,
shot on ARRI Alexa 65, shallow depth of field
```

### 負面提示 (Negative Prompt)
```
cartoon, anime, illustration, painterly, oversaturated colors,
fantasy elements, superhero aesthetic, clean/sterile look,
stock photo feel, CGI render look, plastic skin, perfect teeth,
smile, bright cheerful lighting, lens flare, watermark
```

### 本作視覺美學參考 (Aesthetic References)

| Category | References |
|----------|-----------|
| Cinematography | Roger Deakins (Sicario, 1917), Greig Fraser (Zero Dark Thirty, Dune) |
| Color Grading | Desaturated teal-amber split tone, crushed blacks, lifted shadows |
| Genre Films | Sicario (2015), Zero Dark Thirty (2012), Black Hawk Down (2001), Dunkirk (2017), Eye in the Sky (2015) |
| TV References | Tom Clancy's Jack Ryan, The Terminal List, The Night Manager |
| Cyber/Digital | Ghost in the Shell (1995), Mr. Robot (2015) — for data/hack sequences only |

### 各戰區色調 (Per-Theater Palettes)

| Theater | Color Keywords |
|---------|---------------|
| Taiwan (台灣) | `cold blue-teal, subtropical humidity, monsoon grey, concrete bunker green, neon-less urban darkness` |
| Europe/Poland (歐洲) | `frozen grey-blue, overcast winter, snow-covered pine, Soviet infrastructure decay, NATO olive drab` |
| Middle East (中東) | `harsh amber-orange, sand-whipped, Golan Heights basalt brown, burnt sienna, heat haze` |
| Cyber/Digital (數位) | `blue-green holographic, phosphor monitor glow, scan line artifacts, data stream, dark room with screen light` |

---

## 模板一：角色轉身定裝表 (Character Turnaround Sheet)

### Template

```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on [dark gray / white] background.

[CHARACTER DESCRIPTION]:
- Age: [AGE]
- Build: [BUILD]
- Hair: [HAIR]
- Face: [DISTINGUISHING FEATURES]
- Wardrobe: [CLOTHING/GEAR DETAILS]
- Props: [KEY ITEMS]
- Expression: [EMOTIONAL STATE]

[LIGHTING STYLE] studio lighting, 8K resolution, hyperdetailed
skin texture. Concept art for film production.
Reference: [ACTOR/FILM REFERENCE for visual shorthand].

--ar 16:9 --style raw --v 6.1
```

### 林子修 (Skywatcher)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Taiwanese male military officer, 34 years old, 175cm,
lean athletic build. Clean-shaven, sharp cheekbones,
intense dark brown eyes with subtle dark circles from
chronic sleep deprivation. Short military-regulation black hair.
Wearing dark olive ROC Air Force Nomex flight suit with
Tactical Air Control patches on both shoulders, black
combat boots, dog tags visible at collar. Leather watch on
left wrist. Small comms earpiece in right ear.
Expression: controlled precision masking inner tension.
No smile. Guarded, focused gaze.

Cool-white key light with blue rim light, 8K resolution,
hyperdetailed skin texture. Concept art for film production.
Reference: young Tony Leung Chiu-wai in military context.

--ar 16:9 --style raw --v 6.1
```

### 凱恩 (Nomad)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

American male, 38 years old, 183cm, muscular but worn-down
build showing long-term physical strain. Thick dark stubble,
deep-set hazel eyes with heavy dark circles, weathered
sun-damaged skin, faint scar across left temple from TBI.
Unkempt brown hair. Wearing sand-colored tactical plate carrier
with no unit patches or insignia, rolled-up tan sleeves revealing
forearm tattoos (faded Special Forces crest), tan combat pants,
desert boots. XM7 rifle slung across chest. IVAS helmet clipped
to belt. Small pill bottle visible in chest pocket.
Expression: flat affect, thousand-yard stare. No emotion.

Warm amber key light, 8K resolution, hyperdetailed skin texture.
Reference: Joel Edgerton in Zero Dark Thirty.

--ar 16:9 --style raw --v 6.1
```

### 伊萊亞斯·沃格爾 (Jaeger)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

German male, 42 years old, 180cm, lean wiry build.
Angular face, receding hairline with close-cropped sandy
brown hair, wire-rimmed glasses, sharp blue-grey eyes that
scan constantly. Wears NATO olive drab field jacket over
dark turtleneck sweater, grey cargo pants, black tactical boots.
Leather messenger bag slung across body. HF radio handset
clipped to jacket lapel. No visible weapons.
Weathered leather-bound codebook partially visible in bag.
Expression: paranoid alertness, jaw slightly clenched.

Cool overcast key light, 8K resolution, hyperdetailed skin texture.
Reference: Daniel Bruhl meets Michael Fassbender.

--ar 16:9 --style raw --v 6.1
```

### 蘇菲·洛朗 (Sophie Laurent)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

French female, 45 years old, 170cm, poised elegant build.
Auburn hair in a precise chignon, high cheekbones, cold green
eyes, immaculate makeup even in crisis. Wearing tailored navy
EU Commission blazer with gold EU flag lapel pin, cream silk
blouse, pencil skirt, low heels. Pearl earrings. Holds a
secure tablet in one hand and smartphone in the other.
Expression: controlled superiority masking anxiety.
Every detail immaculate — a politician's armor.

Soft warm key light, 8K resolution. Reference: Cate Blanchett
in political thriller. Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

### 張弘毅 (Colonel Chang — The Traitor)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Taiwanese male, 52 years old, 178cm, solid authoritative build.
Greying temples, square jaw, deep-set eyes that subtly avoid
direct contact. Pressed ROC Air Force colonel uniform with
command insignia, polished shoes, rigid military posture.
Hands clasped behind back — one hand subtly trembling.
Service pistol in belt holster.
Expression: composed authority with hairline cracks of guilt.
A man holding a mask in place.

Neutral key light, 8K resolution. Reference: Chow Yun-fat
in military authority role. Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

### 柯大勇 (Captain Ko — Black Bear)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Taiwanese male, 36 years old, 172cm, stocky muscular build.
Thick stubble, broad weathered face, squinting eyes from years
in the field. ROC Army digital woodland camouflage combat
uniform, full tactical plate carrier loaded with ammo pouches,
radio headset around neck, scuffed combat boots caked with
dried mud. T65K2 assault rifle in right hand. Map case and
lensatic compass on belt. Fingerless gloves.
Expression: grim determination, protective aggression.
A man who fights with his hands, not paperwork.

Hard directional key light, 8K resolution. Concept art.

--ar 16:9 --style raw --v 6.1
```

### 「老師」陳維國 (The Teacher)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Chinese male, 63 years old, 175cm, thin scholarly build.
Receding grey hair neatly combed back, reading glasses perched
on nose, calm serene expression with penetrating intelligent eyes.
Wearing PLA senior officer dress uniform (Type 07 olive green)
with senior colonel insignia, polished shoes. Stands with hands
clasped in front — unhurried, patient, almost professorial.
No visible weapons. A calligraphy brush pen in breast pocket.
Expression: serene confidence bordering on condescension.
A chess master who believes he has already won.

Neutral warm key light, 8K resolution, hyperdetailed skin texture.
Reference: Tony Leung Ka-fai in commanding intellectual role.
Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

### 薩拉·詹金斯 (Sarah Jenkins — Pine Gap)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Australian female, 32 years old, 168cm, fit athletic build.
Sandy blonde hair pulled back in a tight bun, lightly tanned
freckled skin, sharp grey-blue eyes, no makeup. Wearing RAAF
(Royal Australian Air Force) blue-grey flight suit with Australian
flag patch on left shoulder, Pine Gap facility badge on lanyard,
anti-static wrist strap. Tactical watch on left wrist. Holds a
ruggedized laptop in one hand. Expression: focused determination,
the look of someone maintaining a critical system alone.

Cool fluorescent key light, 8K resolution, hyperdetailed skin
texture. Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

### 賈法爾博士 (Dr. Jafar)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Iranian male, 48 years old, 170cm, thin gaunt build showing
chronic stress. Unkempt black beard with grey streaks,
wire-frame glasses, sunken dark eyes with pronounced dark
circles, receding black hair. Wearing rumpled beige civilian
shirt, dark trousers, scuffed shoes — academic who has been
on the run. Clutches a battered leather laptop bag close to
his body. Nervous hand tremor. Sweating.
Expression: terrified intelligence — a man who knows too much
and understands how expendable he is.

Harsh amber key light, 8K resolution, hyperdetailed skin texture.
Reference: a Middle Eastern academic in crisis.
Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

### 萊拉 (Leyla — Mossad Kidon)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Israeli female, 35 years old, 165cm, lean wiry athletic build.
Dark brown hair in a practical short ponytail, olive skin,
sharp dark brown eyes, angular jaw. No distinctive marks —
designed to be forgettable. Wearing sand-colored tactical
shirt, dark cargo pants, desert boots. Lightweight chest rig
with minimal pouches (pistol mag, radio, knife). Suppressed
Jericho 941 pistol in thigh holster. Optical camouflage
shemagh draped around neck. Expression: cold professional
assessment — watching, calculating, deciding whether to kill.

Warm amber key light, 8K resolution, hyperdetailed skin texture.
Reference: Gal Gadot stripped of glamour, utilitarian.
Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

### 皮奧特·科瓦爾斯基 (Piotr "Bear" Kowalski)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

Polish male, 44 years old, 185cm, broad-shouldered heavy build.
Thick brown beard with frost, ruddy wind-burned face, small
blue eyes set deep in a square face, cropped hair under a Polish
Army winter field cap. Wearing Polish Army woodland camouflage
tanker's coverall, black tanker's boots, thick wool scarf.
Leather gloves. Radio headset around thick neck. Shell casings
caught in the folds of his uniform. Expression: grim
determination with a hint of dark humor — a man who jokes
before he kills.

Cold overcast key light, 8K resolution, hyperdetailed skin
texture. Reference: Eastern European military bear of a man.
Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

### 馬修·柯乃爾 (Matthew Cornell — The Silencer)
```
Photorealistic character turnaround reference sheet.
5 angles: front, 3/4 front, side, 3/4 back, back.
Neutral pose on neutral dark gray background.

American male, 51 years old, 180cm, lean runner's build gone
slightly gaunt. Clean-shaven, high forehead, thinning grey-brown
hair, wire-rimmed glasses (similar to Elias but rounder frame),
pale blue eyes that radiate calm conviction. Wearing nondescript
dark grey civilian jacket over black turtleneck, dark jeans,
clean white sneakers — deliberately anonymous, could be any
tech executive. No military gear, no weapons visible. Carries
a slim encrypted tablet. Expression: serene intellectual
certainty — a true believer who has made peace with mass
destruction as necessary evolution.

Neutral flat key light, 8K resolution, hyperdetailed skin
texture. Reference: a Silicon Valley ideologue gone rogue.
Concept art for film production.

--ar 16:9 --style raw --v 6.1
```

---

## 模板二：場景概念圖 (Scene Concept Art)

> ⚠️ **一致性規則**：若場景中出現角色，必須嵌入該角色的完整視覺錨點描述。
> 從 `workflow.md`「角色視覺錨點速查表」**原文複製**，不可用「a soldier」「a figure」等泛稱替代。

### Template

```
Cinematic [SHOT TYPE: wide/medium/close] shot of [LOCATION].
[TIME OF DAY], [WEATHER CONDITIONS].
[KEY VISUAL ELEMENTS — architecture, vehicles, equipment].
[ATMOSPHERIC DETAILS — smoke, rain, light sources].
Color palette: [PRIMARY], [SECONDARY], [ACCENT].
Cinematography reference: [FILM REFERENCE].
Photorealistic matte painting, film production design.
Aspect ratio 2.39:1 cinemascope.

--ar 21:9 --style raw --v 6.1
```

### 樂山雷達站 — 攻擊前
```
Cinematic wide shot of a massive AN/FPS-115 PAVE PAWS phased-array
radar installation on a remote mountain summit in Taiwan, elevation
3000m. Dawn light breaking through low clouds, sea of clouds below
the summit. The rectangular radar face is a 30-meter concrete
monolith embedded in the mountainside, glowing faintly green with
operational lights. Military antenna arrays and hardened bunker
entrances dot the surrounding ridge. Mist rising from subtropical
forest below. Armed guards at perimeter checkpoint.
Color palette: steel gray, forest green, amber dawn light.
Cinematography reference: Sicario landscape shots by Roger Deakins.
Photorealistic matte painting, film production design.
Aspect ratio 2.39:1 cinemascope.

--ar 21:9 --style raw --v 6.1
```

### 樂山雷達站 — 遇襲
```
Cinematic wide shot of the same mountain radar station, now under
attack. An anti-radiation missile streaks across frame trailing
fire, slamming into the radar face. Massive explosion, concrete
debris blasting outward. Secondary explosions from antenna arrays.
Smoke and dust column rising against a red-orange dawn sky.
Soldiers running toward bunker entrances. Emergency lights
flashing. The mountain forest below is catching fire from debris.
Color palette: fire orange, smoke grey, emergency red.
Reference: Black Hawk Down explosion sequences.

--ar 21:9 --style raw --v 6.1
```

### 台北停電
```
Cinematic high-angle wide shot of Taipei city at night during total
blackout. Taipei 101 is a dark monolith against clouded sky. Entire
city without power — no streetlights, no neon, no traffic signals.
Scattered fires burning in residential areas. Flashlight beams from
apartment windows. Distant orange glow of artillery beyond Yangming
mountains. Smoke haze drifting through empty streets. Abandoned
vehicles on Zhongxiao East Road.
Color palette: near-monochromatic dark blue-black, fire-orange accents.
Reference: Children of Men, The Road.
Photorealistic matte painting, oppressive apocalyptic stillness.

--ar 21:9 --style raw --v 6.1
```

### 蘇瓦烏基走廊
```
Cinematic wide shot of the Suwalki Gap, frozen Polish-Lithuanian
border forest. Grey winter dawn, heavy overcast. Snow-covered pine
trees lining a narrow forest road churned by tank tracks. Abandoned
civilian cars pushed into ditches. A Leopard 2A8 tank hidden among
trees, barrel protruding through snow-laden branches. Breath-like
exhaust from the engine. Single column of smoke rising beyond the
distant tree line.
Color palette: grey-blue, frozen white, diesel-black.
Reference: Dunkirk and Fury.
Photorealistic matte painting.

--ar 21:9 --style raw --v 6.1
```

### 地下指揮所
```
Cinematic medium shot of a cramped underground military command
center. Banks of old CRT monitors mixed with modern flat screens —
half showing static and [SYS_SYNC_FAIL] error messages. Operators
hunched over consoles in dim light. Overhead fluorescent lights
flickering, cables running across the floor. Paper maps taped to
concrete walls with grease pencil markings. Stale coffee cups,
overflowing ashtrays, scattered printouts.
Color palette: cold blue-green from screens, harsh fluorescent white.
Reference: Crimson Tide, Das Boot.
Claustrophobic tension. Photorealistic.

--ar 21:9 --style raw --v 6.1
```

### 杜拜 — 崩壞
```
Cinematic aerial shot of the Dubai skyline at dusk. Normally
gleaming skyscrapers now dark — scattered fires burning in lower
floors. The Burj Khalifa stands unlit against an orange smoky sky.
Smoke drifts across the marina. Distant tracers arc across the
harbor. Luxury yachts listing in the water. Abandoned supercars
on Sheikh Zayed Road.
Color palette: amber-red dusk, smoke grey, gold gone dark.
Reference: Blade Runner 2049 dystopia meets The Hurt Locker.

--ar 21:9 --style raw --v 6.1
```

### 敘利亞沙漠
```
Cinematic wide shot of barren Syrian desert near the Golan Heights
at golden hour. Rocky basalt terrain stretching to the horizon.
Heat shimmer distorting the distant view. A damaged technical
vehicle (Toyota Hilux with mounted weapon) parked beside ancient
stone ruins. Dust devil spinning in the middle distance. Harsh
amber-orange sunlight casting long shadows. Kane — weathered American
male, late 30s, thick dark stubble, deep-set hazel eyes, faint scar
across left temple, sand-colored tactical plate carrier with no
insignia, XM7 rifle slung across chest — crouching beside the vehicle,
checking a paper map.
Color palette: burnt sienna, basalt black, golden amber.
Reference: The Hurt Locker, Sicario Day of the Soldado.

--ar 21:9 --style raw --v 6.1
```

---

## 模板三：情緒板 (Mood Board)

### Template

```
Mood board collage for [SCENE/CHAPTER NAME]. 4x3 grid layout.
Theme: [EMOTIONAL TONE].
Include: [LIST 6-8 VISUAL ELEMENTS — textures, colors, objects,
lighting moods].
Overall palette: [COLOR DESCRIPTION].
Style: editorial photography meets military documentary.

--ar 3:2 --style raw --v 6.1
```

### Act 1: 寧靜海 (The Blinding)
```
Mood board collage for "The Blinding" — global military systems failure.
4x3 grid layout. Theme: technological collapse meets human helplessness.
Include: white noise on CRT screen, satellite in dark orbit, empty
radar scope with ghost targets, red emergency light in corridor,
soldier's hand gripping radio with no signal, city skyline going dark
section by section, server rack with dying LEDs, analog compass on
crumpled paper map.
Overall palette: cold green, static white, emergency red, deep black.
Style: editorial photography meets military documentary.

--ar 3:2 --style raw --v 6.1
```

### Act 2: 孤島 (The Archipelago)
```
Mood board collage for "The Archipelago" — world fragmented into
isolated pockets. 4x3 grid layout. Theme: isolation, espionage,
survival in disconnected zones.
Include: shortwave radio dial close-up, coded handwritten message
on weathered paper, frozen footprints in snow, hand reaching for
pistol in holster, darkened EU parliament chamber, candle in a
blacked-out hospital ward, tank tracks in frozen mud, a face
half-lit by a single screen.
Overall palette: ice blue, charcoal, dim amber, deep shadow.
Style: editorial photography meets military documentary.

--ar 3:2 --style raw --v 6.1
```

### Act 3: 轉折 (The Turn)
```
Mood board collage for "The Turn" — the tide shifts. 4x3 grid layout.
Theme: counter-attack, betrayal exposed, networks rebuilding.
Include: hand slamming down on table with classified documents,
tank column emerging from forest at dawn, radio antenna being
erected on rooftop, bloodied handcuffs on interrogation table,
satellite dish rotating toward sky, soldiers running across a
smoke-filled bridge, fire in a politician's office, two hands
gripping each other in a dark corridor.
Overall palette: gunmetal grey, dawn amber, blood red, signal green.
Style: editorial photography meets military documentary.

--ar 3:2 --style raw --v 6.1
```

---

## 模板四：分鏡格 (Storyboard Frame)

> ⚠️ **一致性規則**：分鏡中出現的每位角色都必須嵌入完整視覺錨點描述。
> 從 `workflow.md`「角色視覺錨點速查表」**原文複製**，不可簡化。

### Template

```
Single storyboard frame, cinematic composition.
[SCENE DESCRIPTION — who, what, where].
Camera: [ANGLE — low/high/eye-level/dutch], [MOVEMENT — static/push-in/tracking].
Framing: [SHOT SIZE — wide/medium/close/extreme close-up].
Lighting: [KEY LIGHT SOURCE AND QUALITY].
Color: [DOMINANT TONE].
Aspect ratio 2.39:1. Photorealistic, film grain.

--ar 21:9 --style raw --v 6.1
```

### Example — The Blinding Sequence
```
Single storyboard frame, cinematic composition.
Lin Tzu-Hsiu — Taiwanese male, mid-30s, clean-shaven, sharp
cheekbones, intense dark brown eyes with dark circles, short
military-regulation black hair, dark olive ROC Air Force Nomex flight
suit with Tactical Air Control patches, dog tags visible, comms
earpiece in right ear — sitting before a wall of CRT monitors filled
with cascading static. One monitor center-frame shows a single
anomalous blip pulsing. His hand reaches toward the intercom button.
The room is lit only by the green glow of screens.
Camera: low angle, pushing in slowly.
Framing: wide shot emphasizing scale of screens vs lone operator.
Lighting: green phosphor glow from monitors, no other light source.
Color: cold green and black.
Aspect ratio 2.39:1. Photorealistic, film grain.

--ar 21:9 --style raw --v 6.1
```

### Example — Kane Desert Extraction
```
Single storyboard frame, cinematic composition.
Kane — weathered American male, late 30s, thick dark stubble, deep-set
hazel eyes with heavy dark circles, faint scar across left temple,
unkempt brown hair, sand-colored tactical plate carrier with no unit
patches or insignia, XM7 rifle aimed toward the horizon — crouching
behind a damaged Hilux in open desert. Behind him: Dr. Jafar — thin
Iranian male, late 40s, gaunt scholarly build, wire-frame glasses,
unkempt beard, rumpled civilian clothes, clutching a laptop bag —
huddles low. Heat shimmer distorts the background. Bullet impacts
kick up dust around them.
Camera: eye-level, static wide.
Framing: medium-wide, both figures in lower third.
Lighting: harsh overhead desert sun, sharp shadows.
Color: amber-orange, dust brown.
Aspect ratio 2.39:1. Photorealistic, film grain.

--ar 21:9 --style raw --v 6.1
```

---

## 寬高比建議 (Aspect Ratio Guide)

| 用途 | 比例 | Midjourney 參數 |
|------|------|-----------------|
| 電影場景 / 分鏡 | 2.39:1 | `--ar 21:9` |
| 角色定裝表 | 16:9 | `--ar 16:9` |
| 書封 / 海報 | 2:3 | `--ar 2:3` |
| 情緒板 | 3:2 | `--ar 3:2` |
| Instagram / 社群 | 1:1 | `--ar 1:1` |
| YouTube 縮圖 | 16:9 | `--ar 16:9` |

---

## 品質參數建議 (Quality Parameters)

### Midjourney v6.1

| Use Case | Stylize | Quality | Mode | Notes |
|----------|---------|---------|------|-------|
| Character turnaround | `--s 50` | `--q 1` | `--style raw` | Low stylize for accuracy |
| Scene concept art | `--s 100` | `--q 1` | `--style raw` | Moderate for mood |
| Mood board | `--s 150` | `--q 1` | optional | Higher for artistic feel |
| Storyboard | `--s 25` | `--q 1` | `--style raw` | Minimal stylization |
| Hero poster shot | `--s 200` | `--q 2` | optional | Maximum cinematic drama |

**Key Tips:**
- Always use `--style raw` for photorealistic military content (avoids MJ beautification)
- Use `--cref [URL]` (character reference) with your locked turnaround sheets
- Use `--sref [URL]` (style reference) to lock visual style across batches
- Generate 4 variants, pick the most consistent for reference lock

### Flux Pro

| Use Case | Dimensions | Guidance Scale | Steps |
|----------|-----------|---------------|-------|
| Character reference | 1344x768 | 3.5 | 28 |
| Scene concept art | 1344x576 | 4.0 | 30 |
| Storyboard | 1344x576 | 2.5 | 20 |
| High-detail hero shot | 1344x768 | 4.0 | 35 |

**Key Tips:**
- Flux excels at prompt adherence and photorealism
- Lower guidance (2.5-3.5) produces more natural results
- Fix seed for consistency across character shots
- Generate at max resolution, upscale with Topaz or Real-ESRGAN

---

## 注意事項 (Important Notes)

1. **Consistency is paramount** — once you generate a character reference that works, lock it with `--cref` for all subsequent prompts.
2. **Avoid "beautiful" or "attractive"** — these characters are exhausted, dirty, stressed. Use "weathered," "worn," "gaunt," "sharp."
3. **Specify "no smile" explicitly** — AI generators default to pleasant expressions.
4. **Military accuracy matters** — wrong patches, wrong camo pattern, wrong weapon model = unusable output. Specify exact details.
5. **Generate variations** — make 4+ versions of each key image, select the most consistent for the reference lock.
6. **Flux for accuracy, Midjourney for mood** — use both strategically depending on the asset type.
7. **Upscale for production** — all generated images should be upscaled before use in video pipeline.
