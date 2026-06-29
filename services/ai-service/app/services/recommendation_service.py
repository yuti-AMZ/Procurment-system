import math
from app.services.data_store import store
from app.models import SupplierRecord, QuotationRecord, PurchaseOrderRecord
from app import database as db
from app.schemas.recommendation import (
    SupplierPerformanceScore, QuotationComparisonResult, CostSavingInsight,
    SupplierRankingItem, SupplierRankingResult, RecommendationResult, ReasonDetail,
    InvoiceValidationRequest, InvoiceValidationResult, ValidationCheck)
from typing import List, Optional


def score_supplier(s: SupplierRecord) -> float:
    score = 0.0
    if s.total_orders > 0:
        score += min(s.total_orders / 10, 1.0) * 25
    if s.quote_count > 0 and s.average_quote > 0:
        score += min(1.0 / (s.average_quote / 100000), 1.0) * 25
    if s.on_time_delivery_rate > 0:
        score += s.on_time_delivery_rate * 30
    if s.total_spend > 0:
        score += min(s.total_spend / 500000, 1.0) * 20
    return round(score, 2)


def compare_quotations(rfq_id: int) -> QuotationComparisonResult:
    quotations = [q for q in store.get_quotations() if q.rfq_id == rfq_id]
    rfq = next((r for r in store.get_rfqs() if r.rfq_id == rfq_id), None)

    if not quotations:
        return QuotationComparisonResult(
            rfq_id=rfq_id, rfq_number=rfq.rfq_number if rfq else None,
            rfq_title=rfq.title if rfq else None,
            recommendations=[],
            summary="No quotations submitted for this RFQ yet."
        )

    scored = []
    for q in quotations:
        sup = store.get_supplier(q.supplier_id)
        if sup:
            score = score_supplier(sup)
            rec = "Recommended"
            if score >= 70:
                rec = "Strongly Recommended"
            elif score < 40:
                rec = "Not Recommended"
            scored.append(SupplierPerformanceScore(
                supplier_id=sup.supplier_id,
                company_name=sup.company_name,
                total_orders=sup.total_orders,
                total_spend=sup.total_spend,
                average_quote=sup.average_quote,
                quote_count=sup.quote_count,
                on_time_delivery_rate=sup.on_time_delivery_rate,
                performance_score=score,
                recommendation=rec,
            ))

    scored.sort(key=lambda x: x.performance_score, reverse=True)

    best = scored[0] if scored else None
    summary = (
        f"Top recommendation: {best.company_name} (score: {best.performance_score}). "
        f"{len(scored)} supplier(s) evaluated."
        if best else "No suppliers evaluated."
    )

    return QuotationComparisonResult(
        rfq_id=rfq_id,
        rfq_number=rfq.rfq_number if rfq else None,
        rfq_title=rfq.title if rfq else None,
        recommendations=scored,
        summary=summary,
    )


def get_cost_saving_insights() -> list[CostSavingInsight]:
    pos = store.get_pos()
    if not pos:
        return []

    category_data = {}
    for po in pos:
        dept = po.department or "Uncategorized"
        if dept not in category_data:
            category_data[dept] = {"total": 0.0, "count": 0}
        category_data[dept]["total"] += po.total_amount
        category_data[dept]["count"] += 1

    insights = []
    for cat, data in category_data.items():
        avg = data["total"] / data["count"] if data["count"] > 0 else 0
        market_avg = avg * 0.85
        saving = avg - market_avg
        pct = ((avg - market_avg) / avg * 100) if avg > 0 else 0
        if saving > 0:
            insights.append(CostSavingInsight(
                category=cat,
                current_avg_price=round(avg, 2),
                market_avg_price=round(market_avg, 2),
                potential_saving=round(saving * data["count"], 2),
                saving_percentage=round(pct, 1),
                recommendation=(
                    f"Negotiate {cat} spend — potential {pct:.0f}% saving "
                    f"({saving * data['count']:,.0f} total)"
                ),
            ))

    insights.sort(key=lambda x: x.potential_saving, reverse=True)
    return insights


