let API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Ensure absolute URL if it looks like a domain
if (API_BASE && !API_BASE.startsWith("http://") && !API_BASE.startsWith("https://") && !API_BASE.startsWith("/")) {
  API_BASE = `https://${API_BASE}`;
}

export interface Candidate {
  CandidateID: number;
  CandidateName: string;
  Age: number | null;
  Gender: string | null;
  PoliticalPartyName: string | null;
  SymbolName: string | null;
  DistrictName: string | null;
  StateName: string | null;
  State: number | null;
  SCConstID: string | null;
  DistrictCd: number | null;
  TotalVoteReceived: number;
  CastedVote: number;
  TotalVoters: number;
  Rank: string | null;
  QUALIFICATION: string | null;
  EXPERIENCE: string | null;
  ADDRESS: string | null;
  FATHER_NAME: string | null;
  SPOUCE_NAME: string | null;
  rank?: number;
  vote_percentage?: number;
  constituency_total_votes?: number;
  constituency_candidates_count?: number;
  insight?: string;
}

export interface PartyStats {
  party: string;
  short_name: string;
  seats_leading: number;
  total_votes: number;
  vote_share: number;
  candidates_count: number;
  seat_change: number;
}

export interface NationalStats {
  total_candidates: number;
  total_votes: number;
  total_constituencies: number;
  constituencies_reporting: number;
  parties_count: number;
  leading_party: string | null;
  party_seats: PartyStats[];
  last_updated: string;
}

export interface ConstituencyInfo {
  district: string;
  district_cd: number;
  const_number: string;
  state: string;
  total_votes: number;
  candidates_count: number;
  leading_party: string | null;
  leading_candidate: string | null;
}

export interface ConstituencyDetail {
  district: string;
  district_cd: number;
  const_number: string;
  state: string;
  total_votes: number;
  candidates: Candidate[];
  leading_party: string | null;
  vote_gap: number;
  gap_percentage: number;
  competitiveness: string;
  candidates_count: number;
}

export interface ClosestRace {
  district: string;
  district_cd: number;
  const_number: string;
  state: string;
  total_votes: number;
  vote_gap: number;
  gap_percentage: number;
  competitiveness: string;
  candidates_count: number;
  leader: Candidate | null;
  runner_up: Candidate | null;
}

export interface RisingCandidate {
  candidate_id: number;
  name: string;
  party: string;
  district: string;
  district_cd: number;
  const_number: string;
  votes_gained: number;
  current_votes: number;
}

export interface DramaEntry {
  district: string;
  district_cd: number;
  const_number: string;
  state: string;
  score: number;
  vote_gap: number;
  gap_percentage: number;
  total_votes: number;
  candidates_count: number;
  lead_changes: number;
  vote_growth: number;
  leading_candidate: string | null;
  leading_party: string | null;
}

export interface Demographics {
  gender_distribution: Record<string, number>;
  age_distribution: Record<string, number>;
  education_distribution: Record<string, number>;
  female_leading_count: number;
  youngest_candidate: { name: string; age: number; party: string; district: string } | null;
  oldest_candidate: { name: string; age: number; party: string; district: string } | null;
  average_age: number;
}

export interface ElectionEvent {
  type: string;
  emoji: string;
  message: string;
  district?: string;
  const_number?: string;
  timestamp?: string;
}

export interface FeaturedCandidate {
  electionId: string;
  candidateId: string;
  candidateEnglishName: string;
  candidateName: string;
  imageUrl: string;
  slug: string;
  areaId: string;
  areaName: string;
  areaNameEnglish: string;
  districtId: string;
  districtName: string;
  districtNameEnglish: string;
  partyId: string;
  politicalPartyName: string;
  votes: number;
  voteDifferenceInPercent: number;
  seatType: string;
  featured: boolean;
  winner: boolean;
  leading: boolean;
  lastUpdated: number;
  featuredLastUpdated: number;
}

export interface FeaturedArea {
  electionId: string;
  resultStatus: string;
  areaId: string;
  districtId: string;
  districtName: string;
  districtEnglishName: string;
  stateId: string;
  stateName: string;
  type: string;
  areaName: string;
  areaNameEnglish: string;
  resultFinal: boolean;
  featured: boolean;
  lastUpdated: number;
  totalCastVotes: number;
  totalCountedVotes: number;
  candidateResults: FeaturedCandidate[];
}

export interface FeaturedContent {
  featuredCandidates: FeaturedCandidate[];
  featuredAreas: FeaturedArea[];
}

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export interface PartyTop5 {
  PartyId: number;
  PoliticalPartyName: string;
  TotWin: number;
  TotLead: number;
  TotWinLead: number;
  SymbolID: number;
}


export interface FactCheckClaim {
  claim: string;
  sources: string[];
  verdict: string;
  evidence: string;
}

export interface FactCheckResult {
  id: string;
  story_id: string;
  story_title: string;
  story_source: string;
  story_url: string;
  verdict: string;
  verdict_summary: string;
  confidence: number;
  claims_analyzed: FactCheckClaim[];
  key_finding: string;
  context: string;
  checked_at: string;
}

export const api = {
  getNationalStats: () => fetchAPI<NationalStats>("/api/analytics/national"),

  getPartyTop5: () => fetchAPI<{ parties: PartyTop5[] }>("/api/analytics/party-top5"),

  getFactChecks: () => fetchAPI<{ results: FactCheckResult[] }>("/api/analytics/fact-checks"),

  getFeaturedContent: () => fetchAPI<FeaturedContent>("/api/candidates/featured"),

  getPartyPerformance: () =>
    fetchAPI<{ parties: PartyStats[] }>("/api/analytics/parties"),

  getClosestRaces: (limit = 20) =>
    fetchAPI<{ races: ClosestRace[] }>(`/api/analytics/closest-races?limit=${limit}`),

  getRisingCandidates: (limit = 20) =>
    fetchAPI<{ candidates: RisingCandidate[] }>(`/api/analytics/rising-candidates?limit=${limit}`),

  getDemographics: () => fetchAPI<Demographics>("/api/analytics/demographics"),

  getDramaIndex: (limit = 20) =>
    fetchAPI<{ constituencies: DramaEntry[] }>(`/api/analytics/drama-index?limit=${limit}`),

  getEvents: () => fetchAPI<{ events: ElectionEvent[] }>("/api/analytics/events"),

  getCandidates: (params?: { party?: string; district?: string; gender?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.party) query.set("party", params.party);
    if (params?.district) query.set("district", params.district);
    if (params?.gender) query.set("gender", params.gender);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return fetchAPI<{ total: number; page: number; limit: number; candidates: Candidate[] }>(
      `/api/candidates?${query.toString()}`
    );
  },

  getCandidate: (id: number) => fetchAPI<Candidate>(`/api/candidates/${id}`),

  getConstituencies: (params?: { state?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.state) query.set("state", params.state);
    if (params?.search) query.set("search", params.search);
    return fetchAPI<{ total: number; constituencies: ConstituencyInfo[] }>(
      `/api/constituencies?${query.toString()}`
    );
  },

  getConstituency: (districtCd: number, scConstId: string) =>
    fetchAPI<ConstituencyDetail>(`/api/constituencies/${districtCd}/${scConstId}`),
};
