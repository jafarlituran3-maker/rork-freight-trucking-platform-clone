import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Truck as TruckIcon,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  MapPin,
} from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

import Colors from '@/constants/colors';
import { useFleet } from '@/contexts/FleetContext';
import { useOrders } from '@/contexts/OrderContext';

export default function DriverDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDriverById, trucks, getDriverSchedules } = useFleet();
  const { orders } = useOrders();

  const driver = getDriverById(id!);
  const truck = driver?.assignedTruckId
    ? trucks.find((t) => t.id === driver.assignedTruckId)
    : null;

  const today = new Date().toISOString().split('T')[0];
  const schedules = driver ? getDriverSchedules(driver.id) : [];
  const todaySchedule = schedules.find((s) => s.date === today);

  const activeOrder = truck?.status === 'busy'
    ? orders.find((o) => o.carrierId === truck.carrierId && (o.status === 'in_transit' || o.status === 'assigned'))
    : null;

  if (!driver) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>Водитель не найден</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.success;
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

  const handleDownloadDocument = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open document:', error);
    }
  };

  const handleCall = async () => {
    try {
      await Linking.openURL(`tel:${driver.phone}`);
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const handleEmail = async () => {
    if (driver.email) {
      try {
        await Linking.openURL(`mailto:${driver.email}`);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    }
  };

  const isLicenseExpiringSoon = () => {
    const expiryDate = new Date(driver.licenseExpiry);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverPhone}>{driver.phone}</Text>
            {driver.email && <Text style={styles.driverEmail}>{driver.email}</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(driver.status) }]}>
              {getStatusText(driver.status)}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall} activeOpacity={0.7}>
            <Phone size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Позвонить</Text>
          </TouchableOpacity>
          {driver.email && (
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail} activeOpacity={0.7}>
              <Mail size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activeOrder && (
        <View style={[styles.section, { backgroundColor: Colors.warning + '10' }]}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={20} color={Colors.warning} />
            <Text style={styles.sectionTitle}>Активный заказ</Text>
          </View>
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/(tabs)/orders/${activeOrder.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Заказ #{activeOrder.id}</Text>
              <Text style={styles.orderRoute}>
                {activeOrder.origin.address} → {activeOrder.destination.address}
              </Text>
              <Text style={styles.orderCargo}>
                {activeOrder.cargoType} • {activeOrder.weight} кг
              </Text>
            </View>
            <Text style={styles.viewOrderText}>Подробнее →</Text>
          </TouchableOpacity>
        </View>
      )}

      {truck && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TruckIcon size={20} color={Colors.text} />
            <Text style={styles.sectionTitle}>Закрепленный транспорт</Text>
          </View>
          <TouchableOpacity
            style={styles.truckCard}
            onPress={() => router.push(`/(tabs)/fleet/truck/${truck.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.truckInfo}>
              <Text style={styles.truckPlate}>{truck.licensePlate}</Text>
              <Text style={styles.truckModel}>
                {truck.brand} {truck.model} • {truck.type}
              </Text>
              <Text style={styles.truckCapacity}>
                Грузоподъемность: {truck.capacity} кг
              </Text>
              {truck.mileage && (
                <View style={styles.truckMileageRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.truckMileage}>
                    Пробег: {truck.mileage.toLocaleString()} км
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.viewTruckText}>Подробнее →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CreditCard size={20} color={Colors.text} />
          <Text style={styles.sectionTitle}>Водительские права</Text>
        </View>
        <View style={styles.licenseCard}>
          <View style={styles.licenseRow}>
            <Text style={styles.licenseLabel}>Номер:</Text>
            <Text style={styles.licenseValue}>{driver.licenseNumber}</Text>
          </View>
          <View style={styles.licenseRow}>
            <Text style={styles.licenseLabel}>Действительны до:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[
                styles.licenseValue,
                isLicenseExpiringSoon() && { color: Colors.warning }
              ]}>
                {new Date(driver.licenseExpiry).toLocaleDateString('ru-RU')}
              </Text>
              {isLicenseExpiringSoon() && (
                <AlertCircle size={16} color={Colors.warning} />
              )}
            </View>
          </View>
          {isLicenseExpiringSoon() && (
            <View style={styles.warningBanner}>
              <AlertCircle size={16} color={Colors.warning} />
              <Text style={styles.warningText}>
                Срок действия прав истекает в ближайшее время
              </Text>
            </View>
          )}
        </View>
      </View>

      {todaySchedule && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.text} />
            <Text style={styles.sectionTitle}>Расписание на сегодня</Text>
          </View>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleRow}>
              <Clock size={18} color={Colors.textSecondary} />
              <Text style={styles.scheduleTime}>
                {todaySchedule.startTime} - {todaySchedule.endTime}
              </Text>
            </View>
            {todaySchedule.notes && (
              <Text style={styles.scheduleNotes}>{todaySchedule.notes}</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={20} color={Colors.text} />
          <Text style={styles.sectionTitle}>Документы</Text>
        </View>

        {driver.documents && driver.documents.length > 0 ? (
          <>
            {driver.documents.map((doc) => {
              const isExpiringSoon = doc.expiryDate
                ? new Date(doc.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                : false;

              return (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docItem}
                  onPress={() => handleDownloadDocument(doc.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.docInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      {isExpiringSoon && (
                        <AlertCircle size={16} color={Colors.warning} />
                      )}
                    </View>
                    {doc.expiryDate && (
                      <Text style={[
                        styles.docExpiry,
                        isExpiringSoon && { color: Colors.warning }
                      ]}>
                        Действителен до: {new Date(doc.expiryDate).toLocaleDateString('ru-RU')}
                      </Text>
                    )}
                    <Text style={styles.docUpload}>
                      Загружен: {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                  <Download size={20} color={Colors.primary} />
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <Text style={styles.noDocuments}>Документы не добавлены</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Статистика</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {schedules.filter((s) => s.status === 'busy').length}
            </Text>
            <Text style={styles.statLabel}>Выполнено рейсов</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {truck?.mileage ? truck.mileage.toLocaleString() : '0'}
            </Text>
            <Text style={styles.statLabel}>Пробег (км)</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
        <Edit size={20} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Редактировать профиль</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  driverName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  driverPhone: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '15',
    borderRadius: 10,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  orderRoute: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  orderCargo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  viewOrderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  truckCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  truckInfo: {
    flex: 1,
  },
  truckPlate: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  truckModel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  truckCapacity: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  truckMileageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  truckMileage: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewTruckText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  licenseCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  licenseLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  licenseValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warning + '15',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '500' as const,
  },
  scheduleCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  scheduleNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  docExpiry: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  docUpload: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noDocuments: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
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
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});
