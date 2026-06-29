import re
import io
import logging
from datetime import date
from typing import Optional

from PIL import Image
import pytesseract
import cv2
import numpy as np

logger = logging.getLogger(__name__)


def preprocess_image(img: Image.Image) -> Image.Image:
    arr = np.array(img)
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, h=30)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return Image.fromarray(thresh)


def ocr_image(img: Image.Image, preprocess: bool = True) -> str:
    if preprocess:
        img = preprocess_image(img)
    return pytesseract.image_to_string(img)


def ocr_pdf(pdf_bytes: bytes, dpi: int = 300) -> str:
    from pdf2image import convert_from_bytes
    images = convert_from_bytes(pdf_bytes, dpi=dpi)
    text_parts = []
    for i, img in enumerate(images):
        page_text = ocr_image(img)
        text_parts.append(f"--- Page {i+1} ---\n{page_text}")
    return "\n".join(text_parts)


def ocr_from_bytes(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower()
    if ext.endswith(".pdf"):
        return ocr_pdf(file_bytes)
    img = Image.open(io.BytesIO(file_bytes))
    return ocr_image(img)


def parse_supplier_name(text: str) -> Optional[str]:
    patterns = [
        r"(?:Supplier|Vendor|Company|Seller|From)\s*[:;]\s*(.+)",
        r"(?:Supplied by|Sold by|Prepared for)\s*[:;]\s*(.+)",
        r"^(.*?)(?:\n|$)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE | re.MULTILINE)
        if m:
            val = m.group(1).strip()
            if val and len(val) > 2:
                return val
    return None


def parse_unit_price(text: str) -> Optional[float]:
    patterns = [
        r"(?:Unit Price|Price per unit|Rate)\s*[:;]?\s*\$?([\d,]+\.?\d*)",
        r"(?:Price|Cost)\s*[:;]?\s*\$?([\d,]+\.?\d*)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return float(m.group(1).replace(",", ""))
    return None


def parse_total_price(text: str) -> Optional[float]:
    patterns = [
        r"(?:Total|Total Price|Total Amount|Amount Due|Grand Total)\s*[:;]?\s*\$?([\d,]+\.?\d{0,2})",
        r"(?:Subtotal|Balance Due)\s*[:;]?\s*\$?([\d,]+\.?\d{0,2})",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return float(m.group(1).replace(",", ""))
    return None


def parse_delivery_days(text: str) -> Optional[int]:
    patterns = [
        r"(?:Delivery|Deliver within|Delivery Time)\s*[:;]?\s*(\d+)\s*(?:days|business days|working days)",
        r"(\d+)\s*(?:days|business days|working days)\s*(?:delivery|lead time)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return int(m.group(1))
    return None


def parse_payment_terms(text: str) -> Optional[str]:
    patterns = [
        r"(?:Payment Terms|Terms|Payment)\s*[:;]\s*(.+?)(?:\n|$)",
        r"(?:Net\s*\d+|COD|EOM|Cash on delivery|Letter of credit)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(0).strip()
    return None


def parse_warranty(text: str) -> Optional[str]:
    patterns = [
        r"(?:Warranty|Guarantee)\s*[:;]\s*(.+?)(?:\n|$)",
        r"(\d+\s*(?:year|month|day)\s*(?:warranty|guarantee))",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(0).strip()
    return None


def parse_invoice_number(text: str) -> Optional[str]:
    patterns = [
        r"(?:Invoice\s*(?:No|Number|#|ID))\s*[:;]?\s*(\S+)",
        r"(?:Inv\s*#|Invoice\s*Number)\s*[:;]?\s*(\S+)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return None


def parse_dates(text: str) -> tuple[Optional[date], Optional[date]]:
    invoice_date = None
    due_date = None

    inv_patterns = [
        r"(?:Invoice Date|Date of Invoice|Issue Date)\s*[:;]?\s*([\d]{1,2}[/\-\.][\d]{1,2}[/\-\.][\d]{2,4})",
        r"(?:Date)\s*[:;]?\s*([\d]{1,2}[/\-\.][\d]{1,2}[/\-\.][\d]{2,4})",
    ]
    for p in inv_patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            invoice_date = _parse_date_str(m.group(1))
            break

    due_patterns = [
        r"(?:Due Date|Payment Due|Date Due)\s*[:;]?\s*([\d]{1,2}[/\-\.][\d]{1,2}[/\-\.][\d]{2,4})",
    ]
    for p in due_patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            due_date = _parse_date_str(m.group(1))
            break

    return invoice_date, due_date


def _parse_date_str(s: str) -> Optional[date]:
    parts = re.split(r"[/\-\.]", s)
    if len(parts) != 3:
        return None
    try:
        a, b, c = int(parts[0]), int(parts[1]), int(parts[2])
        if c < 100:
            c += 2000
        if c > 31:
            return date(c, a, b)
        return date(c, b, a)
    except (ValueError, OverflowError):
        return None


def extract_all(text: str) -> dict:
    invoice_date, due_date = parse_dates(text)
    return {
        "supplier_name": parse_supplier_name(text),
        "unit_price": parse_unit_price(text),
        "total_price": parse_total_price(text),
        "delivery_days": parse_delivery_days(text),
        "payment_terms": parse_payment_terms(text),
        "warranty": parse_warranty(text),
        "invoice_number": parse_invoice_number(text),
        "invoice_date": str(invoice_date) if invoice_date else None,
        "due_date": str(due_date) if due_date else None,
    }
