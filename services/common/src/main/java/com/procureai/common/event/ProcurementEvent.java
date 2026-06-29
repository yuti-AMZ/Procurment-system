package com.procureai.common.event;

import java.math.BigDecimal;

public class ProcurementEvent extends BaseEvent {
    private Long prId;
    private String prNumber;
    private String requestedBy;
    private String department;
    private BigDecimal totalAmount;
    private String status;
    private Long poId;
    private String poNumber;

    public ProcurementEvent() {}

    public ProcurementEvent(String eventType, String source) {
        super(eventType, source);
    }

    public Long getPrId() { return prId; }
    public void setPrId(Long prId) { this.prId = prId; }
    public String getPrNumber() { return prNumber; }
    public void setPrNumber(String prNumber) { this.prNumber = prNumber; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getPoId() { return poId; }
    public void setPoId(Long poId) { this.poId = poId; }
    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }
}
