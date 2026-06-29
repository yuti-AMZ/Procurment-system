from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.recommendation_service import (
    compare_quotations, get_cost_saving_insights, get_top_suppliers,
    rank_suppliers, generate_recommendation, validate_invoice)
from app.schemas.recommendation import (
    QuotationComparisonResult, SupplierPerformanceScore, CostSavingInsight,
    SupplierRankingResult, RecommendationResult, InvoiceValidationRequest,
    InvoiceValidationResult)
from app.services.data_store import store
from app import database as db

router = APIRouter(prefix="/api/ai", tags=["AI Recommendations"])


@router.get("/compare-quotations/{rfq_id}")
async def compare_quotations_endpoint(rfq_id: int) -> QuotationComparisonResult:
    return compare_quotations(rfq_id)


@router.get("/supplier-insights")
async def supplier_insights(limit: int = Query(10, ge=1, le=100)) -> list[SupplierPerformanceScore]:
    return get_top_suppliers(limit)


@router.get("/cost-saving-insights")
async def cost_saving_insights() -> list[CostSavingInsight]:
    return get_cost_saving_insights()


@router.get("/supplier/{supplier_id}/performance")
async def supplier_performance(supplier_id: int) -> dict:
    s = store.get_supplier(supplier_id)
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    from app.services.recommendation_service import score_supplier
    score = score_supplier(s)
    return {
        "supplier_id": s.supplier_id,
        "company_name": s.company_name,
        "total_orders": s.total_orders,
        "total_spend": s.total_spend,
        "average_quote": s.average_quote,
        "performance_score": score,
    }


@router.get("/supplier-ranking/{rfq_id}")
async def supplier_ranking(rfq_id: int) -> SupplierRankingResult:
    return rank_suppliers(rfq_id)


@router.get("/recommend/{rfq_id}")
async def recommend(rfq_id: int) -> RecommendationResult:
    return generate_recommendation(rfq_id)


@router.post("/validate-invoice")
async def validate_invoice_endpoint(data: InvoiceValidationRequest) -> InvoiceValidationResult:
    return validate_invoice(data)


@router.get("/history/scores/{rfq_id}")
async def historical_scores(rfq_id: int):
    return {"rfq_id": rfq_id, "results": db.get_supplier_scores(rfq_id)}


@router.get("/history/recommendations")
async def historical_recommendations(rfq_id: Optional[int] = Query(None), limit: int = Query(20, ge=1, le=100)):
    return {"results": db.get_recommendations(rfq_id, limit)}


@router.get("/history/analytics")
async def historical_analytics(limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0)):
    return {"results": db.get_analytics(limit, offset)}


@router.get("/dashboard")
async def ai_dashboard():
    suppliers = store.get_suppliers()
    pos = store.get_pos()
    quotations = store.get_quotations()
    rfqs = store.get_rfqs()

    from app.services.recommendation_service import score_supplier
    top_suppliers = sorted(
        [s for s in suppliers if s.total_orders > 0],
        key=lambda s: score_supplier(s), reverse=True
    )[:5]

    return {
        "total_suppliers": len(suppliers),
        "total_purchase_orders": len(pos),
        "total_quotations": len(quotations),
        "total_rfqs": len(rfqs),
        "total_spend": round(sum(p.total_amount for p in pos), 2),
        "average_quote_value": round(
            sum(q.total_amount for q in quotations) / len(quotations), 2
        ) if quotations else 0,
        "top_suppliers": [
            {"supplier_id": s.supplier_id, "company_name": s.company_name,
             "score": score_supplier(s), "total_orders": s.total_orders}
            for s in top_suppliers
        ],
    }
