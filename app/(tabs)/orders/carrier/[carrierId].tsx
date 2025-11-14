import { useLocalSearchParams, Stack } from 'expo-router';
import {
  Star,
  MapPin,
  Truck,
  Phone,
  Mail,
  FileText,
  Package,
  DollarSign,
  Award,
  Building2,
  Navigation,
} from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';

import Colors from '@/constants/colors';
import { mockCarriers } from '@/mocks/vehicle-offers';

export default function CarrierDetailsScreen() {
  const { carrierId } = useLocalSearchParams<{ carrierId: string }>();
  const carrier = mockCarriers.find((c) => c.id === carrierId);

  if (!carrier) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Перевозчик не найден' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Перевозчик не найден</Text>
        </View>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCall = () => {
    if (carrier.phone) {
      Linking.openURL(`tel:${carrier.phone}`);
    } else {
      Alert.alert('Телефон не указан', 'У этого перевозчика не указан номер телефона');
    }
  };

  const handleEmail = () => {
    if (carrier.email) {
      Linking.openURL(`mailto:${carrier.email}`);
    } else {
      Alert.alert('Email не указан', 'У этого перевозчика не указан email');
    }
  };

  const handleContract = () => {
    if (carrier.sampleContract) {
      Linking.openURL(carrier.sampleContract);
    } else {
      Alert.alert('Договор недоступен', 'Образец договора для этого перевозчика недоступен');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: carrier.name,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.carrierIconLarge}>
            <Truck size={48} color={Colors.accent} />
          </View>
          <Text style={styles.carrierNameLarge}>{carrier.name}</Text>
          {carrier.companyName && (
            <View style={styles.companyNameContainer}>
              <Building2 size={16} color={Colors.textSecondary} />
              <Text style={styles.companyName}>{carrier.companyName}</Text>
            </View>
          )}
          <View style={styles.ratingContainer}>
            <Star size={24} color="#FFA500" fill="#FFA500" />
            <Text style={styles.ratingLarge}>{carrier.rating}</Text>
            <Text style={styles.ratingSubtext}>из 5.0</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Award size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{carrier.totalTrips}</Text>
            <Text style={styles.statLabel}>Рейсов выполнено</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.accent} />
            <Text style={styles.statValue}>
              {carrier.averagePrice ? formatPrice(carrier.averagePrice) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Средняя цена</Text>
          </View>
        </View>

        {carrier.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>О компании</Text>
            </View>
            <Text style={styles.description}>{carrier.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Информация о транспорте</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Марка автомобиля:</Text>
            <Text style={styles.infoValue}>{carrier.truckBrand || 'Не указано'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Тип кузова:</Text>
            <Text style={styles.infoValue}>{carrier.truckType || carrier.vehicleType}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Грузоподъемность:</Text>
            <Text style={styles.infoValue}>{carrier.maxCapacity / 1000} тонн</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Объем:</Text>
            <Text style={styles.infoValue}>{carrier.maxVolume} м³</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Регионы работы</Text>
          </View>
          <View style={styles.regionsList}>
            {carrier.availableRegions.map((region, index) => (
              <View key={index} style={styles.regionChip}>
                <Navigation size={14} color={Colors.accent} />
                <Text style={styles.regionText}>{region}</Text>
              </View>
            ))}
          </View>
        </View>

        {carrier.preferredAddresses && carrier.preferredAddresses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Предпочитаемые адреса</Text>
            </View>
            {carrier.preferredAddresses.map((address, index) => (
              <View key={index} style={styles.addressItem}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.addressText}>{address}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Стоимость услуг</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Базовая цена за км:</Text>
            <Text style={styles.infoValue}>{formatPrice(carrier.basePricePerKm)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Комиссия:</Text>
            <Text style={styles.infoValue}>{carrier.commission}%</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall} activeOpacity={0.8}>
            <Phone size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Позвонить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <Mail size={20} color={Colors.accent} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              Написать
            </Text>
          </TouchableOpacity>
        </View>

        {carrier.sampleContract && (
          <TouchableOpacity
            style={styles.contractButton}
            onPress={handleContract}
            activeOpacity={0.8}
          >
            <FileText size={20} color={Colors.accent} />
            <Text style={styles.contractButtonText}>Скачать образец договора</Text>
          </TouchableOpacity>
        )}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Контактная информация</Text>
          {carrier.phone && (
            <View style={styles.contactRow}>
              <Phone size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{carrier.phone}</Text>
            </View>
          )}
          {carrier.email && (
            <View style={styles.contactRow}>
              <Mail size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{carrier.email}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  carrierIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  carrierNameLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  companyNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  ratingSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  regionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  regionText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: '#000',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  actionButtonTextSecondary: {
    color: Colors.accent,
  },
  contractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contractButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  contactSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
  },
});
