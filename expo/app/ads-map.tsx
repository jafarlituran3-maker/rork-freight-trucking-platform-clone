import { Stack, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Package } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

import Colors from '@/constants/colors';
import { ShipperAd, CarrierAd } from '@/types';
import { mockAds } from '@/mocks/ads';
import { mockCarrierAds } from '@/mocks/carrier-ads';
import { useRole } from '@/contexts/RoleContext';

const RUSSIA_CENTER = { lat: 55.7558, lng: 37.6173 };

export default function AdsMapScreen() {
  const { role } = useRole();
  const [selected, setSelected] = useState<ShipperAd | CarrierAd | null>(null);
  const insets = useSafeAreaInsets();
  const isCargoOwner = role === 'cargo-owner';
  const ads = useMemo(() => isCargoOwner ? mockCarrierAds : mockAds, [isCargoOwner]);

  const mapHtml = useMemo(() => {
    const markers = ads
      .map(
        (ad, index) => {
          const isCarrier = 'truckInfo' in ad;
          const fromCity = isCarrier ? (ad.availableFrom && ad.availableFrom.city ? ad.availableFrom.city : 'N/A') : (ad.origin && ad.origin.city ? ad.origin.city : 'N/A');
          const toCity = isCarrier ? (ad.availableTo && ad.availableTo.city ? ad.availableTo.city : 'N/A') : (ad.destination && ad.destination.city ? ad.destination.city : 'N/A');
          const fromLat = isCarrier ? ad.availableFrom.lat : ad.origin.lat;
          const fromLng = isCarrier ? ad.availableFrom.lng : ad.origin.lng;
          const label = isCarrier ? `${ad.truckInfo.loadCapacity}т` : `${ad.tonnage}т`;
          const infoContent = isCarrier
            ? `<div style="padding: 8px;"><strong>${fromCity} → ${toCity}</strong><br/>${ad.truckInfo.brand} ${ad.truckInfo.model}<br/>${ad.truckInfo.loadCapacity} т · ${ad.averagePrice.toLocaleString("ru-RU")} ₽</div>`
            : `<div style="padding: 8px;"><strong>${fromCity} → ${toCity}</strong><br/>${ad.cargoType}<br/>${ad.tonnage} т · ${(ad.includesVAT ? ad.price / 1.2 : ad.price).toLocaleString("ru-RU")} ₽</div>`;
          
          return `
      const marker${index} = new google.maps.Marker({
        position: { lat: ${fromLat}, lng: ${fromLng} },
        map: map,
        title: "${fromCity} → ${toCity}",
        label: {
          text: "${label}",
          color: "white",
          fontSize: "11px",
          fontWeight: "bold"
        },
        animation: google.maps.Animation.DROP
      });
      
      const infoWindow${index} = new google.maps.InfoWindow({
        content: '${infoContent}'
      });
      
      marker${index}.addListener('click', () => {
        infoWindow${index}.open(map, marker${index});
      });`;
        }
      )
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; }
            #map { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              const center = { lat: ${RUSSIA_CENTER.lat}, lng: ${RUSSIA_CENTER.lng} };
              const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 5,
                center: center,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true
              });
              ${markers}
            }
          </script>
          <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap">
          </script>
        </body>
      </html>
    `;
  }, [ads]);

  const onOpenDetails = (ad: ShipperAd | CarrierAd) => {
    console.log('[AdsMapScreen] Opening details for ad:', ad.id);
    if ('truckInfo' in ad) {
      console.log('[AdsMapScreen] Carrier ad detected');
    } else {
      router.push(`/application-details?adId=${ad.id}` as any);
    }
  };

  return (
    <View style={styles.container} testID="ads-map-container">
      <Stack.Screen
        options={{
          title: isCargoOwner ? 'Объявления перевозчиков на карте' : 'Объявления на карте',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.surface,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <View style={styles.mapWrapper}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>

      <ScrollView 
        style={[styles.ordersList, { paddingTop: 12, paddingBottom: insets.bottom + 12 }]}
        contentContainerStyle={styles.ordersListContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.ordersTitle}>
          {isCargoOwner ? `Объявления перевозчиков (${ads.length})` : `Объявления грузовладельцев (${ads.length})`}
        </Text>
        {ads.map((ad) => (
          <TouchableOpacity
            key={ad.id}
            style={styles.orderCard}
            onPress={() => setSelected(ad)}
            activeOpacity={0.85}
            testID={`order-${ad.id}`}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderIcon}>
                <Package size={20} color={Colors.primary} />
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle} numberOfLines={1}>
                  {'truckInfo' in ad
                    ? `${ad.availableFrom?.city || 'N/A'} → ${ad.availableTo?.city || 'N/A'}`
                    : `${ad.origin?.city || 'N/A'} → ${ad.destination?.city || 'N/A'}`}
                </Text>
                <Text style={styles.orderSubtitle} numberOfLines={1}>
                  {'truckInfo' in ad
                    ? `${ad.truckInfo.brand} ${ad.truckInfo.model}`
                    : ad.cargoType}
                </Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderDetail}>
                {'truckInfo' in ad
                  ? `${ad.truckInfo.loadCapacity} т · ${ad.averagePrice.toLocaleString('ru-RU')} ₽`
                  : `${ad.tonnage} т · ${(ad.includesVAT ? ad.price / 1.2 : ad.price).toLocaleString('ru-RU')} ₽`}
              </Text>
              <Text style={styles.orderDate}>
                {'truckInfo' in ad
                  ? `До ${new Date(ad.availableDate).toLocaleDateString('ru-RU')}`
                  : `До ${new Date(ad.requiredDate).toLocaleDateString('ru-RU')}`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selected && (
        <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {'truckInfo' in selected
                  ? `${selected.availableFrom?.city || 'N/A'} → ${selected.availableTo?.city || 'N/A'}`
                  : `${selected.origin?.city || 'N/A'} → ${selected.destination?.city || 'N/A'}`}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn} testID="close-selected">
                <X size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {'truckInfo' in selected ? (
                <>
                  <Text style={styles.modalLabel}>Транспорт</Text>
                  <Text style={styles.modalValue}>
                    {selected.truckInfo.brand} {selected.truckInfo.model} ({selected.truckInfo.year})
                  </Text>
                  
                  <Text style={styles.modalLabel}>Грузоподъемность и цена</Text>
                  <Text style={styles.modalValue}>
                    {selected.truckInfo.loadCapacity} т · {selected.averagePrice.toLocaleString('ru-RU')} ₽
                  </Text>
                  
                  <Text style={styles.modalLabel}>Расстояние</Text>
                  <Text style={styles.modalValue}>{selected.distance} км</Text>
                  
                  <Text style={styles.modalLabel}>Доступен с</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selected.availableDate).toLocaleDateString('ru-RU')}
                  </Text>
                  
                  <Text style={styles.modalLabel}>Перевозчик</Text>
                  <Text style={styles.modalValue}>{selected.carrierCompany.name}</Text>
                  <Text style={styles.modalSubvalue}>
                    Рейтинг: {selected.carrierRating.toFixed(1)} ⭐
                  </Text>
                  
                  <Text style={styles.modalLabel}>Завершенных рейсов</Text>
                  <Text style={styles.modalValue}>{selected.totalTripsCompleted}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.modalLabel}>Тип груза</Text>
                  <Text style={styles.modalValue}>{selected.cargoType}</Text>
                  
                  <Text style={styles.modalLabel}>Вес и стоимость</Text>
                  <Text style={styles.modalValue}>
                    {selected.tonnage} т · {(selected.includesVAT ? selected.price / 1.2 : selected.price).toLocaleString('ru-RU')} ₽
                    {selected.includesVAT ? ' без НДС' : ' без НДС'}
                  </Text>
                  
                  <Text style={styles.modalLabel}>Расстояние</Text>
                  <Text style={styles.modalValue}>{selected.distance} км</Text>
                  
                  <Text style={styles.modalLabel}>Дата отправки</Text>
                  <Text style={styles.modalValue}>
                    До {new Date(selected.requiredDate).toLocaleDateString('ru-RU')}
                  </Text>
                  
                  <Text style={styles.modalLabel}>Грузовладелец</Text>
                  <Text style={styles.modalValue}>{selected.shipperCompany.name}</Text>
                  <Text style={styles.modalSubvalue}>
                    Рейтинг: {selected.shipperRating.toFixed(1)} ⭐
                  </Text>
                </>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalBtn} 
              onPress={() => onOpenDetails(selected)} 
              activeOpacity={0.85} 
              testID="apply-selected"
            >
              <Send size={18} color={Colors.surface} />
              <Text style={styles.modalBtnText}>Подать заявку</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  mapWrapper: { height: '40%', backgroundColor: Colors.surface },
  map: { flex: 1 },
  ordersList: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  ordersListContent: {
    paddingBottom: 16,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  orderSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDetail: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  closeBtn: { padding: 6 },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: 300,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  modalSubvalue: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalBtnText: { 
    color: Colors.surface, 
    fontWeight: '700', 
    fontSize: 16,
  },
});
