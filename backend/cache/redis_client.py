import json
import os
from typing import Optional

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class CacheClient:
    """Redis cache with in-memory fallback."""

    def __init__(self):
        self._memory_store: dict = {}
        self._redis = None
        self._connect_redis()

    def _connect_redis(self):
        if not REDIS_AVAILABLE:
            print("[Cache] Redis not installed, using in-memory store")
            return
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        try:
            self._redis = redis.from_url(redis_url, decode_responses=True)
            self._redis.ping()
            print(f"[Cache] Connected to Redis at {redis_url}")
        except Exception as e:
            print(f"[Cache] Redis unavailable ({e}), using in-memory store")
            self._redis = None

    def get(self, key: str) -> Optional[str]:
        try:
            if self._redis:
                return self._redis.get(key)
        except Exception:
            pass
        return self._memory_store.get(key)

    def set(self, key: str, value: str, ex: int = 300):
        try:
            if self._redis:
                self._redis.set(key, value, ex=ex)
                return
        except Exception:
            pass
        self._memory_store[key] = value

    def get_json(self, key: str):
        data = self.get(key)
        if data:
            return json.loads(data)
        return None

    def set_json(self, key: str, value, ex: int = 300):
        self.set(key, json.dumps(value, ensure_ascii=False), ex=ex)


cache = CacheClient()
