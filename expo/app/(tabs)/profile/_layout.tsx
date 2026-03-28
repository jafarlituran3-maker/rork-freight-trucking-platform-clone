import { Stack } from 'expo-router';
import { Menu } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';

export default function ProfileLayout() {
  const { toggleMenu } = useUser();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Профиль',
          headerLeft: () => (
            <TouchableOpacity
              onPress={toggleMenu}
              style={{ marginLeft: 8, padding: 8 }}
              activeOpacity={0.7}
            >
              <Menu size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Настройки профиля',
        }}
      />
      <Stack.Screen
        name="company"
        options={{
          title: 'Профиль компании',
        }}
      />
    </Stack>
  );
}
