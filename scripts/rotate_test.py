import sys
from PIL import Image

image_path = r"backend\uploads\bus-passes\c85f1980-e40e-454e-9a4f-88193d36575d.jpeg"
img = Image.open(image_path)
print("Original size:", img.size)

# Rotate 90, 180, 270 degrees clockwise
# Looking at the card earlier: the top is on the right side in the portrait view, so rotating 90 degrees counter-clockwise (or 270 clockwise) makes it horizontal right-side-up!
for angle in [90, 180, 270]:
    rotated = img.rotate(angle, expand=True)
    out_path = f"backend/uploads/bus-passes/rotated_{angle}.jpg"
    rotated.save(out_path)
    print(f"Saved rotated_{angle}.jpg: {rotated.size}")
