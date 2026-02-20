import sys
try:
    import fitz # PyMuPDF
    import pytesseract
    from PIL import Image
    import io

    doc = fitz.open('teste gil.pdf')
    text = ""
    for page in doc:
        pix = page.get_pixmap()
        img = Image.open(io.BytesIO(pix.tobytes()))
        text += pytesseract.image_to_string(img, lang='por') + "\n\n"
    
    with open('ocr_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("OCR complete")
except Exception as e:
    print(f"Error: {e}")
