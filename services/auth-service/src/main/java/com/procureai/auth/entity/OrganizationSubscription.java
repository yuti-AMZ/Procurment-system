package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "organization_subscriptions")
public class OrganizationSubscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long companyId;
    @Column(nullable = false) private Long planId;
    private String planName;
    @Column(nullable = false) private BigDecimal price;
    private String currency = "USD";
    @Column(nullable = false) private String status; // ACTIVE, CANCELLED, EXPIRED, PAST_DUE
    @Column(nullable = false) private LocalDate startDate;
    private LocalDate endDate;
    private boolean autoRenew = true;
    @Column(updatable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; } public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getPlanId() { return planId; } public void setPlanId(Long planId) { this.planId = planId; }
    public String getPlanName() { return planName; } public void setPlanName(String planName) { this.planName = planName; }
    public BigDecimal getPrice() { return price; } public void setPrice(BigDecimal price) { this.price = price; }
    public String getCurrency() { return currency; } public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public boolean isAutoRenew() { return autoRenew; } public void setAutoRenew(boolean autoRenew) { this.autoRenew = autoRenew; }
    public LocalDateTime getCreatedAt() { return createdAt; } public LocalDateTime getUpdatedAt() { return updatedAt; }
}
