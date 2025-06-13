import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { DiscoverUser, swipeApi } from '../services/api';
import { getZodiacEmoji } from '../types/zodiac';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = height * 0.75;

// Burç çarkı sembolleri
const ZODIAC_SYMBOLS = [
  { symbol: '♈', name: 'Koç', angle: 0 },
  { symbol: '♉', name: 'Boğa', angle: 30 },
  { symbol: '♊', name: 'İkizler', angle: 60 },
  { symbol: '♋', name: 'Yengeç', angle: 90 },
  { symbol: '♌', name: 'Aslan', angle: 120 },
  { symbol: '♍', name: 'Başak', angle: 150 },
  { symbol: '♎', name: 'Terazi', angle: 180 },
  { symbol: '♏', name: 'Akrep', angle: 210 },
  { symbol: '♐', name: 'Yay', angle: 240 },
  { symbol: '♑', name: 'Oğlak', angle: 270 },
  { symbol: '♒', name: 'Kova', angle: 300 },
  { symbol: '♓', name: 'Balık', angle: 330 },
];

// SwipeCard Props Interface
interface SwipeCardProps {
  user: DiscoverUser;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  style: any;
  isTop: boolean;
  photoIndex: number;
  setPhotoIndex: (index: number) => void;
}

// Swipe Card Component
const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, style, isTop, photoIndex, setPhotoIndex }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      if (!isTop) return;
      
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // Rotation based on horizontal movement
      const rotateValue = gestureState.dx / width * 0.4;
      rotate.setValue(rotateValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!isTop) return;
      
      pan.flattenOffset();
      
      const threshold = width * 0.25;
      const velocity = Math.abs(gestureState.vx);
      
      if (gestureState.dx > threshold || (gestureState.dx > 50 && velocity > 0.5)) {
        // Swipe Right - Like
        animateCardOut('right');
        setTimeout(() => onSwipe('right', user.id), 200);
      } else if (gestureState.dx < -threshold || (gestureState.dx < -50 && velocity > 0.5)) {
        // Swipe Left - Dislike
        animateCardOut('left');
        setTimeout(() => onSwipe('left', user.id), 200);
      } else if (gestureState.dy < -threshold || (gestureState.dy < -50 && velocity > 0.5)) {
        // Swipe Up - Super Like
        animateCardOut('up');
        setTimeout(() => onSwipe('up', user.id), 200);
      } else {
        // Return to center
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  const animateCardOut = (direction: 'left' | 'right' | 'up') => {
    const toValue = direction === 'right' ? { x: width * 1.5, y: 0 } :
                   direction === 'left' ? { x: -width * 1.5, y: 0 } :
                   { x: 0, y: -height * 1.5 };

    Animated.parallel([
      Animated.timing(pan, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate: rotateInterpolate },
    ],
    opacity,
  };

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, width * 0.25],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-width * 0.25, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = pan.y.interpolate({
    inputRange: [-height * 0.15, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handlePhotoTap = (side: 'left' | 'right') => {
    const photos = user.photos.map(p => p.imageUrl);
    if (side === 'left' && photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else if (side === 'right' && photoIndex < photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const photos = user.photos && user.photos.length > 0 ? user.photos : [{ imageUrl: typeof user.profileImageUrl === 'string' ? user.profileImageUrl : 'https://picsum.photos/400/600' }];

  return (
    <Animated.View
      style={[styles.card, style, animatedStyle]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Photo */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: photos[photoIndex].imageUrl }}
          style={styles.photo}
        />
        
        {/* Photo Navigation */}
        <View style={styles.photoNavigation}>
          <TouchableOpacity
            style={styles.photoNavLeft}
            onPress={() => handlePhotoTap('left')}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.photoNavRight}
            onPress={() => handlePhotoTap('right')}
            activeOpacity={1}
          />
        </View>

        {/* Photo Indicators */}
        {user.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {user.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === photoIndex && styles.photoIndicatorActive
                ]}
              />
            ))}
          </View>
        )}

        {/* Status Badges */}
        <View style={styles.statusBadges}>
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.badgeText}>Doğrulandı</Text>
            </View>
          )}
          
          {user.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.badgeText}>Premium</Text>
            </View>
          )}

          {user.isNewUser && (
            <View style={styles.newUserBadge}>
              <Ionicons name="sparkles" size={16} color="#FF6B6B" />
              <Text style={styles.badgeText}>Yeni</Text>
            </View>
          )}
        </View>

        {/* Swipe Overlays */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
          <Ionicons name="heart" size={60} color="white" />
          <Text style={styles.overlayText}>BEĞENDİM</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
          <Ionicons name="close" size={60} color="white" />
          <Text style={styles.overlayText}>HAYIR</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.superLikeOverlay, { opacity: superLikeOpacity }]}>
          <Ionicons name="star" size={60} color="white" />
          <Text style={styles.overlayText}>SÜPER BEĞENİ</Text>
        </Animated.View>

        {/* Liked Badge */}
        {/* {user.hasLikedCurrentUser && (
          <View style={styles.likedMeBadge}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={styles.likedMeText}>Sizi beğendi</Text>
          </View>
        )} */}
      </View>

      {/* User Info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.infoGradient}
      >
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <View style={styles.nameAndLocation}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}, {user.age}
              </Text>
              {/* {user.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.locationText}>{user.location}</Text>
                </View>
              )} */}
            </View>
            <View style={styles.zodiacBadge}>
              <Text style={styles.zodiacEmoji}>{getZodiacEmoji(user.zodiacSign)}</Text>
              {/* <Text style={styles.zodiacText}>{user.zodiacSignDisplay}</Text> */}
            </View>
          </View>

          <View style={styles.compatibilityRow}>
            <View style={styles.compatibilityBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.compatibilityText}>%{user.compatibilityScore} Uyumlu</Text>
            </View>
            {/* <View style={styles.activityBadge}>
              <Ionicons name="time" size={14} color="#4CAF50" />
              <Text style={styles.activityText}>{user.activityStatus}</Text>
            </View> */}
          </View>

          {user.bio && (
            <Text style={styles.userBio} numberOfLines={3}>
              {user.bio}
            </Text>
          )}

          {user.compatibilityDescription && (
            <View style={styles.compatibilityDesc}>
              <Text style={styles.compatibilityDescText}>
                {user.compatibilityDescription}
              </Text>
            </View>
          )}

          {/* <View style={styles.profileStats}>
            <Text style={styles.profileCompletenessText}>
              Profil tamamlanma: {user.profileCompleteness}
            </Text>
          </View> */}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function AstrologySwipeScreen() {
  const { userProfile } = useProfile();
  const { isPremium } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await swipeApi.getDiscoverUsers(1, 10);
      if (response.success && response.users.length > 0) {
        setUsers(response.users);
      }
    } catch (e) {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (action: 'LIKE' | 'DISLIKE') => {
    const user = users[currentIndex];
    if (!user) return;
    try {
      await swipeApi.swipe({ targetUserId: user.id.toString(), action });
    } catch {}
    setCurrentIndex((prev) => (prev + 1 < users.length ? prev + 1 : 0));
    setPhotoIndex(0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8000FF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Kullanıcı bulunamadı</Text>
      </View>
    );
  }

  const user = users[currentIndex];
  const photos = user.photos && user.photos.length > 0 ? user.photos : [{ imageUrl: typeof user.profileImageUrl === 'string' ? user.profileImageUrl : 'https://picsum.photos/400/600' }];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a1a2e", "#16213e", "#0f3460"]} style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        {/* Üstte burç ve uyum */}
        <View style={styles.headerRow}>
          <Text style={styles.zodiac}>{user.zodiacSign}</Text>
          <Text style={styles.compatibility}>%{user.compatibilityScore} Uyum</Text>
        </View>
        {/* Fotoğraf carousel */}
        <FlatList
          data={photos}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal={false}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          style={styles.photoList}
          renderItem={({ item }) => (
            <Image source={{ uri: item.imageUrl }} style={styles.photo} resizeMode="cover" />
          )}
        />
        {/* Kullanıcı adı ve yaş */}
        <Text style={styles.name}>{user.firstName} {user.lastName}, {user.age}</Text>
        {/* Bio */}
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        {/* Swipe butonları */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSwipe('DISLIKE')}>
            <Ionicons name="close" size={32} color="#FF6B6B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSwipe('LIKE')}>
            <Ionicons name="checkmark" size={32} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    width: width * 0.85,
    minHeight: height * 0.65,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  zodiac: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  compatibility: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  photoList: {
    width: '100%',
    height: height * 0.4,
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: height * 0.4,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#222',
  },
  name: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  bio: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginVertical: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginTop: 18,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 32,
    padding: 16,
    marginHorizontal: 16,
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  photoNavLeft: {
    flex: 1,
  },
  photoNavRight: {
    flex: 1,
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
  photoIndicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statusBadges: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'column',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  likedMeBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  likedMeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 87, 34, 0.8)',
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'flex-end',
  },
  userInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameAndLocation: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  zodiacBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(128, 0, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  zodiacEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  compatibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 10,
  },
  compatibilityDesc: {
    backgroundColor: 'rgba(128, 0, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  compatibilityDescText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  profileStats: {
    alignItems: 'center',
  },
  profileCompletenessText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
}); 