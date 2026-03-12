import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';
import * as DocumentPicker from 'expo-document-picker';

export default function BooksTab() {
  const { books, addBook } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const pickBookFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    copyToCacheDirectory: false,
  });
  if (!result.canceled && result.assets[0]) {
    setFileUri(result.assets[0].uri);
    setFileName(result.assets[0].name);
  }
  };
  const handleAdd = () => {
  if (!title.trim()) return;
  addBook({
    id: Date.now().toString(),
    title: title.trim(),
    author: author.trim(),
    totalPages: totalPages ? parseInt(totalPages) : null,
    currentPage: 0,
    notes: '',
    coverUri: null,
    fileUri: fileUri,
    fileName: fileName,
    isCompleted: false,
    isPinned: false,
    addedAt: new Date().toISOString(),
  });
  setTitle(''); setAuthor(''); setTotalPages('');
  setFileUri(null); setFileName('');
  setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No books yet. Add one you have been meaning to read.</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                {item.isCompleted && <Text style={styles.completedBadge}>✓ Done</Text>}
              </View>
              <Text style={styles.bookAuthor}>{item.author}</Text>
              {item.totalPages ? (
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(item.currentPage / item.totalPages) * 100}%` }]} />
                </View>
              ) : null}
              <Text style={styles.bookMeta}>
                {item.totalPages ? `Page ${item.currentPage} of ${item.totalPages}` : 'No page count set'}
              </Text>
            </View>
          )}
        />
      )}

      {/* Add Book Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Book</Text>
            <TextInput
              style={styles.input}
              placeholder="Title *"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Author"
              placeholderTextColor={colors.textMuted}
              value={author}
              onChangeText={setAuthor}
            />
            <TextInput
              style={styles.input}
              placeholder="Total pages (optional)"
              placeholderTextColor={colors.textMuted}
              value={totalPages}
              onChangeText={setTotalPages}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filePickerBtn} onPress={pickBookFile}>
              <Text style={styles.filePickerText}>
              {fileName ? `📎 ${fileName}` : '+ Attach File (PDF, DOCX, XLSX, PPTX)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '600', flex: 1 },
  bookAuthor: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 4 },
  completedBadge: { color: colors.success, fontSize: fontSize.sm, fontWeight: '600' },
  progressBar: { height: 4, backgroundColor: colors.border, borderRadius: 999, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.amber, borderRadius: 999 },
  bookMeta: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.sm },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 'bold', marginBottom: spacing.sm },
  input: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  addButton: { backgroundColor: colors.amber, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  addButtonText: { color: colors.background, fontSize: fontSize.md, fontWeight: 'bold' },
  cancelButton: { padding: spacing.md, alignItems: 'center' },
  cancelButtonText: { color: colors.textMuted, fontSize: fontSize.md },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.background, fontSize: 28, fontWeight: '300' },
  filePickerBtn: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.amber, alignItems: 'center' },
  filePickerText: { color: colors.amber, fontSize: fontSize.md },
});