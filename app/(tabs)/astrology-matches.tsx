import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MatchScreen from '../components/match/MatchScreen';
import SwipeCard from '../components/swipe/SwipeCard';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Match, PotentialMatch, swipeApi } from '../services/api';
import { calculateCompatibility, getCompatibilityDescription } from '../types/compatibility';

const { width, height } = Dimensions.get('window');

export default function AstrologyMatchesScreen() {
  const { isPremium } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'swipe' | 'matches'>('swipe');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Swipe işlemi
  const handleSwipe = async (direction: 'left' | 'right' | 'up', userId: number) => {
    console.log(`Swiped ${direction} on user ${userId}`);
    
    try {
      setIsLoading(true);
      
      // API'ye swipe gönder
      const swipeAction: 'LIKE' | 'SUPER_LIKE' | 'DISLIKE' = direction === 'right' ? 'LIKE' : direction === 'up' ? 'SUPER_LIKE' : 'DISLIKE';
      
      const swipeRequest = {
        targetUserId: userId,
        action: swipeAction
      };

      // Gerçek API çağrısı
      const response = await swipeApi.swipe(swipeRequest);

      if (response.isMatch && response.matchId) {
        // Match oluştu!
        const matchedUser = potentialMatches.find(u => u.id === userId);
        if (matchedUser) {
          const newMatch: Match = {
            id: response.matchId,
            matchedUser: {
              id: matchedUser.id,
              username: matchedUser.username,
              firstName: matchedUser.firstName,
              lastName: matchedUser.lastName,
              age: matchedUser.age,
              profileImageUrl: matchedUser.profileImageUrl,
              zodiacSign: matchedUser.zodiacSign
            },
            compatibilityScore: matchedUser.compatibilityScore,
            compatibilityDescription: matchedUser.compatibilityDescription,
            matchType: 'ZODIAC',
            matchedAt: new Date().toISOString()
          };
          
          setCurrentMatch(newMatch);
          setShowMatchModal(true);
        }
      }

      // Sonraki karta geç
      setCurrentCardIndex(prev => prev + 1);
      
      // Kartlar biterse yenilerini yükle
      if (currentCardIndex >= potentialMatches.length - 2) {
        await loadMoreMatches();
      }
      
    } catch (error) {
      console.error('Swipe error:', error);
      Alert.alert('Hata', 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Daha fazla match yükle
  const loadMoreMatches = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Gerçek API çağrısı
      const response = await swipeApi.getPotentialMatches(currentPage, 10);
      
      if (response.users && response.users.length > 0) {
        // Uyumluluk skorlarını hesapla
        const newMatches = response.users.map(user => ({
          ...user,
          compatibilityScore: calculateCompatibility(
            userProfile.zodiacSign as any, 
            user.zodiacSign as any
          ),
          compatibilityDescription: getCompatibilityDescription(
            userProfile.zodiacSign as any,
            user.zodiacSign as any,
            calculateCompatibility(userProfile.zodiacSign as any, user.zodiacSign as any)
          )
        }));
        
        setPotentialMatches(prev => [...prev, ...newMatches]);
        setCurrentPage(prev => prev + 1);
        setHasMore(response.hasMore);
      } else {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error('Load more matches error:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadMoreMatches();
  }, []);

  const renderSwipeCards = () => {
    if (isInitialLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
        </View>
      );
    }

    const cardsToShow = potentialMatches.slice(currentCardIndex, currentCardIndex + 3);
    
    return (
      <View style={styles.cardsContainer}>
        {cardsToShow.length === 0 ? (
          <View style={styles.noMoreCards}>
            <Ionicons name="heart-outline" size={80} color="rgba(255,255,255,0.5)" />
            <Text style={styles.noMoreCardsText}>
              {hasMore ? 'Yeni kullanıcılar yükleniyor...' : 'Şimdilik bu kadar! Yakında yeni profiller ekleyeceğiz.'}
            </Text>
            {hasMore && (
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={loadMoreMatches}
                disabled={isLoading}
              >
                <Text style={styles.refreshButtonText}>
                  {isLoading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          cardsToShow.map((user, index) => (
            <SwipeCard
              key={user.id}
              user={user}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))
        )}
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.dislikeButton]}
        onPress={() => {
          if (potentialMatches[currentCardIndex]) {
            handleSwipe('left', potentialMatches[currentCardIndex].id);
          }
        }}
        disabled={isLoading || potentialMatches.length === 0}
      >
        <Ionicons name="close" size={32} color="#FF5722" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.superLikeButton]}
        onPress={() => {
          if (potentialMatches[currentCardIndex]) {
            handleSwipe('up', potentialMatches[currentCardIndex].id);
          }
        }}
        disabled={isLoading || potentialMatches.length === 0}
      >
        <Ionicons name="star" size={28} color="#2196F3" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.likeButton]}
        onPress={() => {
          if (potentialMatches[currentCardIndex]) {
            handleSwipe('right', potentialMatches[currentCardIndex].id);
          }
        }}
        disabled={isLoading || potentialMatches.length === 0}
      >
        <Ionicons name="heart" size={32} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Burç Eşleşmeleri</Text>
          <Text style={styles.subtitle}>
            Yıldızların rehberliğinde aşkı keşfet
          </Text>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'swipe' && styles.activeTab]}
            onPress={() => setActiveTab('swipe')}
          >
            <Ionicons 
              name="heart" 
              size={20} 
              color={activeTab === 'swipe' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'} 
            />
            <Text style={[styles.tabText, activeTab === 'swipe' && styles.activeTabText]}>
              Keşfet
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
            onPress={() => setActiveTab('matches')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'matches' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'} 
            />
            <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
              Eşleşmeler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'swipe' ? (
            <>
              {renderSwipeCards()}
              {!isInitialLoading && renderActionButtons()}
            </>
          ) : (
            <View style={styles.matchesContainer}>
              <Text style={styles.comingSoonText}>
                Eşleşmeler yakında gelecek!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && !isInitialLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Match Modal */}
      <Modal
        visible={showMatchModal}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setShowMatchModal(false)}
      >
        {currentMatch && (
          <MatchScreen
            match={currentMatch}
            currentUser={{
              firstName: userProfile.firstName || 'Sen',
              lastName: userProfile.lastName || '',
              profileImageUrl: userProfile.profileImage,
              zodiacSign: userProfile.zodiacSign || 'ARIES'
            }}
            onClose={() => setShowMatchModal(false)}
            onSendMessage={() => {
              setShowMatchModal(false);
              // Mesajlaşma ekranına yönlendir
            }}
          />
        )}
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 6,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.6,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: height * 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.4,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    textAlign: 'center',
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    minHeight: height * 0.3,
  },
  noMoreCardsText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dislikeButton: {
    backgroundColor: '#FFEBEE',
  },
  superLikeButton: {
    backgroundColor: '#E3F2FD',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#E8F5E8',
  },
  matchesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.4,
  },
  comingSoonText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 