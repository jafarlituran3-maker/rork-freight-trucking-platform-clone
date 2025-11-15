import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Send, Package } from 'lucide-react-native';
import MessageBubble from '@/components/MessageBubble';
import { useMessages } from '@/contexts/MessageContext';
import { useOrders } from '@/contexts/OrderContext';
import Colors from '@/constants/colors';

const CURRENT_USER_ID = 'shipper1';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { getChatById, getMessagesByChatId, sendMessage, markMessagesAsRead } = useMessages();
  const { getOrderById } = useOrders();
  
  const chat = getChatById(chatId);
  const order = chat ? getOrderById(chat.orderId) : undefined;
  const messages = getMessagesByChatId(chatId);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);

    if (chat) {
      markMessagesAsRead(chatId);
    }
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim() || !chat) return;

    const messageText = inputText.trim();
    setInputText('');

    await sendMessage(chatId, messageText, CURRENT_USER_ID);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!chat || !order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Чат не найден</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Заказ #${order.id}`,
          headerBackTitle: 'Назад',
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.orderInfo}>
          <Package size={16} color={Colors.textSecondary} />
          <Text style={styles.orderInfoText} numberOfLines={1}>
            {order.origin.address} → {order.destination.address}
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId === CURRENT_USER_ID}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Сообщение..."
            placeholderTextColor={Colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
          >
            <Send
              size={20}
              color={inputText.trim() ? Colors.surface : Colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primaryLight + '15',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  orderInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  messagesList: {
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surfaceHover,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
