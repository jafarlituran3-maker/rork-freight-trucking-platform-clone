import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Search, MessageCircle } from 'lucide-react-native';
import ChatListItem from '@/components/ChatListItem';
import { useMessages } from '@/contexts/MessageContext';
import Colors from '@/constants/colors';

export default function MessagesScreen() {
  const { chats, sendMessage } = useMessages();
  const [searchQuery, setSearchQuery] = useState('');

  const simulateIncomingMessage = async () => {
    if (chats.length > 0) {
      const firstChat = chats[0];
      await sendMessage(
        firstChat.id,
        'Тестовое сообщение от перевозчика',
        'carrier1'
      );
    }
  };

  const filteredChats = chats.filter(chat => {
    const query = searchQuery.toLowerCase();
    return chat.orderId.toLowerCase().includes(query) ||
           chat.lastMessage?.text.toLowerCase().includes(query);
  });

  const sortedChats = [...filteredChats].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return dateB - dateA;
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Сообщения</Text>
        <TouchableOpacity
          style={styles.testButton}
          onPress={simulateIncomingMessage}
          activeOpacity={0.8}
        >
          <MessageCircle size={16} color="#FFFFFF" />
          <Text style={styles.testButtonText}>Тест</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск чатов..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {sortedChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет активных чатов</Text>
          <Text style={styles.emptySubtext}>
            Чаты создаются автоматически при назначении заказа
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatListItem chat={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
