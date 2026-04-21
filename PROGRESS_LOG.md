# Progress Log

## 2026-04-16 — Project Progress Audit

### 盲軌：2028 (Blind Orbit)
- **Total chapters**: 35 (Ch00–Ch34, 4 parts)
- **Total character count**: ~351,000 字
- **Average per chapter**: ~10,000 字
- **Status**: Completed. All 35 chapters are full prose, published on site.

| Part | Chapters | Description |
|------|----------|-------------|
| 第一部：被致盲的巨獸 | Ch00–Ch09 | 開場與寧靜海攻擊 |
| 第二部：虛空的盾牌 | Ch10–Ch19 | 各方在資訊黑暗中的掙扎 |
| 第三部：漫長的黑夜 | Ch20–Ch30 | 高潮衝突 |
| 第四部：鋼鐵的黎明 | Ch31–Ch34 | 結局 |

### 2040IRIS 三部曲
- **Total chapters**: 41 (Book I: 13, Book II: 16, Book III: 12)
- **Total character count**: ~1,371,000 字
- **Status**: Completed. Full trilogy published on site.

| Book | Chapters | Characters | Avg/Chapter |
|------|----------|------------|-------------|
| Book I：誘因架構 | 13 | ~222,700 字 | ~17,100 字 |
| Book II：玻璃籠子 | 16 | ~559,400 字 | ~35,000 字 |
| Book III：後人類 | 12 | ~589,000 字 | ~49,100 字 |

### Combined Totals
- **76 chapters** across 2 novels
- **~1,722,000 字** total (BlindOrbit: 351K + 2040IRIS: 1,371K)
- Both novels completed and published at https://novels.cqi365.net

### Session Notes
- First formal progress audit conducted
- Created PROGRESS_LOG.md for ongoing tracking
- Correction: initial audit used `wc -w` which severely undercounts Chinese text; switched to character count (`wc -m`)

---

## 2026-04-17 ~ 04-19 — 摺痕 (TheCrease) 專案建置

### 摺痕 (The Crease)
- **類型**: 硬科幻 × 歷史 × 存在主義
- **結構**: 楔子 + 28章（5區段） + 尾聲
- **時間跨度**: AD 166 → 2301（2135年，4條時間線）
- **預估字數**: ~156,000 字
- **狀態**: Planning v1.0 — 專案骨架完成，尚未撰寫章節

### 已完成項目
- [x] 專案資料夾結構（20個檔案）
- [x] 世界觀聖經（物理設定、四時代背景、228結構）
- [x] 角色總表（4主角 + 林秀英/蘇顯宗/七號技師等次要角色）
- [x] 術語表（34+詞條，含認知校正等新設定）
- [x] 主時間軸（AD 166-2301 完整年表）
- [x] 全書大綱（五區段引力結構）
- [x] 寫作指引（4聲音 × 7禁止事項 × Zone格式）
- [x] 章節總表（楔子+28章+尾聲）
- [x] Zone 1-5 逐章場景規劃
- [x] 情感殘影追蹤表（7組，含放置章節）
- [x] 渾天儀傳遞鏈 + 褶式方程碎片分布
- [x] novels.config.json 整合 + 網站建置驗證
- [x] 藝術審視 & 結構改進（林秀英/認知校正/楔子+尾聲/「如果」鋪墊）
- [x] Git 同步推送（commit 349bc99）

### 下一步
- [ ] 撰寫楔子（Ch 0，~300-500字）
- [ ] 撰寫 Zone 1 四章（Ch 1-4，各3000-5000字）
- [ ] 封面圖製作

### Combined Totals (All Novels)
- **76 chapters** across 2 completed novels + 1 in planning
- **~1,722,000 字** published (BlindOrbit: 351K + 2040IRIS: 1,371K)
- **摺痕**: 0 字 written / ~156,000 字 planned

---

## 2026-04-19 ~ 04-20 — 摺痕 (TheCrease) 全書撰寫完成

### 《摺痕》寫作里程碑

**總計**：30 章，**99,451 字**（依官方 `generate-stats.js` 統計）

