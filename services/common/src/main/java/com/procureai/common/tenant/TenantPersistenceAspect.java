package com.procureai.common.tenant;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * AOP aspect that automatically sets the PostgreSQL tenant session variable
 * at the start of every @Transactional method in the application.
 *
 * This wires together {@link TenantAwareTransactionListener} with Spring's
 * transaction management so no service code needs to manually call
 * applyTenantToCurrentTransaction().
 *
 * Disabled in test profile via: procureai.rls.enabled=false
 * (H2 doesn't support SET LOCAL app.current_company_id)
 */
@Aspect
@Component
@ConditionalOnProperty(name = "procureai.rls.enabled", havingValue = "true", matchIfMissing = true)
public class TenantPersistenceAspect {

    private final TenantAwareTransactionListener transactionListener;

    public TenantPersistenceAspect(TenantAwareTransactionListener transactionListener) {
        this.transactionListener = transactionListener;
    }

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) " +
            "&& within(com.procureai..*)")
    public Object applyTenantContext(ProceedingJoinPoint joinPoint) throws Throwable {
        transactionListener.applyTenantToCurrentTransaction();
        return joinPoint.proceed();
    }
}
