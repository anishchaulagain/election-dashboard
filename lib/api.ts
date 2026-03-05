const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const_number: string;
  votes_gained: number;
  current_votes: number;
}

export interface DramaEntry {
  district: string;
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

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  getNationalStats: () => fetchAPI<NationalStats>("/api/analytics/national"),

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
