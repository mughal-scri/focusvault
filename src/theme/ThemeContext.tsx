import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK = {
  background: '#0A0A0F',
  surface: '#13131A',
  border: '#1E1E2E',
  indigo: '#6366F1',
  indigoDeep: '#4338CA',
  amber: '#F59E0B',
  amberDeep: '#D97706',
  textPrimary: '#F1F5F9',
  textMuted: '#64748B',
  success: '#10B981',
  destructive: '#F43F5E',
};

const LIGHT = {
  background: '#F8F9FF',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  indigo: '#6366F1',
  indigoDeep: '#4338CA',
  amber: '#F59E0B',
  amberDeep: '#D97706',
  textPrimary: '#0F172A',
  textMuted: '#64748B',
  success: '#10B981',
  destructive: '#F43F5E',
};

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  colors: typeof DARK;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: DARK,
  mode: 'dark',
  isDark: true,
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem('theme-mode').then((saved) => {
      if (saved) setModeState(saved as ThemeMode);
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem('theme-mode', newMode);
  };

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);