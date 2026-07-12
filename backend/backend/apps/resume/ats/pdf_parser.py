# def pdf_to_text(file) -> str:
#     """Extract raw text from an uploaded PDF file."""
#     try:
#         pdf_reader = PyPDF2.PdfReader(file)
#         text = ""
#         for page in pdf_reader.pages:
#             text += (page.extract_text() or "") + " "
#         return text.strip()
#     except Exception as e:
#         st.error(f"Error reading PDF: {e}")
#         return ""

import PyPDF2


def pdf_to_text(file):
    """
    Extract text from a PDF file.

    Parameters
    ----------
    file : UploadedFile
        PDF uploaded through Django.

    Returns
    -------
    str
        Extracted text.
    """

    try:
        pdf_reader = PyPDF2.PdfReader(file)

        text = ""

        for page in pdf_reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + " "

        return text.strip()

    except Exception as e:
        raise Exception(f"Unable to read PDF: {str(e)}")