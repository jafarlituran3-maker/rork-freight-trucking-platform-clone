import { Stack } from 'expo-router';
import { Menu } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useUser } from '@/contexts/UserContext';

export default function FleetLayout() {
  const { toggleMenu } = useUser();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Парк и водители',
          headerLeft: () => (
            <TouchableOpacity
              onPress={toggleMenu}
              style={{ marginLeft: 8, padding: 8 }}
              activeOpacity={0.7}
            >
              <Menu size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="truck/[id]"
        options={{
          title: 'Детали транспорта',
        }}
      />
      <Stack.Screen
        name="truck/add"
        options={{
          title: 'Добавить транспорт',
        }}
      />
      <Stack.Screen
        name="driver/[id]"
        options={{
          title: 'Профиль водителя',
        }}
      />
      <Stack.Screen
        name="driver/add"
        options={{
          title: 'Добавить водителя',
        }}
      />
      <Stack.Screen
        name="schedule"
        options={{
          title: 'Расписание водителей',
        }}
      />
    </Stack>
  );
}
