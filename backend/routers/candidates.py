from fastapi import APIRouter, Query
from typing import Optional
from services.analytics_service import get_candidate_detail, get_aggregated_candidates
from services.polling_service import get_candidates

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])


@router.get("")
async def list_candidates(
    party: Optional[str] = Query(None, description="Filter by party name"),
    district: Optional[str] = Query(None, description="Filter by district"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    search: Optional[str] = Query(None, description="Search by name"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
):
    candidates = get_aggregated_candidates()

    if party:
        candidates = [c for c in candidates if party.lower() in (c.get("PoliticalPartyName") or "").lower()]
    if district:
        candidates = [c for c in candidates if district.lower() in (c.get("DistrictName") or "").lower()]
    if gender:
        candidates = [c for c in candidates if c.get("Gender") == gender]
    if search:
        candidates = [c for c in candidates if search.lower() in (c.get("CandidateName") or "").lower()]

    # Sort by votes descending
    candidates.sort(key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)

    total = len(candidates)
    start = (page - 1) * limit
    end = start + limit

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "candidates": candidates[start:end],
    }


@router.get("/{candidate_id}")
async def get_candidate(candidate_id: int):
    result = get_candidate_detail(candidate_id)
    if not result:
        return {"error": "Candidate not found"}
    return result
