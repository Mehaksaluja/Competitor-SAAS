from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8000
    mongodb_uri: str = "mongodb://localhost:27017/competitor-saas"
    mongodb_db_name: str = "competitor-saas"  # or parsed from mongodb_uri
    openai_api_key: str | None = None
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    scraper_script: str = "scraper/capture.py"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
