import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { DiscoverUser } from '../../services/api';
import { getCompatibilityColor, getCompatibilityLabel } from '../../types/compatibility';
import { getZodiacDescription, getZodiacDisplay, getZodiacElement, getZodiacEmoji, getZodiacPlanet } from '../../types/zodiac';

const { width: screenWidth } = Dimensions.get('window');

enum PanelState {
  CLOSED = 0,
  HALF = 1,
  FULL = 2,
}

interface UserDetailPanelProps {
  user?: DiscoverUser;
  panelState: PanelState;
  onClose: () => void;
  onPanelStateChange?: (state: PanelState) => void;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  user,
  panelState,
  onClose,
  onPanelStateChange
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasScrolledToHalf, setHasScrolledToHalf] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    
    setLastScrollY(currentScrollY);
    setIsScrollingUp(scrollDirection === 'up');

    // İlk scroll - panel kapalıysa yarım aç
    if (panelState === PanelState.CLOSED && !hasScrolledToHalf) {
      setHasScrolledToHalf(true);
      onPanelStateChange?.(PanelState.HALF);
      return;
    }

    // Panel yarım haldeyken yukarı scroll - full aç
    if (panelState === PanelState.HALF && scrollDirection === 'up' && currentScrollY <= 0) {
      onPanelStateChange?.(PanelState.FULL);
    }
  };

  const handleScrollBeginDrag = () => {
    // Scroll başladığında eğer panel kapalıysa yarım aç
    if (panelState === PanelState.CLOSED && !hasScrolledToHalf) {
      setHasScrolledToHalf(true);
      onPanelStateChange?.(PanelState.HALF);
    }
  };

  // Panel durumu değiştiğinde scroll pozisyonunu sıfırla
  React.useEffect(() => {
    if (panelState === PanelState.HALF || panelState === PanelState.FULL) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
    if (panelState === PanelState.CLOSED) {
      setHasScrolledToHalf(false);
      setLastScrollY(0);
    }
  }, [panelState]);

  if (!user) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <View style={styles.handle} />
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>Kullanıcı bilgisi bulunamadı</Text>
        </View>
      </LinearGradient>
    );
  }

  const zodiacEmoji = getZodiacEmoji(user.zodiacSign);
  const zodiacDisplay = getZodiacDisplay(user.zodiacSign);
  const zodiacDescription = getZodiacDescription(user.zodiacSign);
  const zodiacElement = getZodiacElement(user.zodiacSign);
  const zodiacPlanet = getZodiacPlanet(user.zodiacSign);
  // Yeni backend sistemi için uyumluluk skoru kontrolü
  const compatibilityScore = user.compatibilityScore || 0;
  const compatibilityColor = getCompatibilityColor(compatibilityScore);
  const compatibilityLabel = getCompatibilityLabel(compatibilityScore);

  // Panel durumuna göre içerik
  const isMinimized = panelState === PanelState.CLOSED;
  const isHalfOpen = panelState === PanelState.HALF;
  const isFullOpen = panelState === PanelState.FULL;

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      {/* Drag Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
        {isMinimized && (
          <View style={styles.minimizedContent}>
            <Text style={styles.minimizedEmoji}>{zodiacEmoji}</Text>
            <View style={styles.minimizedInfo}>
              <Text style={styles.minimizedName}>{user.firstName}, {user.age}</Text>
              <Text style={styles.minimizedZodiac}>{zodiacDisplay}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="chevron-down" size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content */}
      {!isMinimized && (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          scrollEventThrottle={16}
          bounces={true}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.userHeader}>
              <View style={styles.zodiacBadgeLarge}>
                <Text style={styles.zodiacEmojiLarge}>{zodiacEmoji}</Text>
              </View>
              <View style={styles.userHeaderInfo}>
                <Text style={styles.userName}>{user.firstName}, {user.age}</Text>
                <Text style={styles.userZodiac}>{zodiacDisplay}</Text>
                
                {/* Uyumluluk - Yeni backend sistemi */}
                {compatibilityScore > 0 && (
                  <View style={[
                    styles.compatibilityBadge,
                    { backgroundColor: compatibilityColor }
                  ]}>
                    <Ionicons name="star" size={16} color="white" />
                    <Text style={styles.compatibilityScore}>
                      %{compatibilityScore} {compatibilityLabel}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.closeButtonHeader} onPress={onClose}>
                <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio Section */}
          {user.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hakkında</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}

          {/* Uyumluluk Analizi - Yeni backend sistemi */}
          {user.compatibilityMessage && compatibilityScore > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="heart" size={16} color="#B57EDC" /> Uyumluluk Analizi
              </Text>
              <View style={styles.compatibilityCard}>
                <Text style={styles.compatibilityDescription}>
                  {user.compatibilityMessage}
                </Text>
                <View style={styles.compatibilityScoreDisplay}>
                  <Text style={styles.compatibilityScoreText}>
                    Uyumluluk Skoru: %{compatibilityScore}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Burç Özellikleri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="star-outline" size={16} color="#B57EDC" /> Burç Özellikleri
            </Text>
            
            <View style={styles.zodiacDetails}>
              {/* Element */}
              <View style={styles.zodiacDetailItem}>
                <View style={styles.zodiacDetailIcon}>
                  <Text style={styles.elementEmoji}>{getElementEmoji(zodiacElement)}</Text>
                </View>
                <View style={styles.zodiacDetailInfo}>
                  <Text style={styles.zodiacDetailTitle}>Element</Text>
                  <Text style={styles.zodiacDetailValue}>{zodiacElement}</Text>
                </View>
              </View>

              {/* Planet */}
              <View style={styles.zodiacDetailItem}>
                <View style={styles.zodiacDetailIcon}>
                  <Text style={styles.elementEmoji}>{getPlanetEmoji(zodiacPlanet)}</Text>
                </View>
                <View style={styles.zodiacDetailInfo}>
                  <Text style={styles.zodiacDetailTitle}>Yönetici Gezegen</Text>
                  <Text style={styles.zodiacDetailValue}>{zodiacPlanet}</Text>
                </View>
              </View>
            </View>

            {/* Burç Açıklaması */}
            <View style={styles.zodiacDescription}>
              <Text style={styles.zodiacDescriptionText}>{zodiacDescription}</Text>
            </View>
          </View>

          {/* Kişilik Özellikleri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={16} color="#B57EDC" /> Kişilik Özellikleri
            </Text>
            
            <View style={styles.personalityTraits}>
              {getPersonalityTraits(user.zodiacSign).map((trait, index) => (
                <View key={index} style={styles.traitItem}>
                  <View style={styles.traitIcon}>
                    <Text style={styles.traitEmoji}>{trait.emoji}</Text>
                  </View>
                  <View style={styles.traitInfo}>
                    <Text style={styles.traitTitle}>{trait.title}</Text>
                    <Text style={styles.traitDescription}>{trait.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* İstatistikler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="analytics-outline" size={16} color="#B57EDC" /> Profil İstatistikleri
            </Text>
            
            <View style={styles.statsGrid}>
              {/* Mesafe - Yeni backend sistemi */}
              {user.distanceKm && (
                <View style={styles.statItem}>
                  <Ionicons name="location-outline" size={20} color="#B57EDC" />
                  <Text style={styles.statValue}>{user.distanceKm}km</Text>
                  <Text style={styles.statLabel}>Uzaklık</Text>
                </View>
              )}
              
              {/* Aktiflik Durumu - Yeni backend sistemi */}
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color="#B57EDC" />
                <Text style={styles.statValue}>
                  {user.isOnline ? 'Çevrimiçi' : 
                   user.activityStatus === 'online' ? 'Şimdi' : 
                   user.activityStatus === 'recently' ? 'Az önce' : 'Geçmişte'}
                </Text>
                <Text style={styles.statLabel}>
                  {user.isOnline ? 'Şu anda aktif' : 'Son aktivite'}
                </Text>
              </View>
              
              {/* Uyumluluk Skoru - Yeni backend sistemi */}
              {compatibilityScore > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="star" size={20} color="#B57EDC" />
                  <Text style={styles.statValue}>{compatibilityScore}%</Text>
                  <Text style={styles.statLabel}>Uyumluluk</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </LinearGradient>
  );
};

// Named export
export { PanelState, UserDetailPanel };

// Default export
export default UserDetailPanel;

// Helper functions
const getElementEmoji = (element: string): string => {
  switch (element.toLowerCase()) {
    case 'ateş': return '🔥';
    case 'toprak': return '🌍';
    case 'hava': return '💨';
    case 'su': return '💧';
    default: return '✨';
  }
};

const getPlanetEmoji = (planet: string): string => {
  const planetEmojis: { [key: string]: string } = {
    'mars': '♂️',
    'venüs': '♀️',
    'merkür': '☿️',
    'ay': '🌙',
    'güneş': '☀️',
    'jüpiter': '♃',
    'satürn': '♄',
    'uranüs': '♅',
    'neptün': '♆',
    'plüton': '♇'
  };
  return planetEmojis[planet.toLowerCase()] || '🪐';
};

const getPersonalityTraits = (zodiacSign: string) => {
  // Bu normalde types/zodiac.ts'den gelecek
  const traits = [
    { emoji: '💪', title: 'Güçlü Yönler', description: 'Kararlı, tutkulu, lider ruhlu' },
    { emoji: '🎯', title: 'Motivasyon', description: 'Başarı odaklı, rekabetçi' },
    { emoji: '❤️', title: 'Aşkta', description: 'Romantik, sadık, koruyucu' },
    { emoji: '🤝', title: 'Arkadaşlıkta', description: 'Güvenilir, destekleyici' }
  ];
  return traits;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  minimizedEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  minimizedInfo: {
    flex: 1,
  },
  minimizedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  minimizedZodiac: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerSection: {
    marginBottom: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacBadgeLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(181, 126, 220, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(181, 126, 220, 0.4)',
  },
  zodiacEmojiLarge: {
    fontSize: 28,
  },
  userHeaderInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userZodiac: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  compatibilityScoreDisplay: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  compatibilityScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  closeButtonHeader: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  compatibilityCard: {
    backgroundColor: 'rgba(181, 126, 220, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#B57EDC',
  },
  compatibilityDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
  zodiacDetails: {
    marginBottom: 16,
  },
  zodiacDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  zodiacDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(181, 126, 220, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  elementEmoji: {
    fontSize: 20,
  },
  zodiacDetailInfo: {
    flex: 1,
  },
  zodiacDetailTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  zodiacDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  zodiacDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(181, 126, 220, 0.3)',
  },
  zodiacDescriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  personalityTraits: {
    marginTop: 8,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  traitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(181, 126, 220, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  traitEmoji: {
    fontSize: 18,
  },
  traitInfo: {
    flex: 1,
  },
  traitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  traitDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(181, 126, 220, 0.3)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 50,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
}); 