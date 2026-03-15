import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useMidnightReset from './src/hooks/useMidnightReset';
import { useAppStore } from './src/store/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SetupScreen from './src/screens/SetupScreen';

type AppStage = 'splash' | 'onboarding' | 'setup' | 'main';

function AppContent() {
  useMidnightReset();
  const [stage, setStage] = useState<AppStage>('splash');

  useEffect(() => {
    AsyncStorage.getItem('onboarding-complete')
      .then((val) => {
        if (val === 'true') setStage('main');
      })
      .catch(() => setStage('main'));
  }, []);

  if (stage === 'splash') {
    return <SplashScreen onFinish={() => setStage('onboarding')} />;
  }

  if (stage === 'onboarding') {
    return <OnboardingScreen onFinish={() => setStage('setup')} />;
  }

  if (stage === 'setup') {
    return (
      <SetupScreen
        onFinish={async () => {
          try {
            await AsyncStorage.setItem('onboarding-complete', 'true');
          } catch (e) {
            console.error('AsyncStorage error:', e);
          } finally {
            setStage('main');
          }
        }}
      />
    );
  }

  return <AppNavigator />;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prepare = async () => {
      try {
        await useAppStore.persist.rehydrate();
      } catch (e: any) {
        setError(e?.message || 'Storage error');
      } finally {
        setReady(true);
      }
    };
    prepare();
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={{
          flex: 1,
          backgroundColor: '#0A0A0F',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <Text style={{ color: '#F43F5E', fontSize: 16, textAlign: 'center' }}>
            Startup error: {error}
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}