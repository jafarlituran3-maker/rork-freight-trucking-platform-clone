import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Truck as TruckIcon,
  User,
  Calendar,
  MapPin,
  Fuel,
  Gauge,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
} from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

import Colors from '@/constants/colors';
import { useFleet } from '@/contexts/FleetContext';
import { useOrders } from '@/contexts/OrderContext';

export default function TruckDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTruckById, drivers } = useFleet();
  const { orders } = useOrders();

  const truck = getTruckById(id!);
  const driver = truck?.assignedDriverId
    ? drivers.find((d) => d.id === truck.assignedDriverId)
    : null;

  const activeOrder = truck?.status === 'busy'
    ? orders.find((o) => o.carrierId === truck.carrierId && (o.status === 'in_transit' || o.status === 'assigned'))
    : null;

  if (!truck) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>Транспорт не найден</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return Colors.success;
      case 'busy':
        return Colors.warning;
      case 'maintenance':
        return Colors.textSecondary;
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.licensePlate}>{truck.licensePlate}</Text>
            <Text style={styles.vehicleInfo}>
              {truck.brand} {truck.model} {truck.year ? `(${truck.year})` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(truck.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(truck.status) }]}>
              {getStatusText(truck.status)}
            </Text>
          </View>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Характеристики</Text>
        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <View style={styles.specIcon}>
              <TruckIcon size={24} color={Colors.primary} />
            </View>
            <Text style={styles.specLabel}>Тип</Text>
            <Text style={styles.specValue}>{truck.type}</Text>
          </View>

          <View style={styles.specItem}>
            <View style={styles.specIcon}>
              <Gauge size={24} color={Colors.primary} />
            </View>
            <Text style={styles.specLabel}>Грузоподъемность</Text>
            <Text style={styles.specValue}>{truck.capacity} кг</Text>
          </View>

          {truck.fuelType && (
            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <Fuel size={24} color={Colors.primary} />
              </View>
              <Text style={styles.specLabel}>Топливо</Text>
              <Text style={styles.specValue}>
                {truck.fuelType === 'diesel' ? 'Дизель' :
                 truck.fuelType === 'gasoline' ? 'Бензин' :
                 truck.fuelType === 'electric' ? 'Электро' : 'Гибрид'}
              </Text>
            </View>
          )}

          {truck.mileage && (
            <View style={styles.specItem}>
              <View style={styles.specIcon}>
                <MapPin size={24} color={Colors.primary} />
              </View>
              <Text style={styles.specLabel}>Пробег</Text>
              <Text style={styles.specValue}>{truck.mileage.toLocaleString()} км</Text>
            </View>
          )}
        </View>
      </View>

      {driver && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.text} />
            <Text style={styles.sectionTitle}>Закрепленный водитель</Text>
          </View>
          <TouchableOpacity
            style={styles.driverCard}
            onPress={() => router.push(`/(tabs)/fleet/driver/${driver.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverPhone}>{driver.phone}</Text>
              <Text style={styles.driverLicense}>Права: {driver.licenseNumber}</Text>
            </View>
            <Text style={styles.viewDriverText}>Профиль →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={Colors.text} />
          <Text style={styles.sectionTitle}>Обслуживание</Text>
        </View>
        <View style={styles.maintenanceGrid}>
          {truck.lastMaintenance && (
            <View style={styles.maintenanceItem}>
              <View style={styles.maintenanceIcon}>
                <CheckCircle size={20} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.maintenanceLabel}>Последнее</Text>
                <Text style={styles.maintenanceValue}>
                  {new Date(truck.lastMaintenance).toLocaleDateString('ru-RU')}
                </Text>
              </View>
            </View>
          )}

          {truck.nextMaintenance && (
            <View style={styles.maintenanceItem}>
              <View style={styles.maintenanceIcon}>
                <Clock size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.maintenanceLabel}>Следующее</Text>
                <Text style={styles.maintenanceValue}>
                  {new Date(truck.nextMaintenance).toLocaleDateString('ru-RU')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={20} color={Colors.text} />
          <Text style={styles.sectionTitle}>Документы и сертификаты</Text>
        </View>

        {truck.insuranceExpiry && (
          <View style={styles.docItem}>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>Страховка</Text>
              <Text style={styles.docExpiry}>
                Действительна до: {new Date(truck.insuranceExpiry).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </View>
        )}

        {truck.registrationExpiry && (
          <View style={styles.docItem}>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>Регистрация</Text>
              <Text style={styles.docExpiry}>
                Действительна до: {new Date(truck.registrationExpiry).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </View>
        )}

        {truck.documents && truck.documents.length > 0 && (
          <>
            {truck.documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docItem}
                onPress={() => handleDownloadDocument(doc.url)}
                activeOpacity={0.7}
              >
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  {doc.expiryDate && (
                    <Text style={styles.docExpiry}>
                      Действителен до: {new Date(doc.expiryDate).toLocaleDateString('ru-RU')}
                    </Text>
                  )}
                  <Text style={styles.docUpload}>
                    Загружен: {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <Download size={20} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {(!truck.documents || truck.documents.length === 0) &&
         !truck.insuranceExpiry &&
         !truck.registrationExpiry && (
          <Text style={styles.noDocuments}>Документы не добавлены</Text>
        )}
      </View>

      {truck.currentLocation && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.text} />
            <Text style={styles.sectionTitle}>Текущее местоположение</Text>
          </View>
          <Text style={styles.locationText}>
            {truck.currentLocation.lat.toFixed(4)}, {truck.currentLocation.lng.toFixed(4)}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
        <Edit size={20} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Редактировать</Text>
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
  },
  licensePlate: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: 1,
  },
  vehicleInfo: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
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
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specItem: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  specIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  specValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
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
  driverCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  driverLicense: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewDriverText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  maintenanceGrid: {
    gap: 12,
  },
  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  maintenanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintenanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  maintenanceValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
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
  locationText: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: 'monospace',
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
