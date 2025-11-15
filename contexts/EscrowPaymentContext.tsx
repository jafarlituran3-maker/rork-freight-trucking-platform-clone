import React, { useState, useCallback, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Payment, PaymentStatus, CommissionConfig, PayoutHistory, Order } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOrders } from './OrderContext';

const STORAGE_KEYS = {
  PAYMENTS: '@payments',
  COMMISSION_CONFIG: '@commission_config',
  PAYOUT_HISTORY: '@payout_history',
};

const DEFAULT_COMMISSION: CommissionConfig = {
  percent: 10,
  fixedAmount: 500,
};

export const [EscrowPaymentContext, useEscrowPayments] = createContextHook(() => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig>(DEFAULT_COMMISSION);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { orders, updateOrder } = useOrders();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [paymentsData, commissionData, payoutsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.COMMISSION_CONFIG),
        AsyncStorage.getItem(STORAGE_KEYS.PAYOUT_HISTORY),
      ]);

      if (paymentsData) {
        setPayments(JSON.parse(paymentsData));
      }
      if (commissionData) {
        setCommissionConfig(JSON.parse(commissionData));
      }
      if (payoutsData) {
        setPayoutHistory(JSON.parse(payoutsData));
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePayments = async (newPayments: Payment[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(newPayments));
      setPayments(newPayments);
    } catch (error) {
      console.error('Error saving payments:', error);
    }
  };

  const savePayoutHistory = async (newHistory: PayoutHistory[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PAYOUT_HISTORY, JSON.stringify(newHistory));
      setPayoutHistory(newHistory);
    } catch (error) {
      console.error('Error saving payout history:', error);
    }
  };

  const calculateCommission = useCallback((amountTotal: number): number => {
    return (amountTotal * commissionConfig.percent / 100) + commissionConfig.fixedAmount;
  }, [commissionConfig]);

  const createPayment = useCallback(async (orderId: string, amountTotal: number): Promise<Payment> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const commissionTotal = calculateCommission(amountTotal);
    const amountCarrier = amountTotal - commissionTotal;

    const payment: Payment = {
      id: `payment_${Date.now()}`,
      orderId,
      customerId: order.shipperId,
      carrierId: order.carrierId,
      amountTotal,
      amountCarrier,
      amountPlatformCommission: commissionTotal,
      currency: order.currency || 'RUB',
      status: 'payment_created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: `Оплата заказа ${orderId}`,
    };

    const newPayments = [...payments, payment];
    await savePayments(newPayments);

    await updateOrder(orderId, { 
      payment, 
      paymentStatus: 'payment_created' 
    });

    console.log('Payment created:', payment.id);
    return payment;
  }, [orders, payments, calculateCommission, updateOrder]);

  const holdAmount = useCallback(async (paymentId: string): Promise<void> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const updatedPayment: Payment = {
      ...payment,
      status: 'payment_hold',
      heldAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      escrowId: `escrow_${Date.now()}`,
    };

    const newPayments = payments.map(p => p.id === paymentId ? updatedPayment : p);
    await savePayments(newPayments);

    await updateOrder(payment.orderId, { 
      payment: updatedPayment, 
      paymentStatus: 'payment_hold' 
    });

    console.log('Amount held in escrow:', paymentId);
  }, [payments, updateOrder]);

  const confirmPayment = useCallback(async (paymentId: string): Promise<void> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const updatedPayment: Payment = {
      ...payment,
      status: 'payment_confirmed',
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPayments = payments.map(p => p.id === paymentId ? updatedPayment : p);
    await savePayments(newPayments);

    await updateOrder(payment.orderId, { 
      payment: updatedPayment, 
      paymentStatus: 'payment_confirmed' 
    });

    await holdAmount(paymentId);

    console.log('Payment confirmed:', paymentId);
  }, [payments, holdAmount, updateOrder]);

  const releaseToCarrier = useCallback(async (paymentId: string, carrierAmount?: number): Promise<void> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.carrierId) {
      throw new Error('No carrier assigned to this payment');
    }

    const releaseAmount = carrierAmount || payment.amountCarrier;

    const updatedPayment: Payment = {
      ...payment,
      status: 'payment_released',
      releasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPayments = payments.map(p => p.id === paymentId ? updatedPayment : p);
    await savePayments(newPayments);

    const payout: PayoutHistory = {
      id: `payout_${Date.now()}`,
      paymentId,
      carrierId: payment.carrierId,
      amount: releaseAmount,
      currency: payment.currency,
      status: 'completed',
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const newPayoutHistory = [...payoutHistory, payout];
    await savePayoutHistory(newPayoutHistory);

    await updateOrder(payment.orderId, { 
      payment: updatedPayment, 
      paymentStatus: 'payment_released' 
    });

    console.log('Payment released to carrier:', paymentId, releaseAmount);
  }, [payments, payoutHistory, updateOrder]);

  const refundCustomer = useCallback(async (paymentId: string): Promise<void> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const updatedPayment: Payment = {
      ...payment,
      status: 'payment_refund',
      refundedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPayments = payments.map(p => p.id === paymentId ? updatedPayment : p);
    await savePayments(newPayments);

    await updateOrder(payment.orderId, { 
      payment: updatedPayment, 
      paymentStatus: 'payment_refund' 
    });

    console.log('Payment refunded to customer:', paymentId);
  }, [payments, updateOrder]);

  const updatePaymentStatus = useCallback(async (paymentId: string, status: PaymentStatus): Promise<void> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const updatedPayment: Payment = {
      ...payment,
      status,
      updatedAt: new Date().toISOString(),
    };

    const newPayments = payments.map(p => p.id === paymentId ? updatedPayment : p);
    await savePayments(newPayments);

    await updateOrder(payment.orderId, { 
      payment: updatedPayment, 
      paymentStatus: status 
    });

    console.log('Payment status updated:', paymentId, status);
  }, [payments, updateOrder]);

  const setCommission = useCallback(async (percent: number, fixedAmount: number): Promise<void> => {
    const newConfig: CommissionConfig = { percent, fixedAmount };
    setCommissionConfig(newConfig);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COMMISSION_CONFIG, JSON.stringify(newConfig));
      console.log('Commission config updated:', newConfig);
    } catch (error) {
      console.error('Error saving commission config:', error);
    }
  }, []);

  const linkDocuments = useCallback(async (paymentId: string, documentUrls: string[]): Promise<void> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const updatedPayment: Payment = {
      ...payment,
      paymentDocuments: documentUrls,
      updatedAt: new Date().toISOString(),
    };

    const newPayments = payments.map(p => p.id === paymentId ? updatedPayment : p);
    await savePayments(newPayments);

    console.log('Documents linked to payment:', paymentId, documentUrls.length);
  }, [payments]);

  const getPaymentsByOrder = useCallback((orderId: string): Payment[] => {
    return payments.filter(p => p.orderId === orderId);
  }, [payments]);

  const getPaymentsByCarrier = useCallback((carrierId: string): Payment[] => {
    return payments.filter(p => p.carrierId === carrierId);
  }, [payments]);

  const getPaymentsByCustomer = useCallback((customerId: string): Payment[] => {
    return payments.filter(p => p.customerId === customerId);
  }, [payments]);

  const getPayoutsByCarrier = useCallback((carrierId: string): PayoutHistory[] => {
    return payoutHistory.filter(p => p.carrierId === carrierId);
  }, [payoutHistory]);

  useEffect(() => {
    const handleOrderStatusChange = async () => {
      for (const order of orders) {
        if (!order.payment) continue;

        const payment = payments.find(p => p.id === order.payment!.id);
        if (!payment) continue;

        if (order.status === 'completed' && payment.status === 'payment_confirmed') {
          console.log('Order completed, releasing payment to carrier:', order.id);
          const updatedPayment: Payment = {
            ...payment,
            status: 'payment_released',
            releasedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const newPayments = payments.map(p => p.id === payment.id ? updatedPayment : p);
          await savePayments(newPayments);

          const payout: PayoutHistory = {
            id: `payout_${Date.now()}`,
            paymentId: payment.id,
            carrierId: payment.carrierId!,
            amount: payment.amountCarrier,
            currency: payment.currency,
            status: 'completed',
            processedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };

          const newPayoutHistory = [...payoutHistory, payout];
          await savePayoutHistory(newPayoutHistory);

          await updateOrder(payment.orderId, { 
            payment: updatedPayment, 
            paymentStatus: 'payment_released' 
          });
        }

        if (order.status === 'cancelled' && payment.status === 'payment_hold') {
          console.log('Order cancelled, refunding customer:', order.id);
          const updatedPayment: Payment = {
            ...payment,
            status: 'payment_refund',
            refundedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const newPayments = payments.map(p => p.id === payment.id ? updatedPayment : p);
          await savePayments(newPayments);

          await updateOrder(payment.orderId, { 
            payment: updatedPayment, 
            paymentStatus: 'payment_refund' 
          });
        }
      }
    };

    handleOrderStatusChange();
  }, [orders]);

  return {
    payments,
    commissionConfig,
    payoutHistory,
    isLoading,
    
    createPayment,
    holdAmount,
    confirmPayment,
    releaseToCarrier,
    refundCustomer,
    updatePaymentStatus,
    setCommission,
    linkDocuments,
    
    calculateCommission,
    getPaymentsByOrder,
    getPaymentsByCarrier,
    getPaymentsByCustomer,
    getPayoutsByCarrier,
  };
});
