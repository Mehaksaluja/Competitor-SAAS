from bson import ObjectId
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError

from app.config import settings

_client: MongoClient | None = None
_use_memory: bool = False

# In-memory store when MongoDB is unavailable (e.g. not installed/running)
_memory: dict[str, list[dict]] = {
    "competitors": [],
    "snapshots": [],
    "alerts": [],
    "users": [],
}


def _doc_matches(d: dict, query: dict) -> bool:
    """Match doc against query; normalize IDs for comparison."""
    for k, v in query.items():
        dv = d.get(k)
        if str(dv) != str(v):
            return False
    return True


class _MemoryCursor:
    def __init__(self, items: list[dict], query: dict, sort_key: str | None = None, sort_dir: int = -1, limit: int | None = None):
        self._items = [d for d in items if _doc_matches(d, query)]
        if sort_key:
            self._items.sort(key=lambda d: d.get(sort_key) or "", reverse=(sort_dir == -1))
        if limit is not None:
            self._items = self._items[:limit]

    def sort(self, key: str, direction: int = -1):
        self._items.sort(key=lambda d: d.get(key) or "", reverse=(direction == -1))
        return self

    def limit(self, n: int):
        self._items = self._items[:n]
        return self

    def __iter__(self):
        return iter(self._items)


class _MemoryCollection:
    def __init__(self, name: str):
        self._name = name
        self._list = _memory[name]

    def find(self, query: dict):
        return _MemoryCursor(self._list, query)

    def find_one(self, query: dict):
        for d in self._list:
            if _doc_matches(d, query):
                return d
        return None

    def insert_one(self, doc: dict):
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self._list.append(doc)
        return type("Result", (), {"inserted_id": doc["_id"]})()

    def update_one(self, query: dict, update: dict, upsert: bool = False):
        for d in self._list:
            if _doc_matches(d, query):
                if "$set" in update:
                    d.update(update["$set"])
                return type("Result", (), {"modified_count": 1})()
        if upsert and "$set" in update:
            new_doc = dict(update["$set"])
            new_doc.setdefault("_id", ObjectId())
            self._list.append(new_doc)
        return type("Result", (), {"modified_count": 0})()

    def find_one_and_update(self, query: dict, update: dict, return_document: bool = False):
        for i, d in enumerate(self._list):
            if _doc_matches(d, query):
                if "$set" in update:
                    self._list[i] = {**d, **update["$set"]}
                return self._list[i]
        return None


def get_client() -> MongoClient | None:
    global _client, _use_memory
    if _client is not None:
        return _client
    if _use_memory:
        return None
    try:
        _client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=3000)
        _client.admin.command("ping")
        return _client
    except (ServerSelectionTimeoutError, Exception):
        _use_memory = True
        print("MongoDB not available; using in-memory storage. Start MongoDB to persist data.")
        return None


def get_db() -> Database | None:
    if _use_memory:
        return None
    c = get_client()
    return c[settings.mongodb_db_name] if c else None


def get_competitors_collection():
    if _use_memory:
        return _MemoryCollection("competitors")
    return get_db()["competitors"]


def get_snapshots_collection():
    if _use_memory:
        return _MemoryCollection("snapshots")
    return get_db()["snapshots"]


def get_alerts_collection():
    if _use_memory:
        return _MemoryCollection("alerts")
    return get_db()["alerts"]


def get_users_collection():
    if _use_memory:
        return _MemoryCollection("users")
    return get_db()["users"]
