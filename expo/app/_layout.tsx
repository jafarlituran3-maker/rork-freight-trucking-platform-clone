import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import BurgerMenu from '@/components/BurgerMenu';
import { PaymentContext } from '@/contexts/PaymentContext';
import { NotificationContext } from '@/contexts/NotificationContext';
import { OrderContext } from '@/contexts/OrderContext';
import { MessageContext } from '@/contexts/MessageContext';
import { FleetContext } from '@/contexts/FleetContext';
import { UserContext } from '@/contexts/UserContext';
import { RoleContext } from '@/contexts/RoleContext';
import { EscrowPaymentContext } from '@/contexts/EscrowPaymentContext';
import { trpc, trpcClient } from '@/lib/trpc';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Назад' }}>
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ads" options={{ headerShown: true }} />
      <Stack.Screen name="ads-map" options={{ headerShown: true }} />
      <Stack.Screen name="application-details" options={{ headerShown: true }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RoleContext>
          <UserContext>
            <NotificationContext>
              <OrderContext>
                <EscrowPaymentContext>
                  <MessageContext>
                    <PaymentContext>
                      <FleetContext>
                        <GestureHandlerRootView style={{ flex: 1 }}>
                          <RootLayoutNav />
                          <BurgerMenu />
                        </GestureHandlerRootView>
                      </FleetContext>
                    </PaymentContext>
                  </MessageContext>
                </EscrowPaymentContext>
              </OrderContext>
            </NotificationContext>
          </UserContext>
        </RoleContext>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
