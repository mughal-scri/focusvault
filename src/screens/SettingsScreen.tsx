import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/store';

const ACCENT_COLORS = [
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Rose', value: '#F43F5E' },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { files, books, playlists, lockedApps, userProfile } = useAppStore();
  const [selectedAccent, setSelectedAccent] = useState('#6366F1');

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete everything. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Done', 'All data cleared. Restart the app.');
          }
        }
      ]
    );
  };

  const handleResetOnboarding = async () => {
    await AsyncStorage.removeItem('onboarding-complete');
    Alert.alert('Done', 'Restart the app to see onboarding again.');
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
  );

  const RowItem = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.rowItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
            {userProfile?.name && (
              <Text style={[styles.greeting, { color: colors.textMuted }]}>
                Hey, {userProfile.name} 👋
              </Text>
            )}
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.indigo + '20' }]}>
            <Text style={styles.headerBadgeIcon}>⚙️</Text>
          </View>
        </View>

        {/* Theme */}
        <SectionLabel label="APPEARANCE" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Theme Mode</Text>
          <View style={styles.themeRow}>
            {(['dark', 'light', 'system'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: mode === m ? colors.indigo : colors.background,
                    borderColor: mode === m ? colors.indigo : colors.border,
                  }
                ]}
                onPress={() => setMode(m)}
              >
                <Text style={styles.themeBtnIcon}>
                  {m === 'dark' ? '🌙' : m === 'light' ? '☀️' : '⚙️'}
                </Text>
                <Text style={[
                  styles.themeBtnText,
                  { color: mode === m ? '#FFFFFF' : colors.textMuted }
                ]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.cardTitle, { color: colors.textPrimary, marginTop: 16 }]}>
            Accent Color
          </Text>
          <View style={styles.colorRow}>
            {ACCENT_COLORS.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[
                  styles.colorDot,
                  { backgroundColor: c.value },
                  selectedAccent === c.value && styles.colorDotSelected
                ]}
                onPress={() => setSelectedAccent(c.value)}
              >
                {selectedAccent === c.value && (
                  <Text style={styles.colorCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.accentLabel, { color: colors.textMuted }]}>
            {ACCENT_COLORS.find(c => c.value === selectedAccent)?.label}
          </Text>
        </View>

        {/* Stats */}
        <SectionLabel label="VAULT STATS" />
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { label: 'Files', value: files.length, color: colors.amber, icon: '📁' },
            { label: 'Books', value: books.length, color: colors.amber, icon: '📚' },
            { label: 'Playlists', value: playlists.length, color: colors.indigo, icon: '🎬' },
            { label: 'Locked', value: lockedApps.length, color: colors.destructive, icon: '🔒' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Data Actions */}
        <SectionLabel label="DATA" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: colors.border }]}
            onPress={handleResetOnboarding}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
              Reset Onboarding
            </Text>
            <Text style={[styles.actionArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearData}
          >
            <Text style={styles.actionIcon}>🗑</Text>
            <Text style={[styles.actionLabel, { color: colors.destructive }]}>
              Clear All Data
            </Text>
            <Text style={[styles.actionArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <SectionLabel label="ABOUT" />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <RowItem label="App" value="FocusVault" />
          <RowItem label="Version" value="1.0.0" />
          <RowItem label="Platform" value="Android" />
          <RowItem label="Storage" value="100% Local" />
          <View style={[styles.rowItem, { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.rowLabel, { color: colors.textMuted }]}>License</Text>
            <Text style={[styles.rowValue, { color: colors.textPrimary }]}>MIT</Text>
          </View>
        </View>

        {/* Support */}
        <SectionLabel label="SUPPORT" />
        <View style={[styles.supportCard, { backgroundColor: colors.amber + '15', borderColor: colors.amber + '30' }]}>
          <Text style={styles.supportEmoji}>☕</Text>
          <View style={styles.supportInfo}>
            <Text style={[styles.supportTitle, { color: colors.textPrimary }]}>
              Support Development
            </Text>
            <Text style={[styles.supportSubtitle, { color: colors.textMuted }]}>
              FocusVault is free and open source.
            </Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Block distractions. Feed your mind.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  greeting: { fontSize: 14, marginTop: 2 },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeIcon: { fontSize: 22 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
  },
  themeBtnIcon: { fontSize: 14 },
  themeBtnText: { fontSize: 13, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  colorCheck: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  accentLabel: { fontSize: 13 },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 20 },
  statNumber: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '500' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 52,
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  actionArrow: { fontSize: 20 },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 48,
    alignItems: 'center',
  },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontWeight: '600' },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    minHeight: 72,
  },
  supportEmoji: { fontSize: 32 },
  supportInfo: { flex: 1 },
  supportTitle: { fontSize: 15, fontWeight: '700' },
  supportSubtitle: { fontSize: 13, marginTop: 2 },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 24,
    marginBottom: 8,
  },
});