import { Truck, Package, Clock, CheckCircle, Filter, Map } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { mockTrips } from '@/mocks/trips';
import { Trip, TripStatus } from '@/types';

export default function TripsScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<'all' | TripStatus>('all');

  const filteredTrips = mockTrips.filter((trip) => {
    if (selectedStatus === 'all') return true;
    return trip.status === selectedStatus;
  });

  const currentTrips = filteredTrips.filter(
    (trip) => trip.status === 'scheduled' || trip.status === 'loading' || trip.status === 'in_transit' || trip.status === 'unloading'
  );

  const completedTrips = filteredTrips.filter((trip) => trip.status === 'completed' || trip.status === 'cancelled');

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'scheduled':
        return Colors.info;
      case 'loading':
        return '#FF9800';
      case 'in_transit':
        return Colors.primary;
      case 'unloading':
        return '#9C27B0';
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: TripStatus) => {
    switch (status) {
      case 'scheduled':
        return 'Запланирован';
      case 'loading':
        return 'Погрузка';
      case 'in_transit':
        return 'В пути';
      case 'unloading':
        return 'Разгрузка';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: TripStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} color={getStatusColor(status)} />;
      case 'in_transit':
        return <Truck size={18} color={getStatusColor(status)} />;
      case 'scheduled':
        return <Clock size={18} color={getStatusColor(status)} />;
      default:
        return <Package size={18} color={getStatusColor(status)} />;
    }
  };

  const renderTripCard = ({ item }: { item: Trip }) => {
    const progress = item.tracking
      ? (item.tracking.distanceCovered / (item.tracking.distanceCovered + item.tracking.distanceRemaining)) * 100
      : 0;

    return (
      <TouchableOpacity
        style={styles.tripCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/trips/${item.id}` as any)}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripIdContainer}>
            <Text style={styles.tripId}>Рейс #{item.id}</Text>
            <Text style={styles.orderId}>Заказ #{item.orderId}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}
          >
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Откуда</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>
                {item.origin.address}
              </Text>
              <Text style={styles.routeDate}>
                {new Date(item.schedule.pickupDate).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Куда</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>
                {item.destination.address}
              </Text>
              <Text style={styles.routeDate}>
                {new Date(item.schedule.deliveryDate).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>

        {item.status === 'in_transit' && item.tracking && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Прогресс доставки</Text>
              <Text style={styles.progressValue}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: Colors.primary },
                ]}
              />
            </View>
            <View style={styles.distanceInfo}>
              <Text style={styles.distanceText}>
                Пройдено: {item.tracking.distanceCovered} км
              </Text>
              <Text style={styles.distanceText}>
                Осталось: {item.tracking.distanceRemaining} км
              </Text>
            </View>
          </View>
        )}

        <View style={styles.cargoInfo}>
          <View style={styles.cargoItem}>
            <Package size={16} color={Colors.textSecondary} />
            <Text style={styles.cargoText}>{item.cargo.type}</Text>
          </View>
          <View style={styles.cargoItem}>
            <Text style={styles.cargoText}>
              {item.cargo.weight} кг • {item.cargo.volume} м³
            </Text>
          </View>
        </View>

        <View style={styles.carrierInfo}>
          <Truck size={16} color={Colors.accent} />
          <Text style={styles.carrierText}>{item.carrier.companyName}</Text>
          <Text style={styles.carrierDriver}>{item.carrier.driverName}</Text>
        </View>

        <View style={styles.financialInfo}>
          <Text style={styles.priceLabel}>Стоимость:</Text>
          <Text style={styles.priceValue}>
            {item.financial.totalPrice.toLocaleString('ru-RU')} {item.financial.currency}
          </Text>
          <View
            style={[
              styles.paymentBadge,
              { backgroundColor: item.financial.paymentStatus === 'paid' ? '#4CAF5020' : '#FF980020' },
            ]}
          >
            <Text
              style={[
                styles.paymentStatus,
                { color: item.financial.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' },
              ]}
            >
              {item.financial.paymentStatus === 'paid' ? 'Оплачено' : item.financial.paymentStatus === 'processing' ? 'Обработка' : 'Ожидает оплаты'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const statuses: { value: 'all' | TripStatus; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'scheduled', label: 'Запланированные' },
    { value: 'in_transit', label: 'В пути' },
    { value: 'completed', label: 'Завершенные' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentTrips.length}</Text>
              <Text style={styles.statLabel}>Активные</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedTrips.length}</Text>
              <Text style={styles.statLabel}>Завершенные</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.mapButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/trips/map' as any)}
          >
            <Map size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Filter size={16} color={Colors.textSecondary} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.filterButton,
                  selectedStatus === status.value && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedStatus(status.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedStatus === status.value && styles.filterButtonTextActive,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {currentTrips.length > 0 && selectedStatus === 'all' && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Текущие рейсы</Text>
        </View>
      )}

      <FlatList
        data={selectedStatus === 'all' ? currentTrips : filteredTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderTripCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Truck size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Рейсы не найдены</Text>
            <Text style={styles.emptySubtext}>
              Ваши рейсы будут отображаться здесь
            </Text>
          </View>
        }
        ListFooterComponent={
          selectedStatus === 'all' && completedTrips.length > 0 ? (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Завершенные рейсы</Text>
              </View>
              {completedTrips.map((trip) => (
                <View key={trip.id}>{renderTripCard({ item: trip })}</View>
              ))}
            </View>
          ) : null
        }
      />
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
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  mapButton: {
    backgroundColor: Colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  filterContent: {
    gap: 8,
    paddingLeft: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tripIdContainer: {
    flex: 1,
  },
  tripId: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  orderId: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  routeDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  distanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cargoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cargoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cargoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  carrierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  carrierText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  carrierDriver: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  financialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
