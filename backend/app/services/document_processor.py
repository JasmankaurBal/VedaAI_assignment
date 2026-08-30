"""
Document processing service
Converts PDFs and images to standardized format for processing
"""

import io
import base64
from typing import List
import pymupdf as fitz
from PIL import Image
from docx import Document

class ProcessedPage:
    """Represents a single processed page"""
    
    def __init__(self, page_num: int, image_bytes: bytes = b"", image_base64: str = "", text_content: str = ""):
        self.page_num = page_num
        self.image_bytes = image_bytes
        self.image_base64 = image_base64
        self.text_content = text_content
        self.width = 0
        self.height = 0
        
        # Get dimensions from PIL
        try:
            img = Image.open(io.BytesIO(image_bytes))
            self.width = img.width
            self.height = img.height
        except:
            pass

async def process_document(file_content: bytes, filename: str) -> List[ProcessedPage]:
    """
    Process a PDF, DOCX, or image document into standardized pages
    Returns list of ProcessedPage objects
    """
    
    pages = []
    
    try:
        # Check if it's a PDF
        filename_lower = filename.lower()

        if filename_lower.endswith('.pdf'):
            pdf_document = fitz.open(stream=file_content, filetype="pdf")
            
            for page_idx in range(len(pdf_document)):
                # Convert PDF page to image (PNG)
                page = pdf_document[page_idx]
                
                # Render at high DPI for better quality
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                image_bytes = pix.tobytes("png")
                
                # Convert to base64
                image_base64 = base64.b64encode(image_bytes).decode()
                
                pages.append(ProcessedPage(
                    page_num=page_idx + 1,
                    image_bytes=image_bytes,
                    image_base64=image_base64
                ))
            
            pdf_document.close()
            
        elif filename_lower.endswith(('.png', '.jpg', '.jpeg')):
            # It's an image (PNG, JPG, etc.)
            img = Image.open(io.BytesIO(file_content))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as PNG bytes
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            image_bytes = img_buffer.getvalue()
            
            # Convert to base64
            image_base64 = base64.b64encode(image_bytes).decode()
            
            pages.append(ProcessedPage(
                page_num=1,
                image_bytes=image_bytes,
                image_base64=image_base64
            ))
        elif filename_lower.endswith('.docx'):
            document = Document(io.BytesIO(file_content))
            text_content = "\n".join(
                paragraph.text for paragraph in document.paragraphs
                if paragraph.text.strip()
            ).strip()

            if not text_content:
                raise ValueError("DOCX contains no readable paragraph text")

            pages.append(ProcessedPage(page_num=1, text_content=text_content))
        else:
            raise ValueError("Unsupported document format")
        
        if not pages:
            raise ValueError("No pages extracted from document")
        
        return pages
        
    except Exception as e:
        raise Exception(f"Failed to process document: {str(e)}")
