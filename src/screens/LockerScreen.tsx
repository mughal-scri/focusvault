import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    const alreadyExists = lockedApps.some((a) => a.appPackageName === config.packageName);
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
      const daysLeft = Math.ceil(
        (new Date(app!.cooldownExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      Alert.alert(
        '🔒 Lock Active',
        `Cannot remove for another ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Stay disciplined.`,
        [{ text: 'Got it' }]
      );
      return;
    }
    Alert.alert('Remove Lock', 'Remove this lock from your locker?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeLockedApp(packageName) },
    ]);
  };

  const getUsagePercent = (app: any) =>
    Math.min((app.usedTodayMinutes / app.dailyLimitMinutes) * 100, 100);

  const getDaysLeft = (app: any) => {
    if (app.isEditUnlocked) return null;
    return Math.ceil(
      (new Date(app.cooldownExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Locker</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {lockedApps.length === 0
              ? 'No apps locked yet'
              : `${lockedApps.length} app${lockedApps.length > 1 ? 's' : ''} locked`}
          </Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: colors.indigo + '20' }]}>
          <Text style={styles.headerBadgeIcon}>🔒</Text>
        </View>
      </View>

      {lockedApps.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconContainer, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <Text style={styles.emptyIcon}>🔓</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Nothing locked yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Discipline is the bridge between goals and achievement.
          </Text>
          <TouchableOpacity
            style={[styles.emptyActionBtn, { backgroundColor: colors.indigo }]}
            onPress={() => setScreen('appList')}
          >
            <Text style={styles.emptyActionBtnText}>+ Lock an App</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lockedApps}
          keyExtractor={(item) => item.appPackageName}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const percent = getUsagePercent(item);
            const daysLeft = getDaysLeft(item);
            const isOver = percent >= 100;

            return (
              <View style={[styles.card, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderLeftColor: isOver ? colors.destructive : colors.indigo,
              }]}>
                {/* Top Row */}
                <View style={styles.cardTop}>
                  <View style={[styles.appIcon, { backgroundColor: colors.indigo + '20' }]}>
                    <Text style={styles.appIconText}>{item.appName.charAt(0)}</Text>
                  </View>
                  <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: colors.textPrimary }]}>
                      {item.appName}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, {
                        backgroundColor: daysLeft === null
                          ? colors.success + '20'
                          : colors.indigo + '15',
                      }]}>
                        <Text style={[styles.badgeText, {
                          color: daysLeft === null ? colors.success : colors.indigo
                        }]}>
                          {daysLeft === null ? '🟢 Editable' : `🔒 ${daysLeft}d left`}
                        </Text>
                      </View>
                      {isOver && (
                        <View style={[styles.badge, { backgroundColor: colors.destructive + '20' }]}>
                          <Text style={[styles.badgeText, { color: colors.destructive }]}>
                            Limit reached
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: colors.destructive + '15' }]}
                    onPress={() => handleRemove(item.appPackageName, item.isEditUnlocked)}
                  >
                    <Text style={[styles.removeBtnText, { color: colors.destructive }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressLabelRow}>
                    <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                      Daily usage
                    </Text>
                    <Text style={[styles.progressValue, {
                      color: isOver ? colors.destructive : colors.textPrimary
                    }]}>
                      {item.usedTodayMinutes} / {item.dailyLimitMinutes} min
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View style={[
                      styles.progressFill,
                      {
                        width: `${percent}%` as any,
                        backgroundColor: isOver ? colors.destructive : colors.indigo,
                      }
                    ]} />
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {lockedApps.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.indigo }]}
          onPress={() => setScreen('appList')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeIcon: { fontSize: 22 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  emptyActionBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 48,
  },
  emptyActionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: { fontSize: 22, fontWeight: '700', color: '#6366F1' },
  appInfo: { flex: 1 },
  appName: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 16, fontWeight: '700' },
  progressSection: { gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13 },
  progressValue: { fontSize: 13, fontWeight: '600' },
  progressBar: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '300' },
});