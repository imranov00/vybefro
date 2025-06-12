import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { userApi, UserWhoLikedMe } from '../services/api';

const { width, height } = Dimensions.get('window');

// Örnek eşleşme verileri
const MATCHES_DATA = [
  {
    id: 1,
    name: 'Ayşe',
    age: 25,
    zodiacSign: '♌',
    zodiacName: 'Aslan',
    compatibility: 95,
    distance: '2 km',
    lastActive: '2 saat önce',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Aslan burcu, yaşamı dolu dolu yaşamayı seven biri...',
    isOnline: true
  },
  {
    id: 2,
    name: 'Zeynep',
    age: 28,
    zodiacSign: '♊',
    zodiacName: 'İkizler',
    compatibility: 88,
    distance: '5 km',
    lastActive: '1 gün önce',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'İkizler burcu, konuşmayı ve yeni şeyler öğrenmeyi seven...',
    isOnline: false
  },
  {
    id: 3,
    name: 'Melek',
    age: 26,
    zodiacSign: '♎',
    zodiacName: 'Terazi',
    compatibility: 92,
    distance: '1 km',
    lastActive: '30 dk önce',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Terazi burcu, hayatında denge arayan romantik bir ruh...',
    isOnline: true
  },
  {
    id: 4,
    name: 'Elif',
    age: 24,
    zodiacSign: '♓',
    zodiacName: 'Balık',
    compatibility: 89,
    distance: '3 km',
    lastActive: '5 saat önce',
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
    bio: 'Balık burcu, sanatı ve duygusal derinliği seven...',
    isOnline: false
  }
];

// Günlük öneriler
const DAILY_SUGGESTIONS = [
  {
    id: 1,
    title: 'Bugünün En Uyumlu Eşi',
    subtitle: 'Yıldızlar senin için en uygun eşi belirledi',
    user: MATCHES_DATA[0]
  },
  {
    id: 2,
    title: 'Yakınındaki Burcunla Uyumlu',
    subtitle: '1 km mesafede senin burcunla uyumlu',
    user: MATCHES_DATA[2]
  }
];

