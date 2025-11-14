import { Stack } from 'expo-router';
import { Menu } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';

export default function PaymentsLayout() {
  const { toggleMenu } = useUser();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Платежи',
          headerLeft: () => (
            <TouchableOpacity
              onPress={toggleMenu}
              style={{ marginLeft: 8, padding: 8 }}
              activeOpacity={0.7}
            >
              <Menu size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Детали платежа',
        }}
      />
      <Stack.Screen
        name="methods"
        options={{
          title: 'Способы оплаты',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'История платежей',
        }}
      />
      <Stack.Screen
        name="escrow"
        options={{
          title: 'Управление Эскроу',
        }}
      />
      <Stack.Screen
        name="payouts"
        options={{
          title: 'Мои Выплаты',
        }}
      />
      <Stack.Screen
        name="commission"
        options={{
          title: 'Настройка Комиссии',
        }}
      />
    </Stack>
  );
}
