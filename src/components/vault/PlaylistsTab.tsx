import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Linking, StyleSheet, Alert, Image } from 'react-native';
import { colors, spacing, fontSize } from '../../theme/theme';
import { useAppStore } from '../../store/store';

const getYoutubeThumbnail = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      if (url.includes('playlist')) {
        return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
      }
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  return null;
};

export default function PlaylistsTab() {
  const { playlists, addPlaylist, completePlaylist, removePlaylist, updatePlaylist } = useAppStore();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [renameText, setRenameText] = useState('');

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return;
    const thumbnail = getYoutubeThumbnail(url.trim());
    addPlaylist({
      id: Date.now().toString(),
      title: title.trim(),
      youtubeUrl: url.trim(),
      thumbnailUrl: thumbnail,
      isCompleted: false,
      isPinned: false,
      addedAt: new Date().toISOString(),
      completedAt: null,
    });
    setTitle('');
    setUrl('');
    setAddModalVisible(false);
  };

  const handleRename = () => {
    if (!renameText.trim() || !selectedId) return;
    updatePlaylist(selectedId, { title: renameText.trim() });
    setRenameText('');
    setSelectedId(null);
    setRenameModalVisible(false);
  };

  const openRenameModal = (id: string, currentTitle: string) => {
    setSelectedId(id);
    setRenameText(currentTitle);
    setRenameModalVisible(true);
  };

  const openPlaylist = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open URL.'));
  };

  const confirmRemove = (id: string) => {
    Alert.alert(
      'Remove Playlist',
      'Remove this playlist from vault?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePlaylist(id) },
      ]
    );
  };

  const active = playlists.filter((p) => !p.isCompleted);
  const completed = playlists.filter((p) => p.isCompleted);

  return (
    <View style={styles.container}>
      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>
            Knowledge is the only wealth that grows when shared.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...active, ...completed]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={[styles.card, item.isCompleted && styles.completedCard]}>
              {/* Thumbnail + Info Row */}
              <View style={styles.cardTop}>
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbnailFallback}>
                    <Text style={styles.thumbnailIcon}>▶️</Text>
                  </View>
                )}
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.playlistUrl} numberOfLines={1}>
                    {item.youtubeUrl}
                  </Text>
                  {item.isCompleted && (
                    <Text style={styles.completedLabel}>✓ Completed</Text>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openPlaylist(item.youtubeUrl)}
                >
                  <Text style={styles.actionText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.renameBtn]}
                  onPress={() => openRenameModal(item.id, item.title)}
                >
                  <Text style={styles.actionText}>Rename</Text>
                </TouchableOpacity>
                {!item.isCompleted && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.successBtn]}
                    onPress={() => completePlaylist(item.id)}
                  >
                    <Text style={styles.actionText}>Done</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => confirmRemove(item.id)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Playlist Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
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
            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.centeredOverlay}>
          <View style={styles.renameBox}>
            <Text style={styles.modalTitle}>Rename Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="New title"
              placeholderTextColor={colors.textMuted}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
            />
            <View style={styles.renameActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleRename}>
                <Text style={styles.confirmBtnText}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
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
  cardTop: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  thumbnail: { width: 80, height: 56, borderRadius: 8 },
  thumbnailFallback: { width: 80, height: 56, borderRadius: 8, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  thumbnailIcon: { fontSize: 24 },
  playlistInfo: { flex: 1 },
  playlistTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  playlistUrl: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  completedLabel: { color: colors.success, fontSize: fontSize.sm, fontWeight: '600', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.indigo },
  renameBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  successBtn: { backgroundColor: colors.success },
  actionText: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' },
  removeBtn: { color: colors.destructive, fontSize: 18, paddingLeft: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.sm },
  centeredOverlay: { flex: 1, backgroundColor: '#00000099', alignItems: 'center', justifyContent: 'center' },
  renameBox: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, width: '85%', borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 'bold', marginBottom: spacing.sm },
  input: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  addButton: { backgroundColor: colors.indigo, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  addButtonText: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 'bold' },
  cancelButton: { padding: spacing.md, alignItems: 'center' },
  cancelButtonText: { color: colors.textMuted, fontSize: fontSize.md },
  renameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.md },
  confirmBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, backgroundColor: colors.indigo },
  confirmBtnText: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: colors.textPrimary, fontSize: 28, fontWeight: '300' },
});