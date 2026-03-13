import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LimitOverlayScreen from './src/screens/locker/LimitOverlayScreen';
import { useAppStore } from './src/store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  const { lockedApps, updateUsage } = useAppStore();
  const [overlayApp, setOverlayApp] = useState<{ appName: string; limitMinutes: number } | null>(null);

  useEffect(() => {
  AsyncStorage.clear();
}, []);
  
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
      <Modal
        visible={!!overlayApp}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        {overlayApp && (
          <LimitOverlayScreen
            appName={overlayApp.appName}
            limitMinutes={overlayApp.limitMinutes}
            onClose={() => setOverlayApp(null)}
          />
        )}
      </Modal>
    </>
  );
}