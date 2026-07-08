package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "platform_features")
public class PlatformFeature {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String featureKey;
    @Column(nullable = false) private String name;
    private String description;
    @Column(nullable = false) private boolean enabled = false;
    private String category;
    @Column(updatable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getFeatureKey() { return featureKey; } public void setFeatureKey(String featureKey) { this.featureKey = featureKey; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public boolean isEnabled() { return enabled; } public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getCategory() { return category; } public void setCategory(String category) { this.category = category; }
    public LocalDateTime getCreatedAt() { return createdAt; } public LocalDateTime getUpdatedAt() { return updatedAt; }
}
