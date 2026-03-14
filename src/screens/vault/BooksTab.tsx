import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/store';
import { openFile, saveFilePermanently } from '../../utils/fileUtils';

export default function BooksTab() {
  const { colors } = useTheme();
  const { books, addBook, removeBook, updateBook } = useAppStore();

  const pickBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const permanentUri = await saveFilePermanently(file.uri, file.name);
        addBook({
          id: Date.now().toString(),
          fileUri: permanentUri,
          fileName: file.name,
          isCompleted: false,
          isPinned: false,
          addedAt: new Date().toISOString(),
          lastReadAt: null,
          lastPage: null,
          totalPages: null,
        });
      }
    } catch {
      Alert.alert('Error', 'Could not add book.');
    }
  };

  const openBook = async (item: any) => {
    await openFile(item.fileUri);
    updateBook(item.id, { lastReadAt: new Date().toISOString() });
  };

  const markComplete = (id: string) => {
    Alert.alert('Mark as Completed', 'Have you finished reading this book?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Completed!',
        onPress: () => updateBook(id, {
          isCompleted: true,
          lastReadAt: new Date().toISOString(),
        }),
      },
    ]);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Remove Book', `Remove "${name}" from vault?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeBook(id) },
    ]);
  };

  const getLastReadLabel = (lastReadAt: string | null) => {
    if (!lastReadAt) return 'Not opened yet';
    const diffDays = Math.floor((Date.now() - new Date(lastReadAt).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Read today';
    if (diffDays === 1) return 'Read yesterday';
    return `Read ${diffDays} days ago`;
  };

  return (
    <View style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            A mind without books is like a room without windows.
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderLeftColor: colors.amber,
                opacity: item.isCompleted ? 0.6 : 1,
              }
            ]}>
              <View style={styles.cardTop}>
                <Text style={styles.bookIcon}>📖</Text>
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.fileName}
                  </Text>
                  <Text style={[styles.lastRead, { color: item.isCompleted ? colors.success : colors.textMuted }]}>
                    {item.isCompleted ? '✓ Completed' : getLastReadLabel(item.lastReadAt)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmDelete(item.id, item.fileName)}>
                  <Text style={[styles.removeBtn, { color: colors.destructive }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.indigo }]}
                  onPress={() => openBook(item)}
                >
                  <Text style={styles.actionText}>Open</Text>
                </TouchableOpacity>
                {!item.isCompleted && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    onPress={() => markComplete(item.id)}
                  >
                    <Text style={styles.actionText}>Mark Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.amber }]}
        onPress={pickBook}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32, fontStyle: 'italic' },
  card: { borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  bookIcon: { fontSize: 28 },
  bookInfo: { flex: 1 },
  bookName: { fontSize: 15, fontWeight: '600' },
  lastRead: { fontSize: 13, marginTop: 2 },
  removeBtn: { fontSize: 18 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: '#0A0A0F', fontSize: 28, fontWeight: '300' },
});