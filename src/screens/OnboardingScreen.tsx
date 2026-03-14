import { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Take back your time.',
    subtitle: 'Set hard daily limits on distracting apps. Once locked, there is no bypass. No excuses.',
    emoji: '🔒',
    accent: '#6366F1',
  },
  {
    id: 2,
    title: 'Build your mind\'s library.',
    subtitle: 'Store files, books, and YouTube playlists. Everything worth keeping, in one place.',
    emoji: '📚',
    accent: '#F59E0B',
  },
  {
    id: 3,
    title: 'One app. Two purposes.',
    subtitle: 'Discipline and growth, working together. Your focus starts here.',
    emoji: '⚡',
    accent: '#6366F1',
  },
];

interface Props {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: slide.accent + '20', borderColor: slide.accent + '40' }]}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>

            {/* Content */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {slide.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {slide.subtitle}
            </Text>

            {/* Diagonal accent line */}
            {index === 2 && (
              <View style={styles.dualAccent}>
                <View style={[styles.accentLeft, { backgroundColor: colors.indigo }]} />
                <View style={[styles.accentRight, { backgroundColor: colors.amber }]} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
            >
              <View style={[
                styles.dot,
                {
                  backgroundColor: index === currentSlide
                    ? SLIDES[currentSlide].accent
                    : colors.border,
                  width: index === currentSlide ? 24 : 8,
                }
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: SLIDES[currentSlide].accent }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Previous button */}
        {currentSlide > 0 && (
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={() => goToSlide(currentSlide - 1)}
          >
            <Text style={[styles.prevBtnText, { color: colors.textMuted }]}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10, padding: 8 },
  skipText: { fontSize: 15, fontWeight: '500' },
  scrollView: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
  },
  emoji: { fontSize: 56 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  dualAccent: {
    flexDirection: 'row',
    marginTop: 32,
    height: 4,
    width: 120,
    borderRadius: 999,
    overflow: 'hidden',
  },
  accentLeft: { flex: 1 },
  accentRight: { flex: 1 },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dot: { height: 8, borderRadius: 999 },
  nextBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  prevBtn: { padding: 8 },
  prevBtnText: { fontSize: 15 },
});