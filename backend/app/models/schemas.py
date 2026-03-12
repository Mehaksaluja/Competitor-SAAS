from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class CompetitorCreate(BaseModel):
    url: str
    name: str | None = None


class CompetitorResponse(BaseModel):
    id: str
    name: str
    url: str
    user_id: str
    baseline_summary: str = ""
    baseline_snapshot_id: str | None = None
    last_scanned_at: datetime | None = None
    scan_interval_hours: int = 24
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class ScreenshotItem(BaseModel):
    page: str
    path: str
    url: str | None = None


class SnapshotResponse(BaseModel):
    id: str
    competitor_id: str
    screenshots: list[ScreenshotItem] = []
    summary: str = ""
    created_at: datetime

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: str
    competitor_id: str
    snapshot_id: str
    title: str
    description: str = ""
    pages: list[str] = []
    telegram_sent_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class TelegramLink(BaseModel):
    chat_id: str
    username: str | None = None
