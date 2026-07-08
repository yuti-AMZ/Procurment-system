package com.procureai.auth.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "platform_settings")
public class PlatformSetting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String settingKey;
    @Column(nullable = false, length = 2000) private String settingValue;
    private String description;
    private LocalDateTime updatedAt;
    @PrePersist @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public String getSettingKey() { return settingKey; } public void setSettingKey(String settingKey) { this.settingKey = settingKey; }
    public String getSettingValue() { return settingValue; } public void setSettingValue(String settingValue) { this.settingValue = settingValue; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
