from fastapi import APIRouter
from pydantic import BaseModel

from app.database import get_users_collection

router = APIRouter(prefix="/telegram", tags=["telegram"])
USER_ID = "default-user"


class TelegramLinkBody(BaseModel):
    chat_id: str
    username: str | None = None


@router.post("/link")
def link_telegram(body: TelegramLinkBody):
    """
    Save the user's Telegram chat_id so we can send alerts.
    (User gets chat_id by messaging the bot; we store it here.)
    """
    col = get_users_collection()
    col.update_one(
        {"user_id": USER_ID},
        {"$set": {"user_id": USER_ID, "telegram_chat_id": body.chat_id, "telegram_username": body.username or ""}},
        upsert=True,
    )
    return {"ok": True, "message": "Telegram linked"}


@router.get("/status")
def telegram_status():
    """Check if Telegram is linked for the current user."""
    col = get_users_collection()
    user = col.find_one({"user_id": USER_ID})
    linked = bool(user and user.get("telegram_chat_id"))
    return {"linked": linked, "username": user.get("telegram_username") if user else None}
