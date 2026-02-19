#!/usr/bin/env node
/**
 * Auto-insert images into chapters based on naming conventions
 *
 * Usage: node scripts/auto-insert-images.js [novel-name]
 *
 * Naming conventions for images in _assets/chapters/:
 *   1. Standard:  {book}.{chapter}-cover.jpg  (e.g., 1.00-cover.jpg → Book 1, Chap 00)
 *   2. Legacy:    ch{chapter}-cover.jpg       (e.g., ch01-cover.jpg → Any Book, Chap 01)
 *
 *   {book}.{chapter}-scene-{desc}.jpg
 *
 * Chapter matching:
 *   Book1_Chap00...  → matches 1.00 (preferred) or ch00 (legacy)
 *   Chap_01...       → matches ch01
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

const PROJECTS_DIR = './projects';

/**
 * Parse image filename to extract book number, chapter number and type
 */
function parseImageName(filename) {
  // Pattern 1: Book.Chapter (e.g. 1.00-cover.jpg)
  const bookMatch = filename.match(/^(\d+)\.(\d+)-(cover|scene)(?:-(.+))?\.(jpg|jpeg|png|gif|webp|svg)$/i);
  if (bookMatch) {
    return {
      bookNum: parseInt(bookMatch[1], 10),
      chapterNum: parseInt(bookMatch[2], 10),
      type: bookMatch[3].toLowerCase(),
      description: bookMatch[4] || '',
      filename: filename,
    };
  }

  // Pattern 2: Legacy chXX (e.g. ch01-cover.jpg)
  const legacyMatch = filename.match(/^ch(\d+)-(cover|scene)(?:-(.+))?\.(jpg|jpeg|png|gif|webp|svg)$/i);
  if (legacyMatch) {
    return {
      bookNum: null, // Any book
      chapterNum: parseInt(legacyMatch[1], 10),
      type: legacyMatch[2].toLowerCase(),
      description: legacyMatch[3] || '',
      filename: filename,
    };
  }

  return null;
}

/**
 * Parse chapter filename to extract book and chapter number
 */
function parseChapterFilename(filename) {
  // Match: Book1_Chap00... or Book_1_Chapter_00...
  const bookMatch = filename.match(/Book_?(\d+)_Chap(?:ter)?_?0*(\d+)/i);
  if (bookMatch) {
    return {
      bookNum: parseInt(bookMatch[1], 10),
      chapterNum: parseInt(bookMatch[2], 10)
    };
  }

  // Match legacy: Chap_01... or chapter_01... or 01_...
  const chapMatch = filename.match(/(?:Chap|chapter)_?0*(\d+)/i) || filename.match(/^0*(\d+)[._-]/);
  if (chapMatch) {
    return {
      bookNum: null,
      chapterNum: parseInt(chapMatch[1], 10)
    };
  }

  return null;
}

/**
 * Parse markdown frontmatter
 */
function parseMarkdown(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    const frontmatter = {};
    match[1].split(/\r?\n/).forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        frontmatter[key] = value;
      }
    });
    return { frontmatter, body: match[2].trim(), raw: match[1] };
  }
  return { frontmatter: {}, body: content.trim(), raw: '' };
}

/**
 * Rebuild frontmatter string
 */
