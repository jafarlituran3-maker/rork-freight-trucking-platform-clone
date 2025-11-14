import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import { useRole } from '@/contexts/RoleContext';

export default function Index() {
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

  return <Redirect href="/(tabs)/orders" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
