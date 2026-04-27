# CQi365 Novels — 原創小說平台

**作者**：林雨果（Hugo Lin）
**網站**：[novels.cqi365.net](https://novels.cqi365.net)
**技術**：Astro + Cloudflare Pages

---

## 作品列表

### 已完結

| 書名 | 類型 | 章數 | 說明 |
|------|------|------|------|
| [盲軌：2028](projects/BlindOrbit/) | 軍事驚悚 | 34 | 台海戰爭架空小說 |
| [2040IRIS 三部曲](projects/2040Iris/) | AI 科幻 | 36 | AI 治理崩潰的三部曲 |
| [摺痕](projects/TheCrease/) | 硬科幻 | 30 | 量子意識與時空摺疊 |
| [白露未晞](projects/LostInRetrospect/) | 文學 | 4 | 三世輪迴·修錶師視角 |
| [白露成霜](projects/FrozenInForesight/) | 文學 | 4 | 同一故事·妻子視角 |
| [凌晨三點零七](projects/3-07AM/) | 文學短篇 | 1 | 一個男人與 AI 的深夜對話 |

### 創作中

| 書名 | 類型 | 進度 | 說明 |
|------|------|------|------|
| [半成品](projects/HalfFinished/) | 文學 | 15章骨架 | 建築師繼承日本半成品民宿 |
| [蒹葭蒼蒼](projects/WhiteDewOnTheReeds/) | 文學 | 5章初稿 | 妻子在丈夫遺留的 AI 對話中考古 |
| [溺墨](projects/NotWavingButDrowning/) | 後設小說 | 規劃完成 | 作家的無限嵌套救贖 |

---

## 目錄結構

```
├── AGENTS.md          ← AI agent 工作指南
├── STYLE_GUIDE.md     ← 寫作風格規範
├── novels.config.json ← 網站中央設定
├── projects/          ← 小說專案（每部一個目錄）
├── scripts/           ← 建構工具
├── site/              ← Astro 網站
└── _output/           ← 產出（EPUB、ISBN、歷史紀錄）
```

## 給 AI Agent

請先閱讀 [AGENTS.md](AGENTS.md)。

## 建構

```bash
cd site
npm run build     # 同步章節 + 統計字數 + Astro 建構
npm run preview   # 本地預覽
```

Push to `main` → Cloudflare Pages 自動部署。
