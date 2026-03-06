"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

const POLL_INTERVAL = 30000; // 30 seconds

export function useNationalStats() {
  return useQuery({
    queryKey: ["national-stats"],
    queryFn: api.getNationalStats,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function usePartyTop5() {
  return useQuery({
    queryKey: ["party-top5"],
    queryFn: api.getPartyTop5,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useFactChecks() {
  return useQuery({
    queryKey: ["fact-checks"],
    queryFn: api.getFactChecks,
    refetchInterval: POLL_INTERVAL * 2, // Fact checks change less frequently
    staleTime: 30000,
  });
}

export function useFeaturedContent() {
  return useQuery({
    queryKey: ["featured-content"],
    queryFn: api.getFeaturedContent,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function usePartyPerformance() {
  return useQuery({
    queryKey: ["party-performance"],
    queryFn: api.getPartyPerformance,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useClosestRaces(limit = 20) {
  return useQuery({
    queryKey: ["closest-races", limit],
    queryFn: () => api.getClosestRaces(limit),
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useRisingCandidates(limit = 20) {
  return useQuery({
    queryKey: ["rising-candidates", limit],
    queryFn: () => api.getRisingCandidates(limit),
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useDemographics() {
  return useQuery({
    queryKey: ["demographics"],
    queryFn: api.getDemographics,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useDramaIndex(limit = 20) {
  return useQuery({
    queryKey: ["drama-index", limit],
    queryFn: () => api.getDramaIndex(limit),
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: api.getEvents,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useCandidates(params?: {
  party?: string;
  district?: string;
  gender?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["candidates", params],
    queryFn: () => api.getCandidates(params),
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useCandidate(id: number) {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: () => api.getCandidate(id),
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
    enabled: !!id,
  });
}

export function useConstituencies(params?: { state?: string; search?: string }) {
  return useQuery({
    queryKey: ["constituencies", params],
    queryFn: () => api.getConstituencies(params),
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });
}

export function useConstituency(districtCd: number, scConstId: string) {
  return useQuery({
    queryKey: ["constituency", districtCd, scConstId],
    queryFn: () => api.getConstituency(districtCd, scConstId),
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
    enabled: !!districtCd && !!scConstId,
  });
}
