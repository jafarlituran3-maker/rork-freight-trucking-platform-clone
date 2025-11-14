import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Package, FileText, Phone, User, CreditCard, CheckCircle, Clock, Truck, Check, Download } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';

import Colors from '@/constants/colors';
import { usePayments } from '@/contexts/PaymentContext';
import { useOrders } from '@/contexts/OrderContext';
import { OrderStatus } from '@/types';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPaymentByOrderId } = usePayments();
  const { getOrderById, updateOrderStatus } = useOrders();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const order = getOrderById(id);
  const payment = order ? getPaymentByOrderId(order.id) : null;

  const [priceInput] = useState<string>(order?.price ? String(order.price) : '');
  const [includeVAT, setIncludeVAT] = useState<boolean>(false);

  const parsedBasePrice = useMemo<number>(() => {
    const n = Number(priceInput.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [priceInput]);

  const basePrice = useMemo<number>(() => {
    return parsedBasePrice;
  }, [parsedBasePrice]);

  const vatAmount = useMemo<number>(() => {
    return includeVAT ? basePrice * 0.2 : 0;
  }, [basePrice, includeVAT]);

  const insuranceAmount = useMemo<number>(() => {
    const priceWithVAT = basePrice + vatAmount;
    return priceWithVAT * 0.05;
  }, [basePrice, vatAmount]);

  const commissionAmount = useMemo<number>(() => {
    const priceWithVAT = basePrice + vatAmount;
    return priceWithVAT * 0.05;
  }, [basePrice, vatAmount]);

  const finalPrice = useMemo<number>(() => {
    return basePrice + vatAmount + insuranceAmount + commissionAmount;
  }, [basePrice, vatAmount, insuranceAmount, commissionAmount]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  const getStatusColor = (status: typeof order.status) => {
    switch (status) {
      case 'created':
        return Colors.statusPending;
      case 'in_transit':
        return Colors.statusInTransit;
      case 'delivered':
        return Colors.statusDelivered;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: typeof order.status) => {
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

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      created: 'assigned',
      assigned: 'in_transit',
      in_transit: 'delivered',
      delivered: 'completed',
      completed: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) {
      Alert.alert('Информация', 'Заказ уже завершен');
      return;
    }

    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, nextStatus);
      Alert.alert('Успешно', `Статус обновлен: ${getStatusText(nextStatus)}`);
    } catch {
      Alert.alert('Ошибка', 'Не удалось обновить статус');
    } finally {
      setIsUpdating(false);
    }
  };



  const formatAmount = (amount: number) => {
    try {
      return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch {
      return amount.toFixed(2);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contract: 'Договор перевозки',
      upd: 'УПД',
      consignment_note: 'Товарная накладная',
      waybill: 'Транспортная накладная',
      invoice: 'Счет-фактура',
      cmr: 'CMR',
      edi: 'ЭДО',
      other: 'Другое',
    };
    return labels[type] || type;
  };

  const handleDownloadDocument = async (doc: typeof order.documents[0]) => {
    try {
      if (Platform.OS === 'web') {
        window.open(doc.url, '_blank');
      } else {
        const supported = await Linking.canOpenURL(doc.url);
        if (supported) {
          await Linking.openURL(doc.url);
        } else {
          Alert.alert('Ошибка', 'Не удалось открыть документ');
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Ошибка', 'Не удалось скачать документ');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
          <Text style={styles.orderId}>Заказ #{order.id}</Text>
          <Text style={styles.price} testID="order-total-price">
            {formatAmount(finalPrice || order.price)} {order.currency}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Order Details</Text>
          </View>

          <TouchableOpacity
            testID="vat-toggle"
            style={[styles.checkboxRow, includeVAT && styles.checkboxRowActive]}
            onPress={() => setIncludeVAT((v) => !v)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, includeVAT && styles.checkboxChecked]}>
              {includeVAT && <Check size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Including 20% VAT</Text>
          </TouchableOpacity>
          <Text style={styles.caption} testID="vat-caption">Default: Excluding VAT</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Стоимость</Text>
          </View>

          <View style={styles.priceBreakdownRow}>
            <Text style={styles.priceBreakdownLabel}>Цена (без НДС)</Text>
            <Text style={styles.priceBreakdownValue} testID="base-price">
              {formatAmount(basePrice)} {order.currency}
            </Text>
          </View>

          {includeVAT && (
            <View style={styles.priceBreakdownRow}>
              <Text style={styles.priceBreakdownLabel}>НДС (20%)</Text>
              <Text style={styles.priceBreakdownValue} testID="vat-amount">
                {formatAmount(vatAmount)} {order.currency}
              </Text>
            </View>
          )}

          <View style={styles.priceBreakdownRow}>
            <Text style={styles.priceBreakdownLabel}>Страховка (5%)</Text>
            <Text style={styles.priceBreakdownValue} testID="insurance-amount">
              {formatAmount(insuranceAmount)} {order.currency}
            </Text>
          </View>

          <View style={styles.priceBreakdownRow}>
            <Text style={styles.priceBreakdownLabel}>Комиссия агрегатора (5%)</Text>
            <Text style={styles.priceBreakdownValue} testID="commission-amount">
              {formatAmount(commissionAmount)} {order.currency}
            </Text>
          </View>

          <View style={styles.finalPriceRow}>
            <Text style={styles.finalPriceLabel}>Итоговая цена</Text>
            <Text style={styles.finalPriceValue} testID="final-price">
              {formatAmount(finalPrice)} {order.currency}
            </Text>
          </View>

          {payment && (
            <View style={[styles.pricingCalcRow, { marginTop: 16 }]}>
              <Text style={styles.pricingCalcLabel}>К оплате</Text>
              <Text style={styles.pricingCalcValue} testID="to-be-paid-amount">
                {formatAmount(finalPrice)} {order.currency}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Маршрут</Text>
          </View>

          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Откуда</Text>
                <Text style={styles.routeAddress}>{order.origin.address}</Text>
                {order.origin.contactName && (
                  <View style={styles.contactInfo}>
                    <User size={14} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{order.origin.contactName}</Text>
                  </View>
                )}
                {order.origin.contactPhone && (
                  <View style={styles.contactInfo}>
                    <Phone size={14} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{order.origin.contactPhone}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: Colors.error }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Куда</Text>
                <Text style={styles.routeAddress}>{order.destination.address}</Text>
                {order.destination.contactName && (
                  <View style={styles.contactInfo}>
                    <User size={14} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{order.destination.contactName}</Text>
                  </View>
                )}
                {order.destination.contactPhone && (
                  <View style={styles.contactInfo}>
                    <Phone size={14} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{order.destination.contactPhone}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {order.documents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Документы</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Нажмите на документ для просмотра или скачивания</Text>

            {order.documents.map((doc) => (
              <TouchableOpacity 
                key={doc.id} 
                style={styles.documentItem} 
                activeOpacity={0.7}
                onPress={() => handleDownloadDocument(doc)}
              >
                <View style={styles.documentIconContainer}>
                  <FileText size={20} color={Colors.accent} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentType}>{getDocumentTypeLabel(doc.type)}</Text>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <View style={styles.documentMeta}>
                    <Text style={styles.documentDate}>
                      {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}
                    </Text>
                    {doc.status && (
                      <View style={[styles.documentStatus, { backgroundColor: doc.status === 'signed' || doc.status === 'approved' ? Colors.success : Colors.warning }]}>
                        <Text style={styles.documentStatusText}>
                          {doc.status === 'signed' ? 'Подписан' : doc.status === 'approved' ? 'Утвержден' : doc.status === 'draft' ? 'Черновик' : 'Отклонен'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.downloadButton}>
                  <Download size={20} color={Colors.accent} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {payment && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Payment</Text>
            </View>

            <TouchableOpacity
              style={styles.paymentCard}
              onPress={() => router.push(`/(tabs)/payments/${payment.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentRow}>
                <View style={styles.paymentLeft}>
                  {payment.status === 'paid' ? (
                    <CheckCircle size={20} color={Colors.success} />
                  ) : (
                    <Clock size={20} color={Colors.warning} />
                  )}
                  <Text style={styles.paymentLabel}>
                    {payment.status === 'paid' ? 'Paid' : 'Awaiting payment'}
                  </Text>
                </View>
                <Text style={styles.paymentAmount}>
                  {formatAmount(finalPrice)} {order.currency}
                </Text>
              </View>
              {payment.status === 'pending' && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/(tabs)/payments/${payment.id}` as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.payButtonText}>Pay now</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        )}

        {order.tracking && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => router.push('/(tabs)/tracking' as any)}
            activeOpacity={0.8}
          >
            <MapPin size={20} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Отследить на карте</Text>
          </TouchableOpacity>
        )}

        {getNextStatus(order.status) && (
          <TouchableOpacity
            style={[styles.updateStatusButton, isUpdating && styles.updateStatusButtonDisabled]}
            onPress={handleUpdateStatus}
            disabled={isUpdating}
            activeOpacity={0.8}
          >
            <Truck size={20} color="#FFFFFF" />
            <Text style={styles.updateStatusButtonText}>
              {isUpdating ? 'Обновление...' : `Обновить до: ${getStatusText(getNextStatus(order.status)!)}`}
            </Text>
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  orderId: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  checkboxRowActive: {
    opacity: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  pricingCalcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    marginBottom: 8,
  },
  pricingCalcLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pricingCalcValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  routeContainer: {
    gap: 0,
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
    height: 30,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  updateStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  updateStatusButtonDisabled: {
    opacity: 0.5,
  },
  updateStatusButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  paymentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  payButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  priceBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  priceBreakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceBreakdownValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  finalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 4,
    borderTopWidth: 2,
    borderTopColor: Colors.accent,
    marginTop: 8,
  },
  finalPriceLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  finalPriceValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  documentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  documentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  documentStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  downloadButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
});
