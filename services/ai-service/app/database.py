import os
import json
from datetime import datetime
from typing import Optional

import psycopg2
import psycopg2.pool

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "ai_db")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "supersecretpassword")

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1, maxconn=10,
            host=DB_HOST, port=DB_PORT,
            dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD,
        )
    return _pool


def _ensure_conn():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT,
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD,
    )
    conn.autocommit = True
    return conn


def init_db():
    conn = _ensure_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS suppliers (
            supplier_id INTEGER PRIMARY KEY,
            company_name TEXT NOT NULL,
            email TEXT,
            category TEXT,
            status TEXT DEFAULT 'PENDING',
            total_orders INTEGER DEFAULT 0,
            total_spend NUMERIC(14,2) DEFAULT 0,
            average_quote NUMERIC(14,2) DEFAULT 0,
            quote_count INTEGER DEFAULT 0,
            on_time_delivery_rate NUMERIC(5,4) DEFAULT 0,
            successful_orders INTEGER DEFAULT 0,
            cancelled_orders INTEGER DEFAULT 0,
            late_deliveries INTEGER DEFAULT 0,
            supplier_rating NUMERIC(4,2) DEFAULT 0,
            completed_procurements INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS purchase_orders (
            po_id INTEGER PRIMARY KEY,
            po_number TEXT NOT NULL,
            pr_id INTEGER DEFAULT 0,
            vendor_id INTEGER NOT NULL,
            vendor_name TEXT NOT NULL,
            total_amount NUMERIC(14,2) DEFAULT 0,
            status TEXT DEFAULT 'GENERATED',
            department TEXT,
            requested_by TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS quotations (
            quotation_id INTEGER PRIMARY KEY,
            quotation_number TEXT NOT NULL,
            rfq_id INTEGER DEFAULT 0,
            supplier_id INTEGER NOT NULL,
            supplier_name TEXT NOT NULL,
            total_amount NUMERIC(14,2) DEFAULT 0,
            status TEXT DEFAULT '',
            delivery_days INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS rfqs (
            rfq_id INTEGER PRIMARY KEY,
            rfq_number TEXT NOT NULL,
            title TEXT DEFAULT '',
            status TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            invoice_number TEXT PRIMARY KEY,
            invoice_id INTEGER NOT NULL,
            supplier_id INTEGER DEFAULT 0,
            supplier_name TEXT DEFAULT '',
            total_amount NUMERIC(14,2) DEFAULT 0,
            status TEXT DEFAULT 'UPLOADED',
            po_number TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS supplier_scores (
            id SERIAL PRIMARY KEY,
            supplier_id INTEGER NOT NULL,
            supplier_name TEXT NOT NULL,
            rfq_id INTEGER NOT NULL,
            quotation_amount NUMERIC(14,2) DEFAULT 0,
            delivery_days INTEGER,
            price_score NUMERIC(6,2) DEFAULT 0,
            delivery_score NUMERIC(6,2) DEFAULT 0,
            reliability_score NUMERIC(6,2) DEFAULT 0,
            total_score NUMERIC(6,2) DEFAULT 0,
            recommendation TEXT DEFAULT '',
            explanation TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS ai_recommendations (
            id SERIAL PRIMARY KEY,
            rfq_id INTEGER NOT NULL,
            rfq_number TEXT,
            rfq_title TEXT,
            recommended_supplier_id INTEGER,
            recommended_supplier_name TEXT,
            total_score NUMERIC(6,2),
            recommendation TEXT,
            reasons_json TEXT DEFAULT '[]',
            summary TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS analytics (
            id SERIAL PRIMARY KEY,
            event_type TEXT NOT NULL,
            trigger_source TEXT DEFAULT '',
            payload_json TEXT DEFAULT '{}',
            snapshot_json TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.close()
    conn.close()


def _row_to_supplier(r):
    from app.models import SupplierRecord
    return SupplierRecord(
        supplier_id=r[0], company_name=r[1], email=r[2], category=r[3],
        status=r[4], total_orders=r[5], total_spend=float(r[6] or 0),
        average_quote=float(r[7] or 0), quote_count=r[8],
        on_time_delivery_rate=float(r[9] or 0),
        successful_orders=r[10], cancelled_orders=r[11],
        late_deliveries=r[12], supplier_rating=float(r[13] or 0),
        completed_procurements=r[14], created_at=r[15],
    )


def _row_to_po(r):
    from app.models import PurchaseOrderRecord
    return PurchaseOrderRecord(
        po_id=r[0], po_number=r[1], pr_id=r[2], vendor_id=r[3],
        vendor_name=r[4], total_amount=float(r[5] or 0), status=r[6],
        department=r[7], requested_by=r[8], created_at=r[9],
    )


def _row_to_quotation(r):
    from app.models import QuotationRecord
    return QuotationRecord(
        quotation_id=r[0], quotation_number=r[1], rfq_id=r[2],
        supplier_id=r[3], supplier_name=r[4], total_amount=float(r[5] or 0),
        status=r[6], delivery_days=r[7], created_at=r[8],
    )


def _row_to_rfq(r):
    from app.models import RfqRecord
    return RfqRecord(
        rfq_id=r[0], rfq_number=r[1], title=r[2], status=r[3], created_at=r[4],
    )


def _row_to_invoice(r):
    from app.models import InvoiceRecord
    return InvoiceRecord(
        invoice_number=r[0], invoice_id=r[1], supplier_id=r[2],
        supplier_name=r[3], total_amount=float(r[4] or 0), status=r[5],
        po_number=r[6], created_at=r[7],
    )


def add_supplier(record) -> None:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO suppliers (supplier_id, company_name, email, category, status,
                total_orders, total_spend, average_quote, quote_count,
                on_time_delivery_rate, successful_orders, cancelled_orders,
                late_deliveries, supplier_rating, completed_procurements, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (supplier_id) DO UPDATE SET
                company_name=EXCLUDED.company_name,
                email=EXCLUDED.email,
                category=EXCLUDED.category,
                status=EXCLUDED.status,
                total_orders=EXCLUDED.total_orders,
                total_spend=EXCLUDED.total_spend,
                average_quote=EXCLUDED.average_quote,
                quote_count=EXCLUDED.quote_count,
                on_time_delivery_rate=EXCLUDED.on_time_delivery_rate,
                successful_orders=EXCLUDED.successful_orders,
                cancelled_orders=EXCLUDED.cancelled_orders,
                late_deliveries=EXCLUDED.late_deliveries,
                supplier_rating=EXCLUDED.supplier_rating,
                completed_procurements=EXCLUDED.completed_procurements
        """, (
            record.supplier_id, record.company_name, record.email,
            record.category, record.status, record.total_orders,
            record.total_spend, record.average_quote, record.quote_count,
            record.on_time_delivery_rate, record.successful_orders,
            record.cancelled_orders, record.late_deliveries,
            record.supplier_rating, record.completed_procurements,
            record.created_at,
        ))
        conn.commit()
        cur.close()
    finally:
        pool.putconn(conn)


def get_supplier(supplier_id: int):
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM suppliers WHERE supplier_id=%s", (supplier_id,))
        r = cur.fetchone()
        cur.close()
        return _row_to_supplier(r) if r else None
    finally:
        pool.putconn(conn)


def update_supplier(supplier_id: int, **kwargs):
    if not kwargs:
        return
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        sets = ", ".join(f"{k}=%s" for k in kwargs)
        vals = list(kwargs.values()) + [supplier_id]
        cur.execute(f"UPDATE suppliers SET {sets} WHERE supplier_id=%s", vals)
        conn.commit()
        cur.close()
    finally:
        pool.putconn(conn)


def get_suppliers():
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM suppliers ORDER BY supplier_id")
        rows = cur.fetchall()
        cur.close()
        return [_row_to_supplier(r) for r in rows]
    finally:
        pool.putconn(conn)


def add_po(record) -> None:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO purchase_orders (po_id, po_number, pr_id, vendor_id,
                vendor_name, total_amount, status, department, requested_by, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (po_id) DO UPDATE SET
                po_number=EXCLUDED.po_number, status=EXCLUDED.status,
                total_amount=EXCLUDED.total_amount
        """, (
            record.po_id, record.po_number, record.pr_id, record.vendor_id,
            record.vendor_name, record.total_amount, record.status,
            record.department, record.requested_by, record.created_at,
        ))
        conn.commit()
        cur.execute("SELECT * FROM suppliers WHERE supplier_id=%s", (record.vendor_id,))
        s = cur.fetchone()
        if s:
            new_orders = s[5] + 1
            new_spend = float(s[6] or 0) + record.total_amount
            cur.execute(
                "UPDATE suppliers SET total_orders=%s, total_spend=%s WHERE supplier_id=%s",
                (new_orders, new_spend, record.vendor_id),
            )
            conn.commit()
        cur.close()
    finally:
        pool.putconn(conn)


def get_pos():
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM purchase_orders ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        return [_row_to_po(r) for r in rows]
    finally:
        pool.putconn(conn)


def add_quotation(record) -> None:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO quotations (quotation_id, quotation_number, rfq_id,
                supplier_id, supplier_name, total_amount, status, delivery_days, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (quotation_id) DO UPDATE SET
                status=EXCLUDED.status, total_amount=EXCLUDED.total_amount
        """, (
            record.quotation_id, record.quotation_number, record.rfq_id,
            record.supplier_id, record.supplier_name, record.total_amount,
            record.status, record.delivery_days, record.created_at,
        ))
        conn.commit()

        cur.execute("SELECT * FROM suppliers WHERE supplier_id=%s", (record.supplier_id,))
        s = cur.fetchone()
        if s:
            new_count = s[8] + 1
            old_avg = float(s[7] or 0)
            total = old_avg * (new_count - 1) + record.total_amount
            new_avg = total / new_count if new_count > 0 else record.total_amount
            cur.execute(
                "UPDATE suppliers SET quote_count=%s, average_quote=%s WHERE supplier_id=%s",
                (new_count, new_avg, record.supplier_id),
            )
            conn.commit()
        cur.close()
    finally:
        pool.putconn(conn)


def get_quotations():
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM quotations ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        return [_row_to_quotation(r) for r in rows]
    finally:
        pool.putconn(conn)


def add_rfq(record) -> None:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO rfqs (rfq_id, rfq_number, title, status, created_at)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (rfq_id) DO UPDATE SET
                status=EXCLUDED.status
        """, (
            record.rfq_id, record.rfq_number, record.title,
            record.status, record.created_at,
        ))
        conn.commit()
        cur.close()
    finally:
        pool.putconn(conn)


def get_rfqs():
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM rfqs ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        return [_row_to_rfq(r) for r in rows]
    finally:
        pool.putconn(conn)


def add_invoice(record) -> None:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO invoices (invoice_number, invoice_id, supplier_id,
                supplier_name, total_amount, status, po_number, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (invoice_number) DO UPDATE SET
                status=EXCLUDED.status
        """, (
            record.invoice_number, record.invoice_id, record.supplier_id,
            record.supplier_name, record.total_amount, record.status,
            record.po_number, record.created_at,
        ))
        conn.commit()
        cur.close()
    finally:
        pool.putconn(conn)


def get_invoice_by_number(invoice_number: str):
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM invoices WHERE invoice_number=%s", (invoice_number,))
        r = cur.fetchone()
        cur.close()
        return _row_to_invoice(r) if r else None
    finally:
        pool.putconn(conn)


def get_invoices():
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM invoices ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        return [_row_to_invoice(r) for r in rows]
    finally:
        pool.putconn(conn)


def is_invoice_number_unique(invoice_number: str) -> bool:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM invoices WHERE invoice_number=%s", (invoice_number,))
        count = cur.fetchone()[0]
        cur.close()
        return count == 0
    finally:
        pool.putconn(conn)


def save_supplier_score(supplier_id: int, supplier_name: str, rfq_id: int,
                        quotation_amount: float, delivery_days: Optional[int],
                        price_score: float, delivery_score: float,
                        reliability_score: float, total_score: float,
                        recommendation: str, explanation: str) -> int:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO supplier_scores (supplier_id, supplier_name, rfq_id,
                quotation_amount, delivery_days, price_score, delivery_score,
                reliability_score, total_score, recommendation, explanation)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            supplier_id, supplier_name, rfq_id, quotation_amount,
            delivery_days, price_score, delivery_score,
            reliability_score, total_score, recommendation, explanation,
        ))
        result_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        return result_id
    finally:
        pool.putconn(conn)


def save_recommendation(rfq_id: int, rfq_number: Optional[str], rfq_title: Optional[str],
                        recommended_supplier_id: Optional[int],
                        recommended_supplier_name: Optional[str],
                        total_score: Optional[float], recommendation: Optional[str],
                        reasons: list, summary: str) -> int:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO ai_recommendations (rfq_id, rfq_number, rfq_title,
                recommended_supplier_id, recommended_supplier_name,
                total_score, recommendation, reasons_json, summary)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            rfq_id, rfq_number, rfq_title,
            recommended_supplier_id, recommended_supplier_name,
            total_score, recommendation,
            json.dumps([r.model_dump() if hasattr(r, 'model_dump') else r for r in (reasons or [])]),
            summary,
        ))
        result_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        return result_id
    finally:
        pool.putconn(conn)


def save_analytics_event(event_type: str, trigger_source: str, payload: dict, snapshot: dict) -> int:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO analytics (event_type, trigger_source, payload_json, snapshot_json)
            VALUES (%s,%s,%s,%s)
            RETURNING id
        """, (
            event_type, trigger_source,
            json.dumps(payload), json.dumps(snapshot),
        ))
        result_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        return result_id
    finally:
        pool.putconn(conn)


def get_analytics(limit: int = 50, offset: int = 0) -> list[dict]:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, event_type, trigger_source, payload_json,
                   snapshot_json, created_at
            FROM analytics ORDER BY created_at DESC LIMIT %s OFFSET %s
        """, (limit, offset))
        rows = cur.fetchall()
        cur.close()
        return [
            {
                "id": r[0], "event_type": r[1], "trigger_source": r[2],
                "payload": json.loads(r[3]) if r[3] else {},
                "snapshot": json.loads(r[4]) if r[4] else {},
                "created_at": str(r[5]),
            }
            for r in rows
        ]
    finally:
        pool.putconn(conn)


def get_supplier_scores(rfq_id: int) -> list[dict]:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, supplier_id, supplier_name, rfq_id, quotation_amount,
                   delivery_days, price_score, delivery_score, reliability_score,
                   total_score, recommendation, explanation, created_at
            FROM supplier_scores WHERE rfq_id=%s
            ORDER BY total_score DESC
        """, (rfq_id,))
        rows = cur.fetchall()
        cur.close()
        return [
            {
                "id": r[0], "supplier_id": r[1], "supplier_name": r[2],
                "rfq_id": r[3], "quotation_amount": float(r[4] or 0),
                "delivery_days": r[5], "price_score": float(r[6] or 0),
                "delivery_score": float(r[7] or 0),
                "reliability_score": float(r[8] or 0),
                "total_score": float(r[9] or 0), "recommendation": r[10],
                "explanation": r[11], "created_at": str(r[12]),
            }
            for r in rows
        ]
    finally:
        pool.putconn(conn)


def get_recommendations(rfq_id: Optional[int] = None, limit: int = 20) -> list[dict]:
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        if rfq_id:
            cur.execute("""
                SELECT id, rfq_id, rfq_number, rfq_title, recommended_supplier_id,
                       recommended_supplier_name, total_score, recommendation,
                       reasons_json, summary, created_at
                FROM ai_recommendations WHERE rfq_id=%s
                ORDER BY created_at DESC LIMIT %s
            """, (rfq_id, limit))
        else:
            cur.execute("""
                SELECT id, rfq_id, rfq_number, rfq_title, recommended_supplier_id,
                       recommended_supplier_name, total_score, recommendation,
                       reasons_json, summary, created_at
                FROM ai_recommendations ORDER BY created_at DESC LIMIT %s
            """, (limit,))
        rows = cur.fetchall()
        cur.close()
        return [
            {
                "id": r[0], "rfq_id": r[1], "rfq_number": r[2],
                "rfq_title": r[3], "recommended_supplier_id": r[4],
                "recommended_supplier_name": r[5],
                "total_score": float(r[6]) if r[6] else None,
                "recommendation": r[7],
                "reasons": json.loads(r[8]) if r[8] else [],
                "summary": r[9], "created_at": str(r[10]),
            }
            for r in rows
        ]
    finally:
        pool.putconn(conn)
