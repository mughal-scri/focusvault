import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import FilesTab from './vault/FilesTab';
import BooksTab from './vault/BooksTab';
import PlaylistsTab from './vault/PlaylistsTab';

const TABS = ['Files', 'Books', 'Playlists'];

export default function VaultScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Vault</Text>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === index && [styles.activeTab, { borderBottomColor: index === 0 || index === 2 ? colors.indigo : colors.amber }]
            ]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === index ? (index === 1 ? colors.amber : colors.indigo) : colors.textMuted }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 0 && <FilesTab />}
        {activeTab === 1 && <BooksTab />}
        {activeTab === 2 && <PlaylistsTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: {},
  tabText: { fontSize: 15, fontWeight: '600' },
  content: { flex: 1 },
});