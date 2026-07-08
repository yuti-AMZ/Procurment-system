package com.procureai.common.tenant;

import com.procureai.common.security.TenantContext;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Hibernate StatementInspector that prepends a SET LOCAL statement to every
 * SQL query so PostgreSQL RLS policies can read the current tenant's companyId.
 *
 * PostgreSQL RLS reads: current_setting('app.current_company_id', TRUE)
 *
 * NOTE: StatementInspector only inspects the SQL string — it cannot execute
 * additional statements. We use a separate Spring bean
 * {@link TenantSchemaInterceptor} via JPA EntityListeners or a
 * TransactionSynchronization to SET the session variable before queries run.
 *
 * This class is kept for reference/logging. The actual SET LOCAL is done by
 * {@link TenantAwareJpaConfig}.
 */
public class TenantConnectionInterceptor implements StatementInspector {

    private static final Logger log = LoggerFactory.getLogger(TenantConnectionInterceptor.class);

    @Override
    public String inspect(String sql) {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId == null) {
            // Super admin or system operations: bypass_rls is set to true in
            // TenantAwareJpaConfig — nothing to add here
            return sql;
        }
        // Log tenant context for debugging (remove in production or use DEBUG level)
        log.trace("[TENANT-SQL] companyId={} sql={}", companyId,
                sql.length() > 120 ? sql.substring(0, 120) + "..." : sql);
        return sql;
    }
}