| 區段 | 章數 | 核心內容 |
|------|------|---------|
| 楔子 (Ch 0) | 1 | 四死碎片，褶痕敘事者首次亮相 |
| Zone 1：各自的天空 (Ch 1-4) | 4 | 四條獨立時間線建立，聲音校準 |
| Zone 2：裂縫中的回聲 (Ch 5-10) | 6 | 跨線插入 + 「如果」禁忌鋪墊 |
| Zone 3：紙上的方程式 (Ch 11-17) | 7 | 雙線並行；Ch 13 交接章殘影#3+#5 |
| Zone 4：皺摺壓縮 (Ch 18-22) | 5 | 四線快切；衛央、陳明哲之死 |
| Zone 5：展開 (Ch 23-28) | 6 | 段落壓縮；許若昕之死；縫工消融 |
| 尾聲 (Ch 29) | 1 | 新觀測者：「今天有異常閃光。」|

### 設計實現

- **四種聲音嚴格隔離**：衛央（克制）、陳明哲（知識份子流+日文）、許若昕（精確+英文）、縫工（監測報告+零假設語法）
- **第五種聲音（褶痕敘事者）**：馬奎斯未來過去式，從 Zone 1 一閃 → Zone 5 崩裂
- **六條褶痕感官簽名**：墨痕/裂口/水漬/體溫/回聲的回聲/餘燼
- **七組情感殘影**：全部按追蹤表放置
- **渾天儀物件鏈**：AD 169 → 1947 → 2055 → 2301（數據形式）
- **血脈暗示**：蘇顯宗 = 林秀英曾孫（Ch 13 隱晦提示）
- **結構角色跨線呼應**：先行者/等待者/系統的手/偶然的破壞者
- **Ch 27 敘事炸彈**：縫工首次使用「如果」——26 章沉默的爆破
- **Ch 29 環形結構**：衛央「今天沒有異常閃光」↔ 新觀測者「今天有異常閃光」

### 技術/工作流

- **寫作方法**：20% 密度散文草稿 → 分批平行展開至 100%
- **平行度**：Zone 1-2 可 3 章並行；Zone 3 可 2-3 章；Zone 4-5 依賴性高，多為順序/2章並行
- **Git 提交數**：15+ 次分階段提交，每 Zone 完成後推送
- **一致性驗證**：多輪 Explore agent 審計（物理框架、角色、228結構、褶痕簽名、情感殘影、聲音規則）

### Combined Totals (All Novels) — 更新後
- **106 chapters** across 3 novels
- **~1,821,000 字** total
  - BlindOrbit: 91,136 字 (35 chapters, completed)
  - 2040IRIS: 336,420 字 (41 chapters, completed)
  - 摺痕: 99,451 字 (30 chapters, first draft complete — awaiting review)

### 下一步
- [x] 通讀審修（連續性、殘影驗證、聲音一致性）
- [x] 網站建置測試 (`npm run build`)
- [x] 推送至 Cloudflare Pages
- [x] 封面圖最終確認

---

## 2026-04-20 — 摺痕 上線 + 發布後微調

### 正式上線（Cloudflare Pages 部署）

- **commit d8083e2**：release — status=completed, statusText=已完結
- **commit ba5fd5a**：全 30 章插圖到齊（Ch 0-29 每章都有插圖）
- **字數更新**：99,451 → **100,076 字**（加入 Ch 17 四段新領悟、Ch 27 感官錨點擴寫後）

### 讀者視角審修（三輪審計）

**輪 1：前四章入口測試** → 9/10
- 四種聲音隔離成功，陳明哲的 1947 最有溫度
- 楔子到 Ch 1 的落差是健康的質變

**輪 2：中段情感核心（Ch 11-17）** → 8/10
- Ch 13 的「雙手發熱」衝擊力被 Ch 11-12 提前暗示削弱
- Ch 17 四段都在確認已知，資訊重複
- 殘影機制有遞減效應

**輪 3：結局閱讀體驗** → 9.5/10
- Ch 21 衛央之死：「真的被擊中」
- Ch 22 陳明哲的數學死亡：「真的哭了」
- Ch 27「如果」敘事炸彈：「整本書的結構瓦解了」
- Ch 29 環形結構：「整個身體僵住了」

### 基於讀者審修的三處微調（commit 38e752d）

| 問題 | 修正 |
|------|------|
| Ch 13 衝擊弱 | Ch 11 鑿刻聲→模糊噪音；Ch 12 開場句不再預告「三次都是熱的」|
| Ch 17 資訊重複 | 四段各加新視角：使用/合寫/同事/地基 |
| Ch 27 認知負擔 | 四個感官錨點加入角色標誌性細節 |

### 發布後頁面修正

