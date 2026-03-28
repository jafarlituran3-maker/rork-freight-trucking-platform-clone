import { useRouter } from 'expo-router';
import {
  Package,
  MapPin,
  FileText,
  User,
  MessageCircle,
  Wallet,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Bell,
  HelpCircle,
  Star,
  History,
  CreditCard,
  Megaphone,
  RefreshCw,
} from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';

import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { useRole } from '@/contexts/RoleContext';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

export default function BurgerMenu() {
  const { user, company, isMenuOpen, closeMenu } = useUser();
  const { role, clearRole } = useRole();
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? 0 : -MENU_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const menuItems = [
    { icon: Package, label: 'Мои заказы', route: '/(tabs)/orders' },
    { icon: MapPin, label: 'Отслеживание', route: '/(tabs)/tracking' },
    { icon: MessageCircle, label: 'Сообщения', route: '/(tabs)/messages' },
    { icon: Wallet, label: 'Платежи', route: '/(tabs)/payments' },
    { icon: FileText, label: 'Документы', route: '/(tabs)/documents' },
    { 
      icon: Megaphone, 
      label: role === 'cargo-owner' ? 'Объявления перевозчиков' : 'Объявления', 
      route: '/ads' 
    },
    { 
      icon: MapPin, 
      label: role === 'cargo-owner' ? 'Объявления перевозчиков на карте' : 'Объявления на карте', 
      route: '/ads-map' 
    },
  ];

  const customerActions = [
    { icon: History, label: 'История заказов', route: '/(tabs)/orders' },
    { icon: CreditCard, label: 'Способы оплаты', route: '/(tabs)/payments/methods' },
    { icon: Star, label: 'Избранные перевозчики', action: () => handleFavorites() },
    { icon: Bell, label: 'Уведомления', action: () => handleNotifications() },
  ];

  const handleNavigation = (route: string) => {
    closeMenu();
    router.push(route as any);
  };

  const handleFavorites = () => {
    closeMenu();
    Alert.alert('Избранное', 'Функция в разработке');
  };

  const handleNotifications = () => {
    closeMenu();
    Alert.alert('Уведомления', 'Функция в разработке');
  };

  const handleSettings = () => {
    closeMenu();
    Alert.alert('Настройки', 'Функция в разработке');
  };

  const handleHelp = () => {
    closeMenu();
    Alert.alert('Помощь', 'Функция в разработке');
  };

  const handleSwitchRole = () => {
    Alert.alert(
      'Сменить роль',
      'Вы хотите вернуться к выбору роли?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сменить',
          style: 'default',
          onPress: async () => {
            closeMenu();
            await clearRole();
            router.replace('/role-selection');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    closeMenu();
    Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: () => console.log('Logout'),
      },
    ]);
  };

  if (!isMenuOpen) return null;

  return (
    <Modal
      visible={isMenuOpen}
      transparent
      animationType="none"
      onRequestClose={closeMenu}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeMenu}
        />

        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeMenu}
              activeOpacity={0.7}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <User size={40} color={Colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userRole}>
                  {user.role === 'customer' ? 'Заказчик' : 'Перевозчик'}
                </Text>
                <Text style={styles.userCompany}>{company?.name || ''}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Основное</Text>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <item.icon size={20} color={Colors.primary} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            {user.role === 'customer' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Клиентские функции</Text>
                {customerActions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => {
                      if (item.route) {
                        handleNavigation(item.route);
                      } else if (item.action) {
                        item.action();
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <item.icon size={20} color={Colors.accent} />
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Прочее</Text>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSettings}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Settings size={20} color={Colors.text} />
                  <Text style={styles.menuItemText}>Настройки</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleHelp}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <HelpCircle size={20} color={Colors.text} />
                  <Text style={styles.menuItemText}>Помощь</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSwitchRole}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <RefreshCw size={20} color={Colors.primary} />
                  <Text style={styles.menuItemText}>Сменить роль</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <LogOut size={20} color={Colors.error} />
                  <Text style={[styles.menuItemText, styles.logoutText]}>
                    Выйти
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Версия 1.0.0</Text>
              <Text style={styles.footerText}>© 2025 Freight Platform</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});
