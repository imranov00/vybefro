import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from './Modal';

interface VybeAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export default function VybeAlert({
  visible,
  title,
  message,
  onConfirm,
  confirmText = 'Tamam',
  showCancel = false,
  cancelText = 'İptal',
  onCancel,
  type = 'info'
}: VybeAlertProps) {
  console.log('🎨 [VYBE ALERT] Render:', { visible, title, type });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTypeColors = () => {
    switch (type) {
      case 'error':
        return {
          primary: '#FF6B6B',
          background: isDark ? '#2D1B1B' : '#FFF5F5',
          border: '#FF6B6B'
        };
      case 'warning':
        return {
          primary: '#FFA726',
          background: isDark ? '#2D241B' : '#FFFBF0',
          border: '#FFA726'
        };
      case 'success':
        return {
          primary: '#4CAF50',
          background: isDark ? '#1B2D1B' : '#F0FFF0',
          border: '#4CAF50'
        };
      default:
        return {
          primary: '#6366F1',
          background: isDark ? '#1B1B2D' : '#F0F0FF',
          border: '#6366F1'
        };
    }
  };

  const colors = getTypeColors();

  return (
    <Modal visible={visible} onClose={onCancel || onConfirm}>
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
          borderColor: colors.border
        }
      ]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.icon, { color: colors.primary }]}>
            {type === 'error' ? '⚠️' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
          </Text>
        </View>

        {/* Title */}
        <Text style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#1F1F1F' }
        ]}>
          {title}
        </Text>

        {/* Message */}
        <Text style={[
          styles.message,
          { color: isDark ? '#CCCCCC' : '#666666' }
        ]}>
          {message}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {showCancel && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: isDark ? '#333333' : '#F5F5F5',
                  borderColor: isDark ? '#555555' : '#E0E0E0'
                }
              ]}
              onPress={onCancel}
            >
              <Text style={[
                styles.buttonText,
                styles.cancelButtonText,
                { color: isDark ? '#CCCCCC' : '#666666' }
              ]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              {
                backgroundColor: colors.primary,
                flex: showCancel ? 1 : undefined,
                marginLeft: showCancel ? 12 : 0
              }
            ]}
            onPress={onConfirm}
          >
            <Text style={[styles.buttonText, styles.confirmButtonText]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});
