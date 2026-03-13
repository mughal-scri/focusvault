import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { colors, spacing, fontSize } from '../theme/theme';
import { useAppStore } from '../store/store';
import AppListScreen from './locker/AppListScreen';
import LockSetupScreen, { LockConfig } from './locker/LockSetupScreen';

type Screen = 'main' | 'appList' | 'lockSetup';

interface AppInfo {
  packageName: string;
  appName: string;
}

export default function LockerScreen() {
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
  const cooldownExpiry = new Date(now.getTime() + config.cooldownDays * 24 * 60 * 60 * 1000);

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
    const expiry = new Date(app.cooldownExpiresAt);
    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    Alert.alert(
      '🔒 Lock is Active',
      `This lock cannot be removed for another ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. This is by design — stay disciplined.`,
      [{ text: 'Got it' }]
    );
    return;
  }
  Alert.alert(
    'Remove Lock',
    'Are you sure you want to remove this lock?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeLockedApp(packageName) },
    ]
  );
};

  const getCooldownLabel = (app: any) => {
    if (app.isEditUnlocked) return '🟢 Editable';
    const expiry = new Date(app.cooldownExpiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `🔒 Editable in ${daysLeft} days`;
  };

  const getUsagePercent = (app: any) => {
    return Math.min((app.usedTodayMinutes / app.dailyLimitMinutes) * 100, 100);
  };

  // Sub-screens
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

  // Main Locker Screen
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Locker</Text>
        <Text style={styles.subtitle}>
          {lockedApps.length === 0
            ? 'No apps locked yet.'
            : `${lockedApps.length} app${lockedApps.length > 1 ? 's' : ''} locked`}
        </Text>
      </View>

      {lockedApps.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔓</Text>
          <Text style={styles.emptyText}>
            No apps locked yet. Add one to start building focus.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lockedApps}
          keyExtractor={(item) => item.appPackageName}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* App Row */}
              <View style={styles.cardTop}>
                <View style={styles.appIcon}>
                  <Text style={styles.appIconText}>{item.appName.charAt(0)}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{item.appName}</Text>
                  <Text style={styles.appLimit}>
                    {item.dailyLimitMinutes} min/day · {getCooldownLabel(item)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item.appPackageName, item.isEditUnlocked)}
                >
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Usage Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getUsagePercent(item)}%` },
                      getUsagePercent(item) >= 100 && styles.progressFull,
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {item.usedTodayMinutes} / {item.dailyLimitMinutes} min used today
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setScreen('appList')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.md, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  appIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.indigoDeep, alignItems: 'center', justifyContent: 'center' },
  appIconText: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 'bold' },
  appInfo: { flex: 1 },
  appName: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  appLimit: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  removeBtn: { color: colors.destructive, fontSize: 18 },
  progressContainer: { gap: 6 },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.indigo, borderRadius: 999 },
  progressFull: { backgroundColor: colors.destructive },
  progressLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.textPrimary, fontSize: 28, fontWeight: '300' },
});