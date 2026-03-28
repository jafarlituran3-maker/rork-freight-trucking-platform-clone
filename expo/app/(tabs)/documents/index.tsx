import { FileText, Download, Upload, Search, Filter, CheckCircle, Clock, XCircle, FileCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { mockOrders } from '@/mocks/orders';
import { transportationDocuments } from '@/mocks/transportation-documents';
import { Document } from '@/types';
import { useRole } from '@/contexts/RoleContext';

export default function DocumentsScreen() {
  const router = useRouter();
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const isCargoOwner = role === 'cargo-owner';

  const allDocuments: (Document & { orderId?: string })[] = isCargoOwner
    ? transportationDocuments.map((doc) => ({ ...doc }))
    : mockOrders.flatMap((order) =>
        order.documents.map((doc) => ({ ...doc, orderId: order.id }))
      );

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const documentTypes = [
    { value: 'all', label: 'Все типы' },
    { value: 'contract', label: 'Договоры' },
    { value: 'invoice', label: 'Счет-фактуры' },
    { value: 'upd', label: 'УПД' },
    { value: 'consignment_note', label: 'ТОРГ-12' },
    { value: 'waybill', label: 'Накладные' },
    { value: 'cmr', label: 'CMR' },
    { value: 'edi', label: 'ЭДО' },
  ];

  const statuses = [
    { value: 'all', label: 'Все статусы' },
    { value: 'draft', label: 'Черновик' },
    { value: 'signed', label: 'Подписано' },
    { value: 'approved', label: 'Согласовано' },
    { value: 'rejected', label: 'Отклонено' },
  ];

  const getDocumentTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'contract':
        return 'Договор';
      case 'invoice':
        return 'Счет-фактура';
      case 'cmr':
        return 'CMR';
      case 'waybill':
        return 'Транспортная накладная';
      case 'upd':
        return 'УПД';
      case 'consignment_note':
        return 'ТОРГ-12';
      case 'edi':
        return 'ЭДО';
      default:
        return 'Документ';
    }
  };

  const getDocumentTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'contract':
        return Colors.primary;
      case 'invoice':
        return Colors.accent;
      case 'cmr':
        return Colors.success;
      case 'waybill':
        return Colors.info;
      case 'upd':
        return '#FF6B6B';
      case 'consignment_note':
        return '#4ECDC4';
      case 'edi':
        return '#95E1D3';
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'approved':
        return <FileCheck size={16} color={Colors.primary} />;
      case 'rejected':
        return <XCircle size={16} color={Colors.error} />;
      case 'draft':
        return <Clock size={16} color={Colors.textSecondary} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'signed':
        return 'Подписано';
      case 'approved':
        return 'Согласовано';
      case 'rejected':
        return 'Отклонено';
      case 'draft':
        return 'Черновик';
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск документов..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8}>
          <Upload size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Filter size={16} color={Colors.textSecondary} />
          <Text style={styles.filterLabel}>Тип:</Text>
          <View style={styles.filterButtons}>
            {documentTypes.slice(0, 4).map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.filterButton,
                  selectedType === type.value && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedType(type.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedType === type.value && styles.filterButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.documentCard} 
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/documents/${item.id}` as any)}
          >
            <View
              style={[
                styles.documentIcon,
                { backgroundColor: getDocumentTypeColor(item.type) + '20' },
              ]}
            >
              <FileText size={24} color={getDocumentTypeColor(item.type)} />
            </View>

            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{item.name}</Text>
              <View style={styles.documentMeta}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getDocumentTypeColor(item.type) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.typeText, { color: getDocumentTypeColor(item.type) }]}
                  >
                    {getDocumentTypeLabel(item.type)}
                  </Text>
                </View>
                <Text style={styles.documentDate}>
                  {new Date(item.uploadedAt).toLocaleDateString('ru-RU')}
                </Text>
              </View>
              {item.status && (
                <View style={styles.statusContainer}>
                  {getStatusIcon(item.status)}
                  <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
              )}
              {!isCargoOwner && item.orderId && (
                <Text style={styles.orderLink}>Заказ #{item.orderId}</Text>
              )}
            </View>

            <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7}>
              <Download size={20} color={Colors.accent} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Документы не найдены</Text>
            <Text style={styles.emptySubtext}>
              Загруженные документы будут отображаться здесь
            </Text>
          </View>
        }
      />
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  uploadButton: {
    backgroundColor: Colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  listContent: {
    padding: 16,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  documentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  orderLink: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
