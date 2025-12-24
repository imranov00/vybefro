import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from './Modal';
import UniverseScene from './UniverseScene';

interface UniverseModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlanet: (name: string) => void;
}

// UniverseModal now renders an animated solar system scene.

export default function UniverseModal({ visible, onClose, onSelectPlanet }: UniverseModalProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🌌 Evren — Gezegenler Yörüngede</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeLabel}>Kapat</Text>
        </TouchableOpacity>
      </View>
      <UniverseScene onSelectPlanet={onSelectPlanet} />
      <Text style={styles.hint}>Bir gezegene dokun — detayını açalım.</Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1f2430',
    borderRadius: 8,
  },
  closeLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  hint: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6b6b7a',
  },
});
