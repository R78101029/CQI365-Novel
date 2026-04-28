# Veo 3.1 Video Generation Prompt Templates
# 盲軌：2028 影片生成提示模板

> **用途**：用於 Google Veo 3.1 生成小說影片素材。所有提示以英文撰寫以獲得最佳效果。

---

## Base Style Prefix（基礎風格前綴）

Prepend this to ALL prompts for visual consistency:

```
Cinematic 4K footage, 24fps, anamorphic widescreen 2.39:1 aspect ratio,
subtle film grain, desaturated color grading with cold blue-teal shadows
and warm amber highlights, shallow depth of field, Arri Alexa camera look.
Military thriller aesthetic inspired by Sicario, Zero Dark Thirty, and
Black Hawk Down. Realistic lighting, no CGI look. Year 2028 near-future.
```

### Variant: Night / Low-Light Scenes

```
Cinematic 4K footage, 24fps, anamorphic 2.39:1, heavy film grain,
near-monochromatic palette with deep blacks and minimal green-tinted
ambient light, infrared / thermal imaging overlay flickers.
Practical lighting only — flashlights, muzzle flash, burning wreckage.
Military thriller aesthetic, oppressive darkness.
```

### Variant: Digital / Cyber Sequences

```
Cinematic 4K footage, 24fps, 2.39:1, clean digital aesthetic with
subtle scan lines and data corruption artifacts, holographic blue-green
HUD overlays, code scrolling in reflections, glitch effects on screen edges.
Inspired by Mr. Robot and Ghost in the Shell (1995).
```

---

## Character Shot Template（角色鏡頭模板）

> ⚠️ **一致性規則**：所有含角色的 prompt 必須嵌入該角色的完整視覺錨點描述。
> 從 `workflow.md`「角色視覺錨點速查表」或下方範例中**原文複製**，不可改寫或簡化。
> 若場景含多位角色，每位都必須嵌入各自的錨點。

### Close-Up / Portrait

```
[BASE STYLE PREFIX]

Tight close-up of [CHARACTER DESCRIPTION — 從錨點表複製完整描述], [EXPRESSION].
[LIGHTING CONDITION]. [ENVIRONMENT DETAIL].
Camera slowly [MOVEMENT — pushes in / pulls back / holds steady].
[ATMOSPHERIC DETAIL — breath visible, sweat on brow, dust particles].
```

**Example — Lin Tzu-Hsiu (林子修):**

```
Cinematic 4K footage, 24fps, anamorphic 2.39:1, subtle film grain,
desaturated cold blue-teal grading.

Tight close-up of a Taiwanese male military officer in his mid-30s,
clean-shaven, sharp cheekbones, wearing a dark olive flight suit with
ROC Air Force patches. Expression: intense concentration with subtle
tension in jaw muscles. Pale blue light from multiple radar screens
illuminates his face from below, casting deep shadows under his eyes.
Interior of a cramped radar operations room filled with old CRT monitors.
Camera holds steady, then slowly pushes in. Green phosphor light
flickers across his pupils. He winces slightly — tinnitus.
```

**Example — Kane (凱恩):**

```
Cinematic 4K footage, 24fps, anamorphic 2.39:1, heavy film grain,
amber-tinted desert grading.

Medium close-up of a weathered American male in his late 30s, thick
dark stubble, deep-set hazel eyes with heavy dark circles, faint scar
across left temple from TBI, unkempt brown hair, wearing sand-colored
tactical plate carrier with no unit patches or insignia. An advanced
military helmet (IVAS) sits tilted back on his head, its visor
displaying [SYS_SYNC_FAIL] error text. XM7 rifle slung across chest.
Harsh desert sunlight creates sharp shadows on his weathered face.
Wind whips fine sand across frame. He stares at something off-camera
with blank, nihilistic detachment. Camera holds, barely perceptible
handheld sway.
```

**Example — Elias Vogel (沃格爾):**

