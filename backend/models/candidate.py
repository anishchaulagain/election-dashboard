from pydantic import BaseModel
from typing import Optional


class CandidateBase(BaseModel):
    CandidateID: int
    CandidateName: str
    AGE_YR: Optional[int] = None
    Gender: Optional[str] = None
    PoliticalPartyName: Optional[str] = None
    SymbolName: Optional[str] = None
    DistrictName: Optional[str] = None
    StateName: Optional[str] = None
    STATE_ID: Optional[int] = None
    SCConstID: Optional[int] = None
    ConstName: Optional[int] = None
    TotalVoteReceived: int = 0
    QUALIFICATION: Optional[str] = None
    EXPERIENCE: Optional[str] = None
    ADDRESS: Optional[str] = None
    FATHER_NAME: Optional[str] = None
    SPOUCE_NAME: Optional[str] = None


class CandidateDetail(CandidateBase):
    rank: Optional[int] = None
    vote_percentage: Optional[float] = None
    constituency_total_votes: Optional[int] = None
    insight: Optional[str] = None


class ConstituencyResult(BaseModel):
    district: str
    const_number: int
    state: str
    total_votes: int
    candidates: list[CandidateBase]
    leading_party: Optional[str] = None
    vote_gap: Optional[int] = None
    gap_percentage: Optional[float] = None
    competitiveness: Optional[str] = None


class PartyStats(BaseModel):
    party: str
    seats_leading: int
    total_votes: int
    vote_share: float
    candidates_count: int
    seat_change: int = 0


class NationalStats(BaseModel):
    total_candidates: int
    total_votes: int
    total_constituencies: int
    constituencies_reporting: int
    parties_count: int
    leading_party: Optional[str] = None
    party_seats: list[PartyStats]


class ElectionEvent(BaseModel):
    type: str  # lead_change, vote_spike, close_race, new_leader
    emoji: str
    message: str
    district: Optional[str] = None
    const_number: Optional[int] = None
    timestamp: Optional[str] = None


class DramaScore(BaseModel):
    district: str
    const_number: int
    state: str
    score: float
    vote_gap: int
    lead_changes: int
    vote_growth: float
    leading_candidate: Optional[str] = None
    leading_party: Optional[str] = None


class RisingCandidate(BaseModel):
    candidate_id: int
    name: str
    party: str
    district: str
    const_number: int
    votes_gained: int
    current_votes: int


class DemographicStats(BaseModel):
    gender_distribution: dict
    age_distribution: dict
    education_distribution: dict
    female_leading_count: int
    youngest_candidate: Optional[dict] = None
    oldest_candidate: Optional[dict] = None
    average_age: float
