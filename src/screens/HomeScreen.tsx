import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Modal, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme/theme';
import { useAppStore } from '../store/store';

export default function HomeScreen() {
  const { focusNote, setFocusNote, goals, toggleGoal, addGoal, files, books, playlists } = useAppStore();
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    addGoal(newGoalText.trim());
    setNewGoalText('');
    setGoalModalVisible(false);
  };

  const pinnedItems = [
    ...files.filter((f) => f.isPinned),
    ...books.filter((b) => b.isPinned),
    ...playlists.filter((p) => p.isPinned),
  ].slice(0, 4);

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.greeting}>Good day 👋</Text>
              <Text style={styles.subtitle}>What are you focused on today?</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Today's Focus</Text>
              <TextInput
                style={styles.focusInput}
                placeholder="Write one sentence about today..."
                placeholderTextColor={colors.textMuted}
                value={focusNote}
                onChangeText={setFocusNote}
                multiline
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Today's Goals</Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.goalRow} onPress={() => toggleGoal(index)}>
            <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
              {item.done && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.goalText, item.done && styles.goalDone]}>{item.text}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <>
            {goals.length < 3 && (
              <TouchableOpacity
                style={styles.addGoalBtn}
                onPress={() => setGoalModalVisible(true)}
              >
                <Text style={styles.addGoalText}>+ Add goal</Text>
              </TouchableOpacity>
            )}

            {pinnedItems.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Quick Access</Text>
                {pinnedItems.map((item, i) => (
                  <View key={i} style={styles.pinRow}>
                    <Text style={styles.pinText}>{'title' in item ? item.title : item.name}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{files.length}</Text>
                <Text style={styles.statLabel}>Files</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{books.length}</Text>
                <Text style={styles.statLabel}>Books</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{playlists.length}</Text>
                <Text style={styles.statLabel}>Playlists</Text>
              </View>
            </View>
          </>
        }
      />

      {/* Add Goal Modal */}
      <Modal visible={goalModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Goal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="What do you want to achieve today?"
              placeholderTextColor={colors.textMuted}
              value={newGoalText}
              onChangeText={setNewGoalText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setGoalModalVisible(false); setNewGoalText(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddGoal}>
                <Text style={styles.confirmBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  greeting: { color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.md, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardLabel: { color: colors.indigo, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  focusInput: { color: colors.textPrimary, fontSize: fontSize.md, lineHeight: 22 },
  goalRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.indigo },
  checkmark: { color: colors.textPrimary, fontSize: 12, fontWeight: 'bold' },
  goalText: { color: colors.textPrimary, fontSize: fontSize.md, flex: 1 },
  goalDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  addGoalBtn: { marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.sm },
  addGoalText: { color: colors.indigo, fontSize: fontSize.md, fontWeight: '600' },
  pinRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pinText: { color: colors.textPrimary, fontSize: fontSize.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statNumber: { color: colors.indigo, fontSize: fontSize.xxl, fontWeight: 'bold' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: '#00000099', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, width: '85%', borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 'bold', marginBottom: spacing.md },
  modalInput: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.md },
  confirmBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, backgroundColor: colors.indigo },
  confirmBtnText: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
});