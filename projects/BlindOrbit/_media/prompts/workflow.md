# Production Workflow — Blind Orbit (盲軌：2028)
# 影片製作工作流程

> 從小說章節到完成影片的完整流程指南。

---

## 工具鏈總覽 (Recommended Tool Chain)

| 階段 | 工具 | 用途 | 輸出格式 |
|------|------|------|----------|
| 1. 腳本萃取 | Claude / GPT | 從章節提取場景、對話、情緒 | Markdown |
| 2. 角色定型 | Midjourney / Flux | 角色 reference sheet | PNG 2048px+ |
| 3. 場景概念 | Midjourney / Flux | 場景概念圖、情緒板 | PNG 2048px+ |
| 4. 分鏡 | Midjourney / Flux | 每個鏡頭的靜態預覽 | PNG |
| 5. 影片生成 | Veo 3.1 | 從靜態圖 + prompt 生成動態片段 | MP4 4K |
| 6. 配音 | ElevenLabs | 旁白與角色對話 | WAV 48kHz |
| 7. 配樂 | Suno / Udio | 背景音樂與場景配樂 | WAV/MP3 |
| 8. 音效 | ElevenLabs SFX / Freesound | 環境音與軍事音效 | WAV 48kHz |
| 9. 剪輯 | CapCut / Premiere Pro / DaVinci | 組合、調色、字幕 | MP4 H.265 |

---

## Step-by-Step 製作流程

### Step 1: 腳本萃取 (Script Extraction)

從章節 Markdown 中提取可視覺化的素材：

**輸入**: `chapters/Chap_XX_*.md`
**輸出**: `_media/storyboard/chap_XX_shots.md`

Extract from each chapter:
1. **場景描述 (Scene Descriptions)** → Convert to visual prompts
2. **對話 (Dialogue)** → Convert to voiceover scripts
3. **情緒節奏 (Emotional Arc)** → Define music segments
4. **關鍵動作 (Key Actions)** → Define SFX requirements
5. **時間標記 (Timeline)** → Verify T-Hour continuity

**Extraction template for each shot**:
```markdown
## Shot [NN]: [Scene Name]

- **Chapter**: Chap_XX
- **Timeline**: T+[offset]
- **Location**: [具體地點]
- **Characters**: [出場角色]
- **Action**: [一句話描述發生什麼事]
- **Emotion**: [情緒基調]
- **Duration**: [預估秒數]
- **Camera**: [鏡頭類型 — wide/medium/close]
- **Dialogue**: [如有]
- **SFX needed**: [需要的音效]
- **Music mood**: [配樂情緒]
```

---

### Step 2: 角色定型 (Character Lock)

> 這是最關鍵的步驟。一旦定型，所有後續素材都依賴這些 reference images。

**Process**:
1. Open `prompts/image_gen_templates.md` — Character Turnaround Sheet section
2. Generate 4+ variants per character in Midjourney/Flux
3. Select the best version that matches the novel's descriptions
4. Lock it as the canonical reference image
5. Save with proper naming convention

**Naming convention**:
```
_media/character_refs/[codename]_ref_v[version].png
_media/character_refs/[codename]_ref_v[version]_[variant].png
```

**Examples**:
```
character_refs/skywatcher_ref_v1.png          # 標準定裝
character_refs/skywatcher_ref_v1_wounded.png  # 負傷版
character_refs/skywatcher_ref_v1_civilian.png # 便裝版
character_refs/jaeger_ref_v1.png
character_refs/nomad_ref_v1.png
character_refs/nomad_ref_v1_desert.png
character_refs/nomad_ref_v1_urban.png
```

**一致性鐵則 (Consistency Rules)**:
- Once a version is locked, ALL subsequent scene images use the same reference via `--cref`
- If a different costume/state is needed, create a named variant — never modify the base
- Record the exact seed + prompt that produced the locked image in `character_refs/README.md`
- If the character appears wounded/dirty later in the story, create progressive variants:
  `_ref_v1.png` → `_ref_v1_dirty.png` → `_ref_v1_wounded.png` → `_ref_v1_final.png`

