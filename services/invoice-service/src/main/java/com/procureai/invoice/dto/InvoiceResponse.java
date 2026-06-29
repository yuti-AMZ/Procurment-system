package com.procureai.invoice.dto;

import com.procureai.invoice.entity.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long poId;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private BigDecimal totalAmount;
    private String currency;
    private InvoiceStatus status;
    private String notes;
    private String documentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private Long approvedBy;

    public InvoiceResponse() {}

    public InvoiceResponse(Long id, String invoiceNumber, Long poId, String poNumber,
                           Long supplierId, String supplierName, BigDecimal totalAmount,
                           String currency, InvoiceStatus status, String notes,
                           String documentUrl, LocalDateTime createdAt,
                           LocalDateTime approvedAt, Long approvedBy) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.poId = poId;
        this.poNumber = poNumber;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.status = status;
        this.notes = notes;
        this.documentUrl = documentUrl;
        this.createdAt = createdAt;
        this.approvedAt = approvedAt;
        this.approvedBy = approvedBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Long getPoId() { return poId; }
    public void setPoId(Long poId) { this.poId = poId; }
    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }
}
