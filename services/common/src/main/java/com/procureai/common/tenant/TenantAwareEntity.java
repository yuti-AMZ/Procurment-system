package com.procureai.common.tenant;

/**
 * Marker interface for JPA entities that are tenant-scoped.
 * Implementing entities must expose a getCompanyId() method.
 *
 * Used by {@link TenantOwnershipValidator} to verify ownership generically.
 */
public interface TenantAwareEntity {
    Long getCompanyId();
}
