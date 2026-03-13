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
  currentStreak: number;

  resetDailyUsage: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  updateUsage: (packageName: string, minutes: number) => void;
  checkAndUnlockCooldowns: () => void;
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
  addLockedApp: (app: any) => void;
  removeLockedApp: (packageName: string) => void;
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

      resetDailyUsage: () => set((state) => ({
      lockedApps: state.lockedApps.map((app) => ({
      ...app,
      usedTodayMinutes: 0,
      isEditUnlocked: new Date() >= new Date(app.cooldownExpiresAt),
      })),
      goals: state.goals.map((g) => ({ ...g, done: false })),
      })),
      incrementStreak: () => set((state) => ({ currentStreak: state.currentStreak + 1 })),
      resetStreak: () => set({ currentStreak: 0 }),
      updateUsage: (packageName, minutes) =>
      set((state) => ({
        lockedApps: state.lockedApps.map((a) =>
          a.appPackageName === packageName
            ? { ...a, usedTodayMinutes: a.usedTodayMinutes + minutes }
            : a
        ),
      })),
    
      checkAndUnlockCooldowns: () =>
      set((state) => ({
        lockedApps: state.lockedApps.map((a) => ({
          ...a,
          isEditUnlocked: new Date() >= new Date(a.cooldownExpiresAt),
        })),
      })),
      addLockedApp: (app) => set((state) => ({ lockedApps: [...state.lockedApps, app] })),
      removeLockedApp: (packageName) => set((state) => ({
        lockedApps: state.lockedApps.filter((a) => a.appPackageName !== packageName)
      })),
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