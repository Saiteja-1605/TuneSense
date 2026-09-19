import os
import logging
from typing import Any, Dict, List, Optional
import uuid
import datetime

logger = logging.getLogger("tunesense.database")

# Intelligent Async In-Memory MongoDB mock implementation for seamless local offline/test support
class MockAsyncCursor:
    def __init__(self, docs: List[Dict[str, Any]]):
        self._docs = list(docs)
        self._skip_val = 0
        self._limit_val = None
        self._sort_key = None
        self._sort_dir = 1

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list) and key_or_list:
            self._sort_key, self._sort_dir = key_or_list[0]
        elif isinstance(key_or_list, str):
            self._sort_key = key_or_list
            self._sort_dir = direction
        return self

    def skip(self, count: int):
        self._skip_val = count
        return self

    def limit(self, count: int):
        self._limit_val = count
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        docs = list(self._docs)
        if self._sort_key:
            reverse = self._sort_dir == -1
            docs.sort(key=lambda d: d.get(self._sort_key, 0) or 0, reverse=reverse)
        if self._skip_val:
            docs = docs[self._skip_val:]
        if self._limit_val is not None:
            docs = docs[:self._limit_val]
        if length is not None:
            docs = docs[:length]
        return [dict(d) for d in docs]


class MockAsyncCollection:
    def __init__(self, name: str):
        self.name = name
        self._store: List[Dict[str, Any]] = []

    def _match(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._match(doc, subq) for subq in v):
                    return False
                continue
            if isinstance(v, dict):
                val = doc.get(k)
                if "$in" in v:
                    if val not in v["$in"] and not (isinstance(val, list) and any(item in v["$in"] for item in val)):
                        return False
                if "$nin" in v:
                    if val in v["$nin"]:
                        return False
                if "$regex" in v:
                    pattern = v["$regex"]
                    options = v.get("$options", "")
                    import re
                    flags = re.IGNORECASE if "i" in options else 0
                    if not re.search(pattern, str(val or ""), flags):
                        return False
                if "$gte" in v:
                    if (val or 0) < v["$gte"]:
                        return False
                if "$lte" in v:
                    if (val or 0) > v["$lte"]:
                        return False
            else:
                val = doc.get(k)
                if isinstance(val, list):
                    if v not in val:
                        return False
                elif val != v:
                    return False
        return True

    async def find_one(self, query: Dict[str, Any] = None, projection: Any = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        for d in self._store:
            if self._match(d, query):
                return dict(d)
        return None

    def find(self, query: Dict[str, Any] = None, projection: Any = None) -> MockAsyncCursor:
        query = query or {}
        matched = [d for d in self._store if self._match(d, query)]
        return MockAsyncCursor(matched)

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self._store.append(doc_copy)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    async def insert_many(self, docs: List[Dict[str, Any]]):
        for d in docs:
            await self.insert_one(d)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        class UpdateResult:
            def __init__(self, matched_count, modified_count, upserted_id=None):
                self.matched_count = matched_count
                self.modified_count = modified_count
                self.upserted_id = upserted_id

        for d in self._store:
            if self._match(d, query):
                if "$set" in update:
                    d.update(update["$set"])
                if "$push" in update:
                    for field, val in update["$push"].items():
                        if field not in d or not isinstance(d[field], list):
                            d[field] = []
                        d[field].append(val)
                if "$pull" in update:
                    for field, val in update["$pull"].items():
                        if field in d and isinstance(d[field], list):
                            d[field] = [x for x in d[field] if x != val]
                if "$setOnInsert" in update and upsert:
                    pass
                return UpdateResult(1, 1)

        if upsert:
            new_doc = dict(query)
            if "$set" in update:
                new_doc.update(update["$set"])
            if "$push" in update:
                for field, val in update["$push"].items():
                    new_doc[field] = [val]
            if "$setOnInsert" in update:
                new_doc.update(update["$setOnInsert"])
            if "_id" not in new_doc:
                new_doc["_id"] = str(uuid.uuid4())
            self._store.append(new_doc)
            return UpdateResult(0, 0, upserted_id=new_doc["_id"])
        return UpdateResult(0, 0)

    async def delete_one(self, query: Dict[str, Any]):
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count

        for i, d in enumerate(self._store):
            if self._match(d, query):
                self._store.pop(i)
                return DeleteResult(1)
        return DeleteResult(0)

    async def delete_many(self, query: Dict[str, Any]):
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count

        initial_len = len(self._store)
        self._store = [d for d in self._store if not self._match(d, query)]
        return DeleteResult(initial_len - len(self._store))

    async def count_documents(self, query: Dict[str, Any] = None) -> int:
        query = query or {}
        return sum(1 for d in self._store if self._match(d, query))

    async def distinct(self, key: str, query: Dict[str, Any] = None) -> List[Any]:
        query = query or {}
        res = set()
        for d in self._store:
            if self._match(d, query):
                val = d.get(key)
                if isinstance(val, list):
                    res.update(val)
                elif val is not None:
                    res.add(val)
        return list(res)

    async def create_index(self, keys, **kwargs):
        return "mock_index"


class MockAsyncDatabase:
    def __init__(self, name: str):
        self.name = name
        self._collections: Dict[str, MockAsyncCollection] = {}

    def __getitem__(self, item: str) -> MockAsyncCollection:
        if item not in self._collections:
            self._collections[item] = MockAsyncCollection(item)
        return self._collections[item]

    def get_collection(self, item: str) -> MockAsyncCollection:
        return self[item]


# Database manager
class DatabaseManager:
    client: Any = None
    db: Any = None
    is_mock: bool = False

    async def connect(self, uri: str, db_name: str):
        if uri and uri.strip() and not uri.startswith("mock://"):
            try:
                import motor.motor_asyncio
                logger.info(f"Connecting to MongoDB at {uri[:25]}...")
                self.client = motor.motor_asyncio.AsyncIOMotorClient(
                    uri,
                    serverSelectionTimeoutMS=3000
                )
                self.db = self.client[db_name]
                # Ping server to confirm connection
                await self.client.admin.command("ping")
                self.is_mock = False
                logger.info(f"Successfully connected to MongoDB database '{db_name}'.")
                return
            except Exception as e:
                logger.warning(f"Could not connect to external MongoDB ({e}). Falling back to robust Async In-Memory Database store.")
        
        # Fallback
        self.is_mock = True
        self.db = MockAsyncDatabase(db_name)
        logger.info(f"Using Async In-Memory Database store for '{db_name}'.")

    async def close(self):
        if self.client and not self.is_mock:
            self.client.close()
            logger.info("MongoDB connection closed.")

    def get_collection(self, name: str):
        if self.db is None:
            self.db = MockAsyncDatabase("tunesense")
            self.is_mock = True
        return self.db[name]

db_manager = DatabaseManager()

def get_db():
    return db_manager.db
