import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';

export default function FilesTab() {
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

        // Copy file to app storage so it persists
        const destUri = file.uri;

        addFile({
          id: Date.now().toString(),
          name: file.name,
          localUri: destUri,
          folder: 'General',
          type: typeMap[ext] || 'other',
          isPinned: false,
          lastOpenedAt: null,
          pdfLastPage: null,
          addedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add file. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search files..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyText}>
            {search ? 'No files match your search.' : 'No files yet. Add something worth reading.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.fileIcon}>
                  {item.type === 'pdf' ? '📄' : item.type === 'docx' ? '📝' : item.type === 'xlsx' ? '📊' : item.type === 'pptx' ? '📑' : '📎'}
                </Text>
                <View>
                  <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.fileMeta}>{item.type.toUpperCase()} · {item.folder}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeFile(item.id)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={pickFile}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchInput: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  fileIcon: { fontSize: 28 },
  fileName: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600', maxWidth: 220 },
  fileMeta: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  removeBtn: { color: colors.destructive, fontSize: 18, paddingLeft: spacing.sm },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.textPrimary, fontSize: 28, fontWeight: '300' },
});