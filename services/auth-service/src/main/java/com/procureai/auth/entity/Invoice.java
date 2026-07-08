package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long companyId;
    private Long subscriptionId;
    @Column(nullable = false, unique = true) private String invoiceNumber;
    @Column(nullable = false) private BigDecimal amount;
    private String currency = "USD";
    @Column(nullable = false) private String status; // PAID, PENDING, OVERDUE, CANCELLED
    private String description;
    private LocalDate dueDate;
    private LocalDate paidAt;
    @Column(updatable = false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; } public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getSubscriptionId() { return subscriptionId; } public void setSubscriptionId(Long subscriptionId) { this.subscriptionId = subscriptionId; }
    public String getInvoiceNumber() { return invoiceNumber; } public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; } public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; } public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getPaidAt() { return paidAt; } public void setPaidAt(LocalDate paidAt) { this.paidAt = paidAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
