import { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  TextInput, StyleSheet, Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/store';
import { openFile, saveFilePermanently } from '../../utils/fileUtils';

export default function FilesTab() {
  const { colors } = useTheme();
  const { files, addFile, removeFile } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const typeMap: Record<string, string> = {
          pdf: 'pdf', docx: 'docx', doc: 'docx',
          xlsx: 'xlsx', xls: 'xlsx',
          pptx: 'pptx', ppt: 'pptx',
        };
        const permanentUri = await saveFilePermanently(file.uri, file.name);
        addFile({
          id: Date.now().toString(),
          name: file.name,
          localUri: permanentUri,
          folder: 'General',
          type: typeMap[ext] || 'other',
          isPinned: false,
          lastOpenedAt: null,
          pdfLastPage: null,
          addedAt: new Date().toISOString(),
        });
      }
    } catch {
      Alert.alert('Error', 'Could not add file.');
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Remove File', `Remove "${name}" from vault?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFile(id) },
    ]);
  };

  const getFileConfig = (type: string) => {
    const config: Record<string, { icon: string; color: string }> = {
      pdf: { icon: '📄', color: '#EF4444' },
      docx: { icon: '📝', color: '#3B82F6' },
      xlsx: { icon: '📊', color: '#10B981' },
      pptx: { icon: '📑', color: '#F59E0B' },
      other: { icon: '📎', color: '#6366F1' },
    };
    return config[type] || config.other;
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search files..."
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

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>📁</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {search ? 'No results found' : 'Your library awaits'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {search ? `No files matching "${search}"` : 'Add files from your device to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const config = getFileConfig(item.type);
            return (
              <View style={[styles.card, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }]}>
                <View style={[styles.fileIconContainer, { backgroundColor: config.color + '15' }]}>
                  <Text style={styles.fileIcon}>{config.icon}</Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.fileMeta, { color: colors.textMuted }]}>
                    {item.type.toUpperCase()} · {item.folder}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.indigo + '15' }]}
                    onPress={() => openFile(item.localUri)}
                  >
                    <Text style={styles.iconBtnText}>↗</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.destructive + '15' }]}
                    onPress={() => confirmDelete(item.id, item.name)}
                  >
                    <Text style={[styles.iconBtnText, { color: colors.destructive }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.amber }]}
        onPress={pickFile}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrapper: { padding: 16, paddingBottom: 8 },
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
    minHeight: 72,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: { fontSize: 22 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  fileMeta: { fontSize: 13, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: { color: '#0A0A0F', fontSize: 28, fontWeight: '300' },
});