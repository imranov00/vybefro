import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useLoading } from '../context/LoadingContext';

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <Modal
      transparent
      visible={isLoading}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator 
            size="large" 
            color="#6B7BFF"
            testID="loading-spinner"
          />
          <Text style={styles.text}>{loadingMessage}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    marginTop: 20,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});
