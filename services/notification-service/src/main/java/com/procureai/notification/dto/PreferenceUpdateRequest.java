package com.procureai.notification.dto;

import jakarta.validation.constraints.NotBlank;

public class PreferenceUpdateRequest {

    private boolean emailEnabled;
    private boolean inAppEnabled;

    public boolean isEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(boolean emailEnabled) { this.emailEnabled = emailEnabled; }
    public boolean isInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(boolean inAppEnabled) { this.inAppEnabled = inAppEnabled; }
}
