from datetime import datetime
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException

from app.database import get_competitors_collection
from app.models.schemas import CompetitorCreate, CompetitorResponse

router = APIRouter(prefix="/competitors", tags=["competitors"])
USER_ID = "default-user"


def _normalize_url(url: str) -> str:
    u = url.strip().rstrip("/")
    if not u.startswith(("http://", "https://")):
        u = "https://" + u
    return u


def _doc_to_response(doc: dict) -> CompetitorResponse:
    return CompetitorResponse(
        id=str(doc["_id"]),
        name=doc.get("name", ""),
        url=doc["url"],
        user_id=doc.get("user_id", USER_ID),
        baseline_summary=doc.get("baseline_summary", ""),
        baseline_snapshot_id=str(doc["baseline_snapshot_id"]) if doc.get("baseline_snapshot_id") else None,
        last_scanned_at=doc.get("last_scanned_at"),
        scan_interval_hours=doc.get("scan_interval_hours", 24),
        is_active=doc.get("is_active", True),
        created_at=doc["created_at"],
    )


@router.get("", response_model=list[CompetitorResponse])
def list_competitors():
    """List all competitors in the watchlist."""
    col = get_competitors_collection()
    cursor = col.find({"user_id": USER_ID, "is_active": True}).sort("created_at", -1)
    return [_doc_to_response(d) for d in cursor]


@router.post("", response_model=CompetitorResponse, status_code=201)
def add_competitor(payload: CompetitorCreate):
    """Add a competitor URL to the watchlist."""
    col = get_competitors_collection()
    url = _normalize_url(payload.url)
    name = payload.name
    if not name:
        try:
            name = urlparse(url).netloc or url
        except Exception:
            name = url
    existing = col.find_one({"user_id": USER_ID, "url": url})
    if existing:
        raise HTTPException(status_code=409, detail="Competitor with this URL already in watchlist")
    now = datetime.utcnow()
    doc = {
        "user_id": USER_ID,
        "url": url,
        "name": name,
        "baseline_summary": "",
        "baseline_snapshot_id": None,
        "last_scanned_at": None,
        "scan_interval_hours": 24,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    col.insert_one(doc)
    return _doc_to_response(doc)


@router.get("/{competitor_id}", response_model=CompetitorResponse)
def get_competitor(competitor_id: str):
    """Get a single competitor by ID."""
    from bson import ObjectId

    col = get_competitors_collection()
    try:
        doc = col.find_one({"_id": ObjectId(competitor_id), "user_id": USER_ID})
    except Exception:
        doc = None
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return _doc_to_response(doc)


@router.delete("/{competitor_id}")
def delete_competitor(competitor_id: str):
    """Soft-delete a competitor (remove from watchlist)."""
    from bson import ObjectId

    col = get_competitors_collection()
    now = datetime.utcnow()
    result = col.find_one_and_update(
        {"_id": ObjectId(competitor_id), "user_id": USER_ID},
        {"$set": {"is_active": False, "updated_at": now}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True, "competitor_id": competitor_id}
