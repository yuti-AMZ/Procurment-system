from threading import Lock
from typing import Optional
from app.models import SupplierRecord, PurchaseOrderRecord, QuotationRecord, RfqRecord, InvoiceRecord
from app import database as db


class DataStore:
    _instance = None
    _lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    # --- Supplier ---

    def add_supplier(self, record: SupplierRecord):
        db.add_supplier(record)

    def get_supplier(self, supplier_id: int) -> SupplierRecord | None:
        return db.get_supplier(supplier_id)

    def update_supplier(self, supplier_id: int, **kwargs):
        db.update_supplier(supplier_id, **kwargs)

    def get_suppliers(self) -> list[SupplierRecord]:
        return db.get_suppliers()

    # --- Purchase Order ---

    def add_po(self, record: PurchaseOrderRecord):
        db.add_po(record)

    def get_pos(self) -> list[PurchaseOrderRecord]:
        return db.get_pos()

    # --- Quotation ---

    def add_quotation(self, record: QuotationRecord):
        db.add_quotation(record)

    def get_quotations(self) -> list[QuotationRecord]:
        return db.get_quotations()

    # --- RFQ ---

    def add_rfq(self, record: RfqRecord):
        db.add_rfq(record)

    def get_rfqs(self) -> list[RfqRecord]:
        return db.get_rfqs()

    # --- Invoice ---

    def add_invoice(self, record: InvoiceRecord):
        db.add_invoice(record)

    def get_invoice_by_number(self, invoice_number: str) -> Optional[InvoiceRecord]:
        return db.get_invoice_by_number(invoice_number)

    def get_invoices(self) -> list[InvoiceRecord]:
        return db.get_invoices()

    def is_invoice_number_unique(self, invoice_number: str) -> bool:
        return db.is_invoice_number_unique(invoice_number)


store = DataStore()
