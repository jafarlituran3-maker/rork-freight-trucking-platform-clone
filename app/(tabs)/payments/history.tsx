import { useRouter } from 'expo-router';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Colors from '@/constants/colors';
import { usePayments } from '@/contexts/PaymentContext';
import { mockOrders } from '@/mocks/orders';
import { PaymentStatus } from '@/types';

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { payments } = usePayments();
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');

  const filteredPayments =
    filterStatus === 'all'
      ? payments
      : payments.filter((p) => p.status === filterStatus);

  const sortedPayments = [...filteredPayments].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'payment_confirmed':
      case 'payment_released':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'payment_pending':
      case 'payment_created':
        return <Clock size={20} color={Colors.warning} />;
      case 'payment_hold':
        return <Clock size={20} color={Colors.primary} />;
      case 'payment_failed':
        return <AlertCircle size={20} color={Colors.error} />;
      case 'payment_refund':
        return <AlertCircle size={20} color={Colors.textSecondary} />;
      default:
        return <Clock size={20} color={Colors.textSecondary} />;
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'payment_created':
        return 'Создан';
      case 'payment_pending':
        return 'Ожидает';
      case 'payment_hold':
        return 'Удержано';
      case 'payment_confirmed':
        return 'Оплачено';
      case 'payment_released':
        return 'Выплачено';
      case 'payment_refund':
        return 'Возврат';
      case 'payment_failed':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'payment_confirmed':
      case 'payment_released':
        return Colors.success;
      case 'payment_pending':
      case 'payment_created':
        return Colors.warning;
      case 'payment_hold':
        return Colors.primary;
      case 'payment_failed':
        return Colors.error;
      case 'payment_refund':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getOrderById = (orderId: string) => {
    return mockOrders.find((o) => o.id === orderId);
  };

  const filters: { value: PaymentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'payment_pending', label: 'Ожидают' },
    { value: 'payment_confirmed', label: 'Оплачено' },
    { value: 'payment_failed', label: 'Ошибки' },
    { value: 'payment_refund', label: 'Возвраты' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Filter size={20} color={Colors.text} />
          <Text style={styles.filterTitle}>Фильтр</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                filterStatus === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(filter.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === filter.value && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {sortedPayments.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Нет платежей</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'all'
                ? 'История платежей пуста'
                : 'Платежи с таким статусом не найдены'}
            </Text>
          </View>
        ) : (
          sortedPayments.map((payment) => {
            const order = getOrderById(payment.orderId);
            if (!order) return null;

            return (
              <TouchableOpacity
                key={payment.id}
                style={styles.paymentCard}
                onPress={() =>
                  router.push(`/(tabs)/payments/${payment.id}` as any)
                }
                activeOpacity={0.7}
              >
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentLeft}>
                    {getStatusIcon(payment.status)}
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentTitle}>
                        Заказ #{order.id}
                      </Text>
                      <Text style={styles.paymentSubtitle}>
                        {order.cargoType}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>
                      {payment.amountTotal.toLocaleString('ru-RU')} ₽
                    </Text>
                    <Text
                      style={[
                        styles.paymentStatus,
                        { color: getStatusColor(payment.status) },
                      ]}
                    >
                      {getStatusText(payment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentFooter}>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.updatedAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {payment.transactionId && (
                    <Text style={styles.transactionId}>
                      ID: {payment.transactionId}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
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
  filterContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHover,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  paymentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionId: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'monospace' as any,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
