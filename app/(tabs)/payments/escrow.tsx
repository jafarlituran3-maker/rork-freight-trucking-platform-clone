import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useEscrowPayments } from '@/contexts/EscrowPaymentContext';
import { useOrders } from '@/contexts/OrderContext';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react-native';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'payment_confirmed':
    case 'payment_released':
      return '#10B981';
    case 'payment_hold':
      return '#F59E0B';
    case 'payment_pending':
    case 'payment_created':
      return '#3B82F6';
    case 'payment_refund':
      return '#8B5CF6';
    case 'payment_failed':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'payment_created':
      return 'Создан';
    case 'payment_pending':
      return 'Ожидает оплаты';
    case 'payment_hold':
      return 'Удержан в эскроу';
    case 'payment_confirmed':
      return 'Подтверждён';
    case 'payment_released':
      return 'Выплачен';
    case 'payment_refund':
      return 'Возврат';
    case 'payment_failed':
      return 'Ошибка';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  const color = getStatusColor(status);
  switch (status) {
    case 'payment_confirmed':
    case 'payment_released':
      return <CheckCircle size={24} color={color} />;
    case 'payment_hold':
      return <Clock size={24} color={color} />;
    case 'payment_failed':
      return <XCircle size={24} color={color} />;
    default:
      return <AlertCircle size={24} color={color} />;
  }
};

export default function EscrowPaymentScreen() {
  const { payments, confirmPayment, refundCustomer } = useEscrowPayments();
  const { orders } = useOrders();

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      await confirmPayment(paymentId);
      Alert.alert('Успешно', 'Платёж подтверждён и удержан в эскроу');
    } catch (error) {
      Alert.alert('Ошибка', String(error));
    }
  };

  const handleRefund = async (paymentId: string) => {
    Alert.alert(
      'Возврат средств',
      'Вы уверены, что хотите вернуть средства заказчику?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Возврат',
          style: 'destructive',
          onPress: async () => {
            try {
              await refundCustomer(paymentId);
              Alert.alert('Успешно', 'Средства возвращены заказчику');
            } catch (error) {
              Alert.alert('Ошибка', String(error));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Управление Эскроу' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Все платежи</Text>
          
          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Нет платежей</Text>
            </View>
          ) : (
            payments.map((payment) => {
              const order = orders.find(o => o.id === payment.orderId);
              return (
                <View key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.statusBadge}>
                      {getStatusIcon(payment.status)}
                      <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                        {getStatusText(payment.status)}
                      </Text>
                    </View>
                    <Text style={styles.paymentAmount}>
                      {payment.amountTotal.toLocaleString()} {payment.currency}
                    </Text>
                  </View>

                  <View style={styles.paymentInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ID платежа:</Text>
                      <Text style={styles.infoValue}>{payment.id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Заказ:</Text>
                      <Text style={styles.infoValue}>{payment.orderId}</Text>
                    </View>
                    {order && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Маршрут:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {order.origin.address} → {order.destination.address}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.financialBreakdown}>
                    <Text style={styles.breakdownTitle}>Распределение средств:</Text>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Перевозчику:</Text>
                      <Text style={styles.breakdownValue}>
                        {payment.amountCarrier.toLocaleString()} {payment.currency}
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Комиссия платформы:</Text>
                      <Text style={styles.breakdownValue}>
                        {payment.amountPlatformCommission.toLocaleString()} {payment.currency}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timestamps}>
                    <Text style={styles.timestampText}>
                      Создан: {new Date(payment.createdAt).toLocaleString('ru-RU')}
                    </Text>
                    {payment.heldAt && (
                      <Text style={styles.timestampText}>
                        Удержан: {new Date(payment.heldAt).toLocaleString('ru-RU')}
                      </Text>
                    )}
                    {payment.releasedAt && (
                      <Text style={styles.timestampText}>
                        Выплачен: {new Date(payment.releasedAt).toLocaleString('ru-RU')}
                      </Text>
                    )}
                    {payment.refundedAt && (
                      <Text style={styles.timestampText}>
                        Возвращён: {new Date(payment.refundedAt).toLocaleString('ru-RU')}
                      </Text>
                    )}
                  </View>

                  <View style={styles.actions}>
                    {payment.status === 'payment_created' && (
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => handleConfirmPayment(payment.id)}
                      >
                        <Text style={styles.buttonText}>Подтвердить платёж</Text>
                      </TouchableOpacity>
                    )}
                    
                    {payment.status === 'payment_hold' && (
                      <TouchableOpacity
                        style={styles.refundButton}
                        onPress={() => handleRefund(payment.id)}
                      >
                        <Text style={styles.buttonText}>Вернуть средства</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  paymentInfo: {
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500' as const,
    flex: 2,
    textAlign: 'right',
  },
  financialBreakdown: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600' as const,
  },
  timestamps: {
    marginBottom: 16,
    gap: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  refundButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
