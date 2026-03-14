import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/store';

export default function StreakCard() {
  const { colors } = useTheme();
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
    <View style={[styles.card, {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderLeftColor: colors.indigo,
    }]}>
      {/* Streak Row */}
      <View style={styles.streakRow}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View>
            <Text style={[styles.streakNumber, { color: colors.textPrimary }]}>
              {currentStreak ?? 0}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textMuted }]}>
              day streak
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: allUnderLimit ? colors.success + '20' : colors.destructive + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: allUnderLimit ? colors.success : colors.destructive }
          ]}>
            {allUnderLimit ? '✓ On track today' : '⚠ Limit reached'}
          </Text>
        </View>
      </View>

      {/* Active Locks */}
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
                  <Text style={[styles.lockAppName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {app.appName}
                  </Text>
                  <Text style={[styles.lockUsage, {
                    color: isOver ? colors.destructive : colors.textMuted
                  }]}>
                    {app.usedTodayMinutes}/{app.dailyLimitMinutes}m
                  </Text>
                </View>
                <View style={[styles.miniProgressBar, { backgroundColor: colors.border }]}>
                  <View style={[
                    styles.miniProgressFill,
                    {
                      width: `${percent}%` as any,
                      backgroundColor: isOver ? colors.destructive : colors.indigo,
                    }
                  ]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Midnight Reset */}
      <View style={[styles.resetRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.resetText, { color: colors.textMuted }]}>
          🕛 Resets in {getMidnightCountdown()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 8, borderWidth: 1, borderLeftWidth: 3 },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakIcon: { fontSize: 32 },
  streakNumber: { fontSize: 28, fontWeight: 'bold', lineHeight: 32 },
  streakLabel: { fontSize: 13 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusText: { fontSize: 13, fontWeight: '600' },
  locksStrip: { gap: 8, marginBottom: 10 },
  lockItem: { gap: 4 },
  lockItemTop: { flexDirection: 'row', justifyContent: 'space-between' },
  lockAppName: { fontSize: 13, fontWeight: '600', flex: 1 },
  lockUsage: { fontSize: 13 },
  miniProgressBar: { height: 4, borderRadius: 999, overflow: 'hidden' },
  miniProgressFill: { height: '100%', borderRadius: 999 },
  resetRow: { borderTopWidth: 1, paddingTop: 10 },
  resetText: { fontSize: 13, textAlign: 'center' },
});