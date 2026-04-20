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
