package com.procureai.quotation.dto;

import java.math.BigDecimal;

public class QuotationLineItemResponse {

    private Long id;
    private Long rfqLineItemId;
    private String itemName;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String unitOfMeasure;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
}
