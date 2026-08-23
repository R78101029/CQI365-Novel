#!/usr/bin/env node
/**
 * fal 模型 schema 查詢 — 取代 fal MCP 的 schema lookup。
 *
 *   node scripts/video/fal-schema.mjs bytedance/seedance-2.5/image-to-video
 *   node scripts/video/fal-schema.mjs fal-ai/minimax/hailuo-h3/image-to-video --raw
 *
 * 寫任何 adapter 前先跑這個確認參數名稱。各家差異很大，不要照抄別的模型。
 * 不需要 FAL_KEY（schema 是公開的）。
 */
const endpoint = process.argv[2];
const raw = process.argv.includes('--raw');

if (!endpoint) {
  console.error('用法: node scripts/video/fal-schema.mjs <endpoint_id> [--raw]');
  console.error('找 endpoint: https://fal.ai/models  或 https://fal.ai/models/{endpoint}/llms.txt');
  process.exit(1);
}

const url = `https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=${endpoint}`;
const res = await fetch(url);
if (!res.ok) {
  console.error(`查不到 ${endpoint}（HTTP ${res.status}）。endpoint 拼錯了？`);
  process.exit(1);
}
const spec = await res.json();

if (raw) {
  console.log(JSON.stringify(spec, null, 2));
  process.exit(0);
}

const schemas = spec.components?.schemas ?? {};
const fmt = (v) => {
  const bits = [v.type ?? (v.anyOf ? 'anyOf' : '?')];
  if (v.enum) bits.push(`enum=${JSON.stringify(v.enum)}`);
  if (v.default !== undefined) bits.push(`default=${JSON.stringify(v.default)}`);
  return bits.join(' ');
};

console.log(`# ${endpoint}\n`);
for (const [name, s] of Object.entries(schemas)) {
  if (!/Input$|Output$/.test(name)) continue;
  const required = new Set(s.required ?? []);
  console.log(`## ${name}`);
  for (const [prop, v] of Object.entries(s.properties ?? {})) {
    console.log(`  ${required.has(prop) ? '*' : ' '} ${prop}: ${fmt(v)}`);
    if (v.description) console.log(`      ${v.description.replace(/\s+/g, ' ').slice(0, 140)}`);
  }
  console.log('');
}
console.log(`必填標 *。完整 spec: ${url}`);
console.log(`LLM 版文件: https://fal.ai/models/${endpoint}/llms.txt`);
