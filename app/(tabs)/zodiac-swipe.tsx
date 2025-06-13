import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useAuth } from '../../context/AuthContext';
import { swipeApi } from '../../services/api';
import { calculateCompatibility, getCompatibilityColor, getCompatibilityDescription, getCompatibilityLabel } from '../../types/compatibility';
import { ZodiacSign, getZodiacInfo } from '../../types/zodiac';

const { width, height } = Dimensions.get('window');

export default function ZodiacSwipeScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);

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

  const handleSwipe = async (direction: 'left' | 'right', swipedUser: any) => {
    try {
      await swipeApi.swipe({
        targetUserId: swipedUser.id,
        action: direction === 'right' ? 'LIKE' : 'PASS'
      });
    } catch (error) {
      console.error('Swipe işlemi sırasında hata:', error);
    }
  };

  const renderCard = (user: any) => {
    if (!user) return null;

    const compatibilityScore = calculateCompatibility(
      user.zodiacSign as ZodiacSign,
      user?.zodiacSign as ZodiacSign
    );

    const compatibilityColor = getCompatibilityColor(compatibilityScore);
    const compatibilityLabel = getCompatibilityLabel(compatibilityScore);
    const compatibilityDescription = getCompatibilityDescription(
      user.zodiacSign as ZodiacSign,
      user?.zodiacSign as ZodiacSign,
      compatibilityScore
    );

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: user.profileImageUrl || 'https://via.placeholder.com/400' }}
          style={styles.image}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <BlurView intensity={20} style={styles.infoContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user.firstName}, {user.age}</Text>
              <Text style={styles.zodiac}>
                {getZodiacInfo(user.zodiacSign)?.emoji} {getZodiacInfo(user.zodiacSign)?.turkishName}
              </Text>
            </View>

            <View style={[styles.compatibilityContainer, { borderColor: compatibilityColor }]}>
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

            {user.bio && (
              <Text style={styles.bio} numberOfLines={3}>
                {user.bio}
              </Text>
            )}
          </BlurView>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
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
        backgroundColor={'#f0f0f0'}
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
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  card: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  swiperCard: {
    width: width * 0.9,
    height: height * 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  zodiac: {
    fontSize: 20,
    color: 'white',
  },
  compatibilityContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
  },
  compatibilityScore: {
    fontSize: 28,
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
    fontSize: 16,
    color: 'white',
    marginTop: 10,
    opacity: 0.9,
  },
}); 