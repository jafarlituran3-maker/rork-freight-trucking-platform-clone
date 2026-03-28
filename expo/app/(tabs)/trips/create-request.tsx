import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  Calendar,
  MapPin,
  Package,
  Weight,
  Box,
  FileText,
  DollarSign,
  Truck,
  User,
  Paperclip,
  Send,
  ChevronDown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import Colors from '@/constants/colors';

interface DocumentCheckbox {
  id: string;
  label: string;
  checked: boolean;
}

export default function CreateCarrierRequestScreen() {
  const router = useRouter();

  const [requestDateTime, setRequestDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  
  const [cargoType, setCargoType] = useState('');
  const [cargoDetails, setCargoDetails] = useState('');
  const [volume, setVolume] = useState('');
  const [weight, setWeight] = useState('');
  const [numberOfPieces, setNumberOfPieces] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  
  const [carrierInfo, setCarrierInfo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [semiTrailerType, setSemiTrailerType] = useState('');
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const [documents, setDocuments] = useState<DocumentCheckbox[]>([
    { id: 'contract', label: 'Договор', checked: false },
    { id: 'waybill', label: 'Путевой лист', checked: false },
    { id: 'upd', label: 'УПД', checked: false },
    { id: 'invoice', label: 'Счет', checked: false },
    { id: 'cmr', label: 'CMR', checked: false },
    { id: 'consignment', label: 'Товарная накладная', checked: false },
  ]);
  
  const [attachments, setAttachments] = useState<string[]>([]);

  const toggleDocument = (id: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === id ? { ...doc, checked: !doc.checked } : doc
      )
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDateTime = new Date(requestDateTime);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setRequestDateTime(newDateTime);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(requestDateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setRequestDateTime(newDateTime);
    }
  };

  const handleSubmit = () => {
    if (!originAddress || !destinationAddress) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните адреса отправки и доставки');
      return;
    }

    if (!cargoType || !weight || !volume) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните информацию о грузе');
      return;
    }

    const requestData = {
      requestDateTime,
      route: { origin: originAddress, destination: destinationAddress },
      cargo: {
        type: cargoType,
        details: cargoDetails,
        volume: parseFloat(volume),
        weight: parseFloat(weight),
        numberOfPieces: parseInt(numberOfPieces) || 0,
        specialRequirements,
      },
      carrier: {
        info: carrierInfo,
        driver: driverName,
        vehicleType,
        semiTrailerType,
      },
      financial: {
        amount: parseFloat(paymentAmount) || 0,
        paymentMethod,
      },
      documents: documents.filter(doc => doc.checked).map(doc => doc.label),
      attachments,
    };

    console.log('Создан запрос перевозчикам:', requestData);
    
    Alert.alert(
      'Успешно',
      'Запрос перевозчикам создан',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Дата и время запроса</Text>
          </View>
          
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeLabel}>Дата</Text>
              <Text style={styles.dateTimeValue}>
                {requestDateTime.toLocaleDateString('ru-RU')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeLabel}>Время</Text>
              <Text style={styles.dateTimeValue}>
                {requestDateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={requestDateTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={requestDateTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Маршрут</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Откуда</Text>
            <TextInput
              style={styles.input}
              value={originAddress}
              onChangeText={setOriginAddress}
              placeholder="Адрес отправки"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Куда</Text>
            <TextInput
              style={styles.input}
              value={destinationAddress}
              onChangeText={setDestinationAddress}
              placeholder="Адрес доставки"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Информация о грузе</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Тип груза</Text>
            <TextInput
              style={styles.input}
              value={cargoType}
              onChangeText={setCargoType}
              placeholder="Например: Продукты, Стройматериалы"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Подробное описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={cargoDetails}
              onChangeText={setCargoDetails}
              placeholder="Детальное описание груза"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.inputLabel}>Объем (м³)</Text>
              <TextInput
                style={styles.input}
                value={volume}
                onChangeText={setVolume}
                placeholder="0.0"
                placeholderTextColor={Colors.textLight}
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.inputLabel}>Вес (кг)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="0.0"
                placeholderTextColor={Colors.textLight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Количество мест</Text>
            <TextInput
              style={styles.input}
              value={numberOfPieces}
              onChangeText={setNumberOfPieces}
              placeholder="0"
              placeholderTextColor={Colors.textLight}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Особые требования</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={specialRequirements}
              onChangeText={setSpecialRequirements}
              placeholder="Температурный режим, хрупкость и т.д."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Информация о перевозчике</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Предпочтительная компания</Text>
            <TextInput
              style={styles.input}
              value={carrierInfo}
              onChangeText={setCarrierInfo}
              placeholder="Название или требования к перевозчику"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Водитель</Text>
            <TextInput
              style={styles.input}
              value={driverName}
              onChangeText={setDriverName}
              placeholder="ФИО водителя (если известен)"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Тип транспорта</Text>
            <TextInput
              style={styles.input}
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="Фура, газель, рефрижератор"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Тип полуприцепа</Text>
            <TextInput
              style={styles.input}
              value={semiTrailerType}
              onChangeText={setSemiTrailerType}
              placeholder="Тентованный, изотермический"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Финансовая информация</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Сумма оплаты (₽)</Text>
            <TextInput
              style={styles.input}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="0.00"
              placeholderTextColor={Colors.textLight}
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Способ оплаты</Text>
            <TextInput
              style={styles.input}
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="Наличные, безнал, эскроу"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Требуемые документы</Text>
          </View>
          
          <View style={styles.checkboxContainer}>
            {documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.checkboxItem}
                onPress={() => toggleDocument(doc.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, doc.checked && styles.checkboxChecked]}>
                  {doc.checked && (
                    <View style={styles.checkboxInner} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{doc.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Paperclip size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Вложения</Text>
          </View>
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => Alert.alert('Вложения', 'Функция добавления файлов')}
            activeOpacity={0.7}
          >
            <Paperclip size={18} color={Colors.accent} />
            <Text style={styles.attachButtonText}>Прикрепить файлы</Text>
          </TouchableOpacity>
          
          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <FileText size={16} color={Colors.textSecondary} />
                  <Text style={styles.attachmentName}>{attachment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Отправить запрос перевозчикам</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  attachmentsList: {
    marginTop: 12,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 20,
  },
});
