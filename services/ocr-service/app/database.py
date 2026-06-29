import psycopg2
import psycopg2.pool
import os

DB_HOST = os.getenv("OCR_DB_HOST", "localhost")
DB_PORT = int(os.getenv("OCR_DB_PORT", "5432"))
DB_NAME = os.getenv("OCR_DB_NAME", "ocr_db")
DB_USER = os.getenv("OCR_DB_USER", "admin")
DB_PASSWORD = os.getenv("OCR_DB_PASSWORD", "supersecretpassword")

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        )
    return _pool


def init_db():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS ocr_results (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL,
            supplier_name TEXT,
            unit_price NUMERIC(12,2),
            total_price NUMERIC(12,2),
            delivery_days INTEGER,
            payment_terms TEXT,
            warranty TEXT,
            invoice_number TEXT,
            invoice_date DATE,
            due_date DATE,
            raw_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.close()
    conn.close()


def insert_ocr_result(filename: str, raw_text: str, data: dict) -> int:
    conn = get_pool().getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO ocr_results
                (filename, supplier_name, unit_price, total_price,
                 delivery_days, payment_terms, warranty,
                 invoice_number, invoice_date, due_date, raw_text)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            filename,
            data.get("supplier_name"),
            data.get("unit_price"),
            data.get("total_price"),
            data.get("delivery_days"),
            data.get("payment_terms"),
            data.get("warranty"),
            data.get("invoice_number"),
            data.get("invoice_date"),
            data.get("due_date"),
            raw_text,
        ))
        result_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        return result_id
    finally:
        get_pool().putconn(conn)


def get_all_results(limit: int = 50, offset: int = 0) -> list[dict]:
    conn = get_pool().getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, filename, supplier_name, unit_price, total_price,
                   delivery_days, payment_terms, warranty,
                   invoice_number, invoice_date, due_date, raw_text, created_at
            FROM ocr_results
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        rows = cur.fetchall()
        cur.close()
        return [
            {
                "id": r[0],
                "filename": r[1],
                "supplier_name": r[2],
                "unit_price": float(r[3]) if r[3] else None,
                "total_price": float(r[4]) if r[4] else None,
                "delivery_days": r[5],
                "payment_terms": r[6],
                "warranty": r[7],
                "invoice_number": r[8],
                "invoice_date": str(r[9]) if r[9] else None,
                "due_date": str(r[10]) if r[10] else None,
                "raw_text": r[11],
                "created_at": str(r[12]),
            }
            for r in rows
        ]
    finally:
        get_pool().putconn(conn)


def get_result_by_id(result_id: int) -> dict | None:
    conn = get_pool().getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, filename, supplier_name, unit_price, total_price,
                   delivery_days, payment_terms, warranty,
                   invoice_number, invoice_date, due_date, raw_text, created_at
            FROM ocr_results
            WHERE id = %s
        """, (result_id,))
        r = cur.fetchone()
        cur.close()
        if not r:
            return None
        return {
            "id": r[0],
            "filename": r[1],
            "supplier_name": r[2],
            "unit_price": float(r[3]) if r[3] else None,
            "total_price": float(r[4]) if r[4] else None,
            "delivery_days": r[5],
            "payment_terms": r[6],
            "warranty": r[7],
            "invoice_number": r[8],
            "invoice_date": str(r[9]) if r[9] else None,
            "due_date": str(r[10]) if r[10] else None,
            "raw_text": r[11],
            "created_at": str(r[12]),
        }
    finally:
        get_pool().putconn(conn)
