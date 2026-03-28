import { router } from 'expo-router';
import { User, Building2, Phone, Mail, Settings, LogOut, ChevronRight, Bell, CheckCircle, XCircle, RefreshCw } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Colors from '@/constants/colors';
import { useNotifications } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';
import { useRole } from '@/contexts/RoleContext';

export default function ProfileScreen() {
  const { permissionGranted, expoPushToken, registerForPushNotifications } = useNotifications();
  const { user: userProfile, company } = useUser();
  const { role, clearRole } = useRole();
  
  const getRoleName = (role: string) => {
    switch (role) {
      case 'customer':
        return 'Грузоотправитель';
      case 'carrier':
        return 'Перевозчик';
      case 'dispatcher':
        return 'Диспетчер';
      default:
        return role;
    }
  };

  const handleSwitchRole = () => {
    Alert.alert(
      'Сменить роль',
      'Вы уверены, что хотите сменить роль?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сменить', 
          style: 'default', 
          onPress: async () => {
            await clearRole();
            router.replace('/role-selection');
          } 
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const getRoleLabel = () => {
    return role === 'carrier' ? 'Перевозчик' : 'Грузовладелец';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={48} color={Colors.primary} />
          </View>
          <Text style={styles.name}>{userProfile.fullName}</Text>
          <Text style={styles.role}>{getRoleLabel()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация</Text>

          {company && (
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Building2 size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Компания</Text>
                <Text style={styles.infoValue}>{company.name}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Phone size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Телефон</Text>
              <Text style={styles.infoValue}>{userProfile.phone}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Mail size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уведомления</Text>

          <View style={styles.notificationStatus}>
            <View style={styles.infoIcon}>
              <Bell size={20} color={Colors.primary} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.infoLabel}>Статус</Text>
              <View style={styles.statusRow}>
                {permissionGranted ? (
                  <>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={[styles.statusText, { color: Colors.success }]}>Включены</Text>
                  </>
                ) : (
                  <>
                    <XCircle size={16} color={Colors.error} />
                    <Text style={[styles.statusText, { color: Colors.error }]}>Отключены</Text>
                  </>
                )}
              </View>
              {expoPushToken && (
                <Text style={styles.tokenText} numberOfLines={1}>Token: {expoPushToken.slice(0, 20)}...</Text>
              )}
            </View>
          </View>

          {!permissionGranted && (
            <TouchableOpacity
              style={styles.enableNotificationsButton}
              onPress={registerForPushNotifications}
              activeOpacity={0.8}
            >
              <Bell size={16} color="#FFFFFF" />
              <Text style={styles.enableNotificationsText}>Включить уведомления</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/profile/settings')}
          >
            <View style={styles.menuLeft}>
              <Settings size={20} color={Colors.text} />
              <Text style={styles.menuText}>Настройки профиля</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleSwitchRole}
          >
            <View style={styles.menuLeft}>
              <RefreshCw size={20} color={Colors.primary} />
              <Text style={styles.menuText}>Сменить роль</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <LogOut size={20} color={Colors.error} />
              <Text style={[styles.menuText, styles.logoutText]}>Выйти</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Версия 1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Freight Platform</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  notificationContent: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  tokenText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  enableNotificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  enableNotificationsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});
