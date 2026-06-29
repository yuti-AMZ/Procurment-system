package com.procureai.auth.dto;

import jakarta.validation.constraints.NotNull;

public class AdminApprovalRequest {

    @NotNull
    private Long userId;

    @NotNull
    private boolean approved;

    private String rejectionReason;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
