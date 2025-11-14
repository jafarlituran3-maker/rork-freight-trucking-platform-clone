import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

import { Payment, PaymentMethod, PaymentStatus } from '@/types';

export const [PaymentContext, usePayments] = createContextHook(() => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm1',
      type: 'card',
      name: 'Visa •••• 4242',
      details: '4242 4242 4242 4242',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pm2',
      type: 'bank_transfer',
      name: 'Сбербанк',
      details: 'Счет •••• 1234',
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'pay1',
      orderId: '1',
      amount: 85000,
      currency: 'RUB',
      status: 'paid',
      paymentMethodId: 'pm1',
      paidAt: '2025-10-02T11:00:00Z',
      createdAt: '2025-10-01T09:00:00Z',
      updatedAt: '2025-10-02T11:00:00Z',
      description: 'Оплата за перевозку #1',
      transactionId: 'TXN123456789',
    },
    {
      id: 'pay2',
      orderId: '2',
      amount: 45000,
      currency: 'RUB',
      status: 'pending',
      createdAt: '2025-10-02T07:00:00Z',
      updatedAt: '2025-10-02T07:00:00Z',
      description: 'Оплата за перевозку #2',
    },
    {
      id: 'pay3',
      orderId: '3',
      amount: 32000,
      currency: 'RUB',
      status: 'paid',
      paymentMethodId: 'pm2',
      paidAt: '2025-09-30T16:30:00Z',
      createdAt: '2025-09-28T11:00:00Z',
      updatedAt: '2025-09-30T16:30:00Z',
      description: 'Оплата за перевозку #3',
      transactionId: 'TXN987654321',
    },
  ]);

  const getPaymentByOrderId = useCallback(
    (orderId: string) => {
      return payments.find((p) => p.orderId === orderId);
    },
    [payments]
  );

  const getPaymentMethodById = useCallback(
    (id: string) => {
      return paymentMethods.find((pm) => pm.id === id);
    },
    [paymentMethods]
  );

  const getDefaultPaymentMethod = useCallback(() => {
    return paymentMethods.find((pm) => pm.isDefault);
  }, [paymentMethods]);

  const addPaymentMethod = useCallback(
    (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
      const newMethod: PaymentMethod = {
        ...method,
        id: `pm${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      if (method.isDefault) {
        setPaymentMethods((prev) =>
          prev.map((pm) => ({ ...pm, isDefault: false }))
        );
      }

      setPaymentMethods((prev) => [...prev, newMethod]);
      return newMethod;
    },
    []
  );

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
  }, []);

  const setDefaultPaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
  }, []);

  const createPayment = useCallback(
    (
      orderId: string,
      amount: number,
      currency: string,
      description?: string
    ) => {
      const newPayment: Payment = {
        id: `pay${Date.now()}`,
        orderId,
        amount,
        currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description,
      };

      setPayments((prev) => [...prev, newPayment]);
      return newPayment;
    },
    []
  );

  const processPayment = useCallback(
    async (paymentId: string, paymentMethodId: string) => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: 'processing' as PaymentStatus,
                paymentMethodId,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: 'paid' as PaymentStatus,
                paidAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                transactionId: `TXN${Date.now()}`,
              }
            : p
        )
      );

      return true;
    },
    []
  );

  const refundPayment = useCallback(async (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'processing' as PaymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'refunded' as PaymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    return true;
  }, []);

  const getPaymentsByStatus = useCallback(
    (status: PaymentStatus) => {
      return payments.filter((p) => p.status === status);
    },
    [payments]
  );

  return useMemo(
    () => ({
      paymentMethods,
      payments,
      getPaymentByOrderId,
      getPaymentMethodById,
      getDefaultPaymentMethod,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      createPayment,
      processPayment,
      refundPayment,
      getPaymentsByStatus,
    }),
    [
      paymentMethods,
      payments,
      getPaymentByOrderId,
      getPaymentMethodById,
      getDefaultPaymentMethod,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      createPayment,
      processPayment,
      refundPayment,
      getPaymentsByStatus,
    ]
  );
});