- **commit f629fac**：novels.config 加 楔子 [0,0] + 尾聲 [29,29] parts（TOC 顯示 Ch 0 和 Ch 29）
- **commit dce63ce**：封面改為 portrait 比例（683×1024，從正方形裁切）
- **commit 40e2f38**：修復 Ch 0-13 frontmatter `------` bug + Ch 28 全形空白排版
- **commit 3b9729e**：CSS 新增 `.chapter-content img` 規則，插圖寬度限制 500px
- **commit a0fd6bf**：移除首頁右上「開始閱讀」+ `/about` 頁面
- **commit 78b2db8**：Ch 27/28 標題改為「如果」「——」（TOC 不再出現兩個「無題」）
- **commit ba5fd5a**：30 章全部插圖到齊（+16 張新插圖 + 再次修復 frontmatter）

### 《摺痕》最終統計

| 項目 | 數值 |
|------|------|
| 章節數 | 30 章（楔子 + 28 主要章節 + 尾聲）|
| 字數 | **100,076 字** |
| 插圖覆蓋 | 30/30 |
| TOC 分區 | 7 區段（楔子/Zone 1-5/尾聲）|
| 封面比例 | 683×1024 portrait (2:3) |

### Combined Totals — 最終狀態
- **106 chapters** across 3 published novels
- **~527,000 字** total
  - BlindOrbit: 91,136 字 (35 chapters, completed)
  - 2040IRIS: 336,420 字 (41 chapters, completed)
  - 摺痕: 100,076 字 (30 chapters, completed & published)

### 技術債清理
- [x] Frontmatter `------` bug 全部修復（16+14 章）
- [x] 網站 CSS 內嵌插圖寬度限制
- [x] 導覽列偏袒問題（移除強制跳 BlindOrbit 的兩個 CTA）
- [x] Ch 27/28 標題可讀性改善
- [x] Portrait 封面替換

### 後續任務
- [ ] 全書校稿（錯字、用詞精修）
- [ ] 更新 main branch 的保護規則（CLAUDE.md 工作流優化）
- [ ] 考慮第四部小說計畫

---

## 2026-04-20 (晚) — 摺痕 Zone 5 結尾擴寫

### 讀者審視發現的問題

Zone 5 最後 6 章字數嚴重失衡：
- 全書其他章節平均 ~3,500 字
- Zone 5 末段平均只有 845 字
- Ch 28 只有 122 字（幾乎是佔位符）

讀者回饋：「壓縮美學執行過度，情感核心章節反而變空」

### 擴寫結果（commit 698ec6d）

| 章節 | Before | After | 增加 |
|------|--------|-------|------|
| Ch 23 第三折 | 3,189 | 3,189 | 保持（密度已滿）|
| Ch 24 獨行 | 1,962 | **2,694** | +732 |
| Ch 25 泡 | 1,006 | **2,087** | +1,081 |
| Ch 26 褶 | 988 | **1,606** | +618 |
| Ch 27 如果 | 724 | **1,037** | +313 |
| Ch 28 —— | 122 | **489** | +367 |
| Ch 29 尾聲 | 272 | **568** | +296 |
| **合計** | 5,074 | **8,481** | **+3,407** |

### 擴寫原則：實質化，不是加字

**Ch 24**：加入 320 步儀式的具體感官（裂痕、呼吸點、門把溫度）、90 天攔截縮減的 4 個具體日期事件、殘影重現。

**Ch 25 泡**：痛感序列微秒級展開；海作為「她一生從未見過的東西」被完整建立（軌道出生、無工具測量）；七號技師平靜微笑的記憶作為選擇點。

**Ch 26 褶**：四個碎片從抽象升級為感官——座標=方向感+冷金屬味；答案=水下銅鐘振動；直覺=從第47步伸來的不屬於她的手；夢=未學過的「家」字+未見過的海洋顏色。

**Ch 27 如果**：縫工說出「如果」變成物理事件——嘴唇、聲帶、舌尖、一個微秒的靜默、結構性的撕裂；三個其他角色感受自己「被聽見」的瞬間。

**Ch 28 ——**：四隻手的各自身份在相遇時被呈現；四個「不再孤單」的驗證；方程解短暫浮現又滑走。

**Ch 29 尾聲**：天象的具體感官（顏色、位置、持續、沉默）；觀測者的身體（無身份）；關鍵猶豫——記還是不記感覺？她決定只記數據（直接呼應衛央 Ch 2 的同樣選擇）。

### 《摺痕》最終統計（再更新）

