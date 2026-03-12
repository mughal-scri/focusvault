import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme/theme';
import FilesTab from './vault/FilesTab';
import BooksTab from './vault/BooksTab';
import PlaylistsTab from './vault/PlaylistsTab';

const TABS = ['Files', 'Books', 'Playlists'];

export default function VaultScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vault</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === index && styles.activeTab]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 0 && <FilesTab />}
        {activeTab === 1 && <BooksTab />}
        {activeTab === 2 && <PlaylistsTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  tab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: colors.surface },
  activeTab: { backgroundColor: colors.indigo },
  tabText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: '600' },
  activeTabText: { color: colors.textPrimary },
  content: { flex: 1 },
});