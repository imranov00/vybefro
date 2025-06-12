import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
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
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Match } from '../../services/api';
import {
    getCompatibilityColor,
    getCompatibilityLabel
} from '../../types/compatibility';
import { getZodiacDisplay, getZodiacEmoji } from '../../types/zodiac';

const { width, height } = Dimensions.get('window');

interface MatchScreenProps {
  match: Match;
  currentUser: {
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    zodiacSign: string;
  };
  onClose: () => void;
  onSendMessage: () => void;
}

const MatchScreen: React.FC<MatchScreenProps> = ({ 
  match, 
  currentUser, 
  onClose, 
  onSendMessage 
}) => {
  const router = useRouter();
  
  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const heartsScale = useSharedValue(0);
  const cardsTranslateY = useSharedValue(height);
  const textOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(100);

  const compatibilityColor = getCompatibilityColor(match.compatibilityScore);
  const compatibilityLabel = getCompatibilityLabel(match.compatibilityScore);

  useEffect(() => {
    // Animasyon sırası
    backgroundOpacity.value = withTiming(1, { duration: 300 });
    
    setTimeout(() => {
      heartsScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
    }, 200);

    setTimeout(() => {
      cardsTranslateY.value = withSpring(0, { damping: 15 });
    }, 400);

    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 500 });
    }, 800);

    setTimeout(() => {
      buttonsTranslateY.value = withSpring(0, { damping: 12 });
    }, 1000);
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const heartsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartsScale.value }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const handleSendMessage = () => {
    onSendMessage();
    // Mesajlaşma ekranına git - şimdilik onClose ile kapat
    onClose();
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Hearts Animation */}
      <Animated.View style={[styles.heartsContainer, heartsStyle]}>
        <View style={styles.heartLeft}>
          <Ionicons name="heart" size={60} color="#FF6B9D" />
        </View>
        <View style={styles.heartRight}>
          <Ionicons name="heart" size={60} color="#FF6B9D" />
        </View>
        <View style={styles.heartCenter}>
          <Ionicons name="heart" size={80} color="#FF1744" />
        </View>
      </Animated.View>

      {/* Match Text */}
      <Animated.View style={[styles.matchTextContainer, textStyle]}>
        <Text style={styles.matchText}>EŞLEŞME!</Text>
        <Text style={styles.matchSubtext}>
          {currentUser.firstName} ve {match.matchedUser.firstName} birbirinizi beğendiniz
        </Text>
      </Animated.View>

      {/* Profile Cards */}
      <Animated.View style={[styles.cardsContainer, cardsStyle]}>
        {/* Current User Card */}
        <View style={[styles.profileCard, styles.leftCard]}>
          <View style={styles.cardImageContainer}>
            {currentUser.profileImageUrl ? (
              <Image 
                source={{ uri: currentUser.profileImageUrl }} 
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>
                  {getZodiacEmoji(currentUser.zodiacSign)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
              {currentUser.firstName}
            </Text>
            <Text style={styles.cardZodiac}>
              {getZodiacDisplay(currentUser.zodiacSign)}
            </Text>
          </View>
        </View>

        {/* Match User Card */}
        <View style={[styles.profileCard, styles.rightCard]}>
          <View style={styles.cardImageContainer}>
            {match.matchedUser.profileImageUrl ? (
              <Image 
                source={{ uri: match.matchedUser.profileImageUrl }} 
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>
                  {getZodiacEmoji(match.matchedUser.zodiacSign)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
              {match.matchedUser.firstName}
            </Text>
            <Text style={styles.cardZodiac}>
              {getZodiacDisplay(match.matchedUser.zodiacSign)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Compatibility Info */}
      <Animated.View style={[styles.compatibilityContainer, textStyle]}>
        <View style={[styles.compatibilityBadge, { backgroundColor: compatibilityColor }]}>
          <Text style={styles.compatibilityScore}>%{match.compatibilityScore}</Text>
          <Text style={styles.compatibilityLabel}>{compatibilityLabel}</Text>
        </View>
        <Text style={styles.compatibilityDescription}>
          {match.compatibilityDescription}
        </Text>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleKeepSwiping}
        >
          <Text style={styles.secondaryButtonText}>Keşfetmeye Devam Et</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleSendMessage}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF1744']}
            style={styles.primaryButtonGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Mesaj Gönder</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <BlurView intensity={20} style={styles.closeButtonBlur}>
          <Ionicons name="close" size={24} color="white" />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heartsContainer: {
    position: 'absolute',
    top: height * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartLeft: {
    position: 'absolute',
    left: -40,
    top: 10,
    transform: [{ rotate: '-15deg' }],
  },
  heartRight: {
    position: 'absolute',
    right: -40,
    top: 10,
    transform: [{ rotate: '15deg' }],
  },
  heartCenter: {
    zIndex: 1,
  },
  matchTextContainer: {
    position: 'absolute',
    top: height * 0.25,
    alignItems: 'center',
  },
  matchText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  matchSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.1,
  },
  profileCard: {
    width: 140,
    height: 180,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  leftCard: {
    marginRight: 20,
    transform: [{ rotate: '-5deg' }],
  },
  rightCard: {
    marginLeft: 20,
    transform: [{ rotate: '5deg' }],
  },
  cardImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  cardInfo: {
    alignItems: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardZodiac: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  compatibilityContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
  },
  compatibilityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  compatibilityDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 40,
    left: 40,
    right: 40,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MatchScreen; 