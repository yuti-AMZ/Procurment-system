package com.procureai.auth.dto;

import jakarta.validation.constraints.NotNull;

public class ToggleUserStatusRequest {

    @NotNull
    private Long userId;

    @NotNull
    private boolean enabled;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
