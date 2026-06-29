from datetime import datetime
from collections import defaultdict
from app.schemas import (
    SpendAnalysisQuery, SpendAnalysisResponse, SpendSummary,
    CategorySpend, DepartmentSpend, SupplierSpend, MonthlySpend,
    SupplierRecommendationQuery, SupplierRecommendationResponse,
    SupplierRecommendation, InsightsResponse, InsightItem,
)
from app.services.data_store import store


class SpendAnalysisService:

    def analyze(self, query: SpendAnalysisQuery) -> SpendAnalysisResponse:
        pos = store.get_pos()

        if query.start_date:
            pos = [p for p in pos if p.created_at >= query.start_date]
        if query.end_date:
            pos = [p for p in pos if p.created_at <= query.end_date]
        if query.supplier_id is not None:
            pos = [p for p in pos if p.vendor_id == query.supplier_id]
        if query.department:
            pos = [p for p in pos if p.department == query.department]

        total_spend = sum(p.total_amount for p in pos)
        total_orders = len(pos)

        active_suppliers = len(set(p.vendor_id for p in pos))
        avg_order = total_spend / total_orders if total_orders > 0 else 0

        suppliers = store.get_suppliers()
        top_sup = max(suppliers, key=lambda s: s.total_spend) if suppliers else None
        cat_spend = self._spend_by_category(pos)
        top_cat = max(cat_spend, key=lambda c: c.total_spend) if cat_spend else None

        summary = SpendSummary(
            total_spend=total_spend,
            total_orders=total_orders,
            active_suppliers=active_suppliers,
            average_order_value=avg_order,
            top_category=top_cat.category if top_cat else None,
            top_supplier=top_sup.company_name if top_sup else None,
        )

        if query.group_by == "category":
            breakdown = [c.model_dump() for c in cat_spend]
        elif query.group_by == "department":
            breakdown = [d.model_dump() for d in self._spend_by_department(pos)]
        elif query.group_by == "supplier":
            breakdown = [s.model_dump() for s in self._spend_by_supplier(pos)]
        elif query.group_by == "month":
            breakdown = [m.model_dump() for m in self._spend_by_month(pos)]
        else:
            breakdown = []

        return SpendAnalysisResponse(summary=summary, breakdown=breakdown)

    def _spend_by_category(self, pos: list) -> list[CategorySpend]:
        groups = defaultdict(lambda: {"spend": 0.0, "orders": 0, "suppliers": set()})
        for p in pos:
            sup = store.get_supplier(p.vendor_id)
            cat = sup.category if sup else "Unknown"
            groups[cat]["spend"] += p.total_amount
            groups[cat]["orders"] += 1
            groups[cat]["suppliers"].add(p.vendor_id)
        total = sum(g["spend"] for g in groups.values())
        return sorted([
            CategorySpend(
                category=cat,
                total_spend=g["spend"],
                order_count=g["orders"],
                supplier_count=len(g["suppliers"]),
                percentage=(g["spend"] / total * 100) if total > 0 else 0,
            )
            for cat, g in groups.items()
        ], key=lambda x: x.total_spend, reverse=True)

    def _spend_by_department(self, pos: list) -> list[DepartmentSpend]:
        groups = defaultdict(lambda: {"spend": 0.0, "orders": 0})
        for p in pos:
            dept = p.department or "Unassigned"
            groups[dept]["spend"] += p.total_amount
            groups[dept]["orders"] += 1
        total = sum(g["spend"] for g in groups.values())
        return sorted([
            DepartmentSpend(
                department=dept,
                total_spend=g["spend"],
                order_count=g["orders"],
                percentage=(g["spend"] / total * 100) if total > 0 else 0,
            )
            for dept, g in groups.items()
        ], key=lambda x: x.total_spend, reverse=True)

    def _spend_by_supplier(self, pos: list) -> list[SupplierSpend]:
        groups = defaultdict(lambda: {"spend": 0.0, "orders": 0})
        for p in pos:
            groups[p.vendor_id]["spend"] += p.total_amount
            groups[p.vendor_id]["orders"] += 1
            groups[p.vendor_id]["name"] = p.vendor_name
        return sorted([
            SupplierSpend(
                supplier_id=sid,
                supplier_name=g["name"],
                total_spend=g["spend"],
                order_count=g["orders"],
                average_order_value=g["spend"] / g["orders"] if g["orders"] > 0 else 0,
            )
            for sid, g in groups.items()
        ], key=lambda x: x.total_spend, reverse=True)

    def _spend_by_month(self, pos: list) -> list[MonthlySpend]:
        groups = defaultdict(lambda: {"spend": 0.0, "orders": 0})
        for p in pos:
            key = (p.created_at.year, p.created_at.month)
            groups[key]["spend"] += p.total_amount
            groups[key]["orders"] += 1
        return sorted([
            MonthlySpend(year=y, month=m, total_spend=g["spend"], order_count=g["orders"])
            for (y, m), g in groups.items()
        ], key=lambda x: (x.year, x.month))

    def get_summary(self) -> SpendSummary:
        return self.analyze(SpendAnalysisQuery()).summary


