import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';

interface LockedApp {
  appPackageName: string;
  appName: string;
  dailyLimitMinutes: number;
  usedTodayMinutes: number;
  cooldownExpiresAt: string;
  isEditUnlocked: boolean;
}

interface Props {
  app: LockedApp;
  onRemove: (packageName: string, isEditUnlocked: boolean) => void;
}

export default function LockedAppCard({ app, onRemove }: Props) {
  const usagePercent = Math.min((app.usedTodayMinutes / app.dailyLimitMinutes) * 100, 100);
  const isExceeded = usagePercent >= 100;

  const getCooldownLabel = () => {
    if (app.isEditUnlocked) return { label: 'Editable', color: colors.success };
    const expiry = new Date(app.cooldownExpiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { label: `Editable in ${daysLeft}d`, color: colors.textMuted };
  };

  const cooldown = getCooldownLabel();

  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.appIcon}>
          <Text style={styles.appIconText}>{app.appName.charAt(0)}</Text>
        </View>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{app.appName}</Text>
          <Text style={[styles.cooldownLabel, { color: cooldown.color }]}>
            {app.isEditUnlocked ? '🟢' : '🔒'} {cooldown.label}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(app.appPackageName, app.isEditUnlocked)}>
          <Text style={styles.removeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Usage Arc */}
      <View style={styles.usageRow}>
        <Text style={styles.usageText}>
          {app.usedTodayMinutes} / {app.dailyLimitMinutes} min
        </Text>
        <Text style={[styles.usageStatus, { color: isExceeded ? colors.destructive : colors.success }]}>
          {isExceeded ? 'Limit reached' : `${app.dailyLimitMinutes - app.usedTodayMinutes} min left`}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[
          styles.progressFill,
          { width: `${usagePercent}%` },
          isExceeded && { backgroundColor: colors.destructive }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  appIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.indigoDeep, alignItems: 'center', justifyContent: 'center' },
  appIconText: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 'bold' },
  appInfo: { flex: 1 },
  appName: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  cooldownLabel: { fontSize: fontSize.sm, marginTop: 2 },
  removeBtn: { color: colors.destructive, fontSize: 18 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  usageText: { color: colors.textMuted, fontSize: fontSize.sm },
  usageStatus: { fontSize: fontSize.sm, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.indigo, borderRadius: 999 },
});