import { Stack } from 'expo-router';
import { Menu } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useUser } from '@/contexts/UserContext';

export default function MessagesLayout() {
  const { toggleMenu } = useUser();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1E293B',
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Сообщения',
          headerLeft: () => (
            <TouchableOpacity
              onPress={toggleMenu}
              style={{ marginLeft: 8, padding: 8 }}
              activeOpacity={0.7}
            >
              <Menu size={24} color="#1E293B" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="[chatId]"
        options={{
          title: 'Чат',
        }}
      />
    </Stack>
  );
}
