import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput
} from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';

export interface AppInfo {
  packageName: string;
  appName: string;
}

const COMMON_APPS: AppInfo[] = [
  { packageName: 'com.instagram.android', appName: 'Instagram' },
  { packageName: 'com.facebook.katana', appName: 'Facebook' },
  { packageName: 'com.twitter.android', appName: 'Twitter / X' },
  { packageName: 'com.snapchat.android', appName: 'Snapchat' },
  { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok' },
  { packageName: 'com.google.android.youtube', appName: 'YouTube' },
  { packageName: 'com.whatsapp', appName: 'WhatsApp' },
  { packageName: 'org.telegram.messenger', appName: 'Telegram' },
  { packageName: 'com.reddit.frontpage', appName: 'Reddit' },
  { packageName: 'com.linkedin.android', appName: 'LinkedIn' },
  { packageName: 'com.netflix.mediaclient', appName: 'Netflix' },
  { packageName: 'com.spotify.music', appName: 'Spotify' },
  { packageName: 'com.pinterest', appName: 'Pinterest' },
  { packageName: 'com.amazon.mShop.android.shopping', appName: 'Amazon' },
  { packageName: 'com.google.android.gm', appName: 'Gmail' },
  { packageName: 'com.google.android.apps.maps', appName: 'Google Maps' },
  { packageName: 'com.google.android.apps.photos', appName: 'Google Photos' },
  { packageName: 'com.microsoft.teams', appName: 'Microsoft Teams' },
  { packageName: 'com.discord', appName: 'Discord' },
  { packageName: 'com.twitch.android.viewer', appName: 'Twitch' },
  { packageName: 'com.tumblr', appName: 'Tumblr' },
  { packageName: 'com.duolingo', appName: 'Duolingo' },
  { packageName: 'com.ss.android.ugc.trill', appName: 'TikTok (Global)' },
  { packageName: 'com.google.android.apps.youtube.music', appName: 'YouTube Music' },
  { packageName: 'com.samsung.android.messaging', appName: 'Samsung Messages' },
];

interface Props {
  onSelectApp: (app: AppInfo) => void;
  onBack: () => void;
  lockedPackageNames: string[];
}

export default function AppListScreen({ onSelectApp, onBack, lockedPackageNames }: Props) {
  const [search, setSearch] = useState('');

  const filtered = COMMON_APPS.filter((a) =>
    a.appName.toLowerCase().includes(search.toLowerCase())
  );

  const getAppEmoji = (appName: string) => {
    const map: Record<string, string> = {
      'Instagram': '📸', 'Facebook': '👥', 'Twitter / X': '🐦',
      'Snapchat': '👻', 'TikTok': '🎵', 'YouTube': '▶️',
      'WhatsApp': '💬', 'Telegram': '✈️', 'Reddit': '🤖',
      'LinkedIn': '💼', 'Netflix': '🎬', 'Spotify': '🎧',
      'Pinterest': '📌', 'Amazon': '📦', 'Gmail': '📧',
      'Google Maps': '🗺️', 'Discord': '🎮', 'Twitch': '🟣',
    };
    return map[appName] || '📱';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select App to Lock</Text>
      </View>

      <Text style={styles.subtitle}>
        Search and select an app to add a daily usage limit.
      </Text>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search apps..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* App List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => {
          const isLocked = lockedPackageNames.includes(item.packageName);
          return (
            <TouchableOpacity
              style={[styles.appRow, isLocked && styles.appRowLocked]}
              onPress={() => !isLocked && onSelectApp(item)}
              disabled={isLocked}
            >
              <View style={styles.appIcon}>
                <Text style={styles.appEmoji}>{getAppEmoji(item.appName)}</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={[styles.appName, isLocked && styles.appNameLocked]}>
                  {item.appName}
                </Text>
                <Text style={styles.packageName} numberOfLines={1}>
                  {item.packageName}
                </Text>
              </View>
              {isLocked ? (
                <Text style={styles.lockedBadge}>🔒</Text>
              ) : (
                <Text style={styles.arrow}>›</Text>
              )}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No apps match "{search}"</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  backBtn: { paddingVertical: spacing.sm, paddingRight: spacing.sm },
  backBtnText: { color: colors.indigo, fontSize: fontSize.lg, fontWeight: '600' },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  search: { marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 12, gap: spacing.sm },
  appRowLocked: { opacity: 0.4 },
  appIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  appEmoji: { fontSize: 22 },
  appInfo: { flex: 1 },
  appName: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  appNameLocked: { color: colors.textMuted },
  packageName: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  arrow: { color: colors.textMuted, fontSize: 22 },
  lockedBadge: { fontSize: 18 },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  empty: { padding: spacing.lg, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});