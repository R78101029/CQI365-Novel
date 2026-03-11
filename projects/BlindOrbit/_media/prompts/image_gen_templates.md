# Image Generation Templates — Blind Orbit (盲軌：2028)
# 圖像生成模板 (Midjourney / Flux / Stable Diffusion)

> 用於生成角色定裝、場景概念圖、分鏡畫面等靜態素材。

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
stock photo feel, CGI render look, plastic skin, perfect teeth
```

---

## 模板一：角色轉身定裝表 (Character Turnaround Sheet)

```
Photorealistic character turnaround sheet of [CHARACTER DESCRIPTION].
[AGE], [BUILD], [HAIR], [DISTINGUISHING FEATURES].
Wearing [WARDROBE DETAILS].
Front view, three-quarter view, and side profile on neutral [dark gray / white] background.
[LIGHTING STYLE] studio lighting, 8K resolution, hyperdetailed skin texture.
Reference: [ACTOR/FILM REFERENCE for visual shorthand].
Expression: [EMOTIONAL STATE].
--ar 16:9 --style raw --v 6.1
```

### 範例 — 林子修
```
Photorealistic character turnaround sheet of a Taiwanese Air Force major.
Early 30s, lean athletic build, short-cropped black hair, sharp cheekbones,
intense dark brown eyes with subtle dark circles.
Wearing olive-green Nomex flight suit with ROCAF patches, dog tags visible.
Front view, three-quarter view, and side profile on neutral dark gray background.
Cool-white key light with blue rim light, 8K resolution, hyperdetailed skin texture.
Reference: young Tony Leung Chiu-wai in military context.
Expression: controlled precision masking inner tension.
--ar 16:9 --style raw --v 6.1
```

---

## 模板二：場景概念圖 (Scene Concept Art)

```
Cinematic [SHOT TYPE: wide/medium/close] shot of [LOCATION DESCRIPTION].
[TIME OF DAY], [WEATHER CONDITIONS].
[KEY VISUAL ELEMENTS — architecture, vehicles, equipment].
[ATMOSPHERIC DETAILS — smoke, rain, light sources].
Color palette: [PRIMARY], [SECONDARY], [ACCENT].
Cinematography reference: [FILM REFERENCE].
Aspect ratio 2.39:1 cinemascope.
--ar 21:9 --style raw --v 6.1
```

### 範例 — 樂山雷達站
```
Cinematic wide shot of a massive phased-array radar installation on a remote
mountain summit in Taiwan, elevation 3000m. Dawn light breaking through low clouds.
The rectangular radar face is a 30-meter concrete monolith embedded in the mountainside.
Military antenna arrays and hardened bunker entrances dot the surrounding ridge.
Mist rising from subtropical forest below. Color palette: steel gray, forest green,
amber dawn light. Cinematography reference: Sicario landscape shots by Roger Deakins.
Aspect ratio 2.39:1 cinemascope.
--ar 21:9 --style raw --v 6.1
```

---

## 模板三：情緒板 (Mood Board)

```
Mood board collage for [SCENE/CHAPTER NAME]. 4x3 grid layout.
Theme: [EMOTIONAL TONE].
Include: [LIST 6-8 VISUAL ELEMENTS — textures, colors, objects, lighting moods].
Overall palette: [COLOR DESCRIPTION].
Style: editorial photography meets military documentary.
--ar 3:2 --style raw --v 6.1
```

### 範例 — Act 1: 寧靜海 (The Blinding)
```
Mood board collage for "The Blinding" — global military systems failure.
4x3 grid layout. Theme: technological collapse meets human helplessness.
Include: white noise on CRT screen, satellite in dark orbit, empty radar scope,
red emergency light in corridor, soldier's hand gripping radio with no signal,
city skyline going dark, server rack with dying LEDs, analog compass on paper map.
Overall palette: cold green, static white, emergency red, deep black.
Style: editorial photography meets military documentary.
--ar 3:2 --style raw --v 6.1
```

---

## 模板四：分鏡格 (Storyboard Frame)

```
Single storyboard frame, cinematic composition.
[SCENE DESCRIPTION — who, what, where].
Camera: [ANGLE — low/high/eye-level], [MOVEMENT — static/push-in/tracking].
Framing: [SHOT SIZE — wide/medium/close/extreme close-up].
Lighting: [KEY LIGHT SOURCE AND QUALITY].
Color: [DOMINANT TONE].
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

## 品質參數 (Quality Parameters)

| 工具 | 推薦參數 |
|------|----------|
| Midjourney v6.1 | `--style raw --v 6.1 --q 2` |
| Flux Pro | `steps: 50, guidance: 7.5, seed: fixed for consistency` |
| Stable Diffusion | `CFG: 7, steps: 40, sampler: DPM++ 2M Karras` |
