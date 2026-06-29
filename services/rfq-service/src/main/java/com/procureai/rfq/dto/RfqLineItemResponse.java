package com.procureai.rfq.dto;

public class RfqLineItemResponse {

    private Long id;
    private String itemName;
    private String description;
    private Integer quantity;
    private String unitOfMeasure;
    private String category;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
