import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { UserProfile } from '../context/ProfileContext';
import { formatZodiacSign } from '../utils/zodiacUtils';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

type ProfileDrawerProps = {
  visible: boolean;
  onClose: () => void;
  user: UserProfile;
  isLoading?: boolean;
};

export default function ProfileDrawer({ visible, onClose, user, isLoading = false }: ProfileDrawerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animation = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const [isRendered, setIsRendered] = useState(visible);
  const router = useRouter();
  
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    }
    
    Animated.timing(animation, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setIsRendered(false);
      }
    });
  }, [visible, animation]);

  if (!isRendered) {
    return null;
  }

  // Profil ekranına yönlendir
  const navigateToProfile = () => {
    onClose();
    setTimeout(() => {
      router.push('/profileScreen' as any);
    }, 300);
  };

  const handleEditProfile = () => {
    onClose();
    router.push('/profileEditScreen' as any);
  };

  // Profil fotoğrafı ve bilgileri görünümü
  const renderProfileContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#a0a0ff' : '#2c2c54'} />
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
            Profil yükleniyor...
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.drawerContent, { backgroundColor: isDark ? '#1e1e3f' : '#FFFFFF' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#2c2c54' : '#f8f8ff', borderBottomColor: isDark ? '#1e1e3f' : '#f0f0f0' }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.username, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>{user.username}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#2c2c54'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.profileSection, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF', borderBottomColor: isDark ? '#1e1e3f' : '#f0f0f0' }]}>
          <View style={[styles.profileImageContainer, { borderColor: isDark ? '#a0a0ff' : '#2c2c54' }]}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.noProfileImage, { backgroundColor: isDark ? '#1e1e3f' : '#f5f5f5' }]}>
                <Ionicons name="person" size={40} color={isDark ? '#a0a0ff' : '#2c2c54'} />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>{user.name}</Text>
            {user.zodiacSign && (
              <View style={[styles.zodiacContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
                <Text style={[styles.profileZodiac, { color: isDark ? '#a0a0ff' : '#2c2c54' }]}>{formatZodiacSign(user.zodiacSign)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.menuContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF' }]} 
            onPress={handleEditProfile}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
                <Ionicons name="create-outline" size={24} color={isDark ? '#a0a0ff' : '#2c2c54'} />
              </View>
              <Text style={[styles.menuText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>Profili Düzenle</Text>
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#a0a0ff' : '#2c2c54'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF' }]} 
            onPress={() => {
              onClose();
              router.push('/settingsScreen' as any);
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
                <Ionicons name="settings-outline" size={24} color={isDark ? '#a0a0ff' : '#2c2c54'} />
              </View>
              <Text style={[styles.menuText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>Ayarlar</Text>
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#a0a0ff' : '#2c2c54'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF' }]} 
            onPress={navigateToProfile}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
                <Ionicons name="person-outline" size={24} color={isDark ? '#a0a0ff' : '#2c2c54'} />
              </View>
              <Text style={[styles.menuText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>Profilim</Text>
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#a0a0ff' : '#2c2c54'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF', marginTop: 20 }]} 
            onPress={() => {
              onClose();
              router.replace('/(auth)/login' as any);
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
                <Ionicons name="log-out-outline" size={24} color="#FF4C4C" />
              </View>
              <Text style={[styles.menuText, { color: "#FF4C4C" }]}>Çıkış Yap</Text>
              <Ionicons name="chevron-forward" size={24} color="#FF4C4C" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Karartılmış arka plan */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Drawer paneli */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX: animation }] },
          { backgroundColor: isDark ? '#1e1e3f' : '#FFFFFF' }
        ]}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: isDark ? '#1e1e3f' : '#FFFFFF' }}
        >
          {renderProfileContent()}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noProfileImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  zodiacContainer: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
  },
  profileZodiac: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuContainer: {
    padding: 15,
  },
  menuItem: {
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
}); 