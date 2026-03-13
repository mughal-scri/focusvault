import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';

export default function StreakCard() {
  const { lockedApps, currentStreak } = useAppStore();

  const allUnderLimit = lockedApps.every(
    (app) => app.usedTodayMinutes < app.dailyLimitMinutes
  );

  const getMidnightCountdown = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.card}>
      {/* Streak */}
      <View style={styles.streakRow}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View>
            <Text style={styles.streakNumber}>{currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        {/* Status */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: allUnderLimit ? '#0d2e1f' : '#2e0d0d' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: allUnderLimit ? colors.success : colors.destructive }
          ]}>
            {allUnderLimit ? '✓ On track today' : '⚠ Limit reached'}
          </Text>
        </View>
      </View>

      {/* Active Locks Strip */}
      {lockedApps.length > 0 && (
        <View style={styles.locksStrip}>
          {lockedApps.map((app) => {
            const percent = Math.min(
              (app.usedTodayMinutes / app.dailyLimitMinutes) * 100, 100
            );
            const isOver = percent >= 100;
            return (
              <View key={app.appPackageName} style={styles.lockItem}>
                <View style={styles.lockItemTop}>
                  <Text style={styles.lockAppName} numberOfLines={1}>
                    {app.appName}
                  </Text>
                  <Text style={[
                    styles.lockUsage,
                    { color: isOver ? colors.destructive : colors.textMuted }
                  ]}>
                    {app.usedTodayMinutes}/{app.dailyLimitMinutes}m
                  </Text>
                </View>
                <View style={styles.miniProgressBar}>
                  <View style={[
                    styles.miniProgressFill,
                    { width: `${percent}%` },
                    isOver && { backgroundColor: colors.destructive }
                  ]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Midnight Reset */}
      <View style={styles.resetRow}>
        <Text style={styles.resetText}>
          🕛 Resets in {getMidnightCountdown()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streakIcon: { fontSize: 32 },
  streakNumber: { color: colors.textPrimary, fontSize: 28, fontWeight: 'bold', lineHeight: 32 },
  streakLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusText: { fontSize: fontSize.sm, fontWeight: '600' },
  locksStrip: { gap: 8, marginBottom: spacing.sm },
  lockItem: { gap: 4 },
  lockItemTop: { flexDirection: 'row', justifyContent: 'space-between' },
  lockAppName: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600', flex: 1 },
  lockUsage: { fontSize: fontSize.sm },
  miniProgressBar: { height: 4, backgroundColor: colors.border, borderRadius: 999, overflow: 'hidden' },
  miniProgressFill: { height: '100%', backgroundColor: colors.indigo, borderRadius: 999 },
  resetRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  resetText: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
});