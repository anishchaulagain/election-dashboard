from fastapi import APIRouter, Query
from services.analytics_service import (
    get_national_stats,
    get_party_performance,
    get_closest_races,
    get_rising_candidates,
    get_demographics,
    get_drama_index,
)
from services.polling_service import get_fact_checks, get_party_top5
from cache.redis_client import cache

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/national")
async def national_stats():
    return get_national_stats()


@router.get("/parties")
async def party_performance():
    return {"parties": get_party_performance()}


@router.get("/closest-races")
async def closest_races(limit: int = Query(20, ge=1, le=100)):
    return {"races": get_closest_races(limit)}


@router.get("/rising-candidates")
async def rising_candidates(limit: int = Query(20, ge=1, le=100)):
    return {"candidates": get_rising_candidates(limit)}


@router.get("/demographics")
async def demographics():
    return get_demographics()


@router.get("/drama-index")
async def drama_index(limit: int = Query(20, ge=1, le=100)):
    return {"constituencies": get_drama_index(limit)}


@router.get("/fact-checks")
async def fact_checks():
    return {"results": get_fact_checks()}


@router.get("/party-top5")
async def party_top5():
    return {"parties": get_party_top5()}


@router.get("/events")
async def recent_events():
    events = cache.get_json("election:events") or []
    return {"events": events}
