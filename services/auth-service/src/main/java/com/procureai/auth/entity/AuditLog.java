package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String userEmail;
    @Column(nullable = false) private String action;
    @Column(nullable = false) private String resource;
    private String resourceId;
    @Column(length = 2000) private String detail;
    private Long companyId;
    @Column(nullable = false) private LocalDateTime timestamp;
    @PrePersist protected void onCreate() { if (timestamp == null) timestamp = LocalDateTime.now(); }
    public Long getId() { return id; }
    public Long getUserId() { return userId; } public void setUserId(Long userId) { this.userId = userId; }
    public String getUserEmail() { return userEmail; } public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getAction() { return action; } public void setAction(String action) { this.action = action; }
    public String getResource() { return resource; } public void setResource(String resource) { this.resource = resource; }
    public String getResourceId() { return resourceId; } public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public String getDetail() { return detail; } public void setDetail(String detail) { this.detail = detail; }
    public Long getCompanyId() { return companyId; } public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public LocalDateTime getTimestamp() { return timestamp; } public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
