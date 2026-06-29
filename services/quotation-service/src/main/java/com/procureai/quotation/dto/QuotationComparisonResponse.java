package com.procureai.quotation.dto;

import java.math.BigDecimal;
import java.util.List;

public class QuotationComparisonResponse {

    private Long rfqId;
    private String rfqNumber;
    private List<QuotationSummary> quotations;

    public static class QuotationSummary {
        private Long quotationId;
        private String quotationNumber;
        private Long supplierId;
        private String supplierName;
        private QuotationStatus status;
        private BigDecimal totalAmount;
        private Integer evaluationScore;
        private String evaluationComments;
        private int itemCount;

        public Long getQuotationId() { return quotationId; }
        public void setQuotationId(Long quotationId) { this.quotationId = quotationId; }
        public String getQuotationNumber() { return quotationNumber; }
        public void setQuotationNumber(String quotationNumber) { this.quotationNumber = quotationNumber; }
        public Long getSupplierId() { return supplierId; }
        public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
        public String getSupplierName() { return supplierName; }
        public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
        public QuotationStatus getStatus() { return status; }
        public void setStatus(QuotationStatus status) { this.status = status; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public Integer getEvaluationScore() { return evaluationScore; }
        public void setEvaluationScore(Integer evaluationScore) { this.evaluationScore = evaluationScore; }
        public String getEvaluationComments() { return evaluationComments; }
        public void setEvaluationComments(String evaluationComments) { this.evaluationComments = evaluationComments; }
        public int getItemCount() { return itemCount; }
        public void setItemCount(int itemCount) { this.itemCount = itemCount; }
    }

    public enum QuotationStatus { SUBMITTED, UNDER_EVALUATION, ACCEPTED, REJECTED }

    public Long getRfqId() { return rfqId; }
    public void setRfqId(Long rfqId) { this.rfqId = rfqId; }
    public String getRfqNumber() { return rfqNumber; }
    public void setRfqNumber(String rfqNumber) { this.rfqNumber = rfqNumber; }
    public List<QuotationSummary> getQuotations() { return quotations; }
    public void setQuotations(List<QuotationSummary> quotations) { this.quotations = quotations; }
}
