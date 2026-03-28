import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  MapPin,
  Package,
  TrendingUp,
  Calendar,
  Send,
  Info,
  Building,
  User,
  Phone,
  Mail,
  Star,
  Truck,
  FileText,
  Shield,
  Clock,
  MapPinned,
  ChevronRight,
} from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Colors from '@/constants/colors';
import { mockCarrierAds } from '@/mocks/carrier-ads';

export default function CarrierAdDetailsScreen() {
  const { adId } = useLocalSearchParams<{ adId: string }>();
  
  const ad = mockCarrierAds.find((item) => item.id === adId);

  if (!ad) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Объявление не найдено',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.surface,
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        <View style={styles.errorContainer}>
          <Package size={64} color={Colors.textSecondary} />
          <Text style={styles.errorText}>Объявление не найдено</Text>
        </View>
      </View>
    );
  }

  const handleSubmitRequest = () => {
    console.log('[CarrierAdDetailsScreen] Opening create request for ad:', ad.id);
    Alert.alert(
      'Отправить заявку',
      `Вы хотите отправить заявку перевозчику ${ad.carrierCompany.name}?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Отправить',
          onPress: () => {
            router.push({
              pathname: '/trips/create-request' as any,
              params: {
                carrierId: ad.carrierId,
                carrierName: ad.carrierCompany.name,
                prefilledFrom: ad.availableFrom.city,
                prefilledTo: ad.availableTo.city,
              },
            });
          },
        },
      ]
    );
  };

  const renderRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Star size={18} color={Colors.warning} fill={Colors.warning} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Детальная информация',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.surface,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.companyHeader}>
            <View style={styles.companyNameRow}>
              <Building size={20} color={Colors.primary} />
              <Text style={styles.companyName}>{ad.carrierCompany.name}</Text>
            </View>
            {renderRating(ad.carrierRating)}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Truck size={20} color={Colors.textSecondary} />
              <Text style={styles.statValue}>{ad.totalTripsCompleted}</Text>
              <Text style={styles.statLabel}>рейсов</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={20} color={Colors.textSecondary} />
              <Text style={styles.statValue}>
                {new Date(ad.createdAt).getFullYear()}
              </Text>
              <Text style={styles.statLabel}>работает с</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Shield size={20} color={Colors.textSecondary} />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>надежность</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Маршрут</Text>
          <View style={styles.routeCard}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotStart]} />
              <View style={styles.routePointInfo}>
                <Text style={styles.routeLabel}>Откуда</Text>
                <Text style={styles.routeCity}>{ad.availableFrom.city}</Text>
                <Text style={styles.routeAddress}>{ad.availableFrom.address}</Text>
              </View>
            </View>

            <View style={styles.routeConnector}>
              <View style={styles.routeConnectorLine} />
              <View style={styles.routeInfoBox}>
                <MapPinned size={14} color={Colors.textSecondary} />
                <Text style={styles.routeDistance}>{ad.distance} км</Text>
              </View>
            </View>

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotEnd]} />
              <View style={styles.routePointInfo}>
                <Text style={styles.routeLabel}>Куда</Text>
                <Text style={styles.routeCity}>{ad.availableTo.city}</Text>
                <Text style={styles.routeAddress}>{ad.availableTo.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.availabilityBox}>
            <Calendar size={18} color={Colors.accent} />
            <View style={styles.availabilityInfo}>
              <Text style={styles.availabilityLabel}>Доступен с</Text>
              <Text style={styles.availabilityDate}>
                {new Date(ad.availableDate).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Транспортное средство</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <Truck size={24} color={Colors.primary} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleBrand}>
                  {ad.truckInfo.brand} {ad.truckInfo.model}
                </Text>
                <Text style={styles.vehiclePlate}>{ad.truckInfo.plateNumber}</Text>
              </View>
            </View>

            <View style={styles.vehicleSpecs}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Грузоподъемность</Text>
                <Text style={styles.specValue}>{ad.truckInfo.loadCapacity} т</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Объем</Text>
                <Text style={styles.specValue}>{ad.truckInfo.volume} м³</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Тип</Text>
                <Text style={styles.specValue}>{ad.truckInfo.type}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Год выпуска</Text>
                <Text style={styles.specValue}>{ad.truckInfo.year}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Стоимость услуг</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Средняя цена за рейс:</Text>
              <Text style={styles.priceValue}>
                {ad.averagePrice.toLocaleString('ru-RU')} ₽
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Цена за километр:</Text>
              <Text style={styles.priceValue}>
                {ad.pricePerKm.toLocaleString('ru-RU')} ₽/км
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Стоимость данного маршрута:</Text>
              <Text style={[styles.priceValue, styles.priceValueHighlight]}>
                {(ad.pricePerKm * ad.distance).toLocaleString('ru-RU')} ₽
              </Text>
            </View>
          </View>
        </View>

        {ad.detailedDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>О перевозчике</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{ad.detailedDescription}</Text>
            </View>
          </View>
        )}

        {ad.specialCapabilities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Особые возможности</Text>
            <View style={styles.capabilitiesCard}>
              <Info size={18} color={Colors.accent} />
              <Text style={styles.capabilitiesText}>{ad.specialCapabilities}</Text>
            </View>
          </View>
        )}

        {ad.preferredRegions && ad.preferredRegions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Предпочитаемые регионы</Text>
            <View style={styles.regionsCard}>
              {ad.preferredRegions.map((region, index) => (
                <View key={index} style={styles.regionTag}>
                  <MapPin size={12} color={Colors.primary} />
                  <Text style={styles.regionText}>{region}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <User size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{ad.carrierCompany.managerName}</Text>
            </View>
            <View style={styles.contactRow}>
              <Phone size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{ad.carrierCompany.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Mail size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{ad.carrierCompany.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Реквизиты компании</Text>
          <View style={styles.requisitesCard}>
            <View style={styles.requisiteRow}>
              <Text style={styles.requisiteLabel}>Наименование:</Text>
              <Text style={styles.requisiteValue}>{ad.carrierCompany.name}</Text>
            </View>
            <View style={styles.requisiteRow}>
              <Text style={styles.requisiteLabel}>ИНН:</Text>
              <Text style={styles.requisiteValue}>{ad.carrierCompany.inn}</Text>
            </View>
            {ad.carrierCompany.kpp && (
              <View style={styles.requisiteRow}>
                <Text style={styles.requisiteLabel}>КПП:</Text>
                <Text style={styles.requisiteValue}>{ad.carrierCompany.kpp}</Text>
              </View>
            )}
            <View style={styles.requisiteRow}>
              <Text style={styles.requisiteLabel}>ОГРН:</Text>
              <Text style={styles.requisiteValue}>{ad.carrierCompany.ogrn}</Text>
            </View>
            <View style={styles.requisiteRow}>
              <Text style={styles.requisiteLabel}>Юридический адрес:</Text>
              <Text style={styles.requisiteValue}>
                {ad.carrierCompany.legalAddress}
              </Text>
            </View>
            <View style={styles.requisiteRow}>
              <Text style={styles.requisiteLabel}>Фактический адрес:</Text>
              <Text style={styles.requisiteValue}>
                {ad.carrierCompany.actualAddress}
              </Text>
            </View>
            <View style={styles.requisiteRow}>
              <Text style={styles.requisiteLabel}>Банк:</Text>
              <Text style={styles.requisiteValue}>{ad.carrierCompany.bankName}</Text>
            </View>
            <View style={styles.requisiteRow}>
              <Text style={styles.requisiteLabel}>Расчётный счёт:</Text>
              <Text style={styles.requisiteValue}>
                {ad.carrierCompany.bankAccount}
              </Text>
            </View>
          </View>
        </View>

        {ad.sampleContract && (
          <TouchableOpacity style={styles.contractButton} activeOpacity={0.7}>
            <FileText size={18} color={Colors.primary} />
            <Text style={styles.contractButtonText}>Скачать типовой договор</Text>
            <ChevronRight size={18} color={Colors.primary} />
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitRequest}
          activeOpacity={0.8}
        >
          <Send size={20} color={Colors.surface} />
          <Text style={styles.submitButtonText}>Подать заявку</Text>
        </TouchableOpacity>
      </View>
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
  headerCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
    marginRight: 12,
  },
  routeDotStart: {
    backgroundColor: Colors.success,
  },
  routeDotEnd: {
    backgroundColor: Colors.error,
  },
  routePointInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  routeCity: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  routeConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginVertical: 8,
  },
  routeConnectorLine: {
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
  },
  routeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  routeDistance: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  availabilityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.accent + '10',
    padding: 14,
    borderRadius: 12,
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  availabilityDate: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  vehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleBrand: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  vehicleSpecs: {
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    flex: 1,
    marginRight: 12,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  priceValueHighlight: {
    fontSize: 18,
    color: Colors.primary,
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  capabilitiesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.accent + '10',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  capabilitiesText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  regionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  regionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  requisitesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  requisiteRow: {
    gap: 4,
  },
  requisiteLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  requisiteValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  contractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  contractButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginLeft: 12,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
});