def get_top_suppliers(limit: int = 5) -> list[SupplierPerformanceScore]:
    suppliers = store.get_suppliers()
    scored = []
    for s in suppliers:
        score = score_supplier(s)
        rec = "Recommended"
        if score >= 70: rec = "Strongly Recommended"
        elif score < 40: rec = "Not Recommended"
        scored.append(SupplierPerformanceScore(
            supplier_id=s.supplier_id,
            company_name=s.company_name,
            total_orders=s.total_orders,
            total_spend=s.total_spend,
            average_quote=s.average_quote,
            quote_count=s.quote_count,
            on_time_delivery_rate=s.on_time_delivery_rate,
            performance_score=score,
            recommendation=rec,
        ))
    scored.sort(key=lambda x: x.performance_score, reverse=True)
    return scored[:limit]


def _compute_price_score(supplier_price: float, lowest_price: float) -> float:
    if lowest_price <= 0 or supplier_price <= 0:
        return 0.0
    return round((lowest_price / supplier_price) * 100, 2)


def _compute_delivery_score(supplier_days: int, fastest_days: int) -> float:
    if fastest_days <= 0 or supplier_days <= 0:
        return 0.0
    return round((fastest_days / supplier_days) * 100, 2)


def _compute_reliability_score(s: SupplierRecord) -> float:
    total = s.successful_orders + s.cancelled_orders + s.late_deliveries
    score = 0.0

    if total > 0:
        success_rate = s.successful_orders / total
        score += success_rate * 30

        cancel_penalty = (s.cancelled_orders / total) * 15
        score -= cancel_penalty

        late_penalty = (s.late_deliveries / total) * 15
        score -= late_penalty

    if s.completed_procurements > 0:
        proc_score = min(s.completed_procurements / 20, 1.0) * 20
        score += proc_score

    if s.supplier_rating > 0:
        rating_score = (s.supplier_rating / 5.0) * 20
        score += rating_score

    if s.on_time_delivery_rate > 0:
        score += s.on_time_delivery_rate * 15

    score = max(0.0, min(score, 100.0))
    return round(score, 2)


def _compute_total_score(price: float, delivery: float, reliability: float) -> float:
    return round((price * 0.50) + (delivery * 0.30) + (reliability * 0.20), 2)


def _recommendation_label(score: float) -> str:
    if score >= 80:
        return "Strongly Recommended"
    elif score >= 60:
        return "Recommended"
    elif score >= 40:
        return "Consider"
    else:
        return "Not Recommended"


def _build_explanation(supplier_name: str, price_score: float, delivery_score: float,
                       reliability_score: float, total_score: float,
                       quotation_amount: float, delivery_days: int | None) -> str:
    parts = [f"{supplier_name} scored {total_score}/100."]
    parts.append(f"Price score {price_score}/100 (quotation: ${quotation_amount:,.2f}).")
    if delivery_days:
        parts.append(f"Delivery score {delivery_score}/100 ({delivery_days} days).")
    parts.append(f"Reliability score {reliability_score}/100 based on historical performance.")
    return " ".join(parts)


