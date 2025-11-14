import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Check, RotateCcw, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SignaturePadProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title?: string;
}

export default function SignaturePad({ visible, onClose, onSave, title = 'Электронная подпись' }: SignaturePadProps) {
  const signatureRef = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  };

  const handleConfirm = () => {
    if (!hasSignature) {
      Alert.alert('Ошибка', 'Пожалуйста, поставьте подпись перед сохранением');
      return;
    }
    signatureRef.current?.readSignature();
  };

  const handleOK = (signature: string) => {
    onSave(signature);
    setHasSignature(false);
    onClose();
  };

  const handleBegin = () => {
    setHasSignature(true);
  };

  const handleEnd = () => {
    setHasSignature(true);
  };

  const handleEmpty = () => {
    setHasSignature(false);
  };

  const style = `.m-signature-pad {
    box-shadow: none;
    border: none;
    margin: 0;
  }
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body,html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: white;
  }`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.canvasContainer}>
          <Text style={styles.instruction}>Поставьте подпись в рамке ниже</Text>
          <View style={styles.signatureBox}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleOK}
              onBegin={handleBegin}
              onEnd={handleEnd}
              onEmpty={handleEmpty}
              descriptionText=""
              clearText="Очистить"
              confirmText="Сохранить"
              webStyle={style}
              backgroundColor="white"
              penColor={Colors.text}
              minWidth={2}
              maxWidth={4}
            />
          </View>
          <Text style={styles.hint}>Используйте палец или стилус для подписи</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <RotateCcw size={20} color={Colors.text} />
            <Text style={styles.clearButtonText}>Очистить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton, !hasSignature && styles.buttonDisabled]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={!hasSignature}
          >
            <Check size={20} color={Colors.surface} />
            <Text style={styles.confirmButtonText}>Подтвердить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  canvasContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  signatureBox: {
    height: 300,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  hint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: Colors.accent,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.surface,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
