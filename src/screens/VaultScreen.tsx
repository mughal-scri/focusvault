import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import FilesTab from './vault/FilesTab';
import BooksTab from './vault/BooksTab';
import PlaylistsTab from './vault/PlaylistsTab';

const TABS = [
  { label: 'Files', icon: '📁', accent: 'amber' },
  { label: 'Books', icon: '📚', accent: 'amber' },
  { label: 'Playlists', icon: '🎬', accent: 'indigo' },
];

export default function VaultScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Vault</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Your personal library
          </Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: colors.amber + '20' }]}>
          <Text style={styles.headerBadgeIcon}>📚</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBarContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          const accentColor = tab.accent === 'amber' ? colors.amber : colors.indigo;
          return (
            <TouchableOpacity
              key={tab.label}
              style={[
                styles.tab,
                isActive && { borderBottomColor: accentColor, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                { color: isActive ? accentColor : colors.textMuted },
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 0 && <FilesTab />}
        {activeTab === 1 && <BooksTab />}
        {activeTab === 2 && <PlaylistsTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeIcon: { fontSize: 22 },
  tabBarContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 48,
  },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  content: { flex: 1 },
});