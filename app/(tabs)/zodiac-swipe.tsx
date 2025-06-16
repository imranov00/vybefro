import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import ZodiacSwipeCard from '../../components/swipe/ZodiacSwipeCard';
import UserDetailPanel, { PanelState } from '../components/swipe/UserDetailPanel';
import { DiscoverUser, swipeApi } from '../services/api';

const { height } = Dimensions.get('window');

const ZodiacSwipeScreen: React.FC = () => {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DiscoverUser | undefined>(undefined);
  const [panelState, setPanelState] = useState<PanelState>(PanelState.CLOSED);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await swipeApi.getDiscoverUsers(1, 10);
        setUsers(data.users || []);
        setSelectedUser(data.users?.[0]);
      } catch (e) {
        // Hata yönetimi
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // TODO: ZodiacSwipeCard eklenecek
  return (
    <View style={styles.container}>
      {/* Swipe Card Alanı */}
      <View style={styles.swipeCardContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#B57EDC" />
        ) : (
          users[0] && (
            <ZodiacSwipeCard
              photos={users[0].photos ? users[0].photos.map(p => p.imageUrl) : []}
              name={users[0].firstName}
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
    bottom: 0,
    zIndex: 1,
  },
});

export default ZodiacSwipeScreen; 