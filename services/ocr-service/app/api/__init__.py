import logging
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from app.services.ocr_service import ocr_from_bytes, extract_all
from app.database import insert_ocr_result, get_all_results, get_result_by_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ocr", tags=["OCR Extraction"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp"}


def _allowed(filename: str) -> bool:
    ext = filename.lower()
    return any(ext.endswith(e) for e in ALLOWED_EXTENSIONS)


@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    if not _allowed(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    logger.info("Processing file: %s (%d bytes)", file.filename, len(file_bytes))
    raw_text = ocr_from_bytes(file_bytes, file.filename)
    extracted = extract_all(raw_text)
    result_id = insert_ocr_result(file.filename, raw_text, extracted)

    return {
        "id": result_id,
        "filename": file.filename,
        "extracted_data": extracted,
        "raw_text": raw_text,
    }


@router.get("/results")
async def list_results(limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0)):
    return {"results": get_all_results(limit, offset)}


@router.get("/results/{result_id}")
async def get_result(result_id: int):
    result = get_result_by_id(result_id)
    if not result:
        raise HTTPException(status_code=404, detail="OCR result not found")
    return result
