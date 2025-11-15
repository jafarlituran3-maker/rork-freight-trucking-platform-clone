import { useRouter } from 'expo-router';
import {
  CreditCard,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Shield,
  DollarSign,
} from 'lucide-react-native';
import React from 'react';
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

export default function PaymentsScreen() {
  const router = useRouter();
  const { paymentMethods, getPaymentsByStatus } = usePayments();

  const pendingPayments = getPaymentsByStatus('pending');
  const paidPayments = getPaymentsByStatus('paid');
  const failedPayments = getPaymentsByStatus('failed');

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'pending':
        return <Clock size={20} color={Colors.warning} />;
      case 'processing':
        return <Clock size={20} color={Colors.primary} />;
      case 'failed':
        return <AlertCircle size={20} color={Colors.error} />;
      case 'refunded':
        return <AlertCircle size={20} color={Colors.textSecondary} />;
      default:
        return <Clock size={20} color={Colors.textSecondary} />;
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'Оплачено';
      case 'pending':
        return 'Ожидает оплаты';
      case 'processing':
        return 'Обработка';
      case 'failed':
        return 'Ошибка';
      case 'refunded':
        return 'Возврат';
      default:
        return status;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'processing':
        return Colors.primary;
      case 'failed':
        return Colors.error;
      case 'refunded':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getOrderById = (orderId: string) => {
    return mockOrders.find((o) => o.id === orderId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ожидают оплаты</Text>
            <Text style={styles.statValue}>{pendingPayments.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Оплачено</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {paidPayments.length}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ошибки</Text>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {failedPayments.length}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/payments/methods' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonLeft}>
              <CreditCard size={24} color={Colors.primary} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Способы оплаты</Text>
                <Text style={styles.actionButtonSubtitle}>
                  {paymentMethods.length} активных
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/payments/history' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonLeft}>
              <History size={24} color={Colors.primary} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>История платежей</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Все транзакции
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/payments/escrow' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonLeft}>
              <Shield size={24} color={Colors.primary} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Управление Эскроу</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Безопасные сделки
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/payments/payouts' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonLeft}>
              <DollarSign size={24} color={Colors.primary} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Мои Выплаты</Text>
                <Text style={styles.actionButtonSubtitle}>
                  История выплат
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>


        </View>

        {pendingPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Требуют оплаты</Text>
            {pendingPayments.map((payment) => {
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
                  <View style={styles.paymentCardHeader}>
                    <View style={styles.paymentCardLeft}>
                      {getStatusIcon(payment.status)}
                      <View style={styles.paymentCardInfo}>
                        <Text style={styles.paymentCardTitle}>
                          Заказ #{order.id}
                        </Text>
                        <Text style={styles.paymentCardSubtitle}>
                          {order.cargoType}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.paymentCardRight}>
                      <Text style={styles.paymentCardAmount}>
                        {payment.amount.toLocaleString('ru-RU')} ₽
                      </Text>
                      <Text
                        style={[
                          styles.paymentCardStatus,
                          { color: getStatusColor(payment.status) },
                        ]}
                      >
                        {getStatusText(payment.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {paidPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Последние платежи</Text>
            {paidPayments.slice(0, 5).map((payment) => {
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
                  <View style={styles.paymentCardHeader}>
                    <View style={styles.paymentCardLeft}>
                      {getStatusIcon(payment.status)}
                      <View style={styles.paymentCardInfo}>
                        <Text style={styles.paymentCardTitle}>
                          Заказ #{order.id}
                        </Text>
                        <Text style={styles.paymentCardSubtitle}>
                          {new Date(payment.paidAt!).toLocaleDateString(
                            'ru-RU'
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.paymentCardRight}>
                      <Text style={styles.paymentCardAmount}>
                        {payment.amount.toLocaleString('ru-RU')} ₽
                      </Text>
                      <Text
                        style={[
                          styles.paymentCardStatus,
                          { color: getStatusColor(payment.status) },
                        ]}
                      >
                        {getStatusText(payment.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentCardInfo: {
    flex: 1,
  },
  paymentCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  paymentCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentCardRight: {
    alignItems: 'flex-end',
  },
  paymentCardAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  paymentCardStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