def rank_suppliers(rfq_id: int) -> SupplierRankingResult:
    quotations = [q for q in store.get_quotations() if q.rfq_id == rfq_id]
    rfq = next((r for r in store.get_rfqs() if r.rfq_id == rfq_id), None)

    if not quotations:
        return SupplierRankingResult(
            rfq_id=rfq_id,
            rfq_number=rfq.rfq_number if rfq else None,
            rfq_title=rfq.title if rfq else None,
            rankings=[],
            summary="No quotations found for this RFQ."
        )

    lowest_price = min(q.total_amount for q in quotations if q.total_amount > 0)
    delivery_days_available = [q.delivery_days for q in quotations if q.delivery_days]
    fastest_days = min(delivery_days_available) if delivery_days_available else None

    rankings = []
    for q in quotations:
        sup = store.get_supplier(q.supplier_id)

        price_score = _compute_price_score(q.total_amount, lowest_price)

        delivery_score = 0.0
        if q.delivery_days and fastest_days:
            delivery_score = _compute_delivery_score(q.delivery_days, fastest_days)

        reliability_score = 0.0
        if sup:
            reliability_score = _compute_reliability_score(sup)

        total_score = _compute_total_score(price_score, delivery_score, reliability_score)
        rec = _recommendation_label(total_score)
        explanation = _build_explanation(
            q.supplier_name, price_score, delivery_score,
            reliability_score, total_score, q.total_amount, q.delivery_days
        )

        rankings.append(SupplierRankingItem(
            supplier_id=q.supplier_id,
            supplier_name=q.supplier_name,
            quotation_amount=q.total_amount,
            delivery_days=q.delivery_days,
            price_score=price_score,
            delivery_score=delivery_score,
            reliability_score=reliability_score,
            total_score=total_score,
            recommendation=rec,
            explanation=explanation,
        ))

        db.save_supplier_score(
            supplier_id=q.supplier_id, supplier_name=q.supplier_name,
            rfq_id=rfq_id, quotation_amount=q.total_amount,
            delivery_days=q.delivery_days,
            price_score=price_score, delivery_score=delivery_score,
            reliability_score=reliability_score, total_score=total_score,
            recommendation=rec, explanation=explanation,
        )

    rankings.sort(key=lambda x: x.total_score, reverse=True)

    best = rankings[0] if rankings else None
    if best:
        summary = (
            f"Top ranked: {best.supplier_name} (score: {best.total_score}/100). "
            f"{len(rankings)} supplier(s) evaluated. "
            f"Weightings: Price 50% | Delivery 30% | Reliability 20%."
        )
    else:
        summary = "No suppliers could be ranked."

    return SupplierRankingResult(
        rfq_id=rfq_id,
        rfq_number=rfq.rfq_number if rfq else None,
        rfq_title=rfq.title if rfq else None,
        rankings=rankings,
        summary=summary,
    )


def _generate_price_reason(price_score: float, amount: float, lowest_price: float) -> str:
    if price_score >= 100:
        return f"Lowest evaluated price (${amount:,.2f})"
    saving = lowest_price / (price_score / 100) if price_score > 0 else 0
    return f"Competitive price at ${amount:,.2f} (${saving - lowest_price:,.2f} above lowest)"


def _generate_delivery_reason(delivery_score: float, days: int | None, fastest_days: int | None) -> str:
    if not days:
        return ""
    if delivery_score >= 100:
        return f"Fastest delivery ({days} days)"
    return f"Delivery in {days} days (fastest: {fastest_days} days)"


def _generate_reliability_reasons(s: SupplierRecord, reliability_score: float) -> list[str]:
    reasons = []
    if s.successful_orders > 0 or s.completed_procurements > 0:
        total_completed = s.successful_orders + s.completed_procurements
        reasons.append(f"{total_completed} completed procurements")
    if s.on_time_delivery_rate > 0:
        pct = s.on_time_delivery_rate * 100
        reasons.append(f"{pct:.0f}% on-time delivery rate")
    if s.supplier_rating > 0:
        reasons.append(f"Supplier rating: {s.supplier_rating}/5.0")
    if s.cancelled_orders == 0 and s.total_orders > 0:
        reasons.append("Zero cancelled orders")
    if s.late_deliveries == 0 and s.total_orders > 0:
        reasons.append("Zero late deliveries")
    if not reasons:
        reasons.append("Limited historical data")
    return reasons


