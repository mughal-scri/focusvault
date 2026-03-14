import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

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
  { packageName: 'com.discord', appName: 'Discord' },
  { packageName: 'com.twitch.android.viewer', appName: 'Twitch' },
  { packageName: 'com.duolingo', appName: 'Duolingo' },
  { packageName: 'com.google.android.apps.youtube.music', appName: 'YouTube Music' },
  { packageName: 'com.microsoft.teams', appName: 'Microsoft Teams' },
  { packageName: 'com.tumblr', appName: 'Tumblr' },
];

interface Props {
  onSelectApp: (app: AppInfo) => void;
  onBack: () => void;
  lockedPackageNames: string[];
}

export default function AppListScreen({ onSelectApp, onBack, lockedPackageNames }: Props) {
  const { colors } = useTheme();
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
      'Duolingo': '🦜', 'YouTube Music': '🎵',
      'Microsoft Teams': '💙', 'Tumblr': '📝',
    };
    return map[appName] || '📱';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={[styles.backBtnText, { color: colors.indigo }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Select App</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Search and select an app to add a daily usage limit.
      </Text>

      {/* Search */}
      <TextInput
        style={[styles.search, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.textPrimary,
        }]}
        placeholder="Search apps..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => {
          const isLocked = lockedPackageNames.includes(item.packageName);
          return (
            <TouchableOpacity
              style={[
                styles.appRow,
                { borderBottomColor: colors.border },
                isLocked && styles.appRowLocked,
              ]}
              onPress={() => !isLocked && onSelectApp(item)}
              disabled={isLocked}
            >
              <View style={[styles.appIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={styles.appEmoji}>{getAppEmoji(item.appName)}</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={[styles.appName, { color: isLocked ? colors.textMuted : colors.textPrimary }]}>
                  {item.appName}
                </Text>
                <Text style={[styles.packageName, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.packageName}
                </Text>
              </View>
              {isLocked ? (
                <Text style={styles.lockedBadge}>🔒</Text>
              ) : (
                <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
              )}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No apps match "{search}"
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  backBtn: { paddingVertical: 8, paddingRight: 8 },
  backBtnText: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 8 },
  search: { marginHorizontal: 20, borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, marginBottom: 8 },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  appRowLocked: { opacity: 0.4 },
  appIcon: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  appEmoji: { fontSize: 22 },
  appInfo: { flex: 1 },
  appName: { fontSize: 15, fontWeight: '600' },
  packageName: { fontSize: 13, marginTop: 2 },
  arrow: { fontSize: 22 },
  lockedBadge: { fontSize: 18 },
  separator: { height: 1, marginHorizontal: 20 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15 },
});