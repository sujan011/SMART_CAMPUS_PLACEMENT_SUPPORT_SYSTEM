"""Extracts plain text from an uploaded resume PDF, used before sending to the ATS AI analyzer."""
import pdfplumber


def extract_text_from_pdf(file_obj) -> str:
    text_parts = []
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)