def generate_recommendation(rfq_id: int) -> RecommendationResult:
    ranking = rank_suppliers(rfq_id)

    if not ranking.rankings:
        return RecommendationResult(
            rfq_id=rfq_id,
            rfq_number=ranking.rfq_number,
            rfq_title=ranking.rfq_title,
            recommended_supplier_id=None,
            recommended_supplier_name=None,
            total_score=None,
            recommendation=None,
            reasons=[],
            summary=ranking.summary,
        )

    best = ranking.rankings[0]
    sup = store.get_supplier(best.supplier_id)
    lowest_price = min(r.quotation_amount for r in ranking.rankings if r.quotation_amount > 0)
    fastest_days = min((r.delivery_days for r in ranking.rankings if r.delivery_days), default=None)
    price_reason = _generate_price_reason(best.price_score, best.quotation_amount, lowest_price)
    delivery_reason = _generate_delivery_reason(best.delivery_score, best.delivery_days, fastest_days)

    reasons: list[ReasonDetail] = [
        ReasonDetail(aspect="Price", detail=price_reason, score=best.price_score),
    ]
    if delivery_reason:
        reasons.append(ReasonDetail(aspect="Delivery", detail=delivery_reason, score=best.delivery_score))

    reliability_detail = ""
    if sup:
        rel_reasons = _generate_reliability_reasons(sup, best.reliability_score)
        reliability_detail = "; ".join(rel_reasons)
    else:
        reliability_detail = "No historical data available"
    reasons.append(ReasonDetail(aspect="Reliability", detail=reliability_detail, score=best.reliability_score))

    summary = (
        f"{best.supplier_name} ranked first because "
        + f"{price_reason.lower()}, "
        + (f"{delivery_reason.lower()}, " if delivery_reason else "")
        + f"and {reliability_detail.lower()}. "
        + f"Final score: {best.total_score}/100."
    )

    db.save_recommendation(
        rfq_id=rfq_id, rfq_number=ranking.rfq_number,
        rfq_title=ranking.rfq_title,
        recommended_supplier_id=best.supplier_id,
        recommended_supplier_name=best.supplier_name,
        total_score=best.total_score,
        recommendation=best.recommendation,
        reasons=reasons,
        summary=summary,
    )

    return RecommendationResult(
        rfq_id=rfq_id,
        rfq_number=ranking.rfq_number,
        rfq_title=ranking.rfq_title,
        recommended_supplier_id=best.supplier_id,
        recommended_supplier_name=best.supplier_name,
        total_score=best.total_score,
        recommendation=best.recommendation,
        reasons=reasons,
        summary=summary,
    )


def _fuzzy_match_name(ocr_name: str, known_name: str) -> bool:
    a = ocr_name.lower().strip()
    b = known_name.lower().strip()
    return a == b or a in b or b in a


def _find_best_supplier_match(ocr_supplier: Optional[str]) -> Optional[SupplierRecord]:
    if not ocr_supplier:
        return None
    for s in store.get_suppliers():
        if _fuzzy_match_name(ocr_supplier, s.company_name):
            return s
    return None


def _find_matching_po(supplier_id: int) -> Optional[PurchaseOrderRecord]:
    pos = [po for po in store.get_pos() if po.vendor_id == supplier_id]
    if pos:
        return max(pos, key=lambda po: po.created_at)
    return None


def _find_matching_quotation(supplier_id: int) -> Optional[QuotationRecord]:
    quotes = [q for q in store.get_quotations() if q.supplier_id == supplier_id]
    if quotes:
        return max(quotes, key=lambda q: q.created_at)
    return None