function buildFrontmatter(frontmatter) {
  const lines = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: "${value}"`);
  return `---\n${lines.join('\n')}\n---`;
}

/**
 * Insert scene image into chapter body
 */
function insertSceneImage(body, imageRef) {
  // Find first paragraph break or after first heading
  const firstBreak = body.search(/\n\n/);
  if (firstBreak > 0) {
    return body.slice(0, firstBreak) + '\n\n' + imageRef + body.slice(firstBreak);
  }
  return imageRef + '\n\n' + body;
}

/**
 * Main function
 */
async function main() {
  const novelName = process.argv[2] || '2028ww3';
  const assetsDir = join(PROJECTS_DIR, novelName, '_assets', 'chapters');
  const chaptersDir = join(PROJECTS_DIR, novelName, 'chapters');

  if (!existsSync(assetsDir)) {
    console.log(`No assets directory: ${assetsDir}`);
    // Create if in placeholder mode, otherwise exit
    if (process.argv.includes('--placeholder')) {
         await import('fs/promises').then(fs => fs.mkdir(assetsDir, { recursive: true }));
    } else {
        return;
    }
  }

  if (!existsSync(chaptersDir)) {
    console.log(`No chapters directory: ${chaptersDir}`);
    return;
  }

  // Placeholder Mode
  const usePlaceholders = process.argv.includes('--placeholder');
  
  if (usePlaceholders) {
    console.log('📢 Placeholder Mode: Generating missing assets...');
    const PLACEHOLDER_JPG = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AP/Z',
      'base64'
    );

    // 1. Ensure Novel Cover exists
    const novelCoverPath = join(assetsDir, `${novelName}_cover.jpg`);
    if (!existsSync(novelCoverPath)) {
        await writeFile(novelCoverPath, PLACEHOLDER_JPG);
        console.log(`  + Created placeholder: ${novelName}_cover.jpg`);
    }

    // 2. Ensure Chapter Covers exist
    const chapters = (await readdir(chaptersDir)).filter(f => f.endsWith('.md'));
    for (const chapFile of chapters) {
        const info = parseChapterFilename(chapFile);
        if (info) {
            // Use Book.Chapter format if BookNum exists, otherwise chXX
            let coverName;
            if (info.bookNum !== null) {
                coverName = `${info.bookNum}.${info.chapterNum.toString().padStart(2, '0')}-cover.jpg`;
            } else {
                coverName = `ch${info.chapterNum.toString().padStart(2, '0')}-cover.jpg`;
            }
            
            const coverPath = join(assetsDir, coverName);
            if (!existsSync(coverPath)) {
                await writeFile(coverPath, PLACEHOLDER_JPG);
                console.log(`  + Created placeholder: ${coverName}`);
            }
        }
    }
    console.log('');
  }

  // Get all images
  const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  const imageFiles = (await readdir(assetsDir))
    .filter(f => imageRegex.test(f));

  if (imageFiles.length === 0) {
    console.log('No images found in assets directory.');
    return;
  }

  // Get all chapter files
  const chapterFiles = (await readdir(chaptersDir))
    .filter(f => f.endsWith('.md'));

  console.log(`Found ${imageFiles.length} images, ${chapterFiles.length} chapters`);
  console.log('');

  // Process each chapter
  let updatedCount = 0;
  for (const chapterFile of chapterFiles) {
    const chapInfo = parseChapterFilename(chapterFile);
    if (!chapInfo) continue;

    const chapterPath = join(chaptersDir, chapterFile);
    const content = await readFile(chapterPath, 'utf-8');
    const { frontmatter, body } = parseMarkdown(content);

    let newFrontmatter = { ...frontmatter };
    let newBody = body;
    let modified = false;

    // Find matching images
    const matchingImages = imageFiles.map(f => parseImageName(f)).filter(img => {
      if (!img) return false;
      if (img.chapterNum !== chapInfo.chapterNum) return false;
      
      // If image has bookNum, it MUST match chapter's bookNum
      if (img.bookNum !== null && chapInfo.bookNum !== null) {
        return img.bookNum === chapInfo.bookNum;
      }
      
      // If image has NO bookNum (legacy), it matches any book (or non-book chapters)
      if (img.bookNum === null) return true;

      // If chapter has NO bookNum but image DOES, do not match (strict)
      if (chapInfo.bookNum === null && img.bookNum !== null) return false;
      
      return true;
    });

    for (const image of matchingImages) {
        if (image.type === 'cover') {
            if (newFrontmatter.cover !== image.filename) {
                newFrontmatter.cover = image.filename;
                modified = true;
                console.log(`✓ ${chapterFile}: Set cover → ${image.filename}`);
            }
        } else if (image.type === 'scene') {
            if (!newBody.includes(image.filename)) {
                // Determine alt text
                const altText = image.description 
                    ? image.description.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : `Chapter ${chapInfo.chapterNum} Scene`;
                
                const imageRef = `<img src="../_assets/chapters/${image.filename}" alt="${altText}" style="max-width: 90%; height: auto; display: block; margin: 2rem auto;">`;
                newBody = insertSceneImage(newBody, imageRef);
                modified = true;
                console.log(`✓ ${chapterFile}: Insert scene → ${image.filename}`);
            }
        }
    }

    // 2. Process Novel Cover (at the end)
    const novelCoverFilename = `${novelName}_cover.jpg`;
    if (!newBody.includes(novelCoverFilename)) {
      const coverRef = `\n\n---\n\n<img src="../_assets/chapters/${novelCoverFilename}" alt="${novelName} Cover" style="max-width: 90%; height: auto; display: block; margin: 2rem auto;">`;
      newBody = newBody.trim() + coverRef;
      modified = true;
      console.log(`✓ ${chapterFile}: Added novel cover to end`);
    }

    if (modified) {
      const newContent = `${buildFrontmatter(newFrontmatter)}\n\n${newBody}`;
      await writeFile(chapterPath, newContent);
      updatedCount++;
    }
  }

  console.log('');
  console.log(`Done! Updated ${updatedCount} chapter(s).`);
}

main().catch(console.error);
