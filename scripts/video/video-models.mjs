#!/usr/bin/env node
/**
 * OpenRouter 影片模型能力與成本查詢。
 *
 *   node scripts/video/video-models.mjs                        # 全部，附 9:16 每鏡成本估算
 *   node scripts/video/video-models.mjs bytedance/seedance-2.5 # 單一模型完整能力
 *   node scripts/video/video-models.mjs --i2v                  # 只列支援首幀的（本管線唯一能用的）
 *   node scripts/video/video-models.mjs --sec 8 --res 480p     # 換算條件
 *
 * 資料來源 GET /api/v1/videos/models（公開，不需 key）。
 * 送任何生成請求前先跑這個：duration / resolution / aspect_ratio 都是逐模型限定，
 * 送不在集合裡的值會 400。
 */
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const SEC = Number(flag('--sec', 10));
const RES = flag('--res', '720p');
const onlyI2V = args.includes('--i2v');
const target = args.find((a) => !a.startsWith('--') && a !== String(SEC) && a !== RES);

const FPS = 24;
const SIZE_9_16 = { '480p': [480, 854], '720p': [720, 1280], '1080p': [1080, 1920] };

const res = await fetch('https://openrouter.ai/api/v1/videos/models');
if (!res.ok) { console.error(`HTTP ${res.status}`); process.exit(1); }
const models = (await res.json()).data ?? [];

/** 這個模型實際會用的秒數（就近取 supported_durations，避免用不支援的值估價）。 */
function effSeconds(m) {
  const d = m.supported_durations ?? [];
  if (!d.length) return SEC;
  return d.reduce((a, b) => (Math.abs(b - SEC) < Math.abs(a - SEC) ? b : a));
}

/** 估算 9:16、無音訊、effSeconds 秒的一鏡成本（USD）。回 null 表示 sku 格式不認得。 */
function estimate(m) {
  const sku = m.pricing_skus ?? {};
  const n = (k) => (sku[k] === undefined ? null : Number(sku[k]));
  const [w, h] = SIZE_9_16[RES] ?? [];
  const sec = effSeconds(m);

  // 1) token 計價（Seedance 系）：tokens = (W×H×秒×fps)/1024
  const tokRate = n(`video_tokens_without_audio_${RES}`) ?? n(`video_tokens_${RES}`)
               ?? n('video_tokens_without_audio') ?? n('video_tokens');
  if (tokRate && w) return { usd: (w * h * sec * FPS) / 1024 * tokRate, sec, basis: 'token 公式推估' };

  // 2) 每秒美元計價
  for (const k of [
    `image_to_video_duration_seconds_${RES}`,
    `duration_seconds_without_audio_${RES}`,
    `duration_seconds_${RES}`,
    'duration_seconds_without_audio',
    'duration_seconds',
  ]) { const v = n(k); if (v) return { usd: v * sec, sec, basis: '每秒計價' }; }

  // 3) 每秒美分計價
  for (const k of [
    `cents_per_video_output_second_${RES}`,
    `cents_per_second_output_${RES}`,
    'cents_per_video_output_second',
    'cents_per_second_output',
  ]) { const v = n(k); if (v) return { usd: v / 100 * sec, sec, basis: '每秒計價（分）' }; }

  return null;
}

const fmt = (n) => (n === null ? '   —  ' : ('$' + n.toFixed(2)).padStart(6));

if (target) {
  const m = models.find((x) => x.id === target);
  if (!m) { console.error(`查無 ${target}`); process.exit(1); }
  console.log(JSON.stringify(m, null, 2));
  const e = estimate(m);
  if (e) console.log(`\n// 9:16 ${RES} ${SEC}s 一鏡估 ${fmt(e.usd)}（${e.basis}）`);
  process.exit(0);
}

const rows = models
  .filter((m) => !onlyI2V || (m.supported_frame_images ?? []).includes('first_frame'))
  .map((m) => ({ m, e: estimate(m) }))
  .sort((a, b) => (a.e?.usd ?? 1e9) - (b.e?.usd ?? 1e9));

console.log(`# OpenRouter 影片模型｜估算條件：9:16 ${RES} ${SEC} 秒 無音訊\n`);
console.log('成本    秒   模型                                 解析度            首/尾幀   可用時長');
console.log('-'.repeat(100));
for (const { m, e } of rows) {
  const fi = (m.supported_frame_images ?? []);
  const frames = (fi.includes('first_frame') ? '首' : '·') + (fi.includes('last_frame') ? '尾' : '·');
  const dur = (m.supported_durations ?? []);
  const durStr = dur.length ? `${Math.min(...dur)}–${Math.max(...dur)}s` : '—';
  console.log(
    fmt(e?.usd ?? null) + '  ' +
    String(e?.sec ?? '—').padStart(2) + 's  ' +
    m.id.padEnd(36) + ' ' +
    (m.supported_resolutions ?? []).join('/').padEnd(17) + ' ' +
    frames.padEnd(8) + ' ' + durStr
  );
}
console.log('\n首=支援首幀（本管線必需）尾=支援尾幀（首尾幀模式）。');
console.log('「秒」= 就近取該模型 supported_durations 的值，不一定等於你要的長度。');
console.log('成本為推估：token 計價套 (W×H×秒×24)/1024 公式，實跑一鏡後用回傳的 usage 校正。');