---

### Step 3: 場景概念圖 (Scene Concept)

**Process**:
1. Open `prompts/image_gen_templates.md` — Scene Concept Art section
2. Generate establishing shots for each major location
3. Ensure color grading matches the theater palette:
   - Taiwan: cold blue-teal
   - Europe: grey-blue frozen
   - Middle East: amber-orange
   - Cyber: blue-green holographic
4. Lock scene references for consistent backgrounds

**Naming convention**:
```
_media/scene_refs/[location]_[variant].png
```

**Examples**:
```
scene_refs/leshan_dawn.png
scene_refs/leshan_under_attack.png
scene_refs/leshan_destroyed.png
scene_refs/taipei_night_blackout.png
scene_refs/taipei_hospital_dark.png
scene_refs/suwalki_forest_winter.png
scene_refs/suwalki_ambush_aftermath.png
scene_refs/dubai_dusk_burning.png
scene_refs/desert_golan_heights.png
scene_refs/bunker_command_center.png
```

---

### Step 4: 分鏡生成 (Storyboard Frames)

**Process**:
1. Write shot list in `_media/storyboard/[project]_shots.md`
2. Generate static storyboard frames for each shot using locked character + scene refs
3. Verify character appearances match reference images
4. Verify scene continuity (damage, time of day, weather)
5. Arrange frames in sequence, review pacing

**Naming convention**:
```
_media/storyboard/shot_[NN]_frame.png
```

**Continuity checks at this stage**:
- Does the character look the same as their reference?
- Is the lighting consistent with the timeline (T-Hour = dawn, T+6hr = midday)?
- Does accumulated damage show? (If the radar was hit in Shot 3, it should be damaged in Shot 5)
- Are theater color palettes maintained?

---

### Step 5: 影片生成 (Video Generation)

**Process**:
1. Open `prompts/veo3_templates.md` — select appropriate template
2. Prepend the Base Style Prefix to every prompt
3. Input storyboard frame as reference image + written prompt into Veo 3.1
4. Generate 3-5 takes per shot (4-8 seconds each)
5. Select best take, note parameters

**Naming convention**:
```
_media/clips/shot_[NN]_take[N].mp4
_media/clips/shot_[NN]_final.mp4    # Selected best take
```

**Veo 3.1 一致性技巧 (Consistency Tips)**:

1. **Always include character visual anchors** — repeat 2-3 key physical descriptors in every prompt where a character appears
2. **Use the same Base Style Prefix** — copy-paste exactly, never paraphrase
3. **Match the reference image** — upload the storyboard frame as the starting reference
4. **Keep camera movement minimal** — subtle push-in or static holds. Wild camera movement = inconsistency
5. **Generate multiple takes** — 3 minimum, 5 for critical shots. Pick the most consistent
6. **Batch similar scenes** — generate all shots from the same location in one session to maintain style consistency
7. **Check for AI artifacts** — extra fingers, morphing faces, text artifacts, flickering objects. Reject and regenerate

---

### Step 6: 音訊製作 (Audio Production)

Run these three tracks in parallel:

#### 6a. 配音 (Voiceover)

1. Open `prompts/audio_templates.md` — Character Voice Profiles
2. Create voice profiles in ElevenLabs matching each character description
3. Input dialogue scripts, generate audio
4. Apply post-processing:
   - Radio filter (bandpass 300Hz-3kHz) for military comms
   - Room reverb for bunker scenes
   - Compression for field/outdoor dialogue
5. Save: `_media/audio/vo_[scene_description].wav`

#### 6b. 配樂 (Music Score)

1. Open `prompts/audio_templates.md` — Music Templates
2. Generate scene-appropriate music in Suno/Udio
3. Match the emotional arc to the edit
4. Export stems if possible (drums, strings, synth separately)
5. Save: `_media/audio/score_[segment_name].wav`

