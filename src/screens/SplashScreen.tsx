import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const { colors } = useTheme();
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1, tension: 55, friction: 8, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.spring(glowScale, {
          toValue: 1, tension: 40, friction: 10, useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1, duration: 350, useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glow effects */}
      <Animated.View style={[
        styles.glowIndigo,
        { transform: [{ scale: glowScale }] }
      ]} />
      <Animated.View style={[
        styles.glowAmber,
        { transform: [{ scale: glowScale }] }
      ]} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoWrapper,
        {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }
      ]}>
        <View style={[styles.logoShadow, { shadowColor: colors.indigo }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.Text style={[
        styles.appName,
        { color: colors.textPrimary, opacity: textOpacity }
      ]}>
        FocusVault
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[
        styles.tagline,
        { color: colors.textMuted, opacity: taglineOpacity }
      ]}>
        Block distractions. Feed your mind.
      </Animated.Text>

      {/* Bottom Brand */}
      <Animated.View style={[styles.bottomBrand, { opacity: taglineOpacity }]}>
        <View style={[styles.brandDivider, { backgroundColor: colors.indigo }]} />
        <Text style={[styles.brandText, { color: colors.textMuted }]}>
          Stay disciplined.
        </Text>
        <View style={[styles.brandDivider, { backgroundColor: colors.amber }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  glowIndigo: {
    position: 'absolute',
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: '#6366F1',
    opacity: 0.07,
    left: -60, top: '25%',
  },
  glowAmber: {
    position: 'absolute',
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: '#F59E0B',
    opacity: 0.07,
    right: -60, top: '32%',
  },
  logoWrapper: { marginBottom: 8 },
  logoShadow: {
    elevation: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    borderRadius: 28,
  },
  logo: {
    width: 110, height: 110,
    borderRadius: 28,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  bottomBrand: {
    position: 'absolute',
    bottom: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandDivider: { width: 24, height: 2, borderRadius: 999 },
  brandText: { fontSize: 12, letterSpacing: 1.5, fontWeight: '600' },
});