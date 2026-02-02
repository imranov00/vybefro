import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
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
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Statik premium özellikler
const premiumFeatures = [
  {
    id: '1',
    title: 'Sınırsız Beğeni',
    description: 'Günlük beğeni limitiniz olmayacak',
    icon: 'heart'
  },
  {
    id: '2',
    title: 'Kimler Beğendi',
    description: 'Sizi beğenen kişileri görün',
    icon: 'eye'
  },
  {
    id: '3',
    title: 'Süper Beğeni',
    description: 'Öne çıkmak için süper beğeni gönderin',
    icon: 'star'
  },
  {
    id: '4',
    title: 'Gelişmiş Filtreler',
    description: 'Daha detaylı arama kriterleri',
    icon: 'options'
  },
  {
    id: '5',
    title: 'Reklamsız Deneyim',
    description: 'Hiç reklam görmeden kullanın',
    icon: 'remove-circle'
  },
  {
    id: '6',
    title: 'Öncelikli Destek',
    description: '7/24 öncelikli müşteri desteği',
    icon: 'headset'
  }
];

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const { currentMode, isPremium, setPremium } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Animasyon değerleri
  const shimmerAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    // Shimmer animasyonu
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    // Pulse animasyonu
    pulseAnim.value = withRepeat(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedShimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerAnim.value * (width + 100) - 100 }],
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
    };
  });

  // Mode'a göre renkler
  const getThemeColors = () => {
    if (currentMode === 'music') {
      return {
        gradient: ['#1DB954', '#1E7E34', '#145A24'] as const,
        accent: '#1DB954',
        secondary: '#FFD700',
      };
    } else {
      return {
        gradient: ['#8000FF', '#5B00B5', '#3D007A'] as const,
        accent: '#8000FF',
        secondary: '#FFFFFF',
      };
    }
  };

  const themeColors = getThemeColors();

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      
      // Gerçek API çağrısı
      const { premiumApi } = await import('../services/api');
      const response = await premiumApi.purchase({
        plan: 'monthly',
        paymentMethod: 'credit_card'
      });
      
      if (response.success) {
        // Premium'u aktif et
        setPremium(true);
        
        Alert.alert('🎉 Tebrikler!', response.message || 'Premium üyeliğiniz başarıyla aktifleştirildi! Artık tüm premium özelliklerden yararlanabilirsiniz.', [
          {
            text: 'Harika!',
            onPress: () => {
              // Kullanıcıyı ana sayfaya yönlendir, mode değişmeyecek
              router.replace('/(tabs)/' as any);
            }
          }
        ]);
      } else {
        Alert.alert('Hata', response.message || 'Premium satın alma işlemi başarısız oldu.');
      }
    } catch (error: any) {
      console.error('Premium satın alma hatası:', error);
      Alert.alert('Hata', 'Premium satın alma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Premium İptal Et',
      'Premium üyeliğinizi iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              
              // Gerçek API çağrısı
              const { premiumApi } = await import('../services/api');
              const response = await premiumApi.cancel();
              
              if (response.success) {
                // Premium'u iptal et
                setPremium(false);
                
                Alert.alert('İptal Edildi', response.message || 'Premium üyeliğiniz başarıyla iptal edildi.', [
                  {
                    text: 'Tamam',
                    onPress: () => {
                      // Kullanıcıyı ana sayfaya yönlendir, mode değişmeyecek
                      router.replace('/(tabs)/' as any);
                    }
                  }
                ]);
              } else {
                Alert.alert('Hata', response.message || 'Premium iptal işlemi başarısız oldu.');
              }
            } catch (error: any) {
              console.error('Premium iptal hatası:', error);
              Alert.alert('Hata', 'Premium iptal sırasında bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    // Mevcut moda göre doğru sayfaya yönlendir
    if (currentMode === 'music') {
      router.push('/(tabs)/music');
    } else {
      router.push('/(tabs)/astrology');
    }
  };

  const renderFeature = (feature: any) => (
    <View key={feature.id} style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: `${themeColors.accent}20` }]}>
        <Ionicons name={feature.icon as any} size={24} color={themeColors.accent} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient colors={themeColors.gradient} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Premium Status */}
        {isPremium ? (
          <Animated.View style={[styles.statusCard, styles.premiumCard, animatedPulseStyle]}>
            <View style={styles.statusHeader}>
              <Ionicons name="diamond" size={32} color="#FFD700" />
              <Text style={styles.premiumStatusTitle}>Premium Aktif!</Text>
            </View>
            <Text style={styles.premiumStatusSubtitle}>
              Premium özelliklerinin keyfini çıkarın!
            </Text>
            
            {/* Shimmer effect */}
            <View style={styles.shimmerContainer}>
              <Animated.View style={[styles.shimmer, animatedShimmerStyle]} />
            </View>
          </Animated.View>
        ) : (
          <View style={[styles.statusCard, styles.freeCard]}>
            <Ionicons name="person-outline" size={32} color="rgba(255,255,255,0.7)" />
            <Text style={styles.freeStatusTitle}>Ücretsiz Üyelik</Text>
            <Text style={styles.freeStatusSubtitle}>
              Premium'a geçerek tüm özelliklerin keyfini çıkar!
            </Text>
          </View>
        )}

        {/* Premium Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Özellikler</Text>
          
          {premiumFeatures.map(renderFeature)}
        </View>

        {/* Action Section */}
        {!isPremium ? (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Plan Seç</Text>
            
            {/* Plan Selection */}
            <View style={styles.planContainer}>
              <TouchableOpacity
                style={[styles.singlePlanCard, styles.selectedPlan]}
                onPress={handlePurchase}
                disabled={isProcessing}
              >
                <View style={styles.planHeader}>
                  <Ionicons name="diamond" size={24} color="#FFD700" />
                  <Text style={[styles.planTitle, styles.selectedPlanText]}>
                    Premium Plan
                  </Text>
                </View>
                <Text style={[styles.planPrice, styles.selectedPlanText]}>
                  ₺149.99/ay
                </Text>
                <Text style={styles.planDescription}>
                  Tüm premium özellikler dahil
                </Text>
              </TouchableOpacity>
            </View>

            {/* Purchase Button */}
            <TouchableOpacity
              style={[styles.purchaseButton, { backgroundColor: themeColors.accent }]}
              onPress={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="diamond" size={20} color="white" />
                  <Text style={styles.purchaseButtonText}>
                    Premium'a Geç - ₺149.99
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  <Text style={styles.cancelButtonText}>Premium'u İptal Et</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Güvenlik ve Garanti Bilgileri */}
        <View style={styles.securitySection}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>Güvenli ödeme sistemi</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="refresh" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>İstediğin zaman iptal et</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="time" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>7 gün para iade garantisi</Text>
          </View>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  statusCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  premiumCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
    position: 'relative',
    overflow: 'hidden',
  },
  freeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumStatusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 12,
  },
  premiumStatusSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  freeStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  freeStatusSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 20,
  },
  shimmer: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionSection: {
    marginBottom: 24,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  planContainer: {
    marginBottom: 24,
  },
  singlePlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  selectedPlan: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  selectedPlanText: {
    color: '#FFD700',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  securitySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
  },
}); 