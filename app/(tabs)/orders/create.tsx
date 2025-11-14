import { useRouter } from 'expo-router';
import { MapPin, Package, Search, Star, Truck, Clock, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import Colors from '@/constants/colors';
import { useOrders } from '@/contexts/OrderContext';
import { CarrierOffer } from '@/types';

export default function CreateOrderScreen() {
  const router = useRouter();
  const { searchCarriers, addOrder } = useOrders();
  
  const [originAddress, setOriginAddress] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [cargoType, setCargoType] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  
  const [step, setStep] = useState<number>(1);
  const [carriers, setCarriers] = useState<CarrierOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<CarrierOffer | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearchCarriers = () => {
    if (!originAddress || !destinationAddress || !cargoType || !weight || !volume) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      const offers = searchCarriers({
        origin: originAddress,
        destination: destinationAddress,
        cargoType,
        weight: parseFloat(weight),
        volume: parseFloat(volume),
        dimensions: length && width && height ? {
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height),
        } : undefined,
      });
      
      setCarriers(offers);
      setIsSearching(false);
      setStep(2);
    }, 800);
  };

  const handleSelectCarrier = (offer: CarrierOffer) => {
    setSelectedOffer(offer);
    setStep(3);
  };

  const handleCreateOrder = () => {
    if (!selectedOffer) return;

    addOrder({
      status: 'created',
      shipperId: 'shipper1',
      carrierId: selectedOffer.carrier.id,
      origin: {
        address: originAddress,
        lat: 55.7558,
        lng: 37.6173,
      },
      destination: {
        address: destinationAddress,
        lat: 55.7558,
        lng: 37.6173,
      },
      cargoType,
      weight: parseFloat(weight),
      volume: parseFloat(volume),
      price: selectedOffer.finalPrice,
      currency: 'RUB',
      requiredDate: new Date(Date.now() + 86400000).toISOString(),
    });

    Alert.alert(
      'Заказ создан',
      `Ваш заказ успешно создан. Перевозчик: ${selectedOffer.carrier.name}`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderCargoForm = () => (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPin size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Маршрут</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Откуда *</Text>
          <TextInput
            style={styles.input}
            placeholder="Адрес отправления"
            placeholderTextColor={Colors.textSecondary}
            value={originAddress}
            onChangeText={setOriginAddress}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Куда *</Text>
          <TextInput
            style={styles.input}
            placeholder="Адрес доставки"
            placeholderTextColor={Colors.textSecondary}
            value={destinationAddress}
            onChangeText={setDestinationAddress}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Package size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Информация о грузе</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Тип груза *</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: Строительные материалы"
            placeholderTextColor={Colors.textSecondary}
            value={cargoType}
            onChangeText={setCargoType}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Вес (кг) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Объем (м³) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.dimensionsTitle}>Габариты (опционально)</Text>
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.thirdWidth]}>
            <Text style={styles.label}>Длина (м)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={length}
              onChangeText={setLength}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.thirdWidth]}>
            <Text style={styles.label}>Ширина (м)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={width}
              onChangeText={setWidth}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.thirdWidth]}>
            <Text style={styles.label}>Высота (м)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </>
  );

  const renderCarrierList = () => (
    <>
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Поиск перевозчиков...</Text>
        </View>
      ) : carriers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Перевозчики не найдены</Text>
          <Text style={styles.emptySubtext}>Попробуйте изменить параметры груза</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Search size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Доступные перевозчики ({carriers.length})</Text>
          </View>

          {carriers.map((offer) => (
            <TouchableOpacity
              key={offer.carrier.id}
              style={styles.carrierCard}
              onPress={() => handleSelectCarrier(offer)}
              activeOpacity={0.7}
            >
              <View style={styles.carrierHeader}>
                <Text style={styles.carrierName}>{offer.carrier.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFC107" fill="#FFC107" />
                  <Text style={styles.ratingText}>{offer.carrier.rating}</Text>
                  <Text style={styles.tripsText}>({offer.carrier.totalTrips})</Text>
                </View>
              </View>

              <View style={styles.carrierDetails}>
                <View style={styles.carrierDetail}>
                  <Truck size={16} color={Colors.textSecondary} />
                  <Text style={styles.carrierDetailText}>{offer.carrier.vehicleType}</Text>
                </View>
                <View style={styles.carrierDetail}>
                  <Package size={16} color={Colors.textSecondary} />
                  <Text style={styles.carrierDetailText}>
                    {offer.carrier.maxCapacity / 1000}т / {offer.carrier.maxVolume}м³
                  </Text>
                </View>
              </View>

              <View style={styles.carrierDetails}>
                <View style={styles.carrierDetail}>
                  <TrendingUp size={16} color={Colors.textSecondary} />
                  <Text style={styles.carrierDetailText}>
                    {offer.carrier.averageSpeed} км/ч
                  </Text>
                </View>
                <View style={styles.carrierDetail}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={styles.carrierDetailText}>
                    ~{offer.estimatedDuration} мин (~{offer.estimatedDistance} км)
                  </Text>
                </View>
              </View>

              <View style={styles.carrierFooter}>
                <Text style={styles.selectCarrierText}>Нажмите для расчета стоимости</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );

  const renderPricingSummary = () => (
    <>
      {selectedOffer && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Выбранный перевозчик</Text>
          </View>

          <View style={styles.selectedCarrierCard}>
            <Text style={styles.selectedCarrierName}>{selectedOffer.carrier.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFC107" fill="#FFC107" />
              <Text style={styles.ratingText}>{selectedOffer.carrier.rating}</Text>
            </View>
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Расчет стоимости</Text>
            
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Базовая стоимость:</Text>
              <Text style={styles.pricingValue}>{selectedOffer.basePrice.toLocaleString()} ₽</Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Комиссия агрегатора:</Text>
              <Text style={styles.pricingValue}>+{selectedOffer.commission.toLocaleString()} ₽</Text>
            </View>

            <View style={styles.pricingDivider} />

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabelTotal}>Итого к оплате:</Text>
              <Text style={styles.pricingValueTotal}>
                {selectedOffer.finalPrice.toLocaleString()} ₽
              </Text>
            </View>
          </View>

          <View style={styles.routeInfo}>
            <View style={styles.routeInfoRow}>
              <Text style={styles.routeInfoLabel}>Расстояние:</Text>
              <Text style={styles.routeInfoValue}>{selectedOffer.estimatedDistance} км</Text>
            </View>
            <View style={styles.routeInfoRow}>
              <Text style={styles.routeInfoLabel}>Время в пути:</Text>
              <Text style={styles.routeInfoValue}>
                {Math.floor(selectedOffer.estimatedDuration / 60)} ч {selectedOffer.estimatedDuration % 60} мин
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {step === 1 && renderCargoForm()}
        {step === 2 && renderCarrierList()}
        {step === 3 && renderPricingSummary()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && step < 3 && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setStep(step - 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Назад</Text>
          </TouchableOpacity>
        )}

        {step === 1 && (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSearchCarriers}
              activeOpacity={0.8}
            >
              <Search size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Найти перевозчиков</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setStep(2)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Выбрать другого</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateOrder}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>Создать заказ</Text>
            </TouchableOpacity>
          </>
        )}
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
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  dimensionsTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  createButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  carrierCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  carrierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carrierName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  tripsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  carrierDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  carrierDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  carrierDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  carrierFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectCarrierText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  selectedCarrierCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedCarrierName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  pricingSection: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pricingValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  pricingDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  pricingLabelTotal: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  pricingValueTotal: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  routeInfo: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  routeInfoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
});
