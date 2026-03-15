import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  message: string;
  visible: boolean;
  type?: 'success' | 'info' | 'error';
  onHide: () => void;
}

export default function Toast({ message, visible, type = 'info', onHide }: Props) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor =
    type === 'success' ? colors.success :
    type === 'error' ? colors.destructive :
    colors.indigo;

  const icon =
    type === 'success' ? '✓' :
    type === 'error' ? '✕' : 'ℹ';

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: bgColor,
        transform: [{ translateY }],
        opacity,
      }
    ]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  icon: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  message: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', flex: 1 },
});