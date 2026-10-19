#!/usr/bin/env node
/**
 * validate.mjs — 出圖前的免費關卡。只讀不寫。
 *
 *   node scripts/comic/validate.mjs --strip projects/2040Iris/_dev/media/comic/ep00/02_strip.json
 *
 * ERROR 擋出圖；WARN 提醒（例如 ref 圖還沒建，那一格只能靠文字描述，臉會飄）。
 */
import { loadStrip, loadEntity, loadLedger, entityPath, pickVariant, compilePanel, ASPECTS, MAX_REFS, MAX_CAST } from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const stripPath = args[args.indexOf('--strip') + 1];
if (!stripPath || !args.includes('--strip')) { console.error('要 --strip <02_strip.json>'); process.exit(1); }

const ctx = loadStrip(stripPath);
const { doc, mediaDir, scenes } = ctx;
const errors = [], warns = [];
const E = (w, m) => errors.push(`${w}  ${m}`);
const W = (w, m) => warns.push(`${w}  ${m}`);
const need = (w, id) => { if (!fs.existsSync(entityPath(mediaDir, id))) { E(w, `實體不存在：${id}`); return false; } return true; };

need('strip', doc.style);
const style = loadEntity(mediaDir, doc.style) ?? {};
const forbidden = (style.forbid_words ?? []).map((s) => s.toLowerCase());
const reserved = style.palette?.reserved ?? {};

// 場景層：版本、服裝、帳本
const ledger = loadLedger(mediaDir)[doc.episode];
if (!ledger) W('strip', `continuity.yaml 沒有 ${doc.episode} 的登記`);
for (const sc of doc.scenes) {
  if (!need(sc.id, sc.location)) continue;
  const loc = loadEntity(mediaDir, sc.location);
  if (!loc.light_presets?.[sc.light]) E(sc.id, `${sc.location} 沒有光線預設「${sc.light}」`);
  for (const [cid, wk] of Object.entries(sc.cast ?? {})) {
    if (!need(sc.id, cid)) continue;
    const ent = loadEntity(mediaDir, cid);
    const [vk, v] = pickVariant(ent, sc.year);
    if (!v) { E(sc.id, `${cid} 沒有涵蓋 ${sc.year} 年的版本`); continue; }
    if (!v.wardrobe?.[wk]) E(sc.id, `${cid}@${vk} 沒有服裝「${wk}」`);
    const led = ledger?.cast?.[cid];
    if (ledger && !led) W(sc.id, `${cid} 出場但沒登記在 continuity.yaml`);
    if (led && (led.variant !== vk || led.wardrobe !== wk)) E(sc.id, `${cid} 與帳本不符：strip ${vk}/${wk}，帳本 ${led.variant}/${led.wardrobe}`);
  }
  if (ledger && ledger.year !== sc.year) E(sc.id, `年份 ${sc.year} 與帳本 ${ledger.year} 不符`);
}

// 格層
const ids = new Set();
let faces = 0;
for (const p of doc.panels) {
  const w = p.id;
  if (ids.has(w)) E(w, '格 id 重複'); ids.add(w);
  const sc = scenes[p.scene];
  if (!sc) { E(w, `場景 ${p.scene} 不存在`); continue; }
  if (!ASPECTS.includes(p.aspect)) E(w, `aspect ${p.aspect} 不支援（${ASPECTS.join(' ')}）`);
  const cast = p.cast ?? [];
  if (cast.length > MAX_CAST) E(w, `角色 ${cast.length} 個，上限 ${MAX_CAST}`);
  let ok = true;
  for (const c of cast) {
    if (!need(w, c.id)) { ok = false; continue; }
    if (!(c.id in (sc.cast ?? {}))) E(w, `${c.id} 不在場景 ${sc.id} 的出場名單（服裝由場景決定，先登記到 scene.cast）`);
    if (c.variant) W(w, `${c.id} 手動指定版本 ${c.variant}，覆寫了依年份的自動選擇`);
    if (c.face) faces++;
  }
  for (const pr of p.props ?? []) if (!need(w, pr.id)) ok = false;
  if (!ok) continue;

  const castIds = new Set(cast.map((c) => c.id));
  for (const l of p.letters ?? []) {
    if (l.type === 'speech' && !castIds.has(l.speaker) && !l.offscreen) E(w, `對白說話者 ${l.speaker} 不在這一格（畫面外請加 offscreen: true）`);
    const len = [...l.text.replace(/\s/g, '')].length;
    if (l.type === 'speech' && len > 28) W(w, `對白 ${len} 字，條漫一個框建議 ≤ 28 字，考慮拆框或拆格`);
    if (l.x < 0 || l.y < 0 || l.x + (l.w ?? 0) > 100 || l.y > 100) E(w, `嵌字「${l.text.slice(0, 8)}…」超出格子`);
    if (l.type === 'board' && !(p.props ?? []).some((pr) => loadEntity(mediaDir, pr.id)?.text_surface)) W(w, 'board 字但這一格沒有 text_surface 道具');
  }

  const { prompt, refs, missingRefs } = compilePanel(ctx, p);
  // 畫風尾綴本身就寫著 "Do NOT ... anime"，掃描前先拿掉
  const low = prompt.replace(style.suffix ?? '', '').toLowerCase();
  for (const f of forbidden) if (new RegExp(`\\b${f.toLowerCase()}\\b`).test(low)) E(w, `prompt 含禁止詞「${f}」`);
  for (const [color, owner] of Object.entries(reserved)) {
    const hasOwner = (p.props ?? []).some((pr) => pr.id === owner);
    if (!hasOwner && new RegExp(`\\b${color}\\b`).test(low)) E(w, `保留色「${color}」只屬於 ${owner}，這一格沒有它卻用到了`);
  }
  if (refs.length > MAX_REFS) E(w, `參考圖 ${refs.length} 張，上限 ${MAX_REFS}——減少同框實體或拆格`);
  if (missingRefs.length && cast.length) W(w, `有角色但 ref 未建 ${missingRefs.filter((m) => m.startsWith('CHAR-')).length} 張，臉只靠文字，會飄`);
}

const allMissing = new Set(doc.panels.flatMap((p) => compilePanel(ctx, p).missingRefs));
console.log(`${doc.novel}/${doc.episode}「${doc.title}」 ${doc.panels.length} 格，${doc.scenes.length} 場，有表情指示 ${faces} 格`);
if (allMissing.size) console.log(`\nref 未建 ${allMissing.size} 張（Gate 3 未過）：\n  ${[...allMissing].join('\n  ')}`);
if (warns.length) console.log(`\nWARN ${warns.length}\n  ${warns.join('\n  ')}`);
if (errors.length) { console.log(`\nERROR ${errors.length}\n  ${errors.join('\n  ')}`); process.exit(1); }
console.log('\n✓ 結構檢查通過');
