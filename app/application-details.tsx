import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  MapPin,
  Package,
  TrendingUp,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  FileText,
  Truck,
  Star,
  CheckCircle,
  Info,
  ArrowLeft,
} from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

import Colors from '@/constants/colors';
import { mockAds } from '@/mocks/ads';
import { mockCarriers } from '@/mocks/carriers';
import { ShipperAd, Carrier } from '@/types';
import { useOrders } from '@/contexts/OrderContext';

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

const CONTRACT_TEMPLATE = `
ДОГОВОР ПЕРЕВОЗКИ ГРУЗА №___

г. Москва                                                                                     "___" _________ 2025 г.

Заказчик: {SHIPPER_COMPANY}
ИНН: {INN}, КПП: {KPP}, ОГРН: {OGRN}
Адрес: {LEGAL_ADDRESS}

Перевозчик: [Данные перевозчика будут указаны после принятия заявки]

именуемые в дальнейшем "Стороны", заключили настоящий Договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА

1.1. Перевозчик обязуется доставить вверенный ему Заказчиком груз в пункт назначения и выдать его уполномоченному на получение груза лицу (получателю), а Заказчик обязуется уплатить за перевозку установленную настоящим Договором плату.

2. ИНФОРМАЦИЯ О ГРУЗЕ

2.1. Тип груза: {CARGO_TYPE}
2.2. Вес груза: {TONNAGE} тонн
2.3. Расстояние перевозки: {DISTANCE} км
2.4. Требуемый тип транспорта: {TRANSPORT_MODE}

3. МАРШРУТ ПЕРЕВОЗКИ

3.1. Пункт погрузки: {ORIGIN_ADDRESS}
3.2. Пункт разгрузки: {DESTINATION_ADDRESS}
3.3. Срок доставки: до {REQUIRED_DATE}

4. СТОИМОСТЬ И ПОРЯДОК РАСЧЕТОВ

4.1. Стоимость перевозки составляет: {PRICE} руб. {VAT_INFO}
4.2. Страхование груза: {INSURANCE} руб. (5% от стоимости)
4.3. Способ оплаты: {PAYMENT_METHOD}

5. ПРАВА И ОБЯЗАННОСТИ СТОРОН

5.1. Перевозчик обязан:
- Предоставить исправное транспортное средство
- Обеспечить сохранность груза
- Доставить груз в установленный срок
- Предоставить необходимые документы

5.2. Заказчик обязан:
- Предоставить груз в согласованное время
- Оплатить услуги перевозки в соответствии с условиями договора
- Обеспечить доступ для погрузки/разгрузки

6. ОТВЕТСТВЕННОСТЬ СТОРОН

6.1. За утрату, недостачу или повреждение груза Перевозчик несет ответственность в размере действительной стоимости груза.

6.2. Перевозчик освобождается от ответственности если докажет, что утрата, недостача или повреждение груза произошли вследствие обстоятельств, которые он не мог предотвратить.

7. ОСОБЫЕ УСЛОВИЯ

{SPECIAL_REQUIREMENTS}

8. СРОК ДЕЙСТВИЯ ДОГОВОРА

8.1. Договор вступает в силу с момента подписания и действует до полного исполнения Сторонами своих обязательств.

9. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ

9.1. Все споры решаются путем переговоров, а при недостижении согласия - в судебном порядке.

9.2. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу.


ЗАКАЗЧИК:                                                    ПЕРЕВОЗЧИК:

_________________                                            _________________
     (подпись)                                                    (подпись)

М.П.                                                         М.П.
`;

