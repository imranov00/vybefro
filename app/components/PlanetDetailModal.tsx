import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PLANET_DETAILS, PLANET_IN_SIGNS, RETROGRADE_PLANETS } from '../types/planetDetails';
import { ZodiacSign } from '../types/zodiac';
import { zodiacSignTranslations } from '../utils/zodiacTranslations';
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
  sun: { accent: '#FFD700', surface: 'rgba(255,215,0,0.15)', border: '#FDB813' },
  moon: { accent: '#E6E6FA', surface: 'rgba(230,230,250,0.12)', border: '#C0C0C0' },
  mercury: { accent: '#00D9FF', surface: 'rgba(0,217,255,0.15)', border: '#4FC3F7' },
  venus: { accent: '#FF1493', surface: 'rgba(255,20,147,0.15)', border: '#FF69B4' },
  mars: { accent: '#FF4500', surface: 'rgba(255,69,0,0.15)', border: '#DC143C' },
  jupiter: { accent: '#FFB300', surface: 'rgba(255,179,0,0.15)', border: '#FFA500' },
  saturn: { accent: '#9370DB', surface: 'rgba(147,112,219,0.15)', border: '#BA55D3' },
  uranus: { accent: '#00CED1', surface: 'rgba(0,206,209,0.15)', border: '#20B2AA' },
  neptune: { accent: '#4169E1', surface: 'rgba(65,105,225,0.15)', border: '#1E90FF' },
};

const getTheme = (planet: string): PlanetTheme => {
  return PLANET_THEME[planet] || { accent: '#b3a7ff', surface: 'rgba(179,167,255,0.12)', border: 'rgba(179,167,255,0.32)' };
};

