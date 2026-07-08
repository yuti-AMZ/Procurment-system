package com.procureai.common.tenant;

import com.procureai.common.security.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Sets the PostgreSQL session variable app.current_company_id at the start of
 * every transaction so that RLS policies can read it.
 *
 * Usage: inject this bean and call {@code applyTenantToCurrentTransaction()}
 * at the start of any @Transactional method that needs RLS enforcement.
 *
 * Alternatively, use {@link TenantAwareTransactionTemplate} which wraps this
 * automatically.
 *
 * Why transaction-local set_config and not SET?
 *   set_config(..., true) applies only to the current transaction, equivalent
 *   to SET LOCAL. When the connection is returned to the pool the setting is
 *   automatically cleared. Plain SET would persist on the connection and could
 *   leak between tenants.
 */
@Component
public class TenantAwareTransactionListener {

    private static final Logger log = LoggerFactory.getLogger(TenantAwareTransactionListener.class);

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Call this inside a @Transactional context to bind the current tenant's
     * companyId to the PostgreSQL session variable for RLS.
     *
     * In practice this is called automatically by {@link TenantPersistenceAspect}.
     */
    public void applyTenantToCurrentTransaction() {
        Long companyId = TenantContext.getCurrentCompanyId();

        if (companyId != null) {
            // Bind companyId so RLS policies can read it. set_config(..., true)
            // is equivalent to SET LOCAL for the current transaction.
            entityManager.createNativeQuery(
                "SELECT set_config('app.current_company_id', CAST(? AS text), true)")
                .setParameter(1, companyId.toString())
                .getSingleResult();

            // Clear any bypass flag that may have been set by a super-admin path
            entityManager.createNativeQuery(
                "SELECT set_config('app.bypass_rls', 'false', true)")
                .getSingleResult();

            log.trace("[RLS] Set app.current_company_id = {} for transaction", companyId);
        } else {
            // No tenant context — this is a SUPER_ADMIN or system call.
            // Set bypass_rls so policies don't block platform-wide queries.
            entityManager.createNativeQuery(
                "SELECT set_config('app.bypass_rls', 'true', true)")
                .getSingleResult();

            log.trace("[RLS] No tenant context — bypass_rls set to true (super admin or system call)");
        }

        // Register cleanup hook so the variable is cleared when the transaction ends
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    log.trace("[RLS] Transaction completed with status={}, session var cleared", status);
                }
            });
        }
    }
}
