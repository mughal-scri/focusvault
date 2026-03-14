import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Alert
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AppInfo {
  packageName: string;
  appName: string;
}

interface Props {
  app: AppInfo;
  onConfirm: (config: LockConfig) => void;
  onCancel: () => void;
}

export interface LockConfig {
  packageName: string;
  appName: string;
  dailyLimitMinutes: number;
  cooldownDays: number;
}

const IS_TESTING = true;

const TIME_OPTIONS = [
  ...(IS_TESTING ? [{ label: '1 min ⚗', value: 1 }] : []),
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hrs', value: 90 },
  { label: '2 hours', value: 120 },
];

const COOLDOWN_OPTIONS = [
  ...(IS_TESTING ? [{ label: '3 min ⚗', value: 0.002 }] : []),
  { label: '2 Weeks', value: 14 },
  { label: '1 Month', value: 30 },
];

export default function LockSetupScreen({ app, onConfirm, onCancel }: Props) {
  const { colors } = useTheme();
  const [selectedLimit, setSelectedLimit] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number>(14);
  const [confirmed, setConfirmed] = useState(false);
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const startHold = () => {
    if (confirmed) return;
    holdAnimation.current = Animated.timing(holdProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    });
    holdAnimation.current.start(({ finished }) => {
      if (finished) {
        setConfirmed(true);
        onConfirm({
          packageName: app.packageName,
          appName: app.appName,
          dailyLimitMinutes: selectedLimit!,
          cooldownDays: cooldown,
        });
      }
    });
  };

  const cancelHold = () => {
    if (confirmed) return;
    holdAnimation.current?.stop();
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const buttonWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getCooldownLabel = () => {
    const opt = COOLDOWN_OPTIONS.find(o => o.value === cooldown);
    return opt?.label || '2 Weeks';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={[styles.appIcon, { backgroundColor: colors.indigoDeep }]}>
          <Text style={styles.appIconText}>{app.appName.charAt(0)}</Text>
        </View>
        <Text style={[styles.appName, { color: colors.textPrimary }]}>{app.appName}</Text>
        <Text style={[styles.packageName, { color: colors.textMuted }]}>{app.packageName}</Text>
      </View>

      {/* Warning */}
      <View style={[styles.warningBanner, { backgroundColor: '#1a0d0d', borderColor: colors.destructive }]}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={[styles.warningText, { color: colors.textMuted }]}>
          Once confirmed, this limit cannot be changed until the cooldown period ends. Inaction keeps the lock active forever.
        </Text>
      </View>

      {/* Daily Limit */}
      <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Daily Usage Limit</Text>
      <View style={styles.optionsGrid}>
        {TIME_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionBtn,
              {
                backgroundColor: selectedLimit === opt.value ? colors.indigo : colors.surface,
                borderColor: selectedLimit === opt.value ? colors.indigo : colors.border,
              }
            ]}
            onPress={() => setSelectedLimit(opt.value)}
          >
            <Text style={[
              styles.optionText,
              { color: selectedLimit === opt.value ? '#FFFFFF' : colors.textMuted }
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cooldown */}
      <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Cooldown Period</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
        How long before you can edit or remove this lock?
      </Text>
      <View style={styles.cooldownRow}>
        {COOLDOWN_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.cooldownBtn,
              {
                backgroundColor: cooldown === opt.value ? colors.indigoDeep : colors.surface,
                borderColor: cooldown === opt.value ? colors.indigo : colors.border,
              }
            ]}
            onPress={() => setCooldown(opt.value)}
          >
            <Text style={[
              styles.cooldownText,
              { color: cooldown === opt.value ? '#FFFFFF' : colors.textMuted }
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      {selectedLimit && (
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.indigo }]}>
          <Text style={[styles.summaryTitle, { color: colors.indigo }]}>Lock Summary</Text>
          <Text style={[styles.summaryRow, { color: colors.textMuted }]}>
            📱 App: <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{app.appName}</Text>
          </Text>
          <Text style={[styles.summaryRow, { color: colors.textMuted }]}>
            ⏱ Daily limit: <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{selectedLimit} minutes</Text>
          </Text>
          <Text style={[styles.summaryRow, { color: colors.textMuted }]}>
            🔒 Cooldown: <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{getCooldownLabel()}</Text>
          </Text>
          <Text style={[styles.summaryRow, { color: colors.textMuted }]}>
            📅 Editable after: <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {new Date(Date.now() + cooldown * 24 * 60 * 60 * 1000).toDateString()}
            </Text>
          </Text>
        </View>
      )}

      {/* Hold to Confirm */}
      {selectedLimit && (
        <View style={[styles.holdBtnContainer, { backgroundColor: colors.surface, borderColor: colors.indigo }]}>
          <Animated.View style={[styles.holdBtnFill, { width: buttonWidth, backgroundColor: colors.indigo }]} />
          <TouchableOpacity
            style={styles.holdBtn}
            onPressIn={startHold}
            onPressOut={cancelHold}
            activeOpacity={1}
          >
            <Text style={[styles.holdBtnText, { color: colors.textPrimary }]}>
              {confirmed ? '✓ Locked' : 'Hold to Confirm Lock'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  appHeader: { alignItems: 'center', marginBottom: 24 },
  appIcon: { width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  appIconText: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  appName: { fontSize: 22, fontWeight: 'bold' },
  packageName: { fontSize: 13, marginTop: 4 },
  warningBanner: { flexDirection: 'row', borderRadius: 12, padding: 14, borderWidth: 1, gap: 10, marginBottom: 24 },
  warningIcon: { fontSize: 20 },
  warningText: { fontSize: 14, flex: 1, lineHeight: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, marginBottom: 8, marginTop: -4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1 },
  optionText: { fontSize: 14 },
  cooldownRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  cooldownBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cooldownText: { fontSize: 14, fontWeight: '600' },
  summaryCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderLeftWidth: 3, marginBottom: 24, gap: 8 },
  summaryTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryRow: { fontSize: 14 },
  summaryValue: { fontWeight: '600' },
  holdBtnContainer: { height: 54, borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 10, justifyContent: 'center' },
  holdBtnFill: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.4 },
  holdBtn: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  holdBtnText: { fontSize: 15, fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15 },
});