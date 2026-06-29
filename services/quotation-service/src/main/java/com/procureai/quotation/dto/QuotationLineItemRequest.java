package com.procureai.quotation.dto;

import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class QuotationLineItemRequest {

    private Long rfqLineItemId;

    private String itemName;
    private String description;

    @Positive
    private Integer quantity;

    @Positive
    private BigDecimal unitPrice;

    private String unitOfMeasure;

    public Long getRfqLineItemId() { return rfqLineItemId; }
    public void setRfqLineItemId(Long rfqLineItemId) { this.rfqLineItemId = rfqLineItemId; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
}
