package com.procureai.common.tenant;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a tenant tries to access another tenant's data.
 * Maps to HTTP 403 Forbidden — intentionally indistinguishable from a "not found"
 * error from the caller's perspective (we never reveal another tenant's data exists).
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class TenantSecurityException extends RuntimeException {

    public TenantSecurityException(String resourceType, Long resourceId) {
        super(resourceType + " not found: " + resourceId);
    }

    public TenantSecurityException(String message) {
        super(message);
    }
}
