import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

import { Message, Chat } from '@/types';
import { mockMessages, mockChats } from '@/mocks/messages';

const CURRENT_USER_ID = 'shipper1';

export const [MessageContext, useMessages] = createContextHook(() => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const getMessagesByChatId = useCallback(
    (chatId: string) => {
      return messages.filter((m) => m.chatId === chatId);
    },
    [messages]
  );

  const getChatById = useCallback(
    (chatId: string) => {
      return chats.find((c) => c.id === chatId);
    },
    [chats]
  );

  const sendMessage = useCallback(
    async (chatId: string, text: string, senderId: string = CURRENT_USER_ID) => {
      const newMessage: Message = {
        id: `m${Date.now()}`,
        chatId,
        senderId,
        text,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setMessages((prev) => [...prev, newMessage]);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: newMessage,
                updatedAt: new Date().toISOString(),
                unreadCount: senderId !== CURRENT_USER_ID ? chat.unreadCount + 1 : chat.unreadCount,
              }
            : chat
        )
      );

      return newMessage;
    },
    []
  );

  const markMessagesAsRead = useCallback((chatId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.chatId === chatId && !m.read
          ? {
              ...m,
              read: true,
            }
          : m
      )
    );

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount: 0,
            }
          : chat
      )
    );
  }, []);

  const getTotalUnreadCount = useCallback(() => {
    return chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  }, [chats]);

  return useMemo(
    () => ({
      messages,
      chats,
      getMessagesByChatId,
      getChatById,
      sendMessage,
      markMessagesAsRead,
      getTotalUnreadCount,
    }),
    [
      messages,
      chats,
      getMessagesByChatId,
      getChatById,
      sendMessage,
      markMessagesAsRead,
      getTotalUnreadCount,
    ]
  );
});
