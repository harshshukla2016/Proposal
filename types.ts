
import { User } from '@supabase/supabase-js';

export interface MemoryCrystal {
  id: string;
  proposal_id: string;
  image_url: string;
  caption_text: string;
  order_index: number;
  collected: boolean;
  position?: [number, number, number]; // 3D position
  rotation?: [number, number, number]; // 3D rotation
}

export interface ProposalData {
  id: string;
  creator_id: string;
  partner_name: string;
  token: string;
  nebula_color: string; // Hex color string, e.g., "#FF00FF"
  star_color: string; // Hex color string
  memories: MemoryCrystal[];
  proposal_text?: string;
  music_url?: string;
  music_start_time?: number;
  video_url?: string;
  gallery_images?: string[];
}

export enum GamePhase {
  LOADING = 'LOADING',
  ENTRY = 'ENTRY',
  PLAYING = 'PLAYING',
  REVEAL = 'REVEAL',
  PROPOSAL = 'PROPOSAL',
  FINALE = 'FINALE',
}

export interface GlobalStore {
  user: User | null;
  setUser: (user: User | null) => void;
  proposalData: ProposalData | null;
  setProposalData: (data: ProposalData | null) => void;
  collectedCrystalIds: Set<string>;
  addCollectedCrystal: (id: string) => void;
  currentNarrative: string;
  setCurrentNarrative: (text: string) => void;
  gamePhase: GamePhase;
  setGamePhase: (phase: GamePhase) => void;
  loadingInitialData: boolean;
  setLoadingInitialData: (loading: boolean) => void;
}

export interface MemoryUploadData {
  imageFile: File | null;
  caption: string;
  imageUrl?: string; // For existing images
}

