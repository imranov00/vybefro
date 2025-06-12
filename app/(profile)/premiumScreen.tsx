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
import { premiumApi, PremiumFeature, PremiumStatus } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const { currentMode } = useAuth();
  const router = useRouter();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
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
    
    loadPremiumStatus();
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

  const loadPremiumStatus = async () => {
    try {
      setIsLoading(true);
      const status = await premiumApi.getFeatures();
      setPremiumStatus(status);
    } catch (error: any) {
      console.error('Premium durum yüklenemedi:', error);
      Alert.alert('Hata', 'Premium bilgileri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      const response = await premiumApi.purchase({
        plan: selectedPlan,
        paymentMethod: 'card'
      });
      
      Alert.alert('Başarılı!', response.message, [
        {
          text: 'Tamam',
          onPress: () => {
            loadPremiumStatus(); // Durumu güncelle
          }
        }
      ]);
    } catch (error: any) {
      console.error('Premium satın alma hatası:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Satın alma işlemi başarısız');
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
              const response = await premiumApi.cancel();
              
              Alert.alert('İptal Edildi', response.message, [
                {
                  text: 'Tamam',
                  onPress: () => {
                    loadPremiumStatus(); // Durumu güncelle
                  }
                }
              ]);
            } catch (error: any) {
              console.error('Premium iptal hatası:', error);
              Alert.alert('Hata', error.response?.data?.message || 'İptal işlemi başarısız');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderFeature = (feature: PremiumFeature) => (
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={themeColors.gradient} style={styles.background} />
        <ActivityIndicator size="large" color={themeColors.accent} />
        <Text style={styles.loadingText}>Premium bilgileri yükleniyor...</Text>
      </View>
    );
  }

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
        {premiumStatus?.isPremium ? (
          <Animated.View style={[styles.statusCard, styles.premiumCard, animatedPulseStyle]}>
            <View style={styles.statusHeader}>
              <Ionicons name="diamond" size={32} color="#FFD700" />
              <Text style={styles.premiumStatusTitle}>Premium Aktif!</Text>
            </View>
            <Text style={styles.premiumStatusSubtitle}>
              {premiumStatus.premiumUntil ? 
                `Geçerlilik: ${new Date(premiumStatus.premiumUntil).toLocaleDateString('tr-TR')}` :
                'Süresiz Premium Üyelik'
              }
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
          
          {premiumStatus?.features.map(renderFeature)}
        </View>

        {/* Action Section */}
        {!premiumStatus?.isPremium ? (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Plan Seç</Text>
            
            {/* Plan Selection */}
            <View style={styles.planContainer}>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={[styles.planTitle, selectedPlan === 'monthly' && styles.selectedPlanText]}>
                  Aylık
                </Text>
                <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.selectedPlanText]}>
                  ₺29.99/ay
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlan]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popüler</Text>
                </View>
                <Text style={[styles.planTitle, selectedPlan === 'yearly' && styles.selectedPlanText]}>
                  Yıllık
                </Text>
                <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.selectedPlanText]}>
                  ₺199.99/yıl
                </Text>
                <Text style={styles.planSavings}>%44 tasarruf!</Text>
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
                    Premium'a Geç - {selectedPlan === 'monthly' ? '₺29.99' : '₺199.99'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
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
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
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
  planSavings: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
}); 