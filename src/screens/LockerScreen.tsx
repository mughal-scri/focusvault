import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/store';
import AppListScreen from './locker/AppListScreen';
import LockSetupScreen, { LockConfig } from './locker/LockSetupScreen';

type Screen = 'main' | 'appList' | 'lockSetup';

interface AppInfo {
  packageName: string;
  appName: string;
}

export default function LockerScreen() {
  const { colors } = useTheme();
  const { lockedApps, addLockedApp, removeLockedApp } = useAppStore();
  const [screen, setScreen] = useState<Screen>('main');
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);

  const handleSelectApp = (app: AppInfo) => {
    setSelectedApp(app);
    setScreen('lockSetup');
  };

  const handleConfirmLock = (config: LockConfig) => {
    const alreadyExists = lockedApps.some(
      (a) => a.appPackageName === config.packageName
    );
    if (alreadyExists) {
      Alert.alert('Already Locked', `${config.appName} is already in your locker.`);
      return;
    }
    const now = new Date();
    const cooldownExpiry = new Date(
      now.getTime() + config.cooldownDays * 24 * 60 * 60 * 1000
    );
    addLockedApp({
      appPackageName: config.packageName,
      appName: config.appName,
      dailyLimitMinutes: config.dailyLimitMinutes,
      usedTodayMinutes: 0,
      lastActiveTimestamp: null,
      isCurrentlyForeground: false,
      lockedAt: now.toISOString(),
      cooldownDays: config.cooldownDays,
      cooldownExpiresAt: cooldownExpiry.toISOString(),
      isEditUnlocked: false,
    });
    setScreen('main');
    setSelectedApp(null);
  };

  const handleRemove = (packageName: string, isEditUnlocked: boolean) => {
    if (!isEditUnlocked) {
      const app = lockedApps.find((a) => a.appPackageName === packageName);
      const daysLeft = Math.ceil(
        (new Date(app!.cooldownExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      Alert.alert(
        '🔒 Lock is Active',
        `This lock cannot be removed for another ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Stay disciplined.`,
        [{ text: 'Got it' }]
      );
      return;
    }
    Alert.alert('Remove Lock', 'Are you sure you want to remove this lock?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeLockedApp(packageName) },
    ]);
  };

  const getCooldownLabel = (app: any) => {
    if (app.isEditUnlocked) return '🟢 Editable';
    const daysLeft = Math.ceil(
      (new Date(app.cooldownExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return `🔒 Editable in ${daysLeft}d`;
  };

  const getUsagePercent = (app: any) =>
    Math.min((app.usedTodayMinutes / app.dailyLimitMinutes) * 100, 100);

  if (screen === 'appList') {
    return (
      <AppListScreen
        onSelectApp={handleSelectApp}
        onBack={() => setScreen('main')}
        lockedPackageNames={lockedApps.map((a) => a.appPackageName)}
      />
    );
  }

  if (screen === 'lockSetup' && selectedApp) {
    return (
      <LockSetupScreen
        app={selectedApp}
        onConfirm={handleConfirmLock}
        onCancel={() => setScreen('appList')}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Locker</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {lockedApps.length === 0
            ? 'No apps locked yet.'
            : `${lockedApps.length} app${lockedApps.length > 1 ? 's' : ''} locked`}
        </Text>
      </View>

      {lockedApps.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔓</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Discipline is the bridge between goals and achievement.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lockedApps}
          keyExtractor={(item) => item.appPackageName}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftColor: colors.indigo,
            }]}>
              <View style={styles.cardTop}>
                <View style={[styles.appIcon, { backgroundColor: colors.indigoDeep }]}>
                  <Text style={styles.appIconText}>{item.appName.charAt(0)}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={[styles.appName, { color: colors.textPrimary }]}>
                    {item.appName}
                  </Text>
                  <Text style={[styles.appLimit, { color: colors.textMuted }]}>
                    {item.dailyLimitMinutes} min/day · {getCooldownLabel(item)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item.appPackageName, item.isEditUnlocked)}
                >
                  <Text style={[styles.removeBtn, { color: colors.destructive }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercent(item)}%` as any,
                      backgroundColor: getUsagePercent(item) >= 100
                        ? colors.destructive
                        : colors.indigo,
                    }
                  ]} />
                </View>
                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                  {item.usedTodayMinutes} / {item.dailyLimitMinutes} min used today
                </Text>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.indigo }]}
        onPress={() => setScreen('appList')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 15, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32, fontStyle: 'italic' },
  card: { borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  appIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  appIconText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  appInfo: { flex: 1 },
  appName: { fontSize: 15, fontWeight: '600' },
  appLimit: { fontSize: 13, marginTop: 2 },
  removeBtn: { fontSize: 18 },
  progressContainer: { gap: 6 },
  progressBar: { height: 6, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressLabel: { fontSize: 13 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '300' },
});