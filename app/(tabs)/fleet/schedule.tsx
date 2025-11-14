import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import Colors from '@/constants/colors';
import { useFleet } from '@/contexts/FleetContext';
import { ScheduleStatus } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScheduleScreen() {
  const { drivers, getDriverSchedules, addSchedule } = useFleet();
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatus>('available');
  const [notes, setNotes] = useState('');

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getScheduleForDriverAndDate = (driverId: string, date: Date) => {
    const dateStr = formatDate(date);
    const schedules = getDriverSchedules(driverId);
    return schedules.find((s) => s.date === dateStr);
  };

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case 'available':
        return Colors.success;
      case 'busy':
        return Colors.warning;
      case 'on_break':
        return Colors.primary;
      case 'off_duty':
        return Colors.textSecondary;
      case 'on_leave':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: ScheduleStatus) => {
    switch (status) {
      case 'available':
        return 'Дост.';
      case 'busy':
        return 'Занят';
      case 'on_break':
        return 'Перерыв';
      case 'off_duty':
        return 'Выходной';
      case 'on_leave':
        return 'Отпуск';
      default:
        return '';
    }
  };

  const openAddModal = (driverId: string, date: Date) => {
    setSelectedDriverId(driverId);
    setSelectedDate(formatDate(date));
    setStartTime('08:00');
    setEndTime('20:00');
    setScheduleStatus('available');
    setNotes('');
    setModalVisible(true);
  };

  const handleSaveSchedule = () => {
    if (!selectedDriverId || !selectedDate) {
      Alert.alert('Ошибка', 'Выберите водителя и дату');
      return;
    }

    addSchedule({
      driverId: selectedDriverId,
      date: selectedDate,
      startTime,
      endTime,
      status: scheduleStatus,
      notes,
    });

    setModalVisible(false);
    Alert.alert('Успешно', 'Расписание добавлено');
  };

  const handleCellPress = (driverId: string, date: Date) => {
    const schedule = getScheduleForDriverAndDate(driverId, date);
    if (schedule) {
      Alert.alert(
        'Расписание',
        `${getStatusText(schedule.status)}\n${schedule.startTime} - ${schedule.endTime}\n${schedule.notes || ''}`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Изменить',
            onPress: () => {
              setSelectedDriverId(driverId);
              setSelectedDate(formatDate(date));
              setStartTime(schedule.startTime);
              setEndTime(schedule.endTime);
              setScheduleStatus(schedule.status);
              setNotes(schedule.notes || '');
              setModalVisible(true);
            },
          },
        ]
      );
    } else {
      openAddModal(driverId, date);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={previousWeek} style={styles.navButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.weekInfo}>
          <CalendarIcon size={20} color={Colors.primary} />
          <Text style={styles.weekText}>
            {weekDates[0].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} -{' '}
            {weekDates[6].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        <TouchableOpacity onPress={nextWeek} style={styles.navButton}>
          <ChevronRight size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <View style={styles.headerRow}>
            <View style={styles.driverNameCell}>
              <Text style={styles.headerText}>Водитель</Text>
            </View>
            {weekDates.map((date, index) => (
              <View key={index} style={styles.dateCell}>
                <Text style={styles.dayText}>
                  {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                </Text>
                <Text style={styles.dateText}>{date.getDate()}</Text>
              </View>
            ))}
          </View>

          <ScrollView style={styles.tableScroll}>
            {drivers.map((driver) => (
              <View key={driver.id} style={styles.driverRow}>
                <View style={styles.driverNameCell}>
                  <Text style={styles.driverName} numberOfLines={2}>
                    {driver.name}
                  </Text>
                </View>
                {weekDates.map((date, index) => {
                  const schedule = getScheduleForDriverAndDate(driver.id, date);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.scheduleCell,
                        schedule && {
                          backgroundColor: getStatusColor(schedule.status) + '20',
                        },
                      ]}
                      onPress={() => handleCellPress(driver.id, date)}
                      activeOpacity={0.7}
                    >
                      {schedule ? (
                        <>
                          <Text
                            style={[
                              styles.scheduleStatus,
                              { color: getStatusColor(schedule.status) },
                            ]}
                          >
                            {getStatusText(schedule.status)}
                          </Text>
                          <Text style={styles.scheduleTime}>
                            {schedule.startTime}-{schedule.endTime}
                          </Text>
                        </>
                      ) : (
                        <Plus size={16} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить расписание</Text>

            <Text style={styles.label}>Водитель</Text>
            <Picker
              selectedValue={selectedDriverId}
              onValueChange={setSelectedDriverId}
              style={styles.picker}
            >
              <Picker.Item label="Выберите водителя" value="" />
              {drivers.map((driver) => (
                <Picker.Item key={driver.id} label={driver.name} value={driver.id} />
              ))}
            </Picker>

            <Text style={styles.label}>Дата: {selectedDate}</Text>

            <Text style={styles.label}>Время начала</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="08:00"
            />

            <Text style={styles.label}>Время окончания</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="20:00"
            />

            <Text style={styles.label}>Статус</Text>
            <Picker
              selectedValue={scheduleStatus}
              onValueChange={(value) => setScheduleStatus(value as ScheduleStatus)}
              style={styles.picker}
            >
              <Picker.Item label="Доступен" value="available" />
              <Picker.Item label="Занят" value="busy" />
              <Picker.Item label="Перерыв" value="on_break" />
              <Picker.Item label="Выходной" value="off_duty" />
              <Picker.Item label="В отпуске" value="on_leave" />
            </Picker>

            <Text style={styles.label}>Примечания</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Дополнительная информация"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveSchedule}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navButton: {
    padding: 8,
  },
  weekInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  driverNameCell: {
    width: 120,
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  dateCell: {
    width: 100,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  dayText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 4,
  },
  tableScroll: {
    flex: 1,
  },
  driverRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  scheduleCell: {
    width: 100,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    minHeight: 70,
  },
  scheduleStatus: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