#### 6c. 音效 (Sound Effects)

1. Open `prompts/audio_templates.md` — SFX section
2. Generate or source military SFX and ambients
3. Layer ambient beds per location
4. Save: `_media/audio/sfx_[description].wav`

---

### Step 7: 最終剪輯 (Final Edit)

**Process**:
1. Import all assets into CapCut / Premiere Pro / DaVinci Resolve
2. Arrange video clips per storyboard sequence
3. Layer audio tracks:
   - Track 1: Voiceover (highest priority)
   - Track 2: Dialogue
   - Track 3: Music score
   - Track 4: Sound effects
   - Track 5: Ambient bed
4. Apply color grading LUT (unified across all clips)
5. Add text overlays:
   - Title card: 盲軌：2028 / BLIND ORBIT
   - Location cards: 台灣 TAIWAN / 波蘭 POLAND / 中東 MIDDLE EAST
   - Timeline stamps: T+00:00, T+02:00, etc.
6. Add subtitles (Mandarin + English)
7. Final audio mix and master
8. Export: `_media/output/[project]_v[version].mp4`

**Export settings**:
- Resolution: 3840x1608 (4K 2.39:1) or 1920x804 (1080p 2.39:1)
- Codec: H.265
- Bitrate: 35-50 Mbps for 4K, 15-20 Mbps for 1080p
- Audio: AAC 320kbps stereo

---

## 檔案命名總覽 (File Naming Convention)

```
_media/
├── character_refs/
│   ├── README.md                                 # 角色 prompt + seed 記錄
│   ├── [codename]_ref_v[N].png                   # 定裝照 (locked)
│   └── [codename]_ref_v[N]_[variant].png         # 變體 (wounded, dirty, etc.)
│
├── scene_refs/
│   ├── README.md                                 # 場景 prompt + seed 記錄
│   └── [location]_[variant].png                  # 場景概念圖
│
├── storyboard/
│   ├── [project]_shots.md                        # 分鏡腳本
│   └── shot_[NN]_frame.png                       # 分鏡靜態圖
│
├── prompts/
│   ├── veo3_templates.md                         # Veo 3.1 影片模板
│   ├── image_gen_templates.md                    # 圖像生成模板
│   ├── audio_templates.md                        # 音訊模板
│   └── workflow.md                               # 本文件
│
├── clips/
│   ├── shot_[NN]_take[N].mp4                     # 各版本影片
│   └── shot_[NN]_final.mp4                       # 選定版本
│
├── audio/
│   ├── vo_[scene_description].wav                # 配音
│   ├── score_[segment_name].wav                  # 配樂
│   └── sfx_[description].wav                     # 音效
│
└── output/
    ├── [project]_v[N].mp4                        # 最終輸出
    └── [project]_v[N]_draft.mp4                  # 草稿版
```

**Naming rules**:
- Use lowercase and underscores, no spaces
- Codenames: `skywatcher`, `jaeger`, `nomad`, `teacher`, `sophie`, `blackbear`
- Location names: `leshan`, `taipei`, `suwalki`, `dubai`, `golan`, `bunker`, `pine_gap`
- Version numbers start at 1, increment for each iteration
- `_final` suffix for approved/selected versions

---

## 角色一致性跨鏡頭技巧 (Character Consistency Across Shots)

### The Reference Lock System

```
1. Generate turnaround sheet → Pick best → LOCK as v1
2. Save the exact prompt + seed + parameters in README.md
3. For every subsequent image/video containing this character:
   - Midjourney: use --cref [locked image URL]
   - Flux: use the same seed + character description block
   - Veo: upload locked image as reference + repeat key descriptors
4. Never modify the locked description. Copy-paste exactly.
```

### Character Visual Anchors (Quick Reference)

Always include these identifying details in every prompt:

