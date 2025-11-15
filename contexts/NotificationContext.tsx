import createContextHook from '@nkzw/create-context-hook';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type NotificationData = {
  type: 'order_update' | 'new_message';
  orderId?: string;
  chatId?: string;
  title: string;
  body: string;
};

type EasExtraConfig = {
  eas?: {
    projectId?: string;
  };
};

const resolveExpoProjectId = (): string | undefined => {
  const extra = Constants.expoConfig?.extra;
  if (extra && typeof extra === 'object') {
    const easConfig = (extra as EasExtraConfig).eas;
    if (easConfig?.projectId) {
      return easConfig.projectId;
    }
  }
  if (Constants.easConfig?.projectId) {
    return Constants.easConfig.projectId;
  }
  return undefined;
};

export const [NotificationContext, useNotifications] = createContextHook(() => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const router = useRouter();

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('Notifications work with limited functionality on web');
      setPermissionGranted(true);
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync() as { status: Notifications.PermissionStatus };
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync() as { status: Notifications.PermissionStatus };
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Constants.appOwnership === 'expo') {
        console.log('Expo Go does not support push token registration. Skipping.');
        setExpoPushToken(undefined);
        return;
      }

      const projectId = resolveExpoProjectId();
      if (!projectId) {
        console.log('Expo project ID not configured. Skipping push token registration.');
        setExpoPushToken(undefined);
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      setExpoPushToken(token);
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    await registerForPushNotifications();
  }, [registerForPushNotifications]);

  useEffect(() => {
    requestPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data as NotificationData;
        console.log('Notification tapped:', data);

        if (data.type === 'order_update' && data.orderId) {
          router.push(`/(tabs)/orders/${data.orderId}` as any);
        } else if (data.type === 'new_message' && data.chatId) {
          router.push(`/(tabs)/messages/${data.chatId}` as any);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [requestPermissions, router]);

  const sendLocalNotification = useCallback(
    async (data: NotificationData) => {
      if (Platform.OS === 'web') {
        console.log('Local notification (web):', data);
        return;
      }

      if (!permissionGranted) {
        console.log('Notification permission not granted');
        return;
      }

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: data.title,
            body: data.body,
            data,
            sound: true,
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Error sending local notification:', error);
      }
    },
    [permissionGranted]
  );

  const notifyOrderUpdate = useCallback(
    async (orderId: string, status: string, orderDetails: string) => {
      const statusMap: Record<string, string> = {
        created: 'Заказ создан',
        assigned: 'Водитель назначен',
        in_transit: 'Груз в пути',
        delivered: 'Груз доставлен',
        completed: 'Заказ завершен',
        cancelled: 'Заказ отменен',
      };

      await sendLocalNotification({
        type: 'order_update',
        orderId,
        title: statusMap[status] || 'Обновление заказа',
        body: `Заказ #${orderId}: ${orderDetails}`,
      });
    },
    [sendLocalNotification]
  );

  const notifyNewMessage = useCallback(
    async (chatId: string, senderName: string, messageText: string) => {
      await sendLocalNotification({
        type: 'new_message',
        chatId,
        title: `Новое сообщение от ${senderName}`,
        body: messageText,
      });
    },
    [sendLocalNotification]
  );

  const getBadgeCount = useCallback(async () => {
    if (Platform.OS === 'web') return 0;
    return await Notifications.getBadgeCountAsync();
  }, []);

  const setBadgeCount = useCallback(async (count: number) => {
    if (Platform.OS === 'web') return;
    await Notifications.setBadgeCountAsync(count);
  }, []);

  const clearBadge = useCallback(async () => {
    if (Platform.OS === 'web') return;
    await Notifications.setBadgeCountAsync(0);
  }, []);

  return useMemo(
    () => ({
      permissionGranted,
      expoPushToken,
      requestPermissions,
      registerForPushNotifications,
      sendLocalNotification,
      notifyOrderUpdate,
      notifyNewMessage,
      getBadgeCount,
      setBadgeCount,
      clearBadge,
    }),
    [
      permissionGranted,
      expoPushToken,
      requestPermissions,
      registerForPushNotifications,
      sendLocalNotification,
      notifyOrderUpdate,
      notifyNewMessage,
      getBadgeCount,
      setBadgeCount,
      clearBadge,
    ]
  );
});
