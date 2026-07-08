-- infrastructure/postgres/rls-setup.sql
-- Row-Level Security (RLS) policies for multi-tenant isolation
-- Run this AFTER init-databases.sql and after tables are created by Hibernate

-- ============================================================
-- 1. Create the application role (non-superuser)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'procureai_app') THEN
        CREATE ROLE procureai_app WITH LOGIN PASSWORD 'ProcureAI_App_2026!Secure';
    END IF;
END
$$;

-- ============================================================
-- 2. Grant CONNECT on all databases
-- ============================================================
GRANT CONNECT ON DATABASE auth_db TO procureai_app;
GRANT CONNECT ON DATABASE user_db TO procureai_app;
GRANT CONNECT ON DATABASE procurement_db TO procureai_app;
GRANT CONNECT ON DATABASE rfq_db TO procureai_app;
GRANT CONNECT ON DATABASE supplier_db TO procureai_app;
GRANT CONNECT ON DATABASE quotation_db TO procureai_app;
GRANT CONNECT ON DATABASE invoice_db TO procureai_app;
GRANT CONNECT ON DATABASE notification_db TO procureai_app;
GRANT CONNECT ON DATABASE ocr_db TO procureai_app;
GRANT CONNECT ON DATABASE ai_db TO procureai_app;

-- ============================================================
-- 3. Helper function: create RLS policies for a table
-- ============================================================
CREATE OR REPLACE FUNCTION create_tenant_rls_policy(
    p_table_name TEXT,
    p_company_column TEXT DEFAULT 'company_id'
) RETURNS VOID AS $$
BEGIN
    -- Enable RLS on the table
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', p_table_name);

    -- Allow all operations when the company_id matches the session variable
    EXECUTE format(
        'CREATE POLICY tenant_isolation_policy ON %I
         USING (%I = current_setting(''app.current_company_id'')::bigint)
         WITH CHECK (%I = current_setting(''app.current_company_id'')::bigint)',
        p_table_name, p_company_column, p_company_column
    );

    -- Grant full permissions to the app role
    EXECUTE format('GRANT ALL PRIVILEGES ON %I TO procureai_app', p_table_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. Helper function: create RLS policies for a table with user_id
-- ============================================================
CREATE OR REPLACE FUNCTION create_user_tenant_rls_policy(
    p_table_name TEXT,
    p_company_column TEXT DEFAULT 'company_id',
    p_user_column TEXT DEFAULT 'user_id'
) RETURNS VOID AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', p_table_name);

    -- Users can see their own records OR all records in their company
    EXECUTE format(
        'CREATE POLICY tenant_user_policy ON %I
         USING (
            %I = current_setting(''app.current_company_id'')::bigint
            OR %I = current_setting(''app.current_user_id'')::bigint
         )
         WITH CHECK (%I = current_setting(''app.current_company_id'')::bigint)',
        p_table_name, p_company_column, p_user_column, p_company_column
    );

    EXECUTE format('GRANT ALL PRIVILEGES ON %I TO procureai_app', p_table_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. Helper function: create RLS for platform-wide tables (no tenant isolation)
-- ============================================================
CREATE OR REPLACE FUNCTION create_platform_rls_policy(
    p_table_name TEXT
) RETURNS VOID AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', p_table_name);

    -- Platform tables: allow reads to app role, writes restricted by application logic
    EXECUTE format(
        'CREATE POLICY platform_read_policy ON %I
         FOR SELECT
         USING (true)',
        p_table_name
    );

    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON %I TO procureai_app', p_table_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. Apply RLS policies per database
-- ============================================================

-- ============================================================
-- AUTH_DB (run in auth_db context)
-- ============================================================
-- Note: In production, each section should be run in its respective database.
-- These are templates; the actual execution requires connecting to each DB.

-- AUTH_DB: companies (platform-managed, no tenant isolation needed)
-- SELECT ON companies is needed by all services for limit checks
-- But companies table is the source of truth, so we allow read access

-- AUTH_DB: subscription_plans (platform-managed)
-- AUTH_DB: organization_subscriptions (tenant-scoped)
-- AUTH_DB: invoices (tenant-scoped)
-- AUTH_DB: api_keys (tenant-scoped)
-- AUTH_DB: webhooks (tenant-scoped)
-- AUTH_DB: audit_logs (tenant-scoped)
-- AUTH_DB: platform_settings (platform-managed)
-- AUTH_DB: support_tickets (tenant-scoped)

-- ============================================================
-- USER_DB
-- ============================================================
-- Users table: company_id column for tenant isolation

-- ============================================================
-- PROCUREMENT_DB
-- ============================================================
-- purchase_requests: company_id column
-- purchase_request_items: via purchase_request join
-- purchase_orders: company_id column
-- purchase_order_items: via purchase_order join
-- approval_steps: company_id column
-- approval_records: via purchase_request join

-- ============================================================
-- RFQ_DB
-- ============================================================
-- RFQ tables: company_id column

-- ============================================================
-- SUPPLIER_DB
-- ============================================================
-- Supplier tables: company_id column

-- ============================================================
-- QUOTATION_DB
-- ============================================================
-- Quotation tables: company_id column

-- ============================================================
-- INVOICE_DB
-- ============================================================
-- Invoice tables: company_id column

-- ============================================================
-- NOTIFICATION_DB
-- ============================================================
-- Notification tables: company_id column

-- ============================================================
-- 7. Session variable setter function
-- ============================================================
-- This function should be called at the start of each request
-- to set the current company_id for RLS enforcement.
CREATE OR REPLACE FUNCTION set_tenant_context(
    p_company_id BIGINT,
    p_user_id BIGINT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_company_id', p_company_id::text, true);
    IF p_user_id IS NOT NULL THEN
        PERFORM set_config('app.current_user_id', p_user_id::text, true);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. Grant USAGE on schema public to the app role
-- ============================================================
-- This is needed for the app role to access tables
GRANT USAGE ON SCHEMA public TO procureai_app;
GRANT CREATE ON SCHEMA public TO procureai_app;

-- ============================================================
-- 9. Example usage in application code (Java/Spring):
-- ============================================================
-- At the start of each request, after authentication:
--
--   @Transactional
--   public void setTenantContext(Long companyId, Long userId) {
--       entityManager.createNativeQuery(
--           "SELECT set_tenant_context(:companyId, :userId)")
--           .setParameter("companyId", companyId)
--           .setParameter("userId", userId)
--           .getSingleResult();
--   }
--
-- The RLS policies will then automatically filter queries
-- based on the company_id set in the session.
