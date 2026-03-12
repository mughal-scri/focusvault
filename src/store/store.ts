import { create } from 'zustand';

interface AppState {
  // Vault
  files: any[];
  books: any[];
  playlists: any[];

  // Locker
  lockedApps: any[];

  // Daily Focus
  focusNote: string;
  goals: { text: string; done: boolean }[];

  // Actions
  setFocusNote: (note: string) => void;
  toggleGoal: (index: number) => void;
  addGoal: (text: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  books: [],
  playlists: [],
  lockedApps: [],
  focusNote: '',
  goals: [],

  setFocusNote: (note) => set({ focusNote: note }),

  toggleGoal: (index) =>
    set((state) => ({
      goals: state.goals.map((g, i) =>
        i === index ? { ...g, done: !g.done } : g
      ),
    })),

  addGoal: (text) =>
    set((state) => ({
      goals: [...state.goals, { text, done: false }],
    })),
}));