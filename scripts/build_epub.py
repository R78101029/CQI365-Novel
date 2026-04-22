import os
import glob
import re
import subprocess
import sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

try:
    import ebooklib
    from ebooklib import epub
    import markdown
except ImportError:
    install('EbookLib')
    install('Markdown')
    install('beautifulsoup4')
    import ebooklib
    from ebooklib import epub
    import markdown

base_dir = r"E:\CodeProject\CQI365 Projects\CQi365-Novels\projects\TheCrease"
chapters_dir = os.path.join(base_dir, "chapters")
assets_dir = os.path.join(base_dir, "_assets")
output_path = os.path.join(base_dir, "TheCrease_Preview.epub")

book = epub.EpubBook()
book.set_identifier("id123456")
book.set_title("摺痕 (The Crease)")
book.set_language("zh-TW")
book.add_author("HugoLin")

# Find cover and add it
covers = glob.glob(r"C:\Users\viery\.gemini\antigravity\brain\**\thecrease_cover_v4*.png", recursive=True)
if covers:
    cover_path = covers[0]
    book.set_cover("cover.png", open(cover_path, "rb").read())

# Collect and sort markdown files
md_files = glob.glob(os.path.join(chapters_dir, "Chap_*.md"))
md_files.sort()

# Also include colophon
colophon_path = os.path.join(base_dir, "_meta", "colophon_draft.md")
all_files = md_files + ([colophon_path] if os.path.exists(colophon_path) else [])

added_images = {} # dict mapping local_path to internal_name
epub_chapters = []

md_converter = markdown.Markdown(extensions=['meta'])

for i, fpath in enumerate(all_files):
    filename = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Naive frontmatter removal if exists
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            content = parts[2].strip()
    
    # Process images: ![alt](../_assets/illustrations/image.png)
    def replace_image(m):
        alt_text = m.group(1)
        rel_path = m.group(2)
        
        if rel_path.startswith("../_assets/"):
            local_img_path = os.path.normpath(os.path.join(chapters_dir, rel_path))
        else:
            local_img_path = rel_path
            
        if os.path.exists(local_img_path):
            img_basename = os.path.basename(local_img_path)
            internal_name = f"images/{img_basename}"
            
            if internal_name not in added_images:
                with open(local_img_path, "rb") as im_file:
                    epub_img = epub.EpubItem(uid=img_basename, file_name=internal_name, media_type="image/png", content=im_file.read())
                    book.add_item(epub_img)
                added_images[internal_name] = True
            
            return f'<img src="{internal_name}" alt="{alt_text}" style="max-width:100%; height:auto;" />'
        return ""

    content_with_html_imgs = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_image, content)
    html_content = md_converter.convert(content_with_html_imgs)
    
    title_match = re.search(r'<h1>(.*?)</h1>', html_content)
    chap_title = title_match.group(1) if title_match else f"Chapter {i}"
    if fpath == colophon_path: chap_title = "版權頁"
    
    c = epub.EpubHtml(title=chap_title, file_name=f"chap_{i:02d}.xhtml", lang='zh-TW')
    c.content = html_content 

    book.add_item(c)
    epub_chapters.append(c)

# define TOC and structure
book.toc = epub_chapters
book.add_item(epub.EpubNcx())
book.add_item(epub.EpubNav())

# Add default CSS
style = 'body { font-family: sans-serif; line-height: 1.5; padding: 5%; } img { max-width: 100%; height: auto; display: block; margin: 1em auto; } h1 { text-align: center; }'
nav_css = epub.EpubItem(uid="style_nav", file_name="style/nav.css", media_type="text/css", content=style)
book.add_item(nav_css)

book.spine = ['nav'] + epub_chapters
epub.write_epub(output_path, book, {})

print(f"SUCCESS: EPUB gen => {output_path}")
