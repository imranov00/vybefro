import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import MatchScreen from '../components/match/MatchScreen';
import UserDetailPanel, { PanelState } from '../components/swipe/UserDetailPanel';
import ZodiacSwipeCard from '../components/swipe/ZodiacSwipeCard';
import { DiscoverUser, swipeApi } from '../services/api';

const ZodiacSwipeScreen = () => {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [panelState, setPanelState] = useState(PanelState.CLOSED);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverUser | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await swipeApi.getDiscoverUsers(1, 10);
        setUsers(data.users || []);
      } catch (e) {
        // Hata yönetimi
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const currentUser = users[currentIndex];

  // Swipe işlemi
  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentUser) return;
    try {
      const response = await swipeApi.swipe({
        toUserId: currentUser.id,
        action: direction === 'right' ? 'LIKE' : 'DISLIKE',
      });
      if (response.isMatch) {
        setMatchedUser(currentUser);
        setShowMatch(true);
      }
    } catch (e) {}
    setCurrentIndex((prev) => Math.min(prev + 1, users.length - 1));
    setPanelState(PanelState.CLOSED);
  };

  // Eşleşme ekranı kapatıldığında
  const handleCloseMatch = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#B57EDC" style={{ flex: 1 }} />
      ) : showMatch && matchedUser ? (
        <MatchScreen
          match={{
            id: matchedUser.id,
            matchedUser: {
              id: matchedUser.id,
              username: matchedUser.firstName.toLowerCase() + matchedUser.id,
              firstName: matchedUser.firstName,
              lastName: matchedUser.lastName,
              age: matchedUser.age,
              profileImageUrl: matchedUser.profileImageUrl,
              zodiacSign: matchedUser.zodiacSign,
            },
            compatibilityScore: matchedUser.compatibilityScore,
            compatibilityDescription: matchedUser.compatibilityDescription,
            matchType: 'ZODIAC',
            matchedAt: new Date().toISOString(),
          }}
          currentUser={{
            firstName: '',
            lastName: '',
            profileImageUrl: '',
            zodiacSign: '',
          }}
          onClose={handleCloseMatch}
          onSendMessage={handleCloseMatch}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0f3460' }}>
          {/* Swipe Card Alanı */}
          <View style={{ position: 'absolute', top: '10%', left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
            {currentUser && (
              <ZodiacSwipeCard
                user={currentUser}
                onSwipe={handleSwipe}
              />
            )}
          </View>
          {/* User Detail Panel */}
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30 }}>
            <UserDetailPanel
              user={currentUser}
              panelState={panelState}
              onClose={() => setPanelState(PanelState.CLOSED)}
              onPanelStateChange={setPanelState}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f3460',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  swipeCardContainer: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailPanelContainer: {
    flex: 3,
    justifyContent: 'flex-end',
  },
});

export default ZodiacSwipeScreen; 