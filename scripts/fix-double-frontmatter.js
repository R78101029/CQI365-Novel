
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const chaptersDir = './projects/2040Iris/chapters';

async function main() {
  const files = await readdir(chaptersDir);
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = join(chaptersDir, file);
    let content = await readFile(filePath, 'utf-8');
    
    // Check for double frontmatter
    // Pattern: --- [content] --- [whitespace] --- [content] ---
    const doubleFmRegex = /^---\n([\s\S]*?)\n---\s*\n---\n([\s\S]*?)\n---/;
    const match = content.match(doubleFmRegex);
    
    if (match) {
      console.log(`Fixing double frontmatter in: ${file}`);
      const fm1 = match[1];
      const fm2 = match[2];
      const body = content.replace(doubleFmRegex, '').trim();
      
      const parsed1 = parseYaml(fm1);
      const parsed2 = parseYaml(fm2);
      
      // Merge: fm1 (newest) overrides fm2 (old), but we keep unique keys from fm2
      const merged = { ...parsed2, ...parsed1 };
      
      // Reconstruct YAML
      const newFm = Object.entries(merged)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`) // Simple serialization
        .join('\n');
        
      const newContent = `---\n${newFm}\n---\n\n${body}`;
      
      await writeFile(filePath, newContent, 'utf-8');
    } else {
      // console.log(`No double frontmatter in: ${file}`);
    }
  }
}

function parseYaml(str) {
  const obj = {};
  str.split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      let val = line.slice(colon + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      obj[key] = val;
    }
  });
  return obj;
}

main().catch(console.error);
