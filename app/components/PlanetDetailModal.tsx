import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEffectForZodiac, getPlanetInfo } from '../data/planetAstrology';
import { ZodiacSign } from '../types/zodiac';
import Modal from './Modal';

interface PlanetDetailModalProps {
  visible: boolean;
  onClose: () => void;
  planetName: string; // lowercase
  userZodiac?: ZodiacSign;
}

// Yeni stil: gezegen görsellerini simgeler/gezegenler klasöründen al
const GEZEGEN_MAP: Record<string, any> = {
  mercury: require('../../simgeler/gezegenler/merkür.png'),
  venus: require('../../simgeler/gezegenler/venus.png'),
  mars: require('../../simgeler/gezegenler/mars.png'),
  jupiter: require('../../simgeler/gezegenler/jupiter.png'),
  saturn: require('../../simgeler/gezegenler/saturn.png'),
  uranus: require('../../simgeler/gezegenler/uranus.png'),
  neptune: require('../../simgeler/gezegenler/neptun.png'),
  sun: require('../../simgeler/gezegenler/Gunes.png'),
  moon: require('../../simgeler/gezegenler/ay.png'),
};

type PlanetTheme = {
  accent: string;
  surface: string;
  border: string;
};

const PLANET_THEME: Record<string, PlanetTheme> = {
  sun: { accent: '#ffdd5e', surface: 'rgba(26,20,8,0.82)', border: 'rgba(255,204,77,0.45)' },
  moon: { accent: '#e8f1f5', surface: 'rgba(20,22,26,0.84)', border: 'rgba(207,216,220,0.48)' },
  mercury: { accent: '#6ed4ff', surface: 'rgba(8,24,32,0.82)', border: 'rgba(92,199,255,0.45)' },
  venus: { accent: '#ffa5c8', surface: 'rgba(32,18,26,0.82)', border: 'rgba(255,143,177,0.45)' },
  mars: { accent: '#ff8888', surface: 'rgba(32,14,14,0.82)', border: 'rgba(255,107,107,0.45)' },
  jupiter: { accent: '#ffc764', surface: 'rgba(32,22,8,0.82)', border: 'rgba(255,179,71,0.45)' },
  saturn: { accent: '#d4b8ff', surface: 'rgba(24,18,32,0.82)', border: 'rgba(196,161,255,0.45)' },
  uranus: { accent: '#6ff0e6', surface: 'rgba(8,32,28,0.82)', border: 'rgba(90,226,215,0.45)' },
  neptune: { accent: '#74a3ff', surface: 'rgba(12,18,32,0.82)', border: 'rgba(91,141,255,0.45)' },
};

const getTheme = (planet: string): PlanetTheme => {
  return PLANET_THEME[planet] || { accent: '#b3a7ff', surface: 'rgba(179,167,255,0.12)', border: 'rgba(179,167,255,0.32)' };
};

export default function PlanetDetailModal({ visible, onClose, planetName, userZodiac }: PlanetDetailModalProps) {
  const info = getPlanetInfo(planetName);
  const zodiacEffect = getEffectForZodiac(planetName, userZodiac);
  const theme = getTheme(planetName);
  const bullets = info?.description
    ? info.description.split('. ').filter(Boolean).slice(0, 4)
    : [];

  return (
    <Modal visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Başlık alanı: geniş görsel ve isim */}
        <View style={styles.header}>
          {GEZEGEN_MAP[planetName] && (
            <Image source={GEZEGEN_MAP[planetName]} style={styles.heroImage} resizeMode="contain" />
          )}
          <Text style={[styles.title, { color: theme.accent }]}>{info?.displayName ?? planetName.toUpperCase()}</Text>
          <Text style={[styles.caption, { color: theme.accent }]}>{info?.caption ?? 'Astrolojik Etki'}</Text>
        </View>

        {/* Açıklama */}
        <View style={[styles.cardBox, { backgroundColor: theme.surface, borderColor: theme.border }] }>
          <Text style={[styles.sectionTitle, { color: theme.accent }]}>Genel Tanım</Text>
          {bullets.length > 0 ? (
            bullets.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, { color: theme.accent }]}>•</Text>
                <Text style={styles.description}>{item.trim()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.description}>{info?.description || 'Bu gezegen için içerik hazırlanıyor.'}</Text>
          )}
        </View>

        {/* Burca etkisi */}
        {zodiacEffect && (
          <View style={[styles.cardBox, { backgroundColor: theme.surface, borderColor: theme.border }] }>
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>Burcuna Etkisi</Text>
            <Text style={styles.description}>{zodiacEffect}</Text>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8faff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    fontSize: 15,
    color: '#d4deff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f2f6ff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    color: '#f0f4ff',
    flex: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 18,
    lineHeight: 24,
    color: '#f8faff',
    fontWeight: '700',
  },
});
