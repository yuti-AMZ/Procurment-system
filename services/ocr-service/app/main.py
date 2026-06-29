import logging
from fastapi import FastAPI
from app.api import router as ocr_router
from app.database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ProcureAI OCR Service")
app.include_router(ocr_router)


@app.on_event("startup")
async def startup():
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Database initialization failed: %s", e)


@app.get("/health")
async def health():
    return {"status": "UP", "service": "ocr-service"}
