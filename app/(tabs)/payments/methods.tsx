import { CreditCard, Plus, Trash2, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';

import Colors from '@/constants/colors';
import { usePayments } from '@/contexts/PaymentContext';
import { PaymentMethodType } from '@/types';

export default function PaymentMethodsScreen() {
  const {
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = usePayments();

  const [modalVisible, setModalVisible] = useState(false);
  const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('card');
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodDetails, setNewMethodDetails] = useState('');

  const handleAddMethod = () => {
    if (!newMethodName.trim() || !newMethodDetails.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    addPaymentMethod({
      type: newMethodType,
      name: newMethodName.trim(),
      details: newMethodDetails.trim(),
      isDefault: paymentMethods.length === 0,
    });

    setNewMethodName('');
    setNewMethodDetails('');
    setModalVisible(false);
    Alert.alert('Успех', 'Способ оплаты добавлен');
  };

  const handleRemoveMethod = (id: string) => {
    const method = paymentMethods.find((pm) => pm.id === id);
    if (!method) return;

    Alert.alert(
      'Подтверждение',
      `Удалить способ оплаты "${method.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            removePaymentMethod(id);
            Alert.alert('Успех', 'Способ оплаты удален');
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setDefaultPaymentMethod(id);
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    return <CreditCard size={24} color={Colors.primary} />;
  };

  const getMethodTypeText = (type: PaymentMethodType) => {
    switch (type) {
      case 'card':
        return 'Карта';
      case 'bank_transfer':
        return 'Банковский перевод';
      case 'invoice':
        return 'Счет';
      case 'cash':
        return 'Наличные';
      default:
        return type;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={styles.methodLeft}>
                {getMethodIcon(method.type)}
                <View style={styles.methodInfo}>
                  <View style={styles.methodNameRow}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Check size={12} color="#FFFFFF" />
                        <Text style={styles.defaultBadgeText}>По умолчанию</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.methodType}>
                    {getMethodTypeText(method.type)}
                  </Text>
                  <Text style={styles.methodDetails}>{method.details}</Text>
                </View>
              </View>
            </View>

            <View style={styles.methodActions}>
              {!method.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSetDefault(method.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>
                    Сделать основным
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleRemoveMethod(method.id)}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={Colors.error} />
                <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                  Удалить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {paymentMethods.length === 0 && (
          <View style={styles.emptyState}>
            <CreditCard size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Нет способов оплаты</Text>
            <Text style={styles.emptySubtext}>
              Добавьте свой первый способ оплаты
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Добавить способ оплаты</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Новый способ оплаты</Text>

            <View style={styles.typeSelector}>
              {(['card', 'bank_transfer', 'invoice', 'cash'] as PaymentMethodType[]).map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newMethodType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewMethodType(type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newMethodType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {getMethodTypeText(type)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Название (напр. Visa •••• 4242)"
              placeholderTextColor={Colors.textSecondary}
              value={newMethodName}
              onChangeText={setNewMethodName}
            />

            <TextInput
              style={styles.input}
              placeholder="Детали (напр. номер карты)"
              placeholderTextColor={Colors.textSecondary}
              value={newMethodDetails}
              onChangeText={setNewMethodDetails}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewMethodName('');
                  setNewMethodDetails('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddMethod}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 80,
  },
  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  methodType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceHover,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHover,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceHover,
  },
  confirmButton: {
    backgroundColor: Colors.accent,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
