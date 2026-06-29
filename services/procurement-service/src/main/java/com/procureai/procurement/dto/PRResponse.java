package com.procureai.procurement.dto;

import com.procureai.procurement.entity.PRStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PRResponse {

    private Long id;
    private String prNumber;
    private String title;
    private String description;
    private String requestedBy;
    private String department;
    private PRStatus status;
    private BigDecimal totalAmount;
    private String urgency;
    private String notes;
    private Long assignedSupplierId;
    private String assignedSupplierName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PRItemResponse> items;
    private List<ApprovalRecordResponse> approvalRecords;
    private PurchaseOrderRef poReference;

    public static class PurchaseOrderRef {
        private Long id;
        private String poNumber;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPoNumber() { return poNumber; }
        public void setPoNumber(String poNumber) { this.poNumber = poNumber; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPrNumber() { return prNumber; }
    public void setPrNumber(String prNumber) { this.prNumber = prNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public PRStatus getStatus() { return status; }
    public void setStatus(PRStatus status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getAssignedSupplierId() { return assignedSupplierId; }
    public void setAssignedSupplierId(Long assignedSupplierId) { this.assignedSupplierId = assignedSupplierId; }
    public String getAssignedSupplierName() { return assignedSupplierName; }
    public void setAssignedSupplierName(String assignedSupplierName) { this.assignedSupplierName = assignedSupplierName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<PRItemResponse> getItems() { return items; }
    public void setItems(List<PRItemResponse> items) { this.items = items; }
    public List<ApprovalRecordResponse> getApprovalRecords() { return approvalRecords; }
    public void setApprovalRecords(List<ApprovalRecordResponse> approvalRecords) { this.approvalRecords = approvalRecords; }
    public PurchaseOrderRef getPoReference() { return poReference; }
    public void setPoReference(PurchaseOrderRef poReference) { this.poReference = poReference; }
}