export default function PlanetDetailModal({ visible, onClose, planetName, userZodiac }: PlanetDetailModalProps) {
  const planetDetail = PLANET_DETAILS[planetName];
  const isRetrograde = RETROGRADE_PLANETS.includes(planetName);
  const zodiacEffect = userZodiac && PLANET_IN_SIGNS[planetName] ? PLANET_IN_SIGNS[planetName][userZodiac] : null;
  const theme = getTheme(planetName);

  if (!planetDetail) {
    return null;
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Başlık alanı: geniş görsel ve isim */}
        <LinearGradient
          colors={[planetDetail.gradient[0] + '40', planetDetail.gradient[1] + '20', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            {GEZEGEN_MAP[planetName] && (
              <View style={styles.imageContainer}>
                <View style={[styles.glowEffect, { backgroundColor: theme.accent, shadowColor: theme.accent }]} />
                <Image source={GEZEGEN_MAP[planetName]} style={styles.heroImage} resizeMode="contain" />
              </View>
            )}
            <View style={styles.titleRow}>
              <Text style={styles.symbol}>{planetDetail.symbol}</Text>
              <Text style={styles.title}>{planetDetail.name}</Text>
              {isRetrograde && (
                <View style={styles.retroBadgeLarge}>
                  <Text style={styles.retroTextLarge}>R</Text>
                </View>
              )}
            </View>
            <View style={styles.captionRow}>
              <View style={[styles.captionBadge, { backgroundColor: theme.accent + '30', borderColor: theme.accent }]}>
                <Text style={[styles.captionText, { color: theme.accent }]}>{planetDetail.element}</Text>
              </View>
              <View style={[styles.captionBadge, { backgroundColor: theme.accent + '30', borderColor: theme.accent }]}>
                <Text style={[styles.captionText, { color: theme.accent }]}>{planetDetail.orbitalPeriod}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Retrograd Uyarısı */}
        {isRetrograde && (
          <LinearGradient
            colors={['rgba(255,69,0,0.25)', 'rgba(255,107,107,0.15)']}
            style={styles.retroWarning}
          >
            <View style={styles.retroWarningHeader}>
              <Text style={styles.retroWarningIcon}>⚠️</Text>
              <Text style={styles.retroWarningTitle}>Retrograd Durumda</Text>
            </View>
            <Text style={styles.retroWarningText}>
              {planetName === 'mercury' && '🔄 İletişim, teknoloji ve sözleşmelerde dikkatli ol. Geçmiş konular yeniden gündeme gelebilir.'}
              {planetName === 'venus' && '💕 İlişkilerde geçmiş konular yeniden gündeme gelebilir. Eski aşklar dönebilir.'}
              {planetName !== 'mercury' && planetName !== 'venus' && '🌀 İçe dönüş, gözden geçirme ve yeniden değerlendirme zamanı.'}
            </Text>
          </LinearGradient>
        )}

        {/* Anahtar Kelimeler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accent + '30' }]}>
              <Text style={styles.sectionIcon}>🔑</Text>
            </View>
            <Text style={styles.sectionTitle}>Anahtar Kelimeler</Text>
          </View>
          <View style={styles.keywordsGrid}>
            {planetDetail.keywords.map((keyword, idx) => (
              <LinearGradient
                key={idx}
                colors={[theme.accent + '40', theme.accent + '20']}
                style={styles.keywordChip}
              >
                <Text style={styles.keywordText}>{keyword}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Mitoloji */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accent + '30' }]}>
              <Text style={styles.sectionIcon}>📖</Text>
            </View>
            <Text style={styles.sectionTitle}>Mitoloji & Anlamı</Text>
          </View>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            style={styles.mythologyCard}
          >
            <Text style={styles.mythologyText}>{planetDetail.mythology}</Text>
          </LinearGradient>
        </View>

        {/* Yöneticilik Bilgisi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accent + '30' }]}>
              <Text style={styles.sectionIcon}>👑</Text>
            </View>
            <Text style={styles.sectionTitle}>Astrolojik Konum</Text>
          </View>
          <LinearGradient
            colors={[theme.surface, 'rgba(255,255,255,0.02)']}
            style={styles.infoCard}
          >
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Yönetici Burçlar</Text>
              <Text style={[styles.infoValue, { color: theme.accent }]}>
                {planetDetail.rulerOf.map(sign => zodiacSignTranslations[sign as keyof typeof zodiacSignTranslations]).join(', ')}
              </Text>
            </View>
            {planetDetail.exaltedIn && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>Yüceldiği Burç</Text>
                <Text style={[styles.infoValue, { color: theme.accent }]}>{zodiacSignTranslations[planetDetail.exaltedIn as keyof typeof zodiacSignTranslations]}</Text>
              </View>
            )}
            {planetDetail.detrimentIn && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>Zayıf Olduğu</Text>
                <Text style={[styles.infoValue, { color: theme.accent }]}>{zodiacSignTranslations[planetDetail.detrimentIn as keyof typeof zodiacSignTranslations]}</Text>
              </View>
            )}
            {planetDetail.fallIn && (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>Düştüğü Burç</Text>
                <Text style={[styles.infoValue, { color: theme.accent }]}>{zodiacSignTranslations[planetDetail.fallIn as keyof typeof zodiacSignTranslations]}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Burca Özel Etki */}
        {zodiacEffect && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconCircle, { backgroundColor: theme.accent + '30' }]}>
                <Text style={styles.sectionIcon}>✨</Text>
              </View>
              <Text style={styles.sectionTitle}>{zodiacEffect.title}</Text>
            </View>

            <LinearGradient
              colors={[planetDetail.gradient[0] + '30', planetDetail.gradient[1] + '15', 'rgba(0,0,0,0.2)']}
              style={styles.zodiacEffectCard}
            >
              {/* Güç Göstergesi */}
              <View style={styles.strengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthLabel}>Etki Gücü</Text>
                  <Text style={[styles.strengthValue, { color: theme.accent }]}>
                    {zodiacEffect.strength}/100
                  </Text>
                </View>
                <View style={styles.strengthBarContainer}>
                  <LinearGradient
                    colors={[theme.accent, theme.accent + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.strengthBarFill, { width: `${zodiacEffect.strength}%` }]}
                  />
                </View>
              </View>

              {/* Açıklama */}
              <Text style={styles.zodiacDescription}>{zodiacEffect.description}</Text>

              {/* Keywords */}
              <View style={styles.zodiacKeywords}>
                {zodiacEffect.keywords.map((keyword, idx) => (
                  <View key={idx} style={[styles.zodiacKeywordChip, { borderColor: theme.accent }]}>
                    <Text style={styles.zodiacKeywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>

              {/* Güçlü Yönler */}
              <View style={styles.traitBox}>
                <View style={styles.traitHeader}>
                  <Text style={styles.traitIcon}>✅</Text>
                  <Text style={styles.traitTitle}>Güçlü Yönler</Text>
                </View>
                <Text style={styles.traitText}>{zodiacEffect.positiveTraits}</Text>
              </View>

              {/* Dikkat Edilmesi Gerekenler */}
              <View style={styles.traitBox}>
                <View style={styles.traitHeader}>
                  <Text style={styles.traitIcon}>⚠️</Text>
                  <Text style={[styles.traitTitle, { color: '#FFB300' }]}>Dikkat Edilmesi Gerekenler</Text>
                </View>
                <Text style={styles.traitText}>{zodiacEffect.challenges}</Text>
              </View>

              {/* Tavsiye */}
              <LinearGradient
                colors={[theme.accent + '30', theme.accent + '15']}
                style={styles.adviceContainer}
              >
                <View style={styles.adviceHeader}>
                  <Text style={styles.adviceIcon}>💡</Text>
                  <Text style={[styles.adviceTitle, { color: theme.accent }]}>Uzman Tavsiyesi</Text>
                </View>
                <Text style={styles.adviceText}>{zodiacEffect.advice}</Text>
              </LinearGradient>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 20,
  },
  headerGradient: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.3,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 10,
  },
  heroImage: {
    width: 140,
    height: 140,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbol: {
    fontSize: 36,
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  retroBadgeLarge: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  retroTextLarge: {
    fontSize: 14,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
  },
  captionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  captionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  captionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  retroWarning: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  retroWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  retroWarningIcon: {
    fontSize: 24,
  },
  retroWarningTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  retroWarningText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    flex: 1,
  },
  keywordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keywordChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  keywordText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  mythologyCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  mythologyText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  zodiacEffectCard: {
    borderRadius: 20,
    padding: 20,
    gap: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  strengthContainer: {
    gap: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  strengthValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  strengthBarContainer: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  zodiacDescription: {
    fontSize: 15,
    color: 'white',
    lineHeight: 24,
    fontWeight: '500',
  },
  zodiacKeywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zodiacKeywordChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  zodiacKeywordText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  traitBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traitIcon: {
    fontSize: 18,
  },
  traitTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4CAF50',
  },
  traitText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  adviceContainer: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adviceIcon: {
    fontSize: 24,
  },
  adviceTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  adviceText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 22,
    fontWeight: '500',
  },
});