```
Cinematic 4K footage, 24fps, anamorphic 2.39:1, desaturated cold
blue-grey grading.

Close-up of a German male in his early 40s, angular face, receding
hairline with close-cropped sandy brown hair, wire-rimmed glasses,
sharp blue-grey eyes that scan constantly, lean wiry build, wearing a
NATO olive drab field jacket over dark turtleneck sweater. Expression:
paranoid alertness. He sits in a dimly lit Polish farmhouse, back
against the wall, never facing away from the door. A weathered
leather-bound codebook sits open on the table before him. HF radio
handset clipped to jacket lapel. Single kerosene lamp casts warm
flickering light. He swallows a pill dry, grimacing — stomach ulcer.
```

---

## Action Sequence Template（動作場景模板）

> ⚠️ **一致性規則**：場景中出現的每位角色都必須嵌入完整視覺錨點描述。
> 從 `workflow.md`「角色視覺錨點速查表」**原文複製**，不可用「a soldier」等泛稱替代。

```
[BASE STYLE PREFIX]

[SHOT TYPE — Wide establishing / tracking / handheld close].
[MILITARY ACTION DESCRIPTION — 含角色錨點描述]. [VEHICLE/WEAPON DETAILS].
[ENVIRONMENTAL CONDITIONS — weather, time of day, terrain].
[CAMERA MOVEMENT — follows action / static with motion blur /
crash zoom]. [SOUND DESIGN NOTES — for reference only].
Practical effects look, no superhero physics.
Brutal, grounded combat choreography.
```

**Example — Radar Station Attack (樂山雷達站遇襲):**

```
Cinematic 4K footage, 24fps, anamorphic 2.39:1, heavy film grain.

Wide shot of a massive phased-array radar installation on a forested
mountain peak at dawn. Suddenly, a streak of fire — an anti-radiation
missile traveling at Mach 3.5 — slams into the radar face. Massive
explosion. Debris and concrete fragments shower outward. Camera
shakes violently from the shockwave. Cut to: inside the bunker —
Lin Tzu-Hsiu (Taiwanese male, mid-30s, clean-shaven, sharp
cheekbones, dark olive ROC Air Force flight suit, Tactical Air Control
patches) is thrown against a console. Beside him, Chief Lee (Taiwanese
male, 50s, weathered face, senior NCO radar operator) shields a
backup hard drive. Monitors explode in showers of sparks.
Emergency red lighting activates. Smoke fills the corridors.
Grounded, realistic destruction — no Hollywood fireball.
```

**Example — Leopard 2A8 Forest Ambush (森林伏擊):**

```
Cinematic 4K footage, 24fps, anamorphic 2.39:1, cold blue-green
forest grading, dawn light filtering through pine trees.

Thermal imaging POV: white-hot silhouettes of T-90 tanks moving
through a frozen Polish forest road. Cut to: exterior wide shot of
a Leopard 2A8 tank hidden among snow-covered pine trees, its barrel
slowly tracking. Beat of silence. Then the 120mm cannon fires —
massive muzzle blast strips snow from nearby branches. The T-90
erupts in a column of fire. Immediately, return fire impacts around
the Leopard's position, trees splintering. Camera follows at ground
level, shaking with each impact.
```

---

## Dialogue Scene Template（對話場景模板）

> ⚠️ **一致性規則**：對話雙方必須各自嵌入完整視覺錨點描述。
> 從 `workflow.md`「角色視覺錨點速查表」**原文複製**，不可簡化為「a young officer」等泛稱。

```
[BASE STYLE PREFIX]

[SHOT COMPOSITION — over-the-shoulder / two-shot / single with rack focus].
[CHARACTER A — 完整錨點描述] and [CHARACTER B — 完整錨點描述] in
[LOCATION]. [LIGHTING]. [EMOTIONAL TONE — tense standoff /
hushed conspiracy / grief]. Naturalistic performance, minimal gestures.
[SUBTLE ACTION — hands trembling / looking away / gripping weapon].
Camera [MOVEMENT — slow dolly / locked off / gentle handheld drift].
```

**Example — Lin confronts Colonel Chang (林子修對質張弘毅):**

