# Scraper

Captures screenshots of competitor sites (homepage, /pricing, /product) using Playwright.

## Setup (one-time)

From the **project root** (`Competitor-SAAS`):

```bash
cd scraper
pip install -r requirements.txt
playwright install chromium
```

On Windows (PowerShell):

```powershell
cd scraper
pip install -r requirements.txt
playwright install chromium
```

## Test locally

```bash
python capture.py https://example.com ./out
# Creates ./out/homepage.png, pricing.png, product.png, manifest.json
```

The backend runs this script when you click **Scan now** in the dashboard.
