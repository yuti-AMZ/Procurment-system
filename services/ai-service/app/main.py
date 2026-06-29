import json
import threading
from fastapi import FastAPI
from app.rabbitmq.consumer import RabbitMQConsumer
from app.rabbitmq.producer import RabbitMQProducer
from app.services.data_store import store
from app.models import SupplierRecord, PurchaseOrderRecord, QuotationRecord, RfqRecord, InvoiceRecord
from app.services.automation_service import (
    on_quotation_submitted, on_invoice_uploaded,
    on_supplier_updated, on_rfq_closed)
from app.api import router as ai_router
from app import database as db
from datetime import datetime

app = FastAPI(title="ProcureAI AI Service")
app.include_router(ai_router)

consumer = RabbitMQConsumer()
producer = RabbitMQProducer()


def handle_procurement_event(data: dict, routing_key: str):
    event_type = data.get("eventType", "")
    if "PO_GENERATED" in event_type or "po" in routing_key:
        record = PurchaseOrderRecord(
            po_id=data.get("poId") or hash(data.get("poNumber", "")),
            po_number=data.get("poNumber", ""),
            pr_id=data.get("prId", 0),
            vendor_id=data.get("vendorId") or data.get("supplierId", 0),
            vendor_name=data.get("vendorName") or data.get("supplierName", "Unknown"),
            total_amount=float(data.get("totalAmount", 0)),
            status=data.get("status", "GENERATED"),
            department=data.get("department"),
            requested_by=data.get("requestedBy"),
            created_at=_parse_dt(data.get("timestamp")),
        )
        store.add_po(record)


def handle_rfq_event(data: dict, routing_key: str):
    record = RfqRecord(
        rfq_id=data.get("rfqId", 0),
        rfq_number=data.get("rfqNumber", ""),
        title=data.get("title", ""),
        status=data.get("status", ""),
        created_at=_parse_dt(data.get("timestamp")),
    )
    store.add_rfq(record)


def handle_quotation_event(data: dict, routing_key: str):
    record = QuotationRecord(
        quotation_id=data.get("quotationId", 0),
        quotation_number=data.get("quotationNumber", ""),
        rfq_id=data.get("rfqId", 0),
        supplier_id=data.get("supplierId", 0),
        supplier_name=data.get("supplierName", "Unknown"),
        total_amount=float(data.get("totalAmount", 0)),
        status=data.get("status", ""),
        created_at=_parse_dt(data.get("timestamp")),
    )
    store.add_quotation(record)
    _update_supplier_from_quotation(record)


def handle_supplier_event(data: dict, routing_key: str):
    supplier_id = data.get("supplierId", 0)
    existing = store.get_supplier(supplier_id)
    if existing:
        if data.get("status"):
            store.update_supplier(supplier_id, status=data["status"])
        if data.get("companyName"):
            store.update_supplier(supplier_id, company_name=data["companyName"])
    else:
        record = SupplierRecord(
            supplier_id=supplier_id,
            company_name=data.get("companyName", "Unknown"),
            email=data.get("email"),
            category=data.get("category"),
            status=data.get("status", "PENDING"),
            created_at=_parse_dt(data.get("timestamp")),
        )
        store.add_supplier(record)


def handle_invoice_event(data: dict, routing_key: str):
    inv_num = data.get("invoiceNumber") or data.get("invoice_number", "")
    if inv_num:
        record = InvoiceRecord(
            invoice_id=data.get("invoiceId", hash(inv_num)),
            invoice_number=inv_num,
            supplier_id=data.get("supplierId", 0),
            supplier_name=data.get("supplierName", "Unknown"),
            total_amount=float(data.get("totalAmount", 0)),
            status=data.get("status", "UPLOADED"),
            po_number=data.get("poNumber"),
            created_at=_parse_dt(data.get("timestamp")),
        )
        store.add_invoice(record)

    po_id = data.get("poId")
    if po_id:
        po = next((p for p in store.get_pos() if p.po_id == po_id), None)
        if po:
            store.update_supplier(
                po.vendor_id,
                on_time_delivery_rate=1.0 if data.get("status") == "APPROVED" else 0.5,
            )


def _update_supplier_from_quotation(q: QuotationRecord):
    existing = store.get_supplier(q.supplier_id)
    if not existing:
        store.add_supplier(SupplierRecord(
            supplier_id=q.supplier_id,
            company_name=q.supplier_name,
            status="PENDING",
        ))


def _parse_dt(ts) -> datetime:
    if isinstance(ts, str):
        try:
            return datetime.fromisoformat(ts)
        except (ValueError, TypeError):
            pass
    return datetime.now()


@app.on_event("startup")
async def startup():
    db.init_db()
    consumer.connect()
    producer.connect()
    consumer.register_callback("pr.created.queue", handle_procurement_event)
    consumer.register_callback("pr.approved.queue", handle_procurement_event)
    consumer.register_callback("po.generated.queue", handle_procurement_event)
    consumer.register_callback("rfq.created.queue", handle_rfq_event)
    consumer.register_callback("rfq.published.queue", handle_rfq_event)
    consumer.register_callback("quotation.submitted.queue", handle_quotation_event)
    consumer.register_callback("quotation.submitted.queue", on_quotation_submitted)
    consumer.register_callback("supplier.approved.queue", handle_supplier_event)
    consumer.register_callback("supplier.registered.queue", handle_supplier_event)
    consumer.register_callback("supplier.updated.queue", on_supplier_updated)
    consumer.register_callback("invoice.uploaded.queue", handle_invoice_event)
    consumer.register_callback("invoice.uploaded.queue", on_invoice_uploaded)
    consumer.register_callback("rfq.closed.queue", on_rfq_closed)
    consumer.start_consuming()


@app.on_event("shutdown")
async def shutdown():
    consumer.stop()
    producer.close()


@app.get("/health")
async def health():
    return {
        "status": "UP",
        "suppliers_tracked": len(store.get_suppliers()),
        "purchase_orders_tracked": len(store.get_pos()),
        "quotations_tracked": len(store.get_quotations()),
        "rfqs_tracked": len(store.get_rfqs()),
        "invoices_tracked": len(store.get_invoices()),
        "automation": {
            "quotation.submitted": "ranking + recommendation + analytics",
            "invoice.uploaded": "validation + analytics",
            "supplier.updated": "analytics",
            "rfq.closed": "ranking + recommendation + analytics",
        },
    }
