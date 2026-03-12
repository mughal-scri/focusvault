import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

export default function LockerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Locker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.textPrimary, fontSize: 20 },
});