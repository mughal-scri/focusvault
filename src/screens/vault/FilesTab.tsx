import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';

export default function FilesTab() {
  const { files, addFile } = useAppStore();
  const pickFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: false,
      multiple: false,
    });

    if (!result.canceled && result.assets[0]) {
      const file = result.assets[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const typeMap: Record<string, string> = {
        pdf: 'pdf', docx: 'docx', doc: 'docx',
        xlsx: 'xlsx', xls: 'xlsx',
        pptx: 'pptx', ppt: 'pptx',
      };
      addFile({
        id: Date.now().toString(),
        name: file.name,
        localUri: file.uri,
        folder: 'General',
        type: typeMap[ext || ''] || 'other',
        isPinned: false,
        lastOpenedAt: null,
        pdfLastPage: null,
        addedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('File pick error:', error);
  }
};

  return (
    <View style={styles.container}>
      {files.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyText}>No files yet. Add something worth reading.</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.fileName}>{item.name}</Text>
              <Text style={styles.fileMeta}>{item.folder}</Text>
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  fileName: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '600' },
  fileMeta: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.textPrimary, fontSize: 28, fontWeight: '300' },
});