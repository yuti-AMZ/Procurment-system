package com.procureai.procurement.dto;

import jakarta.validation.constraints.NotBlank;

public class ApprovalActionRequest {

    @NotBlank
    private String approverId;

    private String approverName;

    @NotBlank
    private String action;

    private String comments;

    public String getApproverId() { return approverId; }
    public void setApproverId(String approverId) { this.approverId = approverId; }
    public String getApproverName() { return approverName; }
    public void setApproverName(String approverName) { this.approverName = approverName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
