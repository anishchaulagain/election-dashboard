from fastapi import APIRouter, Query
from typing import Optional
from collections import defaultdict
from services.analytics_service import get_constituency_detail
from services.polling_service import get_candidates

router = APIRouter(prefix="/api/constituencies", tags=["Constituencies"])


@router.get("")
async def list_constituencies(
    state: Optional[str] = Query(None, description="Filter by state/province"),
    search: Optional[str] = Query(None, description="Search by district name"),
):
    candidates = get_candidates()
    groups = defaultdict(list)
    for c in candidates:
        key = (c.get("DistrictName", ""), c.get("ConstName", 0))
        groups[key].append(c)

    result = []
    for (district, const_num), cs in groups.items():
        if state and state.lower() not in (cs[0].get("StateName", "") or "").lower():
            continue
        if search and search.lower() not in district.lower():
            continue

        total_votes = sum(c.get("TotalVoteReceived", 0) for c in cs)
        sorted_c = sorted(cs, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
        leader = sorted_c[0] if sorted_c else None

        result.append({
            "district": district,
            "const_number": const_num,
            "state": cs[0].get("StateName", "") if cs else "",
            "total_votes": total_votes,
            "candidates_count": len(cs),
            "leading_party": leader.get("PoliticalPartyName") if leader and leader.get("TotalVoteReceived", 0) > 0 else None,
            "leading_candidate": leader.get("CandidateName") if leader and leader.get("TotalVoteReceived", 0) > 0 else None,
        })

    result.sort(key=lambda x: x["total_votes"], reverse=True)
    return {"total": len(result), "constituencies": result}


@router.get("/{district}/{const_num}")
async def get_constituency(district: str, const_num: int):
    result = get_constituency_detail(district, const_num)
    if not result:
        return {"error": "Constituency not found"}
    return result
