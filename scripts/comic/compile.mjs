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
const promptDir = path.join(ctx.outDir, 'prompts');
fs.mkdirSync(promptDir, { recursive: true });

const rel = (p) => path.relative(ROOT, p);
const cmds = [];
for (const p of ctx.doc.panels) {
  if (only && p.id !== only) continue;
  const { prompt, refs, missingRefs } = compilePanel(ctx, p);
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
const sh = path.join(ctx.outDir, 'gen.sh');
fs.writeFileSync(sh, '#!/bin/sh\n# 由 compile.mjs 產生。建議一次跑一行，看過再往下。\nset -e\n' +
  cmds.map((c) => c.map((x) => (/[\s"']/.test(x) ? JSON.stringify(x) : x)).join(' ')).join('\n') + '\n');
console.log(`\n出圖指令 → ${rel(sh)}`);
