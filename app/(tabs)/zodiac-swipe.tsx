import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import ZodiacSwipeCard from '../../components/swipe/ZodiacSwipeCard';
import MatchScreen from '../components/match/MatchScreen';
import UserDetailPanel, { PanelState } from '../components/swipe/UserDetailPanel';
import { DiscoverUser, swipeApi } from '../services/api';

const { height } = Dimensions.get('window');

const ZodiacSwipeScreen: React.FC = () => {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>(PanelState.CLOSED);
  const [showMatch, setShowMatch] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await swipeApi.getDiscoverUsers(1, 10);
        setUsers(data.users || []);
      } catch (e) {}
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleLike = async () => {
    if (!users[activeIndex]) return;
    try {
      // API'ye swipe isteği at
      const res = await swipeApi.swipe({ toUserId: users[activeIndex].id, action: 'LIKE' });
      if (res.isMatch) {
        setMatchData({
          match: {
            matchedUser: users[activeIndex],
            compatibilityScore: users[activeIndex].compatibilityScore,
            compatibilityDescription: users[activeIndex].compatibilityDescription,
          },
          currentUser: {}, // Burada kendi kullanıcı bilgini ekleyebilirsin
        });
        setShowMatch(true);
      }
    } catch (e) {}
    handleNext();
  };

  const handleDislike = async () => {
    handleNext();
  };

  const handleNext = () => {
    setPanelState(PanelState.CLOSED);
    setActiveIndex((prev) => (prev + 1 < users.length ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setPanelState(PanelState.CLOSED);
    setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : users.length - 1));
  };

  const selectedUser = users[activeIndex];

  return (
    <View style={styles.container}>
      {/* Swipe Card Alanı */}
      <View style={styles.swipeCardContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#B57EDC" />
        ) : (
          selectedUser && (
            <ZodiacSwipeCard
              photos={selectedUser.photos ? selectedUser.photos.map(p => p.imageUrl) : []}
              name={selectedUser.firstName}
            />
          )
        )}
      </View>
      {/* User Detail Panel */}
      <View style={styles.panelContainer}>
        <UserDetailPanel
          user={selectedUser}
          panelState={panelState}
          onClose={() => setPanelState(PanelState.CLOSED)}
          onPanelStateChange={setPanelState}
        />
      </View>
      {/* Footer Alanı */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={handlePrev}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, styles.dislikeBtn]} onPress={handleDislike}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, styles.likeBtn]} onPress={handleLike}>
          <Ionicons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={handleNext}>
          <Ionicons name="arrow-forward" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* MatchScreen Modal */}
      <Modal visible={showMatch} transparent animationType="fade">
        {matchData && (
          <MatchScreen
            match={matchData.match}
            currentUser={matchData.currentUser}
            onClose={() => setShowMatch(false)}
            onSendMessage={() => setShowMatch(false)}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f3460',
  },
  swipeCardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: height * 0.09,
    zIndex: 10,
  },
  mockCard: {
    width: 280,
    height: height * 0.45,
    backgroundColor: '#22223b',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#B57EDC',
  },
  panelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80,
    zIndex: 2,
    pointerEvents: 'box-none',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(20,20,40,0.95)',
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  footerBtn: {
    backgroundColor: '#22223b',
    padding: 14,
    borderRadius: 32,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtn: {
    backgroundColor: '#B57EDC',
  },
  dislikeBtn: {
    backgroundColor: '#FF6B9D',
  },
});

export default ZodiacSwipeScreen; 