import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  appName: string;
  limitMinutes: number;
  onClose: () => void;
}

export default function LimitOverlayScreen({ appName, limitMinutes, onClose }: Props) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 65, friction: 11, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getMidnightCountdown = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.View style={[
        styles.sheet,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          transform: [{ translateY: slideAnim }],
        }
      ]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* App Icon */}
        <View style={[styles.appIconContainer, { backgroundColor: colors.indigo + '20' }]}>
          <Text style={styles.appIconText}>{appName.charAt(0)}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: colors.destructive + '15' }]}>
          <Text style={[styles.statusBadgeText, { color: colors.destructive }]}>
            Daily Limit Reached
          </Text>
        </View>

        {/* App Name */}
        <Text style={[styles.appName, { color: colors.textPrimary }]}>
          {appName}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          You've used your full {limitMinutes} min daily allowance for this app.
        </Text>

        {/* Countdown Card */}
        <View style={[styles.countdownCard, {
          backgroundColor: colors.background,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.countdownLabel, { color: colors.textMuted }]}>
            RESETS AT MIDNIGHT IN
          </Text>
          <Text style={[styles.countdownValue, { color: colors.textPrimary }]}>
            {getMidnightCountdown()}
          </Text>
          <View style={[styles.countdownBar, { backgroundColor: colors.border }]}>
            <View style={[styles.countdownBarFill, { backgroundColor: colors.indigo }]} />
          </View>
        </View>

        {/* Quote */}
        <Text style={[styles.quote, { color: colors.textMuted }]}>
          "Discipline is choosing between what you want now{'\n'}and what you want most."
        </Text>

        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.indigo }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeBtnText}>Close App</Text>
        </TouchableOpacity>

        {/* Note */}
        <Text style={[styles.note, { color: colors.textMuted }]}>
          This limit was set by you. Stay the course.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000CC',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 14,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  appIconContainer: {
    width: 72, height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366F1',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  countdownCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  countdownValue: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  countdownBar: {
    width: '100%',
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  countdownBarFill: {
    height: '100%',
    width: '60%',
    borderRadius: 999,
  },
  quote: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  closeBtn: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});