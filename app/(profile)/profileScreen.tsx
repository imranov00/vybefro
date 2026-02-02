import { useProfile } from '@/app/context/ProfileContext';
import { userApi } from '@/app/services/api';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userProfile, fetchUserProfile, refreshProfile, isLoading: profileLoading, error: profileError } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  // Ekran ilk açıldığında profil bilgilerini ve fotoğrafları çek
  useEffect(() => {
    const loadData = async () => {
      await fetchUserProfile();
      await fetchUserPhotos();
    };
    
    loadData();
  }, []);

  // Kullanıcı fotoğraflarını getir
  const fetchUserPhotos = async () => {
    try {
      setIsLoadingPhotos(true);
      setPhotoError(null);
      
      console.log('Fotoğraflar getiriliyor...');
      const userPhotos = await userApi.getPhotos();
      console.log('API yanıtı:', JSON.stringify(userPhotos, null, 2));
      
      if (userPhotos && Array.isArray(userPhotos)) {
        console.log('Getirilen fotoğraf sayısı:', userPhotos.length);
        
        // Her fotoğrafın yapısını kontrol et
        const mappedPhotos = userPhotos.map((photo, index) => {
          console.log(`Fotoğraf ${index + 1}:`, JSON.stringify(photo, null, 2));
          
          // API'den gelen photoId/publicId alanlarını kontrol et
          if (!photo.publicId && photo.id) {
            console.log(`Fotoğraf #${index + 1} için publicId eksik, id kullanılacak:`, photo.id);
          }
          
          return photo;
        });
        
        setPhotos(mappedPhotos);
      } else {
        console.error('Beklenmeyen fotoğraf verisi formatı:', userPhotos);
        setPhotos([]);
      }
    } catch (error: any) {
      console.error('Fotoğrafları getirme hatası:', error);
      if (error.response) {
        console.error('API hata yanıtı:', error.response.data);
        console.error('API hata durumu:', error.response.status);
      }
      setPhotoError(error.message || 'Fotoğraflar yüklenemedi');
      setPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Kullanıcı ekranı yenilediğinde profil bilgilerini ve fotoğrafları tekrar çek
  const onRefresh = async () => {
    setRefreshing(true);
    console.log('Profil sayfası yenileniyor...');
    
    try {
      // Önce profil bilgilerini çek
      await fetchUserProfile();
      console.log('Profil bilgileri güncellendi');
      
      // Sonra fotoğrafları çek
      await fetchUserPhotos();
      console.log('Fotoğraflar güncellendi');
    } catch (error) {
      console.error('Yenileme hatası:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Profil fotoğrafı olarak ayarla
  const handleSetAsProfilePhoto = async (photoId: string) => {
    try {
      console.log('Profil fotoğrafı olarak ayarlanıyor, photoId:', photoId);
      const response = await userApi.setAsProfilePhoto(Number(photoId));
      console.log('API yanıtı:', response);
      
      Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi');
      
      // Önce profil bilgilerini güncelle
      await fetchUserProfile();
      console.log('Profil bilgileri güncellendi');
      
      // Sonra fotoğraf listesini güncelle
      await fetchUserPhotos();
      console.log('Fotoğraf listesi güncellendi');
      
      // Global ProfileContext'i refresh et
      await refreshProfile();
    } catch (error: any) {
      console.error('Profil fotoğrafı ayarlama hatası:', error);
      if (error.response) {
        console.error('API hata yanıtı:', error.response.data);
        console.error('API hata durumu:', error.response.status);
      }
      Alert.alert('Hata', error.message || 'Profil fotoğrafı güncellenirken bir hata oluştu');
    }
  };

  // Fotoğraf sil
  const handleDeletePhoto = async (photoId: string) => {
    try {
      console.log('Silinecek fotoğraf ID:', photoId);
      
      Alert.alert(
        'Fotoğrafı Sil',
        'Bu fotoğrafı silmek istediğinize emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                // Silinecek fotoğrafın profil fotoğrafı olup olmadığını kontrol et
                const photoToDelete = photos.find(photo => photo.publicId === photoId);
                const isProfilePhoto = photoToDelete?.isProfilePhoto || false;
                
                console.log('Fotoğraf silme işlemi başlatıldı');
                console.log('Silinecek fotoğraf:', photoToDelete);
                console.log('Profil fotoğrafı mı:', isProfilePhoto);
                
                const response = await userApi.deletePhoto(photoId);
                console.log('Silme işlemi sonucu:', response);
                
                // Fotoğrafları yeniden çek
                await fetchUserPhotos();
                
                // Eğer silinen fotoğraf profil fotoğrafıysa ve başka fotoğraflar varsa
                if (isProfilePhoto) {
                  // Güncel fotoğraf listesini al (silme işleminden sonra)
                  const updatedPhotos = await userApi.getPhotos();
                  
                  if (updatedPhotos && updatedPhotos.length > 0) {
                    // İlk kalan fotoğrafı profil fotoğrafı yap
                    const firstPhoto = updatedPhotos[0];
                    console.log('İlk kalan fotoğraf profil fotoğrafı yapılıyor:', firstPhoto);
                    
                    try {
                      await userApi.setAsProfilePhoto(firstPhoto.id);
                      console.log('Otomatik profil fotoğrafı ayarlandı');
                      
                      // Profil bilgilerini ve fotoğrafları yenile
                      await fetchUserProfile();
                      await fetchUserPhotos();
                      
                      // Global ProfileContext'i refresh et
                      await refreshProfile();
                      
                      Alert.alert('Başarılı', 'Fotoğraf silindi ve kalan fotoğraf profil fotoğrafı olarak ayarlandı');
                    } catch (profileError) {
                      console.error('Otomatik profil fotoğrafı ayarlama hatası:', profileError);
                      Alert.alert('Uyarı', 'Fotoğraf silindi ancak yeni profil fotoğrafı ayarlanırken hata oluştu');
                    }
                  } else {
                    // Hiç fotoğraf kalmadı
                    await fetchUserProfile();
                    await refreshProfile();
                    Alert.alert('Başarılı', 'Fotoğraf silindi');
                  }
                } else {
                  // Normal fotoğraf silme (profil fotoğrafı değildi)
                  Alert.alert('Başarılı', 'Fotoğraf silindi');
                }
              } catch (deleteError: any) {
                console.error('Fotoğraf silme hatası:', deleteError);
                if (deleteError.response) {
                  console.error('API hata yanıtı:', deleteError.response.data);
                  console.error('API hata durumu:', deleteError.response.status);
                }
                Alert.alert('Hata', deleteError.message || 'Fotoğraf silinirken bir hata oluştu');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Fotoğraf silme dialog hatası:', error);
      Alert.alert('Hata', error.message || 'Fotoğraf silinirken bir hata oluştu');
    }
  };

  // Profil düzenleme ekranına git
  const handleEditProfile = () => {
    router.push('/profileEditScreen' as any);
  };

  // Ayarlar ekranına git
  const handleSettings = () => {
    router.push('/settingsScreen' as any);
  };

  // Anasayfaya git
  const handleGoHome = () => {
    router.push('/(tabs)/' as any);
  };

  // Geri git - mode'a göre doğru sekmeye yönlendir
  const handleGoBack = () => {
    router.push('/(tabs)/' as any);
  };

  // Yeni fotoğraf ekle
  const handleAddPhoto = () => {
    router.push('/profileEditScreen' as any);
  };

  // Slider fotograını değiştir
  const handlePhotoChange = (index: number) => {
    setActivePhotoIndex(index);
  };
  
  // Yaşı hesapla
  const calculateAge = (birthDate: string | undefined): number => {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Yükleme durumu
  if (profileLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#2c2c54'} />
        <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
          Profil yükleniyor...
        </Text>
      </View>
    );
  }

  // Hata durumu
  if (profileError && !refreshing) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={isDark ? '#FFFFFF' : '#2c2c54'} />
        <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
          {profileError}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: isDark ? '#2c2c54' : '#e8e8ff' }]} 
          onPress={fetchUserProfile}
        >
          <Text style={{ color: isDark ? '#FFFFFF' : '#2c2c54', fontWeight: '500' }}>
            Tekrar Dene
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderPhoto = ({ item, index }: { item: any, index: number }) => {
    return (
      <View style={{
        width,
        height: height * 0.55,
        position: 'relative',
      }}>
        <Image 
          source={{ uri: item.url || userProfile.profileImage || 'https://via.placeholder.com/400' }} 
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
      </View>
    );
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#2c2c54'}
          />
        }
      >
        {/* Fotoğraf Slider */}
        <View style={{ height: height * 0.55 }}>
          {photos.length > 0 ? (
            <View style={styles.photoGalleryContainer}>
              <FlatList
                ref={flatListRef}
                data={photos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => (item.id || index).toString()}
                onMomentumScrollEnd={(event) => {
                  const index = Math.floor(
                    event.nativeEvent.contentOffset.x / width
                  );
                  handlePhotoChange(index);
                }}
                nestedScrollEnabled={true}
              />
              
              {/* Sayfa İndikatörü */}
              <View style={styles.paginationContainer}>
                {photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      { backgroundColor: index === activePhotoIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)' }
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.noPhotosContainer}>
              <Ionicons name="images-outline" size={80} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'} />
              <Text style={[styles.noPhotosText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                Henüz fotoğraf yok
              </Text>
              <TouchableOpacity
                style={[styles.addPhotoButton, { backgroundColor: isDark ? '#2c2c54' : '#e8e8ff' }]}
                onPress={handleAddPhoto}
              >
                <Ionicons name="add" size={24} color={isDark ? '#FFFFFF' : '#2c2c54'} />
                <Text style={{ color: isDark ? '#FFFFFF' : '#2c2c54', fontWeight: '500', marginLeft: 8 }}>
                  Fotoğraf Ekle
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Profil Bilgileri */}
        <View style={[styles.profileInfoContainer, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
          <View style={styles.profileHeader}>
            <View style={{ width: '100%' }}>
              <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              <Text style={[styles.userHandle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)' }]}>
                @{userProfile.username}
              </Text>
            </View>
          </View>
          
          {/* Bio */}
          {userProfile.bio ? (
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)' }]}>
                Hakkımda
              </Text>
              <Text style={[styles.userBio, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                {userProfile.bio}
              </Text>
            </View>
          ) : null}
          
          {/* Kişisel Bilgiler */}
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)' }]}>
              Kişisel Bilgiler
            </Text>
            
            <View style={styles.infoCard}>
              {/* Ad Soyad */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(44,44,84,0.5)' }]}>
                    Ad Soyad
                  </Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                    {userProfile.firstName} {userProfile.lastName}
                  </Text>
                </View>
              </View>
              
              {/* Kullanıcı Adı */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="at" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(44,44,84,0.5)' }]}>
                    Kullanıcı Adı
                  </Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                    @{userProfile.username}
                  </Text>
                </View>
              </View>
              
              {/* Cinsiyet */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons 
                    name={userProfile.gender === 'MALE' ? 'male' : (userProfile.gender === 'FEMALE' ? 'female' : 'person')} 
                    size={20} 
                    color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)'} 
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(44,44,84,0.5)' }]}>
                    Cinsiyet
                  </Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                    {userProfile.gender === 'MALE' ? 'Erkek' : (userProfile.gender === 'FEMALE' ? 'Kadın' : 'Belirtilmemiş')}
                  </Text>
                </View>
              </View>
              
              {/* Doğum Tarihi */}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(44,44,84,0.5)' }]}>
                    Doğum Tarihi
                  </Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                    {userProfile.birthDate 
                      ? new Date(userProfile.birthDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) 
                      : 'Belirtilmemiş'
                    }
                  </Text>
                </View>
              </View>
              
              {/* Yaş */}
              {userProfile.birthDate && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="hourglass-outline" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)'} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(44,44,84,0.5)' }]}>
                      Yaş
                    </Text>
                    <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                      {calculateAge(userProfile.birthDate)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          {/* Burç Bilgileri */}
          {userProfile.zodiacSign && (
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)' }]}>
                Burç Bilgileri
              </Text>
              
              <View style={styles.infoCard}>
                <View style={styles.zodiacContent}>
                  <Text style={[styles.zodiacEmoji, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                    {userProfile.zodiacSignEmoji || '♈'}
                  </Text>
                  <View style={styles.zodiacTextContainer}>
                    <Text style={[styles.zodiacTitle, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                      {userProfile.zodiacSignTurkish || userProfile.zodiacSign}
                    </Text>
                    <Text style={[styles.zodiacSubtitle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(44,44,84,0.7)' }]}>
                      {userProfile.zodiacSign}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Üst butonlar - Her zaman görünür */}
      <View style={styles.headerButtonsContainer}>
        {/* Geri Butonu */}
        <View style={styles.buttonBackground}>
          <TouchableOpacity onPress={handleGoBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        {/* Ana Sayfa Butonu */}
        <View style={styles.buttonBackground}>
          <TouchableOpacity onPress={handleGoHome} style={styles.iconButton}>
            <Ionicons name="home" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        {/* Ayarlar Butonu */}
        <View style={styles.buttonBackground}>
          <TouchableOpacity onPress={handleSettings} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        {/* Profil Düzenleme Butonu */}
        <View style={styles.buttonBackground}>
          <TouchableOpacity onPress={handleEditProfile} style={styles.iconButton}>
            <Ionicons name="create-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  // Fotoğraf Galerisi Stiller
  photoGalleryContainer: {
    height: '100%',
    width: width,
    position: 'relative',
  },
  photoSlide: {
    width,
    height: height * 0.55,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  headerButtonsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBackground: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    marginLeft: 8,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  addPhotoButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
  },
  addPhotoText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  noPhotosContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotosText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 30,
  },
  addFirstPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addFirstPhotoText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Profil Bilgiler Stiller
  profileInfoContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userHandle: {
    fontSize: 16,
  },
  userBio: {
    fontSize: 15,
    lineHeight: 22,
  },
  zodiacContainer: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacEmoji: {
    fontSize: 36,
    marginRight: 10,
  },
  zodiacText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  editProfileButton: {
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Yeni eklenen stiller
  infoSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoIconContainer: {
    width: 30,
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  zodiacContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacTextContainer: {
    marginLeft: 15,
  },
  zodiacTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  zodiacSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  photoActionsContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
  },
  photoActionText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
  },
  profileHeader: {
    alignItems: 'center',
  },
}); 