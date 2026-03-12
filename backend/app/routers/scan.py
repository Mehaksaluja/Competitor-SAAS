import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException, BackgroundTasks
from bson import ObjectId

from app.config import settings
from app.database import get_competitors_collection, get_snapshots_collection

router = APIRouter(prefix="/scan", tags=["scan"])

# Project root (Competitor-SAAS); backend is project_root / "backend"
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent


def _get_scraper_path() -> Path:
    p = Path(settings.scraper_script)
    if not p.is_absolute():
        p = _PROJECT_ROOT / p
    return p.resolve()


@router.post("/{competitor_id}")
def trigger_scan(competitor_id: str, background_tasks: BackgroundTasks):
    """
    Trigger a scan for a competitor. Runs the Python scraper to capture
    screenshots (homepage, pricing, product) and stores them as a new snapshot.
    """
    col = get_competitors_collection()
    try:
        competitor = col.find_one({"_id": ObjectId(competitor_id)})
    except Exception:
        competitor = None
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")

    scraper_path = _get_scraper_path()
    if not scraper_path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Scraper script not found at {scraper_path}. Create the scraper first.",
        )

    def run_scraper_and_save():
        url = competitor["url"]
        out_dir = _PROJECT_ROOT / "data" / "screenshots" / competitor_id
        out_dir.mkdir(parents=True, exist_ok=True)
        try:
            subprocess.run(
                [sys.executable, str(scraper_path), url, str(out_dir)],
                capture_output=True,
                timeout=120,
                cwd=str(_PROJECT_ROOT),
            )
        except subprocess.TimeoutExpired:
            pass
        except Exception:
            pass
        # Persist snapshot from manifest
        manifest_path = out_dir / "manifest.json"
        if manifest_path.exists():
            snap_col = get_snapshots_collection()
            comp_col = get_competitors_collection()
            with open(manifest_path, encoding="utf-8") as f:
                manifest = json.load(f)
            screenshots = manifest.get("screenshots", [])
            now = datetime.utcnow()
            snap_doc = {
                "competitor_id": ObjectId(competitor_id),
                "screenshots": [{"page": s.get("page"), "path": s.get("path", ""), "url": s.get("url", "")} for s in screenshots],
                "summary": "",  # TODO: AI summary
                "meta": manifest,
                "created_at": now,
            }
            result = snap_col.insert_one(snap_doc)
            snap_id = result.inserted_id
            update = {"last_scanned_at": now, "updated_at": now}
            if not competitor.get("baseline_snapshot_id"):
                update["baseline_snapshot_id"] = snap_id
                update["baseline_summary"] = ""  # TODO: AI baseline summary
            comp_col.update_one({"_id": ObjectId(competitor_id)}, {"$set": update})

    background_tasks.add_task(run_scraper_and_save)
    return {"ok": True, "message": "Scan started in background", "competitor_id": competitor_id}


@router.get("/{competitor_id}/snapshots")
def list_snapshots(competitor_id: str):
    """List all snapshots (screenshot runs) for a competitor."""
    snap_col = get_snapshots_collection()
    try:
        cursor = snap_col.find({"competitor_id": ObjectId(competitor_id)}).sort("created_at", -1).limit(50)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid competitor_id")
    out = []
    for d in cursor:
        out.append({
            "id": str(d["_id"]),
            "competitor_id": competitor_id,
            "screenshots": d.get("screenshots", []),
            "summary": d.get("summary", ""),
            "created_at": d["created_at"].isoformat() if d.get("created_at") else None,
        })
    return out
