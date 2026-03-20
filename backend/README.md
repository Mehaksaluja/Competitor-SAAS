# Backend (Python)

FastAPI backend for the competitor monitoring SaaS: watchlist, scans, screenshots, alerts.

## Setup

1. **Python 3.11+** recommended.

2. **Virtual env and install:**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   # source .venv/bin/activate   # macOS/Linux
   pip install -r requirements.txt
   ```

3. **MongoDB** (optional). If MongoDB is not running, the app uses **in-memory storage** so you can still test the API and frontend. Data is lost on restart. To persist data, run MongoDB locally (e.g. `mongodb://localhost:27017`) or set `MONGODB_URI` in `.env`.

4. **Environment:**
   ```bash
   copy .env.example .env
   # Edit .env: PORT, MONGODB_URI, etc.
   ```

5. **Scraper (for "Scan now" screenshots):** The backend runs the scraper script with the **same Python** as the server. Install scraper deps **inside the backend venv**:
   ```bash
   cd backend
   .venv\Scripts\activate
   pip install -r ../scraper/requirements.txt
   playwright install chromium
   ```
   You do **not** start the scraper separately—clicking "Scan now" in the dashboard runs it automatically.
```bash
uvicorn app.main:app --reload --port 8000
```

API: **http://localhost:8000**  
Docs: **http://localhost:8000/docs**

## Test the APIs

### 1. Health
```bash
curl http://localhost:8000/health
# -> {"status":"ok"}
```

### 2. List competitors (empty at first)
```bash
curl http://localhost:8000/competitors
# -> []
```

### 3. Add a competitor
```bash
curl -X POST http://localhost:8000/competitors -H "Content-Type: application/json" -d "{\"url\": \"https://stripe.com\"}"
# -> 201 with competitor object (id, name, url, ...)
```

### 4. List again
```bash
curl http://localhost:8000/competitors
# -> [{ ... }]
```

### 5. Scraper debug (why "Scan now" might fail)
```bash
curl http://localhost:8000/scan/debug
# Shows: scraper_found, scraper_path, project_root, python path, and a hint.
```

### 6. Trigger scan (requires scraper deps in backend venv)
```bash
curl -X POST http://localhost:8000/scan/<competitor_id>
# -> {"ok":true,"message":"Scan started in background","competitor_id":"..."}
```
If it fails, open "View snapshots"—the summary will show the actual error (e.g. missing playwright).

### 7. Telegram link (optional)
```bash
curl -X POST http://localhost:8000/telegram/link -H "Content-Type: application/json" -d "{\"chat_id\": \"123456\", \"username\": \"you\"}"
curl http://localhost:8000/telegram/status
```

### 8. Alerts (empty until we have change detection)
```bash
curl http://localhost:8000/alerts
curl "http://localhost:8000/alerts?competitor_id=<id>"
```

## Scraper (Python)

Lives in `../scraper/`. Captures homepage, `/pricing`, `/product` screenshots.

```bash
cd scraper
pip install -r requirements.txt
playwright install chromium
python capture.py https://example.com ./out
# -> ./out/homepage.png, pricing.png, product.png, manifest.json
```

Backend calls this script when you POST `/scan/{competitor_id}`.
