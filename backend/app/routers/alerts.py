from bson import ObjectId

from fastapi import APIRouter, HTTPException

from app.database import get_alerts_collection, get_competitors_collection

router = APIRouter(prefix="/alerts", tags=["alerts"])
USER_ID = "default-user"


@router.get("")
def list_alerts(competitor_id: str | None = None, limit: int = 50):
    """List alerts (change detections). Optionally filter by competitor_id."""
    col = get_alerts_collection()
    comp_col = get_competitors_collection()
    query = {}
    if competitor_id:
        try:
            query["competitor_id"] = ObjectId(competitor_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid competitor_id")
    cursor = col.find(query).sort("created_at", -1).limit(limit)
    out = []
    for d in cursor:
        comp = comp_col.find_one({"_id": d["competitor_id"]})
        out.append({
            "id": str(d["_id"]),
            "competitor_id": str(d["competitor_id"]),
            "competitor_name": comp.get("name", "") if comp else "",
            "snapshot_id": str(d["snapshot_id"]),
            "title": d.get("title", ""),
            "description": d.get("description", ""),
            "pages": d.get("pages", []),
            "telegram_sent_at": d.get("telegram_sent_at").isoformat() if d.get("telegram_sent_at") else None,
            "created_at": d["created_at"].isoformat() if d.get("created_at") else None,
        })
    return out


@router.get("/{alert_id}")
def get_alert(alert_id: str):
    """Get a single alert by ID."""
    col = get_alerts_collection()
    try:
        doc = col.find_one({"_id": ObjectId(alert_id)})
    except Exception:
        doc = None
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": str(doc["_id"]),
        "competitor_id": str(doc["competitor_id"]),
        "snapshot_id": str(doc["snapshot_id"]),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "pages": doc.get("pages", []),
        "screenshot_paths": doc.get("screenshot_paths", []),
        "telegram_sent_at": doc.get("telegram_sent_at").isoformat() if doc.get("telegram_sent_at") else None,
        "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
    }
