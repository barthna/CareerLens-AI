import io
import docx
from PyPDF2 import PdfReader
from fastapi import UploadFile, HTTPException

class ResumeParser:
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB Limit

    @classmethod
    def validate_file(cls, file: UploadFile):
        """Validate size and file headers."""
        # 1. Validate File Extension
        filename = file.filename.lower()
        if not (filename.endswith(".pdf") or filename.endswith(".docx")):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a PDF or DOCX file."
            )
        
        # 2. Check File Size (Iteratively read to check size limit)
        content_size = 0
        chunk_size = 8192
        while True:
            chunk = file.file.read(chunk_size)
            if not chunk:
                break
            content_size += len(chunk)
            if content_size > cls.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="File too large. Maximum size allowed is 5MB."
                )
        
        if content_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file uploaded."
            )
            
        # Reset file cursor for later read operations
        file.file.seek(0)

    @classmethod
    def extract_text(cls, file: UploadFile) -> str:
        """Extract plain text based on file type."""
        filename = file.filename.lower()
        file_bytes = file.file.read()
        file.file.seek(0)
        
        if filename.endswith(".pdf"):
            return cls._extract_pdf_text(file_bytes)
        elif filename.endswith(".docx"):
            return cls._extract_docx_text(file_bytes)
        else:
            raise HTTPException(status_code=400, detail="Invalid file type.")

    @staticmethod
    def _extract_pdf_text(file_bytes: bytes) -> str:
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            
            cleaned_text = text.strip()
            if not cleaned_text:
                raise ValueError("PDF content is empty or contains non-extractable text (e.g. image-only PDF).")
            return cleaned_text
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse PDF resume: {str(e)}"
            )

    @staticmethod
    def _extract_docx_text(file_bytes: bytes) -> str:
        try:
            docx_file = io.BytesIO(file_bytes)
            doc = docx.Document(docx_file)
            text = []
            for paragraph in doc.paragraphs:
                if paragraph.text:
                    text.append(paragraph.text)
            
            cleaned_text = "\n".join(text).strip()
            if not cleaned_text:
                raise ValueError("DOCX content is empty.")
            return cleaned_text
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse DOCX resume: {str(e)}"
            )
