import { MapPin, Navigation, Truck } from 'lucide-react-native';
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
import { mockTrips } from '@/mocks/trips';
import { Trip } from '@/types';

export default function TripsMapScreen() {
  const activeTrips = mockTrips.filter(
    (trip) => trip.status === 'in_transit' || trip.status === 'loading' || trip.status === 'unloading'
  );

  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    activeTrips[0]?.id || null
  );

  const selectedTrip = useMemo(
    () => activeTrips.find((t) => t.id === selectedTripId),
    [activeTrips, selectedTripId]
  );

  const mapHtml = useMemo(() => {
    if (!selectedTrip || !selectedTrip.tracking) {
      const centerLat = 55.7558;
      const centerLng = 37.6173;
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
              src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${centerLat},${centerLng}&zoom=5"
              frameborder="0"
              style="border:0;"
              allowfullscreen=""
              loading="lazy">
            </iframe>
          </body>
        </html>
      `;
    }

    const { origin, destination, tracking } = selectedTrip;
    const currentLat = tracking.currentLocation.lat;
    const currentLng = tracking.currentLocation.lng;

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
  }, [selectedTrip]);

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'in_transit':
        return Colors.primary;
      case 'loading':
        return '#FF9800';
      case 'unloading':
        return '#9C27B0';
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={
              selectedTrip && selectedTrip.tracking
                ? `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${selectedTrip.origin.lat},${selectedTrip.origin.lng}&destination=${selectedTrip.destination.lat},${selectedTrip.destination.lng}&waypoints=${selectedTrip.tracking.currentLocation.lat},${selectedTrip.tracking.currentLocation.lng}`
                : 'https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=55.7558,37.6173&zoom=5'
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
            scalesPageToFit
          />
        )}
      </View>

      {selectedTrip && selectedTrip.tracking && (
        <View style={styles.infoOverlay}>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Navigation size={20} color={Colors.accent} />
              <Text style={styles.locationTitle}>Текущее местоположение</Text>
            </View>
            <Text style={styles.locationAddress}>
              {selectedTrip.tracking.currentLocation.address}
            </Text>
            <View style={styles.locationMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Скорость:</Text>
                <Text style={styles.metaValue}>
                  {selectedTrip.tracking.speed || 0} км/ч
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Пройдено:</Text>
                <Text style={styles.metaValue}>
                  {selectedTrip.tracking.distanceCovered} км
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Осталось:</Text>
                <Text style={styles.metaValue}>
                  {selectedTrip.tracking.distanceRemaining} км
                </Text>
              </View>
            </View>
            <Text style={styles.updateTime}>
              Обновлено:{' '}
              {new Date(selectedTrip.tracking.lastUpdate).toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.routeCard}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Откуда</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {selectedTrip.origin.address}
                </Text>
              </View>
            </View>
            <View style={styles.routeArrow}>
              <View style={styles.routeLine} />
              <MapPin size={16} color={Colors.primary} />
            </View>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Куда</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {selectedTrip.destination.address}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeTrips.length > 0 && (
        <View style={styles.tripsList}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripsContent}
          >
            {activeTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={[
                  styles.tripItem,
                  selectedTripId === trip.id && styles.tripItemActive,
                ]}
                onPress={() => setSelectedTripId(trip.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.tripStatus,
                    { backgroundColor: getStatusColor(trip.status) },
                  ]}
                />
                <View style={styles.tripItemContent}>
                  <View style={styles.tripItemHeader}>
                    <Truck size={16} color={Colors.text} />
                    <Text style={styles.tripItemId} numberOfLines={1}>
                      {trip.id}
                    </Text>
                  </View>
                  <Text style={styles.tripItemRoute} numberOfLines={1}>
                    {trip.origin.address.split(',')[0]} →{' '}
                    {trip.destination.address.split(',')[0]}
                  </Text>
                  {trip.tracking && (
                    <Text style={styles.tripItemDistance}>
                      {trip.tracking.distanceRemaining} км до цели
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {activeTrips.length === 0 && (
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyCard}>
            <Truck size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Нет активных рейсов</Text>
            <Text style={styles.emptySubtext}>
              Активные рейсы будут отображаться на карте
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  infoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    gap: 12,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  locationAddress: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
  },
  locationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  updateTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingVertical: 4,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginRight: 8,
  },
  tripsList: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  tripsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tripItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripItemActive: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  tripStatus: {
    height: 4,
  },
  tripItemContent: {
    padding: 12,
  },
  tripItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tripItemId: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  tripItemRoute: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 4,
  },
  tripItemDistance: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  emptyCard: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700' as const,
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
