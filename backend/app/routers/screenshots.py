import re
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/screenshots", tags=["screenshots"])

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
_SCREENSHOTS_DIR = _PROJECT_ROOT / "data" / "screenshots"

# ObjectId is 24 hex chars; allow only safe filenames
_ALLOWED_FILES = {"homepage.png", "pricing.png", "product.png"}
_COMPETITOR_ID_RE = re.compile(r"^[a-fA-F0-9]{24}$")


@router.get("/{competitor_id}/{filename}")
def get_screenshot(competitor_id: str, filename: str):
    """Serve a screenshot image for a competitor. Safe filenames: homepage.png, pricing.png, product.png."""
    if not _COMPETITOR_ID_RE.match(competitor_id):
        raise HTTPException(status_code=400, detail="Invalid competitor id")
    if filename not in _ALLOWED_FILES:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = _SCREENSHOTS_DIR / competitor_id / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Screenshot not found")
    return FileResponse(path, media_type="image/png")
