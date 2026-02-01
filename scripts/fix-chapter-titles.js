#!/usr/bin/env node
/**
 * Fix chapter titles - extract from H1 heading and update frontmatter
 *
 * This script:
 * 1. Reads the first H1 heading from each chapter
 * 2. Updates the frontmatter title field
 * 3. Optionally removes the H1 from content (to avoid duplication)
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const PROJECTS_DIR = './projects';

/**
 * Extract title from first H1 heading
 */
function extractH1Title(content) {
  // Match first H1: # Title or # Chapter X: Title
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    let title = h1Match[1].trim();

    // Clean up common patterns
    // "Chapter 0: 前奏：火藥桶 (Prologue: The Tinderbox)" -> "前奏：火藥桶 (Prologue: The Tinderbox)"
    // "第一章-B：棋盤 (The Chessboard)" -> keep as is

    // Remove "Chapter X:" prefix
    title = title.replace(/^Chapter\s+\d+:\s*/i, '');

    return title;
  }
  return null;
}

/**
 * Parse frontmatter
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    const frontmatter = {};
    match[1].split('\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        frontmatter[key] = value;
      }
    });
    return { frontmatter, body: match[2].trim(), hasFrontmatter: true };
  }
  return { frontmatter: {}, body: content.trim(), hasFrontmatter: false };
}

/**
 * Build frontmatter string
 */
function buildFrontmatter(obj) {
  const lines = Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'number') return `${key}: ${value}`;
    // Escape quotes in value
    const escaped = String(value).replace(/"/g, '\\"');
    return `${key}: "${escaped}"`;
  });
  return `---\n${lines.join('\n')}\n---`;
}

/**
 * Get chapter order from filename
 */
function getChapterOrder(filename) {
  const match = filename.match(/Chap_(\d+)(?:-([A-Z]))?/);
  if (!match) return 999;
  const mainNum = parseInt(match[1], 10);
  const subNum = match[2] ? match[2].charCodeAt(0) - 64 : 0;
  return mainNum * 10 + subNum;
}

async function main() {
  const novelName = process.argv[2] || '2028ww3';
  const chaptersDir = join(PROJECTS_DIR, novelName, 'chapters');

  const files = await readdir(chaptersDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  console.log(`Fixing titles for ${mdFiles.length} chapters...`);

  let fixedCount = 0;
  for (const file of mdFiles) {
    const filePath = join(chaptersDir, file);
    const content = await readFile(filePath, 'utf-8');

    const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);
    const h1Title = extractH1Title(body);

    if (!h1Title) {
      console.log(`  ⚠ No H1 found: ${file}`);
      continue;
    }

    // Check if title needs updating
    if (frontmatter.title === h1Title) {
      continue; // Already correct
    }

    // Update frontmatter
    const newFrontmatter = {
      title: h1Title,
      order: getChapterOrder(file),
    };

    // Preserve cover fields
    if (frontmatter.cover) newFrontmatter.cover = frontmatter.cover;
    if (frontmatter.cover_url) newFrontmatter.cover_url = frontmatter.cover_url;
    if (frontmatter.cover_media_id) newFrontmatter.cover_media_id = frontmatter.cover_media_id;

    // Remove the H1 from body to avoid duplication (title shows in layout)
    const bodyWithoutH1 = body.replace(/^#\s+.+\n+/, '').trim();

    const newContent = `${buildFrontmatter(newFrontmatter)}\n\n${bodyWithoutH1}`;
    await writeFile(filePath, newContent);

    console.log(`  ✓ ${file}`);
    console.log(`    → ${h1Title}`);
    fixedCount++;
  }

  console.log(`\nDone! Fixed ${fixedCount} chapter titles.`);
}

main().catch(console.error);
