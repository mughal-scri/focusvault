import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  appName: string;
  limitMinutes: number;
  onClose: () => void;
}

export default function LimitOverlayScreen({ appName, limitMinutes, onClose }: Props) {
  const { colors } = useTheme();

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
      <View style={[styles.card, {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      }]}>

        {/* App Icon */}
        <View style={[styles.appIcon, { backgroundColor: colors.indigoDeep }]}>
          <Text style={styles.appIconText}>{appName.charAt(0)}</Text>
        </View>

        {/* Lock Icon */}
        <Text style={styles.lockIcon}>🔒</Text>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Daily Limit Reached
        </Text>

        {/* App Name */}
        <Text style={[styles.appName, { color: colors.indigo }]}>
          {appName}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          You have used your full {limitMinutes} minute daily limit for this app.
        </Text>

        {/* Countdown Card */}
        <View style={[styles.countdownCard, {
          backgroundColor: colors.background,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.countdownLabel, { color: colors.textMuted }]}>
            Resets in
          </Text>
          <Text style={[styles.countdownValue, { color: colors.textPrimary }]}>
            {getMidnightCountdown()}
          </Text>
          <Text style={[styles.countdownSub, { color: colors.textMuted }]}>
            at midnight
          </Text>
        </View>

        {/* Motivational Quote */}
        <Text style={[styles.motivational, { color: colors.textMuted }]}>
          "Discipline is choosing between what you want now and what you want most."
        </Text>

        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.indigo }]}
          onPress={onClose}
        >
          <Text style={styles.closeBtnText}>Close App</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000CC',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: 48,
    gap: 12,
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appIconText: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  lockIcon: { fontSize: 32 },
  title: { fontSize: 24, fontWeight: 'bold' },
  appName: { fontSize: 18, fontWeight: '600' },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  countdownCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
  },
  countdownLabel: { fontSize: 13, marginBottom: 4 },
  countdownValue: { fontSize: 36, fontWeight: 'bold' },
  countdownSub: { fontSize: 13, marginTop: 4 },
  motivational: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  closeBtn: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});