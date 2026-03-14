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
  lastReadAt: string | null;
  lastPage: number | null;
  totalPages: number | null;
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

interface LockedApp {
  appPackageName: string;
  appName: string;
  dailyLimitMinutes: number;
  usedTodayMinutes: number;
  lastActiveTimestamp: string | null;
  isCurrentlyForeground: boolean;
  lockedAt: string;
  cooldownDays: number;
  cooldownExpiresAt: string;
  isEditUnlocked: boolean;
}

interface AppState {
  files: VaultFile[];
  books: Book[];
  playlists: Playlist[];
  lockedApps: LockedApp[];
  focusNote: string;
  goals: { text: string; done: boolean }[];
  currentStreak: number;

  addFile: (file: VaultFile) => void;
  removeFile: (id: string) => void;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  addPlaylist: (playlist: Playlist) => void;
  completePlaylist: (id: string) => void;
  removePlaylist: (id: string) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  addLockedApp: (app: LockedApp) => void;
  removeLockedApp: (packageName: string) => void;
  setFocusNote: (note: string) => void;
  toggleGoal: (index: number) => void;
  addGoal: (text: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  resetDailyUsage: () => void;
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
      currentStreak: 0,

      addFile: (file) => set((s) => ({ files: [...s.files, file] })),
      removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

      addBook: (book) => set((s) => ({ books: [...s.books, book] })),
      removeBook: (id) => set((s) => ({ books: s.books.filter((b) => b.id !== id) })),
      updateBook: (id, updates) => set((s) => ({
        books: s.books.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),

      addPlaylist: (playlist) => set((s) => ({ playlists: [...s.playlists, playlist] })),
      completePlaylist: (id) => set((s) => ({
        playlists: s.playlists.map((p) =>
          p.id === id ? { ...p, isCompleted: true, completedAt: new Date().toISOString() } : p
        ),
      })),
      removePlaylist: (id) => set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),
      updatePlaylist: (id, updates) => set((s) => ({
        playlists: s.playlists.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),

      addLockedApp: (app) => set((s) => ({ lockedApps: [...s.lockedApps, app] })),
      removeLockedApp: (packageName) => set((s) => ({
        lockedApps: s.lockedApps.filter((a) => a.appPackageName !== packageName)
      })),

      setFocusNote: (note) => set({ focusNote: note }),
      toggleGoal: (index) => set((s) => ({
        goals: s.goals.map((g, i) => i === index ? { ...g, done: !g.done } : g),
      })),
      addGoal: (text) => set((s) => ({ goals: [...s.goals, { text, done: false }] })),
      incrementStreak: () => set((s) => ({ currentStreak: s.currentStreak + 1 })),
      resetStreak: () => set({ currentStreak: 0 }),
      resetDailyUsage: () => set((s) => ({
        lockedApps: s.lockedApps.map((app) => ({
          ...app,
          usedTodayMinutes: 0,
          isEditUnlocked: new Date() >= new Date(app.cooldownExpiresAt),
        })),
        goals: s.goals.map((g) => ({ ...g, done: false })),
        focusNote: '',
      })),
    }),
    {
      name: 'focusvault-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);