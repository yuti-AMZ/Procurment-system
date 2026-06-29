import logging
from app.services.data_store import store
from app.services.recommendation_service import (
    rank_suppliers, generate_recommendation, validate_invoice,
    _find_best_supplier_match, _find_matching_po)
from app.schemas.recommendation import InvoiceValidationRequest
from app import database as db

logger = logging.getLogger(__name__)


def on_quotation_submitted(data: dict):
    rfq_id = data.get("rfqId", 0)
    supplier_name = data.get("supplierName", "Unknown")
    logger.info("Quotation submitted by %s for RFQ %d — running ranking", supplier_name, rfq_id)

    try:
        ranking = rank_suppliers(rfq_id)
        if ranking.rankings:
            best = ranking.rankings[0]
            logger.info(
                "Ranking complete for RFQ %d: top supplier %s (score: %s)",
                rfq_id, best.supplier_name, best.total_score,
            )
        else:
            logger.info("Ranking complete for RFQ %d: no suppliers ranked", rfq_id)
    except Exception as e:
        logger.error("Ranking failed for RFQ %d: %s", rfq_id, e)

    try:
        rec = generate_recommendation(rfq_id)
        if rec.recommended_supplier_name:
            logger.info(
                "Recommendation for RFQ %d: %s (%s)",
                rfq_id, rec.recommended_supplier_name, rec.recommendation,
            )
    except Exception as e:
        logger.error("Recommendation failed for RFQ %d: %s", rfq_id, e)

    _publish_analytics_update("quotation.submitted", {"rfq_id": rfq_id})


def on_invoice_uploaded(data: dict):
    invoice_number = data.get("invoiceNumber") or data.get("invoice_number", "?")
    supplier_name = data.get("supplierName", "Unknown")
    logger.info("Invoice %s uploaded from %s — running validation", invoice_number, supplier_name)

    try:
        req = InvoiceValidationRequest(
            supplier_name=supplier_name,
            total_price=data.get("totalAmount"),
            delivery_days=data.get("deliveryDays"),
            invoice_number=invoice_number,
        )
        result = validate_invoice(req)
        logger.info(
            "Invoice %s validation: %s (%d passed, %d failed)",
            invoice_number, result.overall_status,
            sum(1 for c in result.checks if c.status == "pass"),
            sum(1 for c in result.checks if c.status == "fail"),
        )
    except Exception as e:
        logger.error("Invoice validation failed for %s: %s", invoice_number, e)

    document_url = data.get("documentUrl") or data.get("filePath")
    if document_url:
        logger.info("Document available at %s — OCR could be triggered", document_url)
    else:
        logger.info("No document URL in invoice event — OCR skip")

    _publish_analytics_update("invoice.uploaded", {"invoice_number": invoice_number})


def on_supplier_updated(data: dict):
    supplier_id = data.get("supplierId", 0)
    company_name = data.get("companyName", "Unknown")
    logger.info("Supplier updated: %s (ID %d) — refreshing analytics", company_name, supplier_id)

    sup = store.get_supplier(supplier_id)
    if sup:
        if data.get("status"):
            store.update_supplier(supplier_id, status=data["status"])
        if data.get("companyName"):
            store.update_supplier(supplier_id, company_name=data["companyName"])
        if data.get("supplierRating"):
            store.update_supplier(supplier_id, supplier_rating=float(data["supplierRating"]))
        if data.get("successfulOrders"):
            store.update_supplier(supplier_id, successful_orders=int(data["successfulOrders"]))
        if data.get("cancelledOrders"):
            store.update_supplier(supplier_id, cancelled_orders=int(data["cancelledOrders"]))
        if data.get("lateDeliveries"):
            store.update_supplier(supplier_id, late_deliveries=int(data["lateDeliveries"]))
        if data.get("completedProcurements"):
            store.update_supplier(supplier_id, completed_procurements=int(data["completedProcurements"]))

    _publish_analytics_update("supplier.updated", {"supplier_id": supplier_id})


def on_rfq_closed(data: dict):
    rfq_id = data.get("rfqId", 0)
    rfq_number = data.get("rfqNumber", "?")
    logger.info("RFQ %s (ID %d) closed — running final ranking", rfq_number, rfq_id)

    try:
        ranking = rank_suppliers(rfq_id)
        if ranking.rankings:
            best = ranking.rankings[0]
            logger.info(
                "Final ranking for RFQ %s: winner %s (score: %s)",
                rfq_number, best.supplier_name, best.total_score,
            )
    except Exception as e:
        logger.error("Final ranking failed for RFQ %d: %s", rfq_id, e)

    try:
        rec = generate_recommendation(rfq_id)
        if rec.recommended_supplier_name:
            logger.info(
                "Final recommendation for RFQ %s: %s",
                rfq_number, rec.recommended_supplier_name,
            )
    except Exception as e:
        logger.error("Final recommendation failed for RFQ %d: %s", rfq_id, e)

    _publish_analytics_update("rfq.closed", {"rfq_id": rfq_id})


def _build_snapshot() -> dict:
    suppliers = store.get_suppliers()
    pos = store.get_pos()
    quotations = store.get_quotations()
    rfqs = store.get_rfqs()
    invoices = store.get_invoices()
    return {
        "supplier_count": len(suppliers),
        "po_count": len(pos),
        "quotation_count": len(quotations),
        "rfq_count": len(rfqs),
        "invoice_count": len(invoices),
        "total_spend": round(sum(p.total_amount for p in pos), 2),
        "total_orders": sum(s.total_orders for s in suppliers),
    }


def _publish_analytics_update(event_type: str, payload: dict):
    snapshot = _build_snapshot()
    try:
        db.save_analytics_event(
            event_type=event_type,
            trigger_source=event_type,
            payload=payload,
            snapshot=snapshot,
        )
        logger.debug("Analytics event saved: %s", event_type)
    except Exception as e:
        logger.warning("Failed to save analytics event: %s", e)

    try:
        from app.main import producer
        producer.publish_notification({
            "type": "analytics.update",
            "trigger": event_type,
            "payload": payload,
            "snapshot": snapshot,
            "timestamp": __import__("datetime").datetime.now().isoformat(),
        })
    except Exception as e:
        logger.warning("Failed to publish analytics notification: %s", e)
