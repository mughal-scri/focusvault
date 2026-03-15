import { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Take back\nyour time.',
    subtitle: 'Set hard daily limits on distracting apps. Once locked, there is no bypass. No excuses.',
    emoji: '🔒',
    accent: 'indigo' as const,
    tag: 'DISCIPLINE',
  },
  {
    id: 2,
    title: 'Build your\nmind\'s library.',
    subtitle: 'Store files, books, and YouTube playlists. Everything worth keeping, in one place.',
    emoji: '📚',
    accent: 'amber' as const,
    tag: 'GROWTH',
  },
  {
    id: 3,
    title: 'One app.\nTwo purposes.',
    subtitle: 'Discipline and growth, working together. Your focus starts here.',
    emoji: '⚡',
    accent: 'indigo' as const,
    tag: 'FOCUSVAULT',
  },
];

interface Props {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const accentColor = (slide: typeof SLIDES[0]) =>
    slide.accent === 'amber' ? colors.amber : colors.indigo;

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>

      {/* Skip */}
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
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            {/* Tag */}
            <View style={[styles.tagBadge, { backgroundColor: accentColor(slide) + '20' }]}>
              <Text style={[styles.tagText, { color: accentColor(slide) }]}>
                {slide.tag}
              </Text>
            </View>

            {/* Icon Container */}
            <View style={[styles.iconOuter, { borderColor: accentColor(slide) + '30' }]}>
              <View style={[styles.iconInner, { backgroundColor: accentColor(slide) + '15' }]}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
              </View>
            </View>

            {/* Text */}
            <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>
              {slide.title}
            </Text>
            <Text style={[styles.slideSubtitle, { color: colors.textMuted }]}>
              {slide.subtitle}
            </Text>

            {/* Dual accent bar for last slide */}
            {slide.id === 3 && (
              <View style={styles.dualBar}>
                <View style={[styles.dualBarLeft, { backgroundColor: colors.indigo }]} />
                <View style={[styles.dualBarRight, { backgroundColor: colors.amber }]} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
            >
              <View style={[
                styles.dot,
                {
                  backgroundColor: index === currentSlide
                    ? accentColor(SLIDES[currentSlide])
                    : colors.border,
                  width: index === currentSlide ? 28 : 8,
                }
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextBtn, {
            backgroundColor: accentColor(SLIDES[currentSlide]),
          }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started →' : 'Continue →'}
          </Text>
        </TouchableOpacity>

        {/* Back */}
        {currentSlide > 0 && (
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={() => goToSlide(currentSlide - 1)}
          >
            <Text style={[styles.backBtnText, { color: colors.textMuted }]}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    position: 'absolute',
    top: 56, right: 24,
    zIndex: 10,
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipText: { fontSize: 15, fontWeight: '500' },
  scrollView: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  tagBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  iconOuter: {
    width: 140, height: 140,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 112, height: 112,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 52 },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  dualBar: {
    flexDirection: 'row',
    width: 80,
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  dualBarLeft: { flex: 1 },
  dualBarRight: { flex: 1 },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 10,
    alignItems: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  dot: { height: 8, borderRadius: 999 },
  nextBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 15, fontWeight: '500' },
});