package com.procureai.procurement.dto;

import java.math.BigDecimal;

public class ApprovalStepResponse {

    private Long id;
    private String roleName;
    private Integer stepOrder;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }
    public BigDecimal getMinAmount() { return minAmount; }
    public void setMinAmount(BigDecimal minAmount) { this.minAmount = minAmount; }
    public BigDecimal getMaxAmount() { return maxAmount; }
    public void setMaxAmount(BigDecimal maxAmount) { this.maxAmount = maxAmount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
