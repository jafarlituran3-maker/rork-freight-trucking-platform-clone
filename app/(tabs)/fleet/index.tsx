import { Truck, User, Calendar, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useFleet } from '@/contexts/FleetContext';

export default function FleetScreen() {
  const router = useRouter();
  const { trucks, drivers } = useFleet();
  const [activeTab, setActiveTab] = useState<'trucks' | 'drivers'>('trucks');

  const availableTrucks = trucks.filter((t) => t.status === 'available');
  const busyTrucks = trucks.filter((t) => t.status === 'busy');
  const maintenanceTrucks = trucks.filter((t) => t.status === 'maintenance');

  const activeDrivers = drivers.filter((d) => d.status === 'active');
  const inactiveDrivers = drivers.filter((d) => d.status === 'inactive');
  const onLeaveDrivers = drivers.filter((d) => d.status === 'on_leave');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'active':
        return Colors.success;
      case 'busy':
        return Colors.warning;
      case 'maintenance':
      case 'inactive':
        return Colors.textSecondary;
      case 'on_leave':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Доступен';
      case 'busy':
        return 'Занят';
      case 'maintenance':
        return 'Обслуживание';
      case 'active':
        return 'Активен';
      case 'inactive':
        return 'Неактивен';
      case 'on_leave':
        return 'В отпуске';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trucks' && styles.tabActive]}
            onPress={() => setActiveTab('trucks')}
            activeOpacity={0.7}
          >
            <Truck size={20} color={activeTab === 'trucks' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'trucks' && styles.tabTextActive]}>
              Транспорт
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'drivers' && styles.tabActive]}
            onPress={() => setActiveTab('drivers')}
            activeOpacity={0.7}
          >
            <User size={20} color={activeTab === 'drivers' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'drivers' && styles.tabTextActive]}>
              Водители
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => router.push('/(tabs)/fleet/schedule')}
          activeOpacity={0.8}
        >
          <Calendar size={20} color={Colors.primary} />
          <Text style={styles.scheduleButtonText}>Расписание</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {activeTab === 'trucks' && (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.success + '15' }]}>
                <Text style={styles.statValue}>{availableTrucks.length}</Text>
                <Text style={styles.statLabel}>Доступны</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.warning + '15' }]}>
                <Text style={styles.statValue}>{busyTrucks.length}</Text>
                <Text style={styles.statLabel}>Заняты</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.textSecondary + '15' }]}>
                <Text style={styles.statValue}>{maintenanceTrucks.length}</Text>
                <Text style={styles.statLabel}>Ремонт</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Парк транспорта</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/fleet/truck/add' as any)}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Добавить</Text>
              </TouchableOpacity>
            </View>

            {trucks.map((truck) => {
              const driver = truck.assignedDriverId
                ? drivers.find((d) => d.id === truck.assignedDriverId)
                : null;

              return (
                <TouchableOpacity
                  key={truck.id}
                  style={styles.card}
                  onPress={() => router.push(`/(tabs)/fleet/truck/${truck.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>{truck.licensePlate}</Text>
                      <Text style={styles.cardSubtitle}>
                        {truck.brand} {truck.model} • {truck.type}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(truck.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(truck.status) }]}>
                        {getStatusText(truck.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Грузоподъемность:</Text>
                      <Text style={styles.detailValue}>{truck.capacity} кг</Text>
                    </View>
                    {truck.mileage && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Пробег:</Text>
                        <Text style={styles.detailValue}>{truck.mileage.toLocaleString()} км</Text>
                      </View>
                    )}
                    {driver && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Водитель:</Text>
                        <Text style={styles.detailValue}>{driver.name}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {activeTab === 'drivers' && (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.success + '15' }]}>
                <Text style={styles.statValue}>{activeDrivers.length}</Text>
                <Text style={styles.statLabel}>Активны</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.primary + '15' }]}>
                <Text style={styles.statValue}>{onLeaveDrivers.length}</Text>
                <Text style={styles.statLabel}>В отпуске</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.textSecondary + '15' }]}>
                <Text style={styles.statValue}>{inactiveDrivers.length}</Text>
                <Text style={styles.statLabel}>Неактивны</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Водители</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/fleet/driver/add' as any)}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Добавить</Text>
              </TouchableOpacity>
            </View>

            {drivers.map((driver) => {
              const truck = driver.assignedTruckId
                ? trucks.find((t) => t.id === driver.assignedTruckId)
                : null;

              return (
                <TouchableOpacity
                  key={driver.id}
                  style={styles.card}
                  onPress={() => router.push(`/(tabs)/fleet/driver/${driver.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{driver.name}</Text>
                      <Text style={styles.cardSubtitle}>{driver.phone}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(driver.status) }]}>
                        {getStatusText(driver.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Права:</Text>
                      <Text style={styles.detailValue}>{driver.licenseNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Действительны до:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(driver.licenseExpiry).toLocaleDateString('ru-RU')}
                      </Text>
                    </View>
                    {truck && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Транспорт:</Text>
                        <Text style={styles.detailValue}>{truck.licensePlate}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
