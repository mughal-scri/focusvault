import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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
        addFile({
          id: Date.now().toString(),
          name: file.name,
          localUri: file.uri,
          folder: 'General',
          type: typeMap[ext] || 'other',
          isPinned: false,
          lastOpenedAt: null,
          pdfLastPage: null,
          addedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add file.');
    }
  };

  const openFile = async (uri: string, type: string) => {
    try {
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        other: '*/*',
      };
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: uri,
        flags: 1,
        type: mimeMap[type] || '*/*',
      });
    } catch {
      Alert.alert('Error', 'No app found to open this file.');
    }
  };

  const shareFile = async (uri: string) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing not available on this device.');
      }
    } catch {
      Alert.alert('Error', 'Could not share file.');
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove File',
      `Remove "${name}" from vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFile(id) },
      ]
    );
  };

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = {
      pdf: '📄', docx: '📝', xlsx: '📊', pptx: '📑', other: '📎'
    };
    return icons[type] || '📎';
  };

  return (
    <View style={styles.container}>
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
            {search ? 'No files match your search.' : 'Your library awaits.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardLeft}
                onPress={() => openFile(item.localUri, item.type)}
              >
                <Text style={styles.fileIcon}>{getFileIcon(item.type)}</Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.fileMeta}>
                    {item.type.toUpperCase()} · {item.folder}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openFile(item.localUri, item.type)}
                >
                  <Text style={styles.actionText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => shareFile(item.localUri)}
                >
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(item.id, item.name)}
                >
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

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
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', paddingHorizontal: spacing.lg, fontStyle: 'italic' },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 2, borderLeftColor: colors.amber },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  fileIcon: { fontSize: 28 },
  fileInfo: { flex: 1 },
  fileName: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  fileMeta: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.indigo },
  actionText: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' },
  removeBtn: { color: colors.destructive, fontSize: 18, paddingLeft: spacing.sm },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.background, fontSize: 28, fontWeight: '300' },
});