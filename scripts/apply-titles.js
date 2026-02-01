const fs = require('fs');
const path = require('path');

const projectPath = 'projects/BlindOrbit';
const orderFile = path.join(projectPath, '_meta/chapter_order.md');
const chaptersDir = path.join(projectPath, 'chapters');

function parseChapterOrder(content) {
    const lines = content.split('\n');
    const mapping = [];
    
    // Regex for markdown table row: | 01 | `Chap_...` | Title | ...
    // Matches: | (num) | `(filename)` | (title) |
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

function updateChapter(mapping) {
    const filePath = path.join(chaptersDir, mapping.filename);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${mapping.filename}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Frontmatter regex (relaxed for CRLF)
    const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
    const match = content.match(fmRegex);
    
    if (match) {
        let fm = match[1];
        
        // Update Title
        if (/title:\s*".*"/.test(fm)) {
            fm = fm.replace(/title:\s*".*"/, `title: "${mapping.title}"`);
        } else if (/title:/.test(fm)) {
            fm = fm.replace(/title:.*/, `title: "${mapping.title}"`);
        } else {
            fm += `\ntitle: "${mapping.title}"`;
        }
        
        // Update Order
        const order = mapping.num * 10;
        if (/order:\s*\d+/.test(fm)) {
            fm = fm.replace(/order:\s*\d+/, `order: ${order}`);
        } else {
            fm += `\norder: ${order}`;
        }
        
        const newContent = content.replace(fmRegex, `---\n${fm}\n---`);
        
        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`Updated ${mapping.filename}`);
        } else {
            console.log(`Skipped ${mapping.filename} (up to date)`);
        }
    } else {
        console.warn(`No frontmatter found in ${mapping.filename}`);
    }
}

const mdContent = fs.readFileSync(orderFile, 'utf-8');
const mappings = parseChapterOrder(mdContent);

console.log(`Found ${mappings.length} chapters in order file.`);
mappings.forEach(updateChapter);
