package com.procureai.rfq.dto;

import com.procureai.rfq.entity.RfqStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class RfqResponse {

    private Long id;
    private String rfqNumber;
    private String title;
    private String description;
    private RfqStatus status;
    private String requestedBy;
    private String department;
    private LocalDate deadline;
    private LocalDate publishedAt;
    private LocalDate closedAt;
    private Long awardedSupplierId;
    private String awardedSupplierName;
    private String awardRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RfqLineItemResponse> lineItems;
    private List<RfqSupplierResponse> invitedSuppliers;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRfqNumber() { return rfqNumber; }
    public void setRfqNumber(String rfqNumber) { this.rfqNumber = rfqNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public RfqStatus getStatus() { return status; }
    public void setStatus(RfqStatus status) { this.status = status; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public LocalDate getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDate publishedAt) { this.publishedAt = publishedAt; }
    public LocalDate getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDate closedAt) { this.closedAt = closedAt; }
    public Long getAwardedSupplierId() { return awardedSupplierId; }
    public void setAwardedSupplierId(Long awardedSupplierId) { this.awardedSupplierId = awardedSupplierId; }
    public String getAwardedSupplierName() { return awardedSupplierName; }
    public void setAwardedSupplierName(String awardedSupplierName) { this.awardedSupplierName = awardedSupplierName; }
    public String getAwardRemarks() { return awardRemarks; }
    public void setAwardRemarks(String awardRemarks) { this.awardRemarks = awardRemarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<RfqLineItemResponse> getLineItems() { return lineItems; }
    public void setLineItems(List<RfqLineItemResponse> lineItems) { this.lineItems = lineItems; }
    public List<RfqSupplierResponse> getInvitedSuppliers() { return invitedSuppliers; }
    public void setInvitedSuppliers(List<RfqSupplierResponse> invitedSuppliers) { this.invitedSuppliers = invitedSuppliers; }
}
