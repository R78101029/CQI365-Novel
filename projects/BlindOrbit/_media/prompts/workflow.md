# Production Workflow — Blind Orbit (盲軌：2028)
# 影片製作工作流程

> 從小說章節到完成影片的完整流程指南。

---

## 工具鏈 (Recommended Tool Chain)

| 階段 | 工具 | 用途 |
|------|------|------|
| 1. 角色定型 | Midjourney / Flux | 生成角色 reference sheet |
| 2. 場景概念 | Midjourney / Flux | 場景概念圖與風格定義 |
| 3. 分鏡 | Midjourney / Flux | 每個鏡頭的靜態預覽 |
| 4. 影片生成 | Veo 3.1 | 從靜態圖 + prompt 生成動態片段 |
| 5. 配音 | ElevenLabs | 旁白與角色對話 |
| 6. 配樂 | Suno / Udio | 背景音樂與場景配樂 |
| 7. 音效 | ElevenLabs SFX / Freesound | 環境音與軍事音效 |
| 8. 剪輯 | CapCut / Premiere Pro | 最終組合與調色 |

---

## Step-by-Step 製作流程

### Step 1: 腳本萃取 (Script Extraction)

從章節 Markdown 中提取：
- **場景描述** → 轉為視覺 prompt
- **對話** → 轉為配音腳本
- **情緒節奏** → 定義配樂段落

```
輸入: chapters/Chap_XX_*.md
輸出: _media/storyboard/chap_XX_shots.md
```

### Step 2: 角色定型 (Character Lock)

1. 使用 `character_refs/README.md` 中的定裝照 prompt
2. 在 Midjourney/Flux 生成多組候選
3. 選定最佳版本，儲存為 reference image
4. 命名規範：`character_refs/[codename]_ref_v[版本].png`

```
例: character_refs/skywatcher_ref_v1.png
    character_refs/jaeger_ref_v1.png
    character_refs/nomad_ref_v1.png
```

**一致性規則**：
- 一旦 lock 版本，後續所有場景都使用同一張 reference
- 如需不同服裝/狀態，另存 variant：`skywatcher_ref_v1_wounded.png`

### Step 3: 場景概念圖 (Scene Concept)

1. 使用 `scene_refs/README.md` 中的場景 prompt
2. 生成各場景的 establishing shot
3. 確認風格統一（色調、光線、質感）
4. 儲存命名：`scene_refs/[location]_[variant].png`

```
例: scene_refs/leshan_dawn.png
    scene_refs/leshan_crisis.png
    scene_refs/taipei_blackout.png
```

### Step 4: 分鏡生成 (Storyboard Frames)

1. 參考 `storyboard/trailer_v1.md`
2. 為每個 shot 生成靜態分鏡圖
3. 確認角色外觀與場景一致
4. 儲存命名：`storyboard/shot_[編號]_frame.png`

```
例: storyboard/shot_01_frame.png
    storyboard/shot_02_frame.png
```

### Step 5: 影片生成 (Video Generation)

1. 使用 `prompts/veo3_templates.md` 中的基礎前綴
2. 將分鏡靜態圖 + prompt 輸入 Veo 3.1
3. 每段 4-8 秒
4. 儲存命名：`_media/clips/shot_[編號]_take[N].mp4`

**Veo 3.1 一致性技巧**：
- 每次 prompt 前加上 `Consistent with reference image.`
- 重複角色的 2-3 個視覺錨點
- 使用相同的 style prefix
- 生成多個 take，選最佳版本

### Step 6: 音訊製作 (Audio Production)

並行執行：

**配音**：
1. 參考 `prompts/audio_templates.md` 的聲音描述
2. 在 ElevenLabs 建立角色聲音 profile
3. 輸入旁白文本生成音檔
4. 儲存：`_media/audio/vo_[場景描述].mp3`

**配樂**：
1. 參考 `prompts/audio_templates.md` 的配樂結構
2. 在 Suno/Udio 生成各段配樂
3. 儲存：`_media/audio/score_[段落名].mp3`

**音效**：
1. 參考音效清單
2. 生成或下載對應音效
3. 儲存：`_media/audio/sfx_[描述].mp3`

### Step 7: 最終剪輯 (Final Edit)

1. 在 CapCut / Premiere 中組合：
   - 影片片段（按分鏡順序排列）
   - 配音軌道
   - 配樂軌道
   - 音效軌道
2. 調色（統一 LUT）
3. 加入字幕 / Title Card
4. 輸出：`_media/output/trailer_v[版本].mp4`

---

## 檔案命名規範 (File Naming Convention)

```
_media/
├── character_refs/
│   ├── README.md                        # Prompt 集
│   ├── [codename]_ref_v[N].png          # 定裝照
│   └── [codename]_ref_v[N]_[variant].png
├── scene_refs/
│   ├── README.md                        # Prompt 集
│   └── [location]_[variant].png         # 場景圖
├── storyboard/
│   ├── trailer_v1.md                    # 分鏡腳本
│   └── shot_[NN]_frame.png             # 分鏡靜態圖
├── prompts/
│   ├── veo3_templates.md               # Veo 3.1 模板
│   ├── image_gen_templates.md          # 圖像生成模板
│   ├── audio_templates.md              # 音訊模板
│   └── workflow.md                     # 本文件
├── clips/                              # 生成的影片片段
│   └── shot_[NN]_take[N].mp4
├── audio/                              # 音訊素材
│   ├── vo_[描述].mp3                   # 配音
│   ├── score_[段落].mp3                # 配樂
│   └── sfx_[描述].mp3                  # 音效
└── output/                             # 最終輸出
    └── trailer_v[N].mp4
```

---

## 品質檢查清單 (Quality Checklist)

### 每個影片片段
- [ ] 角色外貌與 reference image 一致
- [ ] 色調符合整體風格（冷藍+暖橙）
- [ ] 無 AI 偽影（多餘手指、扭曲文字、閃爍）
- [ ] 動作流暢，無不自然跳幀
- [ ] 光源方向在場景內一致

### 預告片整體
- [ ] 節奏符合情緒曲線（靜→緊張→爆發→靜）
- [ ] 三條故事線交叉剪輯清晰
- [ ] 旁白與畫面同步
- [ ] 配樂轉場流暢
- [ ] Title Card 清晰可讀
- [ ] 整體時長控制在 60-120 秒

### 角色一致性
- [ ] 林子修：飛行服、短黑髮、綠色雷達光
- [ ] Elias：鬍渣、NATO 外套、密碼本
- [ ] Kane：沙漠裝備、XM7 步槍、空洞眼神
- [ ] 跨鏡頭同一角色無明顯外貌變化

---

## 版本控制 (Version Control)

- Prompt 文件（.md）納入 Git 追蹤
- 生成的媒體檔案（.png/.mp4/.mp3）加入 `.gitignore`
- 在 `PROGRESS_LOG.md` 記錄每次製作進度
- 重要版本的 prompt + 參數組合記錄在對應 README 中
