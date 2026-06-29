package com.procureai.rfq.dto;

import jakarta.validation.constraints.NotNull;

public class RfqAwardRequest {

    @NotNull
    private Long supplierId;

    private String supplierName;
    private String remarks;

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
