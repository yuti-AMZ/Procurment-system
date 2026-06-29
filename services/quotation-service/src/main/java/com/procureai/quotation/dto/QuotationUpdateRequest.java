package com.procureai.quotation.dto;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

public class QuotationUpdateRequest {

    private String currency;
    private LocalDate validityStartDate;
    private LocalDate validityEndDate;
    private String deliveryTerms;
    private String paymentTerms;
    private String notes;

    @Valid
    private List<QuotationLineItemRequest> lineItems;

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
