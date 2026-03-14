import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import useMidnightReset from './src/hooks/useMidnightReset';
import { useAppStore } from './src/store/store';

function AppContent() {
  useMidnightReset();
  return <AppNavigator />;
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Manually check hydration with a small delay as fallback
    const checkHydration = async () => {
      await useAppStore.persist.rehydrate();
      setHydrated(true);
    };
    checkHydration();
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6366F1" size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppContent />
    </>
  );
}