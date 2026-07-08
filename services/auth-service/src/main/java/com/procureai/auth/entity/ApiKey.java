package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_keys")
public class ApiKey {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String keyHash;
    private String keyPrefix;
    @Column(nullable = false) private Long companyId;
    private Long createdBy;
    @Column(nullable = false) private String status = "ACTIVE"; // ACTIVE, REVOKED
    private Integer rateLimit;
    private String scopes; // comma-separated: read,write,admin,procurement,rfq,quotation,supplier,invoice
    private LocalDateTime lastUsedAt;
    @Column(updatable = false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getKeyHash() { return keyHash; } public void setKeyHash(String keyHash) { this.keyHash = keyHash; }
    public String getKeyPrefix() { return keyPrefix; } public void setKeyPrefix(String keyPrefix) { this.keyPrefix = keyPrefix; }
    public Long getCompanyId() { return companyId; } public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getCreatedBy() { return createdBy; } public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public Integer getRateLimit() { return rateLimit; } public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }
    public String getScopes() { return scopes; } public void setScopes(String scopes) { this.scopes = scopes; }
    public LocalDateTime getLastUsedAt() { return lastUsedAt; } public void setLastUsedAt(LocalDateTime lastUsedAt) { this.lastUsedAt = lastUsedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
