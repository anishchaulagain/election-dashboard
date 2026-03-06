import asyncio
import httpx
import os
import json
from datetime import datetime
from cache.redis_client import cache
from services.event_detector import detect_events

POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))
ELECTION_API_URL = os.getenv(
    "ELECTION_API_URL",
    "https://result.election.gov.np/Handlers/SecureJson.ashx"
)
FACT_CHECK_API_URL = os.getenv(
    "FACT_CHECK_API_URL",
    "https://nepalosint.com/api/v1/fact-check/results?limit=20&hours=168"
)
FEATURED_CONTENT_API_URL = os.getenv(
    "FEATURED_CONTENT_API_URL",
    "https://keyvalue.hamropatro.com/kv/get/major-election-2082-featured_content::-1"
)
HOR_PARTY_TOP5_API_URL = os.getenv(
    "HOR_PARTY_TOP5_API_URL",
    "https://result.election.gov.np/Handlers/HoRPartyTop5.ashx"
)
FACT_CHECK_API_TOKEN = os.getenv("FACT_CHECK_API_TOKEN")



async def fetch_election_data() -> list[dict]:
    """Fetch all candidate data from the election API."""
    all_candidates = []
    page = 1
    rows_per_page = 500

    headers = {
        "x-csrf-token": "d99e6e506e8b4d5b92ad2afb8ff7ec8a",
        "x-requested-with": "XMLHttpRequest",
        "referer": "https://result.election.gov.np/",
        "cookie": "ASP.NET_SessionId=px3sjnva4pgnx4u5bcc1oksn; CsrfToken=d99e6e506e8b4d5b92ad2afb8ff7ec8a",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    async with httpx.AsyncClient(timeout=30.0, verify=False, headers=headers) as client:
        while True:
            params = {
                "file": "JSONFiles/ElectionResultCentral2082.txt",
                "_search": "false",
                "nd": str(int(datetime.now().timestamp() * 1000)),
                "rows": str(rows_per_page),
                "page": str(page),
                "sidx": "_id",
                "sord": "desc",
            }
            try:
                resp = await client.get(ELECTION_API_URL, params=params)
                resp.raise_for_status()
                text = resp.text.strip()
                if text.startswith('\ufeff'):
                    text = text[1:]
                data = json.loads(text)
                
                # The response structure might have changed. 
                # According to the curl, it returns a list of candidate objects directly or inside a wrapper.
                # Assuming it returns a list of candidates based on the provided sample.
                
                rows = data if isinstance(data, list) else data.get("rows", [])
                
                if not rows or len(rows) == 0:
                    break
                all_candidates.extend(rows)
                if len(rows) < rows_per_page:
                    break
                await asyncio.sleep(0.5) # Add small delay between pages to avoid 429
                page += 1
            except Exception as e:
                print(f"[Polling] Error fetching page {page}: {e}")
                break

    return all_candidates


async def fetch_party_top5() -> list[dict]:
    """Fetch Party Top 5 data from the election API."""
    headers = {
        "x-csrf-token": "d99e6e506e8b4d5b92ad2afb8ff7ec8a",
        "x-requested-with": "XMLHttpRequest",
        "referer": "https://result.election.gov.np/",
        "cookie": "ASP.NET_SessionId=px3sjnva4pgnx4u5bcc1oksn; CsrfToken=d99e6e506e8b4d5b92ad2afb8ff7ec8a",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    async with httpx.AsyncClient(timeout=30.0, verify=False, headers=headers) as client:
        params = {
            "file": "JSONFiles/Election2082/Common/HoRPartyTop5.txt",
            "_search": "false",
            "nd": str(int(datetime.now().timestamp() * 1000)),
        }
        try:
            resp = await client.get(ELECTION_API_URL, params=params)
            resp.raise_for_status()
            text = resp.text.strip()
            if text.startswith('\ufeff'):
                text = text[1:]
            data = json.loads(text)
            return data if isinstance(data, list) else []
        except Exception as e:
            print(f"[Polling] Error fetching Party Top 5: {e}")
            return []


async def fetch_fact_checks() -> list[dict]:
    """Fetch recent fact checks from the independent news API."""
    headers = {}
    if FACT_CHECK_API_TOKEN:
        headers["Authorization"] = f"Bearer {FACT_CHECK_API_TOKEN}"

    async with httpx.AsyncClient(timeout=30.0, verify=False, headers=headers) as client:
        try:
            resp = await client.get(FACT_CHECK_API_URL)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            print(f"[Polling] Error fetching Fact Checks: {e}")
            return []


async def fetch_featured_content() -> dict:
    """Fetch featured content from Hamro Patro API."""
    async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
        try:
            resp = await client.get(FEATURED_CONTENT_API_URL)
            resp.raise_for_status()
            data = resp.json()
            # The API returns a list with one item containing the stringified JSON value
            if data.get("list") and len(data["list"]) > 0:
                value_str = data["list"][0].get("value")
                if value_str:
                    return json.loads(value_str)
            return {}
        except Exception as e:
            print(f"[Polling] Error fetching Featured Content: {e}")
            return {}


async def poll_election_data():
    """Background polling loop that runs every POLL_INTERVAL seconds."""
    print(f"[Polling] Starting election data poller (interval: {POLL_INTERVAL}s)")

    while True:
        try:
            candidates = await fetch_election_data()
            party_top5 = await fetch_party_top5()
            fact_checks = await fetch_fact_checks()
            featured = await fetch_featured_content()

            if candidates:
                # Get previous data for comparison
                previous = cache.get_json("election:candidates")

                # Store new data
                cache.set_json("election:candidates", candidates, ex=120)
                if party_top5:
                    cache.set_json("election:party_top5", party_top5, ex=120)
                
                if fact_checks:
                    cache.set_json("election:fact_checks", fact_checks, ex=600)
                
                if featured:
                    cache.set_json("election:featured", featured, ex=120)
                
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


        except Exception as e:
            print(f"[Polling] Error: {e}")

        await asyncio.sleep(POLL_INTERVAL)


def get_candidates() -> list[dict]:
    """Get cached candidates or return empty list."""
    data = cache.get_json("election:candidates")
    return data or []


def get_last_updated() -> str:
    return cache.get("election:last_updated") or "N/A"


def get_party_top5() -> list[dict]:
    """Get cached Party Top 5 data or return empty list."""
    data = cache.get_json("election:party_top5")
    return data or []


def get_fact_checks() -> list[dict]:
    """Get cached fact checks or return empty list."""
    data = cache.get_json("election:fact_checks")
    return data or []


def get_featured_content() -> dict:
    """Get cached featured content or return empty dict."""
    data = cache.get_json("election:featured")
    return data or {}
