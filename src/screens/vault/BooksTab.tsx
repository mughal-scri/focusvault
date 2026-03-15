import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/store';
import { openFile, saveFilePermanently } from '../../utils/fileUtils';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';

export default function BooksTab() {
  const { colors } = useTheme();
  const { books, addBook, removeBook, updateBook } = useAppStore();
  const { toast, showToast, hideToast } = useToast();

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
        showToast('Book added to vault', 'success');
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
        onPress: () => {
          updateBook(id, {
            isCompleted: true,
            lastReadAt: new Date().toISOString(),
          });
          showToast('Well done. Book completed! 📚', 'success');
        },
      },
    ]);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Remove Book', `Remove "${name}" from vault?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeBook(id);
          showToast('Book removed', 'info');
        }
      },
    ]);
  };

  const getLastReadLabel = (lastReadAt: string | null) => {
    if (!lastReadAt) return 'Not opened yet';
    const diffDays = Math.floor(
      (Date.now() - new Date(lastReadAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return 'Read today';
    if (diffDays === 1) return 'Read yesterday';
    return `Read ${diffDays} days ago`;
  };

  return (
    <View style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconContainer, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <Text style={styles.emptyIcon}>📚</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No books yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            A mind without books is like a room without windows.
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: item.isCompleted ? 0.7 : 1,
            }]}>
              <View style={[styles.bookIconContainer, {
                backgroundColor: item.isCompleted
                  ? colors.success + '15'
                  : colors.amber + '15',
              }]}>
                <Text style={styles.bookIcon}>
                  {item.isCompleted ? '✅' : '📖'}
                </Text>
              </View>
              <View style={styles.bookInfo}>
                <Text style={[styles.bookName, { color: colors.textPrimary }]} numberOfLines={2}>
                  {item.fileName}
                </Text>
                <Text style={[styles.lastRead, {
                  color: item.isCompleted ? colors.success : colors.textMuted
                }]}>
                  {item.isCompleted ? '✓ Completed' : getLastReadLabel(item.lastReadAt)}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.indigo }]}
                    onPress={() => openBook(item)}
                  >
                    <Text style={styles.actionBtnText}>Open</Text>
                  </TouchableOpacity>
                  {!item.isCompleted && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.success }]}
                      onPress={() => markComplete(item.id)}
                    >
                      <Text style={styles.actionBtnText}>Done</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.destructive + '15' }]}
                    onPress={() => confirmDelete(item.id, item.fileName)}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.destructive }]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.amber }]}
        onPress={pickBook}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Toast */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', borderRadius: 16,
    padding: 14, marginBottom: 10,
    borderWidth: 1, gap: 12, minHeight: 80,
  },
  bookIconContainer: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  bookIcon: { fontSize: 24 },
  bookInfo: { flex: 1 },
  bookName: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 4 },
  lastRead: { fontSize: 13, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8, minHeight: 32, justifyContent: 'center',
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabIcon: { color: '#0A0A0F', fontSize: 28, fontWeight: '300' },
});