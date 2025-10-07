import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProfileDrawer from '../components/ProfileDrawer';
import { useProfile } from '../context/ProfileContext';

export default function HomeScreen() {
  const { userProfile, showProfile, isProfileVisible, hideProfile, fetchUserProfile, isLoading } = useProfile();
  
  // Ekran açıldığında profil bilgilerini çek
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  // Başlık kısmı
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vybe</Text>
        
        {/* Profil fotoğrafı butonu */}
        <TouchableOpacity onPress={showProfile} style={styles.profileButton}>
          <Image
            source={{ uri: userProfile.profileImage }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content}>
        <Text style={styles.welcomeText}>Hoş geldin, {userProfile.firstName || userProfile.name}</Text>
        <Text style={styles.infoText}>Burada içerik gösterilecek</Text>
      </ScrollView>
      
      {/* Profil drawer bileşeni */}
      <ProfileDrawer 
        visible={isProfileVisible}
        onClose={hideProfile}
        user={userProfile}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
}); 