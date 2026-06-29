package com.procureai.rfq.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class RfqPublishRequest {

    @NotEmpty
    private List<Long> supplierIds;

    public List<Long> getSupplierIds() { return supplierIds; }
    public void setSupplierIds(List<Long> supplierIds) { this.supplierIds = supplierIds; }
}
