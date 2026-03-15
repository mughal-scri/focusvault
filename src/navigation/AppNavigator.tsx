import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import VaultScreen from '../screens/VaultScreen';
import LockerScreen from '../screens/LockerScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠', Vault: '🗂', Locker: '🔒', Settings: '⚙️',
};

export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('nav-state');
        if (savedState) setInitialState(JSON.parse(savedState));
      } finally {
        setIsReady(true);
      }
    };
    restoreState();
  }, []);

  if (!isReady) return null;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      text: colors.textPrimary,
    },
  };

  return (
    <NavigationContainer
      theme={navTheme}
      initialState={initialState}
      onStateChange={(state) =>
        AsyncStorage.setItem('nav-state', JSON.stringify(state))
      }
    >
      <Tab.Navigator
        detachInactiveScreens={false}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: route.name === 'Vault' ? colors.amber : colors.indigo,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color, fontSize: 11, fontWeight: focused ? '700' : '500' }}>
              {route.name}
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View style={[
              styles.iconContainer,
              focused && {
                backgroundColor: route.name === 'Vault'
                  ? colors.amber + '20'
                  : colors.indigo + '20',
                borderRadius: 8,
              }
            ]}>
              <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.5 }]}>
                {TAB_ICONS[route.name]}
              </Text>
              {focused && (
                <View style={[
                  styles.activeIndicator,
                  { backgroundColor: route.name === 'Vault' ? colors.amber : colors.indigo }
                ]} />
              )}
            </View>
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Vault" component={VaultScreen} />
        <Tab.Screen name="Locker" component={LockerScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  tabIcon: { fontSize: 20 },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 3,
    borderRadius: 999,
  },
});