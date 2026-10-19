#!/usr/bin/env node
/**
 * compile.mjs — 把 02_strip.json 編譯成每格的 prompt 檔與出圖指令。
 *
 *   node scripts/comic/compile.mjs --strip <02_strip.json>              # 全部格
 *   node scripts/comic/compile.mjs --strip <02_strip.json> --panel p04  # 單格
 *   ... --run [--model draft|pro]                                       # 直接呼叫 gen-frame.mjs 出圖
 *
 * 產出 _output/comic/{novel}/{ep}/prompts/{id}.txt 與 gen.sh。
 * 不加 --run 就只寫檔，不花錢。出圖一律一格一格看，不要一次全開。
 *
 *   ... --target gamma   產 Gamma generate_image 用的 prompt + gamma.json（參考圖 URL、尺寸預設）。
 *                        Gamma 走 MCP，由 Claude 逐格呼叫，腳本不直接打。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, loadStrip, compilePanel } from './lib.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const ctx = loadStrip(flag('strip'));
const only = flag('panel');
const model = flag('model', 'draft');
const target = flag('target', 'gemini');
const promptDir = path.join(ctx.outDir, target === 'gamma' ? 'prompts_gamma' : 'prompts');
// Gamma 只有這幾種畫幅；4:5 以外的直式一律退到最接近的
const GAMMA_SIZE = { '1:1': 'social-square', '4:5': 'social-portrait', '3:4': 'social-portrait', '9:16': 'story', '16:9': 'banner', '21:9': 'banner' };
const gammaJobs = [];
fs.mkdirSync(promptDir, { recursive: true });

const rel = (p) => path.relative(ROOT, p);
const cmds = [];
for (const p of ctx.doc.panels) {
  if (only && p.id !== only) continue;
  const { prompt, refs, remoteRefs, missingRefs } = compilePanel(ctx, p, { target });
  if (target === 'gamma') {
    if (prompt.length > 5000) console.error(`${p.id} prompt ${prompt.length} 字元，超過 Gamma 上限 5000`);
    gammaJobs.push({ id: p.id, sizePreset: GAMMA_SIZE[p.aspect], referenceImages: remoteRefs, promptFile: path.relative(ROOT, path.join(promptDir, `${p.id}.txt`)) });
  }
  const pf = path.join(promptDir, `${p.id}.txt`);
  fs.writeFileSync(pf, prompt + '\n');
  const out = path.join(ctx.outDir, 'panels', `${p.id}.jpg`);
  const cmd = ['node', 'scripts/video/gen-frame.mjs', '--prompt-file', rel(pf), '--out', rel(out),
    '--aspect', p.aspect, '--model', model, ...refs.flatMap((r) => ['--ref', rel(r)])];
  cmds.push(cmd);
  console.log(`${p.id}  ${p.aspect.padEnd(5)} ref ${refs.length}${missingRefs.length ? `（未建 ${missingRefs.length}）` : ''}  → ${rel(pf)}`);
  if (args.includes('--run')) {
    const r = spawnSync(cmd[0], cmd.slice(1), { cwd: ROOT, stdio: 'inherit' });
    if (r.status !== 0) { console.error(`${p.id} 出圖失敗，停在這裡`); process.exit(1); }
  }
}
if (target === 'gamma') {
  fs.writeFileSync(path.join(ctx.outDir, 'gamma.json'), JSON.stringify(gammaJobs, null, 2));
  console.log(`\nGamma 工作清單 → ${rel(path.join(ctx.outDir, 'gamma.json'))}`);
  process.exit(0);
}
const sh = path.join(ctx.outDir, 'gen.sh');
fs.writeFileSync(sh, '#!/bin/sh\n# 由 compile.mjs 產生。建議一次跑一行，看過再往下。\nset -e\n' +
  cmds.map((c) => c.map((x) => (/[\s"']/.test(x) ? JSON.stringify(x) : x)).join(' ')).join('\n') + '\n');
console.log(`\n出圖指令 → ${rel(sh)}`);
