import { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  Modal, Linking, StyleSheet, Alert, Image
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/store';

const getYoutubeThumbnail = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
};

export default function PlaylistsTab() {
  const { colors } = useTheme();
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
    setTitle(''); setUrl('');
    setAddModalVisible(false);
  };

  const handleRename = () => {
    if (!renameText.trim() || !selectedId) return;
    updatePlaylist(selectedId, { title: renameText.trim() });
    setRenameText(''); setSelectedId(null);
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

  const sharePlaylist = async (url: string, title: string) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(url, { dialogTitle: `Share: ${title}` });
      } else {
        Alert.alert('Share', `${title}\n${url}`);
      }
    } catch {
      Alert.alert('Error', 'Could not share playlist.');
    }
  };

  const confirmRemove = (id: string) => {
    Alert.alert('Remove Playlist', 'Remove this playlist from vault?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePlaylist(id) },
    ]);
  };

  const active = playlists.filter((p) => !p.isCompleted);
  const completed = playlists.filter((p) => p.isCompleted);

  return (
    <View style={styles.container}>
      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Knowledge is the only wealth that grows when shared.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...active, ...completed]}
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
                {item.thumbnailUrl ? (
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnailFallback, { backgroundColor: colors.border }]}>
                    <Text style={styles.thumbnailIcon}>▶️</Text>
                  </View>
                )}
                <View style={styles.playlistInfo}>
                  <Text style={[styles.playlistTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.playlistUrl, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.youtubeUrl}
                  </Text>
                  {item.isCompleted && (
                    <Text style={[styles.completedLabel, { color: colors.success }]}>✓ Completed</Text>
                  )}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.indigo }]}
                  onPress={() => openPlaylist(item.youtubeUrl)}
                >
                  <Text style={styles.actionText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => openRenameModal(item.id, item.title)}
                >
                  <Text style={[styles.actionText, { color: colors.textPrimary }]}>Rename</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => sharePlaylist(item.youtubeUrl, item.title)}
                >
                  <Text style={[styles.actionText, { color: colors.textPrimary }]}>Share</Text>
                </TouchableOpacity>
                {!item.isCompleted && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    onPress={() => completePlaylist(item.id)}
                  >
                    <Text style={styles.actionText}>Done</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => confirmRemove(item.id)}>
                  <Text style={[styles.removeBtn, { color: colors.destructive }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Playlist</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Playlist title *"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="YouTube URL *"
              placeholderTextColor={colors.textMuted}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.indigo }]} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddModalVisible(false)}>
              <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.centeredOverlay}>
          <View style={[styles.renameBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Rename Playlist</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="New title"
              placeholderTextColor={colors.textMuted}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
            />
            <View style={styles.renameActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.indigo }]}
                onPress={handleRename}
              >
                <Text style={styles.confirmBtnText}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.indigo }]}
        onPress={() => setAddModalVisible(true)}
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
  cardTop: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  thumbnail: { width: 80, height: 56, borderRadius: 8 },
  thumbnailFallback: { width: 80, height: 56, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  thumbnailIcon: { fontSize: 24 },
  playlistInfo: { flex: 1 },
  playlistTitle: { fontSize: 15, fontWeight: '600' },
  playlistUrl: { fontSize: 13, marginTop: 2 },
  completedLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999 },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  removeBtn: { fontSize: 18, paddingLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 10 },
  centeredOverlay: { flex: 1, backgroundColor: '#00000099', alignItems: 'center', justifyContent: 'center' },
  renameBox: { borderRadius: 16, padding: 24, width: '85%', borderWidth: 1, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  input: { borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1 },
  addButton: { borderRadius: 10, padding: 14, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  cancelButton: { padding: 14, alignItems: 'center' },
  cancelButtonText: { fontSize: 15 },
  renameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1 },
  cancelBtnText: { fontSize: 15 },
  confirmBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '300' },
});