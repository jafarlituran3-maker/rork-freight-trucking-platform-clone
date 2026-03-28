import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useEscrowPayments } from '@/contexts/EscrowPaymentContext';
import { useUser } from '@/contexts/UserContext';
import { CheckCircle, Clock, XCircle, TrendingUp, DollarSign } from 'lucide-react-native';

const getPayoutStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'processing':
      return '#F59E0B';
    case 'pending':
      return '#3B82F6';
    case 'failed':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getPayoutStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Ожидает';
    case 'processing':
      return 'Обрабатывается';
    case 'completed':
      return 'Выплачено';
    case 'failed':
      return 'Ошибка';
    default:
      return status;
  }
};

const getPayoutStatusIcon = (status: string) => {
  const color = getPayoutStatusColor(status);
  switch (status) {
    case 'completed':
      return <CheckCircle size={20} color={color} />;
    case 'processing':
    case 'pending':
      return <Clock size={20} color={color} />;
    case 'failed':
      return <XCircle size={20} color={color} />;
    default:
      return <Clock size={20} color={color} />;
  }
};

export default function CarrierPayoutsScreen() {
  const { user } = useUser();
  const { payments, getPaymentsByCarrier, getPayoutsByCarrier } = useEscrowPayments();

  const carrierPayments = user ? getPaymentsByCarrier(user.id) : [];
  const carrierPayouts = user ? getPayoutsByCarrier(user.id) : [];

  const totalEarnings = carrierPayouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = carrierPayments.filter(
    p => p.status === 'payment_confirmed' || p.status === 'payment_hold'
  );

  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amountCarrier, 0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Мои Выплаты' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <DollarSign size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{totalEarnings.toLocaleString()} ₽</Text>
            <Text style={styles.statLabel}>Всего заработано</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{pendingAmount.toLocaleString()} ₽</Text>
            <Text style={styles.statLabel}>В ожидании</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>История выплат</Text>
          
          {carrierPayouts.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Нет выплат</Text>
            </View>
          ) : (
            carrierPayouts.map((payout) => {
              const payment = payments.find(p => p.id === payout.paymentId);
              return (
                <View key={payout.id} style={styles.payoutCard}>
                  <View style={styles.payoutHeader}>
                    <View style={styles.statusBadge}>
                      {getPayoutStatusIcon(payout.status)}
                      <Text style={[styles.statusText, { color: getPayoutStatusColor(payout.status) }]}>
                        {getPayoutStatusText(payout.status)}
                      </Text>
                    </View>
                    <Text style={styles.payoutAmount}>
                      +{payout.amount.toLocaleString()} {payout.currency}
                    </Text>
                  </View>

                  <View style={styles.payoutInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ID выплаты:</Text>
                      <Text style={styles.infoValue}>{payout.id}</Text>
                    </View>
                    {payment && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Заказ:</Text>
                        <Text style={styles.infoValue}>{payment.orderId}</Text>
                      </View>
                    )}
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Дата создания:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(payout.createdAt).toLocaleDateString('ru-RU')}
                      </Text>
                    </View>
                    {payout.processedAt && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Дата выплаты:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(payout.processedAt).toLocaleDateString('ru-RU')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {payout.errorMessage && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{payout.errorMessage}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ожидаемые выплаты</Text>
          
          {pendingPayouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Нет ожидающих выплат</Text>
            </View>
          ) : (
            pendingPayouts.map((payment) => (
              <View key={payment.id} style={styles.pendingCard}>
                <View style={styles.pendingHeader}>
                  <Text style={styles.pendingOrderId}>Заказ {payment.orderId}</Text>
                  <Text style={styles.pendingAmount}>
                    {payment.amountCarrier.toLocaleString()} {payment.currency}
                  </Text>
                </View>
                
                <View style={styles.pendingStatusBadge}>
                  <Clock size={16} color="#F59E0B" />
                  <Text style={styles.pendingStatusText}>
                    {payment.status === 'payment_hold' 
                      ? 'Удержано в эскроу — будет выплачено после завершения заказа' 
                      : 'Ожидает подтверждения'}
                  </Text>
                </View>

                <Text style={styles.pendingDate}>
                  Создан: {new Date(payment.createdAt).toLocaleString('ru-RU')}
                </Text>
              </View>
            ))
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
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
  payoutCard: {
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
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  payoutInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500' as const,
    flex: 1,
    textAlign: 'right',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingOrderId: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#92400E',
  },
  pendingAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#92400E',
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pendingStatusText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  pendingDate: {
    fontSize: 11,
    color: '#B45309',
  },
});