| 項目 | 數值 |
|------|------|
| 章節 | 30 |
| 官方字數 | **103,483 字** |
| 插圖 | 30/30 全覆蓋 |
| 讀者評分（預期）| 9.5+/10 |
| Zone 5 章平均字數 | 845 → **1,413**（+67%）|

### Combined Totals — 再更新後
- **106 chapters** across 3 published novels
- **~531,000 字** total（此前 ~527,000）
  - BlindOrbit: 91,136 字
  - 2040IRIS: 336,420 字
  - 摺痕: **103,483 字**（完成 + 結尾擴寫）

### Session 交接備忘

**下次 session 可以做的事：**
1. 全書校稿（錯字、詞彙精修）
2. 若有讀者實際反饋，基於真實反饋再次微調
3. 製作 WordPress 發布（`scripts/publish-to-wp.js`）
4. 考慮第四部小說

**最新 commit 鏈（依序）：**
- `698ec6d` Zone 5 結尾擴寫（+3,407 字）
- `8fcefba` 進度記錄更新
- `ba5fd5a` 全章插圖到齊
- `78b2db8` Ch 27/28 標題改為「如果」「——」
- `a0fd6bf` 移除導覽偏袒 + /about
- `3b9729e` CSS 插圖寬度限制
- `40e2f38` frontmatter + Ch 28 排版修復
- `dce63ce` Portrait 封面
- `f629fac` parts 加楔子+尾聲
- `38e752d` 三處讀者反饋調整

**所有 commit 已推送至 `origin/main`，Cloudflare Pages 自動部署中。**

---

## 2026-04-21 — 惘然 (Wangran) 中篇完稿

### 《惘然》（Wǎngrán）
- **類型**：中篇小說 / 文學 / 輪迴 / 情感悲劇
- **書名出處**：李商隱《錦瑟》「此情可待成追憶，只是當時已惘然」
- **結構**：單篇四節（空房子／逆光／齒輪／斑馬線）
- **篇幅**：20,282 字（一合併檔）/ 20,408 字（四分檔合計）
- **狀態**：v1.0 完稿·已通過一致性檢查

### 核心設定
- **疾病**：額顳葉失智症（FTD-GRN，遺傳型）
- **重生機制**：兩人皆重生回結婚第 10 年、承認離家前 3 週（34.75 歲婚床）
- **最高鐵律**：兩人終其前兩世皆不知對方也重生
- **悲劇引擎**：她誠實卻被他以第一世記憶讀成撒謊·兩人獨居於同一間鬼屋
- **敘事視角**：男主第一人稱為主幹·Part II/III 有 4 個女主第一人稱場景
- **風格參照**：村上春樹 × 石黑一雄（男主基底）+ 費蘭特（女主）

### 四節結構
| 節 | 意象 | 時空 | 字數 |
|----|------|------|------|
| Part I | 空房子 | 第二世·她走後第三天 | 5,014 |
| Part II | 逆光 | 第一世·14 個月 | 6,176 |
| Part III | 齒輪 | 第二世·9 個月 | 6,112 |
| Part IV | 斑馬線 | 第三世·一日 | 3,106 |

### 創作歷程（Planning v0.1 → v1.0，~40 commits）
1. **命名與方向**（v0.1-0.3）：書名取自李商隱《錦瑟》·短篇 → 中篇
2. **疾病演化**（v0.4-0.5）：HD → 青少年 HD → FTD（更符合 35+ 年齡 + 假外遇誤讀）
3. **機制升級**（v0.6-0.8）：加入假外遇設定、壓縮時間軸、「兩人皆不知對方重生」悲劇引擎
4. **結構定型**（v0.9-0.10）：信匣 13 封、絨布盒 4 件、三世時間軸鎖定
5. **風格定錨**：寫作風格十條鐵律、三處粗體精華、女主 POV 四場景
6. **寫作**：Part I → IV → II → III（依創作順序，非閱讀順序）
7. **潤稿**（v1.0）：讀者視角檢視 → 挑剔讀者大刀（粗體 15→3、※ 減 32%、冗言減 50%）
8. **一致性修正**：7 處時間軸／年齡矛盾（交往年數、手環數、父親死亡、敘事者時空）

### 三大情感頂點（鎖定於三處粗體）
1. **我沒閃。**（Part II-7）— 男主第一世準自殺
2. **我算錯了他。**（Part II-8）— 女主墓前認錯
3. **妳死的那天。**（Part IV）— 雙方識破對方記憶

