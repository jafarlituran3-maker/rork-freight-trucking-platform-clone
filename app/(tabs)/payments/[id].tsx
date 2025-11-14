import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  CreditCard,
  Calendar,
  Hash,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import Colors from '@/constants/colors';
import { usePayments } from '@/contexts/PaymentContext';
import { mockOrders } from '@/mocks/orders';
import { PaymentStatus } from '@/types';

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    payments,
    getPaymentMethodById,
    getDefaultPaymentMethod,
    processPayment,
    refundPayment,
  } = usePayments();

  const [isProcessing, setIsProcessing] = useState(false);

  const payment = payments.find((p) => p.id === id);
  const order = payment ? mockOrders.find((o) => o.id === payment.orderId) : null;
  const paymentMethod = payment?.paymentMethodId
    ? getPaymentMethodById(payment.paymentMethodId)
    : null;

  if (!payment || !order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Платеж не найден</Text>
      </View>
    );
  }

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={32} color={Colors.success} />;
      case 'pending':
        return <Clock size={32} color={Colors.warning} />;
      case 'processing':
        return <Clock size={32} color={Colors.primary} />;
      case 'failed':
        return <AlertCircle size={32} color={Colors.error} />;
      case 'refunded':
        return <AlertCircle size={32} color={Colors.textSecondary} />;
      default:
        return <Clock size={32} color={Colors.textSecondary} />;
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

  const handlePayment = async () => {
    const defaultMethod = getDefaultPaymentMethod();
    if (!defaultMethod) {
      Alert.alert('Ошибка', 'Не выбран способ оплаты');
      return;
    }

    setIsProcessing(true);
    try {
      await processPayment(payment.id, defaultMethod.id);
      Alert.alert('Успех', 'Платеж успешно обработан');
    } catch {
      Alert.alert('Ошибка', 'Не удалось обработать платеж');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите вернуть платеж?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Вернуть',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await refundPayment(payment.id);
              Alert.alert('Успех', 'Платеж возвращен');
            } catch {
              Alert.alert('Ошибка', 'Не удалось вернуть платеж');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.statusCard}>
          {getStatusIcon(payment.status)}
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(payment.status) },
            ]}
          >
            {getStatusText(payment.status)}
          </Text>
          <Text style={styles.amount}>
            {payment.amount.toLocaleString('ru-RU')} {payment.currency}
          </Text>
          {payment.description && (
            <Text style={styles.description}>{payment.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Информация о заказе</Text>
          </View>

          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/(tabs)/orders/${order.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Номер заказа:</Text>
              <Text style={styles.infoValue}>#{order.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Тип груза:</Text>
              <Text style={styles.infoValue}>{order.cargoType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Маршрут:</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.infoValue}>{order.origin.address}</Text>
                <Text style={styles.routeArrow}>→</Text>
                <Text style={styles.infoValue}>{order.destination.address}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {paymentMethod && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Способ оплаты</Text>
            </View>

            <View style={styles.paymentMethodCard}>
              <Text style={styles.paymentMethodName}>{paymentMethod.name}</Text>
              <Text style={styles.paymentMethodDetails}>
                {paymentMethod.details}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Даты</Text>
          </View>

          <View style={styles.datesCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Создан:</Text>
              <Text style={styles.infoValue}>
                {new Date(payment.createdAt).toLocaleString('ru-RU')}
              </Text>
            </View>
            {payment.paidAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Оплачен:</Text>
                <Text style={styles.infoValue}>
                  {new Date(payment.paidAt).toLocaleString('ru-RU')}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Обновлен:</Text>
              <Text style={styles.infoValue}>
                {new Date(payment.updatedAt).toLocaleString('ru-RU')}
              </Text>
            </View>
          </View>
        </View>

        {payment.transactionId && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Hash size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>ID транзакции</Text>
            </View>

            <View style={styles.transactionCard}>
              <Text style={styles.transactionId}>{payment.transactionId}</Text>
            </View>
          </View>
        )}

        {payment.status === 'pending' && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handlePayment}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <CreditCard size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Оплатить</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {payment.status === 'paid' && (
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleRefund}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Вернуть платеж</Text>
            )}
          </TouchableOpacity>
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
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  routeArrow: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentMethodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  paymentMethodDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  datesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  transactionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    fontFamily: 'monospace' as any,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