class SupplierRecommendationService:

    def recommend(self, query: SupplierRecommendationQuery) -> SupplierRecommendationResponse:
        suppliers = store.get_suppliers()
        pos = store.get_pos()

        candidates = suppliers
        if query.category:
            candidates = [s for s in candidates if s.category and query.category.lower() in s.category.lower()]
        if query.min_orders > 0:
            candidates = [s for s in candidates if s.total_orders >= query.min_orders]

        recommendations = []
        for s in candidates:
            reasons = []
            score = 0.0

            if s.status == "APPROVED":
                score += 30
                reasons.append("Supplier is approved")
            elif s.status == "VERIFIED":
                score += 20
                reasons.append("Supplier is verified")

            order_count = s.total_orders
            score += min(order_count * 5, 25)
            if order_count > 0:
                reasons.append(f"Has {order_count} previous order(s)")
                spend_rank = self._spend_rank(s.supplier_id, pos)
                score += spend_rank * 5
                if spend_rank > 3:
                    reasons.append("High total spend volume")

            if s.average_quote > 0:
                reasons.append(f"Average quote: ${s.average_quote:.2f}")

            if query.max_budget and s.average_quote > 0 and s.average_quote <= query.max_budget:
                score += 20
                reasons.append("Within budget range")

            if s.category:
                reasons.append(f"Category: {s.category}")

            score = min(score, 100)

            recommendations.append(SupplierRecommendation(
                supplier_id=s.supplier_id,
                supplier_name=s.company_name,
                category=s.category,
                total_orders=s.total_orders,
                total_spend=s.total_spend,
                average_quote=s.average_quote,
                score=round(score, 1),
                reasons=reasons,
            ))

        recommendations.sort(key=lambda r: r.score, reverse=True)
        recommendations = recommendations[:query.top_n]

        return SupplierRecommendationResponse(
            recommendations=recommendations,
            query_params=query,
        )

    def _spend_rank(self, supplier_id: int, pos: list) -> int:
        supplier_spend = sum(p.total_amount for p in pos if p.vendor_id == supplier_id)
        all_spends = sorted(set(p.total_amount for p in pos), reverse=True)
        for i, s in enumerate(all_spends, 1):
            if supplier_spend >= s:
                return i
        return len(all_spends)


class InsightsService:

    def generate(self) -> InsightsResponse:
        pos = store.get_pos()
        suppliers = store.get_suppliers()
        insights = []

        if not pos:
            insights.append(InsightItem(
                type="opportunity",
                title="No purchase data",
                description="Start adding purchase orders to generate insights",
                severity="info",
            ))
            return InsightsResponse(insights=insights)

        total = sum(p.total_amount for p in pos)
        avg = total / len(pos)

        high_value = [p for p in pos if p.total_amount > avg * 2]
        if high_value:
            insights.append(InsightItem(
                type="anomaly",
                title="High-value orders detected",
                description=f"{len(high_value)} orders exceed 2x average order value (${avg:.2f})",
                severity="warning",
                metric=len(high_value),
            ))

        suppliers_by_category = defaultdict(set)
        for s in suppliers:
            if s.category:
                suppliers_by_category[s.category].add(s.supplier_id)
        multi_supplier_cats = {c: len(sups) for c, sups in suppliers_by_category.items() if len(sups) == 1}
        if multi_supplier_cats:
            cats_str = ", ".join(f"{c} ({n})" for c, n in multi_supplier_cats.items())
            insights.append(InsightItem(
                type="opportunity",
                title="Single-supplier categories",
                description=f"Categories with only one supplier: {cats_str}. Consider diversifying.",
                severity="info",
            ))

        if len(pos) > 0:
            monthly = defaultdict(float)
            for p in pos:
                key = (p.created_at.year, p.created_at.month)
                monthly[key] += p.total_amount
            sorted_months = sorted(monthly.items())
            if len(sorted_months) >= 2:
                latest = sorted_months[-1][1]
                prev = sorted_months[-2][1]
                if prev > 0:
                    change = ((latest - prev) / prev) * 100
                    if change > 20:
                        insights.append(InsightItem(
                            type="trend",
                            title="Spend increasing rapidly",
                            description=f"Month-over-month spend increased by {change:.1f}%",
                            severity="critical" if change > 50 else "warning",
                            metric=round(change, 1),
                        ))
                    elif change < -20:
                        insights.append(InsightItem(
                            type="trend",
                            title="Spend decreasing",
                            description=f"Month-over-month spend decreased by {abs(change):.1f}%",
                            severity="info",
                            metric=round(change, 1),
                        ))

        return InsightsResponse(insights=insights)
