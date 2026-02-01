const fs = require('fs');
const path = require('path');

const srcDir = 'site/src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  // Only process relevant file types
  if (!/\.(astro|ts|js|json|md)$/.test(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('2028ww3')) {
    console.log(`Replacing in ${file}`);
    content = content.replace(/2028ww3/g, 'BlindOrbit');
    fs.writeFileSync(file, content, 'utf8');
  }
});
