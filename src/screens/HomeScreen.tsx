import { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Modal, StyleSheet, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/store';
import StreakCard from '../components/home/StreakCard';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>
              {getGreeting()}{userProfile?.name ? `, ${userProfile.name}` : ''} 👋
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Streak Card */}
        <StreakCard />

        {/* Focus Note */}
        <View style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: colors.amber,
        }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBadge, { backgroundColor: colors.amber + '20' }]}>
              <Text style={styles.cardIcon}>✏️</Text>
            </View>
            <Text style={[styles.cardLabel, { color: colors.amber }]}>
              Today's Focus
            </Text>
          </View>
          <TextInput
            style={[styles.focusInput, {
              color: colors.textPrimary,
              borderColor: colors.border,
              backgroundColor: isDark ? colors.background : '#F0F4FF',
            }]}
            placeholder="Write one sentence about today..."
            placeholderTextColor={colors.textMuted}
            value={focusNote}
            onChangeText={setFocusNote}
            multiline
          />
        </View>

        {/* Goals Card */}
        <View style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: colors.indigo,
        }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBadge, { backgroundColor: colors.indigo + '20' }]}>
              <Text style={styles.cardIcon}>🎯</Text>
            </View>
            <Text style={[styles.cardLabel, { color: colors.indigo }]}>
              Today's Goals
            </Text>
            <Text style={[styles.goalCount, { color: colors.textMuted }]}>
              {goals.filter(g => g.done).length}/{goals.length}
            </Text>
          </View>

          {/* Goals List — inside the card */}
          {goals.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.goalRow, {
                borderTopColor: colors.border,
              }]}
              onPress={() => toggleGoal(index)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.indigo },
                item.done && { backgroundColor: colors.indigo, borderColor: colors.indigo }
              ]}>
                {item.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[
                styles.goalText,
                { color: item.done ? colors.textMuted : colors.textPrimary },
                item.done && styles.goalDone
              ]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Add Goal Button — inside the card */}
          {goals.length < 3 && (
            <TouchableOpacity
              style={[styles.addGoalBtn, {
                borderColor: colors.indigo + '40',
                borderTopColor: goals.length > 0 ? colors.border : 'transparent',
              }]}
              onPress={() => setGoalModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.addGoalText, { color: colors.indigo }]}>
                + Add goal
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Pins */}
        {pinnedItems.length > 0 && (
          <View style={[styles.card, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: colors.amber,
          }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBadge, { backgroundColor: colors.amber + '20' }]}>
                <Text style={styles.cardIcon}>📌</Text>
              </View>
              <Text style={[styles.cardLabel, { color: colors.amber }]}>
                Quick Access
              </Text>
            </View>
            {pinnedItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pinRow, { borderTopColor: colors.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pinText, { color: colors.textPrimary }]}>
                  {'title' in item ? (item as any).title : (item as any).name}
                </Text>
                <Text style={[styles.pinArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Files', value: files.length, color: colors.amber, icon: '📁' },
            { label: 'Books', value: books.length, color: colors.amber, icon: '📚' },
            { label: 'Playlists', value: playlists.length, color: colors.indigo, icon: '🎬' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statNumber, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

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
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              What do you want to achieve today?
            </Text>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              }]}
              placeholder="e.g. Complete 2 chapters of my book"
              placeholderTextColor={colors.textMuted}
              value={newGoalText}
              onChangeText={setNewGoalText}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddGoal}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, {
                  borderColor: colors.border,
                  minHeight: 48,
                }]}
                onPress={() => {
                  setGoalModalVisible(false);
                  setNewGoalText('');
                }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, {
                  backgroundColor: colors.indigo,
                  minHeight: 48,
                }]}
                onPress={handleAddGoal}
              >
                <Text style={styles.confirmBtnText}>Add Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  date: { fontSize: 14, marginTop: 4 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardIconBadge: {
    width: 32, height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 16 },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  goalCount: { fontSize: 13, fontWeight: '600' },
  focusInput: {
    fontSize: 15,
    lineHeight: 24,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderTopWidth: 1,
    minHeight: 52,
  },
  checkbox: {
    width: 24, height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  goalText: { fontSize: 15, flex: 1, lineHeight: 22 },
  goalDone: { textDecorationLine: 'line-through' },
  addGoalBtn: {
    paddingVertical: 14,
    borderTopWidth: 1,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  addGoalText: { fontSize: 15, fontWeight: '600' },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    minHeight: 48,
  },
  pinText: { fontSize: 15, flex: 1 },
  pinArrow: { fontSize: 20 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  statIcon: { fontSize: 20 },
  statNumber: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalSubtitle: { fontSize: 14, lineHeight: 20, marginTop: -4 },
  modalInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 48,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '500' },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});