import os
import glob
import re
import sys

try:
    import ebooklib
    from ebooklib import epub
    import markdown
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "EbookLib", "Markdown", "beautifulsoup4", "-q"])
    import ebooklib
    from ebooklib import epub
    import markdown

novel_name = sys.argv[1]
base_dir = rf"E:\CodeProject\CQI365 Projects\CQi365-Novels\projects\{novel_name}"
chapters_dir = os.path.join(base_dir, "chapters")
assets_dir = os.path.join(base_dir, "_assets")
output_path = os.path.join(base_dir, f"{novel_name}_Preview.epub")

print(f"Building EPUB for {novel_name}...")

book = epub.EpubBook()
book.set_identifier(f"id_{novel_name.lower()}")
book.set_title(novel_name)
book.set_language("zh-TW")
book.add_author("HugoLin")

# Find cover
cover_path = None
# Look in _assets/chapters/ for files with 'cover' but not starting with digit or 'ch'
candidates = glob.glob(os.path.join(assets_dir, "chapters", "*cover*.*"))
main_covers = [c for c in candidates if not re.match(r'(\d\.\d\d|ch\d\d)', os.path.basename(c))]
if main_covers:
    cover_path = main_covers[0]
elif candidates:
    cover_path = candidates[0]

if cover_path:
    print(f"Found book cover: {cover_path}")
    book.set_cover("cover.jpg", open(cover_path, "rb").read())
else:
    print("Warning: Could not find cover image.")

# Collect and sort markdown files
md_files = glob.glob(os.path.join(chapters_dir, "*.md"))
md_files.sort()

# Also include colophon if exists
colophon_path = os.path.join(base_dir, "_meta", "colophon_draft.md")
all_files = md_files + ([colophon_path] if os.path.exists(colophon_path) else [])

added_images = {} # dict mapping internal_name
epub_chapters = []

md_converter = markdown.Markdown(extensions=['meta'])

for i, fpath in enumerate(all_files):
    if not os.path.exists(fpath): continue
    filename = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Naive frontmatter removal if exists
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            content = parts[2].strip()
            
    # Remove draft notes like word counts
    content = re.sub(r'\*\*\[字數統計.*?\]\*\*', '', content)
            
    # Process explicitly written images in MD
    def replace_image(m):
        alt_text = m.group(1)
        rel_path = m.group(2)
        if rel_path.startswith("../"):
            local_img_path = os.path.normpath(os.path.join(chapters_dir, rel_path))
        else:
            local_img_path = rel_path
            
        if os.path.exists(local_img_path):
            img_basename = os.path.basename(local_img_path)
            internal_name = f"images/{img_basename}"
            if internal_name not in added_images:
                with open(local_img_path, "rb") as im_file:
                    epub_img = epub.EpubItem(uid=img_basename, file_name=internal_name, media_type="image/png" if img_basename.endswith('png') else 'image/jpeg', content=im_file.read())
                    book.add_item(epub_img)
                added_images[internal_name] = True
            return f'<img src="{internal_name}" alt="{alt_text}" style="max-width:100%; height:auto;" />'
        return ""

    content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_image, content)
    html_content = md_converter.convert(content)
    
    # Check for implicit chapter illustration in _assets/chapters
    img_basename = None
    m1 = re.search(r'Book(\d+)_Chap(\d+)', filename)
    m2 = re.search(r'Chap_(\d+)', filename)
    
    if m1:
        code = f"{m1.group(1)}.{m1.group(2)}"
        cands = glob.glob(os.path.join(assets_dir, "chapters", f"{code}-*.*"))
        if cands: img_basename = os.path.basename(cands[0])
    elif m2:
        code = f"ch{m2.group(1)}"
        cands = glob.glob(os.path.join(assets_dir, "chapters", f"{code}-*.*"))
        if cands: img_basename = os.path.basename(cands[0])
        
    inserted_img_html = ""
    if img_basename:
        local_img_path = os.path.join(assets_dir, "chapters", img_basename)
        internal_name = f"images/{img_basename}"
        if internal_name not in added_images:
            with open(local_img_path, "rb") as im_file:
                epub_img = epub.EpubItem(uid=img_basename, file_name=internal_name, media_type="image/png" if img_basename.lower().endswith('png') else 'image/jpeg', content=im_file.read())
                book.add_item(epub_img)
            added_images[internal_name] = True
        inserted_img_html = f'<div style="text-align: center;"><img src="{internal_name}" alt="Chapter Illustration" style="max-width:100%; height:auto; margin: 1em auto;" /></div>\n<br/>'

    # Determine Title
    title_match = re.search(r'<h1>(.*?)</h1>', html_content)
    if title_match: chap_title = title_match.group(1)
    else: chap_title = filename.replace('.md', '')
    if fpath == colophon_path: chap_title = "版權頁"
    
    # Prepend implicit image exactly after H1 or at top
    if title_match:
        html_content = html_content.replace(title_match.group(0), title_match.group(0) + "\n" + inserted_img_html)
    else:
        html_content = inserted_img_html + "\n" + html_content
    
    # Create HTML node
    c = epub.EpubHtml(title=chap_title, file_name=f"chap_{i:02d}.xhtml", lang='zh-TW')
    c.content = html_content 

    book.add_item(c)
    epub_chapters.append(c)

# define TOC and structure
book.toc = epub_chapters
book.add_item(epub.EpubNcx())
book.add_item(epub.EpubNav())

# Add default CSS
style = '''
body { font-family: sans-serif; line-height: 1.6; padding: 2%; }
img { max-width: 100%; height: auto; display: block; margin: 1em auto; }
h1 { text-align: center; margin-bottom: 2em; }
pre {
    background-color: #2b2b2b;
    color: #f8f8f2;
    padding: 1em;
    font-size: 0.85em;
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;
    border-radius: 5px;
    overflow-x: hidden;
}
code {
    font-family: monospace;
    background-color: #f0f0f0;
    color: #e03131;
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-size: 0.9em;
}
pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
}
'''
nav_css = epub.EpubItem(uid="style_nav", file_name="style/nav.css", media_type="text/css", content=style)
book.add_item(nav_css)

book.spine = ['nav'] + epub_chapters
epub.write_epub(output_path, book, {})

print(f"SUCCESS: EPUB generated => {output_path}")
