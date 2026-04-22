#!/usr/bin/env node
/**
 * Chapter Statistics Tool
 *
 * On-demand word count analysis for all novels or a single novel.
 * Supports multiple counting modes and output formats.
 *
 * Usage:
 *   node scripts/chapter-stats.mjs                      # All novels, pure CJK count
 *   node scripts/chapter-stats.mjs --novel=2040Iris     # Single novel
 *   node scripts/chapter-stats.mjs --verbose            # Per-chapter breakdown
 *   node scripts/chapter-stats.mjs --mode=full          # Include punctuation & ASCII
 *   node scripts/chapter-stats.mjs --mode=raw           # wc -m equivalent
 *   node scripts/chapter-stats.mjs --json               # JSON output
 *   node scripts/chapter-stats.mjs --json > stats.json
 *
 * Counting modes:
 *   pure (default)  — only CJK unified ideographs (中文字)
 *   full            — visible characters (CJK + ASCII + punct, excludes markdown/whitespace)
 *   raw             — all chars including whitespace (wc -m equivalent)
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const CONFIG_PATH = join(PROJECT_ROOT, 'novels.config.json');
const PROJECTS_DIR = join(PROJECT_ROOT, 'projects');

// --- CLI arg parsing ---
const args = process.argv.slice(2);
const opts = {
  novel: null,
  mode: 'pure',
  verbose: false,
  json: false,
  help: false,
};
for (const a of args) {
  if (a === '-h' || a === '--help') opts.help = true;
  else if (a === '-v' || a === '--verbose') opts.verbose = true;
  else if (a === '--json') opts.json = true;
  else if (a.startsWith('--novel=')) opts.novel = a.slice(8);
  else if (a.startsWith('--mode=')) opts.mode = a.slice(7);
  else {
    console.error(`unknown arg: ${a}`);
    process.exit(1);
  }
}

if (!['pure', 'full', 'raw'].includes(opts.mode)) {
  console.error(`invalid --mode: ${opts.mode} (expected pure|full|raw)`);
  process.exit(1);
}

if (opts.help) {
  console.log(`
Chapter Statistics Tool

Usage: node scripts/chapter-stats.mjs [options]

Options:
  --novel=<slug>     Filter to one novel by slug (e.g. 2040Iris)
  --mode=<mode>      Counting mode: pure | full | raw (default: pure)
                       pure — only Chinese characters
                       full — visible chars excluding markdown/whitespace
                       raw  — every character including whitespace
  --verbose, -v      Per-chapter breakdown
  --json             Emit JSON to stdout
  --help, -h         Show this help
`);
  process.exit(0);
}

// --- Counting functions ---
function stripMarkdownAndFrontmatter(text) {
  return text
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')        // fenced code
    .replace(/`[^`\n]+`/g, '')             // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')  // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> keep text
    .replace(/^#+\s+/gm, '')               // headers
    .replace(/\*\*|__/g, '')               // bold markers
    .replace(/(^|\s)[*_]([^*_\n]+)[*_](\s|$)/g, '$1$2$3') // italic markers
    .replace(/^>\s?/gm, '')                // blockquote markers
    .replace(/^\s*[-*+]\s+/gm, '');        // list markers
}

function countPure(text) {
  const body = stripMarkdownAndFrontmatter(text);
  const m = body.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  return m ? m.length : 0;
}

function countFull(text) {
  const body = stripMarkdownAndFrontmatter(text);
  // Count visible characters: drop whitespace only
  return body.replace(/\s+/g, '').length;
}

function countRaw(text) {
  // Remove just frontmatter; count every char
  return text.replace(/^---[\s\S]*?---/, '').length;
}

const counters = { pure: countPure, full: countFull, raw: countRaw };
const counter = counters[opts.mode];

// --- Analysis ---
const config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
let novelsToAnalyze = config.novels;
if (opts.novel) {
  novelsToAnalyze = novelsToAnalyze.filter(n => n.slug === opts.novel);
  if (!novelsToAnalyze.length) {
    console.error(`novel not found: ${opts.novel}`);
    console.error(`available: ${config.novels.map(n => n.slug).join(', ')}`);
    process.exit(1);
  }
}

const report = {
  mode: opts.mode,
  generatedAt: new Date().toISOString(),
  novels: {},
  grandTotal: { chapters: 0, words: 0 },
};

for (const novel of novelsToAnalyze) {
  const chaptersDir = join(PROJECTS_DIR, novel.slug, 'chapters');
  if (!existsSync(chaptersDir)) continue;

  const files = (await readdir(chaptersDir)).filter(f => f.endsWith('.md')).sort();
  const breakdown = [];
  let total = 0;
  for (const f of files) {
    const content = await readFile(join(chaptersDir, f), 'utf-8');
    const count = counter(content);
    breakdown.push({ file: f.replace(/\.md$/, ''), count });
    total += count;
  }
  const sorted = [...breakdown].sort((a, b) => b.count - a.count);

  report.novels[novel.slug] = {
    title: novel.title,
    titleEn: novel.titleEn,
    slug: novel.slug,
    chapters: breakdown.length,
    total,
    averagePerChapter: breakdown.length ? Math.round(total / breakdown.length) : 0,
    longest: sorted[0] || null,
    shortest: sorted.length > 1 ? sorted[sorted.length - 1] : null,
    breakdown,
  };

  report.grandTotal.chapters += breakdown.length;
  report.grandTotal.words += total;
}

report.grandTotal.formatted = formatWordCount(report.grandTotal.words);

function formatWordCount(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')} 萬字`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} 千字`;
  return `${n} 字`;
}

// --- Output ---
if (opts.json) {
  // Strip breakdown from JSON unless verbose (keeps file small by default)
  const out = JSON.parse(JSON.stringify(report));
  if (!opts.verbose) {
    for (const slug in out.novels) delete out.novels[slug].breakdown;
  }
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

// --- Table output ---
const modeLabel = {
  pure: '純漢字計數',
  full: '可見字元（含標點/英數·排除 markdown/空白）',
  raw:  '全字元（含空白·排除 frontmatter）',
}[opts.mode];

console.log(`\n章節字數統計  [mode: ${opts.mode} — ${modeLabel}]`);
console.log('='.repeat(60));

for (const slug in report.novels) {
  const n = report.novels[slug];
  console.log(`\n《${n.title}》 ${n.titleEn ? `(${n.titleEn})` : ''}`);
  console.log(`  總計    ${n.total.toLocaleString()} 字  (${formatWordCount(n.total)})`);
  console.log(`  章數    ${n.chapters}  ·  平均 ${n.averagePerChapter.toLocaleString()} 字/章`);
  if (n.longest)  console.log(`  最長章  ${n.longest.file}  —  ${n.longest.count.toLocaleString()}`);
  if (n.shortest) console.log(`  最短章  ${n.shortest.file}  —  ${n.shortest.count.toLocaleString()}`);

  if (opts.verbose) {
    console.log(`\n  逐章明細:`);
    const maxW = Math.max(...n.breakdown.map(b => b.file.length));
    for (const b of n.breakdown) {
      console.log(`    ${b.file.padEnd(maxW)}   ${b.count.toLocaleString().padStart(8)}`);
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log(`總計  ${report.grandTotal.chapters} 章  ·  ${report.grandTotal.words.toLocaleString()} 字  ·  ${report.grandTotal.formatted}`);
console.log();