export default function AstrologyMatchesScreen() {
  const colorScheme = useColorScheme();
  const { isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'suggestions' | 'likes'>('matches');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [likes, setLikes] = useState<UserWhoLikedMe[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ scale: scaleAnim.value }]
    };
  });

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    scaleAnim.value = withSpring(0.95, {}, () => {
      scaleAnim.value = withSpring(1);
    });
  };

  const renderMatchCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.matchCard}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.zodiacIcon}>{item.zodiacSign}</Text>
          </View>
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.name}, {item.age}</Text>
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>%{item.compatibility}</Text>
            </View>
          </View>
          
          <Text style={styles.zodiacText}>{item.zodiacName} Burcu</Text>
          <Text style={styles.distanceText}>{item.distance} • {item.lastActive}</Text>
          <Text style={styles.bioText} numberOfLines={2}>{item.bio}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]}>
          <Ionicons name="close" size={20} color="#FF6B6B" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.chatBtn]}>
          <Ionicons name="chatbubble" size={20} color="#4ECDC4" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]}>
          <Ionicons name="heart" size={20} color="#FF9FF3" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.suggestionCard} activeOpacity={0.9}>
      <View style={styles.suggestionHeader}>
        <Ionicons name="star" size={24} color="#FECA57" />
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionTitle}>{item.title}</Text>
          <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.suggestionUser}>
        <View style={styles.smallImageContainer}>
          <Text style={styles.smallZodiacIcon}>{item.user.zodiacSign}</Text>
        </View>
        <Text style={styles.suggestionUserName}>
          {item.user.name}, {item.user.age} • {item.user.zodiacName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const fetchLikes = async () => {
    if (!isPremium) return;
    
    setLoading(true);
    try {
      const response = await userApi.getUsersWhoLikedMe(20);
      setLikes(response.users);
    } catch (error) {
      console.error('Likes fetching error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'likes') {
      fetchLikes();
    }
  }, [activeTab, isPremium]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#8000FF', '#5B00B5', '#3D007A']}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Burç Eşleşmelerim</Text>
        <Text style={styles.subtitle}>Yıldızların Belirlediği Özel Eşler</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'matches' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
          />
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Eşleşmeler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
          onPress={() => setActiveTab('suggestions')}
        >
          <Ionicons 
            name="star" 
            size={20} 
            color={activeTab === 'suggestions' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
          />
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
            Öneriler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Ionicons 
            name="heart" 
            size={20} 
            color={activeTab === 'likes' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
          />
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
            Beğeniler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        {activeTab === 'matches' && (
          <FlatList
            data={MATCHES_DATA}
            renderItem={renderMatchCard}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        
        {activeTab === 'suggestions' && (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {DAILY_SUGGESTIONS.map((suggestion) => (
              <View key={suggestion.id}>
                {renderSuggestionCard({ item: suggestion })}
              </View>
            ))}
          </ScrollView>
        )}
        
        {activeTab === 'likes' && (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Premium Banner */}
            {!isPremium && (
              <View style={styles.premiumBanner}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
                <View style={styles.premiumInfo}>
                  <Text style={styles.premiumTitle}>Premium Özellik</Text>
                  <Text style={styles.premiumSubtitle}>
                    Seni beğenenleri görmek için premium üyeliğe geç
                  </Text>
                </View>
                <TouchableOpacity style={styles.premiumButton}>
                  <Text style={styles.premiumButtonText}>Yükselt</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Beğeni Listesi */}
            <View style={styles.likesContainer}>
              <Text style={styles.sectionTitle}>
                {isPremium ? 'Seni Beğenenler' : 'Beğeni Alındı'}
              </Text>
              
              {loading ? (
                <ActivityIndicator size="large" color="#FF9FF3" />
              ) : (
                likes.map((like) => (
                  <View key={like.id} style={[styles.likeCard, !isPremium && styles.blurredCard]}>
                    <View style={styles.likeCardContent}>
                      <View style={styles.likeImageContainer}>
                        <Text style={styles.zodiacIcon}>{like.zodiacSign}</Text>
                      </View>
                      
                      <View style={styles.likeUserInfo}>
                        <Text style={[styles.likeUserName, !isPremium && styles.blurredText]}>
                          {isPremium ? `${like.firstName} ${like.lastName}, ${like.age}` : '••••••, ••'}
                        </Text>
                        <Text style={[styles.likeZodiacText, !isPremium && styles.blurredText]}>
                          {isPremium ? (like.zodiacSignTurkish || 'Burç yok') : '••••••'}
                        </Text>
                        <Text style={styles.likeTimeText}>
                          {new Date(like.likedAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                      
                      <View style={styles.likeCompatibility}>
                        <Text style={styles.likeCompatibilityText}>
                          %{like.compatibility}
                        </Text>
                      </View>
                    </View>
                    
                    {!isPremium && (
                      <View style={styles.blurOverlay}>
                        <Ionicons name="lock-closed" size={24} color="white" />
                      </View>
                    )}
                  </View>
                ))
              )}
              
              {!isPremium && (
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.viewMoreText}>
                    Daha fazla beğeni görmek için premium'a geç
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 6,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacIcon: {
    fontSize: 24,
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  zodiacText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  passBtn: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  chatBtn: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  likeBtn: {
    backgroundColor: 'rgba(255, 159, 243, 0.2)',
  },
  suggestionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  suggestionUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  smallZodiacIcon: {
    fontSize: 16,
    color: 'white',
  },
  suggestionUserName: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Premium ve Beğeni Stilleri
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  premiumButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  likesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  likeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  blurredCard: {
    opacity: 0.7,
  },
  likeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  likeUserInfo: {
    flex: 1,
  },
  likeUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  likeZodiacText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  likeTimeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  likeCompatibility: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likeCompatibilityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  blurredText: {
    fontFamily: 'monospace',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  viewMoreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
}); 