import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


def normalize_url(url: str) -> str:
    u = url.strip()
    if not u.startswith(("http://", "https://")):
        u = "https://" + u
    return u.rstrip("/")


def capture(url: str, output_dir: str | Path) -> dict:
    """
    Visit url and common paths (/, /pricing, /product), take full-page screenshots.
    Returns a manifest dict with paths and page URLs for the backend to store.
    """
    url = normalize_url(url)
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    base = url.rstrip("/")
    pages_to_capture = [
        ("homepage", base + "/"),
        ("pricing", base + "/pricing"),
        ("product", base + "/product"),
    ]

    screenshots = []
    manifest = {"url": url, "screenshots": []}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        page = context.new_page()
        page.set_default_timeout(15000)

        for page_name, page_url in pages_to_capture:
            path = out / f"{page_name}.png"
            try:
                page.goto(page_url, wait_until="domcontentloaded")
                page.wait_for_timeout(1000)
                page.screenshot(path=path, full_page=True)
                screenshots.append({"page": page_name, "path": str(path), "url": page_url})
                manifest["screenshots"].append({"page": page_name, "path": str(path), "url": page_url})
            except Exception as e:
                manifest["screenshots"].append({"page": page_name, "path": "", "url": page_url, "error": str(e)})

        browser.close()

    manifest_path = out / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    return manifest


def main():
    if len(sys.argv) < 3:
        print("Usage: python capture.py <url> <output_dir>", file=sys.stderr)
        sys.exit(1)
    url = sys.argv[1]
    output_dir = sys.argv[2]
    capture(url, output_dir)
    print(f"Captured to {output_dir}")


if __name__ == "__main__":
    main()
