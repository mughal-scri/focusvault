import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/store';

interface Props {
  onFinish: () => void | Promise<void>;
}

export default function SetupScreen({ onFinish }: Props) {
  const { colors } = useTheme();
  const { setUserProfile } = useAppStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [nameError, setNameError] = useState('');

  const handleStart = async () => {
    if (!name.trim()) {
      setNameError('Please enter your name to continue.');
      return;
    }
    setNameError('');
    try {
      setUserProfile({ name: name.trim(), age: age ? parseInt(age) : null });
      await onFinish();
    } catch (e) {
      console.error('Setup error:', e);
      onFinish();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View style={styles.logoSection}>
            <View style={[styles.logoContainer, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }]}>
              <Text style={styles.logoEmoji}>🔒</Text>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Let's get to{'\n'}know you.
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Stored only on your device. No accounts, no cloud.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                YOUR NAME *
              </Text>
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
                returnKeyType="next"
              />
              {nameError ? (
                <View style={[styles.errorRow, { backgroundColor: colors.destructive + '10' }]}>
                  <Text style={[styles.errorText, { color: colors.destructive }]}>
                    ⚠ {nameError}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Age Field */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                YOUR AGE <Text style={{ fontWeight: '400' }}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }]}
                placeholder="How old are you?"
                placeholderTextColor={colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* App intro cards */}
          <View style={styles.introCards}>
            <View style={[styles.introCard, {
              backgroundColor: colors.surface,
              borderColor: colors.indigo + '30',
              borderLeftColor: colors.indigo,
            }]}>
              <View style={[styles.introCardIcon, { backgroundColor: colors.indigo + '15' }]}>
                <Text style={styles.introCardEmoji}>🔒</Text>
              </View>
              <View style={styles.introCardText}>
                <Text style={[styles.introCardTitle, { color: colors.indigo }]}>
                  Lock Side
                </Text>
                <Text style={[styles.introCardSubtitle, { color: colors.textMuted }]}>
                  Hard daily limits. No bypass. No excuses.
                </Text>
              </View>
            </View>
            <View style={[styles.introCard, {
              backgroundColor: colors.surface,
              borderColor: colors.amber + '30',
              borderLeftColor: colors.amber,
            }]}>
              <View style={[styles.introCardIcon, { backgroundColor: colors.amber + '15' }]}>
                <Text style={styles.introCardEmoji}>📚</Text>
              </View>
              <View style={styles.introCardText}>
                <Text style={[styles.introCardTitle, { color: colors.amber }]}>
                  Vault Side
                </Text>
                <Text style={[styles.introCardSubtitle, { color: colors.textMuted }]}>
                  Files, books, playlists. One tap away.
                </Text>
              </View>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.indigo }]}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>Get Started →</Text>
          </TouchableOpacity>

          <Text style={[styles.note, { color: colors.textMuted }]}>
            100% local · No accounts · No cloud · No ads
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32, gap: 12 },
  logoContainer: {
    width: 80, height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoEmoji: { fontSize: 38 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: { gap: 16, marginBottom: 24 },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  input: {
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 56,
  },
  errorRow: {
    borderRadius: 8,
    padding: 10,
  },
  errorText: { fontSize: 13, fontWeight: '500' },
  introCards: { gap: 10, marginBottom: 28 },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 12,
    minHeight: 68,
  },
  introCardIcon: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introCardEmoji: { fontSize: 22 },
  introCardText: { flex: 1 },
  introCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  introCardSubtitle: { fontSize: 13, lineHeight: 18 },
  startBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  note: { textAlign: 'center', fontSize: 13, fontStyle: 'italic' },
});