```
Cinematic 4K footage, 24fps, anamorphic 2.39:1, desaturated palette,
single overhead fluorescent light buzzing.

Tense two-shot in a cramped underground military command post.
Lin Tzu-Hsiu — Taiwanese male, mid-30s, clean-shaven, sharp
cheekbones, intense dark brown eyes with dark circles, short
military-regulation black hair, dark olive ROC Air Force Nomex flight
suit with Tactical Air Control patches, dog tags visible, comms
earpiece in right ear — stands rigid, holding a tablet displaying
system logs. Facing him: Colonel Chang — Taiwanese male, 50s, greying
temples, square jaw, deep-set eyes avoiding direct contact, pressed
ROC Air Force colonel uniform with command insignia, rigid military
posture — his hand drifts toward his sidearm. Between them, a metal
desk with scattered papers and a dead radio.
Camera holds in uncomfortable stillness. Neither man blinks.
```

---

## Establishing Shot Template（場景確立鏡頭模板）

```
[BASE STYLE PREFIX]

Sweeping [AERIAL/GROUND LEVEL] establishing shot of [LOCATION].
[TIME OF DAY]. [WEATHER CONDITIONS]. [KEY VISUAL ELEMENTS that
establish the setting]. [ATMOSPHERE — peaceful before storm /
war-torn / eerie calm]. Camera [MOVEMENT — slow drone push-in /
lateral tracking / static wide]. No people visible / distant
silhouettes only.
```

**Example Locations:**

**Leshan Radar Station (樂山雷達站), Taiwan:**
```
Sweeping aerial drone shot of a massive phased-array radar installation
perched on a remote forested mountain peak in central Taiwan. Pre-dawn
blue hour. Sea of clouds below the summit. The giant radar face glows
with faint operational lights. Winding mountain road disappears into
fog. Camera slowly orbits the installation. Serene, ominous stillness —
the calm before the storm.
```

**Suwalki Gap (蘇瓦烏基走廊), Poland:**
```
Wide ground-level establishing shot of a frozen Polish forest road
at the Lithuanian border. Grey winter dawn, heavy overcast. Tank
tracks carved into frozen mud. Abandoned civilian vehicles pushed to
the roadside. Distant tree line shrouded in mist. A single column of
smoke rises from beyond the forest. Camera holds steady, wind howls
through bare branches.
```

**Dubai (杜拜), Under Siege:**
```
Aerial establishing shot of the Dubai skyline at dusk. Normally
gleaming towers now dark — scattered fires burning in lower floors
of skyscrapers. The Burj Khalifa stands unlit against an orange sky.
Smoke drifts across the marina. Distant tracers arc across the harbor.
Camera slowly descends toward street level. Post-apocalyptic luxury.
```

**Taipei (台北), Blackout:**
```
High-angle wide shot of Taipei city at night, completely dark.
No streetlights, no neon, no traffic. Only scattered fires and
flashlight beams from windows. Taipei 101 is a black monolith against
the clouded sky. Distant rumble of artillery beyond the mountains.
Camera holds, motionless. A city holding its breath.
```

---

## Transition Shot Template（過場鏡頭模板）

```
[BASE STYLE PREFIX]

[TRANSITION TYPE]: [DESCRIPTION].
```

### Types:

**Time Lapse / Passage of Time:**
```
Accelerated time-lapse of clouds racing over a military airfield.
Day turns to night turns to day. Planes land and take off in blurred
streaks. Shadows sweep across concrete. Counter overlay: T+0:00
advances to T+24:00. Cold, clinical.
```

**Geographic Transition (Theater Switch):**
```
Camera rushes upward from ground level through clouds into the
stratosphere, revealing the curvature of the Earth. Globe rotates
from [LOCATION A — e.g., Taiwan Strait] to [LOCATION B — e.g.,
Polish border]. Camera plunges back down through clouds to the
new location. Satellite imagery aesthetic with grid overlay.
```

**Data/Comms Transition (致盲 aesthetic):**
```
Screen fills with cascading green data streams that dissolve into
static. White noise. Then a single radar blip appears, pulsing.
The static clears to reveal the next scene. Sound design: digital
corruption → silence → analog hum.
```

**Emotional Transition (Character Internal):**
```
Extreme close-up of a character's eye. Pupil dilates. Reflection in
the eye shows [MEMORY/FLASHBACK IMAGE]. Slow dissolve to the next
scene. Shallow depth of field, macro lens look.
```

---

## 一致性維護技巧 (Consistency Tips)

