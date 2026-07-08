package com.procureai.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class TenantContext {

    public static Long getCurrentCompanyId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof GatewayAuthenticationToken) {
            return ((GatewayAuthenticationToken) authentication).getCompanyId();
        }
        return null;
    }

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof GatewayAuthenticationToken) {
            return ((GatewayAuthenticationToken) authentication).getUserId();
        }
        return null;
    }

    public static String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof GatewayAuthenticationToken) {
            return ((GatewayAuthenticationToken) authentication).getRole();
        }
        return null;
    }

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof GatewayAuthenticationToken) {
            return ((GatewayAuthenticationToken) authentication).getEmail();
        }
        return null;
    }
}