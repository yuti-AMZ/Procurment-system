package com.procureai.rfq.dto;

import com.procureai.rfq.entity.SupplierResponseStatus;
import java.time.LocalDateTime;

public class RfqSupplierResponse {

    private Long id;
    private Long supplierId;
    private String supplierName;
    private String supplierEmail;
    private SupplierResponseStatus responseStatus;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getSupplierEmail() { return supplierEmail; }
    public void setSupplierEmail(String supplierEmail) { this.supplierEmail = supplierEmail; }
    public SupplierResponseStatus getResponseStatus() { return responseStatus; }
    public void setResponseStatus(SupplierResponseStatus responseStatus) { this.responseStatus = responseStatus; }
    public LocalDateTime getInvitedAt() { return invitedAt; }
    public void setInvitedAt(LocalDateTime invitedAt) { this.invitedAt = invitedAt; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
