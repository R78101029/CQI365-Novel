"""
Build EPUB for 白露未晞 (Lost in Retrospect)

Reads frontmatter `cover` field to insert chapter illustrations.
Uses Cover_LostInRetrospect.jpg as book cover.
Outputs to repo root as LostInRetrospect.epub.
"""

import os
import re
import sys
from pathlib import Path

try:
    from ebooklib import epub
    import markdown
    import yaml
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "EbookLib", "Markdown", "PyYAML", "-q"])
    from ebooklib import epub
    import markdown
    import yaml

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
NOVEL_DIR = BASE_DIR / "projects" / "Wangran"
CHAPTERS_DIR = NOVEL_DIR / "chapters"
ASSETS_DIR = NOVEL_DIR / "_assets"
OUTPUT_FILE = BASE_DIR / "LostInRetrospect.epub"

print(f"Building EPUB: {OUTPUT_FILE.name}")

# --- Set up book ---
book = epub.EpubBook()
book.set_identifier("lost-in-retrospect")
book.set_title("白露未晞")
book.add_metadata("DC", "title", "Lost in Retrospect", {"xml:lang": "en"})
book.set_language("zh-TW")
book.add_author("CQI365")
book.add_metadata("DC", "description",
                  "蒹葭萋萋，白露未晞。所謂伊人，在水之湄。三世輪迴·同一張婚床。")
book.add_metadata("DC", "subject", "文學 / 輪迴 / 情感 / 中篇小說")

# --- Book cover ---
cover_path = ASSETS_DIR / "Cover_LostInRetrospect.jpg"
if cover_path.exists():
    with open(cover_path, "rb") as f:
        book.set_cover("cover.jpg", f.read())
    print(f"  Cover: {cover_path.name}")
else:
    print(f"  WARN: Cover not found at {cover_path}")

# --- Title / Epigraph page ---
title_html = """
<html><head><title>白露未晞</title></head><body>
<div style="text-align:center; margin-top:30%;">
  <h1 style="font-size:2.5em; letter-spacing:0.3em;">白露未晞</h1>
  <p style="font-size:1em; color:#666; margin-top:1em;">Lost in Retrospect</p>
  <p style="font-size:0.9em; color:#999; margin-top:4em; font-style:italic;">
    蒹葭萋萋，白露未晞。<br/>所謂伊人，在水之湄。
  </p>
  <p style="font-size:0.8em; color:#bbb; margin-top:0.5em;">——《詩經·秦風·蒹葭》</p>
  <p style="margin-top:6em; font-size:0.8em; color:#999;">CQI365</p>
</div>
</body></html>
"""
title_page = epub.EpubHtml(title="白露未晞", file_name="title.xhtml", lang="zh-TW")
title_page.content = title_html
book.add_item(title_page)

# --- Process chapters ---
md_files = sorted([f for f in CHAPTERS_DIR.glob("*.md") if f.name[0].isdigit()])
print(f"  Chapters: {len(md_files)}")

md_converter = markdown.Markdown(extensions=["extra"])

chapters = []
added_images = {}

def add_image_to_book(img_path: Path):
    """Add image to book if not yet added. Return internal name."""
    img_name = img_path.name
    internal_name = f"images/{img_name}"
    if internal_name in added_images:
        return internal_name
    if not img_path.exists():
        return None
    ext = img_path.suffix.lower()
    media_type = "image/jpeg" if ext in (".jpg", ".jpeg") else "image/png"
    with open(img_path, "rb") as f:
        item = epub.EpubItem(
            uid=img_name,
            file_name=internal_name,
            media_type=media_type,
            content=f.read(),
        )
        book.add_item(item)
    added_images[internal_name] = True
    return internal_name


