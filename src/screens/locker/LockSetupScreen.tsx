import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  ...(IS_TESTING ? [{ label: '1 min', value: 1, isTest: true }] : []),
  { label: '15 min', value: 15, isTest: false },
  { label: '30 min', value: 30, isTest: false },
  { label: '45 min', value: 45, isTest: false },
  { label: '1 hour', value: 60, isTest: false },
  { label: '1.5 hrs', value: 90, isTest: false },
  { label: '2 hours', value: 120, isTest: false },
];

const COOLDOWN_OPTIONS = [
  ...(IS_TESTING ? [{ label: '3 min', value: 0.002, isTest: true }] : []),
  { label: '2 Weeks', value: 14, isTest: false },
  { label: '1 Month', value: 30, isTest: false },
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
      toValue: 0, duration: 200, useNativeDriver: false,
    }).start();
  };

  const buttonWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const selectedCooldownLabel = COOLDOWN_OPTIONS.find(o => o.value === cooldown)?.label || '2 Weeks';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onCancel}
          >
            <Text style={[styles.backBtnText, { color: colors.indigo }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Lock Setup</Text>
        </View>

        {/* App Card */}
        <View style={[styles.appCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.appIconLarge, { backgroundColor: colors.indigo + '20' }]}>
            <Text style={styles.appIconText}>{app.appName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>{app.appName}</Text>
            <Text style={[styles.packageName, { color: colors.textMuted }]}>{app.packageName}</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={[styles.warningCard, {
          backgroundColor: colors.destructive + '10',
          borderColor: colors.destructive + '30',
          borderLeftColor: colors.destructive,
        }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={[styles.warningText, { color: colors.textPrimary }]}>
            Once confirmed, this limit{' '}
            <Text style={{ fontWeight: '700', color: colors.destructive }}>
              cannot be changed
            </Text>
            {' '}until the cooldown ends. Inaction keeps the lock forever.
          </Text>
        </View>

        {/* Daily Limit */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Daily Usage Limit
        </Text>
        <View style={styles.pillGrid}>
          {TIME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.pill,
                {
                  backgroundColor: selectedLimit === opt.value
                    ? colors.indigo
                    : colors.surface,
                  borderColor: selectedLimit === opt.value
                    ? colors.indigo
                    : colors.border,
                },
                (opt as any).isTest && { borderStyle: 'dashed' }
              ]}
              onPress={() => setSelectedLimit(opt.value)}
            >
              <Text style={[
                styles.pillText,
                { color: selectedLimit === opt.value ? '#FFFFFF' : colors.textMuted }
              ]}>
                {opt.label}
                {(opt as any).isTest && (
                  <Text style={{ fontSize: 10 }}> ⚗</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cooldown */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Cooldown Period
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
          How long before you can edit or remove this lock?
        </Text>
        <View style={styles.cooldownGrid}>
          {COOLDOWN_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.cooldownCard,
                {
                  backgroundColor: cooldown === opt.value
                    ? colors.indigoDeep
                    : colors.surface,
                  borderColor: cooldown === opt.value
                    ? colors.indigo
                    : colors.border,
                },
                (opt as any).isTest && { borderStyle: 'dashed' }
              ]}
              onPress={() => setCooldown(opt.value)}
            >
              <Text style={styles.cooldownIcon}>
                {(opt as any).isTest ? '⚗' : opt.value === 14 ? '📅' : '🗓'}
              </Text>
              <Text style={[
                styles.cooldownText,
                { color: cooldown === opt.value ? '#FFFFFF' : colors.textPrimary }
              ]}>
                {opt.label}
              </Text>
              {(opt as any).isTest && (
                <Text style={[styles.cooldownSub, { color: cooldown === opt.value ? '#FFFFFF80' : colors.textMuted }]}>
                  Testing only
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        {selectedLimit && (
          <View style={[styles.summaryCard, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: colors.indigo,
          }]}>
            <Text style={[styles.summaryTitle, { color: colors.indigo }]}>
              LOCK SUMMARY
            </Text>
            {[
              { icon: '📱', label: 'App', value: app.appName },
              { icon: '⏱', label: 'Daily Limit', value: `${selectedLimit} minutes` },
              { icon: '🔒', label: 'Cooldown', value: selectedCooldownLabel },
              {
                icon: '📅', label: 'Editable After',
                value: new Date(Date.now() + cooldown * 24 * 60 * 60 * 1000).toDateString()
              },
            ].map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={styles.summaryIcon}>{row.icon}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Hold to Confirm */}
        {selectedLimit && (
          <View style={styles.holdSection}>
            <View style={[styles.holdBtnContainer, {
              backgroundColor: colors.surface,
              borderColor: colors.indigo,
            }]}>
              <Animated.View style={[styles.holdBtnFill, {
                width: buttonWidth,
                backgroundColor: colors.indigo,
              }]} />
              <TouchableOpacity
                style={styles.holdBtn}
                onPressIn={startHold}
                onPressOut={cancelHold}
                activeOpacity={1}
              >
                <Text style={[styles.holdBtnText, { color: colors.textPrimary }]}>
                  {confirmed ? '✓ Locked' : '🔒 Hold to Confirm Lock'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.holdHint, { color: colors.textMuted }]}>
              Hold the button for 2 seconds to confirm
            </Text>
          </View>
        )}

        {/* Cancel */}
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  backBtnText: { fontSize: 24, fontWeight: '600', marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 72,
  },
  appIconLarge: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  appIconText: { fontSize: 24, fontWeight: '700', color: '#6366F1' },
  appName: { fontSize: 18, fontWeight: '700' },
  packageName: { fontSize: 13, marginTop: 2 },
  warningCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    marginBottom: 24,
  },
  warningIcon: { fontSize: 18, marginTop: 1 },
  warningText: { flex: 1, fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  sectionSubtitle: { fontSize: 13, marginBottom: 10, marginTop: -6 },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  pillText: { fontSize: 14, fontWeight: '500' },
  cooldownGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  cooldownCard: {
    flex: 1, borderRadius: 14, padding: 14,
    borderWidth: 1, alignItems: 'center', gap: 4,
    minHeight: 80,
  },
  cooldownIcon: { fontSize: 22 },
  cooldownText: { fontSize: 15, fontWeight: '600' },
  cooldownSub: { fontSize: 11 },
  summaryCard: {
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderLeftWidth: 3,
    marginBottom: 24, gap: 10,
  },
  summaryTitle: {
    fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 4,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { fontSize: 16, width: 24 },
  summaryLabel: { fontSize: 14, width: 100 },
  summaryValue: { fontSize: 14, fontWeight: '600', flex: 1 },
  holdSection: { gap: 8, marginBottom: 12 },
  holdBtnContainer: {
    height: 56, borderRadius: 14,
    borderWidth: 1, overflow: 'hidden',
    justifyContent: 'center',
  },
  holdBtnFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.35,
  },
  holdBtn: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  holdBtnText: { fontSize: 15, fontWeight: '700' },
  holdHint: { fontSize: 13, textAlign: 'center' },
  cancelBtn: {
    borderRadius: 12, borderWidth: 1,
    padding: 14, alignItems: 'center', minHeight: 48,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '500' },
});