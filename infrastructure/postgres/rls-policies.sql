-- =============================================================================
-- ProcureAI — PostgreSQL Row-Level Security (RLS) Policies
-- Phase 1: Tenant Isolation
-- =============================================================================
-- These policies are an additional database-level safety net on top of the
-- application-level companyId filtering already in services.
--
-- How it works:
--   1. Each service sets a session variable: SET LOCAL app.current_company_id = '42'
--   2. RLS policies compare rows' company_id to that variable
--   3. Any query that slips through application code is blocked at DB level
--
-- Run these scripts ONCE on each service database (not on postgres/admin DB).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- procurement_db
-- -----------------------------------------------------------------------------
\connect procurement_db

-- Enable RLS on tenant-scoped tables
ALTER TABLE purchase_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_records       ENABLE ROW LEVEL SECURITY;

-- purchase_requests: tenant can only see/modify their own rows
CREATE POLICY tenant_isolation_purchase_requests ON purchase_requests
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

-- purchase_request_items: scoped through purchase_requests
CREATE POLICY tenant_isolation_pr_items ON purchase_request_items
    USING (
        purchase_request_id IN (
            SELECT id FROM purchase_requests
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

-- purchase_orders
CREATE POLICY tenant_isolation_purchase_orders ON purchase_orders
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

-- purchase_order_items: scoped through purchase_orders
CREATE POLICY tenant_isolation_po_items ON purchase_order_items
    USING (
        purchase_order_id IN (
            SELECT id FROM purchase_orders
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

-- approval_steps
CREATE POLICY tenant_isolation_approval_steps ON approval_steps
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

-- approval_records: scoped through purchase_requests
CREATE POLICY tenant_isolation_approval_records ON approval_records
    USING (
        purchase_request_id IN (
            SELECT id FROM purchase_requests
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

-- -----------------------------------------------------------------------------
-- rfq_db
-- -----------------------------------------------------------------------------
\connect rfq_db

ALTER TABLE rfqs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_suppliers  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_rfqs ON rfqs
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

CREATE POLICY tenant_isolation_rfq_line_items ON rfq_line_items
    USING (
        rfq_id IN (
            SELECT id FROM rfqs
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

CREATE POLICY tenant_isolation_rfq_suppliers ON rfq_suppliers
    USING (
        rfq_id IN (
            SELECT id FROM rfqs
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

-- -----------------------------------------------------------------------------
-- supplier_db
-- -----------------------------------------------------------------------------
\connect supplier_db

ALTER TABLE suppliers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_suppliers ON suppliers
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

CREATE POLICY tenant_isolation_supplier_contacts ON supplier_contacts
    USING (
        supplier_id IN (
            SELECT id FROM suppliers
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

CREATE POLICY tenant_isolation_supplier_documents ON supplier_documents
    USING (
        supplier_id IN (
            SELECT id FROM suppliers
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

-- -----------------------------------------------------------------------------
-- quotation_db
-- -----------------------------------------------------------------------------
\connect quotation_db

ALTER TABLE quotations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_line_items  ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_quotations ON quotations
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

CREATE POLICY tenant_isolation_quotation_line_items ON quotation_line_items
    USING (
        quotation_id IN (
            SELECT id FROM quotations
            WHERE company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        )
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    );

-- -----------------------------------------------------------------------------
-- invoice_db
-- -----------------------------------------------------------------------------
\connect invoice_db

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_invoices ON invoices
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

-- -----------------------------------------------------------------------------
-- notification_db
-- -----------------------------------------------------------------------------
\connect notification_db

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_notifications ON notifications
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

-- -----------------------------------------------------------------------------
-- user_db
-- -----------------------------------------------------------------------------
\connect user_db

ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_users ON users
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

CREATE POLICY tenant_isolation_departments ON departments
    USING (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
        OR current_setting('app.bypass_rls', TRUE) = 'true'
    )
    WITH CHECK (
        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::bigint
    );

-- =============================================================================
-- IMPORTANT: After enabling RLS, the 'admin' superuser used by services
-- bypasses RLS by default (superusers are exempt). To enforce RLS even for
-- the service DB user, create a dedicated non-superuser role per service:
--
--   CREATE ROLE procureai_app LOGIN PASSWORD 'strong_password';
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO procureai_app;
--   -- Do NOT grant SUPERUSER or BYPASSRLS to this role
--
-- Then point each service's datasource at procureai_app instead of admin.
-- =============================================================================
