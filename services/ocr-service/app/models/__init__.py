from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class OCRResult(BaseModel):
    supplier_name: Optional[str] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    delivery_days: Optional[int] = None
    payment_terms: Optional[str] = None
    warranty: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None


class OCRRecord(BaseModel):
    id: int
    filename: str
    supplier_name: Optional[str] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    delivery_days: Optional[int] = None
    payment_terms: Optional[str] = None
    warranty: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    raw_text: str
    created_at: datetime
