import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';

export default function BooksTab() {
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
        addBook({
          id: Date.now().toString(),
          fileUri: file.uri,
          fileName: file.name,
          isCompleted: false,
          isPinned: false,
          addedAt: new Date().toISOString(),
          lastReadAt: null,
          lastPage: null,
          totalPages: null,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add book.');
    }
  };

  const openBook = async (item: any) => {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: item.fileUri,
        flags: 1,
        type: 'application/pdf',
      });
      // Update last read timestamp
      updateBook(item.id, { lastReadAt: new Date().toISOString() });
    } catch {
      Alert.alert('Error', 'No app found to open this book.');
    }
  };

  const markComplete = (id: string) => {
    Alert.alert(
      'Mark as Completed',
      'Have you finished reading this book?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Completed!',
          onPress: () => updateBook(id, {
            isCompleted: true,
            lastReadAt: new Date().toISOString(),
          })
        },
      ]
    );
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove Book',
      `Remove "${name}" from vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeBook(id) },
      ]
    );
  };

  const getLastReadLabel = (lastReadAt: string | null) => {
    if (!lastReadAt) return 'Not opened yet';
    const date = new Date(lastReadAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Read today';
    if (diffDays === 1) return 'Read yesterday';
    return `Read ${diffDays} days ago`;
  };

  return (
    <View style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>
            A mind without books is like a room without windows.
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={[styles.card, item.isCompleted && styles.completedCard]}>
              {/* Top Row */}
              <View style={styles.cardTop}>
                <Text style={styles.bookIcon}>📖</Text>
                <View style={styles.bookInfo}>
                  <Text style={styles.bookName} numberOfLines={2}>
                    {item.fileName}
                  </Text>
                  <Text style={styles.lastRead}>
                    {item.isCompleted ? '✓ Completed' : getLastReadLabel(item.lastReadAt)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmDelete(item.id, item.fileName)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Action Row */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openBook(item)}
                >
                  <Text style={styles.actionText}>Open</Text>
                </TouchableOpacity>
                {!item.isCompleted && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.successBtn]}
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
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', paddingHorizontal: spacing.lg, fontStyle: 'italic' },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 2, borderLeftColor: colors.amber },
  completedCard: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  bookIcon: { fontSize: 28 },
  bookInfo: { flex: 1 },
  bookName: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  lastRead: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  removeBtn: { color: colors.destructive, fontSize: 18 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.indigo },
  successBtn: { backgroundColor: colors.success },
  actionText: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.background, fontSize: 28, fontWeight: '300' },
});