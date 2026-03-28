import { useRouter } from 'expo-router';
import { Plus, Search, Truck, Star, Clock, MapPin, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

import OrderCard from '@/components/OrderCard';
import Colors from '@/constants/colors';
import { useOrders } from '@/contexts/OrderContext';
import { useRole } from '@/contexts/RoleContext';
import { Order, CarrierOffer } from '@/types';
import { mockCarriers, generateOffers } from '@/mocks/vehicle-offers';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders } = useOrders();
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | Order['status']>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'trips'>('price');

  const isCarrier = role === 'carrier';
  const isCargoOwner = role === 'cargo-owner';
  const title = isCarrier ? 'Заказы' : 'Мои заявки';

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.origin.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.destination.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cargoType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const filters: { key: 'all' | Order['status']; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'created', label: 'Новые' },
    { key: 'in_transit', label: 'В пути' },
    { key: 'delivered', label: 'Доставлено' },
  ];

  const availableOffers: CarrierOffer[] = generateOffers(5000, 500).filter((offer) => {
    const matchesSearch = offer.carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.carrier.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedOffers = [...availableOffers].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.finalPrice - b.finalPrice;
      case 'rating':
        return b.carrier.rating - a.carrier.rating;
      case 'trips':
        return b.carrier.totalTrips - a.carrier.totalTrips;
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} мин`;
    } else if (hours < 24) {
      return `${Math.round(hours)} ч`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `${days} д ${remainingHours} ч` : `${days} д`;
    }
  };

  if (isCargoOwner) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск перевозчиков..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.sortContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortList}>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'price' && styles.sortChipActive]}
              onPress={() => setSortBy('price')}
              activeOpacity={0.7}
            >
              <TrendingUp size={16} color={sortBy === 'price' ? '#FFFFFF' : Colors.text} />
              <Text style={[styles.sortChipText, sortBy === 'price' && styles.sortChipTextActive]}>
                По цене
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'rating' && styles.sortChipActive]}
              onPress={() => setSortBy('rating')}
              activeOpacity={0.7}
            >
              <Star size={16} color={sortBy === 'rating' ? '#FFFFFF' : Colors.text} />
              <Text style={[styles.sortChipText, sortBy === 'rating' && styles.sortChipTextActive]}>
                По рейтингу
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'trips' && styles.sortChipActive]}
              onPress={() => setSortBy('trips')}
              activeOpacity={0.7}
            >
              <MapPin size={16} color={sortBy === 'trips' ? '#FFFFFF' : Colors.text} />
              <Text style={[styles.sortChipText, sortBy === 'trips' && styles.sortChipTextActive]}>
                По опыту
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <FlatList
          data={sortedOffers}
          keyExtractor={(item) => item.carrier.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.offerCard}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/orders/carrier/${item.carrier.id}` as any)}
            >
              <View style={styles.offerHeader}>
                <View style={styles.offerHeaderLeft}>
                  <View style={styles.carrierIconContainer}>
                    <Truck size={24} color={Colors.accent} />
                  </View>
                  <View style={styles.carrierInfo}>
                    <Text style={styles.carrierName}>{item.carrier.name}</Text>
                    <View style={styles.carrierStats}>
                      <View style={styles.statItem}>
                        <Star size={14} color="#FFA500" fill="#FFA500" />
                        <Text style={styles.statText}>{item.carrier.rating}</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <Text style={styles.statText}>{item.carrier.totalTrips} рейсов</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Цена</Text>
                  <Text style={styles.priceValue}>{formatPrice(item.finalPrice)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.offerDetails}>
                <View style={styles.detailRow}>
                  <Truck size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{item.carrier.vehicleType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{item.estimatedDistance} км</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>
                    ~{formatDuration(item.estimatedDuration)}
                  </Text>
                </View>
              </View>

              <View style={styles.capacityInfo}>
                <Text style={styles.capacityText}>
                  Грузоподъемность: {item.carrier.maxCapacity / 1000} т
                </Text>
                <Text style={styles.capacityText}>Объем: {item.carrier.maxVolume} м³</Text>
              </View>

              <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceBreakdownLabel}>Базовая цена:</Text>
                  <Text style={styles.priceBreakdownValue}>{formatPrice(item.basePrice)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceBreakdownLabel}>Комиссия:</Text>
                  <Text style={styles.priceBreakdownValue}>{formatPrice(item.commission)}</Text>
                </View>
              </View>

              <View style={styles.regionsContainer}>
                <Text style={styles.regionsLabel}>Регионы:</Text>
                <View style={styles.regionTags}>
                  {item.carrier.availableRegions.slice(0, 2).map((region, idx) => (
                    <View key={idx} style={styles.regionTag}>
                      <Text style={styles.regionTagText}>{region}</Text>
                    </View>
                  ))}
                  {item.carrier.availableRegions.length > 2 && (
                    <Text style={styles.moreRegions}>
                      +{item.carrier.availableRegions.length - 2}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Предложения не найдены</Text>
              <Text style={styles.emptySubtext}>
                Попробуйте изменить параметры поиска
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={isCarrier ? 'Поиск заказов...' : 'Поиск заявок...'}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(tabs)/orders/create' as any)}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{isCarrier ? 'Заказы не найдены' : 'Заявки не найдены'}</Text>
            <Text style={styles.emptySubtext}>
              {isCarrier ? 'Попробуйте изменить параметры поиска' : 'Создайте новую заявку на перевозку'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  createButton: {
    backgroundColor: Colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filtersContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sortContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  sortList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  sortChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  offerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  carrierIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrierInfo: {
    flex: 1,
  },
  carrierName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  carrierStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  offerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
  },
  capacityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  priceBreakdown: {
    gap: 6,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceBreakdownLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceBreakdownValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  regionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionsLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  regionTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  regionTag: {
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  regionTagText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  moreRegions: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
