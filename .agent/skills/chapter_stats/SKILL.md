---
name: chapter_stats
description: |
  查詢與分析小說字數統計。當使用者問「字數」「章數」「章節長度」「進度」「平均多少字」
  「哪章最長/最短」「小說規模」「寫作進度」·或要填寫 PROGRESS_LOG 需要字數數據時·
  應使用此 skill 呼叫 `scripts/chapter-stats.mjs` 取得資料·**勿手動數檔案**。
---

# Chapter Stats Skill

本 Skill 提供小說字數統計的**標準呼叫方式**。避免各 session 自己手刻臨時腳本·保持數字口徑一致。

---

## 🎯 何時使用

使用者說出以下任一關鍵字時·自動調閱:

- 字數 / 總字數 / 多少字
- 章數 / 章節總數 / 章節長度
- 進度 / 寫了多少
- 平均字數 / 字數分布
- 哪章最長 / 最短
- 小說規模 / 對比字數
- 需要填 `PROGRESS_LOG.md` 的字數欄位

---

## 🛠️ 呼叫方式

工具路徑:`scripts/chapter-stats.mjs`（ES module·需 Node.js）

### 預設:全站總覽
```bash
node scripts/chapter-stats.mjs
```
輸出:每本小說的總字數、章數、平均、最長/最短章·最後一行是全站總計。

### 單本小說
```bash
node scripts/chapter-stats.mjs --novel=<slug>
```
slug 候選值（從 `novels.config.json` 的 `slug` 欄位）:
- `BlindOrbit`
- `2040Iris`
- `TheCrease`
- `Wangran`
- `Cursor`

### 逐章明細
```bash
node scripts/chapter-stats.mjs --novel=<slug> --verbose
```
列出每一章的字數·依檔名排序。

### JSON 輸出（給其他工具串接）
```bash
node scripts/chapter-stats.mjs --json                  # 全站
node scripts/chapter-stats.mjs --json --verbose        # 全站含逐章
node scripts/chapter-stats.mjs --json > snapshot.json  # 存快照
```

### 切換計數模式
```bash
node scripts/chapter-stats.mjs --mode=pure   # 預設·純漢字
node scripts/chapter-stats.mjs --mode=full   # 含標點/英數·排除 markdown
node scripts/chapter-stats.mjs --mode=raw    # 全字元·含空白
```

### 檢視所有參數
```bash
node scripts/chapter-stats.mjs --help
```

---

## 📊 計數模式選擇原則

| 情境 | 用哪個模式 |
|------|-----------|
| 中文出版字數標準(對外說「這本 X 萬字」) | `pure` (預設) |
| 排版/印刷估算 | `full` |
| 跟 `wc -m` 結果交叉驗證 | `raw` |
| 不知道該用哪個 | `pure` |

**預設一律使用 `pure`**·除非使用者明確要求別的基準。

---

## 📝 輸出格式範例

### 人類可讀(預設):

```
章節字數統計  [mode: pure — 純漢字計數]
============================================================

《盲軌：2028》 (Blind Orbit)
  總計    91,098 字  (9.1 萬字)
  章數    35  ·  平均 2,603 字/章
  最長章  Chap_13_Asia_Island_Diary  —  5,197
  最短章  Chap_28_Global_The_Pincer  —  1,262
...
============================================================
總計  111 章  ·  554,063 字  ·  55.4 萬字
```

### JSON(可被其他腳本串接):

```json
{
  "mode": "pure",
  "generatedAt": "ISO-8601",
  "novels": {
    "BlindOrbit": {
      "title": "盲軌：2028",
      "titleEn": "Blind Orbit",
      "slug": "BlindOrbit",
      "chapters": 35,
      "total": 91098,
      "averagePerChapter": 2603,
      "longest": { "file": "...", "count": 5197 },
      "shortest": { "file": "...", "count": 1262 }
    }
  },
  "grandTotal": { "chapters": 111, "words": 554063, "formatted": "55.4 萬字" }
}
```

---

## 🔄 跟 `generate-stats.js` 的分工

| 工具 | 時機 | 用途 | 輸出 |
|------|------|------|------|
| `scripts/generate-stats.js` | build-time(自動) | 網站首頁顯示用 | `site/src/data/novels-stats.json` |
| `scripts/chapter-stats.mjs` | on-demand | 回答使用者查詢/分析 | stdout(表格或 JSON) |

**千萬不要**直接讀 `site/src/data/novels-stats.json` 回答使用者字數問題——那個檔案 gitignored·可能過時或不存在。**永遠用 `chapter-stats.mjs` 現算**。

---

## ⚡ 常見工作流

### Flow 1:使用者問「某本書現在多少字？」
```bash
node scripts/chapter-stats.mjs --novel=<slug>
```
→ 讀總計那行回覆即可。

### Flow 2:使用者問「幫我看寫作進度」
```bash
node scripts/chapter-stats.mjs
```
→ 依需要補充:哪本最大、全站總計。

### Flow 3:填寫 PROGRESS_LOG 需要字數
```bash
node scripts/chapter-stats.mjs --json
```
→ 解析 JSON 填入 log·確保數字口徑一致。

### Flow 4:新章寫完·比對成長
```bash
# 前:存一份基準
node scripts/chapter-stats.mjs --novel=<slug> --json > /tmp/before.json
# 寫完之後再跑·對比差異
node scripts/chapter-stats.mjs --novel=<slug>
```

---

## ⚠️ 注意事項

1. **不要自己重算**:凡需要字數·一律用此工具。避免各 session 用不同 regex 算出不同數字。
2. **標題欄位**:工具會自動從 `novels.config.json` 讀 title / titleEn·若新增小說·config 更新後工具自動涵蓋。
3. **章節是 `.md` 檔**:工具只掃 `projects/<slug>/chapters/*.md`·若章節放錯位置不會被計入。
4. **遇到異常**:若某本的總字數為 0·先檢查 `projects/<slug>/chapters/` 是否存在。

---

## 📚 相關檔案

- 工具:`scripts/chapter-stats.mjs`（本 skill 的主程式）
- Build 時自動執行版:`scripts/generate-stats.js`
- 小說清單與 metadata:`novels.config.json`
- PROGRESS_LOG:`PROGRESS_LOG.md`
