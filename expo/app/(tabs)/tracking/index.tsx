import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

import Colors from '@/constants/colors';
import { mockOrders } from '@/mocks/orders';

export default function TrackingScreen() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    mockOrders.find((o) => o.tracking)?.id || null
  );

  const activeOrders = mockOrders.filter((o) => o.tracking);
  const selectedOrder = useMemo(
    () => activeOrders.find((o) => o.id === selectedOrderId),
    [activeOrders, selectedOrderId]
  );

  const mapHtml = useMemo(() => {
    if (!selectedOrder) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin: 0; padding: 0; }
              #map { width: 100%; height: 100vh; }
            </style>
          </head>
          <body>
            <iframe
              id="map"
              src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=55.7558,37.6173&zoom=10"
              frameborder="0"
              style="border:0;"
              allowfullscreen=""
              loading="lazy">
            </iframe>
          </body>
        </html>
      `;
    }

    const { origin, destination, tracking } = selectedOrder;
    const currentLat = tracking?.currentLocation?.lat || origin.lat;
    const currentLng = tracking?.currentLocation?.lng || origin.lng;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <iframe
            id="map"
            src="https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&waypoints=${currentLat},${currentLng}"
            frameborder="0"
            style="border:0;"
            allowfullscreen=""
            loading="lazy">
          </iframe>
        </body>
      </html>
    `;
  }, [selectedOrder]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={
              selectedOrder
                ? `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${selectedOrder.origin.lat},${selectedOrder.origin.lng}&destination=${selectedOrder.destination.lat},${selectedOrder.destination.lng}${selectedOrder.tracking ? `&waypoints=${selectedOrder.tracking.currentLocation.lat},${selectedOrder.tracking.currentLocation.lng}` : ''}`
                : 'https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=55.7558,37.6173&zoom=10'
            }
            style={{ width: '100%', height: '100%', border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <WebView
            source={{ html: mapHtml }}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        )}
      </View>

      <ScrollView style={styles.bottomSheet} contentContainerStyle={styles.bottomSheetContent}>
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>Активные заказы</Text>

        {activeOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={[
              styles.orderCard,
              selectedOrderId === order.id && styles.orderCardSelected,
            ]}
            onPress={() => setSelectedOrderId(order.id)}
            activeOpacity={0.7}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Заказ #{order.id}</Text>
              <View style={[styles.statusDot, { backgroundColor: Colors.statusInTransit }]} />
            </View>

            <View style={styles.routeShort}>
              <Text style={styles.routeText} numberOfLines={1}>
                {order.origin.address}
              </Text>
              <Navigation size={14} color={Colors.textSecondary} />
              <Text style={styles.routeText} numberOfLines={1}>
                {order.destination.address}
              </Text>
            </View>

            {order.tracking && selectedOrderId === order.id && (
              <View style={styles.trackingDetails}>
                <View style={styles.trackingRow}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={styles.trackingLabel}>Прибытие:</Text>
                  <Text style={styles.trackingValue}>
                    {new Date(order.tracking.estimatedArrival).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.trackingRow}>
                  <TrendingUp size={16} color={Colors.textSecondary} />
                  <Text style={styles.trackingLabel}>Осталось:</Text>
                  <Text style={styles.trackingValue}>
                    {order.tracking.distanceRemaining} км
                  </Text>
                </View>

                <View style={styles.trackingRow}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.trackingLabel}>Обновлено:</Text>
                  <Text style={styles.trackingValue}>
                    {new Date(order.tracking.lastUpdate).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {activeOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <MapPin size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Нет активных заказов</Text>
            <Text style={styles.emptySubtext}>
              Заказы в пути будут отображаться здесь
            </Text>
          </View>
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
  mapContainer: {
    height: 400,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  webView: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  bottomSheetContent: {
    padding: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  orderCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeShort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  trackingDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  trackingValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
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
