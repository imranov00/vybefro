import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useBlock } from '../hooks/useBlock';
import { useUnmatch } from '../hooks/useUnmatch';
import { Match, MatchRelationship, matchApi, relationshipApi } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cooldown süresini hesapla
const calculateCooldownRemaining = (cooldownUntil: string | null): { days: number; hours: number; canRematch: boolean } => {
  if (!cooldownUntil) return { days: 0, hours: 0, canRematch: true };
  
  const cooldownDate = new Date(cooldownUntil);
  const now = new Date();
  const diffMs = cooldownDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return { days: 0, hours: 0, canRematch: true };
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { days, hours, canRematch: false };
};

export default function MatchProfileScreen() {
  const { currentMode } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const router = useRouter();
  const { matchId } = useLocalSearchParams();
  const { blockUser: performBlockUser, loading: blockLoading, error: blockError } = useBlock();
  const { unmatchUser: performUnmatchUser, loading: unmatchLoading } = useUnmatch();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [relationship, setRelationship] = useState<MatchRelationship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Tema
  const theme = {
    astrology: {
      primary: '#8000FF',
      secondary: '#5B00B5',
      gradient: ['#8000FF', '#5B00B5', '#3D007A'] as const,
    },
    music: {
      primary: '#1DB954',
      secondary: '#1ED760',
      gradient: ['#1DB954', '#1ED760', '#1AA34A'] as const,
    }
  };
  const currentTheme = theme[currentMode];

  // Match ID'yi number'a çevir
  const matchIdNum = parseInt(matchId as string, 10);

  // Veri yükle
  useEffect(() => {
    const loadData = async () => {
      if (isNaN(matchIdNum)) return;
      
      showLoading('Profil yükleniyor...');
      try {
        const [matchData, relationshipData] = await Promise.all([
          matchApi.getMatchDetail(matchIdNum),
          relationshipApi.getRelationship(matchIdNum)
        ]);
        
        setMatch(matchData);
        setRelationship(relationshipData);
        hideLoading();
      } catch (error: any) {
        hideLoading();
        console.error('❌ [MATCH PROFILE] Veri yüklenemedi:', error);
        
        if (error.message?.includes('mevcut değil')) {
          Alert.alert(
            'Eşleşme Bulunamadı',
            'Bu eşleşme artık mevcut değil.',
            [{ text: 'Tamam', onPress: () => router.back() }]
          );
        } else {
          Alert.alert('Hata', 'Profil yüklenemedi');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [matchIdNum]);

  // Block işlemi
  const handleBlock = async () => {
    if (!match) return;
    
    try {
      console.log('🔄 [MATCH PROFILE] Block işlemi başlatılıyor...');
      
      await performBlockUser(match.matchedUser.id, 'PROFILE');
      setShowBlockModal(false);
      
      console.log('✅ [MATCH PROFILE] Block başarılı');
      console.log('ℹ️ [MATCH PROFILE] Backend chat room\'u kapattı (closedReason=BLOCK)');
      
      Alert.alert(
        'Başarılı',
        'Kullanıcı engellendi',
        [{ text: 'Tamam', onPress: () => router.navigate('/(tabs)/chat' as any) }]
      );
    } catch (error: any) {
      console.error('❌ [MATCH PROFILE] Block hatası:', error);
      Alert.alert('Hata', blockError || 'Engelleme işlemi başarısız oldu');
    }
  };

  // Unmatch işlemi
  const handleUnmatch = async () => {
    if (!match) return;
    
    try {
      console.log('🔄 [MATCH PROFILE] Unmatch işlemi başlatılıyor...');
      
      await performUnmatchUser(matchIdNum);
      setShowUnmatchModal(false);
      
      console.log('✅ [MATCH PROFILE] Unmatch başarılı');
      console.log('ℹ️ [MATCH PROFILE] Backend chat room\'u kapattı (closedReason=UNMATCH)');
      
      Alert.alert(
        'Başarılı',
        'Eşleşme kaldırıldı. 7 gün sonra tekrar karşınıza çıkabilir.',
        [{ text: 'Tamam', onPress: () => router.navigate('/(tabs)/chat' as any) }]
      );
    } catch (error: any) {
      console.error('❌ [MATCH PROFILE] Unmatch hatası:', error);
      Alert.alert('Hata', 'Eşleşme kaldırma işlemi başarısız oldu');
    }
  };

  // Report işlemi
  const handleReport = async (reason: string) => {
    if (!match) return;
    
    setIsActionLoading(true);
    try {
      await relationshipApi.reportUser(match.matchedUser.id, reason);
      setShowReportModal(false);
      Alert.alert('Başarılı', 'Şikayetiniz alındı.');
    } catch (error: any) {
      console.error('❌ [MATCH PROFILE] Report hatası:', error);
      Alert.alert('Hata', 'Şikayet gönderilemedi');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Mesaj gönder
  const handleSendMessage = () => {
    if (!match) return;
    
    // Chat ekranına yönlendir (chatRoomId varsa, yoksa matchId ile)
    if (match.chatRoomId) {
      router.push(`/chat/${match.chatRoomId}` as any);
    } else {
      Alert.alert('Bilgi', 'Sohbet odası bulunamadı');
    }
  };

  // Burç emojisi
  const getZodiacEmoji = (zodiacSign?: string) => {
    if (!zodiacSign) return '⭐';
    const zodiacEmojis: { [key: string]: string } = {
      'ARIES': '♈', 'TAURUS': '♉', 'GEMINI': '♊', 'CANCER': '♋',
      'LEO': '♌', 'VIRGO': '♍', 'LIBRA': '♎', 'SCORPIO': '♏',
      'SAGITTARIUS': '♐', 'CAPRICORN': '♑', 'AQUARIUS': '♒', 'PISCES': '♓'
    };
    return zodiacEmojis[zodiacSign.toUpperCase()] || '⭐';
  };

  // Loading state - sadece boş loading ekranı göster
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={currentTheme.gradient} style={styles.background} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        {/* Loading gösterilir otomatik olarak LoadingOverlay tarafından */}
      </View>
    );
  }

  // Error state
  if (!match) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Profil bulunamadı</Text>
        <TouchableOpacity style={styles.backButtonAlt} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // BLOCKED STATE - Tam ekran engelli durumu göster
  if (relationship?.isBlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.blockedHeader}>
          <TouchableOpacity style={styles.blockedBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.blockedHeaderTitle}>Profil</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {/* Blocked içerik */}
        <View style={styles.blockedFullContainer}>
          <View style={styles.blockedIconContainer}>
            <Ionicons name="ban" size={80} color="#FF6B6B" />
          </View>
          <Text style={styles.blockedFullTitle}>Bu kullanıcıyla etkileşim mümkün değil</Text>
          <Text style={styles.blockedFullMessage}>
            {relationship.blockedByMe 
              ? 'Bu kullanıcıyı engellediniz. Engeli kaldırmak için Ayarlar > Engellenen Kullanıcılar bölümüne gidin.'
              : 'Bu kullanıcı ile iletişim kurulamıyor.'}
          </Text>
          
          {relationship.blockedByMe && (
            <TouchableOpacity 
              style={styles.blockedSettingsButton}
              onPress={() => router.push('/(profile)/blockedUsersScreen' as any)}
            >
              <Ionicons name="settings-outline" size={20} color="#8000FF" />
              <Text style={styles.blockedSettingsButtonText}>Engellenen Kullanıcılar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.blockedBackButtonAlt}
            onPress={() => router.back()}
          >
            <Text style={styles.blockedBackButtonAltText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const user = match.matchedUser;
  const photos: string[] = user.photos || (user.profileImageUrl ? [user.profileImageUrl] : []);
  
  // Profil read-only mı? (Unmatched durumunda)
  const isReadOnly = relationship?.isUnmatched === true;

  // Action buttons - Truth table'a göre
  const renderActionButtons = () => {
    // BLOCKED durumu - hiçbir aksiyon gösterilmez
    if (relationship?.isBlocked) {
      return (
        <View style={styles.blockedContainer}>
          <Ionicons name="ban" size={32} color="#FF6B6B" />
          <Text style={styles.blockedText}>Bu kullanıcı engellenmiş</Text>
        </View>
      );
    }

    // UNMATCHED durumu
    if (relationship?.isUnmatched) {
      if (!cooldownInfo.canRematch) {
        // Cooldown devam ediyor
        return (
          <View style={styles.cooldownContainer}>
            <Ionicons name="time" size={32} color="#FF9500" />
            <Text style={styles.cooldownTitle}>Tekrar Eşleşme</Text>
            <Text style={styles.cooldownText}>
              {cooldownInfo.days > 0 
                ? `${cooldownInfo.days} gün ${cooldownInfo.hours} saat sonra`
                : `${cooldownInfo.hours} saat sonra`}
            </Text>
          </View>
        );
      } else if (relationship?.canRematch) {
        // Rematch yapılabilir (backend feed'de gösterecek)
        return (
          <View style={styles.rematchContainer}>
            <Ionicons name="refresh" size={32} color={currentTheme.primary} />
            <Text style={styles.rematchText}>
              Bu kişi swipe feed'inde tekrar görünebilir
            </Text>
          </View>
        );
      }
    }

    // ACTIVE durumu
    return (
      <View style={styles.actionButtonsContainer}>
        {/* Mesaj Gönder */}
        {relationship?.canChat && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
            onPress={handleSendMessage}
          >
            <Ionicons name="chatbubble" size={24} color="white" />
            <Text style={styles.actionButtonText}>Mesaj Gönder</Text>
          </TouchableOpacity>
        )}
        
        {/* Eşleşmeyi Kaldır */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonWarning]}
          onPress={() => setShowUnmatchModal(true)}
        >
          <Ionicons name="heart-dislike" size={24} color="#FF9500" />
          <Text style={[styles.actionButtonText, { color: '#FF9500' }]}>Eşleşmeyi Kaldır</Text>
        </TouchableOpacity>
        
        {/* Engelle */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={() => setShowBlockModal(true)}
        >
          <Ionicons name="ban" size={24} color="#FF3B30" />
          <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Engelle</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Fotoğraf Galerisi */}
        <View style={styles.photoContainer}>
          {photos.length > 0 ? (
            <>
              <Image 
                source={{ uri: photos[currentPhotoIndex] }}
                style={styles.mainPhoto}
                resizeMode="cover"
              />
              
              {/* Gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.photoGradient}
              />
              
              {/* Fotoğraf sayacı */}
              {photos.length > 1 && (
                <View style={styles.photoIndicators}>
                  {photos.map((_photo: string, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.photoIndicator,
                        index === currentPhotoIndex && styles.photoIndicatorActive
                      ]}
                    />
                  ))}
                </View>
              )}
              
              {/* Fotoğraf navigasyonu */}
              {photos.length > 1 && (
                <View style={styles.photoNavigation}>
                  <TouchableOpacity
                    style={styles.photoNavButton}
                    onPress={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                    disabled={currentPhotoIndex === 0}
                  >
                    <Ionicons name="chevron-back" size={32} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoNavButton}
                    onPress={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
                    disabled={currentPhotoIndex === photos.length - 1}
                  >
                    <Ionicons name="chevron-forward" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.noPhotoContainer, { backgroundColor: currentTheme.secondary }]}>
              <Text style={styles.noPhotoText}>{user.firstName?.charAt(0) || '?'}</Text>
            </View>
          )}
          
          {/* Geri butonu */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Report butonu */}
          <TouchableOpacity style={styles.reportButton} onPress={() => setShowReportModal(true)}>
            <Ionicons name="flag" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Kullanıcı Bilgileri */}
        <View style={styles.userInfoContainer}>
          {/* İsim ve Yaş */}
          <View style={styles.nameRow}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            {user.age && <Text style={styles.userAge}>, {user.age}</Text>}
            {user.isPremium && <Text style={styles.premiumBadge}>👑</Text>}
          </View>
          
          {/* Burç bilgisi (astrology mode) */}
          {match.matchType === 'ZODIAC' && user.zodiacSign && (
            <View style={styles.zodiacContainer}>
              <Text style={styles.zodiacEmoji}>{getZodiacEmoji(user.zodiacSign)}</Text>
              <Text style={styles.zodiacText}>{user.zodiacSignTurkish || user.zodiacSign}</Text>
              {match.compatibilityScore && (
                <View style={styles.compatibilityBadge}>
                  <Text style={styles.compatibilityText}>%{match.compatibilityScore} Uyum</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Müzik bilgisi (music mode) */}
          {match.matchType === 'MUSIC' && (
            <View style={styles.musicContainer}>
              <Text style={styles.musicEmoji}>🎵</Text>
              <Text style={styles.musicText}>Müzik Eşleşmesi</Text>
              {match.compatibilityScore && (
                <View style={[styles.compatibilityBadge, { backgroundColor: '#1DB954' }]}>
                  <Text style={styles.compatibilityText}>%{match.compatibilityScore} Uyum</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Bio */}
          {user.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>Hakkında</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}
          
          {/* Match tarihi */}
          <View style={styles.matchDateContainer}>
            <Ionicons name="heart" size={16} color={currentTheme.primary} />
            <Text style={styles.matchDateText}>
              {match.matchedAt ? `Eşleşme: ${new Date(match.matchedAt).toLocaleDateString('tr-TR')}` : 'Eşleşme tarihi'}
            </Text>
          </View>
          
          {/* Durum bilgisi */}
          {relationship && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{relationship.statusText}</Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {renderActionButtons()}
        </View>
        
        {/* Alt boşluk */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Block Modal */}
      <Modal visible={showBlockModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="ban" size={48} color="#FF3B30" />
            </View>
            <Text style={styles.modalTitle}>Kullanıcıyı Engelle</Text>
            <Text style={styles.modalMessage}>
              Bu kullanıcıyı engellerseniz mesajlaşamazsınız ve bir daha karşınıza çıkmaz.{'\n\n'}
              Engeli Ayarlar'dan kaldırabilirsiniz.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowBlockModal(false)}
                disabled={blockLoading}
              >
                <Text style={styles.modalButtonCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonDestructive]}
                onPress={handleBlock}
                disabled={blockLoading}
              >
                <Text style={styles.modalButtonDestructiveText}>
                  {blockLoading ? 'Engelleniyor...' : 'Engelle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unmatch Modal */}
      <Modal visible={showUnmatchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="heart-dislike" size={48} color="#FF9500" />
            </View>
            <Text style={styles.modalTitle}>Eşleşmeyi Kaldır</Text>
            <Text style={styles.modalMessage}>
              Bu eşleşme kaldırılacak.{'\n\n'}
              7 gün sonra tekrar karşınıza çıkabilir.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowUnmatchModal(false)}
                disabled={unmatchLoading}
              >
                <Text style={styles.modalButtonCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonWarning]}
                onPress={handleUnmatch}
                disabled={unmatchLoading}
              >
                <Text style={styles.modalButtonWarningText}>
                  {unmatchLoading ? 'Kaldırılıyor...' : 'Kaldır'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={showReportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="flag" size={48} color="#FF9500" />
            </View>
            <Text style={styles.modalTitle}>Kullanıcıyı Şikayet Et</Text>
            <Text style={styles.modalMessage}>Şikayet nedenini seçin:</Text>
            
            {['INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'FAKE_PROFILE'].map((reason) => (
              <TouchableOpacity 
                key={reason}
                style={styles.reportOption}
                onPress={() => handleReport(reason)}
                disabled={isActionLoading}
              >
                <Text style={styles.reportOptionText}>
                  {reason === 'INAPPROPRIATE_CONTENT' ? 'Uygunsuz İçerik' :
                   reason === 'HARASSMENT' ? 'Taciz' :
                   reason === 'SPAM' ? 'Spam' : 'Sahte Profil'}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel, { marginTop: 16 }]}
              onPress={() => setShowReportModal(false)}
              disabled={isActionLoading}
            >
              <Text style={styles.modalButtonCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
  },
  scrollView: {
    flex: 1,
  },
  
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
  },
  backButtonAlt: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8000FF',
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Photo section
  photoContainer: {
    height: SCREEN_HEIGHT * 0.55,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  photoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  noPhotoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: 80,
    color: 'white',
    fontWeight: 'bold',
  },
  photoIndicators: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: 'white',
  },
  photoNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  photoNavButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // User info section
  userInfoContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  userAge: {
    fontSize: 24,
    color: '#666',
  },
  premiumBadge: {
    fontSize: 24,
    marginLeft: 8,
  },
  zodiacContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  zodiacEmoji: {
    fontSize: 24,
  },
  zodiacText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  musicEmoji: {
    fontSize: 24,
  },
  musicText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  compatibilityBadge: {
    backgroundColor: '#8000FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  compatibilityText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  bioContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F8FF',
    borderRadius: 12,
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  matchDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  matchDateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statusContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F0FF',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#8000FF',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Actions section
  actionsSection: {
    padding: 20,
    backgroundColor: 'white',
  },
  actionButtonsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#8000FF',
  },
  actionButtonWarning: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  actionButtonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  
  // Special states
  blockedContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
  },
  blockedText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  cooldownContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
  },
  cooldownTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#FF9500',
  },
  cooldownText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  rematchContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F0F0FF',
    borderRadius: 12,
  },
  rematchText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonDestructive: {
    backgroundColor: '#FF3B30',
  },
  modalButtonDestructiveText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalButtonWarning: {
    backgroundColor: '#FF9500',
  },
  modalButtonWarningText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  reportOption: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
  },
  reportOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  
  // Full screen blocked state
  blockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  blockedBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  blockedFullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FAFAFA',
  },
  blockedIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  blockedFullTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  blockedFullMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  blockedSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#F0E8FF',
    borderRadius: 12,
    marginBottom: 16,
  },
  blockedSettingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8000FF',
    marginLeft: 8,
  },
  blockedBackButtonAlt: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  blockedBackButtonAltText: {
    fontSize: 16,
    color: '#999',
  },
});
