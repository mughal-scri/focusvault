import { useEffect, useRef } from 'react';
import {
  View, Text, Modal, StyleSheet, Animated, Dimensions
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  appName: string;
  onFinish: () => void;
}

export default function LockAnimation({ visible, appName, onFinish }: Props) {
  const { colors } = useTheme();

  const iconScale = useRef(new Animated.Value(0.6)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const chain1Opacity = useRef(new Animated.Value(0)).current;
  const chain2Opacity = useRef(new Animated.Value(0)).current;
  const chain3Opacity = useRef(new Animated.Value(0)).current;
  const chain4Opacity = useRef(new Animated.Value(0)).current;
  const lockScale = useRef(new Animated.Value(0)).current;
  const lockOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Reset all values
    iconScale.setValue(0.6);
    iconOpacity.setValue(0);
    chain1Opacity.setValue(0);
    chain2Opacity.setValue(0);
    chain3Opacity.setValue(0);
    chain4Opacity.setValue(0);
    lockScale.setValue(0);
    lockOpacity.setValue(0);
    overlayOpacity.setValue(0);
    textOpacity.setValue(0);

    Animated.sequence([
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
      // App icon appears
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      // Chains appear one by one
      Animated.stagger(120, [
        Animated.timing(chain1Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(chain2Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(chain3Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(chain4Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(150),
      // Lock snaps into center
      Animated.parallel([
        Animated.spring(lockScale, {
          toValue: 1, tension: 80, friction: 6, useNativeDriver: true,
        }),
        Animated.timing(lockOpacity, {
          toValue: 1, duration: 200, useNativeDriver: true,
        }),
      ]),
      // Text appears
      Animated.timing(textOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
      Animated.delay(800),
      // Everything fades out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0, duration: 400, useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0, duration: 300, useNativeDriver: true,
        }),
      ]),
    ]).start(() => onFinish());
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <View style={styles.content}>

          {/* Chain ring container */}
          <View style={styles.chainRing}>
            {/* Chain links around the icon */}
            <Animated.View style={[
              styles.chainLink, styles.chainTop,
              { opacity: chain1Opacity, borderColor: colors.indigo }
            ]} />
            <Animated.View style={[
              styles.chainLink, styles.chainRight,
              { opacity: chain2Opacity, borderColor: colors.indigo }
            ]} />
            <Animated.View style={[
              styles.chainLink, styles.chainBottom,
              { opacity: chain3Opacity, borderColor: colors.indigo }
            ]} />
            <Animated.View style={[
              styles.chainLink, styles.chainLeft,
              { opacity: chain4Opacity, borderColor: colors.indigo }
            ]} />

            {/* Diagonal chain lines */}
            <Animated.View style={[
              styles.chainDiag, styles.chainDiagTR,
              { opacity: chain2Opacity, backgroundColor: colors.indigo }
            ]} />
            <Animated.View style={[
              styles.chainDiag, styles.chainDiagBL,
              { opacity: chain3Opacity, backgroundColor: colors.indigo }
            ]} />

            {/* App Icon */}
            <Animated.View style={[
              styles.appIconContainer,
              {
                backgroundColor: colors.indigoDeep,
                opacity: iconOpacity,
                transform: [{ scale: iconScale }],
              }
            ]}>
              <Text style={styles.appIconText}>{appName.charAt(0)}</Text>
            </Animated.View>

            {/* Lock icon in center */}
            <Animated.View style={[
              styles.lockContainer,
              {
                opacity: lockOpacity,
                transform: [{ scale: lockScale }],
              }
            ]}>
              <Text style={styles.lockIcon}>🔒</Text>
            </Animated.View>
          </View>

          {/* Text */}
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={[styles.lockedText, { color: '#FFFFFF' }]}>
              {appName}
            </Text>
            <Text style={[styles.lockedSubtext, { color: 'rgba(255,255,255,0.7)' }]}>
              has been locked 🔒
            </Text>
          </Animated.View>

        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 32,
  },
  chainRing: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chainLink: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 6,
  },
  chainTop: {
    width: 40, height: 16,
    top: 8, left: '50%', marginLeft: -20,
  },
  chainRight: {
    width: 16, height: 40,
    right: 8, top: '50%', marginTop: -20,
  },
  chainBottom: {
    width: 40, height: 16,
    bottom: 8, left: '50%', marginLeft: -20,
  },
  chainLeft: {
    width: 16, height: 40,
    left: 8, top: '50%', marginTop: -20,
  },
  chainDiag: {
    position: 'absolute',
    width: 3,
    height: 50,
    borderRadius: 999,
  },
  chainDiagTR: {
    top: 20, right: 28,
    transform: [{ rotate: '45deg' }],
  },
  chainDiagBL: {
    bottom: 20, left: 28,
    transform: [{ rotate: '45deg' }],
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lockContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { fontSize: 22 },
  textContainer: { alignItems: 'center', gap: 6 },
  lockedText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  lockedSubtext: {
    fontSize: 16,
    fontWeight: '400',
  },
});