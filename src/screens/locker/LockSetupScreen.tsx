import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Alert
} from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';

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
  cooldownDays: 14 | 30;
}

const TIME_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hrs', value: 90 },
  { label: '2 hours', value: 120 },
];

export default function LockSetupScreen({ app, onConfirm, onCancel }: Props) {
  const [selectedLimit, setSelectedLimit] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<14 | 30>(14);
  const [confirmed, setConfirmed] = useState(false);
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const startHold = () => {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.appIcon}>
          <Text style={styles.appIconText}>{app.appName.charAt(0)}</Text>
        </View>
        <Text style={styles.appName}>{app.appName}</Text>
        <Text style={styles.packageName}>{app.packageName}</Text>
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>🔒</Text>
        <Text style={styles.warningText}>
          Once confirmed, this limit cannot be changed until the cooldown period ends. Inaction keeps the lock active forever.
        </Text>
      </View>

      {/* Daily Limit Selection */}
      <Text style={styles.sectionLabel}>Daily Usage Limit</Text>
      <View style={styles.optionsGrid}>
        {TIME_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionBtn, selectedLimit === opt.value && styles.optionBtnActive]}
            onPress={() => setSelectedLimit(opt.value)}
          >
            <Text style={[styles.optionText, selectedLimit === opt.value && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cooldown Selection */}
      <Text style={styles.sectionLabel}>Cooldown Period</Text>
      <Text style={styles.sectionSubtitle}>
        How long before you can edit or remove this lock?
      </Text>
      <View style={styles.cooldownRow}>
        <TouchableOpacity
          style={[styles.cooldownBtn, cooldown === 14 && styles.cooldownBtnActive]}
          onPress={() => setCooldown(14)}
        >
          <Text style={[styles.cooldownText, cooldown === 14 && styles.cooldownTextActive]}>
            2 Weeks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cooldownBtn, cooldown === 30 && styles.cooldownBtnActive]}
          onPress={() => setCooldown(30)}
        >
          <Text style={[styles.cooldownText, cooldown === 30 && styles.cooldownTextActive]}>
            1 Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {selectedLimit && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Lock Summary</Text>
          <Text style={styles.summaryRow}>
            📱  App: <Text style={styles.summaryValue}>{app.appName}</Text>
          </Text>
          <Text style={styles.summaryRow}>
            ⏱  Daily limit: <Text style={styles.summaryValue}>{selectedLimit} minutes</Text>
          </Text>
          <Text style={styles.summaryRow}>
            🔒  Cooldown: <Text style={styles.summaryValue}>{cooldown} days</Text>
          </Text>
          <Text style={styles.summaryRow}>
            📅  Editable after: <Text style={styles.summaryValue}>
              {new Date(Date.now() + cooldown * 24 * 60 * 60 * 1000).toDateString()}
            </Text>
          </Text>
        </View>
      )}

      {/* Hold to Confirm Button */}
      {selectedLimit && (
        <View style={styles.holdBtnContainer}>
          <Animated.View style={[styles.holdBtnFill, { width: buttonWidth }]} />
          <TouchableOpacity
            style={styles.holdBtn}
            onPressIn={startHold}
            onPressOut={cancelHold}
            activeOpacity={1}
          >
            <Text style={styles.holdBtnText}>
              {confirmed ? '✓ Locked' : 'Hold to Confirm Lock'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 60 },
  appHeader: { alignItems: 'center', marginBottom: spacing.lg },
  appIcon: { width: 72, height: 72, borderRadius: 18, backgroundColor: colors.indigoDeep, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  appIconText: { color: colors.textPrimary, fontSize: 32, fontWeight: 'bold' },
  appName: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 'bold' },
  packageName: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 4 },
  warningBanner: { flexDirection: 'row', backgroundColor: '#1a1020', borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.destructive, gap: spacing.sm, marginBottom: spacing.lg },
  warningIcon: { fontSize: 20 },
  warningText: { color: colors.textMuted, fontSize: fontSize.sm, flex: 1, lineHeight: 20 },
  sectionLabel: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.sm },
  sectionSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm, marginTop: -4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  optionBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  optionBtnActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  optionText: { color: colors.textMuted, fontSize: fontSize.md },
  optionTextActive: { color: colors.textPrimary, fontWeight: '600' },
  cooldownRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  cooldownBtn: { flex: 1, padding: spacing.md, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cooldownBtnActive: { backgroundColor: colors.indigoDeep, borderColor: colors.indigo },
  cooldownText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: '600' },
  cooldownTextActive: { color: colors.textPrimary },
  summaryCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, gap: 8 },
  summaryTitle: { color: colors.indigo, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryRow: { color: colors.textMuted, fontSize: fontSize.md },
  summaryValue: { color: colors.textPrimary, fontWeight: '600' },
  holdBtnContainer: { height: 54, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.indigo, overflow: 'hidden', marginBottom: spacing.sm, justifyContent: 'center' },
  holdBtnFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.indigo, opacity: 0.4 },
  holdBtn: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  holdBtnText: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  cancelBtn: { padding: spacing.md, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.md },
});