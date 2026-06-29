from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SupplierRecord(BaseModel):
    supplier_id: int
    company_name: str
    email: Optional[str] = None
    category: Optional[str] = None
    status: str = "PENDING"
    total_orders: int = 0
    total_spend: float = 0.0
    average_quote: float = 0.0
    quote_count: int = 0
    on_time_delivery_rate: float = 0.0
    successful_orders: int = 0
    cancelled_orders: int = 0
    late_deliveries: int = 0
    supplier_rating: float = 0.0
    completed_procurements: int = 0
    created_at: datetime = datetime.now()


class PurchaseOrderRecord(BaseModel):
    po_id: int
    po_number: str
    pr_id: int
    vendor_id: int
    vendor_name: str
    total_amount: float
    status: str
    department: Optional[str] = None
    requested_by: Optional[str] = None
    created_at: datetime = datetime.now()


class QuotationRecord(BaseModel):
    quotation_id: int
    quotation_number: str
    rfq_id: int
    supplier_id: int
    supplier_name: str
    total_amount: float
    status: str
    delivery_days: Optional[int] = None
    created_at: datetime = datetime.now()


class RfqRecord(BaseModel):
    rfq_id: int
    rfq_number: str
    title: str
    status: str
    created_at: datetime = datetime.now()


class InvoiceRecord(BaseModel):
    invoice_id: int
    invoice_number: str
    supplier_id: int
    supplier_name: str
    total_amount: float
    status: str
    po_number: Optional[str] = None
    created_at: datetime = datetime.now()
