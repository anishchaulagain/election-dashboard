from collections import defaultdict
from typing import Optional
from services.polling_service import get_candidates


def get_aggregated_candidates() -> list[dict]:
    """Return all unique candidates aggregated across all constituencies."""
    candidates = get_candidates()
    groups = _group_by_constituency(candidates)
    
    all_aggregated = []
    for cs in groups.values():
        all_aggregated.extend(cs)
    return all_aggregated


def _group_by_constituency(candidates: list[dict]) -> dict:
    """Group candidates by (DistrictCd, SCConstID) and aggregate by CandidateID."""
    groups = defaultdict(lambda: defaultdict(list))
    for c in candidates:
        key = (c.get("DistrictCd", 0), str(c.get("SCConstID", "0")))
        cid = c.get("CandidateID")
        groups[key][cid].append(c)

    # Aggregate records for each candidate in each constituency
    final_groups = defaultdict(list)
    for const_key, candidates_by_id in groups.items():
        for cid, records in candidates_by_id.items():
            # Use the first record as base
            base = dict(records[0])
            # If multiple records, we sum votes (likely polling station level data)
            if len(records) > 1:
                base["TotalVoteReceived"] = sum(r.get("TotalVoteReceived", 0) for r in records)
                base["CastedVote"] = sum(r.get("CastedVote", 0) for r in records)
            final_groups[const_key].append(base)
    
    return final_groups


