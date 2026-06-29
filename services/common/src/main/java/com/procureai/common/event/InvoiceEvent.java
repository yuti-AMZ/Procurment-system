package com.procureai.common.event;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InvoiceEvent extends BaseEvent {
    private Long invoiceId;
    private String invoiceNumber;
    private Long poId;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private BigDecimal amount;
    private LocalDate invoiceDate;
    private String status;

    public InvoiceEvent() {}

    public InvoiceEvent(String eventType, String source) {
        super(eventType, source);
    }

    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
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
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
