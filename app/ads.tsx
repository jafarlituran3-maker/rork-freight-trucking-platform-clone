import { Stack, router } from 'expo-router';
import {
  MapPin,
  Package,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Send,
  Info,
  ShieldCheck,
  CreditCard,
  Building,
  User,
  Phone,
  Mail,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';

import Colors from '@/constants/colors';
import { mockAds } from '@/mocks/ads';
import { mockCarrierAds } from '@/mocks/carrier-ads';
import { ShipperAd, CarrierAd } from '@/types';
import { useRole } from '@/contexts/RoleContext';


const TRANSPORT_MODE_NAMES: Record<string, string> = {
  truck: 'Грузовик',
  van: 'Фургон',
  refrigerator: 'Рефрижератор',
  container: 'Контейнеровоз',
  tanker: 'Цистерна',
  flatbed: 'Бортовой',
};

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  prepayment: 'Предоплата',
  postpayment: 'Постоплата',
  by_invoice: 'По счету',
  cash: 'Наличные',
  card: 'Карта',
};

interface Filters {
  company: string;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
  minWeight: string;
  maxWeight: string;
}

export default function AdsScreen() {
  const { role } = useRole();
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    company: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: '',
    minWeight: '',
    maxWeight: '',
  });

  const isCargoOwner = role === 'cargo-owner';

  const filteredAds = useMemo(() => {
    if (isCargoOwner) {
      const ads = mockCarrierAds;
      return ads.filter((ad) => {
        const searchLower = searchQuery.toLowerCase().trim();
        if (searchLower) {
          const routeMatch =
            ad.availableFrom.city.toLowerCase().includes(searchLower) ||
            ad.availableTo.city.toLowerCase().includes(searchLower) ||
            ad.availableFrom.address.toLowerCase().includes(searchLower) ||
            ad.availableTo.address.toLowerCase().includes(searchLower);
          if (!routeMatch) return false;
        }

        if (filters.company) {
          const companyLower = filters.company.toLowerCase().trim();
          if (!ad.carrierCompany.name.toLowerCase().includes(companyLower)) {
            return false;
          }
        }

        if (filters.minPrice) {
          const minPrice = parseFloat(filters.minPrice);
          if (!isNaN(minPrice) && ad.averagePrice < minPrice) {
            return false;
          }
        }

        if (filters.maxPrice) {
          const maxPrice = parseFloat(filters.maxPrice);
          if (!isNaN(maxPrice) && ad.averagePrice > maxPrice) {
            return false;
          }
        }

        if (filters.minWeight) {
          const minWeight = parseFloat(filters.minWeight);
          if (!isNaN(minWeight) && ad.truckInfo.loadCapacity < minWeight) {
            return false;
          }
        }

        if (filters.maxWeight) {
          const maxWeight = parseFloat(filters.maxWeight);
          if (!isNaN(maxWeight) && ad.truckInfo.loadCapacity > maxWeight) {
            return false;
          }
        }

        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          const adDate = new Date(ad.availableDate);
          if (!isNaN(startDate.getTime()) && adDate < startDate) {
            return false;
          }
        }

        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          const adDate = new Date(ad.availableDate);
          if (!isNaN(endDate.getTime()) && adDate > endDate) {
            return false;
          }
        }

        return true;
      });
    }
    
    const ads = mockAds;
    return ads.filter((ad) => {
      const searchLower = searchQuery.toLowerCase().trim();
      if (searchLower) {
        const routeMatch =
          ad.origin.city.toLowerCase().includes(searchLower) ||
          ad.destination.city.toLowerCase().includes(searchLower) ||
          ad.origin.address.toLowerCase().includes(searchLower) ||
          ad.destination.address.toLowerCase().includes(searchLower);
        if (!routeMatch) return false;
      }

      if (filters.company) {
        const companyLower = filters.company.toLowerCase().trim();
        if (!ad.shipperCompany.name.toLowerCase().includes(companyLower)) {
          return false;
        }
      }

      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice);
        if (!isNaN(minPrice) && ad.price < minPrice) {
          return false;
        }
      }

      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice) && ad.price > maxPrice) {
          return false;
        }
      }

      if (filters.minWeight) {
        const minWeight = parseFloat(filters.minWeight);
        if (!isNaN(minWeight) && ad.tonnage < minWeight) {
          return false;
        }
      }

      if (filters.maxWeight) {
        const maxWeight = parseFloat(filters.maxWeight);
        if (!isNaN(maxWeight) && ad.tonnage > maxWeight) {
          return false;
        }
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const adDate = new Date(ad.requiredDate);
        if (!isNaN(startDate.getTime()) && adDate < startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        const adDate = new Date(ad.requiredDate);
        if (!isNaN(endDate.getTime()) && adDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, filters, isCargoOwner]);

  const handleToggleDetails = (adId: string) => {
    setExpandedAdId(expandedAdId === adId ? null : adId);
  };

  const handleSubmitRequest = (ad: ShipperAd) => {
    console.log('[AdsScreen] Opening application details for ad:', ad.id);
    router.push(`/application-details?adId=${ad.id}` as any);
  };

  const handleClearFilters = () => {
    setFilters({
      company: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      endDate: '',
      minWeight: '',
      maxWeight: '',
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.company) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.minWeight) count++;
    if (filters.maxWeight) count++;
    return count;
  }, [filters]);

  const renderRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Star size={14} color={Colors.warning} fill={Colors.warning} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderCarrierAdCard = ({ item }: { item: CarrierAd }) => {
    const isExpanded = expandedAdId === item.id;

    return (
      <View style={styles.adCard}>
        <View style={styles.adHeader}>
          <View style={styles.adHeaderTop}>
            <View style={styles.routeInfo}>
              <View style={styles.locationRow}>
                <MapPin size={16} color={Colors.success} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.availableFrom?.city || 'N/A'}
                </Text>
              </View>
              <View style={styles.routeArrow}>
                <View style={styles.routeLine} />
                <TrendingUp size={16} color={Colors.textSecondary} />
              </View>
              <View style={styles.locationRow}>
                <MapPin size={16} color={Colors.error} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.availableTo?.city || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Цена</Text>
              <Text style={styles.priceValue}>
                {item.averagePrice.toLocaleString('ru-RU')} ₽
              </Text>
              <Text style={styles.vatLabel}>в среднем</Text>
            </View>
          </View>

          <View style={styles.companyRatingRow}>
            <View style={styles.companyNameContainer}>
              <Building size={14} color={Colors.textSecondary} />
              <Text style={styles.companyName} numberOfLines={1}>
                {item.carrierCompany.name}
              </Text>
            </View>
            {renderRating(item.carrierRating)}
          </View>
        </View>

        <View style={styles.adBody}>
          <View style={styles.infoRow}>
            <Package size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {item.truckInfo.brand} {item.truckInfo.model}
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Грузоподъемность</Text>
              <Text style={styles.infoValue}>{item.truckInfo.loadCapacity} т</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Расстояние</Text>
              <Text style={styles.infoValue}>{item.distance} км</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Тип</Text>
              <Text style={styles.infoValue}>{item.truckInfo.type}</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Calendar size={14} color={Colors.accent} />
            <Text style={styles.dateText}>
              Доступен с:{' '}
              {new Date(item.availableDate).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.detailsButton, styles.detailsButtonExpand]}
              onPress={() => handleToggleDetails(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.detailsButtonText}>Подробнее</Text>
              {isExpanded ? (
                <ChevronUp size={18} color={Colors.primary} />
              ) : (
                <ChevronDown size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailedInfoButton}
              onPress={() => router.push(`/carrier-ad-details?adId=${item.id}` as any)}
              activeOpacity={0.7}
            >
              <Info size={18} color={Colors.surface} />
              <Text style={styles.detailedInfoButtonText}>Детально</Text>
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <View style={styles.expandedSection}>
              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Информация о перевозчике</Text>
              <View style={styles.companyInfo}>
                <View style={styles.companyRow}>
                  <Building size={14} color={Colors.textSecondary} />
                  <Text style={styles.companyText}>
                    {item.carrierCompany.name}
                  </Text>
                </View>
                <View style={styles.detailsGrid}>
                  <Text style={styles.detailItem}>
                    ИНН: {item.carrierCompany.inn}
                  </Text>
                  {item.carrierCompany.kpp && (
                    <Text style={styles.detailItem}>
                      КПП: {item.carrierCompany.kpp}
                    </Text>
                  )}
                  <Text style={styles.detailItem}>
                    ОГРН: {item.carrierCompany.ogrn}
                  </Text>
                  <Text style={styles.detailItem}>
                    Завершено рейсов: {item.totalTripsCompleted}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Контакты</Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <User size={14} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>
                    {item.carrierCompany.managerName}
                  </Text>
                </View>
                <View style={styles.contactRow}>
                  <Phone size={14} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>
                    {item.carrierCompany.phone}
                  </Text>
                </View>
                <View style={styles.contactRow}>
                  <Mail size={14} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>
                    {item.carrierCompany.email}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Маршрут</Text>
              <View style={styles.routeDetails}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotStart]} />
                  <View style={styles.routePointInfo}>
                    <Text style={styles.routeLabel}>От</Text>
                    <Text style={styles.routeAddress}>
                      {item.availableFrom?.address || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.routeConnector} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotEnd]} />
                  <View style={styles.routePointInfo}>
                    <Text style={styles.routeLabel}>До</Text>
                    <Text style={styles.routeAddress}>
                      {item.availableTo?.address || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Стоимость</Text>
              <View style={styles.priceDetails}>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>Средняя цена:</Text>
                  <Text style={styles.priceDetailValue}>
                    {item.averagePrice.toLocaleString('ru-RU')} ₽
                  </Text>
                </View>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>Цена за км:</Text>
                  <Text style={styles.priceDetailValue}>
                    {item.pricePerKm.toLocaleString('ru-RU')} ₽
                  </Text>
                </View>
              </View>

              {item.detailedDescription && (
                <>
                  <Text style={styles.sectionTitle}>Описание</Text>
                  <Text style={styles.descriptionText}>
                    {item.detailedDescription}
                  </Text>
                </>
              )}

              {item.specialCapabilities && (
                <>
                  <Text style={styles.sectionTitle}>Особые возможности</Text>
                  <View style={styles.requirementBox}>
                    <Info size={14} color={Colors.warning} />
                    <Text style={styles.requirementText}>
                      {item.specialCapabilities}
                    </Text>
                  </View>
                </>
              )}

              {item.preferredRegions && item.preferredRegions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Предпочитаемые регионы</Text>
                  <Text style={styles.descriptionText}>
                    {item.preferredRegions.join(', ')}
                  </Text>
                </>
              )}

              <View style={styles.divider} />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderShipperAdCard = ({ item }: { item: ShipperAd }) => {
    const isExpanded = expandedAdId === item.id;
    const finalPrice = item.includesVAT ? item.price : item.price * 1.2;
    const displayPrice = item.includesVAT ? item.price / 1.2 : item.price;

    return (
      <View style={styles.adCard}>
        <View style={styles.adHeader}>
          <View style={styles.adHeaderTop}>
            <View style={styles.routeInfo}>
              <View style={styles.locationRow}>
                <MapPin size={16} color={Colors.success} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.origin?.city || 'N/A'}
                </Text>
              </View>
              <View style={styles.routeArrow}>
                <View style={styles.routeLine} />
                <TrendingUp size={16} color={Colors.textSecondary} />
              </View>
              <View style={styles.locationRow}>
                <MapPin size={16} color={Colors.error} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.destination?.city || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Цена</Text>
              <Text style={styles.priceValue}>
                {displayPrice.toLocaleString('ru-RU')} ₽
              </Text>
              <Text style={styles.vatLabel}>
                {item.includesVAT ? 'с НДС 20%' : 'без НДС'}
              </Text>
            </View>
          </View>

          <View style={styles.companyRatingRow}>
            <View style={styles.companyNameContainer}>
              <Building size={14} color={Colors.textSecondary} />
              <Text style={styles.companyName} numberOfLines={1}>
                {item.shipperCompany.name}
              </Text>
            </View>
            {renderRating(item.shipperRating)}
          </View>
        </View>

        <View style={styles.adBody}>
          <View style={styles.infoRow}>
            <Package size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.cargoType}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Тоннаж</Text>
              <Text style={styles.infoValue}>{item.tonnage} т</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Расстояние</Text>
              <Text style={styles.infoValue}>{item.distance} км</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Транспорт</Text>
              <Text style={styles.infoValue}>
                {TRANSPORT_MODE_NAMES[item.transportMode]}
              </Text>
            </View>
          </View>

          <View style={styles.insuranceRow}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.insuranceText}>
              Страховка: {item.insurance.toLocaleString('ru-RU')} ₽ (5%)
            </Text>
          </View>

          <View style={styles.dateRow}>
            <Calendar size={14} color={Colors.accent} />
            <Text style={styles.dateText}>
              Требуется до:{' '}
              {new Date(item.requiredDate).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleToggleDetails(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsButtonText}>Подробнее</Text>
            {isExpanded ? (
              <ChevronUp size={18} color={Colors.primary} />
            ) : (
              <ChevronDown size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandedSection}>
              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Информация о компании</Text>
              <View style={styles.companyInfo}>
                <View style={styles.companyRow}>
                  <Building size={14} color={Colors.textSecondary} />
                  <Text style={styles.companyText}>
                    {item.shipperCompany.name}
                  </Text>
                </View>
                <View style={styles.detailsGrid}>
                  <Text style={styles.detailItem}>
                    ИНН: {item.shipperCompany.inn}
                  </Text>
                  {item.shipperCompany.kpp && (
                    <Text style={styles.detailItem}>
                      КПП: {item.shipperCompany.kpp}
                    </Text>
                  )}
                  <Text style={styles.detailItem}>
                    ОГРН: {item.shipperCompany.ogrn}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Менеджер</Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <User size={14} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>
                    {item.shipperCompany.managerName}
                  </Text>
                </View>
                <View style={styles.contactRow}>
                  <Phone size={14} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>
                    {item.shipperCompany.phone}
                  </Text>
                </View>
                <View style={styles.contactRow}>
                  <Mail size={14} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>
                    {item.shipperCompany.email}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Полный маршрут</Text>
              <View style={styles.routeDetails}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotStart]} />
                  <View style={styles.routePointInfo}>
                    <Text style={styles.routeLabel}>Загрузка</Text>
                    <Text style={styles.routeAddress}>
                      {item.origin?.address || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.routeConnector} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotEnd]} />
                  <View style={styles.routePointInfo}>
                    <Text style={styles.routeLabel}>Разгрузка</Text>
                    <Text style={styles.routeAddress}>
                      {item.destination?.address || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Стоимость</Text>
              <View style={styles.priceDetails}>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>Без НДС:</Text>
                  <Text style={styles.priceDetailValue}>
                    {displayPrice.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ₽
                  </Text>
                </View>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>НДС 20%:</Text>
                  <Text style={styles.priceDetailValue}>
                    {(finalPrice - displayPrice).toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ₽
                  </Text>
                </View>
                <View style={[styles.priceDetailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>С НДС 20%:</Text>
                  <Text style={styles.totalValue}>
                    {finalPrice.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ₽
                  </Text>
                </View>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>Страховка (5%):</Text>
                  <Text style={styles.priceDetailValue}>
                    {item.insurance.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ₽
                  </Text>
                </View>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>Комиссия агрегатора (5%):</Text>
                  <Text style={styles.priceDetailValue}>
                    {item.aggregatorCommission.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ₽
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Способ оплаты</Text>
              <View style={styles.paymentMethodBox}>
                <CreditCard size={16} color={Colors.primary} />
                <Text style={styles.paymentMethodText}>
                  {PAYMENT_METHOD_NAMES[item.paymentMethod]}
                </Text>
              </View>

              {item.detailedDescription && (
                <>
                  <Text style={styles.sectionTitle}>Описание</Text>
                  <Text style={styles.descriptionText}>
                    {item.detailedDescription}
                  </Text>
                </>
              )}

              {item.cargoDetails && (
                <>
                  <Text style={styles.sectionTitle}>Детали груза</Text>
                  <Text style={styles.descriptionText}>{item.cargoDetails}</Text>
                </>
              )}

              {item.specialRequirements && (
                <>
                  <Text style={styles.sectionTitle}>Особые требования</Text>
                  <View style={styles.requirementBox}>
                    <Info size={14} color={Colors.warning} />
                    <Text style={styles.requirementText}>
                      {item.specialRequirements}
                    </Text>
                  </View>
                </>
              )}

              {item.loadingInfo && (
                <>
                  <Text style={styles.sectionTitle}>Информация о погрузке</Text>
                  <Text style={styles.descriptionText}>{item.loadingInfo}</Text>
                </>
              )}

              {item.unloadingInfo && (
                <>
                  <Text style={styles.sectionTitle}>Информация о разгрузке</Text>
                  <Text style={styles.descriptionText}>
                    {item.unloadingInfo}
                  </Text>
                </>
              )}

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmitRequest(item)}
                activeOpacity={0.8}
              >
                <Send size={18} color={Colors.surface} />
                <Text style={styles.submitButtonText}>Подать заявку</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isCargoOwner ? 'Объявления перевозчиков' : 'Объявления',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.surface,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по маршруту..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={20} color={Colors.surface} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAds}
        renderItem={isCargoOwner ? renderCarrierAdCard : renderShipperAdCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Нет доступных объявлений</Text>
            <Text style={styles.emptySubtext}>
              Попробуйте изменить параметры поиска
            </Text>
          </View>
        }
      />

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Фильтры</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Компания</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Название компании"
                placeholderTextColor={Colors.textSecondary}
                value={filters.company}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, company: text }))
                }
              />

              <Text style={styles.filterSectionTitle}>Цена, ₽</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInput, styles.filterInputHalf]}
                  placeholder="От"
                  placeholderTextColor={Colors.textSecondary}
                  value={filters.minPrice}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, minPrice: text }))
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.filterInput, styles.filterInputHalf]}
                  placeholder="До"
                  placeholderTextColor={Colors.textSecondary}
                  value={filters.maxPrice}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, maxPrice: text }))
                  }
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.filterSectionTitle}>Вес груза, т</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInput, styles.filterInputHalf]}
                  placeholder="От"
                  placeholderTextColor={Colors.textSecondary}
                  value={filters.minWeight}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, minWeight: text }))
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.filterInput, styles.filterInputHalf]}
                  placeholder="До"
                  placeholderTextColor={Colors.textSecondary}
                  value={filters.maxWeight}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, maxWeight: text }))
                  }
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.filterSectionTitle}>Дата (от)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="ГГГГ-ММ-ДД"
                placeholderTextColor={Colors.textSecondary}
                value={filters.startDate}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, startDate: text }))
                }
              />

              <Text style={styles.filterSectionTitle}>Дата (до)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="ГГГГ-ММ-ДД"
                placeholderTextColor={Colors.textSecondary}
                value={filters.endDate}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, endDate: text }))
                }
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>Сбросить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.applyButtonText}>Применить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  filterButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  adCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  adHeader: {
    backgroundColor: Colors.primary + '08',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  adHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 24,
    marginBottom: 8,
  },
  routeLine: {
    width: 20,
    height: 1,
    backgroundColor: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 120,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  vatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  companyRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  adBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '08',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  insuranceText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  detailsButtonExpand: {
    flex: 1,
  },
  detailsButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  detailedInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  detailedInfoButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.surface,
  },
  expandedSection: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  companyInfo: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  companyText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  detailsGrid: {
    gap: 4,
    marginLeft: 22,
  },
  detailItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  contactInfo: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  routeDetails: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  routeAddress: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  routeConnector: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  priceDetails: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceDetailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  priceDetailValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 6,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  totalValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  paymentMethodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  requirementBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.warning + '10',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  filterInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterInputHalf: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.surface,
  },
});
