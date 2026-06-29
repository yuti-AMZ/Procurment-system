from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# --- Request Schemas ---

class SpendAnalysisQuery(BaseModel):
    category: Optional[str] = None
    department: Optional[str] = None
    supplier_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    group_by: str = "category"  # category, department, supplier, month


class SupplierRecommendationQuery(BaseModel):
    category: Optional[str] = None
    max_budget: Optional[float] = None
    min_orders: int = 0
    top_n: int = 5


# --- Response Schemas ---

class CategorySpend(BaseModel):
    category: str
    total_spend: float
    order_count: int
    supplier_count: int
    percentage: float


class DepartmentSpend(BaseModel):
    department: str
    total_spend: float
    order_count: int
    percentage: float


class SupplierSpend(BaseModel):
    supplier_id: int
    supplier_name: str
    total_spend: float
    order_count: int
    average_order_value: float


class MonthlySpend(BaseModel):
    year: int
    month: int
    total_spend: float
    order_count: int


class SpendSummary(BaseModel):
    total_spend: float
    total_orders: int
    active_suppliers: int
    average_order_value: float
    top_category: Optional[str] = None
    top_supplier: Optional[str] = None


class SupplierRecommendation(BaseModel):
    supplier_id: int
    supplier_name: str
    category: Optional[str] = None
    total_orders: int
    total_spend: float
    average_quote: float
    score: float
    reasons: list[str]


class SpendAnalysisResponse(BaseModel):
    summary: SpendSummary
    breakdown: list


class SupplierRecommendationResponse(BaseModel):
    recommendations: list[SupplierRecommendation]
    query_params: SupplierRecommendationQuery


class InsightItem(BaseModel):
    type: str  # trend, anomaly, opportunity
    title: str
    description: str
    severity: str  # info, warning, critical
    metric: Optional[float] = None


class InsightsResponse(BaseModel):
    insights: list[InsightItem]
