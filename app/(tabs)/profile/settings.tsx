import { router } from 'expo-router';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Building2, ChevronRight } from 'lucide-react-native';
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

export default function ProfileSettingsScreen() {
  const { user, updateUser, company } = useUser();

  const [fullName, setFullName] = useState(user.fullName);
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [middleName, setMiddleName] = useState(user.middleName || '');
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
  const [passport, setPassport] = useState(user.passport || '');

  const handleSave = () => {
    updateUser({
      fullName,
      firstName,
      lastName,
      middleName,
      phone,
      email,
      address,
      dateOfBirth,
      passport,
    });

    Alert.alert('Успешно', 'Профиль обновлен', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Личные данные</Text>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <User size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>ФИО полностью</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Иванов Иван Иванович"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <User size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Фамилия</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Иванов"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <User size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Имя</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Иван"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <User size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Отчество</Text>
              <TextInput
                style={styles.input}
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Иванович"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Calendar size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Дата рождения</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="01.01.1990"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <CreditCard size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Паспорт</Text>
              <TextInput
                style={styles.input}
                value={passport}
                onChangeText={setPassport}
                placeholder="1234 567890"
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
                placeholder="example@mail.ru"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <MapPin size={18} color={Colors.primary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Адрес</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="г. Москва, ул. Ленина, д. 1"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Компания</Text>

          <TouchableOpacity
            style={styles.companyButton}
            onPress={() => router.push('/(tabs)/profile/company')}
            activeOpacity={0.7}
          >
            <View style={styles.companyButtonContent}>
              <View style={styles.fieldIcon}>
                <Building2 size={20} color={Colors.primary} />
              </View>
              <View style={styles.companyButtonText}>
                <Text style={styles.companyButtonTitle}>
                  {company ? company.name : 'Добавить компанию'}
                </Text>
                {company && (
                  <Text style={styles.companyButtonSubtitle}>
                    ИНН: {company.inn}
                  </Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Сохранить изменения</Text>
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
  companyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  companyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyButtonText: {
    flex: 1,
  },
  companyButtonTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  companyButtonSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
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
