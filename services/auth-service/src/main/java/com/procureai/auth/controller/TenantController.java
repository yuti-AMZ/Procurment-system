package com.procureai.auth.controller;

import com.procureai.auth.dto.CompanyResponse;
import com.procureai.auth.service.CompanyService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tenant")
public class TenantController {

    private final CompanyService companyService;

    public TenantController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * Returns branding/theme config for the current tenant.
     * Tenant is resolved in this priority order:
     *   1. ?companyId=X query param (explicit)
     *   2. X-Company-Id header injected by the API gateway from the JWT
     *   3. Host header subdomain or custom domain lookup
     *
     * This endpoint is intentionally PUBLIC (no JWT required) so the
     * login page can load tenant branding before the user is authenticated.
     */
    @GetMapping("/branding")
    public ResponseEntity<CompanyResponse> getBranding(
            @RequestParam(required = false) Long companyId,
            HttpServletRequest request) {

        // Extract companyId from gateway-injected header if not provided as query param
        Long resolvedCompanyId = companyId;
        if (resolvedCompanyId == null) {
            String header = request.getHeader("X-Company-Id");
            if (header != null && !header.isBlank()) {
                try {
                    resolvedCompanyId = Long.parseLong(header);
                } catch (NumberFormatException ignored) {}
            }
        }

        String hostHeader = request.getHeader("Host");
        CompanyResponse branding = companyService.getTenantBranding(resolvedCompanyId, null, hostHeader);
        return ResponseEntity.ok(branding);
    }
}
