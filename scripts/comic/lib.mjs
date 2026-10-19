/**
 * lib.mjs — 條漫管線共用：讀 02_strip.json、讀實體聖經、編譯單格 prompt。
 *
 * 實體檔沿用影片管線慣例：_dev/media/character_refs/CHAR-*.md、asset_refs/{LOC,PROP,STYLE}-*.md，
 * markdown + YAML frontmatter。ref 圖放在同名資料夾：
 *   character_refs/CHAR-X/{variant}/ref_front.jpg     角色（依時間版本分開）
 *   asset_refs/LOC-X/ref_wide.jpg                     場景、道具、畫風
 * frontmatter 的 refs 值寫「⬜ 未建」代表還沒做；做好後改成檔名。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const yaml = (s) => matter.engines.yaml.parse(s);

export const ASPECTS = ['1:1', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];
export const MAX_REFS = 14;   // gemini-3-pro-image 輸入圖上限
export const MAX_CAST = 5;    // 角色一致性上限

export function loadStrip(stripPath) {
  const abs = path.resolve(stripPath);
  const doc = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const mediaDir = path.resolve(path.dirname(abs), '..', '..');
  const outDir = path.join(ROOT, '_output', 'comic', doc.novel, doc.episode);
  return { doc, abs, mediaDir, outDir, scenes: Object.fromEntries(doc.scenes.map((s) => [s.id, s])) };
}

const cache = new Map();
export function entityPath(mediaDir, id) {
  return path.join(mediaDir, id.startsWith('CHAR-') ? 'character_refs' : 'asset_refs', `${id}.md`);
}
export function loadEntity(mediaDir, id) {
  const f = entityPath(mediaDir, id);
  if (cache.has(f)) return cache.get(f);
  const e = fs.existsSync(f) ? matter(fs.readFileSync(f, 'utf8')).data : null;
  cache.set(f, e);
  return e;
}

export function loadLedger(mediaDir) {
  const f = path.join(mediaDir, 'continuity.yaml');
  return fs.existsSync(f) ? yaml(fs.readFileSync(f, 'utf8')) ?? {} : {};
}

const built = (v) => typeof v === 'string' && v && !v.startsWith('⬜');

/** 依年份挑角色版本。panel 可以用 variant 覆寫，但正常應該由 scene.year 決定。 */
export function pickVariant(ent, year, override) {
  const vs = ent?.variants ?? {};
  if (override) return [override, vs[override]];
  const hit = Object.entries(vs).find(([, v]) => v.years && year >= v.years[0] && year <= v.years[1]);
  return hit ?? [null, null];
}

/** 回傳 { built: [abs paths], missing: [label] } */
function refsOf(mediaDir, id, refs, sub) {
  sub ??= '';
  const dir = path.join(mediaDir, id.startsWith('CHAR-') ? 'character_refs' : 'asset_refs', id, sub);
  const out = { built: [], missing: [] };
  for (const [k, v] of Object.entries(refs ?? {})) {
    if (built(v)) {
      const p = path.join(dir, v);
      fs.existsSync(p) ? out.built.push(p) : out.missing.push(`${id}/${sub ? sub + '/' : ''}${v}（檔案不存在）`);
    } else out.missing.push(`${id}${sub ? '@' + sub : ''}:${k}`);
  }
  return out;
}

// 嵌字位置 → 要求出圖時那一區留白，對白框才不會蓋到臉。
function region(l) {
  const cx = l.x + (l.w ?? 30) / 2, cy = l.y + 8;
  const v = cy < 34 ? 'top' : cy > 66 ? 'bottom' : 'middle';
  const h = cx < 34 ? 'left' : cx > 66 ? 'right' : 'center';
  return v === 'middle' && h === 'center' ? 'center' : `${v}-${h}`.replace('-center', '');
}

/**
 * 單格 prompt 編譯。順序固定（對照 video_production/references/prompt_rules.md）：
 *   畫幅 → 場景+光 → 景別 → 角色（CHARACTER n，順序＝附圖順序）→ 道具 → 額外 → 留白 → 畫風 → 人數
 */
export function compilePanel(ctx, panel) {
  const { mediaDir, scenes, doc } = ctx;
  const scene = scenes[panel.scene];
  const loc = loadEntity(mediaDir, scene.location);
  const style = loadEntity(mediaDir, doc.style);
  const lines = [];
  const refs = [];
  const missingRefs = [];
  const take = (r) => { refs.push(...r.built); missingRefs.push(...r.missing); };

  lines.push(`Generate a single comic panel image, aspect ratio ${panel.aspect}.`);
  lines.push(`SETTING: ${loc.canonical}`);
  if (panel.view && loc.views?.[panel.view]) lines.push(loc.views[panel.view]);
  lines.push(`LIGHT: ${loc.light_presets[scene.light]}${panel.light_extra ? ' ' + panel.light_extra : ''}`);
  lines.push(`FRAMING: ${panel.framing}.`);

  (panel.cast ?? []).forEach((c, i) => {
    const ent = loadEntity(mediaDir, c.id);
    if (!ent) { lines.push(`CHARACTER ${i + 1}: ⚠ 實體 ${c.id} 不存在`); return; }
    const [vk, v] = pickVariant(ent, scene.year, c.variant);
    const wk = scene.cast?.[c.id];
    const parts = [
      ent.canonical, v?.look, v?.wardrobe?.[wk],
      `In this panel: ${c.visible}; ${c.pose}.`,
      c.face ? `Face: ${c.face}` : null,
    ].filter(Boolean);
    lines.push(`CHARACTER ${i + 1} (${ent.gender}, reference image set ${i + 1}): ${parts.join(' ')}`);
    take(refsOf(mediaDir, c.id, v?.refs, vk));
  });

  for (const p of panel.props ?? []) {
    const ent = loadEntity(mediaDir, p.id);
    if (!ent) { lines.push(`PROP: ⚠ 實體 ${p.id} 不存在`); continue; }
    let s = `PROP: ${ent.canonical} Placement: ${p.place}.`;
    if (ent.text_surface) s += ' Its writing area must be left blank — any writing is added later.';
    lines.push(s);
    take(refsOf(mediaDir, p.id, ent.refs));
  }
  take(refsOf(mediaDir, scene.location, loc.refs));

  if (panel.extra) lines.push(panel.extra);
  const zones = [...new Set((panel.letters ?? []).filter((l) => l.type !== 'board').map(region))];
  if (zones.length) lines.push(`Keep calm, uncluttered negative space in the ${zones.join(' and ')} area of the frame, with no faces there.`);

  lines.push(style.suffix);
  take(refsOf(mediaDir, doc.style, style.refs));

  const n = (panel.cast ?? []).length;
  lines.push(n === 0 ? 'No people in frame.' : n === 1 ? 'Single person in frame.' : `${['', '', 'Two', 'Three', 'Four', 'Five'][n]} people in frame.`);

  return { prompt: lines.join('\n\n'), refs, missingRefs };
}

export function panelImage(outDir, id) {
  for (const ext of ['.jpg', '.png', '.webp']) {
    const f = path.join(outDir, 'panels', id + ext);
    if (fs.existsSync(f)) return f;
  }
  return null;
}
