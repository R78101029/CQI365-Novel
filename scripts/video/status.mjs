#!/usr/bin/env node
/**
 * status.mjs — 一集走到哪一步了，下一步該做什麼。
 *
 *   node scripts/video/status.mjs --shots projects/HalfFinished/_dev/media/ep01/02_shots.json
 *   node scripts/video/status.mjs --novel HalfFinished          # 列出該小說所有集
 *
 * 管線是有順序的，每一步都要前一步完成才有意義。這支負責把「現在該做哪一步」
 * 講清楚，並且抓出「上游改過、下游沒重跑」的過期狀態——那是最容易靜悄悄出錯的地方
 * （改了 shots.json 卻沿用舊的 animatic，看到的節奏就不是實際會出的節奏）。
 *
 * 它只報告，不動任何東西。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

const mtime = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);
const exists = (f) => fs.existsSync(f);

function report(shotsPath) {
  const doc = JSON.parse(fs.readFileSync(shotsPath, 'utf8'));
  const epDir = path.join(ROOT, '_output', 'video', doc.novel, doc.episode);
  const srcDir = path.dirname(shotsPath);
  // 實體檔照 repo 既有慣例放在 _dev/media/：角色在 character_refs/，
  // 場景與道具在 asset_refs/。markdown + YAML frontmatter，前面給機器後面給人。
  const mediaDir = path.join(srcDir, '..');
  const entityFile = (id) => {
    const dir = id.startsWith('CHAR-') ? 'character_refs' : 'asset_refs';
    return path.join(mediaDir, dir, `${id}.md`);
  };

  const shotsMtime = mtime(shotsPath);
  const steps = [];

  // 1 劇本
  const script = path.join(srcDir, '01_script.md');
  steps.push({ n: 1, name: '劇本', ok: exists(script),
    detail: exists(script) ? path.basename(script) : '缺 01_script.md',
    next: 'Claude 依 references/script_format.md 撰寫' });

  // 2 資產聖經
  const ids = new Set();
  for (const s of doc.shots) {
    (s.cast ?? []).forEach((x) => ids.add(x));
    (s.props ?? []).forEach((x) => ids.add(x));
    if (s.location) ids.add(s.location);
  }
  const missing = [...ids].filter((id) => !exists(entityFile(id)));
  steps.push({ n: 2, name: '資產聖經', ok: ids.size > 0 && missing.length === 0,
    detail: missing.length ? `${ids.size} 個實體，缺 ${missing.length}：${missing.slice(0, 6).join(' ')}${missing.length > 6 ? '…' : ''}` : `${ids.size} 個實體齊備`,
    next: '建 _dev/media/character_refs/{CHAR-*}.md 或 asset_refs/{LOC-*,PROP-*}.md' });

  // 3 分鏡表
  const noPrompt = doc.shots.filter((s) => !s.frame_prompt && !s.frame_prompt_extra).map((s) => s.id);
  steps.push({ n: 3, name: '分鏡表', ok: doc.shots.length > 0 && noPrompt.length === 0,
    detail: noPrompt.length ? `${doc.shots.length} 鏡，${noPrompt.length} 鏡沒有 prompt：${noPrompt.join(' ')}` : `${doc.shots.length} 鏡，總長 ${doc.shots.reduce((a, s) => a + s.duration, 0)}s`,
    next: '補齊每鏡的 frame_prompt / motion_prompt' });

  // 4 旁白
  const vt = doc.vo_track ?? [];
  const voMissing = vt.filter((v) => !exists(path.join(epDir, 'audio', `vo_${v.id}.wav`)));
  const voOld = vt.length && !voMissing.length &&
    Math.min(...vt.map((v) => mtime(path.join(epDir, 'audio', `vo_${v.id}.wav`)))) < shotsMtime;
  steps.push({ n: 4, name: '旁白', ok: vt.length > 0 && voMissing.length === 0, stale: voOld,
    detail: !vt.length ? '沒有 vo_track' : voMissing.length ? `${vt.length} 句，缺 ${voMissing.length}` : `${vt.length} 句，聲音 ${doc.vo_voice ?? '?'}，結束於 ${doc.timeline?.vo_ends_at ?? '?'}s`,
    next: 'node scripts/video/gen-vo.mjs --shots <file>' });

  // 5 分鏡圖
  const frMissing = doc.shots.filter((s) => !exists(path.join(epDir, 'frames', `${s.id}.jpg`))).map((s) => s.id);
  steps.push({ n: 5, name: '分鏡圖', ok: frMissing.length === 0,
    detail: frMissing.length ? `缺 ${frMissing.length} 張：${frMissing.join(' ')}` : `${doc.shots.length} 張齊備`,
    next: 'node scripts/video/gen-frame.mjs（逐鏡，每張看過再往下）' });

  // 6 動態腳本
  const ani = path.join(epDir, 'out', 'animatic.mp4');
  steps.push({ n: 6, name: '動態腳本', ok: exists(ani), stale: exists(ani) && mtime(ani) < shotsMtime,
    detail: exists(ani) ? (mtime(ani) < shotsMtime ? '比 shots.json 舊——節奏已經不是現在這份' : '最新') : '還沒做',
    next: 'node scripts/video/animatic.mjs --shots <file>　← 花錢前的關卡' });

  // 7 片段
  const clMissing = doc.shots.filter((s) => !exists(path.join(epDir, 'clips', `${s.id}.mp4`))).map((s) => s.id);
  steps.push({ n: 7, name: '片段', ok: clMissing.length === 0,
    detail: clMissing.length ? `缺 ${clMissing.length} 支：${clMissing.join(' ')}` : `${doc.shots.length} 支齊備`,
    next: 'node scripts/video/gen-clip.mjs（逐鏡）' });

  // 8 配樂
  const bgm = path.join(epDir, 'audio', 'bgm.mp3');
  steps.push({ n: 8, name: '配樂', ok: exists(bgm),
    detail: exists(bgm) ? 'bgm.mp3' : '還沒做（可選）', optional: true,
    next: 'node scripts/video/gen-bgm.mjs --shots <file>' });

  // 9 合成
  const fin = path.join(epDir, 'out', `${doc.episode}.mp4`);
  const finStale = exists(fin) && (mtime(fin) < shotsMtime ||
    doc.shots.some((s) => mtime(path.join(epDir, 'clips', `${s.id}.mp4`)) > mtime(fin)));
  steps.push({ n: 9, name: '合成', ok: exists(fin), stale: finStale,
    detail: exists(fin) ? (finStale ? '比上游舊——要重新合成' : '最新') : '還沒做',
    next: 'node scripts/video/assemble.mjs --shots <file>' });

  console.log(`\n${doc.novel} / ${doc.episode}　${doc.title ?? ''}`);
  console.log('─'.repeat(64));
  for (const s of steps) {
    const mark = s.ok ? (s.stale ? '⚠' : '✅') : (s.optional ? '－' : '⬜');
    console.log(`${mark} ${s.n}. ${s.name.padEnd(5)} ${s.detail}`);
  }

  const blocked = steps.find((s) => !s.ok && !s.optional);
  const staleStep = steps.find((s) => s.ok && s.stale);
  console.log('─'.repeat(64));
  if (blocked) {
    console.log(`下一步 → ${blocked.n}. ${blocked.name}`);
    console.log(`         ${blocked.next}`);
    const later = steps.filter((s) => s.n > blocked.n && s.ok && !s.optional).map((s) => s.name);
    if (later.length) console.log(`⚠ 注意：${later.join('、')} 已經做過，但上游還沒補齊——順序是亂的`);
  } else if (staleStep) {
    console.log(`下一步 → ${staleStep.n}. ${staleStep.name} 需要重跑（上游改過）`);
    console.log(`         ${staleStep.next}`);
  } else {
    console.log('全部完成。');
  }
  console.log();
}

const shotsPath = flag('shots');
if (shotsPath) { report(shotsPath); process.exit(0); }

const novel = flag('novel');
if (!novel) { console.error('要 --shots <02_shots.json> 或 --novel <slug>'); process.exit(1); }
const base = path.join(ROOT, 'projects', novel, '_dev', 'media');
if (!exists(base)) { console.error(`${novel} 還沒有 _dev/media/`); process.exit(1); }
const eps = fs.readdirSync(base).filter((d) => /^ep\d+$/.test(d)).sort();
if (!eps.length) { console.error('沒有任何 epNN 目錄'); process.exit(1); }
for (const ep of eps) {
  const f = path.join(base, ep, '02_shots.json');
  if (exists(f)) report(f);
}
