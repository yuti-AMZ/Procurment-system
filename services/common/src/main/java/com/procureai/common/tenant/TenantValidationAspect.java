package com.procureai.common.tenant;

import com.procureai.common.security.TenantContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * AOP aspect that enforces tenant context on any method annotated
 * with {@link RequiresTenant} (or inside an annotated class).
 *
 * This is a safety net: individual service methods already guard by companyId,
 * but this aspect catches any path that might have been missed.
 *
 * Pointcut covers:
 *  1. Any method annotated directly with @RequiresTenant
 *  2. Any method in a class annotated with @RequiresTenant
 */
@Aspect
@Component
public class TenantValidationAspect {

    private static final Logger log = LoggerFactory.getLogger(TenantValidationAspect.class);

    /**
     * Intercepts service methods annotated at method level.
     */
    @Around("@annotation(com.procureai.common.tenant.RequiresTenant)")
    public Object validateTenantOnMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        return validateAndProceed(joinPoint);
    }

    /**
     * Intercepts all public methods inside a class annotated at type level.
     */
    @Around("@within(com.procureai.common.tenant.RequiresTenant)")
    public Object validateTenantOnClass(ProceedingJoinPoint joinPoint) throws Throwable {
        return validateAndProceed(joinPoint);
    }

    private Object validateAndProceed(ProceedingJoinPoint joinPoint) throws Throwable {
        Long companyId = TenantContext.getCurrentCompanyId();

        if (companyId == null) {
            String method = joinPoint.getSignature().toShortString();
            log.warn("[TENANT-SECURITY] Rejected call to {} — no tenant context in request", method);
            throw new TenantSecurityException(
                    "Access denied: operation requires an authenticated organization context. " +
                    "Ensure your request carries a valid JWT with companyId.");
        }

        return joinPoint.proceed();
    }
}
