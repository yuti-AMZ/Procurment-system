package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String subject;
    @Column(nullable = false, length = 4000) private String description;
    @Column(nullable = false) private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    @Column(nullable = false) private String status = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private Long companyId;
    private String companyName;
    private Long createdBy;
    private String createdByEmail;
    private Long assignedTo;
    @Column(length = 2000) private String resolution;
    @Column(updatable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; } public void setSubject(String subject) { this.subject = subject; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; } public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public Long getCompanyId() { return companyId; } public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getCompanyName() { return companyName; } public void setCompanyName(String companyName) { this.companyName = companyName; }
    public Long getCreatedBy() { return createdBy; } public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public String getCreatedByEmail() { return createdByEmail; } public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
    public Long getAssignedTo() { return assignedTo; } public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }
    public String getResolution() { return resolution; } public void setResolution(String resolution) { this.resolution = resolution; }
    public LocalDateTime getCreatedAt() { return createdAt; } public LocalDateTime getUpdatedAt() { return updatedAt; }
}