def validate_invoice(data: InvoiceValidationRequest) -> InvoiceValidationResult:
    checks: list[ValidationCheck] = []

    sup = _find_best_supplier_match(data.supplier_name)
    if sup:
        checks.append(ValidationCheck(
            field="supplier_name",
            status="pass",
            expected=sup.company_name,
            actual=data.supplier_name,
            reason=f"Supplier matches known record: {sup.company_name}",
        ))
    elif data.supplier_name:
        checks.append(ValidationCheck(
            field="supplier_name",
            status="warn",
            expected="Known supplier",
            actual=data.supplier_name,
            reason=f"No matching supplier found for '{data.supplier_name}' in system",
        ))
    else:
        checks.append(ValidationCheck(
            field="supplier_name",
            status="warn",
            expected="Known supplier",
            actual="Not provided",
            reason="Supplier name not extracted from document",
        ))

    po = None
    if sup:
        po = _find_matching_po(sup.supplier_id)

    if data.total_price and po:
        diff_pct = abs(data.total_price - po.total_amount) / po.total_amount * 100
        if diff_pct <= 5:
            checks.append(ValidationCheck(
                field="total_price",
                status="pass",
                expected=f"${po.total_amount:,.2f}",
                actual=f"${data.total_price:,.2f}",
                reason=f"Amount within 5% tolerance of PO #{po.po_number} (diff: {diff_pct:.1f}%)",
            ))
        elif diff_pct <= 20:
            checks.append(ValidationCheck(
                field="total_price",
                status="warn",
                expected=f"${po.total_amount:,.2f}",
                actual=f"${data.total_price:,.2f}",
                reason=f"Amount deviates {diff_pct:.1f}% from PO #{po.po_number} (tolerance: 5%)",
            ))
        else:
            checks.append(ValidationCheck(
                field="total_price",
                status="fail",
                expected=f"${po.total_amount:,.2f}",
                actual=f"${data.total_price:,.2f}",
                reason=f"Amount deviates {diff_pct:.1f}% from PO #{po.po_number} — exceeds tolerance",
            ))
    elif data.total_price:
        checks.append(ValidationCheck(
            field="total_price",
            status="warn",
            expected="Matching PO amount",
            actual=f"${data.total_price:,.2f}",
            reason="No matching PO found to validate amount against",
        ))
    else:
        checks.append(ValidationCheck(
            field="total_price",
            status="warn",
            expected="Matching PO amount",
            actual="Not provided",
            reason="Total price not extracted from document",
        ))

    quotation = None
    if sup:
        quotation = _find_matching_quotation(sup.supplier_id)

    if data.delivery_days and quotation and quotation.delivery_days:
        if data.delivery_days == quotation.delivery_days:
            checks.append(ValidationCheck(
                field="delivery_days",
                status="pass",
                expected=f"{quotation.delivery_days} days",
                actual=f"{data.delivery_days} days",
                reason=f"Delivery terms match quotation (both {quotation.delivery_days} days)",
            ))
        elif abs(data.delivery_days - quotation.delivery_days) <= 3:
            checks.append(ValidationCheck(
                field="delivery_days",
                status="warn",
                expected=f"{quotation.delivery_days} days",
                actual=f"{data.delivery_days} days",
                reason=f"Delivery terms differ by {abs(data.delivery_days - quotation.delivery_days)} days from quotation",
            ))
        else:
            checks.append(ValidationCheck(
                field="delivery_days",
                status="fail",
                expected=f"{quotation.delivery_days} days",
                actual=f"{data.delivery_days} days",
                reason=f"Delivery terms differ significantly from quotation ({quotation.delivery_days} days)",
            ))
    elif data.delivery_days:
        checks.append(ValidationCheck(
            field="delivery_days",
            status="warn",
            expected="Quotation delivery terms",
            actual=f"{data.delivery_days} days",
            reason="No quotation delivery terms found to compare against",
        ))
    else:
        checks.append(ValidationCheck(
            field="delivery_days",
            status="warn",
            expected="Quotation delivery terms",
            actual="Not provided",
            reason="Delivery days not extracted from document",
        ))

    if data.invoice_number:
        if store.is_invoice_number_unique(data.invoice_number):
            checks.append(ValidationCheck(
                field="invoice_number",
                status="pass",
                expected="Unique",
                actual=data.invoice_number,
                reason=f"Invoice number '{data.invoice_number}' is unique",
            ))
        else:
            existing = store.get_invoice_by_number(data.invoice_number)
            checks.append(ValidationCheck(
                field="invoice_number",
                status="fail",
                expected="Unique",
                actual=data.invoice_number,
                reason=f"Invoice number '{data.invoice_number}' already exists (duplicate)",
            ))
    else:
        checks.append(ValidationCheck(
            field="invoice_number",
            status="warn",
            expected="Unique invoice number",
            actual="Not provided",
            reason="Invoice number not extracted from document",
        ))

    has_fail = any(c.status == "fail" for c in checks)
    has_warn = any(c.status == "warn" for c in checks)

    if has_fail:
        overall = "rejected"
        summary = "Invoice validation FAILED. "
    elif has_warn:
        overall = "warning"
        summary = "Invoice validated with warnings. "
    else:
        overall = "approved"
        summary = "Invoice validated successfully. "

    passed = sum(1 for c in checks if c.status == "pass")
    failed = sum(1 for c in checks if c.status == "fail")
    warned = sum(1 for c in checks if c.status == "warn")
    summary += f"{passed} check(s) passed, {warned} warning(s), {failed} failure(s)."

    return InvoiceValidationResult(
        ocr_data=data,
        overall_status=overall,
        checks=checks,
        summary=summary,
    )
