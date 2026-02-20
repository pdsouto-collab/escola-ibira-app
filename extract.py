import sys
try:
    import fitz # PyMuPDF
    doc = fitz.open('teste gil.pdf')
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n\n"
    with open('pdf_text_pymupdf.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Extraction complete")
except Exception as e:
    print(f"Error: {e}")
