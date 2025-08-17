import { LinearGradient } from 'expo-linear-gradient';
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
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Planet } from '../../types/planets';

const { width, height } = Dimensions.get('window');

interface PlanetModalProps {
  visible: boolean;
  planet: Planet | null;
  onClose: () => void;
}

export default function PlanetModal({ visible, planet, onClose }: PlanetModalProps) {
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);

  React.useEffect(() => {
    console.log('PlanetModal useEffect:', { visible, planet: planet?.turkishName });
    if (visible && planet) {
      console.log('Modal açılıyor...');
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      console.log('Modal kapanıyor...');
      modalScale.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, planet]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  console.log('PlanetModal render:', { visible, planet: planet?.turkishName });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          {planet && (
            <LinearGradient
              colors={[
                `${planet.color}20`,
                'rgba(15, 12, 41, 0.95)',
                'rgba(48, 43, 99, 0.95)'
              ]}
              style={styles.modalContent}
            >
              {/* Gezegen İkonu ve İsmi */}
              <View style={styles.planetHeader}>
                <View style={[styles.planetIconContainer, { backgroundColor: `${planet.color}30` }]}>
                  <Text style={[styles.planetEmoji, { textShadowColor: planet.color }]}>
                    {planet.emoji}
                  </Text>
                </View>
                <Text style={styles.planetName}>{planet.turkishName}</Text>
                <Text style={styles.planetSymbol}>{planet.symbol}</Text>
              </View>

              {/* Element Bilgisi */}
              <View style={styles.elementContainer}>
                <Text style={styles.elementLabel}>Element:</Text>
                <View style={[styles.elementBadge, { backgroundColor: `${planet.color}25` }]}>
                  <Text style={[styles.elementText, { color: planet.color }]}>
                    {planet.element}
                  </Text>
                </View>
              </View>

              {/* Açıklama */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Astrolojik Anlamı</Text>
                <Text style={styles.descriptionText}>{planet.description}</Text>
              </View>

              {/* Kapatma Butonu */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <LinearGradient
                  colors={[planet.color, `${planet.color}80`]}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Dekoratif Yıldızlar */}
              <View style={styles.decorativeStars}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.decorativeStar,
                      {
                        left: `${20 + Math.random() * 60}%`,
                        top: `${10 + Math.random() * 80}%`,
                        animationDelay: `${Math.random() * 2}s`,
                      },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
  },
  modalContent: {
    padding: 25,
    alignItems: 'center',
    position: 'relative',
  },
  planetHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  planetIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  planetEmoji: {
    fontSize: 36,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  planetName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  planetSymbol: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  elementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 10,
  },
  elementLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  elementBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  elementText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    textAlign: 'center',
  },
  closeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  decorativeStars: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  decorativeStar: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1.5,
  },
});