const fs = require('fs');
const path = require('path');

const novelName = process.argv[2] || 'BlindOrbit';
const projectPath = `projects/${novelName}`;
const orderFile = path.join(projectPath, '_meta/chapter_order.md');
const chaptersDir = path.join(projectPath, 'chapters');

if (!fs.existsSync(orderFile)) {
    console.error(`Order file not found: ${orderFile}`);
    process.exit(1);
}

function parseChapterOrder(content) {
    const lines = content.split('\n');
    const mapping = [];
    
    // Regex for markdown table row: | 1.00 | `Filename` | Title | ...
    // Matches: | (num/id) | `(filename)` | (title) |
    const rowRegex = /\|\s*([\d\.]+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/;
    
    for (const line of lines) {
        const match = line.match(rowRegex);
        if (match) {
            const rawNum = match[1];
            const filename = match[2].trim();
            const title = match[3].trim();
            
            // Calculate Order
            // If format is 1.01 -> 101. If format is 01 -> 10.
            let order;
            if (rawNum.includes('.')) {
                order = Math.round(parseFloat(rawNum) * 100);
            } else {
                order = parseInt(rawNum, 10) * 10;
            }

            mapping.push({
                num: rawNum,
                filename: filename,
                title: title,
                order: order
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
    let match = content.match(fmRegex);
    
    let fm = '';
    let body = content;
    
    if (match) {
        fm = match[1];
        body = content.replace(fmRegex, '').trim(); 
        // Note: Replacing body logic below expects full content replacement if match found
    }

    // Update Title
    if (/title:\s*".*"/.test(fm)) {
        fm = fm.replace(/title:\s*".*"/, `title: "${mapping.title}"`);
    } else if (/title:/.test(fm)) {
        fm = fm.replace(/title:.*/, `title: "${mapping.title}"`);
    } else {
        fm += `\ntitle: "${mapping.title}"`;
    }
    
    // Update Order
    if (/order:\s*\d+/.test(fm)) {
        fm = fm.replace(/order:\s*\d+/, `order: ${mapping.order}`);
    } else {
        fm += `\norder: ${mapping.order}`;
    }
    
    // Reconstruct
    const newFrontmatter = `---\n${fm.trim()}\n---`;
    // If original had frontmatter, replace it. If not, prepend it.
    let newContent;
    if (match) {
        newContent = content.replace(fmRegex, newFrontmatter);
    } else {
        newContent = `${newFrontmatter}\n\n${content}`;
    }
    
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${mapping.filename} (Order: ${mapping.order})`);
    } else {
        // console.log(`Skipped ${mapping.filename} (up to date)`);
    }
}

const mdContent = fs.readFileSync(orderFile, 'utf-8');
const mappings = parseChapterOrder(mdContent);

console.log(`Scanning ${orderFile}...`);
console.log(`Found ${mappings.length} chapters in order file.`);
mappings.forEach(updateChapter);
