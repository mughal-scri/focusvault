import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';

export default function BooksTab() {
  const { books, addBook, removeBook } = useAppStore();

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
        const destUri = file.uri;

        addBook({
          id: Date.now().toString(),
          fileUri: destUri,
          fileName: file.name,
          isCompleted: false,
          isPinned: false,
          addedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add book. Please try again.');
    }
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
              <View style={styles.cardLeft}>
                <Text style={styles.bookIcon}>📖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookName} numberOfLines={2}>{item.fileName}</Text>
                  <Text style={styles.bookMeta}>
                    {item.isCompleted ? '✓ Completed' : 'In progress'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeBook(item.id)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={pickBook}>
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
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  bookIcon: { fontSize: 28 },
  bookName: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  bookMeta: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  removeBtn: { color: colors.destructive, fontSize: 18, paddingLeft: spacing.sm },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.background, fontSize: 28, fontWeight: '300' },
});