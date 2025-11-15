import { Stack } from 'expo-router';
import React from 'react';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700' as const,
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Мои Рейсы',
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          title: 'Карта Рейсов',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Детали Рейса',
        }}
      />
      <Stack.Screen
        name="create-request"
        options={{
          title: 'Создать Запрос',
        }}
      />
    </Stack>
  );
}
