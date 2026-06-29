package com.procureai.procurement.dto;

import com.procureai.procurement.entity.ApprovalStatus;
import java.time.LocalDateTime;

public class ApprovalRecordResponse {

    private Long id;
    private String approverId;
    private String approverName;
    private String roleName;
    private ApprovalStatus status;
    private String comments;
    private Integer stepOrder;
    private LocalDateTime actionedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getApproverId() { return approverId; }
    public void setApproverId(String approverId) { this.approverId = approverId; }
    public String getApproverName() { return approverName; }
    public void setApproverName(String approverName) { this.approverName = approverName; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public ApprovalStatus getStatus() { return status; }
    public void setStatus(ApprovalStatus status) { this.status = status; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }
    public LocalDateTime getActionedAt() { return actionedAt; }
    public void setActionedAt(LocalDateTime actionedAt) { this.actionedAt = actionedAt; }
}
