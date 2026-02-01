const fs = require('fs');
const path = require('path');

const projectPath = 'projects/BlindOrbit';
const orderFile = path.join(projectPath, '_meta/chapter_order.md');
const chaptersDir = path.join(projectPath, 'chapters');

function parseChapterOrder(content) {
    const lines = content.split('\n');
    const mapping = [];
    const rowRegex = /\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/;
    
    for (const line of lines) {
        const match = line.match(rowRegex);
        if (match) {
            mapping.push({
                num: parseInt(match[1], 10),
                filename: match[2].trim(),
                title: match[3].trim()
            });
        }
    }
    return mapping;
}

function sanitizeChapter(mapping) {
    const filePath = path.join(chaptersDir, mapping.filename);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Extract existing metadata to PRESERVE it (like covers)
    const metadata = {
        title: mapping.title,
        order: mapping.num * 10
    };
    
    // Aggressive cover extraction (from anywhere in file just in case)
    const coverMatch = content.match(/cover:\s*"(.*)"/);
    if (coverMatch) metadata.cover = coverMatch[1];
    const coverUrlMatch = content.match(/cover_url:\s*"(.*)"/);
    if (coverUrlMatch) metadata.cover_url = coverUrlMatch[1];
    const coverMediaMatch = content.match(/cover_media_id:\s*"(.*)"/);
    if (coverMediaMatch) metadata.cover_media_id = coverMediaMatch[1];

    // 2. Remove ONLY frontmatter blocks at the START of the file
    let cleanBody = content;
    const startBlockRegex = /^---\r?\n([\s\S]{0,500}?)\r?\n---\r?\n?/;
    
    while (true) {
        const match = cleanBody.match(startBlockRegex);
        if (match && match[1].includes(':')) {
            cleanBody = cleanBody.replace(startBlockRegex, '').trimStart();
        } else {
            break;
        }
    }

    // NEW: Also remove any frontmatter blocks that might be stuck in the body
    // These look like \n---\ntitle: ...\n---\n
    const bodyBlockRegex = /\r?\n---\r?\n([\s\S]{0,500}?(?:title:|order:).+?)\r?\n---/g;
    cleanBody = cleanBody.replace(bodyBlockRegex, '');
    
    // 3. Final trim
    cleanBody = cleanBody.trim();

    // 4. Build NEW frontmatter
    let fm = '---\ntitle: "'+metadata.title+'"\norder: '+metadata.order+'\n';
    if (metadata.cover) fm += `cover: "${metadata.cover}"\n`;
    if (metadata.cover_url) fm += `cover_url: "${metadata.cover_url}"\n`;
    if (metadata.cover_media_id) fm += `cover_media_id: "${metadata.cover_media_id}"\n`;
    fm += '---\n\n';

    const newContent = fm + cleanBody;
    
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Sanitized: ${mapping.filename}`);
}

const mdContent = fs.readFileSync(orderFile, 'utf-8');
const mappings = parseChapterOrder(mdContent);

console.log(`Sanitizing ${mappings.length} chapters...`);
mappings.forEach(sanitizeChapter);
console.log('Done.');
