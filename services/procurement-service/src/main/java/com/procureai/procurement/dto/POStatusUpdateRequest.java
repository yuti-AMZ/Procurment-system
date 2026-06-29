package com.procureai.procurement.dto;

import jakarta.validation.constraints.NotBlank;

public class POStatusUpdateRequest {

    @NotBlank
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
