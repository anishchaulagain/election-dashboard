import asyncio
import httpx
import os
import json
from datetime import datetime
from cache.redis_client import cache
from services.event_detector import detect_events

ELECTION_API_URL = os.getenv(
    "ELECTION_API_URL",
    "https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt"
)
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "30"))

# Connected WebSocket clients
ws_clients: set = set()


async def fetch_election_data() -> list[dict]:
    """Fetch all candidate data from the election API."""
    all_candidates = []
    page = 1
    rows_per_page = 500

    async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
        while True:
            params = {
                "_search": "false",
                "nd": str(int(datetime.now().timestamp() * 1000)),
                "rows": str(rows_per_page),
                "page": str(page),
                "sidx": "_id",
                "sord": "asc",
            }
            try:
                resp = await client.get(ELECTION_API_URL, params=params)
                resp.raise_for_status()
                text = resp.text.strip()
                if text.startswith('\ufeff'):
                    text = text[1:]
                data = json.loads(text)
                if not data or len(data) == 0:
                    break
                all_candidates.extend(data)
                if len(data) < rows_per_page:
                    break
                page += 1
            except Exception as e:
                print(f"[Polling] Error fetching page {page}: {e}")
                break

    return all_candidates


async def poll_election_data():
    """Background polling loop that runs every POLL_INTERVAL seconds."""
    print(f"[Polling] Starting election data poller (interval: {POLL_INTERVAL}s)")

    while True:
        try:
            candidates = await fetch_election_data()
            if candidates:
                # Get previous data for comparison
                previous = cache.get_json("election:candidates")

                # Store new data
                cache.set_json("election:candidates", candidates, ex=120)
                cache.set("election:last_updated", datetime.now().isoformat(), ex=120)
                cache.set("election:candidate_count", str(len(candidates)), ex=120)

                print(f"[Polling] Fetched {len(candidates)} candidates at {datetime.now().isoformat()}")

                # Detect events by comparing with previous data
                if previous:
                    events = detect_events(previous, candidates)
                    if events:
                        # Store events
                        existing_events = cache.get_json("election:events") or []
                        all_events = events + existing_events
                        cache.set_json("election:events", all_events[:100], ex=600)

                        # Broadcast to WebSocket clients
                        event_data = json.dumps(
                            {"type": "events", "data": [e.dict() for e in events]},
                            ensure_ascii=False
                        )
                        disconnected = set()
                        for ws in ws_clients:
                            try:
                                await ws.send_text(event_data)
                            except Exception:
                                disconnected.add(ws)
                        ws_clients -= disconnected

                # Also broadcast updated stats
                stats_data = json.dumps(
                    {"type": "update", "candidate_count": len(candidates),
                     "timestamp": datetime.now().isoformat()},
                    ensure_ascii=False
                )
                disconnected = set()
                for ws in ws_clients:
                    try:
                        await ws.send_text(stats_data)
                    except Exception:
                        disconnected.add(ws)
                ws_clients -= disconnected

        except Exception as e:
            print(f"[Polling] Error: {e}")

        await asyncio.sleep(POLL_INTERVAL)


def get_candidates() -> list[dict]:
    """Get cached candidates or return empty list."""
    data = cache.get_json("election:candidates")
    return data or []


def get_last_updated() -> str:
    return cache.get("election:last_updated") or "N/A"
