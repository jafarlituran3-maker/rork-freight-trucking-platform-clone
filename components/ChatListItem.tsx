import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { Chat } from '@/types';
import { mockOrders } from '@/mocks/orders';
import Colors from '@/constants/colors';

interface ChatListItemProps {
  chat: Chat;
}

export default function ChatListItem({ chat }: ChatListItemProps) {
  const router = useRouter();
  const order = mockOrders.find(o => o.id === chat.orderId);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays < 7) return `${diffDays} д`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/(tabs)/messages/${chat.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MessageCircle size={24} color={Colors.primary} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            Заказ #{chat.orderId}
          </Text>
          <Text style={styles.time}>
            {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
          </Text>
        </View>
        
        <Text style={styles.subtitle} numberOfLines={1}>
          {order ? `${order.origin.address} → ${order.destination.address}` : 'Груз'}
        </Text>
        
        {chat.lastMessage && (
          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                chat.unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {chat.lastMessage.text}
            </Text>
            {chat.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{chat.unreadCount}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
