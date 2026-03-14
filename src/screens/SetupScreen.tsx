import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/store';

interface Props {
  onFinish: () => void;
}

export default function SetupScreen({ onFinish }: Props) {
  const { colors } = useTheme();
  const { setUserProfile } = useAppStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [nameError, setNameError] = useState('');

  const handleStart = () => {
    if (!name.trim()) {
      setNameError('Please enter your name to continue.');
      return;
    }
    setNameError('');
    setUserProfile({ name: name.trim(), age: age ? parseInt(age) : null });
    onFinish();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🔒</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Let's get to know you.
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            This helps personalize your experience. Stored only on your device.
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Your Name *</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surface,
                borderColor: nameError ? colors.destructive : colors.border,
                color: colors.textPrimary,
              }]}
              placeholder="What should we call you?"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(t) => { setName(t); setNameError(''); }}
              autoFocus
            />
            {nameError ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {nameError}
              </Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Your Age</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              }]}
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        {/* App intro cards */}
        <View style={styles.cards}>
          <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.indigo + '40', borderLeftColor: colors.indigo }]}>
            <Text style={[styles.cardTitle, { color: colors.indigo }]}>🔒 Lock Side</Text>
            <Text style={[styles.cardText, { color: colors.textMuted }]}>
              Set hard daily limits on distracting apps. Once locked, no bypass until cooldown ends.
            </Text>
          </View>
          <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.amber + '40', borderLeftColor: colors.amber }]}>
            <Text style={[styles.cardTitle, { color: colors.amber }]}>📚 Vault Side</Text>
            <Text style={[styles.cardText, { color: colors.textMuted }]}>
              Store files, books, and playlists. Your personal library, always one tap away.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.indigo }]}
          onPress={handleStart}
        >
          <Text style={styles.startBtnText}>Get Started →</Text>
        </TouchableOpacity>

        <Text style={[styles.note, { color: colors.textMuted }]}>
          100% local · No accounts · No cloud
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 80, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  form: { gap: 20, marginBottom: 32 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1 },
  errorText: { fontSize: 13, marginTop: 4 },
  cards: { gap: 12, marginBottom: 32 },
  introCard: { borderRadius: 12, padding: 16, borderWidth: 1, borderLeftWidth: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  cardText: { fontSize: 14, lineHeight: 21 },
  startBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  note: { textAlign: 'center', fontSize: 13, fontStyle: 'italic' },
});