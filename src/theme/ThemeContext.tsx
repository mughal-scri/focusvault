import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ACCENT_OPTIONS = [
  { label: 'Indigo', value: '#6366F1', deep: '#4338CA' },
  { label: 'Violet', value: '#8B5CF6', deep: '#6D28D9' },
  { label: 'Amber', value: '#F59E0B', deep: '#D97706' },
  { label: 'Emerald', value: '#10B981', deep: '#059669' },
  { label: 'Rose', value: '#F43F5E', deep: '#E11D48' },
];

const buildColors = (isDark: boolean, accent: string, accentDeep: string) => ({
  background: isDark ? '#0A0A0F' : '#F8F9FF',
  surface: isDark ? '#13131A' : '#FFFFFF',
  border: isDark ? '#1E1E2E' : '#E2E8F0',
  indigo: accent,
  indigoDeep: accentDeep,
  amber: '#F59E0B',
  amberDeep: '#D97706',
  textPrimary: isDark ? '#F1F5F9' : '#0F172A',
  textMuted: isDark ? '#64748B' : '#64748B',
  success: '#10B981',
  destructive: '#F43F5E',
});

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  colors: ReturnType<typeof buildColors>;
  mode: ThemeMode;
  isDark: boolean;
  accentColor: string;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: buildColors(true, '#6366F1', '#4338CA'),
  mode: 'dark',
  isDark: true,
  accentColor: '#6366F1',
  setMode: () => {},
  setAccentColor: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState('#6366F1');
  const [accentDeep, setAccentDeep] = useState('#4338CA');

  useEffect(() => {
    const load = async () => {
      try {
        const [savedMode, savedAccent] = await Promise.all([
          AsyncStorage.getItem('theme-mode'),
          AsyncStorage.getItem('accent-color'),
        ]);
        if (savedMode) setModeState(savedMode as ThemeMode);
        if (savedAccent) {
          const option = ACCENT_OPTIONS.find(o => o.value === savedAccent);
          if (option) {
            setAccentColorState(option.value);
            setAccentDeep(option.deep);
          }
        }
      } catch (e) {
        console.error('Theme load error:', e);
      }
    };
    load();
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem('theme-mode', newMode).catch(() => {});
  };

  const setAccentColor = (color: string) => {
    const option = ACCENT_OPTIONS.find(o => o.value === color);
    if (option) {
      setAccentColorState(option.value);
      setAccentDeep(option.deep);
      AsyncStorage.setItem('accent-color', color).catch(() => {});
    }
  };

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = buildColors(isDark, accentColor, accentDeep);

  return (
    <ThemeContext.Provider value={{
      colors, mode, isDark, accentColor, setMode, setAccentColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);