package com.procureai.quotation.dto;

import com.procureai.quotation.entity.QuotationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class QuotationResponse {

    private Long id;
    private String quotationNumber;
    private Long rfqId;
    private String rfqNumber;
    private String rfqTitle;
    private Long supplierId;
    private String supplierName;
    private String supplierEmail;
    private QuotationStatus status;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDate validityStartDate;
    private LocalDate validityEndDate;
    private String deliveryTerms;
    private String paymentTerms;
    private String notes;
    private Integer evaluationScore;
    private String evaluationComments;
    private String evaluatedBy;
    private LocalDateTime evaluatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuotationLineItemResponse> lineItems;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuotationNumber() { return quotationNumber; }
    public void setQuotationNumber(String quotationNumber) { this.quotationNumber = quotationNumber; }
    public Long getRfqId() { return rfqId; }
    public void setRfqId(Long rfqId) { this.rfqId = rfqId; }
    public String getRfqNumber() { return rfqNumber; }
    public void setRfqNumber(String rfqNumber) { this.rfqNumber = rfqNumber; }
    public String getRfqTitle() { return rfqTitle; }
    public void setRfqTitle(String rfqTitle) { this.rfqTitle = rfqTitle; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getSupplierEmail() { return supplierEmail; }
    public void setSupplierEmail(String supplierEmail) { this.supplierEmail = supplierEmail; }
    public QuotationStatus getStatus() { return status; }
    public void setStatus(QuotationStatus status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDate getValidityStartDate() { return validityStartDate; }
    public void setValidityStartDate(LocalDate validityStartDate) { this.validityStartDate = validityStartDate; }
    public LocalDate getValidityEndDate() { return validityEndDate; }
    public void setValidityEndDate(LocalDate validityEndDate) { this.validityEndDate = validityEndDate; }
    public String getDeliveryTerms() { return deliveryTerms; }
    public void setDeliveryTerms(String deliveryTerms) { this.deliveryTerms = deliveryTerms; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Integer getEvaluationScore() { return evaluationScore; }
    public void setEvaluationScore(Integer evaluationScore) { this.evaluationScore = evaluationScore; }
    public String getEvaluationComments() { return evaluationComments; }
    public void setEvaluationComments(String evaluationComments) { this.evaluationComments = evaluationComments; }
    public String getEvaluatedBy() { return evaluatedBy; }
    public void setEvaluatedBy(String evaluatedBy) { this.evaluatedBy = evaluatedBy; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<QuotationLineItemResponse> getLineItems() { return lineItems; }
    public void setLineItems(List<QuotationLineItemResponse> lineItems) { this.lineItems = lineItems; }
}
