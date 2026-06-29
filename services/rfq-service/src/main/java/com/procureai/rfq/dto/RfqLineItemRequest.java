package com.procureai.rfq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class RfqLineItemRequest {

    @NotBlank
    private String itemName;

    private String description;

    @Positive
    private Integer quantity;

    private String unitOfMeasure;
    private String category;

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
