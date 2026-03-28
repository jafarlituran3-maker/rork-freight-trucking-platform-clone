import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useEscrowPayments } from '@/contexts/EscrowPaymentContext';
import { Settings, Save } from 'lucide-react-native';

export default function CommissionConfigScreen() {
  const { commissionConfig, setCommission, calculateCommission } = useEscrowPayments();
  
  const [percent, setPercent] = useState<string>(commissionConfig.percent.toString());
  const [fixedAmount, setFixedAmount] = useState<string>(commissionConfig.fixedAmount.toString());
  const [testAmount, setTestAmount] = useState<string>('50000');

  const handleSave = async () => {
    const percentValue = parseFloat(percent);
    const fixedValue = parseFloat(fixedAmount);

    if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
      Alert.alert('Ошибка', 'Процент должен быть от 0 до 100');
      return;
    }

    if (isNaN(fixedValue) || fixedValue < 0) {
      Alert.alert('Ошибка', 'Фиксированная сумма должна быть положительной');
      return;
    }

    try {
      await setCommission(percentValue, fixedValue);
      Alert.alert('Успешно', 'Комиссия обновлена');
    } catch (error) {
      Alert.alert('Ошибка', String(error));
    }
  };

  const testAmountNum = parseFloat(testAmount) || 0;
  const testCommission = calculateCommission(testAmountNum);
  const testCarrierAmount = testAmountNum - testCommission;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Настройка Комиссии' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Settings size={48} color="#6366F1" />
          <Text style={styles.headerTitle}>Конфигурация комиссии платформы</Text>
          <Text style={styles.headerDescription}>
            Настройте процент и фиксированную сумму комиссии, которую платформа удерживает с каждой транзакции
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Параметры комиссии</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Процент (%)</Text>
            <TextInput
              style={styles.input}
              value={percent}
              onChangeText={setPercent}
              keyboardType="decimal-pad"
              placeholder="10"
            />
            <Text style={styles.inputHint}>
              Процент от общей суммы заказа
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Фиксированная сумма (₽)</Text>
            <TextInput
              style={styles.input}
              value={fixedAmount}
              onChangeText={setFixedAmount}
              keyboardType="decimal-pad"
              placeholder="500"
            />
            <Text style={styles.inputHint}>
              Фиксированная комиссия добавляется к проценту
            </Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Сохранить настройки</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Калькулятор комиссии</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Сумма заказа для теста (₽)</Text>
            <TextInput
              style={styles.input}
              value={testAmount}
              onChangeText={setTestAmount}
              keyboardType="decimal-pad"
              placeholder="50000"
            />
          </View>

          <View style={styles.calculatorResult}>
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Сумма заказа:</Text>
              <Text style={styles.calculatorValue}>
                {testAmountNum.toLocaleString()} ₽
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Комиссия платформы:</Text>
              <Text style={[styles.calculatorValue, styles.commissionValue]}>
                {testCommission.toLocaleString()} ₽
              </Text>
            </View>
            
            <View style={styles.calculatorBreakdown}>
              <Text style={styles.breakdownText}>
                • Процент: {((testAmountNum * parseFloat(percent)) / 100).toLocaleString()} ₽
              </Text>
              <Text style={styles.breakdownText}>
                • Фиксированная: {parseFloat(fixedAmount).toLocaleString()} ₽
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Перевозчик получит:</Text>
              <Text style={[styles.calculatorValue, styles.carrierValue]}>
                {testCarrierAmount.toLocaleString()} ₽
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Формула расчёта</Text>
          <Text style={styles.infoFormula}>
            Комиссия = (Сумма × Процент / 100) + Фиксированная сумма
          </Text>
          <Text style={styles.infoDescription}>
            Сумма перевозчику = Сумма заказа - Комиссия
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  calculatorResult: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calculatorLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  calculatorValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  commissionValue: {
    color: '#6366F1',
  },
  carrierValue: {
    color: '#10B981',
  },
  calculatorBreakdown: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4338CA',
    marginBottom: 8,
  },
  infoFormula: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 13,
    color: '#6366F1',
  },
});
