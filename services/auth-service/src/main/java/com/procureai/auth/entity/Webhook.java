package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "webhooks")
public class Webhook {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String url;
    @Column(nullable = false) private Long companyId;
    @Column(length = 2000) private String events;
    private String secret;
    @Column(nullable = false) private String status = "ACTIVE";
    @Column(updatable = false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getUrl() { return url; } public void setUrl(String url) { this.url = url; }
    public Long getCompanyId() { return companyId; } public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getEvents() { return events; } public void setEvents(String events) { this.events = events; }
    public String getSecret() { return secret; } public void setSecret(String secret) { this.secret = secret; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
