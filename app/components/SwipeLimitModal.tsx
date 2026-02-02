import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SwipeLimitModalProps {
  visible: boolean;
  onClose: () => void;
  remainingSwipes?: number;
  message?: string;
}

export default function SwipeLimitModal({
  visible,
  onClose,
  remainingSwipes = 0,
  message = 'Günlük swipe limitiniz doldu!'
}: SwipeLimitModalProps) {
  const router = useRouter();
  const pulseAnim = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      pulseAnim.value = withRepeat(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [visible]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const handleUpgradeToPremium = () => {
    onClose();
    // Premium ekranına yönlendir
    router.push('/(profile)/premiumScreen');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.overlay} />
        
        <View style={styles.modalView}>
          {/* Premium Icon with Pulse Animation */}
          <Animated.View style={[styles.iconContainer, animatedPulseStyle]}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF6B6B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="star" size={50} color="#FFF" />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>Swipe Limitiniz Doldu!</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Premium Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="infinite" size={20} color="#FFD700" />
              <Text style={styles.benefitText}>Sınırsız Swipe</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="heart" size={20} color="#FF6B6B" />
              <Text style={styles.benefitText}>Süper Beğeniler</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="eye" size={20} color="#4A90E2" />
              <Text style={styles.benefitText}>Kimler Beğendi</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={handleUpgradeToPremium}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumButtonGradient}
            >
              <Ionicons name="star" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.premiumButtonText}>Premium'a Geç</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>Daha Sonra</Text>
          </TouchableOpacity>

          {/* Reset Info */}
          <Text style={styles.resetInfo}>
            💡 Limitiniz yarın sıfırlanacak
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: width * 0.85,
    backgroundColor: '#1A1A2E',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#E0E0E0',
    marginLeft: 12,
    fontWeight: '500',
  },
  premiumButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    marginRight: 8,
  },
  premiumButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontWeight: '600',
  },
  resetInfo: {
    fontSize: 13,
    color: '#808080',
    marginTop: 15,
    textAlign: 'center',
  },
});
