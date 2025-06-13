import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { DiscoverUser, userApi } from '../services/api';
import { getZodiacEmoji } from '../types/zodiac';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function AstrologySwipeScreen() {
  const { isPremium } = useAuth();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotation = useSharedValue(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getDiscoverUsers(1, 20);
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    try {
      const response = await userApi.swipe({
        toUserId: currentUser.id,
        action: direction === 'right' ? 'LIKE' : 'DISLIKE'
      });

      if (response.success && response.isMatch) {
        // Eşleşme durumunda bildirim göster
        console.log('Eşleşme!');
      }
    } catch (error) {
      console.error('Swipe hatası:', error);
    }

    setCurrentIndex(prev => prev + 1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    cardRotation.value = withSpring(0);
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number; startY: number }>({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
      cardRotation.value = translateX.value / 20;
    },
    onEnd: () => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const direction = translateX.value > 0 ? 'right' : 'left';
        handleSwipe(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        cardRotation.value = withSpring(0);
      }
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotation.value}deg` }
    ]
  }));

  const renderCard = (user: DiscoverUser, index: number) => {
    if (index < currentIndex) return null;

    const isTop = index === currentIndex;

    return (
      <PanGestureHandler
        key={user.id}
        enabled={isTop}
        onGestureEvent={gestureHandler}
      >
        <Animated.View
          style={[
            styles.card,
            animatedStyle,
            {
              zIndex: users.length - index,
              transform: [
                { scale: 1 - index * 0.02 },
                { translateY: index * -8 }
              ]
            }
          ]}
        >
          <Image
            source={{ uri: user.profileImageUrl || '' }}
            style={styles.cardImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.age}>{user.age}</Text>
              </View>
              
              <View style={styles.zodiacContainer}>
                <Text style={styles.zodiacEmoji}>{getZodiacEmoji(user.zodiacSign)}</Text>
                <Text style={styles.zodiacText}>{user.zodiacSign}</Text>
              </View>

              <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>
              
              <View style={styles.compatibilityContainer}>
                <Text style={styles.compatibilityLabel}>Uyumluluk:</Text>
                <Text style={styles.compatibilityScore}>%{user.compatibilityScore}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Burç Eşleşmeleri</Text>
        {!isPremium && (
          <Text style={styles.swipeLimit}>
            Kalan Swipe: {users.length - currentIndex}
          </Text>
        )}
      </View>

      <View style={styles.cardsContainer}>
        {users.map((user, index) => renderCard(user, index))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleSwipe('left')}
        >
          <Ionicons name="close" size={32} color="#FF5722" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right')}
        >
          <Ionicons name="heart" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  swipeLimit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardsContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  age: {
    fontSize: 20,
    color: 'white',
  },
  zodiacContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  zodiacEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  zodiacText: {
    fontSize: 16,
    color: 'white',
  },
  bio: {
    fontSize: 14,
    color: 'white',
    marginBottom: 12,
    lineHeight: 20,
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilityLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  compatibilityScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dislikeButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.2)',
  },
  likeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
}); 