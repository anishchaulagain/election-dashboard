import { create } from "zustand";
import type { ElectionEvent } from "./api";

interface ElectionStore {
  // Real-time events
  events: ElectionEvent[];
  addEvents: (newEvents: ElectionEvent[]) => void;
  clearEvents: () => void;


  // Last update
  lastUpdate: string | null;
  setLastUpdate: (ts: string) => void;

  // UI state
  selectedPartyFilter: string | null;
  setSelectedPartyFilter: (party: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useElectionStore = create<ElectionStore>((set) => ({
  events: [],
  addEvents: (newEvents) =>
    set((state) => ({
      events: [...newEvents, ...state.events].slice(0, 100),
    })),
  clearEvents: () => set({ events: [] }),


  lastUpdate: null,
  setLastUpdate: (ts) => set({ lastUpdate: ts }),

  selectedPartyFilter: null,
  setSelectedPartyFilter: (party) => set({ selectedPartyFilter: party }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
