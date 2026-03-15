import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const APP_EMOJIS: Record<string, string> = {
  'Instagram': '📸', 'Facebook': '👥', 'Twitter / X': '🐦',
  'Snapchat': '👻', 'TikTok': '🎵', 'YouTube': '▶️',
  'WhatsApp': '💬', 'Telegram': '✈️', 'Reddit': '🤖',
  'LinkedIn': '💼', 'Netflix': '🎬', 'Spotify': '🎧',
  'Pinterest': '📌', 'Amazon': '📦', 'Gmail': '📧',
  'Google Maps': '🗺️', 'Discord': '🎮', 'Twitch': '🟣',
  'Duolingo': '🦜', 'YouTube Music': '🎵',
  'Microsoft Teams': '💙', 'Tumblr': '📝',
};

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onBack}
        >
          <Text style={[styles.backBtnText, { color: colors.indigo }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Select App</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Choose an app to lock
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search apps..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isLocked = lockedPackageNames.includes(item.packageName);
          return (
            <TouchableOpacity
              style={[styles.appRow, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: isLocked ? 0.45 : 1,
              }]}
              onPress={() => !isLocked && onSelectApp(item)}
              disabled={isLocked}
              activeOpacity={0.7}
            >
              <View style={[styles.appIconContainer, {
                backgroundColor: isLocked ? colors.border : colors.indigo + '15',
              }]}>
                <Text style={styles.appEmoji}>
                  {APP_EMOJIS[item.appName] || '📱'}
                </Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={[styles.appName, { color: colors.textPrimary }]}>
                  {item.appName}
                </Text>
                <Text style={[styles.packageName, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.packageName}
                </Text>
              </View>
              {isLocked ? (
                <View style={[styles.lockedBadge, { backgroundColor: colors.indigo + '15' }]}>
                  <Text style={[styles.lockedBadgeText, { color: colors.indigo }]}>
                    🔒 Locked
                  </Text>
                </View>
              ) : (
                <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No apps matching "{search}"
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  backBtnText: { fontSize: 24, fontWeight: '600', marginTop: -2 },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15 },
  clearBtn: { fontSize: 16, padding: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 8 },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 12,
    minHeight: 68,
  },
  appIconContainer: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  appEmoji: { fontSize: 22 },
  appInfo: { flex: 1 },
  appName: { fontSize: 15, fontWeight: '600' },
  packageName: { fontSize: 12, marginTop: 2 },
  lockedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  lockedBadgeText: { fontSize: 12, fontWeight: '600' },
  arrow: { fontSize: 22, fontWeight: '300' },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15 },
});