| Character | Anchors (never omit) |
|-----------|---------------------|
| 林子修 | Taiwanese male, mid-30s, clean-shaven, sharp cheekbones, dark olive ROC flight suit, Air Force patches |
| 凱恩 | American male, late 30s, thick stubble, deep-set eyes, dark circles, sand tactical gear, NO insignia, XM7 rifle |
| 沃格爾 | German male, early 40s, angular face, receding hairline, wire-rimmed glasses, NATO olive jacket, leather codebook |
| 柯大勇 | Taiwanese male, mid-30s, stocky, thick stubble, ROC digital woodland camo, full plate carrier, muddy boots |
| 張弘毅 | Taiwanese male, 50s, greying temples, square jaw, pressed colonel uniform, rigid posture, trembling hand |
| 蘇菲 | French female, 45, auburn chignon, green eyes, navy EU Commission blazer, pearl earrings, immaculate |
| 老師 | Chinese male, 60s, thin scholarly build, reading glasses, PLA senior officer uniform, calm serene expression |

### Progressive Damage Tracking

Characters deteriorate over the story. Track their visual state:

```
Timeline: T+0    → T+6hr   → T+24hr  → T+7d    → T+30d
Lin:      clean  → dusty   → exhausted → gaunt  → scarred
Kane:     worn   → bloody  → patched  → leaner  → hollowed
Elias:    neat   → rumpled → dirty    → bearded → hardened
Ko:       muddy  → bloody  → bandaged → [KIA]   → —
```

---

## 品質檢查清單 (Quality Checklist)

### 每個影片片段 (Per Clip)
- [ ] Character appearance matches locked reference image
- [ ] Color grading matches theater palette (Taiwan=teal, Europe=grey-blue, ME=amber)
- [ ] No AI artifacts (extra fingers, morphing faces, text glitches, flickering objects)
- [ ] Motion is smooth — no unnatural jumps or warping
- [ ] Light source direction is consistent within the scene
- [ ] Military equipment is correct (right weapon, right uniform, right vehicle)
- [ ] Timeline-appropriate damage is visible (if station was attacked, show damage)

### 整體影片 (Full Video)
- [ ] Emotional arc follows the intended curve (calm → tension → chaos → silence → resolve)
- [ ] Three theater storylines intercut clearly — viewer can track which is which
- [ ] Voiceover syncs with visual action (lips, gestures, timing)
- [ ] Music transitions are smooth — no jarring cuts between segments
- [ ] Title cards and location stamps are readable and correctly spelled
- [ ] Total duration is within target (trailer: 60-120s, scene: 2-5min)
- [ ] Subtitles are timed correctly and grammatically correct (both ZH and EN)

### 角色一致性 (Character Consistency — Final Check)
- [ ] 林子修: flight suit, short black hair, green radar light in face, no smile
- [ ] Elias: glasses, NATO jacket, codebook visible, always checking his back
- [ ] Kane: sand gear, XM7, empty stare, no patches/insignia anywhere
- [ ] Same character looks the same across ALL clips — no sudden hair change, weight change, or costume error
- [ ] Progressive damage is shown correctly per timeline

---

## 版本控制與協作 (Version Control)

### Git Tracking Rules
- **Track in Git** (commit to repo):
  - All `.md` files (prompts, storyboards, shot lists)
  - `character_refs/README.md` and `scene_refs/README.md` (prompt records)
- **Do NOT track in Git** (add to `.gitignore`):
  - Generated media files: `*.png`, `*.mp4`, `*.wav`, `*.mp3`
  - Use cloud storage (Google Drive / Dropbox) for large media assets
  - Reference generated files by name in README.md

### Progress Tracking
- After each production session, update `PROGRESS_LOG.md`:
  - Date
  - Shots completed
  - Characters locked / updated
  - Issues encountered
  - Next steps

### Collaboration Notes
- When multiple people work on generation, ALWAYS share the locked reference images
- Never generate a character without the locked `--cref` — it will break consistency
- Keep a shared "approved" folder for final takes that are ready for edit
