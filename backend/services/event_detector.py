from collections import defaultdict
from datetime import datetime
from models.candidate import ElectionEvent


def detect_events(previous: list[dict], current: list[dict]) -> list[ElectionEvent]:
    """Compare previous and current data to detect election events."""
    events = []
    now = datetime.now().isoformat()

    prev_groups = _group_by_const(previous)
    curr_groups = _group_by_const(current)

    for key in curr_groups:
        curr_candidates = curr_groups[key]
        prev_candidates = prev_groups.get(key, [])

        district, const_num = key

        # Current leader
        curr_sorted = sorted(curr_candidates, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
        curr_leader = curr_sorted[0] if curr_sorted else None

        if not curr_leader or curr_leader.get("TotalVoteReceived", 0) == 0:
            continue

        # Previous leader
        prev_sorted = sorted(prev_candidates, key=lambda x: x.get("TotalVoteReceived", 0), reverse=True)
        prev_leader = prev_sorted[0] if prev_sorted else None

        # Detect lead change
        if prev_leader and curr_leader:
            if curr_leader.get("CandidateID") != prev_leader.get("CandidateID"):
                events.append(ElectionEvent(
                    type="lead_change",
                    emoji="⚡",
                    message=f"{curr_leader.get('CandidateName')} takes lead in {district}-{const_num}",
                    district=district,
                    const_number=const_num,
                    timestamp=now,
                ))

        # Detect vote surge (>500 votes gained by any candidate)
        prev_votes_map = {c.get("CandidateID"): c.get("TotalVoteReceived", 0) for c in prev_candidates}
        for c in curr_candidates:
            cid = c.get("CandidateID")
            curr_votes = c.get("TotalVoteReceived", 0)
            prev_votes = prev_votes_map.get(cid, 0)
            gained = curr_votes - prev_votes
            if gained > 500:
                events.append(ElectionEvent(
                    type="vote_spike",
                    emoji="🔥",
                    message=f"{c.get('CandidateName')} gains +{gained} votes in {district}-{const_num}",
                    district=district,
                    const_number=const_num,
                    timestamp=now,
                ))

        # Detect close race (gap < 2%)
        if len(curr_sorted) >= 2:
            v1 = curr_sorted[0].get("TotalVoteReceived", 0)
            v2 = curr_sorted[1].get("TotalVoteReceived", 0)
            total = sum(c.get("TotalVoteReceived", 0) for c in curr_candidates)
            if total > 0:
                gap_pct = (v1 - v2) / total * 100
                if gap_pct < 2 and v1 > 0:
                    events.append(ElectionEvent(
                        type="close_race",
                        emoji="🔥",
                        message=f"{district}-{const_num} becomes a tight race (gap: {gap_pct:.1f}%)",
                        district=district,
                        const_number=const_num,
                        timestamp=now,
                    ))

        # Detect new constituency reporting
        prev_total = sum(c.get("TotalVoteReceived", 0) for c in prev_candidates)
        curr_total = sum(c.get("TotalVoteReceived", 0) for c in curr_candidates)
        if prev_total == 0 and curr_total > 0:
            events.append(ElectionEvent(
                type="new_reporting",
                emoji="📊",
                message=f"{district}-{const_num} starts reporting votes",
                district=district,
                const_number=const_num,
                timestamp=now,
            ))

    return events[:50]  # Cap at 50 events per poll


def _group_by_const(candidates: list[dict]) -> dict:
    groups = defaultdict(list)
    for c in candidates:
        key = (c.get("DistrictName", ""), c.get("ConstName", 0))
        groups[key].append(c)
    return groups
