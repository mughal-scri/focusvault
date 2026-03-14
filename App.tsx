import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import AppNavigator from './src/navigation/AppNavigator';
import useMidnightReset from './src/hooks/useMidnightReset';
import { useAppStore } from './src/store/store';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SetupScreen from './src/screens/SetupScreen';

type AppStage = 'loading' | 'splash' | 'onboarding' | 'setup' | 'main';

function AppContent() {
  useMidnightReset();
  const [stage, setStage] = useState<AppStage>('splash');

  useEffect(() => {
    AsyncStorage.getItem('onboarding-complete').then((val) => {
      if (val === 'true') setStage('main');
    });
  }, []);

  const handleSplashFinish = () => setStage('onboarding');
  const handleOnboardingFinish = () => setStage('setup');
  const handleSetupFinish = async () => {
    await AsyncStorage.setItem('onboarding-complete', 'true');
    setStage('main');
  };

  if (stage === 'splash') return <SplashScreen onFinish={handleSplashFinish} />;
  if (stage === 'onboarding') return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  if (stage === 'setup') return <SetupScreen onFinish={handleSetupFinish} />;
  return <AppNavigator />;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        await useAppStore.persist.rehydrate();
      } finally {
        setReady(true);
      }
    };
    prepare();
  }, []);

  if (!ready || !fontsLoaded) {
    return (
      <ThemeProvider>
        <View style={{
          flex: 1,
          backgroundColor: '#0A0A0F',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ActivityIndicator color="#6366F1" size="large" />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <AppContent />
    </ThemeProvider>
  );
}