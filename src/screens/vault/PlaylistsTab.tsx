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
          <View style={[styles.emptyIconContainer, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <Text style={styles.emptyIcon}>🎬</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No playlists yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Knowledge is the only wealth that grows when shared.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...active, ...completed]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            completed.length > 0 ? (
              <View style={[styles.completedSection, { borderTopColor: colors.border }]}>
                <Text style={[styles.completedSectionLabel, { color: colors.textMuted }]}>
                  ✓ Completed ({completed.length})
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: item.isCompleted ? 0.65 : 1,
            }]}>
              {/* Top Row */}
              <View style={styles.cardTop}>
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.thumbnailFallback, { backgroundColor: colors.indigo + '20' }]}>
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
                    <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.completedBadgeText, { color: colors.success }]}>
                        ✓ Completed
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.indigo }]}
                  onPress={() => openPlaylist(item.youtubeUrl)}
                >
                  <Text style={styles.actionBtnText}>▶ Open</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => openRenameModal(item.id, item.title)}
                >
                  <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>✏ Rename</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => sharePlaylist(item.youtubeUrl, item.title)}
                >
                  <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>↗ Share</Text>
                </TouchableOpacity>
                {!item.isCompleted && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    onPress={() => completePlaylist(item.id)}
                  >
                    <Text style={styles.actionBtnText}>✓ Done</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.destructive + '15' }]}
                  onPress={() => confirmRemove(item.id)}
                >
                  <Text style={[styles.actionBtnText, { color: colors.destructive }]}>✕</Text>
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
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Add Playlist
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Paste a YouTube URL to add it to your vault
            </Text>
            <View style={styles.modalFields}>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }]}
                placeholder="Playlist title *"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }]}
                placeholder="YouTube URL *"
                placeholderTextColor={colors.textMuted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.indigo }]}
                onPress={handleAdd}
              >
                <Text style={styles.modalConfirmText}>Add Playlist</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.centeredOverlay}>
          <View style={[styles.renameBox, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Rename Playlist
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              }]}
              placeholder="New title"
              placeholderTextColor={colors.textMuted}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.indigo }]}
                onPress={handleRename}
              >
                <Text style={styles.modalConfirmText}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.indigo }]}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  card: { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  thumbnail: { width: 88, height: 64, borderRadius: 10 },
  thumbnailFallback: {
    width: 88, height: 64, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  thumbnailIcon: { fontSize: 28 },
  playlistInfo: { flex: 1, justifyContent: 'center' },
  playlistTitle: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 4 },
  playlistUrl: { fontSize: 12, marginBottom: 6 },
  completedBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  completedBadgeText: { fontSize: 12, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 34,
    justifyContent: 'center',
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  completedSection: { paddingTop: 16, paddingHorizontal: 4, borderTopWidth: 1 },
  completedSectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 999,
    alignSelf: 'center', marginBottom: 8,
  },
  centeredOverlay: {
    flex: 1, backgroundColor: '#00000099',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  renameBox: { borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalSubtitle: { fontSize: 14, lineHeight: 20, marginTop: -4 },
  modalFields: { gap: 10 },
  input: {
    borderRadius: 12, padding: 14, fontSize: 15,
    borderWidth: 1, minHeight: 48,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, minHeight: 48,
  },
  modalCancelText: { fontSize: 15, fontWeight: '500' },
  modalConfirmBtn: {
    flex: 1, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, minHeight: 48,
  },
  modalConfirmText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '300' },
});