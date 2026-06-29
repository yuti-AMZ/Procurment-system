from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SupplierPerformanceScore(BaseModel):
    supplier_id: int
    company_name: str
    total_orders: int
    total_spend: float
    average_quote: float
    quote_count: int
    on_time_delivery_rate: float
    performance_score: float
    recommendation: str


class QuotationComparisonRequest(BaseModel):
    rfq_id: int


class QuotationComparisonResult(BaseModel):
    rfq_id: int
    rfq_number: Optional[str] = None
    rfq_title: Optional[str] = None
    recommendations: List[SupplierPerformanceScore]
    summary: str


class CostSavingInsight(BaseModel):
    category: str
    current_avg_price: float
    market_avg_price: float
    potential_saving: float
    saving_percentage: float
    recommendation: str


class SupplierDiversityReport(BaseModel):
    total_suppliers: int
    total_spend: float
    category_breakdown: dict
    top_performers: List[SupplierPerformanceScore]
    underperformers: List[SupplierPerformanceScore]


class SupplierScoreBreakdown(BaseModel):
    price_score: float
    delivery_score: float
    reliability_score: float
    total_score: float


class SupplierRankingItem(BaseModel):
    supplier_id: int
    supplier_name: str
    quotation_amount: float
    delivery_days: Optional[int] = None
    price_score: float
    delivery_score: float
    reliability_score: float
    total_score: float
    recommendation: str
    explanation: str


class SupplierRankingResult(BaseModel):
    rfq_id: int
    rfq_number: Optional[str] = None
    rfq_title: Optional[str] = None
    rankings: List[SupplierRankingItem]
    summary: str


class ReasonDetail(BaseModel):
    aspect: str
    detail: str
    score: Optional[float] = None


class RecommendationResult(BaseModel):
    rfq_id: int
    rfq_number: Optional[str] = None
    rfq_title: Optional[str] = None
    recommended_supplier_id: Optional[int] = None
    recommended_supplier_name: Optional[str] = None
    total_score: Optional[float] = None
    recommendation: Optional[str] = None
    reasons: List[ReasonDetail]
    summary: str


class InvoiceValidationRequest(BaseModel):
    supplier_name: Optional[str] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    delivery_days: Optional[int] = None
    payment_terms: Optional[str] = None
    warranty: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None


class ValidationCheck(BaseModel):
    field: str
    status: str  # pass, warn, fail
    expected: Optional[str] = None
    actual: Optional[str] = None
    reason: str


class InvoiceValidationResult(BaseModel):
    ocr_data: InvoiceValidationRequest
    overall_status: str  # approved, warning, rejected
    checks: List[ValidationCheck]
    summary: str
