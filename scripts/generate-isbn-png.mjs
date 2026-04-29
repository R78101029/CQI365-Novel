#!/usr/bin/env node
/**
 * Generate ISBN submission PNGs (title page + copyright page) from HTML files.
 * Usage: node scripts/generate-isbn-png.mjs [slug1] [slug2] ...
 * If no slugs provided, generates for all projects that have the HTML files.
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const OUTPUT = join(ROOT, '_output', 'isbn_batch');

// A5 at 96dpi = 559 x 794
const VIEWPORT = { width: 559, height: 794 };

async function screenshotHTML(browser, htmlPath, outputPath) {
  if (!existsSync(htmlPath)) {
    console.log(`  ⏭  ${htmlPath} not found, skipping`);
    return false;
  }
  const page = await browser.newPage({ viewport: VIEWPORT });
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath, fullPage: false });
  await page.close();
  console.log(`  ✓  ${outputPath}`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);

  // If specific slugs provided, use those; otherwise scan for all
  let slugs = args.length > 0 ? args : null;

  if (!slugs) {
    const { readdirSync } = await import('fs');
    slugs = readdirSync(join(ROOT, 'projects')).filter(d => {
      return existsSync(join(ROOT, 'projects', d, '_meta', 'copyright_page.html'));
    });
  }

  mkdirSync(OUTPUT, { recursive: true });

  const browser = await chromium.launch();

  for (const slug of slugs) {
    console.log(`\n--- ${slug} ---`);
    const metaDir = join(ROOT, 'projects', slug, '_meta');

    // Title page
    await screenshotHTML(
      browser,
      join(metaDir, 'title_page.html'),
      join(OUTPUT, `title_${slug}.png`)
    );

    // Copyright page
    await screenshotHTML(
      browser,
      join(metaDir, 'copyright_page.html'),
      join(OUTPUT, `copyright_${slug}.png`)
    );

    // Set versions (if exist)
    await screenshotHTML(
      browser,
      join(metaDir, 'title_page_set.html'),
      join(OUTPUT, `title_${slug}_set.png`)
    );
    await screenshotHTML(
      browser,
      join(metaDir, 'copyright_page_set.html'),
      join(OUTPUT, `copyright_${slug}_set.png`)
    );
  }

  await browser.close();
  console.log('\nDone.');
}

main().catch(console.error);
