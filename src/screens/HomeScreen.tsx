import { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  FlatList, Modal, StyleSheet
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/store';
import StreakCard from '../components/home/StreakCard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const {
    focusNote, setFocusNote, goals, toggleGoal,
    addGoal, files, books, playlists, userProfile
  } = useAppStore();
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    addGoal(newGoalText.trim());
    setNewGoalText('');
    setGoalModalVisible(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pinnedItems = [
    ...files.filter((f) => f.isPinned),
    ...books.filter((b) => b.isPinned),
    ...playlists.filter((p) => p.isPinned),
  ].slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={goals}
        keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                {getGreeting()}{userProfile?.name ? `, ${userProfile.name}` : ''} 👋
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                What are you focused on today?
              </Text>
            </View>

            {/* Streak Card */}
            <StreakCard />

            {/* Focus Note */}
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftColor: colors.amber,
            }]}>
              <Text style={[styles.cardLabel, { color: colors.amber }]}>
                Today's Focus
              </Text>
              <TextInput
                style={[styles.focusInput, { color: colors.textPrimary }]}
                placeholder="Write one sentence about today..."
                placeholderTextColor={colors.textMuted}
                value={focusNote}
                onChangeText={setFocusNote}
                multiline
              />
            </View>

            {/* Goals Header */}
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftColor: colors.indigo,
            }]}>
              <Text style={[styles.cardLabel, { color: colors.indigo }]}>
                Today's Goals
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.goalRow}
            onPress={() => toggleGoal(index)}
          >
            <View style={[
              styles.checkbox,
              { borderColor: colors.indigo },
              item.done && { backgroundColor: colors.indigo }
            ]}>
              {item.done && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[
              styles.goalText,
              { color: item.done ? colors.textMuted : colors.textPrimary },
              item.done && styles.goalDone
            ]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <>
            {/* Add Goal */}
            {goals.length < 3 && (
              <TouchableOpacity
                style={styles.addGoalBtn}
                onPress={() => setGoalModalVisible(true)}
              >
                <Text style={[styles.addGoalText, { color: colors.indigo }]}>
                  + Add goal
                </Text>
              </TouchableOpacity>
            )}

            {/* Quick Pins */}
            {pinnedItems.length > 0 && (
              <View style={[styles.card, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderLeftColor: colors.amber,
              }]}>
                <Text style={[styles.cardLabel, { color: colors.amber }]}>
                  Quick Access
                </Text>
                {pinnedItems.map((item, i) => (
                  <View key={i} style={[styles.pinRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.pinText, { color: colors.textPrimary }]}>
                      {'title' in item ? (item as any).title : (item as any).name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { label: 'Files', value: files.length, color: colors.amber },
                { label: 'Books', value: books.length, color: colors.amber },
                { label: 'Playlists', value: playlists.length, color: colors.amber },
              ].map((stat) => (
                <View key={stat.label} style={[styles.statCard, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }]}>
                  <Text style={[styles.statNumber, { color: stat.color }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        }
      />

      {/* Add Goal Modal */}
      <Modal visible={goalModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Add Goal
            </Text>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              }]}
              placeholder="What do you want to achieve today?"
              placeholderTextColor={colors.textMuted}
              value={newGoalText}
              onChangeText={setNewGoalText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => { setGoalModalVisible(false); setNewGoalText(''); }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.indigo }]}
                onPress={handleAddGoal}
              >
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
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 15, marginTop: 4 },
  card: { borderRadius: 12, padding: 16, marginHorizontal: 20, marginBottom: 8, borderWidth: 1, borderLeftWidth: 3 },
  cardLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  focusInput: { fontSize: 15, lineHeight: 22 },
  goalRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  goalText: { fontSize: 15, flex: 1 },
  goalDone: { textDecorationLine: 'line-through' },
  addGoalBtn: { marginHorizontal: 20, marginBottom: 8, padding: 8 },
  addGoalText: { fontSize: 15, fontWeight: '600' },
  pinRow: { paddingVertical: 10, borderBottomWidth: 1 },
  pinText: { fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 32, marginTop: 8 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: '#00000099', alignItems: 'center', justifyContent: 'center' },
  modalBox: { borderRadius: 16, padding: 24, width: '85%', borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalInput: { borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1 },
  cancelBtnText: { fontSize: 15 },
  confirmBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});