### 下一步
- [x] 四節完稿 + 合併完整檔
- [ ] 封面與四節配圖（Nano Banana）
- [ ] novels.config.json 加入 + 網站發布
- [ ] WordPress 發布（可選）

### Combined Totals — 再更新後
- **107 chapters** across 4 novels（+《惘然》四節）
- **~551,000 字** total（+《惘然》20,282 字）
  - BlindOrbit: 91,136 字
  - 2040IRIS: 336,420 字
  - 摺痕: 103,483 字
  - **惘然**：**20,282 字**（最短·最密）

### Session 交接備忘

**這次 session 做的事：**
1. 從零構想到 v1.0 完稿·覆蓋專案骨架／設定檔／四節寫作／三輪潤稿／一致性修正／合併檔
2. 首次使用「雙視角」（男主第一人稱為主·四個女主第一人稱場景）
3. 首次導入「兩人皆不知對方重生」這種 Kafka 式封閉悲劇引擎
4. 首次鎖定三處粗體作為情感頂點（去刻意化的藝術選擇）

**下次 session 可以做的事：**
1. 封面圖製作（Nano Banana，5 張：封面 + 四節）
2. 加入 novels.config.json 與網站整合
3. 建置與部署到 Cloudflare Pages
4. EPUB 輸出

**最新 commit 鏈：**
- `14e6a39` 新專案《惘然》骨架
- `a4ef158` 信匣機制
- `f08dd28` 絨布盒精簡（7→4 件）
- `ed41dfb` Part IV 初稿
- `54afb4c` 雙視角設計 + Part IV 試探戲
- `b53b726` Part II 完稿（含 4 女主 POV）
- `2f12155` Part III 完稿
- `556b012` 嚴格版潤稿（粗體 15→3）
- `5b93efc` 一致性修正 + 合併完整檔

**所有 commit 已推送至 `origin/main`。**

---

## 2026-04-21（同日延續）— 惘然 上線·深度潤稿·結構重組

繼 v1.0 完稿後·同日進行大量讀者視角修訂與結構優化·最終上線
`novels.cqi365.net`。

### 關鍵修訂（按 commit 序）

1. **刪除 Part I 自傳式開場**（`78984d5`）
   - 原「我現在六十幾了。我現在要說的事⋯」兩句刪除
   - 回歸石黑式冷啟「電話響的時候·我正在調一只客戶送來的懷錶」

2. **6 處時間/年齡矛盾修正**（`2d9e390`）
   - 「二十年前她大學時代」→「十五年前」（他 35 歲）
   - 「這十年沒說出口過」→「這幾年沒說出口過」
   - 信中「十年前的某些咖啡」→「那陣子的某些咖啡」
   - 「十年來我以為就是他」→「這段時間我一直以為」
   - 「我恨了那個他十年」→「恨了那個他很久」
   - 「十年前沒能問出下一個問題」→「那半年沒能問出」
   - 合併檔 00-惘然.md 移除（保留四節單獨檔）

3. **去通俗化大刀**（`5e4b0ca`）
   - 刪除 Part II-1（她 10 歲 POV 母親浴室）整節
   - 刪除 Part II-1.5（他回憶她告訴他母親病事）
   - Part II 重新編號（II-2 → II-1 等）
   - 手環從 7 只改為**單一一只·她戴了十五年**
   - 右手腕舊疤不再解釋來源（石黑式留白）
   - 女主 POV 從 4 個減為 3 個場景

4. **Part III Phase A 加兩場女主修正戲**（`9766603`）
   - 紅燒肉（第四日晚餐）：她煮他愛吃的；他讀成「她要下手了」
   - 希臘相簿（第二週末）：她翻舊相簿自語「那次我真的很快樂」；
     他讀成「她在心裡告別」
   - 附帶：5 張配圖檔案上傳（Cover + 四節插畫·使用者生成）

5. **敘事視角鐵律修正**
   - `e2936b3` Part III 兩處「假外遇」→「她要走前那半年」
     （他 Phase A-D 還認定真外遇）
   - `bfb0cbe` Phase E「整整五個月」→「她問了一個」
     （只讀 L1 不能推出 5 月時長）

6. **Beat 編號整數化**（`b1690d9`）
   - 原 14 + 4 小數 → 18 個整數（Beat 1-18）

7. **上線整合**（`2bdf828`）
   - novels.config.json 新增《惘然》條目
   - genres 新增「文學」
   - 章節 frontmatter cover 對應實際圖檔
   - 5 張圖 + 1 MP4 複製到 site/public/assets/Wangran/
   - sync-chapters + generate-stats + npm run build 全通過
   - 部署觸發：/novel/Wangran/ 及四節子頁面

