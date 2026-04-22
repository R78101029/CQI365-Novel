import os
import glob
import shutil
from PIL import Image

# 針對 2040Iris 的路徑
assets_dir = r"E:\CodeProject\CQI365 Projects\CQi365-Novels\projects\2040Iris\_assets\chapters"
backup_dir = r"E:\CodeProject\CQI365 Projects\CQi365-Novels\projects\2040Iris\_assets\raw_pngs"
os.makedirs(backup_dir, exist_ok=True)

pngs = glob.glob(os.path.join(assets_dir, "*.png"))

total_saved = 0

for png_path in pngs:
    try:
        orig_size = os.path.getsize(png_path)
        img = Image.open(png_path).convert("RGB")
        
        # 針對超大解析度圖片進行適當縮放 (EPUB 不需要 8K，1600px 寬度已經足夠高畫質顯示於任何平板)
        w, h = img.size
        target_width = 1600
        if w > target_width:
            ratio = target_width / float(w)
            new_h = int(float(h) * float(ratio))
            img = img.resize((target_width, new_h), Image.Resampling.LANCZOS)

        jpg_name = os.path.basename(png_path).replace(".png", ".jpg")
        jpg_path = os.path.join(assets_dir, jpg_name)
        
        # 轉換為 JPG 並給定 85 的高畫質壓縮品質
        img.save(jpg_path, "JPEG", quality=85)
        new_size = os.path.getsize(jpg_path)
        
        # 將原始巨大的 PNG 備份起來，避免被 EPUB Builder 再次抓到
        shutil.move(png_path, os.path.join(backup_dir, os.path.basename(png_path)))
        
        saved_mb = (orig_size - new_size) / (1024 * 1024)
        total_saved += saved_mb
        # print(f"已轉換: {jpg_name} (縮減了 {saved_mb:.2f} MB)")
        
    except Exception as e:
        print(f"Error processing {png_path}: {e}")

print(f"2040Iris 縮圖完成！總計省下大約 {total_saved:.2f} MB 的空間。")
