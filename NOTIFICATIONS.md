# Push Notifications Implementation

## Overview
The app now has a complete push notification system for job updates and messages.

## Features Implemented

### 1. Notification Context (`contexts/NotificationContext.tsx`)
- Manages notification permissions
- Handles foreground and background notifications
- Provides methods to send notifications for:
  - Order status updates
  - New messages
- Automatically navigates to the correct screen when user taps a notification

### 2. Order Notifications (`contexts/OrderContext.tsx`)
When an order status is updated, a notification is automatically sent with:
- **Title**: Translated status (e.g., "Груз в пути", "Груз доставлен")
- **Body**: Order details (route information)
- **Action**: Tapping opens the order detail screen

### 3. Message Notifications (`contexts/MessageContext.tsx`)
When a new message is received from another user, a notification is sent with:
- **Title**: "Новое сообщение от [Sender Name]"
- **Body**: Message text preview
- **Action**: Tapping opens the chat screen

### 4. Badge Management
The notification context provides methods to:
- Get current badge count
- Set badge count (for unread messages/orders)
- Clear badge

## Testing Notifications

### Test Order Status Updates
1. Navigate to any order detail screen
2. Tap the "Обновить до: [Next Status]" button
3. You'll see:
   - An alert confirming the update
   - A push notification with the new status

### Test Message Notifications
1. Go to the Messages tab
2. Tap the "Тест" button in the header
3. A simulated message from a carrier will be sent
4. You'll receive a notification

## Platform Support

### iOS & Android (Native)
- Full push notification support
- Sound, vibration, and badge
- Notification taps navigate to correct screen
- Background notifications work

### Web
- Notifications are logged to console
- No native push notification support in browser
- All functionality gracefully degrades

## Permission Handling

The app automatically:
1. Requests notification permissions on app start
2. Sets up notification channels (Android)
3. Registers for push notifications
4. Handles permission denial gracefully

## Notification Flow

### Order Update Flow
```
User taps "Update Status" 
  → OrderContext.updateOrderStatus()
  → NotificationContext.notifyOrderUpdate()
  → Notification displayed
  → User taps notification
  → Navigate to order detail screen
```

### Message Flow
```
Message received from carrier
  → MessageContext.sendMessage()
  → NotificationContext.notifyNewMessage()
  → Notification displayed
  → User taps notification
  → Navigate to chat screen
```

## Configuration

Notification settings are in:
- `contexts/NotificationContext.tsx` - Main configuration
- `app.json` - Expo notification plugin (auto-configured)

## Future Enhancements

Potential improvements:
1. Remote push notifications (via server)
2. Notification preferences/settings screen
3. Notification history
4. Rich notifications with images
5. Action buttons in notifications
6. Silent notifications for background sync
