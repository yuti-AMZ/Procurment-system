package com.procureai.rfq.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class RfqCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String requestedBy;

    private String department;

    @NotNull
    private LocalDate deadline;

    @NotEmpty
    @Valid
    private List<RfqLineItemRequest> lineItems;

    private List<Long> supplierIds;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public List<RfqLineItemRequest> getLineItems() { return lineItems; }
    public void setLineItems(List<RfqLineItemRequest> lineItems) { this.lineItems = lineItems; }
    public List<Long> getSupplierIds() { return supplierIds; }
    public void setSupplierIds(List<Long> supplierIds) { this.supplierIds = supplierIds; }
}
