package com.procureai.procurement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class PRCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String requestedBy;

    private String department;

    private String urgency;
    private String notes;

    private Long assignedSupplierId;
    private String assignedSupplierName;

    @NotEmpty
    @Valid
    private List<PRItemRequest> items;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getAssignedSupplierId() { return assignedSupplierId; }
    public void setAssignedSupplierId(Long assignedSupplierId) { this.assignedSupplierId = assignedSupplierId; }
    public String getAssignedSupplierName() { return assignedSupplierName; }
    public void setAssignedSupplierName(String assignedSupplierName) { this.assignedSupplierName = assignedSupplierName; }
    public List<PRItemRequest> getItems() { return items; }
    public void setItems(List<PRItemRequest> items) { this.items = items; }
}
