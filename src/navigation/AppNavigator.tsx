import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme/theme';

import HomeScreen from '../screens/HomeScreen';
import VaultScreen from '../screens/VaultScreen';
import LockerScreen from '../screens/LockerScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
          },
          tabBarActiveTintColor: colors.indigo,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 6,
          },
        }}
        detachInactiveScreens={false}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Vault" component={VaultScreen} />
        <Tab.Screen name="Locker" component={LockerScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}