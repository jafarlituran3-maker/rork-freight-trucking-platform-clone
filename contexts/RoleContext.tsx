import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppRole = 'carrier' | 'cargo-owner' | null;

const ROLE_STORAGE_KEY = '@app_role';

export const [RoleContext, useRole] = createContextHook(() => {
  const [role, setRole] = useState<AppRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const savedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRole === 'carrier' || savedRole === 'cargo-owner') {
        setRole(savedRole);
      }
    } catch (error) {
      console.error('Failed to load role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectRole = useCallback(async (newRole: AppRole) => {
    try {
      if (newRole) {
        await AsyncStorage.setItem(ROLE_STORAGE_KEY, newRole);
      } else {
        await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
      }
      setRole(newRole);
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  }, []);

  const clearRole = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
      setRole(null);
    } catch (error) {
      console.error('Failed to clear role:', error);
    }
  }, []);

  return useMemo(
    () => ({
      role,
      isLoading,
      selectRole,
      clearRole,
    }),
    [role, isLoading, selectRole, clearRole]
  );
});
