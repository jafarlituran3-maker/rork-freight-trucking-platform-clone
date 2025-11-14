import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

import { Order, OrderStatus, CargoRequest, CarrierOffer } from '@/types';
import { mockOrders } from '@/mocks/orders';
import { mockCarriers } from '@/mocks/carriers';
import { useNotifications } from './NotificationContext';

export const [OrderContext, useOrders] = createContextHook(() => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const { notifyOrderUpdate } = useNotifications();

  const getOrderById = useCallback(
    (id: string) => {
      return orders.find((o) => o.id === id);
    },
    [orders]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : o
        )
      );

      const orderDetails = `${order.origin.address} → ${order.destination.address}`;
      await notifyOrderUpdate(orderId, newStatus, orderDetails);
    },
    [orders, notifyOrderUpdate]
  );

  const updateOrderPrice = useCallback(
    async (orderId: string, price: number) => {
      console.log('[OrderContext] Updating order price', { orderId, price });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, price, updatedAt: new Date().toISOString() }
            : o
        )
      );
    },
    []
  );

  const addOrder = useCallback(
    (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'documents'>) => {
      const newOrder: Order = {
        ...order,
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: [],
      };

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    []
  );

  const getOrdersByStatus = useCallback(
    (status: OrderStatus) => {
      return orders.filter((o) => o.status === status);
    },
    [orders]
  );

  const searchCarriers = useCallback(
    (cargoRequest: CargoRequest): CarrierOffer[] => {
      const { weight, volume } = cargoRequest;

      const suitableCarriers = mockCarriers.filter(
        (carrier) =>
          carrier.maxCapacity >= weight && carrier.maxVolume >= volume
      );

      const estimatedDistance = 500 + Math.random() * 500;

      const offers: CarrierOffer[] = suitableCarriers.map((carrier) => {
        const basePrice = Math.round(carrier.basePricePerKm * estimatedDistance);
        const commission = Math.round(basePrice * carrier.commission);
        const finalPrice = basePrice + commission;
        const estimatedDuration = Math.round(estimatedDistance / carrier.averageSpeed * 60);

        return {
          carrier,
          basePrice,
          commission,
          finalPrice,
          estimatedDistance: Math.round(estimatedDistance),
          estimatedDuration,
        };
      });

      return offers.sort((a, b) => a.finalPrice - b.finalPrice);
    },
    []
  );

  return useMemo(
    () => ({
      orders,
      getOrderById,
      updateOrderStatus,
      updateOrderPrice,
      addOrder,
      getOrdersByStatus,
      searchCarriers,
    }),
    [orders, getOrderById, updateOrderStatus, updateOrderPrice, addOrder, getOrdersByStatus, searchCarriers]
  );
});
