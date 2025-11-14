import { Tabs, Redirect } from 'expo-router';
import { Package, MapPin, FileText, User, MessageCircle, Wallet, Truck, Route } from 'lucide-react-native';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import Colors from '@/constants/colors';
import { useRole } from '@/contexts/RoleContext';

export default function TabLayout() {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!role) {
    return <Redirect href="/role-selection" />;
  }

  const isCarrier = role === 'carrier';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tabIconSelected,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="orders"
        options={{
          title: isCarrier ? 'Заказы' : 'Объявления перевозчиков',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Отслеживание',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Сообщения',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Платежи',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Документы',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      {isCarrier ? (
        <Tabs.Screen
          name="fleet"
          options={{
            title: 'Парк',
            tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="trips"
          options={{
            title: 'Мои Рейсы',
            tabBarIcon: ({ color, size }) => <Route color={color} size={size} />,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
