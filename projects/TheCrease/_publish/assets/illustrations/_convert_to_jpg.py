"""Convert all chapter illustration PNGs to JPGs (q=85). Originals kept."""
import os
from PIL import Image
from pathlib import Path

here = Path(__file__).parent
pngs = sorted(here.glob("illus_chap*.png"))
# Skip _titled variants — they include text overlay we don't need in EPUB
pngs = [p for p in pngs if "_titled" not in p.name]

total_before = 0
total_after = 0
for p in pngs:
    jpg = p.with_suffix(".jpg")
    img = Image.open(p)
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.save(jpg, "JPEG", quality=85, optimize=True, progressive=True)
    sz_before = p.stat().st_size
    sz_after = jpg.stat().st_size
    total_before += sz_before
    total_after += sz_after
    print(f"{p.name}: {sz_before//1024} KB -> {sz_after//1024} KB ({sz_after*100//sz_before}%)")

print(f"\nTotal: {total_before//1024//1024} MB -> {total_after//1024//1024} MB")
print(f"Saved: {(total_before-total_after)//1024//1024} MB")
