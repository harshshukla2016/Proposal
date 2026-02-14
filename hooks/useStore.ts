
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { GlobalStore, ProposalData, GamePhase } from '../types';

export const useStore = create<GlobalStore>((set) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
  
  proposalData: null,
  setProposalData: (data: ProposalData | null) => set({ proposalData: data }),
  
  collectedCrystalIds: new Set<string>(),
  addCollectedCrystal: (id: string) =>
    set((state) => {
      const newSet = new Set(state.collectedCrystalIds);
      newSet.add(id);
      return { collectedCrystalIds: newSet };
    }),

  currentNarrative: "Welcome, seeker, to the Galactic Memory Odyssey...",
  setCurrentNarrative: (text: string) => set({ currentNarrative: text }),

  gamePhase: GamePhase.LOADING,
  setGamePhase: (phase: GamePhase) => set({ gamePhase: phase }),

  loadingInitialData: true,
  setLoadingInitialData: (loading: boolean) => set({ loadingInitialData: loading }),
}));
    