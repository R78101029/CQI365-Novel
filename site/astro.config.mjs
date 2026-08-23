import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeChapterImages from './src/plugins/rehype-chapter-images.mjs';

export default defineConfig({
  integrations: [mdx(), sitemap()],
  site: 'https://novels.cqi365.net',
  output: 'static',
  markdown: {
    // 章節插圖補上 lazy / async decode / 真實尺寸，避免整本書開頁時一次抓完所有圖，
    // 也避免圖片載入時改變版面高度造成長文件重排。詳見該檔開頭說明。
    rehypePlugins: [rehypeChapterImages],
  },
});
