package com.procureai.quotation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class QuotationCreateRequest {

    @NotNull
    private Long rfqId;

    private String rfqNumber;
    private String rfqTitle;

    @NotNull
    private Long supplierId;

    @NotBlank
    private String supplierName;

    private String supplierEmail;
    private String currency;
    private LocalDate validityStartDate;
    private LocalDate validityEndDate;
    private String deliveryTerms;
    private String paymentTerms;
    private String notes;

    @NotEmpty
    @Valid
    private List<QuotationLineItemRequest> lineItems;

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
    public List<QuotationLineItemRequest> getLineItems() { return lineItems; }
    public void setLineItems(List<QuotationLineItemRequest> lineItems) { this.lineItems = lineItems; }
}
