#!/usr/bin/env node
/**
 * gen-bgm.mjs — 產生配樂（Google Lyria）。
 *
 *   node scripts/video/gen-bgm.mjs --shots projects/HalfFinished/_dev/media/ep01/02_shots.json
 *   node scripts/video/gen-bgm.mjs --shots <file> --take 2      # 多出幾版挑
 *
 * prompt 取自 shots.json 的 bgm_prompt；沒有就用預設（沉靜弦樂床）並寫回去，
 * 之後改詞就改 shots.json。
 *
 * ⚠ Lyria 會擋指名藝術家的風格模仿。prompt 裡寫「武滿徹」「坂本龍一」會回
 * PROHIBITED_CONTENT 而且不給任何音訊——要把風格翻譯成純音樂描述
 * （編制、節拍、動態、和聲、要避免什麼）。
 *
 * 產出 _output/video/{novel}/{episode}/audio/bgm.mp3（不進版本庫）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/))
    .filter(Boolean).map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, '')]),
);

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

const shotsPath = flag('shots');
if (!shotsPath) { console.error('要 --shots <02_shots.json>'); process.exit(1); }
const doc = JSON.parse(fs.readFileSync(shotsPath, 'utf8'));

const DEFAULT_PROMPT = [
  'Sparse solo string ensemble: violin, viola, cello, double bass only.',
  'No piano, no percussion, no synthesiser, no voice.',
  'Free time with no fixed pulse and no beat — rubato, breathing, unmetered.',
  'Extremely narrow dynamic range, pianissimo to mezzo-piano throughout, sitting far back as a quiet bed.',
  'Long sustained tones separated by silence; the silences are as long as the notes.',
  'Modal and unresolved, no chord progression that arrives anywhere.',
  'Restrained and unsentimental.',
  'Avoid crescendos, avoid emotional swells, avoid trailer-style build-ups, avoid a driving rhythmic pulse.',
].join(' ');

const prompt = doc.bgm_prompt ?? DEFAULT_PROMPT;
const MODEL = flag('model', 'lyria-3-pro-preview');
const takes = Number(flag('take', 1));

const outDir = path.join(ROOT, '_output', 'video', doc.novel, doc.episode, 'audio');
fs.mkdirSync(outDir, { recursive: true });

function findFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  const base = path.join('C:/Users', process.env.USERNAME || '', 'AppData/Local/Microsoft/WinGet/Packages');
  if (!fs.existsSync(base)) return null;
  const stack = fs.readdirSync(base).filter((d) => /ffmpeg/i.test(d)).map((d) => path.join(base, d));
  while (stack.length) {
    const cur = stack.pop();
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (/^ffmpeg\.exe$/i.test(e.name)) return full;
    }
  }
  return null;
}
const FFMPEG = findFfmpeg();

function probeSeconds(file) {
  if (!FFMPEG) return null;
  try { execFileSync(FFMPEG, ['-i', file], { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) {
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(e.stderr?.toString() ?? '');
    if (m) return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
  }
  return null;
}

// 一般集數用 shots 算片長；預告片用 cuts + 片名卡。
const need = doc.shots
  ? doc.shots.reduce((a, s) => a + s.duration, 0) + (doc.timeline?.hold_last_frame ?? 0)
  : Math.max(...doc.cuts.map((c) => c.at + (c.out - c.in))) + (doc.end_card?.duration ?? 0);
console.log(`${MODEL}｜需要 ${need} 秒`);

for (let i = 1; i <= takes; i++) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': env.GOOGLE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['AUDIO'] },
      }),
    },
  );
  const body = await res.text();
  if (!res.ok) { console.error(`HTTP ${res.status}\n${body.slice(0, 600)}`); process.exit(1); }
  const json = JSON.parse(body);

  if (json.promptFeedback?.blockReason) {
    console.error(`被擋：${json.promptFeedback.blockReason}`);
    console.error('Lyria 會擋指名藝術家的風格模仿。把人名換成編制／節拍／動態／和聲的描述。');
    process.exit(1);
  }

  let saved = null;
  for (const part of json.candidates?.[0]?.content?.parts ?? []) {
    const d = part.inlineData ?? part.inline_data;
    const mime = d?.mimeType ?? d?.mime_type ?? '';
    if (!d?.data || !/^audio\//.test(mime)) continue;
    const ext = /mpeg|mp3/.test(mime) ? '.mp3' : /wav/.test(mime) ? '.wav' : '.bin';
    const file = path.join(outDir, takes > 1 ? `bgm_take${i}${ext}` : `bgm${ext}`);
    fs.writeFileSync(file, Buffer.from(d.data, 'base64'));
    const secs = probeSeconds(file);
    console.log(`✓ ${path.basename(file)}  ${(fs.statSync(file).size / 1024 / 1024).toFixed(2)} MB  ${secs ? secs.toFixed(1) + 's' : '?'}  ${mime}`);
    if (secs && secs < need) console.log(`⚠ 比片長短 ${(need - secs).toFixed(1)}s——合成時會循環或留白`);
    saved = file;
    break;
  }
  if (!saved) { console.error('回應裡沒有音訊'); process.exit(1); }
}

if (!doc.bgm_prompt) {
  doc.bgm_prompt = prompt;
  fs.writeFileSync(shotsPath, JSON.stringify(doc, null, 2) + '\n');
  console.log('已把 bgm_prompt 寫回 shots.json');
}
