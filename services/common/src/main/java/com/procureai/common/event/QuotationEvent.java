package com.procureai.common.event;

import java.math.BigDecimal;

public class QuotationEvent extends BaseEvent {
    private Long quotationId;
    private String quotationNumber;
    private Long rfqId;
    private Long supplierId;
    private String supplierName;
    private BigDecimal totalAmount;
    private String status;

    public QuotationEvent() {}

    public QuotationEvent(String eventType, String source) {
        super(eventType, source);
    }

    public Long getQuotationId() { return quotationId; }
    public void setQuotationId(Long quotationId) { this.quotationId = quotationId; }
    public String getQuotationNumber() { return quotationNumber; }
    public void setQuotationNumber(String quotationNumber) { this.quotationNumber = quotationNumber; }
    public Long getRfqId() { return rfqId; }
    public void setRfqId(Long rfqId) { this.rfqId = rfqId; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
