package com.procureai.common.tenant;

import com.procureai.common.security.TenantContext;
import org.springframework.stereotype.Component;

/**
 * Central utility for verifying that a loaded entity belongs to the current tenant.
 *
 * Why this exists:
 * Even though repositories filter by companyId, a second layer of defence is needed
 * for cases like:
 *  - findById() calls that predate the tenant-aware refactor
 *  - cross-service lookups that receive an ID in a request body
 *  - any future code that uses the plain JpaRepository.findById()
 *
 * Usage:
 * <pre>
 *   PurchaseRequest pr = prRepository.findById(id).orElseThrow(...);
 *   tenantValidator.assertOwnership(pr, "PurchaseRequest", id);
 * </pre>
 */
@Component
public class TenantOwnershipValidator {

    /**
     * Asserts that the entity's companyId matches the current tenant context.
     * Throws {@link TenantSecurityException} (mapped to 404) if not matching —
     * we never reveal that another tenant's resource exists.
     *
     * @param entity       The loaded entity (must implement TenantAwareEntity)
     * @param resourceType Human-readable resource type for error messages
     * @param resourceId   The resource ID for error messages
     */
    public void assertOwnership(TenantAwareEntity entity, String resourceType, Long resourceId) {
        Long currentCompanyId = TenantContext.getCurrentCompanyId();
        if (currentCompanyId == null || !currentCompanyId.equals(entity.getCompanyId())) {
            throw new TenantSecurityException(resourceType, resourceId);
        }
    }

    /**
     * Convenience overload accepting a raw companyId (for entities not implementing TenantAwareEntity).
     */
    public void assertOwnership(Long entityCompanyId, String resourceType, Long resourceId) {
        Long currentCompanyId = TenantContext.getCurrentCompanyId();
        if (currentCompanyId == null || !currentCompanyId.equals(entityCompanyId)) {
            throw new TenantSecurityException(resourceType, resourceId);
        }
    }

    /**
     * Returns the current tenant's companyId, throwing if not present.
     * Use this instead of TenantContext.getCurrentCompanyId() when the value is required.
     */
    public Long requireCurrentCompanyId() {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new TenantSecurityException(
                    "No tenant context found. Ensure the request carries a valid JWT with companyId.");
        }
        return companyId;
    }
}
