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

# backend/app/routers/scan.py -> go up to backend dir, then to project root (Competitor-SAAS)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent  # backend
_PROJECT_ROOT = _BACKEND_DIR.parent  # Competitor-SAAS (where scraper/ lives)


def _get_scraper_path() -> Path | None:
    """Return path to scraper script if it exists; try project root and cwd."""
    candidates = [
        _PROJECT_ROOT / "scraper" / "capture.py",
        _PROJECT_ROOT / settings.scraper_script,
        Path(settings.scraper_script).resolve(),
        Path.cwd() / "scraper" / "capture.py",
        Path.cwd() / settings.scraper_script,
    ]
    for p in candidates:
        if p and p.exists():
            return p.resolve()
    return None


@router.get("/debug")
def scan_debug():
    """
    Check scraper setup: path resolution, file exists, project root.
    Use this to see why "Scan now" might not be running the scraper.
    """
    path = _get_scraper_path()
    return {
        "scraper_found": path is not None,
        "scraper_path": str(path) if path else None,
        "project_root": str(_PROJECT_ROOT),
        "cwd": str(Path.cwd()),
        "python": sys.executable,
        "hint": "Install scraper deps in the **backend** env: pip install -r ../scraper/requirements.txt then playwright install chromium (from backend folder)."
    }


@router.post("/{competitor_id}")
def trigger_scan(competitor_id: str, background_tasks: BackgroundTasks):
    """
    Trigger a scan for a competitor. Runs the Python scraper to capture
    screenshots (homepage, pricing, product) and stores them as a new snapshot.
    If the scraper script is not found, a placeholder snapshot is still created.
    """
    col = get_competitors_collection()
    try:
        competitor = col.find_one({"_id": ObjectId(competitor_id)})
    except Exception:
        competitor = None
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")

    scraper_path = _get_scraper_path()

    def run_scraper_and_save():
        snap_col = get_snapshots_collection()
        comp_col = get_competitors_collection()
        now = datetime.utcnow()
        out_dir = _PROJECT_ROOT / "data" / "screenshots" / competitor_id
        saved = False

        scrape_error = None
        if scraper_path:
            out_dir.mkdir(parents=True, exist_ok=True)
            try:
                result = subprocess.run(
                    [sys.executable, str(scraper_path), competitor["url"], str(out_dir)],
                    capture_output=True,
                    timeout=120,
                    cwd=str(_PROJECT_ROOT),
                    text=True,
                )
                if result.returncode != 0:
                    scrape_error = (result.stderr or result.stdout or f"Exit code {result.returncode}").strip()[:500]
            except subprocess.TimeoutExpired:
                scrape_error = "Scraper timed out (120s)."
            except Exception as e:
                scrape_error = str(e)[:500]
            manifest_path = out_dir / "manifest.json"
            if manifest_path.exists():
                with open(manifest_path, encoding="utf-8") as f:
                    manifest = json.load(f)
                screenshots = manifest.get("screenshots", [])
                snap_doc = {
                    "competitor_id": ObjectId(competitor_id),
                    "screenshots": [{"page": s.get("page"), "path": s.get("path", ""), "url": s.get("url", "")} for s in screenshots],
                    "summary": "",
                    "meta": manifest,
                    "created_at": now,
                }
                result = snap_col.insert_one(snap_doc)
                saved = True
                snap_id = result.inserted_id

        if not saved:
            msg = "Scraper not run."
            if not scraper_path:
                msg += " Script not found. Check GET /scan/debug for paths."
            elif scrape_error:
                msg += f" Error: {scrape_error}"
            else:
                msg += " No manifest.json produced. Install deps in **backend** env: cd backend && pip install -r ../scraper/requirements.txt && playwright install chromium"
            snap_doc = {
                "competitor_id": ObjectId(competitor_id),
                "screenshots": [],
                "summary": msg,
                "meta": {},
                "created_at": now,
            }
            result = snap_col.insert_one(snap_doc)
            snap_id = result.inserted_id

        update = {"last_scanned_at": now, "updated_at": now}
        comp = comp_col.find_one({"_id": ObjectId(competitor_id)})
        if comp and not comp.get("baseline_snapshot_id") and snap_id is not None:
            update["baseline_snapshot_id"] = snap_id
            update["baseline_summary"] = ""
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
