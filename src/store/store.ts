import { create } from 'zustand';

interface VaultFile {
  id: string;
  name: string;
  localUri: string;
  folder: string;
  type: string;
  isPinned: boolean;
  lastOpenedAt: string | null;
  pdfLastPage: number | null;
  addedAt: string;
}

interface AppState {
  files: VaultFile[];
  books: any[];
  playlists: any[];
  lockedApps: any[];
  focusNote: string;
  goals: { text: string; done: boolean }[];

  addFile: (file: VaultFile) => void;
  setFocusNote: (note: string) => void;
  toggleGoal: (index: number) => void;
  addGoal: (text: string) => void;
  addBook: (book: any) => void;
  addPlaylist: (playlist: any) => void;
  completePlaylist: (id: string) => void;
  removePlaylist: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  books: [],
  playlists: [],
  lockedApps: [],
  focusNote: '',
  goals: [],

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  setFocusNote: (note) => set({ focusNote: note }),
  toggleGoal: (index) =>
    set((state) => ({
      goals: state.goals.map((g, i) => (i === index ? { ...g, done: !g.done } : g)),
    })),
  addGoal: (text) => set((state) => ({ goals: [...state.goals, { text, done: false }] })),
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
completePlaylist: (id) => set((state) => ({
  playlists: state.playlists.map((p) => p.id === id ? { ...p, isCompleted: true, completedAt: new Date().toISOString() } : p)
})),
removePlaylist: (id) => set((state) => ({ playlists: state.playlists.filter((p) => p.id !== id) })),
}));