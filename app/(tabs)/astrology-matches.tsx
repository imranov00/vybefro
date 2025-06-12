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
import { Match, PotentialMatch, SwipeResponse } from '../services/api';
import { calculateCompatibility, getCompatibilityDescription } from '../types/compatibility';

const { width, height } = Dimensions.get('window');

// Mock data for development
const MOCK_POTENTIAL_MATCHES: PotentialMatch[] = [
  {
    id: 1,
    username: 'ayse_23',
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    age: 25,
    profileImageUrl: 'https://picsum.photos/400/600?random=1',
    photos: ['https://picsum.photos/400/600?random=1', 'https://picsum.photos/400/600?random=2'],
    bio: 'Doğa sevgisi, kitap okumak ve yeni yerler keşfetmek hayatımın vazgeçilmezleri.',
    zodiacSign: 'LEO',
    compatibilityScore: 88,
    compatibilityDescription: 'Ateş elementinden olan burçlar olarak harika bir enerji yaratıyorsunuz!',
    distance: 5,
    isOnline: true
  },
  {
    id: 2,
    username: 'mehmet_34',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    age: 28,
    profileImageUrl: 'https://picsum.photos/400/600?random=3',
    photos: ['https://picsum.photos/400/600?random=3'],
    bio: 'Müzik tutkunu, gitar çalan ve hayatı dolu dolu yaşamaya çalışan biriyim.',
    zodiacSign: 'SAGITTARIUS',
    compatibilityScore: 92,
    compatibilityDescription: 'Aynı element grubundan olarak birbirinizi çok iyi anlayabilirsiniz.',
    distance: 12,
    isOnline: false
  },
  {
    id: 3,
    username: 'zeynep_91',
    firstName: 'Zeynep',
    lastName: 'Demir',
    age: 24,
    profileImageUrl: 'https://picsum.photos/400/600?random=4',
    photos: ['https://picsum.photos/400/600?random=4', 'https://picsum.photos/400/600?random=5'],
    bio: 'Sanat ve tasarım dünyasında kaybolmayı seven yaratıcı bir ruh.',
    zodiacSign: 'GEMINI',
    compatibilityScore: 75,
    compatibilityDescription: 'Farklı elementlerden gelsek de tamamlayıcı özellikleriniz var.',
    distance: 8,
    isOnline: true
  }
];

export default function AstrologyMatchesScreen() {
  const { isPremium } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>(MOCK_POTENTIAL_MATCHES);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'swipe' | 'matches'>('swipe');

  // Swipe işlemi
  const handleSwipe = async (direction: 'left' | 'right' | 'up', userId: number) => {
    console.log(`Swiped ${direction} on user ${userId}`);
    
    try {
      setIsLoading(true);
      
      // API'ye swipe gönder
      const swipeAction = direction === 'right' ? 'LIKE' : direction === 'up' ? 'SUPER_LIKE' : 'DISLIKE';
      
      // Mock API response
      const mockResponse: SwipeResponse = {
        success: true,
        isMatch: direction !== 'left' && Math.random() > 0.7, // %30 match şansı
        matchId: direction !== 'left' && Math.random() > 0.7 ? Math.floor(Math.random() * 1000) : undefined,
        message: direction !== 'left' && Math.random() > 0.7 ? 'Eşleşme gerçekleşti!' : 'Swipe başarılı'
      };

      if (mockResponse.isMatch && mockResponse.matchId) {
        // Match oluştu!
        const matchedUser = potentialMatches.find(u => u.id === userId);
        if (matchedUser) {
          const newMatch: Match = {
            id: mockResponse.matchId,
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
    try {
      // Gerçek API kullanımı için:
      // const response = await swipeApi.getPotentialMatches(1, 10);
      // const newMatches = response.users.map(user => ({
      //   ...user,
      //   compatibilityScore: calculateCompatibility(
      //     userProfile.zodiacSign as any, 
      //     user.zodiacSign as any
      //   ),
      //   compatibilityDescription: getCompatibilityDescription(
      //     userProfile.zodiacSign as any,
      //     user.zodiacSign as any,
      //     calculateCompatibility(userProfile.zodiacSign as any, user.zodiacSign as any)
      //   )
      // }));
      
      // Mock data - gerçek uygulamada API'den gelecek
      const mockZodiacSigns = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
      const randomZodiac = mockZodiacSigns[Math.floor(Math.random() * mockZodiacSigns.length)];
      const userZodiac = userProfile.zodiacSign || 'ARIES';
      const compatibility = calculateCompatibility(userZodiac as any, randomZodiac as any);
      
      const newMatches: PotentialMatch[] = [
        {
          id: potentialMatches.length + 1,
          username: `user_${potentialMatches.length + 1}`,
          firstName: ['Ayşe', 'Fatma', 'Zeynep', 'Mehmet', 'Ali', 'Ahmet'][Math.floor(Math.random() * 6)],
          lastName: ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Özkan'][Math.floor(Math.random() * 6)],
          age: Math.floor(Math.random() * 15) + 20, // 20-35 yaş arası
          profileImageUrl: `https://picsum.photos/400/600?random=${potentialMatches.length + 10}`,
          photos: [`https://picsum.photos/400/600?random=${potentialMatches.length + 10}`],
          bio: [
            'Hayatı dolu dolu yaşamayı seven biriyim.',
            'Doğa sevgisi ve kitap okuma tutkum var.',
            'Müzik ve sanat dünyasında kaybolmayı seviyorum.',
            'Yeni yerler keşfetmek ve macera aramak benim işim.',
            'Spor yapmayı ve sağlıklı yaşamayı seviyorum.'
          ][Math.floor(Math.random() * 5)],
          zodiacSign: randomZodiac,
          compatibilityScore: compatibility,
          compatibilityDescription: getCompatibilityDescription(
            userZodiac as any,
            randomZodiac as any,
            compatibility
          ),
          distance: Math.floor(Math.random() * 20) + 1,
          isOnline: Math.random() > 0.5
        }
      ];
      
      setPotentialMatches(prev => [...prev, ...newMatches]);
    } catch (error) {
      console.error('Load more matches error:', error);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadMoreMatches();
  }, []);

  const renderSwipeCards = () => {
    const cardsToShow = potentialMatches.slice(currentCardIndex, currentCardIndex + 3);
    
    return (
      <View style={styles.cardsContainer}>
        {cardsToShow.length === 0 ? (
          <View style={styles.noMoreCards}>
            <Ionicons name="heart-outline" size={80} color="rgba(255,255,255,0.5)" />
            <Text style={styles.noMoreCardsText}>
              Şimdilik bu kadar! Yakında yeni profiller ekleyeceğiz.
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadMoreMatches}
            >
              <Text style={styles.refreshButtonText}>Yenile</Text>
            </TouchableOpacity>
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
            {renderActionButtons()}
          </>
        ) : (
          <View style={styles.matchesContainer}>
            <Text style={styles.comingSoonText}>
              Eşleşmeler yakında gelecek!
            </Text>
          </View>
        )}
      </View>

      {/* Loading Overlay */}
      {isLoading && (
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
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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