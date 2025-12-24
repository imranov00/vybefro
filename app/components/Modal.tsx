import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal as RNModal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

export default function Modal({ visible, onClose, children, closeOnBackdrop = true }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <LinearGradient 
                colors={['#1a1635', '#2d1a4a', '#1f1640']} 
                style={styles.gradientContent}
              >
                {children}
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 420,
    backgroundColor: 'transparent',
    borderRadius: 18,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,  },
  gradientContent: {
    borderRadius: 18,
    padding: 20,
    minHeight: 200,    shadowRadius: 3.84,
    elevation: 5,
  },
}); 