### Character Consistency
1. **Lock character descriptions** — Copy-paste the exact same physical description for each character across all prompts. Never paraphrase.
2. **Use the frozen anchor descriptions** from `workflow.md` 角色視覺錨點速查表. Key anchors:
   - Lin: "Taiwanese male, mid-30s, clean-shaven, sharp cheekbones, dark brown eyes, dark circles, short black hair, dark olive ROC Air Force Nomex flight suit, Tactical Air Control patches, dog tags, comms earpiece"
   - Kane: "American male, late 30s, thick dark stubble, deep-set hazel eyes, heavy dark circles, faint scar across left temple from TBI, unkempt brown hair, sand tactical plate carrier, NO unit patches or insignia, XM7 rifle, IVAS helmet"
   - Elias: "German male, early 40s, angular face, receding hairline, close-cropped sandy brown hair, wire-rimmed glasses, sharp blue-grey eyes, NATO olive drab field jacket over dark turtleneck sweater, leather codebook, HF radio handset"
3. **Specify the same lighting conditions** for scenes that occur at the same time/place.
4. **Use consistent color grading keywords** per theater:
   - Taiwan: cold blue-teal
   - Europe/Poland: desaturated grey-blue, frozen
   - Middle East: amber-orange, harsh desert sun
   - Night/bunker: near-monochromatic green-black

### Visual Continuity
5. **Maintain the same aspect ratio** (2.39:1) across all clips.
6. **Keep film grain level consistent** — "subtle" for daylight, "heavy" for night/action.
7. **Reference the same camera model** (Arri Alexa look) in every prompt.
8. **Avoid mixing styles** — never add anime, illustration, or stylized keywords.

### Scene Continuity
9. **Track the timeline** — use the T-Hour system (T+0, T+2hr, T+7d) to maintain correct lighting/weather.
10. **Damage accumulates** — if a location was attacked in an earlier scene, subsequent shots should show damage.

---

## 避免事項 / Negative Prompts

When the platform supports negative prompts or things to avoid, include:

```
Avoid: cartoon, anime, illustration, CGI look, plastic skin,
overly saturated colors, lens flare abuse, Marvel/superhero aesthetics,
clean/pristine military uniforms (should be dirty/worn), Hollywood-style
slow motion, glorification of violence, stock footage feel,
watermark, text overlay, bright cheerful lighting,
smile on military characters during combat.
```

### Common Pitfalls to Watch For:
- **Over-heroic poses** — Characters should look exhausted, dirty, scared. Not action-movie cool.
- **Too clean environments** — War zones are filthy. Add rubble, smoke, debris, mud.
- **Unrealistic explosions** — No Michael Bay fireballs. Real explosions are fast, dirty, and grey.
- **Wrong military equipment** — Specify exact models (F-16V, Leopard 2A8, T-90M). Never use generic "military jet."
- **Anachronistic tech** — This is 2028 near-future. No flying cars. Tech looks like 2024+ with subtle upgrades.
- **Culturally incorrect uniforms** — ROC military wears digital woodland camo, not US woodland.
- **Smiling soldiers** — Nobody smiles in this story. Exhaustion, fear, grim determination only.

---

## Quick Reference: Scene-to-Prompt Mapping（場景速查）

| Chapter | Key Scene | Template | Theater Color |
|---------|-----------|----------|---------------|
| Ch01 Interlude I | Satellite infection | Digital/Cyber variant | Blue-green data |
| Ch02 The Blinding | Radar room detection | Character close-up + Action | Cold blue-teal |
| Ch04 Suwałki | Forest tank ambush | Action + Establishing | Grey-blue frozen |
| Ch06 The Wave | Drone swarm over Taipei | Action (aerial) | Dark grey-orange |
| Ch08 The Package | Desert extraction | Action + Character | Amber desert |
| Ch09 Implosion | Taipei blackout hospital | Dialogue + Establishing | Near-black |
| Ch11 Static & Hearts | Betrayal revelation | Dialogue (tense) | Green bunker |
| Ch14 Glass Maze | Dubai three-way firefight | Action (urban) | Amber-red dusk |
| Ch15 Silent Fleet | Carrier missile attack | Action (naval) | Steel-blue ocean |
| Ch24 Scorched Earth | Beach landing defense | Action (large scale) | Grey-brown smoke |
| Ch25 Link Restored | System reboot sequence | Digital/Cyber + Emotional | Blue-green → white |
