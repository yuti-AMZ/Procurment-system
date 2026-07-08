package com.procureai.common.tenant;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a service method that MUST have a valid tenant (companyId) in context.
 * The {@link TenantValidationAspect} intercepts these methods and throws
 * {@link TenantSecurityException} if the context is missing.
 *
 * Usage:
 * <pre>
 *   {@literal @}RequiresTenant
 *   public PRResponse createPR(PRCreateRequest request) { ... }
 * </pre>
 *
 * Apply at class level to protect all public methods in a service:
 * <pre>
 *   {@literal @}Service
 *   {@literal @}RequiresTenant
 *   public class ProcurementService { ... }
 * </pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresTenant {
}
