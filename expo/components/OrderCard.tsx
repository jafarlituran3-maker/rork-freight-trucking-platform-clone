import { useRouter } from 'expo-router';
import { Package, Calendar, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '@/constants/colors';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'created':
        return Colors.statusPending;
      case 'assigned':
        return Colors.info;
      case 'in_transit':
        return Colors.statusInTransit;
      case 'delivered':
        return Colors.statusDelivered;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.statusCancelled;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'created':
        return 'Создан';
      case 'assigned':
        return 'Назначен';
      case 'in_transit':
        return 'В пути';
      case 'delivered':
        return 'Доставлен';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/orders/${order.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>Заказ #{order.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.price}>
          {order.price.toLocaleString('ru-RU')} {order.currency}
        </Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Откуда</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {order.origin.address}
            </Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: Colors.error }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Куда</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>
              {order.destination.address}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Package size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{order.cargoType}</Text>
        </View>
        <View style={styles.infoItem}>
          <TrendingUp size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{order.weight / 1000} т</Text>
        </View>
        <View style={styles.infoItem}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{formatDate(order.requiredDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  price: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
