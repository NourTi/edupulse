from pathlib import Path
from PIL import Image

source = Path("/home/ubuntu/webdev-static-assets/edupulse-mark.png")
target = Path("/home/ubuntu/edupulse/src-tauri/icons/icon.png")

with Image.open(source) as image:
    icon = image.convert("RGBA")
    icon.thumbnail((256, 256), Image.Resampling.LANCZOS)
    icon.save(target, format="PNG", optimize=True, compress_level=9)
