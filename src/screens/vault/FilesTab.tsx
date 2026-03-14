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

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = {
      pdf: '📄', docx: '📝', xlsx: '📊', pptx: '📑', other: '📎'
    };
    return icons[type] || '📎';
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.textPrimary,
          }]}
          placeholder="Search files..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {search ? 'No files match your search.' : 'Your library awaits.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftColor: colors.amber,
            }]}>
              <View style={styles.cardTop}>
                <Text style={styles.fileIcon}>{getFileIcon(item.type)}</Text>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.fileMeta, { color: colors.textMuted }]}>
                    {item.type.toUpperCase()} · {item.folder}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.indigo }]}
                  onPress={() => openFile(item.localUri)}
                >
                  <Text style={styles.actionText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }]}
                  onPress={() => openFile(item.localUri)}
                >
                  <Text style={[styles.actionText, { color: colors.textPrimary }]}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id, item.name)}>
                  <Text style={[styles.removeBtn, { color: colors.destructive }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.amber }]}
        onPress={pickFile}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  searchInput: { borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32, fontStyle: 'italic' },
  card: { borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  fileIcon: { fontSize: 28 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: '600' },
  fileMeta: { fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  removeBtn: { fontSize: 18, paddingLeft: 8 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: '#0A0A0F', fontSize: 28, fontWeight: '300' },
});