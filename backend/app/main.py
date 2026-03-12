from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_client
from app.routers import competitors, scan, alerts, telegram, screenshots


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB if available; otherwise in-memory storage is used
    get_client()
    yield


app = FastAPI(
    title="Competitor SaaS API",
    description="Backend for competitor monitoring: watchlist, scans, screenshots, alerts.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(competitors.router)
app.include_router(scan.router)
app.include_router(alerts.router)
app.include_router(telegram.router)
app.include_router(screenshots.router)


@app.get("/health")
def health():
    return {"status": "ok"}
