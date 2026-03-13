import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize } from '../theme/theme';
import { useAppStore } from '../store/store';

const ACCENT_COLORS = [
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Rose', value: '#F43F5E' },
];

export default function SettingsScreen() {
  const { files, books, playlists, lockedApps } = useAppStore();
  const [selectedAccent, setSelectedAccent] = useState('#6366F1');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      files: files.length,
      books: books.length,
      playlists: playlists.length,
      lockedApps: lockedApps.length,
    };
    Alert.alert(
      'Vault Summary',
      `Files: ${data.files}\nBooks: ${data.books}\nPlaylists: ${data.playlists}\nLocked Apps: ${data.lockedApps}\n\nExported: ${new Date().toDateString()}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Appearance */}
      <Text style={styles.sectionLabel}>Appearance</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Accent Color</Text>
        <Text style={styles.cardSubtitle}>Choose your primary accent color</Text>
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
        <Text style={styles.colorLabel}>
          {ACCENT_COLORS.find(c => c.value === selectedAccent)?.label}
        </Text>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionLabel}>Notifications</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.cardTitle}>Morning Summary</Text>
            <Text style={styles.cardSubtitle}>Daily reminder at 8:00 AM</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.indigo }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </View>

      {/* Data */}
      <Text style={styles.sectionLabel}>Data</Text>
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{files.length}</Text>
            <Text style={styles.statLabel}>Files</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{books.length}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{playlists.length}</Text>
            <Text style={styles.statLabel}>Playlists</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{lockedApps.length}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={handleExportData}>
          <Text style={styles.actionBtnText}>📊 View Vault Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.dangerBtn]}
          onPress={handleClearData}
        >
          <Text style={[styles.actionBtnText, styles.dangerBtnText]}>
            🗑 Clear All Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={styles.sectionLabel}>About</Text>
      <View style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App</Text>
          <Text style={styles.aboutValue}>FocusVault</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Platform</Text>
          <Text style={styles.aboutValue}>Android</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Storage</Text>
          <Text style={styles.aboutValue}>100% Local</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>License</Text>
          <Text style={styles.aboutValue}>MIT</Text>
        </View>
      </View>

      {/* Support */}
      <View style={styles.card}>
        <Text style={styles.supportTitle}>Support Development</Text>
        <Text style={styles.supportSubtitle}>
          FocusVault is free and open source. If it helps you stay focused, consider supporting its development.
        </Text>
        <TouchableOpacity style={styles.supportBtn}>
          <Text style={styles.supportBtnText}>☕ Support via In-App Purchase</Text>
        </TouchableOpacity>
        <Text style={styles.supportNote}>
          In-app purchase coming in v1.1 via Google Play Billing.
        </Text>
      </View>

      <Text style={styles.footer}>
        Block distractions. Feed your mind.
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 60 },
  header: { paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
  sectionLabel: { color: colors.indigo, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: spacing.md, marginBottom: spacing.sm, marginTop: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  cardTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  cardSubtitle: { color: colors.textMuted, fontSize: fontSize.sm },
  colorRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  colorDot: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: colors.textPrimary },
  colorCheck: { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  colorLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statNumber: { color: colors.indigo, fontSize: fontSize.xxl, fontWeight: 'bold' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  actionBtn: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionBtnText: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  dangerBtn: { borderColor: colors.destructive },
  dangerBtnText: { color: colors.destructive },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  aboutLabel: { color: colors.textMuted, fontSize: fontSize.md },
  aboutValue: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.border },
  supportTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 'bold' },
  supportSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  supportBtn: { backgroundColor: colors.amber, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  supportBtnText: { color: colors.background, fontSize: fontSize.md, fontWeight: 'bold' },
  supportNote: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  footer: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', fontStyle: 'italic', marginTop: spacing.lg, marginBottom: spacing.md },
});