8. **Part III 結構重組**（當前 session 最後改動）
   - 刪除「Phase A/B/C/D/E」+「Beat 1-18」雙層標題
   - 改為 Part III-1 ~ III-9 單層扁平·與 Part II 一致
   - 內部用 ※ 做場景分隔

9. **新增兩個女主 POV + 清晰化死亡場景**
   - **Part III-4「她·他走那天」**：她聽他走下樓·第一世走是
     「我走他才能放下」失敗·這次他自己走她以為「他能放下我」·
     結尾反轉「我又錯了」——呼應 Part II-8 墓前「我算錯了他」
   - **Part III-9 死亡場景**：從「苦楝樹下」改為**她的墓前**·
     兩世鏡像（她→他墓 / 他→她墓）·雪薄蓋碑·36 歲 7 個月
   - **Part IV「她·三日」**：她觀察他三日試探的反視角·
     「他不敢開。怕我崩潰。我不敢開。怕他認為我瘋了。」
     銜接床上「我有 FTD」

### 最終統計

| 章節 | 字數（中文）| 章節數 |
|------|------------|-------|
| Part I 空房子 | ~3,500 | 1 節 |
| Part II 逆光 | ~4,000 | 7 節（I-1 ~ I-7）|
| Part III 齒輪 | ~5,500 | 9 節（III-1 ~ III-9）|
| Part IV 斑馬線 | ~2,500 | 扁平結構 |
| **合計** | **~15,448 中文字** | **4 章** |

女主 POV 場景共 **5 個**：
- II-3 麥當勞角落（層級三真相「我就知道」）
- II-7 那八個月（墓前「我算錯了他」）
- III-4 他走那天（「我又錯了」）
- III-6 某個下午（FTD 自我懷疑）
- IV 三日（「他在等我開口」）

### 上線結果

《惘然》已發布至：
- https://novels.cqi365.net/novel/Wangran/
- 四節子頁面：/01-空房子/ /02-逆光/ /03-齒輪/ /04-斑馬線/

### Combined Totals（上線後）
- **107 chapters** across 4 published novels
- **~546,000 中文字** total
  - BlindOrbit: 91,136
  - 2040IRIS: 336,431
  - 摺痕: 103,393
  - 惘然: **15,448**（最短·最密·最文學）

### 這次 session 的主要成果

1. **從 v1.0 完稿 → 深度潤稿 → 上線**（單日完成）
2. 移除兩個通俗化元素（10 歲浴室戲、手環每年一只）·換成更文學
   的設計（舊疤不解釋、單一手環戴十五年）
3. 嚴守敘事時空分層（Phase A-D 他不知假外遇·Phase E 後才知）
4. 結構統一（Part III 扁平化為 III-N 編號·與 Part II 一致）
5. 女主 POV 增至 5 處·Kafka 式封閉悲劇引擎完整呈現
6. 上線流程：配圖·novels.config·sync·build·deploy

### 下次 session 可做
1. 實際閱讀站上呈現·檢查 CSS／圖片對齊
2. WordPress 發布（`scripts/publish-to-wp.js`）
3. EPUB 匯出
4. 考慮其他語言譯本或音訊敘述

**最新 commit（2026-04-21 同日尾聲）：**
- `78984d5` 刪除 Part I 自傳式開場
- `2d9e390` 6 處時間矛盾修正
- `5e4b0ca` 去通俗化（10 歲戲 + 手環改單一）
- `9766603` Phase A 加兩場戲 + 5 張配圖
- `e2936b3` `bfb0cbe` 敘事視角修正
- `b1690d9` Beat 編號整數化
- `2bdf828` 上線整合
- `83c7b78` Part III 結構重組 + 女主 POV 他走那天 + 死亡清晰化 + Part IV 女主 POV 三日

**所有 commit 已推送至 `origin/main`·Cloudflare Pages 部署完成。**

---

## 2026-04-21（同日尾聲）— BlindOrbit 全書一致性收尾·Metadata 同步·Git Sync

本段處理《盲軌：2028 / Blind Orbit》最後一致性檢查後的修正，目標是讓正文、設定檔、站台狀態、全文稿與 git 遠端保持一致。

### 檢查重點

1. **章節結構核對**
   - 實際章節為 `Chap_00` ~ `Chap_34`，共 **35 章**。
   - `chapter_order.md` 為目前可信章節索引。
   - 發現 `_meta/outline.md` 仍停留在舊 26 章版本，檔名與章號大量不符。

