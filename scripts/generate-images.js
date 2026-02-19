// ... imports
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, writeFile, readdir, mkdir, unlink } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import minimist from 'minimist';
import { existsSync } from 'fs';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const PROJECTS_DIR = join(ROOT_DIR, 'projects');

// Load environment variables from root .env
dotenv.config({ path: join(ROOT_DIR, '.env') });

const args = minimist(process.argv.slice(2));

// Helper: Parse Frontmatter
async function getFrontmatter(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    
    // Simple YAML parser
    const frontmatter = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join(':').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        frontmatter[key] = value;
      }
    }
    return frontmatter;
  } catch (e) {
    return null;
  }
}

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GOOGLE_API_KEY not found in .env file.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Model selection: Force Gemini 1.5 Flash for SVG generation (reliable code gen)
  const modelName = args.model || 'gemini-1.5-flash'; 

  console.log(`🚀 Initializing with model: ${modelName} (SVG Mode)`);
  
  const novelName = '2040Iris';
  const chaptersDir = join(PROJECTS_DIR, novelName, 'chapters');
  const assetsDir = join(PROJECTS_DIR, novelName, '_assets', 'chapters');
  
  if (!existsSync(assetsDir)) {
      await mkdir(assetsDir, { recursive: true });
  }

  // 1. Scan for prompts
  const prompts = [];
  
  // 1a. Hardcoded Main Cover (Convert to SVG target)
  prompts.push({
      filename: '2040Iris_cover.svg', // Target SVG
      jpgName: '2040Iris_cover.jpg',  // Cleanup target
      prompt: 'Futuristic Taipei skyline at night, Blade Runner style, heavy rain and mist. Taipei 101 tower visible but obscured. Digital red iris pattern overlay. Cinematic lighting, 8k, photorealistic.'
  });

  // 1b. Read Chapter Prompts
  if (existsSync(chaptersDir)) {
      const files = await readdir(chaptersDir);
      for (const file of files) {
          if (!file.endsWith('.md')) continue;
          
          const filePath = join(chaptersDir, file);
          const fm = await getFrontmatter(filePath);
          
          if (fm && fm.image_prompt && fm.cover) {
              const baseName = fm.cover.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
              prompts.push({
                  filename: `${baseName}.svg`, // Force SVG extension
                  jpgName: fm.cover,           // Original filename to cleanup
                  prompt: fm.image_prompt,
                  chapterFile: file
              });
          }
      }
  }

  console.log(`📝 Found ${prompts.length} prompts to process.`);

  // 2. Generate SVGs
  for (const item of prompts) {
      const filePath = join(assetsDir, item.filename);
      
      // Cleanup existing JPG placeholder if checking for force
      const jpgPath = join(assetsDir, item.jpgName);
      
      if (existsSync(filePath) && !args.force) {
          console.log(`⏭️  Skipping existing: ${item.filename}`);
          continue;
      }

      console.log(`🎨 Generating SVG: ${item.filename} (from ${item.chapterFile || 'config'})...`);

      if (args['dry-run']) {
          console.log('   [Dry Run] Skipped API call.');
          continue;
      }

      try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const svgPrompt = `Create a high-quality, detailed SVG code for an illustration of: ${item.prompt}. 
          Do not include markdown backticks. Return ONLY the raw SVG code. 
          Use rich gradients, cyberpunk colors (neon blue, red, black), and futuristic shapes.
          Make it suitable for a book cover.`;
          
          const result = await model.generateContent(svgPrompt);
          const response = await result.response;
          let text = response.text();
          
          // Cleanup markdown if present
          if (text.includes('```xml')) {
            text = text.replace(/```xml\n([\s\S]*?)```/g, '$1');
          } else if (text.includes('```svg')) {
             text = text.replace(/```svg\n([\s\S]*?)```/g, '$1'); 
          } else if (text.includes('```')) {
             text = text.replace(/```([\s\S]*?)```/g, '$1');
          }
          
          // Ensure it starts with <svg
          const svgStart = text.indexOf('<svg');
          if (svgStart > -1) {
              text = text.substring(svgStart);
              const svgEnd = text.lastIndexOf('</svg>');
              if (svgEnd > -1) {
                  text = text.substring(0, svgEnd + 6);
              }
              
              await writeFile(filePath, text);
              console.log(`   ✅ Saved SVG: ${filePath}`);
              
              // Remove JPG placeholder if it exists
              if (existsSync(jpgPath)) {
                  await unlink(jpgPath);
                  console.log(`   🗑️  Removed placeholder: ${item.jpgName}`);
              }
              
          } else {
              console.log('   ⚠️  Model did not return valid SVG code.');
              console.log('   Output peek:', text.substring(0, 100));
          }

      } catch (error) {
          console.error(`   ❌ Failed: ${error.message}`);
      }
  }
}

main().catch(console.error);
