import { Link, Stack } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { StyleSheet, View, Text } from 'react-native';

import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Страница не найдена' }} />
      <View style={styles.container}>
        <AlertCircle size={64} color={Colors.error} />
        <Text style={styles.title}>Страница не найдена</Text>
        <Text style={styles.subtitle}>
          Запрошенная страница не существует
        </Text>
        <Link href="/(tabs)/orders" style={styles.link}>
          <Text style={styles.linkText}>Вернуться на главную</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  link: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
    borderRadius: 10,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
