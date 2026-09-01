#!/usr/bin/env node
/**
 * gen-vo.mjs — 依 shots.json 的 vo_track 產生旁白（Gemini TTS），
 * 並把實測長度與重算的時間軸寫回 shots.json。
 *
 *   node scripts/video/gen-vo.mjs --shots projects/HalfFinished/_dev/media/ep01/02_shots.json
 *   node scripts/video/gen-vo.mjs --shots <file> --voice Leda --pace normal
 *   node scripts/video/gen-vo.mjs --shots <file> --only v03 --dry-timeline
 *
 * 產出 _output/video/{novel}/{episode}/audio/vo_{id}.wav（不進版本庫）。
 *
 * 為什麼要先錄旁白：鏡頭長度要照實際音檔定，不是照「中文幾字幾秒」猜。
 * 實測過的語速差異很大——同一句 31 字，加了「語速偏慢」是 13.2 秒，
 * 什麼都不加是 8.2 秒。所以錄完一定重排時間軸。
 *
 * Gemini TTS 回的是裸 PCM（audio/L16, 24kHz, mono），要自己包 WAV 檔頭。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/))
    .filter(Boolean).map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, '')]),
);

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const has = (n) => args.includes(`--${n}`);

const shotsPath = flag('shots');
if (!shotsPath) { console.error('要 --shots <02_shots.json>'); process.exit(1); }
const doc = JSON.parse(fs.readFileSync(shotsPath, 'utf8'));

// vo_track 是新結構；舊檔把旁白掛在 shot.vo 上，這裡一併吃
let track = doc.vo_track;
if (!track) {
  track = doc.shots.filter((s) => s.vo?.text)
    .map((s, i) => ({ id: 'v' + String(i + 1).padStart(2, '0'), speaker: s.vo.speaker, text: s.vo.text }));
}
if (!track.length) { console.error('找不到旁白（vo_track 或 shot.vo 都是空的）'); process.exit(1); }

const MODEL = flag('model', 'gemini-3.1-flash-tts-preview');
const VOICE = flag('voice', doc.vo_voice || 'Leda');
const PACE = flag('pace', doc.vo_pace || 'normal');
// 語氣指示會大幅改變長度，所以做成有限選項而不是自由文字
const STYLE = {
  slow: '以平穩、克制、不帶情緒起伏的語氣，語速偏慢，句號處確實停頓地說：',
  restrained: '以平穩、克制、不帶情緒起伏的語氣說：',
  normal: '',
}[PACE] ?? PACE;

const only = flag('only')?.split(',').map((s) => s.trim());
const outDir = path.join(ROOT, '_output', 'video', doc.novel, doc.episode, 'audio');
fs.mkdirSync(outDir, { recursive: true });

/** 裸 PCM → WAV。Gemini 回 audio/L16;codec=pcm;rate=24000，mono 16-bit。 */
function wav(pcm, rate = 24000, channels = 1, bits = 16) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * channels * bits / 8, 28); h.writeUInt16LE(channels * bits / 8, 32);
  h.writeUInt16LE(bits, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function speak(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': env.GOOGLE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: STYLE + text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      }),
    },
  );
  const body = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}\n${body.slice(0, 600)}`);
  const json = JSON.parse(body);
  for (const part of json.candidates?.[0]?.content?.parts ?? []) {
    const d = part.inlineData ?? part.inline_data;
    const mime = d?.mimeType ?? d?.mime_type ?? '';
    if (d?.data && /^audio\//.test(mime)) {
      return { pcm: Buffer.from(d.data, 'base64'), rate: Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000) };
    }
  }
  throw new Error('回應裡沒有音訊：' + JSON.stringify(json).slice(0, 400));
}

console.log(`${MODEL}｜聲音 ${VOICE}｜語速 ${PACE}`);

for (const v of track) {
  if (only && !only.includes(v.id)) continue;
  const { pcm, rate } = await speak(v.text);
  const secs = pcm.length / (rate * 2);
  fs.writeFileSync(path.join(outDir, `vo_${v.id}.wav`), wav(pcm, rate));
  v.duration = +secs.toFixed(2);
  console.log(`✓ vo_${v.id}.wav  ${secs.toFixed(1)}s  ${v.text.length} 字  ${(v.text.length / secs).toFixed(2)} 字/秒`);
}

// --- 時間軸 ---
// 預設是依序排：起點由前一句的長度 + 留白推出來。
// 但預告片那種每句都釘在固定秒數的用法要 --keep-starts，不要覆寫 start。
const lead = doc.timeline?.lead_in ?? 2.0;
let t = lead;
if (has('keep-starts')) {
  t = Math.max(...track.map((v) => (v.start ?? 0) + (v.duration ?? 0)));
} else {
  for (const v of track) {
    v.start = +t.toFixed(2);
    t += (v.duration ?? 0) + (v.gap_after ?? 1.3);
  }
}

doc.vo_track = track;
doc.vo_voice = VOICE;
doc.vo_pace = PACE;
doc.timeline = { ...(doc.timeline ?? {}), lead_in: lead, vo_ends_at: +t.toFixed(1) };

// 一般集數用 shots 算畫面長度；預告片用的是 cuts + 片名卡。
const visual = doc.shots
  ? doc.shots.reduce((a, s) => a + s.duration, 0) + (doc.timeline.hold_last_frame ?? 0)
  : (doc.cuts
      ? Math.max(...doc.cuts.map((c) => c.at + (c.out - c.in))) + (doc.end_card?.duration ?? 0)
      : 0);
const chars = track.reduce((a, v) => a + v.text.length, 0);
const spoken = track.reduce((a, v) => a + (v.duration ?? 0), 0);

console.log('\n句    起點    長度   字數  字/秒');
for (const v of track) {
  console.log(`${v.id}  ${String(v.start).padStart(6)}s ${String(v.duration).padStart(6)}s ${String(v.text.length).padStart(5)}  ${(v.text.length / v.duration).toFixed(2)}`);
}
console.log(`\n旁白 ${spoken.toFixed(1)}s／${chars} 字／平均 ${(chars / spoken).toFixed(2)} 字/秒`);
console.log(`時間軸：旁白結束於 ${doc.timeline.vo_ends_at}s｜畫面軌 ${visual}s`);
if (doc.timeline.vo_ends_at > visual) {
  console.log(`⚠ 旁白比畫面長 ${(doc.timeline.vo_ends_at - visual).toFixed(1)}s——要加鏡或加長鏡`);
}

if (!has('dry-timeline')) {
  fs.writeFileSync(shotsPath, JSON.stringify(doc, null, 2) + '\n');
  console.log(`已把實測長度與時間軸寫回 ${path.basename(shotsPath)}`);
}
