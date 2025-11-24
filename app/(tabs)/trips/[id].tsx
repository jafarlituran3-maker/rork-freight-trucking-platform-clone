import {
  Package,
  Truck,
  Phone,
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
} from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import Colors from '@/constants/colors';
import { mockTrips } from '@/mocks/trips';
import { TripStatus } from '@/types';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const trip = mockTrips.find((t) => t.id === id);

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Рейс не найден</Text>
      </View>
    );
  }

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

  const progress = trip.tracking
    ? (trip.tracking.distanceCovered / (trip.tracking.distanceCovered + trip.tracking.distanceRemaining)) * 100
    : 0;

  return (
    <>
      <Stack.Screen options={{ title: `Рейс #${trip.id}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.tripId}>Рейс #{trip.id}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(trip.status) + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                {getStatusLabel(trip.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.orderId}>Заказ #{trip.orderId}</Text>
        </View>

        {trip.status === 'in_transit' && trip.tracking && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Прогресс доставки</Text>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Завершено</Text>
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
            <View style={styles.distanceStats}>
              <View style={styles.distanceStat}>
                <Text style={styles.distanceValue}>{trip.tracking.distanceCovered}</Text>
                <Text style={styles.distanceLabel}>км пройдено</Text>
              </View>
              <View style={styles.distanceStat}>
                <Text style={styles.distanceValue}>{trip.tracking.distanceRemaining}</Text>
                <Text style={styles.distanceLabel}>км осталось</Text>
              </View>
              <View style={styles.distanceStat}>
                <Text style={styles.distanceValue}>{trip.tracking.speed || 0}</Text>
                <Text style={styles.distanceLabel}>км/ч</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Маршрут</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Откуда</Text>
                <Text style={styles.routeAddress}>{trip.origin.address}</Text>
                <Text style={styles.routeContact}>
                  Контакт: {trip.origin.contactName}
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${trip.origin.contactPhone}`)}
                >
                  <Text style={styles.routePhone}>{trip.origin.contactPhone}</Text>
                </TouchableOpacity>
                <Text style={styles.routeTime}>
                  {new Date(trip.schedule.pickupDate).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.routeWindow}>
                  Окно: {trip.schedule.pickupTimeWindow}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Куда</Text>
                <Text style={styles.routeAddress}>{trip.destination.address}</Text>
                <Text style={styles.routeContact}>
                  Контакт: {trip.destination.contactName}
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${trip.destination.contactPhone}`)}
                >
                  <Text style={styles.routePhone}>{trip.destination.contactPhone}</Text>
                </TouchableOpacity>
                <Text style={styles.routeTime}>
                  {new Date(trip.schedule.deliveryDate).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.routeWindow}>
                  Окно: {trip.schedule.deliveryTimeWindow}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Package size={20} color={Colors.accent} />
            <Text style={styles.cardTitle}>Информация о грузе</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Тип груза</Text>
              <Text style={styles.infoValue}>{trip.cargo.type}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Вес</Text>
              <Text style={styles.infoValue}>{trip.cargo.weight} кг</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Объем</Text>
              <Text style={styles.infoValue}>{trip.cargo.volume} м³</Text>
            </View>
            {trip.cargo.packageCount && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Количество мест</Text>
                <Text style={styles.infoValue}>{trip.cargo.packageCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cargoDescription}>{trip.cargo.description}</Text>
          {trip.cargo.specialRequirements && trip.cargo.specialRequirements.length > 0 && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Особые требования:</Text>
              {trip.cargo.specialRequirements.map((req, index) => (
                <Text key={index} style={styles.requirementItem}>
                  • {req}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Truck size={20} color={Colors.accent} />
            <Text style={styles.cardTitle}>Информация о перевозчике</Text>
          </View>
          <View style={styles.carrierInfo}>
            <Text style={styles.carrierCompany}>{trip.carrier.companyName}</Text>
            <View style={styles.carrierDetails}>
              <View style={styles.carrierRow}>
                <Text style={styles.carrierLabel}>Водитель:</Text>
                <Text style={styles.carrierValue}>{trip.carrier.driverName}</Text>
              </View>
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={() => Linking.openURL(`tel:${trip.carrier.driverPhone}`)}
              >
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.phoneButtonText}>{trip.carrier.driverPhone}</Text>
              </TouchableOpacity>
              <View style={styles.carrierRow}>
                <Text style={styles.carrierLabel}>Транспорт:</Text>
                <Text style={styles.carrierValue}>
                  {trip.carrier.vehicleModel} ({trip.carrier.vehiclePlate})
                </Text>
              </View>
              <View style={styles.carrierRow}>
                <Text style={styles.carrierLabel}>Тип:</Text>
                <Text style={styles.carrierValue}>{trip.carrier.vehicleType}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <DollarSign size={20} color={Colors.accent} />
            <Text style={styles.cardTitle}>Финансовая информация</Text>
          </View>
          <View style={styles.financialInfo}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Стоимость:</Text>
              <Text style={styles.financialValue}>
                {trip.financial.totalPrice.toLocaleString('ru-RU')} {trip.financial.currency}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Оплачено:</Text>
              <Text style={styles.financialValue}>
                {trip.financial.paidAmount.toLocaleString('ru-RU')} {trip.financial.currency}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Способ оплаты:</Text>
              <Text style={styles.financialValue}>{trip.financial.paymentMethod}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Статус оплаты:</Text>
              <View
                style={[
                  styles.paymentBadge,
                  {
                    backgroundColor:
                      (trip.financial.paymentStatus === 'payment_confirmed' || trip.financial.paymentStatus === 'payment_released') ? '#4CAF5020' : '#FF980020',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.paymentStatus,
                    {
                      color:
                        (trip.financial.paymentStatus === 'payment_confirmed' || trip.financial.paymentStatus === 'payment_released') ? '#4CAF50' : '#FF9800',
                    },
                  ]}
                >
                  {(trip.financial.paymentStatus === 'payment_confirmed' || trip.financial.paymentStatus === 'payment_released')
                    ? 'Оплачено'
                    : trip.financial.paymentStatus === 'payment_hold'
                      ? 'Обработка'
                      : 'Ожидает оплаты'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {trip.milestones && trip.milestones.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Clock size={20} color={Colors.accent} />
              <Text style={styles.cardTitle}>История рейса</Text>
            </View>
            <View style={styles.milestonesContainer}>
              {trip.milestones.map((milestone, index) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={styles.milestoneIcon}>
                    {index === trip.milestones!.length - 1 ? (
                      <CheckCircle size={20} color={Colors.success} />
                    ) : (
                      <Clock size={20} color={Colors.textSecondary} />
                    )}
                  </View>
                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneType}>
                      {milestone.type === 'pickup_started'
                        ? 'Начало погрузки'
                        : milestone.type === 'pickup_completed'
                          ? 'Погрузка завершена'
                          : milestone.type === 'in_transit'
                            ? 'В пути'
                            : milestone.type === 'delivery_started'
                              ? 'Начало разгрузки'
                              : 'Доставка завершена'}
                    </Text>
                    <Text style={styles.milestoneTime}>
                      {new Date(milestone.timestamp).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {milestone.location && (
                      <Text style={styles.milestoneLocation}>
                        {milestone.location.address}
                      </Text>
                    )}
                    {milestone.notes && (
                      <Text style={styles.milestoneNotes}>{milestone.notes}</Text>
                    )}
                  </View>
                  {index < trip.milestones!.length - 1 && (
                    <View style={styles.milestoneLine} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {(trip.documents.contract ||
          trip.documents.waybill ||
          trip.documents.upd ||
          trip.documents.invoice ||
          trip.documents.consignmentNote) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FileText size={20} color={Colors.accent} />
              <Text style={styles.cardTitle}>Документы</Text>
            </View>
            <View style={styles.documentsContainer}>
              {trip.documents.contract && (
                <TouchableOpacity style={styles.documentItem}>
                  <FileText size={18} color={Colors.primary} />
                  <Text style={styles.documentName}>Договор</Text>
                </TouchableOpacity>
              )}
              {trip.documents.waybill && (
                <TouchableOpacity style={styles.documentItem}>
                  <FileText size={18} color={Colors.primary} />
                  <Text style={styles.documentName}>Транспортная накладная</Text>
                </TouchableOpacity>
              )}
              {trip.documents.upd && (
                <TouchableOpacity style={styles.documentItem}>
                  <FileText size={18} color={Colors.primary} />
                  <Text style={styles.documentName}>УПД</Text>
                </TouchableOpacity>
              )}
              {trip.documents.invoice && (
                <TouchableOpacity style={styles.documentItem}>
                  <FileText size={18} color={Colors.primary} />
                  <Text style={styles.documentName}>Счет-фактура</Text>
                </TouchableOpacity>
              )}
              {trip.documents.consignmentNote && (
                <TouchableOpacity style={styles.documentItem}>
                  <FileText size={18} color={Colors.primary} />
                  <Text style={styles.documentName}>Товарная накладная</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: Colors.error,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripId: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  orderId: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  distanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  distanceStat: {
    alignItems: 'center',
  },
  distanceValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  distanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  routeContainer: {
    gap: 0,
  },
  routePoint: {
    flexDirection: 'row',
    gap: 12,
  },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  routeContact: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  routePhone: {
    fontSize: 14,
    color: Colors.accent,
    marginBottom: 4,
  },
  routeTime: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  routeWindow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  routeLine: {
    width: 2,
    height: 32,
    backgroundColor: Colors.border,
    marginLeft: 6,
    marginVertical: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cargoDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  requirementsContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  carrierInfo: {
    gap: 12,
  },
  carrierCompany: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 8,
  },
  carrierDetails: {
    gap: 8,
  },
  carrierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  carrierLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  carrierValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 10,
  },
  phoneButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  financialInfo: {
    gap: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  financialLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentStatus: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  milestonesContainer: {
    gap: 0,
  },
  milestoneItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  milestoneIcon: {
    width: 40,
    alignItems: 'center',
    paddingTop: 4,
  },
  milestoneContent: {
    flex: 1,
    paddingBottom: 20,
  },
  milestoneType: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  milestoneTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  milestoneLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  milestoneNotes: {
    fontSize: 13,
    color: Colors.text,
    fontStyle: 'italic',
  },
  milestoneLine: {
    position: 'absolute',
    left: 19,
    top: 28,
    width: 2,
    height: '100%',
    backgroundColor: Colors.border,
  },
  documentsContainer: {
    gap: 10,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
});