2. **設定檔一致性**
   - `character_timelines.md`、`arsenal_tech.md` 中仍有舊章號引用，例如 `Ch 20`、`Ch 21`、`Ch 24`。
   - `grand_timeline.md` 發現「北約火砲將首爾變成火海」錯字，應為「北韓火砲」。

3. **正文連貫性**
   - 第 24 章松樹谷已接收林子修的 Link-16 參數。
   - 第 31 章原本又讓凱恩/賈法爾要求林子修重新傳同一份參數，造成雙重驗證橋段重複。
   - 第 8 章直接使用真實總統賴清德視角與對話，與 `character_master.md` 的「真實人物只作背景」規則衝突。

4. **出版殘留**
   - 各章尾端殘留舊版「下一章」提示，章號已不準。
   - 各章尾端重複嵌入 `blind-orbit_cover.jpg`，像匯出殘留，影響網站閱讀。

### 已完成修正

1. **重寫 `_meta/outline.md`**
   - 改為正式 35 章版。
   - 每章保留：正式章號、視角、敘事焦點、對應檔案。
   - 明確標示正式順序以 `chapter_order.md` 為準。

2. **同步設定檔章號**
   - `character_timelines.md` 改用正式章號：
     - 第 22 章：獵人與獵物
     - 第 26 章：密碼
     - 第 27 章：長刀之夜
     - 第 30 章：焦土
     - 第 31 章：鏈結重啟
   - `arsenal_tech.md` 同步修正劇情出現章節。

3. **修正雙重驗證劇情**
   - 第 31 章改為：松樹谷已轉送第 24 章取得的參數包。
   - 林子修在第 31 章只負責提供校驗碼與最後確認。
   - 避免「第 24 章已傳、第 31 章又重傳」的重複感。

4. **真實人物風險處理**
   - 第 8 章台灣總統改為虛構人物 **蕭承遠**。
   - 同步更新：
     - `Chap_08_Asia_The_Wave.md`
     - `Chap_00_Prologue_The_Tinderbox.md`
     - `character_master.md`
     - `world_bible.md`
   - `character_master.md` 補註：台灣總統採虛構人物以承載戰時決策場景。

5. **狀態與出版清理**
   - `novels.config.json`：BlindOrbit 改為 `completed / 已完結`。
   - 移除 35 章尾端重複封面圖。
   - 移除 35 章舊版「下一章」尾註。
   - 重寫 `compile_novel.py`，改從目前 repo 正式章節產生全文稿。
   - 重新產生 `_archives/Full_Story_Draft.md`。

### 驗證結果

- `rg` 檢查通過：
  - 無殘留 `賴清德` / `賴總統`
  - 無殘留舊章號模式：`Ch 20`、`Ch 21`、`Ch 23`、`Ch 24`
  - 無殘留舊檔名：`Chap_01_Interlude`、`Static_and_Hearts` 等
  - 無殘留章尾 `blind-orbit_cover.jpg`
  - 無殘留舊版「下一章」尾註
- `git diff --check` 通過。
- `npm.cmd run build`：
  - 第一次在 sandbox 下因 Windows `spawn EPERM` 失敗。
  - 提升權限後 build 成功。
  - Astro 仍有既有 duplicate id / package type warning，但不阻擋輸出。

### 統計更新

Build 後統計：

| 小說 | 章節數 | 字數 |
|------|--------|------|
| BlindOrbit | 35 | 91,098 |
| 2040IRIS | 41 | 336,431 |
| 摺痕 | 30 | 103,393 |
| 惘然 | 4 | 15,448 |
| **合計** | **110 chapters** | **546,370 中文字** |

### Git Sync

已建立並推送：

- `b7368b8` Refine BlindOrbit continuity and metadata

推送結果：

- `main` 已與 `origin/main` 對齊。
- 本次 commit 僅納入 `novels.config.json` 與 `projects/BlindOrbit` 相關修正。
- 未納入其他工作區既有變更，例如：
  - `.claude/settings.local.json`
  - 2040IRIS png/jpg 圖檔轉換
  - EPUB 預覽檔
  - TheCrease colophon draft
  - scripts / templates 等未關聯檔案

### 下次 session 可做

1. 清理或確認 2040IRIS 圖檔轉換是否要正式納入 git。
2. 檢查 `site/check_errors.txt` 是否為舊檔，可刪除或重新產生。
3. 處理 Astro duplicate id warning 的來源。
4. 統一 root `package.json` 加 `"type": "module"`，消除 Node module type warning。

