import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface Book {
  id: string;
  fileUri: string;
  fileName: string;
  isCompleted: boolean;
  isPinned: boolean;
  addedAt: string;
}

interface Playlist {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  isCompleted: boolean;
  isPinned: boolean;
  addedAt: string;
  completedAt: string | null;
}

interface AppState {
  files: VaultFile[];
  books: Book[];
  playlists: Playlist[];
  lockedApps: any[];
  focusNote: string;
  goals: { text: string; done: boolean }[];

  addFile: (file: VaultFile) => void;
  removeFile: (id: string) => void;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  addPlaylist: (playlist: Playlist) => void;
  completePlaylist: (id: string) => void;
  removePlaylist: (id: string) => void;
  setFocusNote: (note: string) => void;
  toggleGoal: (index: number) => void;
  addGoal: (text: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      files: [],
      books: [],
      playlists: [],
      lockedApps: [],
      focusNote: '',
      goals: [],

      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (id) => set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
      addBook: (book) => set((state) => ({ books: [...state.books, book] })),
      removeBook: (id) => set((state) => ({ books: state.books.filter((b) => b.id !== id) })),
      addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
      completePlaylist: (id) => set((state) => ({
        playlists: state.playlists.map((p) =>
          p.id === id ? { ...p, isCompleted: true, completedAt: new Date().toISOString() } : p
        ),
      })),
      removePlaylist: (id) => set((state) => ({ playlists: state.playlists.filter((p) => p.id !== id) })),
      setFocusNote: (note) => set({ focusNote: note }),
      toggleGoal: (index) => set((state) => ({
        goals: state.goals.map((g, i) => i === index ? { ...g, done: !g.done } : g),
      })),
      addGoal: (text) => set((state) => ({ goals: [...state.goals, { text, done: false }] })),
    }),
    {
      name: 'focusvault-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);