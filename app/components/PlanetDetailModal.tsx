import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEffectForZodiac, getPlanetInfo } from '../data/planetAstrology';
import { ZodiacSign } from '../types/zodiac';
import Modal from './Modal';
import Planet3DViewer from './Planet3DViewer';

interface PlanetDetailModalProps {
  visible: boolean;
  onClose: () => void;
  planetName: string; // lowercase
  userZodiac?: ZodiacSign;
}

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

export default function PlanetDetailModal({ visible, onClose, planetName, userZodiac }: PlanetDetailModalProps) {
  const info = getPlanetInfo(planetName);
  const zodiacEffect = getEffectForZodiac(planetName, userZodiac);

  return (
    <Modal visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header: Image card + title */}
        <View style={styles.header}>
          {CARD_MAP[planetName] && (
            <Image source={CARD_MAP[planetName]} style={styles.cardImage} resizeMode="cover" />
          )}
          <Text style={styles.title}>{info?.displayName ?? planetName.toUpperCase()}</Text>
          <Text style={styles.caption}>{info?.caption ?? 'Astrolojik Etki'}</Text>
        </View>

        {/* 3D Viewer */}
        <View style={styles.viewerBox}>
          <Planet3DViewer name={planetName} size={220} />
        </View>

        {/* Description */}
        {info?.description && (
          <Text style={styles.description}>{info.description}</Text>
        )}

        {/* Zodiac-specific effect */}
        {zodiacEffect && (
          <View style={styles.effectBox}>
            <Text style={styles.effectTitle}>Burcuna Etkisi</Text>
            <Text style={styles.effectText}>{zodiacEffect}</Text>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  caption: {
    fontSize: 14,
    opacity: 0.7,
  },
  viewerBox: {
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  effectBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  effectTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  effectText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
