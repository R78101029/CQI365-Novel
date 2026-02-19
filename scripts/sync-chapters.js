#!/usr/bin/env node
/**
 * Sync chapters and assets from projects/ to site/
 *
 * Usage: node scripts/sync-chapters.js [novel-name]
 * Example: node scripts/sync-chapters.js 2028ww3
 *
 * This script:
 * - Syncs chapters to site/src/content/novels/{novel}/
 * - Syncs assets to site/public/assets/{novel}/
 */

import { readdir, readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Basic paths relative to the script's likely execution contexts
const PROJECTS_DIR = existsSync('./projects') ? './projects' : '../projects';
const CONTENT_DIR = existsSync('./site') ? './site/src/content/novels' : './src/content/novels';
const PUBLIC_ASSETS_DIR = existsSync('./site') ? './site/public/assets' : './public/assets';

// Chapter order mapping based on file naming convention
function getChapterOrder(filename) {
  // Support: Book1_Chap01, Chap_01, 01_Title
  const match = filename.match(/(?:Book\d+_)?(?:Chap|chapter)_?0*(\d+)/i) || filename.match(/^0*(\d+)/);
  if (!match) return 999;

  let num = parseInt(match[1], 10);
  
  // If filename implies Book 1, keep it 100-range? 
  // Actually, simpler to defer to frontmatter if it exists.
  // But as a fallback:
  if (filename.startsWith('Book2')) num += 200; // Rough heuristic
  else if (filename.startsWith('Book3')) num += 300;
  
  return num * 10; 
}

// Extract frontmatter from markdown
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    return {
      frontmatter: match[1],
      body: content.slice(match[0].length).trim()
    };
  }
  return { frontmatter: null, body: content };
}

// Parse existing YAML frontmatter into object
function parseYamlFrontmatter(frontmatterStr) {
  if (!frontmatterStr) return {};
  const obj = {};
  frontmatterStr.split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      obj[key] = value;
    }
  });
  return obj;
}

// Convert relative asset paths to absolute public paths
function convertAssetPaths(content, novelName) {
  // Convert Markdown format: (../_assets/...) to (/assets/{novelName}/...)
  let result = content.replace(
    /\(\.\.?\/_assets\/(.*?)\)/g,
    (match, path) => `(/assets/${novelName}/${path})`
  );

  // Convert HTML img format: src="../_assets/..." to src="/assets/{novelName}/..."
  result = result.replace(
    /src="\.\.?\/_assets\/(.*?)"/g,
    (match, path) => `src="/assets/${novelName}/${path}"`
  );

  return result;
}

// Generate frontmatter for chapter, preserving existing fields
function generateFrontmatter(filename, existingFrontmatter) {
  const existing = parseYamlFrontmatter(existingFrontmatter);
  
  // Use existing order if present (set by apply-titles.js), otherwise guess
  const order = existing.order ? parseInt(existing.order, 10) : getChapterOrder(filename);

  // Extract title from filename (use existing if available)
  // Support Book1_Chap01_Optimization.md
  const titleMatch = filename.match(/(?:Book\d+_)?(?:Chap|chapter)_\d+(?:-[A-Z])?_[^_]+_(.+)\.md$/i);
  const defaultTitle = titleMatch
    ? titleMatch[1].replace(/_/g, ' ')
    : filename.replace('.md', '');

  // Build frontmatter
  const fields = {
    title: existing.title || defaultTitle,
    order: order,
  };

  // Preserve other fields (cover, formatting, etc)
  for (const [key, value] of Object.entries(existing)) {
    if (key !== 'title' && key !== 'order') {
        fields[key] = value;
    }
  }

  // Build YAML string
  const lines = Object.entries(fields).map(([key, value]) => {
    if (typeof value === 'number') return `${key}: ${value}`;
    return `${key}: "${value}"`;
  });

  return `---\n${lines.join('\n')}\n---`;
}

async function syncNovel(novelName) {
  const projectDir = join(PROJECTS_DIR, novelName, 'chapters');
  const contentDir = join(CONTENT_DIR, novelName);

  if (!existsSync(projectDir)) {
    console.error(`Project not found: ${projectDir}`);
    process.exit(1);
  }

  // Ensure content directory exists
  await mkdir(contentDir, { recursive: true });

  // Get all markdown files
  const files = await readdir(projectDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  console.log(`Syncing ${mdFiles.length} chapters from ${novelName}...`);

  for (const file of mdFiles) {
    const srcPath = join(projectDir, file);
    const destPath = join(contentDir, file);

    const content = await readFile(srcPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    // Add or update frontmatter
    const newFrontmatter = generateFrontmatter(file, frontmatter);

    // Convert relative asset paths to absolute public paths
    const convertedBody = convertAssetPaths(body, novelName);
    const newContent = `${newFrontmatter}\n\n${convertedBody}`;

    await writeFile(destPath, newContent);
    console.log(`  ✓ ${file}`);
  }

  console.log(`Done! ${mdFiles.length} chapters synced.`);
}

/**
 * Sync assets from project _assets to public folder
 */
async function syncAssets(novelName) {
  const assetsDir = join(PROJECTS_DIR, novelName, '_assets');
  const publicDir = join(PUBLIC_ASSETS_DIR, novelName);

  if (!existsSync(assetsDir)) {
    console.log(`\nNo _assets directory for ${novelName}, skipping assets sync.`);
    return;
  }

  // Ensure public assets directory exists
  await mkdir(publicDir, { recursive: true });

  // Supported image extensions
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  async function copyDir(src, dest) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });

    let count = 0;
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        count += await copyDir(srcPath, destPath);
      } else if (imageExts.some(ext => entry.name.toLowerCase().endsWith(ext))) {
        await copyFile(srcPath, destPath);
        console.log(`  ✓ ${entry.name}`);
        count++;
      }
    }
    return count;
  }

  console.log(`\nSyncing assets for ${novelName}...`);
  const assetCount = await copyDir(assetsDir, publicDir);
  console.log(`Done! ${assetCount} assets synced.`);
}

// Main
async function main() {
  let novelName = process.argv[2];
  
  if (!novelName) {
    // Try to auto-detect from projects folder
    const projects = (await readdir(PROJECTS_DIR, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (projects.length === 1) {
      novelName = projects[0];
      console.log(`Auto-detected project: ${novelName}`);
    } else if (projects.includes('BlindOrbit')) {
      novelName = 'BlindOrbit';
    } else {
      novelName = '2028ww3'; // Legacy default
    }
  }

  await syncNovel(novelName);
  await syncAssets(novelName);

  console.log('\nAll done!');
}

main().catch(console.error);
