#!/usr/bin/env node
/**
 * Publish chapter updates to WordPress
 *
 * Usage: node scripts/publish-to-wp.js [chapter-files...]
 *
 * Environment variables:
 * - WP_URL: WordPress site URL (e.g., https://blog.cqi365.net)
 * - WP_USER: WordPress username
 * - WP_APP_PASSWORD: WordPress application password
 * - NOVEL_SITE_URL: Novel site URL for "read more" links
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';

const WP_URL = process.env.WP_URL || 'https://blog.cqi365.net';
const WP_USER = process.env.WP_USER;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const NOVEL_SITE_URL = process.env.NOVEL_SITE_URL || 'https://novels.cqi365.net';

// Novel metadata
const NOVELS = {
  '2028ww3': {
    title: '2028 第三次世界大戰',
    category: '小說連載',
  },
};

/**
 * Extract frontmatter and content from markdown
 */
function parseMarkdown(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatter = {};
    frontmatterMatch[1].split('\n').forEach(line => {
      const [key, ...value] = line.split(':');
      if (key && value.length) {
        frontmatter[key.trim()] = value.join(':').trim().replace(/^["']|["']$/g, '');
      }
    });
    return { frontmatter, body: frontmatterMatch[2].trim() };
  }
  return { frontmatter: {}, body: content };
}

/**
 * Convert markdown to HTML (basic conversion)
 */
function markdownToHtml(markdown) {
  return markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Line breaks and paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
}

/**
 * Get chapter URL slug from filename
 */
function getChapterSlug(filename) {
  return basename(filename, '.md').toLowerCase().replace(/_/g, '-');
}

/**
 * Get novel slug from file path
 */
function getNovelSlug(filepath) {
  const match = filepath.match(/projects\/([^/]+)\/chapters/);
  return match ? match[1] : null;
}

/**
 * Create excerpt (first 500 characters)
 */
function createExcerpt(content, maxLength = 500) {
  const plainText = content
    .replace(/[#*_`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Search for existing post by slug
 */
async function findExistingPost(slug) {
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const endpoint = `${WP_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&status=publish,draft`;

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const posts = await response.json();
  return posts.length > 0 ? posts[0] : null;
}

/**
 * Generate unique post slug from novel and chapter
 */
function generatePostSlug(novelSlug, chapterSlug) {
  return `${novelSlug}-${chapterSlug}`;
}

/**
 * Post to WordPress (create or update)
 */
async function postToWordPress(title, content, excerpt, slug, tags = []) {
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

  // Check if post already exists
  const existingPost = await findExistingPost(slug);

  const postData = {
    title,
    content,
    excerpt,
    slug,
    status: 'publish',
    tags: tags,
  };

  let endpoint, method;

  if (existingPost) {
    // Update existing post
    endpoint = `${WP_URL}/wp-json/wp/v2/posts/${existingPost.id}`;
    method = 'PUT';
  } else {
    // Create new post
    endpoint = `${WP_URL}/wp-json/wp/v2/posts`;
    method = 'POST';
  }

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WordPress API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return { ...result, isUpdate: !!existingPost };
}

/**
 * Main function
 */
async function main() {
  const files = process.argv.slice(2).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No chapter files to publish.');
    return;
  }

  if (!WP_USER || !WP_APP_PASSWORD) {
    console.error('Error: WP_USER and WP_APP_PASSWORD environment variables required.');
    process.exit(1);
  }

  console.log(`Publishing ${files.length} chapter(s) to WordPress...`);

  for (const file of files) {
    try {
      const novelSlug = getNovelSlug(file);
      const novel = NOVELS[novelSlug];

      if (!novel) {
        console.log(`  Skipping ${file}: Unknown novel`);
        continue;
      }

      const content = await readFile(file, 'utf-8');
      const { frontmatter, body } = parseMarkdown(content);

      const chapterTitle = frontmatter.title || basename(file, '.md');
      const chapterSlug = getChapterSlug(file);
      const chapterUrl = `${NOVEL_SITE_URL}/novel/${novelSlug}/${chapterSlug}`;

      // Generate unique slug for WordPress
      const wpSlug = generatePostSlug(novelSlug, chapterSlug);

      // Create WordPress post
      const wpTitle = `【${novel.title}】${chapterTitle}`;
      const excerpt = createExcerpt(body);

      // Create content with excerpt and link
      const wpContent = `
<p>${excerpt}</p>

<p><a href="${chapterUrl}" target="_blank" rel="noopener"><strong>👉 點此繼續閱讀完整章節</strong></a></p>

<hr>

<p><em>本章節來自《${novel.title}》，更多精彩內容請前往 <a href="${NOVEL_SITE_URL}" target="_blank">Novels365</a> 閱讀。</em></p>
      `.trim();

      const result = await postToWordPress(wpTitle, wpContent, excerpt, wpSlug);
      const action = result.isUpdate ? '✓ Updated' : '✓ Created';
      console.log(`  ${action}: ${chapterTitle}`);
      console.log(`    WordPress URL: ${result.link}`);

    } catch (error) {
      console.error(`  ✗ Failed: ${file}`);
      console.error(`    Error: ${error.message}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
