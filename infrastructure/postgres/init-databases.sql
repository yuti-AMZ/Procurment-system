-- infrastructure/postgres/init-databases.sql

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
-- 2. Create databases
-- ============================================================
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE procurement_db;
CREATE DATABASE rfq_db;
CREATE DATABASE supplier_db;
CREATE DATABASE quotation_db;
CREATE DATABASE invoice_db;
CREATE DATABASE notification_db;
CREATE DATABASE ocr_db;
CREATE DATABASE ai_db;

-- ============================================================
-- 3. Grant CONNECT and CREATE on all databases
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

-- Grant CREATE on databases (needed for Hibernate schema generation)
GRANT CREATE ON DATABASE auth_db TO procureai_app;
GRANT CREATE ON DATABASE user_db TO procureai_app;
GRANT CREATE ON DATABASE procurement_db TO procureai_app;
GRANT CREATE ON DATABASE rfq_db TO procureai_app;
GRANT CREATE ON DATABASE supplier_db TO procureai_app;
GRANT CREATE ON DATABASE quotation_db TO procureai_app;
GRANT CREATE ON DATABASE invoice_db TO procureai_app;
GRANT CREATE ON DATABASE notification_db TO procureai_app;
GRANT CREATE ON DATABASE ocr_db TO procureai_app;
GRANT CREATE ON DATABASE ai_db TO procureai_app;