export default function ApplicationDetailsScreen() {
  const { adId } = useLocalSearchParams<{ adId: string }>();
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const { addOrder } = useOrders();

  const ad = useMemo(() => {
    return mockAds.find((a) => a.id === adId);
  }, [adId]);

  const availableCarriers = useMemo(() => {
    if (!ad) return [];
    
    return mockCarriers.filter((carrier) => {
      const hasCapacity = carrier.maxCapacity >= ad.tonnage * 1000;
      const matchesRegion = 
        carrier.availableRegions.some(region => 
          ad.origin.city.includes(region) || ad.destination.city.includes(region)
        );
      
      return hasCapacity && matchesRegion;
    });
  }, [ad]);

  if (!ad) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Детали заявки', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Объявление не найдено</Text>
        </View>
      </View>
    );
  }

  const finalPrice = ad.includesVAT ? ad.price : ad.price * 1.2;
  const displayPrice = ad.includesVAT ? ad.price / 1.2 : ad.price;

  const contract = CONTRACT_TEMPLATE
    .replace('{SHIPPER_COMPANY}', ad.shipperCompany.name)
    .replace('{INN}', ad.shipperCompany.inn)
    .replace('{KPP}', ad.shipperCompany.kpp || 'не применяется')
    .replace('{OGRN}', ad.shipperCompany.ogrn)
    .replace('{LEGAL_ADDRESS}', ad.shipperCompany.legalAddress)
    .replace('{CARGO_TYPE}', ad.cargoType)
    .replace('{TONNAGE}', ad.tonnage.toString())
    .replace('{DISTANCE}', ad.distance.toString())
    .replace('{TRANSPORT_MODE}', TRANSPORT_MODE_NAMES[ad.transportMode])
    .replace('{ORIGIN_ADDRESS}', ad.origin.address)
    .replace('{DESTINATION_ADDRESS}', ad.destination.address)
    .replace('{REQUIRED_DATE}', new Date(ad.requiredDate).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }))
    .replace('{PRICE}', displayPrice.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }))
    .replace('{VAT_INFO}', ad.includesVAT ? 'без НДС' : '(с НДС 20%: ' + finalPrice.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' руб.)')
    .replace('{INSURANCE}', ad.insurance.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }))
    .replace('{PAYMENT_METHOD}', PAYMENT_METHOD_NAMES[ad.paymentMethod])
    .replace('{SPECIAL_REQUIREMENTS}', ad.specialRequirements || 'Особые условия отсутствуют');

  const handleSubmitApplication = () => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите подать заявку на эту перевозку?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Подтвердить',
          onPress: () => {
            if (!ad) return;

            console.log('[ApplicationDetails] Creating order from ad:', ad.id);
            
            const finalPrice = ad.includesVAT ? ad.price : ad.price * 1.2;
            const displayPrice = ad.includesVAT ? ad.price / 1.2 : ad.price;
            const totalWithExtras = finalPrice + ad.insurance + ad.aggregatorCommission;

            const newOrder = addOrder({
              status: 'created',
              shipperId: ad.shipperId,
              origin: {
                address: ad.origin.address,
                lat: ad.origin.lat,
                lng: ad.origin.lng,
              },
              destination: {
                address: ad.destination.address,
                lat: ad.destination.lat,
                lng: ad.destination.lng,
              },
              cargoType: ad.cargoType,
              weight: ad.tonnage * 1000,
              volume: ad.tonnage * 2,
              price: totalWithExtras,
              includesVAT: true,
              insurance: ad.insurance,
              aggregatorCommission: ad.aggregatorCommission,
              currency: '₽',
              requiredDate: ad.requiredDate,
              shipperCompany: ad.shipperCompany,
              transportMode: ad.transportMode,
              paymentMethod: ad.paymentMethod,
              tonnage: ad.tonnage,
              distance: ad.distance,
            });

            console.log('[ApplicationDetails] Order created:', newOrder.id);

            Alert.alert(
              'Успешно!', 
              'Ваша заявка успешно создана и добавлена в "Мои Заказы".', 
              [
                { 
                  text: 'Перейти к заказу', 
                  onPress: () => {
                    router.replace('/(tabs)/orders');
                    setTimeout(() => {
                      router.push(`/(tabs)/orders/${newOrder.id}`);
                    }, 100);
                  }
                },
                {
                  text: 'Остаться здесь',
                  style: 'cancel'
                }
              ]
            );
          },
        },
      ]
    );
  };

  const renderRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Star size={14} color={Colors.warning} fill={Colors.warning} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderCarrierCard = (carrier: Carrier) => {
    const estimatedPrice = ad.distance * carrier.basePricePerKm;
    const withCommission = estimatedPrice * (1 + carrier.commission);

    return (
      <View key={carrier.id} style={styles.carrierCard}>
        <View style={styles.carrierHeader}>
          <View style={styles.carrierNameRow}>
            <Truck size={18} color={Colors.primary} />
            <Text style={styles.carrierName}>{carrier.name}</Text>
            {renderRating(carrier.rating)}
          </View>
          <View style={styles.carrierStats}>
            <Text style={styles.carrierStatText}>
              {carrier.totalTrips} поездок
            </Text>
          </View>
        </View>

        <View style={styles.carrierInfo}>
          <View style={styles.carrierInfoRow}>
            <Text style={styles.carrierInfoLabel}>Тип транспорта:</Text>
            <Text style={styles.carrierInfoValue}>{carrier.vehicleType}</Text>
          </View>
          <View style={styles.carrierInfoRow}>
            <Text style={styles.carrierInfoLabel}>Грузоподъемность:</Text>
            <Text style={styles.carrierInfoValue}>{carrier.maxCapacity / 1000} т</Text>
          </View>
          <View style={styles.carrierInfoRow}>
            <Text style={styles.carrierInfoLabel}>Объем:</Text>
            <Text style={styles.carrierInfoValue}>{carrier.maxVolume} м³</Text>
          </View>
          <View style={styles.carrierInfoRow}>
            <Text style={styles.carrierInfoLabel}>Средняя скорость:</Text>
            <Text style={styles.carrierInfoValue}>{carrier.averageSpeed} км/ч</Text>
          </View>
        </View>

        <View style={styles.carrierPricing}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Базовая стоимость:</Text>
            <Text style={styles.pricingValue}>
              ~{estimatedPrice.toLocaleString('ru-RU')} ₽
            </Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Комиссия ({(carrier.commission * 100).toFixed(0)}%):</Text>
            <Text style={styles.pricingValue}>
              ~{(withCommission - estimatedPrice).toLocaleString('ru-RU')} ₽
            </Text>
          </View>
          <View style={[styles.pricingRow, styles.totalPricingRow]}>
            <Text style={styles.totalPricingLabel}>Итого:</Text>
            <Text style={styles.totalPricingValue}>
              ~{withCommission.toLocaleString('ru-RU')} ₽
            </Text>
          </View>
        </View>

        {carrier.phone && (
          <View style={styles.carrierContact}>
            <Phone size={14} color={Colors.textSecondary} />
            <Text style={styles.carrierContactText}>{carrier.phone}</Text>
          </View>
        )}

        <View style={styles.carrierAvailability}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.availabilityText}>Доступен для перевозки</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Детали заявки',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.surface,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о грузе</Text>
          
          <View style={styles.adCard}>
            <View style={styles.routeSection}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, styles.routeDotStart]} />
                <View style={styles.routePointInfo}>
                  <Text style={styles.routeLabel}>ОТКУДА</Text>
                  <Text style={styles.routeCity}>{ad.origin.city}</Text>
                  <Text style={styles.routeAddress}>{ad.origin.address}</Text>
                </View>
              </View>
              
              <View style={styles.routeConnector} />
              
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, styles.routeDotEnd]} />
                <View style={styles.routePointInfo}>
                  <Text style={styles.routeLabel}>КУДА</Text>
                  <Text style={styles.routeCity}>{ad.destination.city}</Text>
                  <Text style={styles.routeAddress}>{ad.destination.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Package size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Тип груза</Text>
                <Text style={styles.infoValue}>{ad.cargoType}</Text>
              </View>
              <View style={styles.infoItem}>
                <Truck size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Тоннаж</Text>
                <Text style={styles.infoValue}>{ad.tonnage} т</Text>
              </View>
              <View style={styles.infoItem}>
                <TrendingUp size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Расстояние</Text>
                <Text style={styles.infoValue}>{ad.distance} км</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.transportModeRow}>
              <Text style={styles.transportLabel}>Требуемый транспорт:</Text>
              <Text style={styles.transportValue}>
                {TRANSPORT_MODE_NAMES[ad.transportMode]}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <Calendar size={16} color={Colors.accent} />
              <Text style={styles.dateText}>
                Требуется до: {new Date(ad.requiredDate).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {ad.cargoDetails && (
              <>
                <View style={styles.divider} />
                <Text style={styles.detailsTitle}>Детали груза:</Text>
                <Text style={styles.detailsText}>{ad.cargoDetails}</Text>
              </>
            )}

            {ad.specialRequirements && (
              <>
                <View style={styles.divider} />
                <View style={styles.requirementBox}>
                  <Info size={16} color={Colors.warning} />
                  <View style={styles.requirementContent}>
                    <Text style={styles.requirementTitle}>Особые требования</Text>
                    <Text style={styles.requirementText}>{ad.specialRequirements}</Text>
                  </View>
                </View>
              </>
            )}

            {ad.loadingInfo && (
              <>
                <View style={styles.divider} />
                <Text style={styles.detailsTitle}>Информация о погрузке:</Text>
                <Text style={styles.detailsText}>{ad.loadingInfo}</Text>
              </>
            )}

            {ad.unloadingInfo && (
              <>
                <View style={styles.divider} />
                <Text style={styles.detailsTitle}>Информация о разгрузке:</Text>
                <Text style={styles.detailsText}>{ad.unloadingInfo}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Стоимость перевозки</Text>
          
          <View style={styles.priceCard}>
            <View style={styles.priceDetailRow}>
              <Text style={styles.priceDetailLabel}>Цена (без НДС):</Text>
              <Text style={styles.priceDetailValue}>
                {displayPrice.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ₽
              </Text>
            </View>
            <View style={styles.priceDetailRow}>
              <Text style={styles.priceDetailLabel}>НДС (20%):</Text>
              <Text style={styles.priceDetailValue}>
                {(finalPrice - displayPrice).toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ₽
              </Text>
            </View>
            <View style={styles.priceDetailRow}>
              <View style={styles.insuranceRow}>
                <ShieldCheck size={14} color={Colors.primary} />
                <Text style={styles.priceDetailLabel}>Страховка (5%):</Text>
              </View>
              <Text style={styles.priceDetailValue}>
                {ad.insurance.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ₽
              </Text>
            </View>
            <View style={styles.priceDetailRow}>
              <View style={styles.insuranceRow}>
                <Info size={14} color={Colors.accent} />
                <Text style={styles.priceDetailLabel}>Комиссия агрегатора (5%):</Text>
              </View>
              <Text style={styles.priceDetailValue}>
                {ad.aggregatorCommission.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ₽
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.priceDetailRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>Итого:</Text>
              <Text style={styles.finalTotalValue}>
                {(finalPrice + ad.insurance + ad.aggregatorCommission).toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ₽
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentMethodRow}>
              <CreditCard size={16} color={Colors.primary} />
              <Text style={styles.paymentMethodLabel}>Способ оплаты:</Text>
              <Text style={styles.paymentMethodValue}>
                {PAYMENT_METHOD_NAMES[ad.paymentMethod]}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о грузоотправителе</Text>
          
          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <Building size={20} color={Colors.primary} />
              <Text style={styles.companyName}>{ad.shipperCompany.name}</Text>
              {renderRating(ad.shipperRating)}
            </View>

            <View style={styles.companyDetails}>
              <Text style={styles.companyDetailItem}>ИНН: {ad.shipperCompany.inn}</Text>
              {ad.shipperCompany.kpp && (
                <Text style={styles.companyDetailItem}>КПП: {ad.shipperCompany.kpp}</Text>
              )}
              <Text style={styles.companyDetailItem}>ОГРН: {ad.shipperCompany.ogrn}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.managerTitle}>Контактное лицо:</Text>
            <View style={styles.contactItem}>
              <User size={14} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{ad.shipperCompany.managerName}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={14} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{ad.shipperCompany.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Mail size={14} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{ad.shipperCompany.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Договор на транспортные услуги</Text>
          </View>
          
          <TouchableOpacity
            style={styles.contractButton}
            onPress={() => setContractModalVisible(true)}
            activeOpacity={0.7}
          >
            <FileText size={20} color={Colors.surface} />
            <Text style={styles.contractButtonText}>Просмотреть договор</Text>
          </TouchableOpacity>
          
          <Text style={styles.contractNote}>
            Ознакомьтесь с условиями договора перед подачей заявки
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Доступные перевозчики ({availableCarriers.length})
          </Text>
          
          {availableCarriers.length > 0 ? (
            availableCarriers.map(renderCarrierCard)
          ) : (
            <View style={styles.noCarriersBox}>
              <Truck size={48} color={Colors.textSecondary} />
              <Text style={styles.noCarriersText}>
                Нет доступных перевозчиков для данного маршрута
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitApplication}
          activeOpacity={0.8}
        >
          <CheckCircle size={20} color={Colors.surface} />
          <Text style={styles.submitButtonText}>Подать заявку</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={contractModalVisible}
        animationType="slide"
        onRequestClose={() => setContractModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setContractModalVisible(false)}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Договор перевозки</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
            <Text style={styles.contractText}>{contract}</Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setContractModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  adCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  routeSection: {
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
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  routeCity: {
    fontSize: 18,
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
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  transportModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transportLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  transportValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  requirementBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.warning + '10',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  requirementContent: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  priceDetailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalPriceLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  totalPriceValue: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  finalTotalRow: {
    backgroundColor: Colors.primary + '10',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 0,
  },
  finalTotalLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
  },
  finalTotalValue: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  paymentMethodValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  companyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  companyName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  companyDetails: {
    gap: 4,
  },
  companyDetailItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  managerTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  contractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  contractButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
  contractNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  carrierCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  carrierHeader: {
    marginBottom: 12,
  },
  carrierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  carrierName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  carrierStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carrierStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  carrierInfo: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  carrierInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carrierInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  carrierInfoValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  carrierPricing: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pricingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  pricingValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  totalPricingRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
    paddingTop: 8,
  },
  totalPricingLabel: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  totalPricingValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  carrierContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  carrierContactText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  carrierAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success + '15',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '700' as const,
  },
  noCarriersBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCarriersText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500' as const,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  contractText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
});
