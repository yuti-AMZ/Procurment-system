package com.procureai.common.event;

import java.time.LocalDate;
import java.util.List;

public class RfqEvent extends BaseEvent {
    private Long rfqId;
    private String rfqNumber;
    private String title;
    private String description;
    private LocalDate deadline;
    private List<Long> supplierIds;
    private String status;

    public RfqEvent() {}

    public RfqEvent(String eventType, String source) {
        super(eventType, source);
    }

    public Long getRfqId() { return rfqId; }
    public void setRfqId(Long rfqId) { this.rfqId = rfqId; }
    public String getRfqNumber() { return rfqNumber; }
    public void setRfqNumber(String rfqNumber) { this.rfqNumber = rfqNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public List<Long> getSupplierIds() { return supplierIds; }
    public void setSupplierIds(List<Long> supplierIds) { this.supplierIds = supplierIds; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
