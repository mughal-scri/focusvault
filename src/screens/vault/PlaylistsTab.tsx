import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Linking, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';

export default function PlaylistsTab() {
  const { playlists, addPlaylist, completePlaylist, removePlaylist } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return;
    addPlaylist({
      id: Date.now().toString(),
      title: title.trim(),
      youtubeUrl: url.trim(),
      thumbnailUrl: null,
      isCompleted: false,
      isPinned: false,
      addedAt: new Date().toISOString(),
      completedAt: null,
    });
    setTitle('');
    setUrl('');
    setModalVisible(false);
  };

  const openPlaylist = (url: string) => {
    Linking.openURL(url).catch(() => console.error('Could not open URL'));
  };

  const active = playlists.filter((p) => !p.isCompleted);
  const completed = playlists.filter((p) => p.isCompleted);

  return (
    <View style={styles.container}>
      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>No playlists yet. Add one worth watching.</Text>
        </View>
      ) : (
        <FlatList
          data={[...active, ...completed]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={[styles.card, item.isCompleted && styles.completedCard]}>
              <Text style={styles.playlistTitle}>{item.title}</Text>
              <Text style={styles.playlistUrl} numberOfLines={1}>{item.youtubeUrl}</Text>
              {item.isCompleted && (
                <Text style={styles.completedLabel}>✓ Completed</Text>
              )}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openPlaylist(item.youtubeUrl)}
                >
                  <Text style={styles.actionBtnText}>Open</Text>
                </TouchableOpacity>
                {!item.isCompleted && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.successBtn]}
                    onPress={() => completePlaylist(item.id)}
                  >
                    <Text style={styles.actionBtnText}>Completed</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.dangerBtn]}
                  onPress={() => removePlaylist(item.id)}
                >
                  <Text style={styles.actionBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Playlist Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Playlist title *"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="YouTube URL *"
              placeholderTextColor={colors.textMuted}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
  completedCard: { opacity: 0.6 },
  playlistTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '600' },
  playlistUrl: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 4 },
  completedLabel: { color: colors.success, fontSize: fontSize.sm, fontWeight: '600', marginTop: 6 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.indigo },
  successBtn: { backgroundColor: colors.success },
  dangerBtn: { backgroundColor: colors.destructive },
  actionBtnText: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.sm },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 'bold', marginBottom: spacing.sm },
  input: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  addButton: { backgroundColor: colors.indigo, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  addButtonText: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 'bold' },
  cancelButton: { padding: spacing.md, alignItems: 'center' },
  cancelButtonText: { color: colors.textMuted, fontSize: fontSize.md },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.textPrimary, fontSize: 28, fontWeight: '300' },
});