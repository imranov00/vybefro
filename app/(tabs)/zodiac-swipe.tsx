import { useProfile } from '@/app/context/ProfileContext';
import { DiscoverUser, swipeApi } from '@/app/services/api';
import { calculateCompatibility, getCompatibilityColor, getCompatibilityDescription, getCompatibilityLabel } from '@/app/types/compatibility';
import { ZodiacSign, getZodiacInfo } from '@/app/types/zodiac';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const { width, height } = Dimensions.get('window');

const BG_COLOR = '#2B0A4D'; // Projenin mor/koyu ana rengi
const CARD_BG = 'rgba(44, 19, 72, 0.95)'; // Kart için koyu mor arka plan

export default function ZodiacSwipeScreen() {
  const { userProfile } = useProfile();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await swipeApi.getDiscoverUsers(1, 20);
      if (response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', swipedUser: DiscoverUser) => {
    try {
      await swipeApi.swipe({
        targetUserId: swipedUser.id.toString(),
        action: direction === 'right' ? 'LIKE' : 'DISLIKE'
      });
    } catch (error) {
      console.error('Swipe işlemi sırasında hata:', error);
    }
  };

  const renderPhotoGallery = (user: DiscoverUser) => {
    const photos = user.photos && user.photos.length > 0
      ? user.photos.map(p => p.imageUrl)
      : user.profileImageUrl ? [user.profileImageUrl] : ['https://via.placeholder.com/400'];
    return (
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.image} />
        )}
        style={{ width: '100%', height: '100%' }}
      />
    );
  };

  const renderCard = (user: DiscoverUser) => {
    if (!user) return null;

    const compatibilityScore = calculateCompatibility(
      userProfile?.zodiacSign as ZodiacSign,
      user.zodiacSign as ZodiacSign
    );
    const compatibilityColor = getCompatibilityColor(compatibilityScore);
    const compatibilityLabel = getCompatibilityLabel(compatibilityScore);
    const compatibilityDescription = getCompatibilityDescription(
      userProfile?.zodiacSign as ZodiacSign,
      user.zodiacSign as ZodiacSign,
      compatibilityScore
    );
    const isOnline = user.isOnline;
    const distance = user.distance;
    const photos = user.photos && user.photos.length > 0
      ? user.photos.map(p => p.imageUrl)
      : user.profileImageUrl ? [user.profileImageUrl] : ['https://via.placeholder.com/400'];

    return (
      <View style={styles.card}>
        {/* Çoklu fotoğraf galerisi */}
        <View style={styles.photoGallery}>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, idx) => item + idx}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} />
            )}
            style={{ width: '100%', height: '100%' }}
          />
          {/* Fotoğraf sayacı */}
          {photos.length > 1 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>{`1 / ${photos.length}`}</Text>
            </View>
          )}
        </View>
        <LinearGradient
          colors={['transparent', CARD_BG]}
          style={styles.gradient}
        >
          <BlurView intensity={20} style={styles.infoContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user.firstName}, {user.age}</Text>
              <Text style={styles.zodiac}>
                {getZodiacInfo(user.zodiacSign)?.emoji} {getZodiacInfo(user.zodiacSign)?.turkishName}
              </Text>
            </View>
            {/* Ek bilgiler */}
            <View style={styles.extraInfoRow}>
              {isOnline && (
                <View style={styles.onlineDot} />
              )}
              {isOnline && <Text style={styles.onlineText}>Çevrimiçi</Text>}
              {distance !== undefined && (
                <Text style={styles.distanceText}>{distance} km</Text>
              )}
            </View>
            {/* Uyum kutusu */}
            <View style={[styles.compatibilityContainer, { borderColor: compatibilityColor, backgroundColor: compatibilityColor + '22' }]}> 
              <Text style={[styles.compatibilityScore, { color: compatibilityColor }]}>
                {compatibilityScore}%
              </Text>
              <Text style={[styles.compatibilityLabel, { color: compatibilityColor }]}>
                {compatibilityLabel}
              </Text>
              <Text style={styles.compatibilityDescription}>
                {compatibilityDescription}
              </Text>
            </View>
            {/* Biyografi */}
            <Text style={styles.bio} numberOfLines={3}>
              {user.bio ? user.bio : 'Kullanıcı biyografisi burada görünecek.'}
            </Text>
          </BlurView>
        </LinearGradient>
        {/* Swipe yönlendirmesi */}
        <View style={styles.swipeHintContainer}>
          <Ionicons name="arrow-back" size={28} color="#fff" style={{ opacity: 0.5, marginRight: 10 }} />
          <Text style={styles.swipeHintText}>Sola kaydır: Pas</Text>
          <Ionicons name="arrow-forward" size={28} color="#fff" style={{ opacity: 0.5, marginLeft: 10 }} />
          <Text style={styles.swipeHintText}>Sağa kaydır: Beğen</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>Burç uyumlu eşleşmeler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={users}
        renderCard={renderCard}
        onSwipedLeft={(cardIndex) => handleSwipe('left', users[cardIndex])}
        onSwipedRight={(cardIndex) => handleSwipe('right', users[cardIndex])}
        onSwipedAll={loadUsers}
        cardIndex={0}
        backgroundColor={BG_COLOR}
        stackSize={3}
        stackSeparation={15}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        infinite
        showSecondCard
        cardStyle={styles.swiperCard}
        overlayLabels={{
          left: {
            title: 'PAS',
            style: {
              label: {
                backgroundColor: '#FF6B6B',
                color: 'white',
                fontSize: 24,
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: 'BEĞEN',
            style: {
              label: {
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: 24,
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#A259FF',
  },
  card: {
    width: width * 0.92,
    height: height * 0.72,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  swiperCard: {
    width: width * 0.92,
    height: height * 0.72,
    alignSelf: 'center',
  },
  photoGallery: {
    width: '100%',
    height: '60%',
    backgroundColor: '#1a0033',
  },
  image: {
    width: width * 0.92,
    height: height * 0.43,
    resizeMode: 'cover',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  photoCounter: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  infoContainer: {
    padding: 20,
    height: '100%',
    justifyContent: 'flex-end',
  },
  nameContainer: {
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  zodiac: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  extraInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  onlineText: {
    color: '#4CAF50',
    fontSize: 13,
    marginRight: 10,
    fontWeight: '600',
  },
  distanceText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
    opacity: 0.8,
  },
  compatibilityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1.5,
  },
  compatibilityScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  compatibilityLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  compatibilityDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  bio: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 8,
  },
  swipeHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.7,
  },
  swipeHintText: {
    color: '#fff',
    fontSize: 13,
    marginHorizontal: 4,
  },
}); 