def _get_constituency_leader(candidates: list[dict]):
    """Return the leading candidate in a constituency."""
    sorted_c = sorted(candidates, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
    return sorted_c[0] if sorted_c else None


def _compute_gap(candidates: list[dict]) -> tuple:
    """Compute vote gap between top 2 candidates."""
    sorted_c = sorted(candidates, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
    if len(sorted_c) < 2:
        return 0, 0.0
    vote1 = sorted_c[0].get("TotalVoteReceived", 0)
    vote2 = sorted_c[1].get("TotalVoteReceived", 0)
    total = sum(c.get("TotalVoteReceived", 0) for c in candidates)
    gap = vote1 - vote2
    gap_pct = (gap / total * 100) if total > 0 else 0
    return gap, gap_pct


def _classify_competitiveness(gap_pct: float) -> str:
    if gap_pct < 2:
        return "Ultra Close"
    elif gap_pct < 5:
        return "Battle"
    elif gap_pct < 10:
        return "Competitive"
    else:
        return "Safe Lead"


# Party name normalization for major parties
MAJOR_PARTIES = {
    "एकीकृत मार्क्सवादी लेनिनवादी": {"short": "UML", "color": "#1e40af"},
    "नेपाली काँग्रेस": {"short": "Congress", "color": "#16a34a"},
    "माओवादी": {"short": "Maoist", "color": "#dc2626"},
    "राष्ट्रिय स्वतन्त्र पार्टी": {"short": "RSP", "color": "#7c3aed"},
    "राष्ट्रिय प्रजातन्त्र पार्टी": {"short": "RPP", "color": "#ca8a04"},
    "जनता समाजवादी": {"short": "JSP", "color": "#ea580c"},
}


def _get_party_short(party_name: str) -> str:
    if not party_name:
        return "Other"
    for key, val in MAJOR_PARTIES.items():
        if key in party_name:
            return val["short"]
    return "Other"


def get_national_stats() -> dict:
    candidates = get_candidates()
    if not candidates:
        return {
            "total_candidates": 0, "total_votes": 0,
            "total_constituencies": 0, "constituencies_reporting": 0,
            "parties_count": 0, "leading_party": None, "party_seats": [],
            "last_updated": "N/A"
        }

    groups = _group_by_constituency(candidates)
    total_votes = sum(c.get("TotalVoteReceived", 0) for c in candidates)
    parties = set(c.get("PoliticalPartyName", "") for c in candidates)
    constituencies_reporting = sum(
        1 for cs in groups.values()
        if any(c.get("TotalVoteReceived", 0) > 0 for c in cs)
    )

    # Party seat counts
    party_seats = defaultdict(lambda: {"seats": 0, "votes": 0, "candidates": 0})
    for key, cs in groups.items():
        for c in cs:
            p = c.get("PoliticalPartyName", "Unknown")
            party_seats[p]["votes"] += c.get("TotalVoteReceived", 0)
            party_seats[p]["candidates"] += 1
        leader = _get_constituency_leader(cs)
        if leader and leader.get("TotalVoteReceived", 0) > 0:
            p = leader.get("PoliticalPartyName", "Unknown")
            party_seats[p]["seats"] += 1

    party_list = []
    for party, stats in sorted(party_seats.items(), key=lambda x: x[1]["seats"], reverse=True):
        vote_share = (stats["votes"] / total_votes * 100) if total_votes > 0 else 0
        party_list.append({
            "party": party,
            "short_name": _get_party_short(party),
            "seats_leading": stats["seats"],
            "total_votes": stats["votes"],
            "vote_share": round(vote_share, 2),
            "candidates_count": stats["candidates"],
            "seat_change": 0,
        })

    leading_party = party_list[0]["party"] if party_list and party_list[0]["seats_leading"] > 0 else None

    # Count unique candidates across all constituencies
    unique_candidate_ids = set()
    for cs in groups.values():
        for c in cs:
            if c.get("CandidateID"):
                unique_candidate_ids.add(c.get("CandidateID"))

    from services.polling_service import get_last_updated

    return {
        "total_candidates": len(unique_candidate_ids),
        "total_votes": total_votes,
        "total_constituencies": len(groups),
        "constituencies_reporting": constituencies_reporting,
        "parties_count": len(parties),
        "leading_party": leading_party,
        "party_seats": party_list[:20],
        "last_updated": get_last_updated(),
    }


def get_party_performance() -> list[dict]:
    stats = get_national_stats()
    return stats.get("party_seats", [])


def get_closest_races(limit: int = 20) -> list[dict]:
    candidates = get_candidates()
    groups = _group_by_constituency(candidates)
    races = []

    for (district, const_num), cs in groups.items():
        total_votes = sum(c.get("TotalVoteReceived", 0) for c in cs)
        gap, gap_pct = _compute_gap(cs)
        sorted_c = sorted(cs, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)

        races.append({
            "district": cs[0].get("DistrictName", ""),
            "district_cd": cs[0].get("DistrictCd", 0),
            "const_number": cs[0].get("SCConstID", "0"),
            "state": cs[0].get("StateName", "") if cs else "",
            "total_votes": total_votes,
            "vote_gap": gap,
            "gap_percentage": round(gap_pct, 2),
            "competitiveness": _classify_competitiveness(gap_pct),
            "candidates_count": len(cs),
            "leader": sorted_c[0] if sorted_c else None,
            "runner_up": sorted_c[1] if len(sorted_c) > 1 else None,
        })

    # Sort by gap percentage (ascending = closest first)
    # But put constituencies with 0 total votes at the end
    reporting = [r for r in races if r["total_votes"] > 0]
    non_reporting = [r for r in races if r["total_votes"] == 0]
    reporting.sort(key=lambda x: x["gap_percentage"])

    return (reporting + non_reporting)[:limit]


def get_rising_candidates(limit: int = 20) -> list[dict]:
    """Get candidates with biggest vote gains from previous poll."""
    from cache.redis_client import cache
    current = get_candidates()
    previous = cache.get_json("election:previous_candidates")

    if not previous or not current:
        # No previous data, return top vote getters
        sorted_c = sorted(current, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
        return [
            {
                "candidate_id": c.get("CandidateID"),
                "name": c.get("CandidateName", ""),
                "party": c.get("PoliticalPartyName", ""),
                "district": c.get("DistrictName", ""),
                "district_cd": c.get("DistrictCd", 0),
                "const_number": c.get("SCConstID", "0"),
                "votes_gained": c.get("TotalVoteReceived", 0),
                "current_votes": c.get("TotalVoteReceived", 0),
            }
            for c in sorted_c[:limit]
            if c.get("TotalVoteReceived", 0) > 0
        ]

    prev_map = {c.get("CandidateID"): c.get("TotalVoteReceived", 0) for c in previous}
    rising = []
    for c in current:
        cid = c.get("CandidateID")
        current_votes = c.get("TotalVoteReceived", 0)
        prev_votes = prev_map.get(cid, 0)
        gained = current_votes - prev_votes
        if gained > 0:
            rising.append({
                "candidate_id": cid,
                "name": c.get("CandidateName", ""),
                "party": c.get("PoliticalPartyName", ""),
                "district": c.get("DistrictName", ""),
                "district_cd": c.get("DistrictCd", 0),
                "const_number": c.get("SCConstID", "0"),
                "votes_gained": gained,
                "current_votes": current_votes,
            })

    rising.sort(key=lambda x: x["votes_gained"], reverse=True)
    return rising[:limit]


def get_demographics() -> dict:
    candidates = get_candidates()
    if not candidates:
        return {
            "gender_distribution": {},
            "age_distribution": {},
            "education_distribution": {},
            "female_leading_count": 0,
            "youngest_candidate": None,
            "oldest_candidate": None,
            "average_age": 0,
        }

    # Gender
    gender_dist = defaultdict(int)
    for c in candidates:
        gender = c.get("Gender", "Unknown") or "Unknown"
        gender_dist[gender] += 1

    # Age
    ages = [c.get("Age", 0) for c in candidates if c.get("Age")]
    age_buckets = {"18-30": 0, "31-40": 0, "41-50": 0, "51-60": 0, "61-70": 0, "70+": 0}
    for age in ages:
        if age <= 30:
            age_buckets["18-30"] += 1
        elif age <= 40:
            age_buckets["31-40"] += 1
        elif age <= 50:
            age_buckets["41-50"] += 1
        elif age <= 60:
            age_buckets["51-60"] += 1
        elif age <= 70:
            age_buckets["61-70"] += 1
        else:
            age_buckets["70+"] += 1

    # Education
    edu_dist = defaultdict(int)
    for c in candidates:
        qual = c.get("QUALIFICATION") or "Unknown"
        qual_lower = qual.lower().strip()
        if any(k in qual_lower for k in ["m.a", "एम.ए", "एम.एड", "स्नातकोत्तर", "विद्यावारिधी", "master", "phd"]):
            edu_dist["Masters/PhD"] += 1
        elif any(k in qual_lower for k in ["स्नातक", "bachelor", "b.a", "bbs", "b.ed", "बि.ए", "ल.एल.बि"]):
            edu_dist["Bachelor"] += 1
        elif any(k in qual_lower for k in ["slc", "10", "+2", "12", "आई", "प्रविणता", "i.a", "i.s"]):
            edu_dist["SLC/+2"] += 1
        elif any(k in qual_lower for k in ["साक्षर", "साधारण", "आधारभुत", "कक्षा", "प्राथमिक"]):
            edu_dist["Basic"] += 1
        else:
            edu_dist["Other/Unknown"] += 1

    # Female leaders
    groups = _group_by_constituency(candidates)
    female_leading = 0
    for cs in groups.values():
        leader = _get_constituency_leader(cs)
        if leader and leader.get("Gender") == "महिला" and leader.get("TotalVoteReceived", 0) > 0:
            female_leading += 1

    youngest = min(candidates, key=lambda x: x.get("Age", 999) or 999) if ages else None
    oldest = max(candidates, key=lambda x: x.get("Age", 0) or 0) if ages else None
    avg_age = sum(ages) / len(ages) if ages else 0

    return {
        "gender_distribution": dict(gender_dist),
        "age_distribution": age_buckets,
        "education_distribution": dict(edu_dist),
        "female_leading_count": female_leading,
        "youngest_candidate": {
            "name": youngest.get("CandidateName"), "age": youngest.get("Age"),
            "party": youngest.get("PoliticalPartyName"), "district": youngest.get("DistrictName"),
        } if youngest else None,
        "oldest_candidate": {
            "name": oldest.get("CandidateName"), "age": oldest.get("Age"),
            "party": oldest.get("PoliticalPartyName"), "district": oldest.get("DistrictName"),
        } if oldest else None,
        "average_age": round(avg_age, 1),
    }


def get_drama_index(limit: int = 20) -> list[dict]:
    candidates = get_candidates()
    groups = _group_by_constituency(candidates)
    drama = []

    for (district, const_num), cs in groups.items():
        total_votes = sum(c.get("TotalVoteReceived", 0) for c in cs)
        gap, gap_pct = _compute_gap(cs)
        leader = _get_constituency_leader(cs)

        # Drama score = weighted combination
        # Lower gap = more drama, higher total votes = more drama
        gap_score = max(0, 100 - gap_pct * 10) if total_votes > 0 else 0
        vote_density = min(100, total_votes / 100) if total_votes > 0 else 0
        candidate_factor = min(30, len(cs) * 2)

        score = gap_score * 0.5 + vote_density * 0.3 + candidate_factor * 0.2

        drama.append({
            "district": cs[0].get("DistrictName", ""),
            "district_cd": cs[0].get("DistrictCd", 0),
            "const_number": cs[0].get("SCConstID", "0"),
            "state": cs[0].get("StateName", "") if cs else "",
            "score": round(score, 1),
            "vote_gap": gap,
            "gap_percentage": round(gap_pct, 2),
            "total_votes": total_votes,
            "candidates_count": len(cs),
            "lead_changes": 0,
            "vote_growth": 0,
            "leading_candidate": leader.get("CandidateName") if leader else None,
            "leading_party": leader.get("PoliticalPartyName") if leader else None,
        })

    drama.sort(key=lambda x: x["score"], reverse=True)
    return drama[:limit]


def get_constituency_detail(district_cd: int, sc_const_id: str) -> Optional[dict]:
    candidates = get_candidates()
    matching = [
        c for c in candidates
        if c.get("DistrictCd") == district_cd and str(c.get("SCConstID")) == str(sc_const_id)
    ]

    if not matching:
        return None

    sorted_c = sorted(matching, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
    total_votes = sum(c.get("TotalVoteReceived", 0) for c in matching)
    gap, gap_pct = _compute_gap(matching)

    # Add rank and vote percentage to each candidate
    for i, c in enumerate(sorted_c):
        c["rank"] = i + 1
        c["vote_percentage"] = round(
            (c.get("TotalVoteReceived", 0) / total_votes * 100) if total_votes > 0 else 0, 2
        )

    return {
        "district": matching[0].get("DistrictName", ""),
        "district_cd": district_cd,
        "const_number": sc_const_id,
        "state": matching[0].get("StateName", ""),
        "total_votes": total_votes,
        "candidates": sorted_c,
        "leading_party": sorted_c[0].get("PoliticalPartyName") if sorted_c else None,
        "vote_gap": gap,
        "gap_percentage": round(gap_pct, 2),
        "competitiveness": _classify_competitiveness(gap_pct),
        "candidates_count": len(matching),
    }


def get_candidate_detail(candidate_id: int) -> Optional[dict]:
    candidates = get_candidates()
    candidate = next((c for c in candidates if c.get("CandidateID") == candidate_id), None)
    if not candidate:
        return None

    # Get constituency info
    district_cd = candidate.get("DistrictCd", 0)
    sc_const_id = candidate.get("SCConstID", "0")
    constituency_candidates = [
        c for c in candidates
        if c.get("DistrictCd") == district_cd and str(c.get("SCConstID")) == str(sc_const_id)
    ]
    sorted_cc = sorted(constituency_candidates, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
    total_votes = sum(c.get("TotalVoteReceived", 0) for c in constituency_candidates)

    rank = next((i + 1 for i, c in enumerate(sorted_cc) if c.get("CandidateID") == candidate_id), None)
    vote_pct = round(
        (candidate.get("TotalVoteReceived", 0) / total_votes * 100) if total_votes > 0 else 0, 2
    )

    # Generate insight
    insight = _generate_insight(candidate, rank, len(constituency_candidates))

    result = dict(candidate)
    result["rank"] = rank
    result["vote_percentage"] = vote_pct
    result["constituency_total_votes"] = total_votes
    result["constituency_candidates_count"] = len(constituency_candidates)
    result["insight"] = insight

    return result


def _generate_insight(candidate: dict, rank: Optional[int], total_candidates: int) -> str:
    parts = []
    name = candidate.get("CandidateName", "Unknown")
    party = candidate.get("PoliticalPartyName", "")
    age = candidate.get("Age", 0)
    gender = candidate.get("Gender", "")
    exp = candidate.get("EXPERIENCE", "")
    qual = candidate.get("QUALIFICATION", "")
    district = candidate.get("DistrictName", "")

    if gender == "महिला":
        parts.append(f"Female candidate")
    else:
        parts.append(f"Candidate")

    if age:
        parts.append(f"aged {age}")

    if party:
        parts.append(f"representing {party}")

    if district:
        parts.append(f"competing in {district}")

    if qual:
        parts.append(f"with {qual} education")

    if exp and exp != "0" and exp != "-":
        parts.append(f"and experience in: {exp[:100]}")

    if rank:
        parts.append(f"Currently ranked #{rank} out of {total_candidates} candidates in the constituency.")

    return ". ".join([" ".join(parts[:4])] + parts[4:])
