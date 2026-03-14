import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Switch
} from 'react-native';
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
  const { colors, mode, setMode, isDark } = useTheme();
  const { files, books, playlists, lockedApps, userProfile } = useAppStore();
  const [selectedAccent, setSelectedAccent] = useState('#6366F1');

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your vault files, books, playlists and locked apps. This cannot be undone.',
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
    Alert.alert('Done', 'Onboarding reset. Restart the app to see it again.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        {userProfile?.name && (
          <Text style={[styles.greeting, { color: colors.textMuted }]}>
            Hey, {userProfile.name} 👋
          </Text>
        )}
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionLabel, { color: colors.indigo }]}>Appearance</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

        {/* Dark / Light toggle */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Theme</Text>
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
              <Text style={[
                styles.themeBtnText,
                { color: mode === m ? '#FFFFFF' : colors.textMuted }
              ]}>
                {m === 'dark' ? '🌙 Dark' : m === 'light' ? '☀️ Light' : '⚙️ System'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Accent Color */}
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
        <Text style={[styles.colorLabel, { color: colors.textMuted }]}>
          {ACCENT_COLORS.find(c => c.value === selectedAccent)?.label}
        </Text>
      </View>

      {/* Data */}
      <Text style={[styles.sectionLabel, { color: colors.indigo }]}>Data</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.indigo }]}>{files.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Files</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.amber }]}>{books.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Books</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.indigo }]}>{playlists.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Playlists</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.destructive }]}>{lockedApps.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Locked</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={handleResetOnboarding}
        >
          <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
            🔄 Reset Onboarding
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.destructive }]}
          onPress={handleClearData}
        >
          <Text style={[styles.actionBtnText, { color: colors.destructive }]}>
            🗑 Clear All Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={[styles.sectionLabel, { color: colors.indigo }]}>About</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[
          ['App', 'FocusVault'],
          ['Version', '1.0.0'],
          ['Platform', 'Android'],
          ['Storage', '100% Local'],
          ['License', 'MIT'],
        ].map(([label, value], i, arr) => (
          <View key={label}>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textMuted }]}>{label}</Text>
              <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>{value}</Text>
            </View>
            {i < arr.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          </View>
        ))}
      </View>

      {/* Support */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Support Development
        </Text>
        <Text style={[styles.supportSubtitle, { color: colors.textMuted }]}>
          FocusVault is free and open source. If it helps you stay focused, consider supporting its development.
        </Text>
        <View style={[styles.supportBtn, { backgroundColor: colors.amber }]}>
          <Text style={styles.supportBtnText}>☕ In-App Purchase — Coming in v1.1</Text>
        </View>
      </View>

      <Text style={[styles.footer, { color: colors.textMuted }]}>
        Block distractions. Feed your mind.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 60 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  greeting: { fontSize: 15, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, marginBottom: 8, marginTop: 16 },
  card: { borderRadius: 12, padding: 16, marginHorizontal: 20, marginBottom: 8, borderWidth: 1, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  themeBtnText: { fontSize: 13, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  colorDot: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  colorCheck: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  colorLabel: { fontSize: 13 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 2 },
  actionBtn: { borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
  actionBtnText: { fontSize: 15, fontWeight: '600' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  aboutLabel: { fontSize: 15 },
  aboutValue: { fontSize: 15, fontWeight: '600' },
  separator: { height: 1 },
  supportSubtitle: { fontSize: 14, lineHeight: 20 },
  supportBtn: { borderRadius: 10, padding: 14, alignItems: 'center' },
  supportBtnText: { color: '#000000', fontSize: 15, fontWeight: 'bold' },
  footer: { textAlign: 'center', fontSize: 13, fontStyle: 'italic', marginTop: 16, marginBottom: 8 },
});