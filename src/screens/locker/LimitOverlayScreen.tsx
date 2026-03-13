import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';

interface Props {
  appName: string;
  limitMinutes: number;
  onClose: () => void;
}

export default function LimitOverlayScreen({ appName, limitMinutes, onClose }: Props) {
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
    <View style={styles.overlay}>
      <View style={styles.card}>

        {/* App Icon */}
        <View style={styles.appIcon}>
          <Text style={styles.appIconText}>{appName.charAt(0)}</Text>
        </View>

        {/* Lock Icon */}
        <Text style={styles.lockIcon}>🔒</Text>

        {/* Message */}
        <Text style={styles.title}>Daily Limit Reached</Text>
        <Text style={styles.appName}>{appName}</Text>
        <Text style={styles.subtitle}>
          You have used your full {limitMinutes} minute daily limit for this app.
        </Text>

        {/* Reset Countdown */}
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Resets in</Text>
          <Text style={styles.countdownValue}>{getMidnightCountdown()}</Text>
          <Text style={styles.countdownSub}>at midnight</Text>
        </View>

        {/* Motivational Note */}
        <Text style={styles.motivational}>
          "Discipline is choosing between what you want now and what you want most."
        </Text>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close App</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'flex-end' },
  card: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, width: '100%', alignItems: 'center', borderTopWidth: 1, borderColor: colors.border, paddingBottom: 48 },
  appIcon: { width: 72, height: 72, borderRadius: 18, backgroundColor: colors.indigoDeep, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  appIconText: { color: colors.textPrimary, fontSize: 32, fontWeight: 'bold' },
  lockIcon: { fontSize: 32, marginBottom: spacing.sm },
  title: { color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 'bold', marginBottom: 4 },
  appName: { color: colors.indigo, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  countdownCard: { backgroundColor: colors.background, borderRadius: 12, padding: spacing.md, alignItems: 'center', width: '100%', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  countdownLabel: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: 4 },
  countdownValue: { color: colors.textPrimary, fontSize: 32, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  countdownSub: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 4 },
  motivational: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', fontStyle: 'italic', lineHeight: 20, marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  closeBtn: { backgroundColor: colors.indigo, borderRadius: 12, padding: spacing.md, width: '100%', alignItems: 'center' },
  closeBtnText: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
});