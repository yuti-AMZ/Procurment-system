package com.procureai.auth.dto;

import jakarta.validation.constraints.NotNull;

public class CompanyApprovalRequest {

    @NotNull
    private Long companyId;
    private boolean approved;
    private String rejectionReason;

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
