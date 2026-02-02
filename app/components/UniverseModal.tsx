import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Modal from './Modal';

interface UniverseModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlanet: (name: string) => void;
}

const PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

const CARD_MAP: Record<string, any> = {
  mercury: require('../../simgeler/cards/mercury.png'),
  venus: require('../../simgeler/cards/venus.png'),
  earth: require('../../simgeler/cards/earth.png'),
  mars: require('../../simgeler/cards/mars.png'),
  jupiter: require('../../simgeler/cards/jupiter.png'),
  saturn: require('../../simgeler/cards/saturn.png'),
  uranus: require('../../simgeler/cards/uranus.png'),
  neptune: require('../../simgeler/cards/neptune.png'),
  sun: require('../../simgeler/cards/sun.png'),
  moon: require('../../simgeler/cards/moon.png'),
};

export default function UniverseModal({ visible, onClose, onSelectPlanet }: UniverseModalProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={styles.header}>🌌 Evren — Gezegenler</Text>
      <FlatList
        data={PLANETS}
        numColumns={2}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSelectPlanet(item)}>
            {CARD_MAP[item] && (
              <Image source={CARD_MAP[item]} style={styles.image} resizeMode="cover" />
            )}
            <Text style={styles.label}>{item.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  label: {
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});