for i, md_file in enumerate(md_files):
    content = md_file.read_text(encoding="utf-8")

    # Parse frontmatter
    cover_rel = None
    chapter_title = md_file.stem
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            body = parts[2].strip()
            try:
                fm_data = yaml.safe_load(fm_text) or {}
                chapter_title = fm_data.get("title", chapter_title).strip("\"'")
                cover_rel = fm_data.get("cover", None)
            except yaml.YAMLError:
                body = content
            content = body

    # Chapter illustration (from frontmatter cover)
    illustration_html = ""
    if cover_rel:
        # cover_rel is just a filename like "Illustration_part1_emptyHouse.jpg"
        # (no "chapters/" prefix — site prepends that at runtime)
        # Try both: direct path, and chapters/ subdirectory
        img_path = ASSETS_DIR / "chapters" / cover_rel
        if not img_path.exists():
            img_path = ASSETS_DIR / cover_rel
        internal = add_image_to_book(img_path)
        if internal:
            illustration_html = (
                f'<div style="text-align:center; margin:2em 0;">'
                f'<img src="{internal}" alt="" style="max-width:100%; height:auto;"/>'
                f'</div>'
            )

    # Process inline markdown images
    def inline_image(m):
        alt = m.group(1)
        rel = m.group(2)
        if rel.startswith("../_assets/") or rel.startswith("_assets/"):
            rel_clean = rel.replace("../_assets/", "").replace("_assets/", "")
            img_path = ASSETS_DIR / rel_clean
        else:
            img_path = Path(rel)
        internal = add_image_to_book(img_path)
        if internal:
            return f'<img src="{internal}" alt="{alt}" style="max-width:100%; height:auto;"/>'
        return ""

    content = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", inline_image, content)

    # Convert markdown to HTML
    html_body = md_converter.convert(content)
    md_converter.reset()

    # Build page HTML (don't use surrounding h1; the # Part I| is in body)
    page_html = f"""<html><head><title>{chapter_title}</title>
<link rel="stylesheet" type="text/css" href="style/book.css"/></head>
<body>
{illustration_html}
{html_body}
</body></html>"""

    chapter = epub.EpubHtml(
        title=chapter_title,
        file_name=f"chap_{i+1:02d}.xhtml",
        lang="zh-TW",
    )
    chapter.content = page_html
    book.add_item(chapter)
    chapters.append(chapter)
    print(f"    [{i+1}/{len(md_files)}] {chapter_title}")

# --- TOC / Navigation ---
book.toc = [title_page] + chapters
book.add_item(epub.EpubNcx())
book.add_item(epub.EpubNav())

# --- CSS ---
style = """
body {
  font-family: "Noto Serif TC", "Source Han Serif TC", serif;
  line-height: 1.8;
  padding: 2%;
  color: #222;
}
h1 {
  text-align: center;
  margin: 1em 0 2em;
  font-size: 1.8em;
  letter-spacing: 0.1em;
  font-weight: normal;
}
h2 {
  margin: 2.5em 0 1em;
  font-size: 1.3em;
  color: #555;
  font-weight: normal;
  text-align: center;
  letter-spacing: 0.05em;
}
h3 {
  margin: 2em 0 0.8em;
  font-size: 1.1em;
  color: #666;
  font-weight: normal;
  text-align: center;
}
p { text-indent: 2em; margin: 0.5em 0; }
blockquote {
  margin: 1em 2em;
  color: #555;
  border-left: 3px solid #ddd;
  padding-left: 1em;
  font-style: italic;
}
blockquote p { text-indent: 0; }
hr {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 2em 30%;
}
img { max-width: 100%; height: auto; display: block; margin: 1em auto; }
strong { letter-spacing: 0.05em; }
"""
book_css = epub.EpubItem(
    uid="style_book",
    file_name="style/book.css",
    media_type="text/css",
    content=style,
)
book.add_item(book_css)

# Spine
book.spine = ["cover", title_page, "nav"] + chapters

# Write
epub.write_epub(str(OUTPUT_FILE), book, {})
size_kb = OUTPUT_FILE.stat().st_size / 1024
print(f"\nSUCCESS: {OUTPUT_FILE}")
print(f"Size: {size_kb:.1f} KB")
print(f"Images embedded: {len(added_images)}")
added_images)}")
