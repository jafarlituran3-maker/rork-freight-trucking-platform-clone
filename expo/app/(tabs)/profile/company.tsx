import { router } from 'expo-router';
import { Building2, MapPin, CreditCard, Hash, Phone, Mail, User, Truck } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { CompanyProfile } from '@/types';

export default function CompanyProfileScreen() {
  const { company, createCompany, updateCompany } = useUser();

  const [name, setName] = useState(company?.name || '');
  const [inn, setInn] = useState(company?.inn || '');
  const [kpp, setKpp] = useState(company?.kpp || '');
  const [ogrn, setOgrn] = useState(company?.ogrn || '');
  const [legalAddress, setLegalAddress] = useState(company?.legalAddress || '');
  const [actualAddress, setActualAddress] = useState(company?.actualAddress || '');
  const [bankName, setBankName] = useState(company?.bankName || '');
  const [bankAccount, setBankAccount] = useState(company?.bankAccount || '');
  const [bankCorrespondentAccount, setBankCorrespondentAccount] = useState(
    company?.bankCorrespondentAccount || ''
  );
  const [bankBic, setBankBic] = useState(company?.bankBic || '');
  const [directorName, setDirectorName] = useState(company?.directorName || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [email, setEmail] = useState(company?.email || '');
  const [numberOfVehicles, setNumberOfVehicles] = useState(
    company?.numberOfVehicles?.toString() || ''
  );

  const handleSave = () => {
    if (!name || !inn || !legalAddress) {
      Alert.alert('Ошибка', 'Заполните обязательные поля: Название, ИНН, Юридический адрес');
      return;
    }

    const companyData: CompanyProfile = {
      id: company?.id || Date.now().toString(),
      name,
      inn,
      kpp,
      ogrn,
      legalAddress,
      actualAddress,
      bankName,
      bankAccount,
      bankCorrespondentAccount,
      bankBic,
      directorName,
      phone,
      email,
      numberOfVehicles: numberOfVehicles ? parseInt(numberOfVehicles, 10) : undefined,
      createdAt: company?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (company) {
      updateCompany(companyData);
      Alert.alert('Успешно', 'Данные компании обновлены', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      createCompany(companyData);
      Alert.alert('Успешно', 'Компания создана', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основная информация</Text>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Building2 size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>
                Название компании <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder='ООО "Логистика+"'
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <User size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Директор</Text>
              <TextInput
                style={styles.input}
                value={directorName}
                onChangeText={setDirectorName}
                placeholder="Иванов Иван Иванович"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Truck size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Количество транспортных средств</Text>
              <TextInput
                style={styles.input}
                value={numberOfVehicles}
                onChangeText={setNumberOfVehicles}
                placeholder="15"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Реквизиты</Text>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Hash size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>
                ИНН <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={inn}
                onChangeText={setInn}
                placeholder="7743013902"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Hash size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>КПП</Text>
              <TextInput
                style={styles.input}
                value={kpp}
                onChangeText={setKpp}
                placeholder="774301001"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Hash size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>ОГРН</Text>
              <TextInput
                style={styles.input}
                value={ogrn}
                onChangeText={setOgrn}
                placeholder="1027700132195"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Адреса</Text>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <MapPin size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>
                Юридический адрес <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={legalAddress}
                onChangeText={setLegalAddress}
                placeholder="г. Москва, ул. Ленина, д. 1"
                multiline
                numberOfLines={2}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <MapPin size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Фактический адрес</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={actualAddress}
                onChangeText={setActualAddress}
                placeholder="г. Москва, ул. Ленина, д. 1"
                multiline
                numberOfLines={2}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Банковские реквизиты</Text>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Building2 size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Наименование банка</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="ПАО Сбербанк"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <CreditCard size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Расчетный счет</Text>
              <TextInput
                style={styles.input}
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholder="40702810400000001234"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <CreditCard size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Корреспондентский счет</Text>
              <TextInput
                style={styles.input}
                value={bankCorrespondentAccount}
                onChangeText={setBankCorrespondentAccount}
                placeholder="30101810400000000225"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Hash size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>БИК</Text>
              <TextInput
                style={styles.input}
                value={bankBic}
                onChangeText={setBankBic}
                placeholder="044525225"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Phone size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Телефон</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+7 (___) ___-__-__"
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Mail size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="info@company.ru"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {company ? 'Сохранить изменения' : 'Создать компанию'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 8,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: Colors.error,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 24,
  },
});