---

## 2026-04-21（同日最終）— 惘然 EPUB 匯出·網站章節圖路徑修正

繼 BlindOrbit 收尾之後·同日處理《惘然》兩項收尾工作：EPUB 匯出、
網站章節插畫載入問題。

### 1. EPUB 匯出·新建 Wangran 專用腳本

原因：
- 通用腳本 `build_generic_epub.py` 透過 `Chap_\d+` 正則匹配檔名·
  但 Wangran 章節命名為 `01-空房子.md`·匹配不到·導致章節插畫
  無法自動 embed。
- 第一次嘗試產出的 EPUB 只有 226 KB（沒插畫）。

解決：
- 新建 `scripts/build_wangran_epub.py`·專門處理 Wangran：
  - 讀取 frontmatter `cover` 欄·對應到 `_assets/chapters/{file}`
  - 使用 `_assets/Cover_LostInRetrospect.jpg` 做書封
  - 加扉頁（書名 + 英譯 + 李商隱引詩）
  - 襯線字體 CSS（Noto Serif TC）·1.8 行高·段首縮排 2em
- 輸出路徑改為**根目錄**·檔名用**英文書名**：
  - `LostInRetrospect.epub`（986 KB·含封面 + 4 張章節插畫）

### 2. 網站章節圖路徑錯誤

使用者反映網頁上章節插畫沒顯示。

診斷：
- Astro ChapterLayout.astro 第 34 行自動拼接路徑：
  ```js
  coverImageUrl = `/assets/${novelSlug}/chapters/${cover}`;
  ```
- 我在 frontmatter 寫成 `cover: "chapters/Illustration_..."`，
  拼接後變成 `/assets/Wangran/chapters/chapters/Illustration_...`
  **雙層 404**。

修正：
- 4 章 frontmatter cover 欄移除 `chapters/` 前綴：
  - `cover: "Illustration_part1_emptyHouse.jpg"`
  - `cover: "illustration_part2_backlight.jpg"`
  - `cover: "illustration_part3_gear.jpg"`
  - `cover: "illustration_part4_zebra.jpg"`
- EPUB 腳本配套調整：先查 `_assets/chapters/{file}`·找不到再 fallback
  到 `_assets/{file}`（兼容兩種路徑）。

### 清理

- 移除舊 `projects/Wangran/Wangran_Preview.epub`
- 移除根目錄殘留 `Wangran_Preview.epub`
- 移除 `_assets/chapters/Wangran_cover.jpg`（通用腳本時期 copy·已不需要）

### Build 驗證

- `sync-chapters.js Wangran` 通過（frontmatter 更新後的 cover 正確）
- `generate-stats.js`：Wangran 4 章·15,448 中文字
- `npm run build`：115 頁全部 build 通過
- EPUB 986 KB·4 張插畫全數 embed

### 最終檔案狀態

```
repo root:
  LostInRetrospect.epub         986 KB  含書封 + 扉頁 + 4 章節插畫

projects/Wangran/_assets/:
  Cover_LostInRetrospect.jpg    書封
  Cover_LostInRetrospect_mv.mp4 封面影片
  chapters/
    Illustration_part1_emptyHouse.jpg
    illustration_part2_backlight.jpg
    illustration_part3_gear.jpg
    illustration_part4_zebra.jpg

scripts/
  build_wangran_epub.py         已納入 git
```

### Git Sync

- `fd55f81` fix(Wangran): 修正章節 cover 路徑·移除 chapters/ 前綴
- 已推送 `origin/main`·Cloudflare Pages 觸發自動部署。

### Combined Totals（本 session 最終）

- **110 chapters** across 4 published novels
- **~546,370 中文字**
- 《惘然》15,448 字，4 章·雙視角+5 個女主 POV 場景
- 全書 EPUB 匯出完成

### 下次 session 可做

1. 部署完成後實際在網站上驗收章節插畫顯示
2. 考慮統一所有 novel 的 EPUB 腳本架構（通用腳本擴充·支援
   frontmatter cover 讀取）
3. 考慮做 Wangran 的 WordPress 發布（`scripts/publish-to-wp.js`）
4. 同步 root `package.json` 加 `"type": "module"` 消 Node warning

**最新 commit（本 session 尾）：**
- `fd55f81` 修正章節 cover 路徑 + EPUB 腳本納入 git
