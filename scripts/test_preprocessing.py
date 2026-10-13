import os
import subprocess
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

def run_ocr(img_path):
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "win_ocr.ps1")
    cmd = [
        "powershell",
        "-ExecutionPolicy", "Bypass",
        "-File", script_path,
        "-ImagePath", os.path.abspath(img_path)
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, timeout=25)
        text = res.stdout.decode("utf-8", errors="replace").strip()
        return text
    except Exception as e:
        return f"Error: {e}"

def test_image(img_path):
    print("Testing image:", img_path)
    img = Image.open(img_path)
    print("Dimensions:", img.size)

    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_test")
    os.makedirs(temp_dir, exist_ok=True)

    # Test all 4 rotations
    for angle in [0, 90, 180, 270]:
        rot = img.rotate(angle, expand=True) if angle != 0 else img
        p = os.path.join(temp_dir, f"rot_{angle}.jpg")
        rot.save(p)
        txt = run_ocr(p)
        print(f"--- Angle {angle} ---")
        print(ascii(txt))

        # If angle 270 or 90 produces something, let's test preprocessing on that angle
        if "ROUTE" in txt.upper() or "SINGARAJU" in txt.upper() or "SAIRAM" in txt.upper() or "28" in txt or "29" in txt:
            print(f"FOUND MATCHING TOKENS AT ANGLE {angle}!")
            # Try contrast enhancement & grayscale & thresholding to defeat hologram glare
            gray = ImageOps.grayscale(rot)
            gray_path = os.path.join(temp_dir, f"gray_{angle}.jpg")
            gray.save(gray_path)
            print(f"--- Gray {angle} ---")
            print(ascii(run_ocr(gray_path)))

            enhancer = ImageEnhance.Contrast(rot)
            contr = enhancer.enhance(1.8)
            contr_path = os.path.join(temp_dir, f"contr_{angle}.jpg")
            contr.save(contr_path)
            print(f"--- High Contrast {angle} ---")
            print(ascii(run_ocr(contr_path)))

            # Crop mid region
            w, h = rot.size
            crop = rot.crop((0, int(h * 0.15), w, int(h * 0.85)))
            crop_path = os.path.join(temp_dir, f"crop_{angle}.jpg")
            crop.save(crop_path)
            print(f"--- Crop {angle} ---")
            print(ascii(run_ocr(crop_path)))

            # Crop mid region with contrast
            crop_contr = ImageEnhance.Contrast(crop).enhance(1.8)
            crop_contr_p = os.path.join(temp_dir, f"crop_contr_{angle}.jpg")
            crop_contr.save(crop_contr_p)
            print(f"--- Crop High Contrast {angle} ---")
            print(ascii(run_ocr(crop_contr_p)))

if __name__ == "__main__":
    test_image("backend/uploads/bus-passes/c85f1980-e40e-454e-9a4f-88193d36575d.jpeg")
