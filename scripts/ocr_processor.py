import sys
import os
import subprocess
import json
import re
from PIL import Image, ExifTags, ImageEnhance, ImageOps

def extract_pdf_text(pdf_path):
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
    except Exception as e:
        return ""

def run_win_ocr(image_path):
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "win_ocr.ps1")
    cmd = [
        "powershell",
        "-ExecutionPolicy", "Bypass",
        "-File", script_path,
        "-ImagePath", os.path.abspath(image_path)
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, timeout=25)
        text = res.stdout.decode("utf-8", errors="replace").strip()
        return text
    except Exception:
        return ""

def add_chunk_if_informative(chunks, text):
    cleaned = text.strip()
    if not cleaned:
        return
    # Avoid duplicate chunks
    if cleaned in chunks:
        return
    chunks.append(cleaned)

def process_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    all_chunks = []

    if ext in [".txt", ".text"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return f.read()
        except Exception:
            return ""

    if ext == ".pdf":
        pdf_text = extract_pdf_text(file_path)
        if pdf_text.strip():
            all_chunks.append(pdf_text)
        return "\n".join(all_chunks)

    try:
        img = Image.open(file_path)
    except Exception as e:
        sys.stderr.write(f"Error opening image: {e}\n")
        return ""

    # Handle EXIF orientation if present
    try:
        exif = img._getexif()
        if exif is not None:
            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == 'Orientation' and orientation in exif:
                    val = exif[orientation]
                    if val == 3:
                        img = img.rotate(180, expand=True)
                    elif val == 6:
                        img = img.rotate(270, expand=True)
                    elif val == 8:
                        img = img.rotate(90, expand=True)
                    break
    except Exception:
        pass

    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_ocr")
    os.makedirs(temp_dir, exist_ok=True)

    # University passes may be captured in portrait or landscape and often have holograms.
    # We test all 4 card orientations and apply contrast & crop preprocessing.
    angles = [0, 270, 90, 180]
    for angle in angles:
        rotated = img.rotate(angle, expand=True) if angle != 0 else img
        
        # 1. Base rotated image
        base_path = os.path.join(temp_dir, f"rot_{angle}.jpg")
        rotated.save(base_path)
        txt = run_win_ocr(base_path)
        add_chunk_if_informative(all_chunks, txt)

        # 2. High-contrast enhancement to overcome holographic reflection / glare
        try:
            contr = ImageEnhance.Contrast(rotated).enhance(1.8)
            contr_path = os.path.join(temp_dir, f"contr_{angle}.jpg")
            contr.save(contr_path)
            txt_contr = run_win_ocr(contr_path)
            add_chunk_if_informative(all_chunks, txt_contr)
        except Exception:
            pass

        # 3. Grayscale
        try:
            gray = ImageOps.grayscale(rotated)
            gray_path = os.path.join(temp_dir, f"gray_{angle}.jpg")
            gray.save(gray_path)
            txt_gray = run_win_ocr(gray_path)
            add_chunk_if_informative(all_chunks, txt_gray)
        except Exception:
            pass

        # 4. Mid-region crop focusing on pass details (Route, Stop, Roll No, Student Name)
        try:
            w, h = rotated.size
            mid_crop = rotated.crop((0, int(h * 0.15), w, int(h * 0.85)))
            mid_path = os.path.join(temp_dir, f"mid_{angle}.jpg")
            mid_crop.save(mid_path)
            txt_mid = run_win_ocr(mid_path)
            add_chunk_if_informative(all_chunks, txt_mid)

            # Mid-crop with contrast
            mid_contr = ImageEnhance.Contrast(mid_crop).enhance(1.8)
            mid_contr_path = os.path.join(temp_dir, f"mid_contr_{angle}.jpg")
            mid_contr.save(mid_contr_path)
            txt_mid_contr = run_win_ocr(mid_contr_path)
            add_chunk_if_informative(all_chunks, txt_mid_contr)
        except Exception:
            pass

    return "\n---\n".join(all_chunks)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: py ocr_processor.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    result_text = process_file(file_path)
    # Safely write UTF-8 to stdout
    sys.stdout.buffer.write(result_text.encode("utf-8", errors="replace"))
    sys.stdout.buffer.write(b"\n")
