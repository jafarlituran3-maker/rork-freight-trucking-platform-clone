import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Truck, Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useRole } from '@/contexts/RoleContext';

export default function RoleSelectionScreen() {
  const { selectRole } = useRole();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleRoleSelect = async (role: 'carrier' | 'cargo-owner') => {
    console.log('Role selected:', role);
    await selectRole(role);
    router.replace('/(tabs)/orders');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Добро пожаловать</Text>
            <Text style={styles.subtitle}>Выберите роль для продолжения</Text>
          </View>

          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleRoleSelect('carrier')}
              activeOpacity={0.9}
            >
              <View style={styles.iconContainer}>
                <Truck color="#667eea" size={64} strokeWidth={1.5} />
              </View>
              <Text style={styles.cardTitle}>Перевозчик</Text>
              <Text style={styles.cardDescription}>
                Управляйте заказами, отслеживайте транспорт и водителей
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => handleRoleSelect('cargo-owner')}
              activeOpacity={0.9}
            >
              <View style={styles.iconContainer}>
                <Package color="#667eea" size={64} strokeWidth={1.5} />
              </View>
              <Text style={styles.cardTitle}>Грузовладелец</Text>
              <Text style={styles.cardDescription}>
                Создавайте заявки, отслеживайте доставку грузов
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
