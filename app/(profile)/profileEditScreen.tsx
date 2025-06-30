import { useProfile } from '@/app/context/ProfileContext';
import { AccountUpdateRequest, authApi, userApi } from '@/app/services/api';
import { removeToken } from '@/app/utils/tokenStorage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  GestureResponderEvent,
  Image,
  PanResponder,
  PanResponderGestureState,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SharedValue,
  useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const MAX_PHOTOS = 3; // Maksimum fotoğraf sayısı (standart kullanıcı limiti)
const PHOTO_SIZE = (width - 72) / 3; // 3 sütun için genişlik
const PHOTO_MARGIN = 6;

// Auth servis metotları
const authService = {
  // Çıkış yap
  logout: async () => {
    try {
      const response = await authApi.logout();
      // Token'ı kaldır
      await removeToken();
      return response;
    } catch (error: any) {
      throw error;
    }
  }
};

// Fotoğraf servis metotları
const photoService = {
  // Fotoğraf yükle
  uploadPhoto: async (file: any) => {
    const formData = new FormData();
    formData.append('file', file as any);
    
    console.log('Fotoğraf yükleme isteği hazırlanıyor:', file);
    console.log('FormData oluşturuldu:', formData);
    
    try {
      console.log('Fotoğraf yükleme isteği gönderiliyor: /api/images/upload');
      const response = await userApi.uploadPhoto(formData);
      console.log('Fotoğraf yükleme yanıtı alındı:', response);
      return response;
    } catch (error: any) {
      console.error('Fotoğraf yükleme hatası detayları:', error);
      if (error.response) {
        // Sunucu yanıtı ile dönen hata
        console.error('Sunucu yanıtı:', error.response.data);
        console.error('Durum kodu:', error.response.status);
        console.error('Başlıklar:', error.response.headers);
        throw error.response.data || { error: 'Fotoğraf yüklenemedi (sunucu hatası)' };
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error('Yanıt alınamadı:', error.request);
        throw { error: 'Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.' };
      } else {
        // İstek hazırlanırken bir şeyler yanlış gitti
        console.error('İstek hatası:', error.message);
        throw { error: `İstek yapılırken hata oluştu: ${error.message}` };
      }
    }
  },
  
  // Fotoğraf sil
  deletePhoto: async (publicId: string) => {
    try {
      const response = await userApi.deletePhoto(publicId);
      return response;
    } catch (error: any) {
      throw error.response?.data || { error: 'Fotoğraf silinemedi' };
    }
  },

  // Profil fotoğrafı olarak ayarla
  setAsProfilePhoto: async (photoId: number): Promise<any> => {
    try {
      const response = await userApi.setAsProfilePhoto(photoId);
      return response;
    } catch (error: any) {
      throw error.response?.data || { error: 'Profil fotoğrafı ayarlanamadı' };
    }
  },
  
  // Fotoğraf sırasını güncelle
  updatePhotoOrder: async (photoOrderData: { photoIds: string[] }) => {
    try {
      // API'ye fotoğraf sırasını güncelleme isteği gönder
      const response = await userApi.updatePhotoOrder(photoOrderData);
      return response;
    } catch (error: any) {
      throw error.response?.data || { error: 'Fotoğraf sırası güncellenemedi' };
    }
  }
};

// Fotoğraf tipi tanımı
interface Photo {
  id: number;            // Veritabanı ID
  publicId: string;      // Cloudinary public ID
  url: string;           // Cloudinary URL
  isProfilePhoto?: boolean; // Profil fotoğrafı mı
  displayOrder?: number; // Gösterim sırası
}

// Fotoğraf yanıt tipi
interface PhotoUploadResponse {
  url: string;
  publicId: string;
  id: number;
  message: string;
  limit: number;
  used: number;
}

// Fotoğraf silme yanıt tipi
interface PhotoDeleteResponse {
  message: string;
  publicId: string;
}

// Photo tipi için ek alanlar ekleyelim
interface AnimatedPhoto extends Photo {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
  zIndex: SharedValue<number>;
  opacity: SharedValue<number>;
}

// Yardımcı fonksiyon - grid pozisyonu hesaplama
const getPositionByIndex = (index: number) => {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return {
    x: col * (PHOTO_SIZE + PHOTO_MARGIN * 2) + PHOTO_MARGIN,
    y: row * (PHOTO_SIZE + PHOTO_MARGIN * 2) + PHOTO_MARGIN,
  };
};

// Yardımcı fonksiyon - index'i pozisyona göre hesaplama
const getIndexFromPosition = (x: number, y: number, itemCount: number) => {
  const col = Math.max(0, Math.min(2, Math.floor(x / (PHOTO_SIZE + PHOTO_MARGIN * 2))));
  const row = Math.max(0, Math.floor(y / (PHOTO_SIZE + PHOTO_MARGIN * 2)));
  const index = row * 3 + col;
  return Math.min(itemCount - 1, index);
};

// PhotoItem props için interface
interface PhotoItemProps {
  photo: Photo;
  index: number; 
  onDelete: (photoId: string) => void;
  onSetAsProfile: (index: number) => void;
  isDark?: boolean;
}

// PhotoItem bileşeni
const PhotoItem: React.FC<PhotoItemProps> = ({ photo, index, onDelete, onSetAsProfile, isDark }) => {
  return (
    <View style={styles.photoItem}>
      <Image source={{ uri: photo.url }} style={styles.photoImage} />
      
      <View style={styles.photoActions}>
        {!photo.isProfilePhoto && (
          <TouchableOpacity 
            style={styles.photoAction}
            onPress={() => onSetAsProfile(index)}
          >
            <Ionicons name="person-circle-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.photoAction, styles.photoActionDelete]}
          onPress={() => onDelete(photo.publicId)}
        >
          <Ionicons name="trash-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {photo.isProfilePhoto && (
        <View style={styles.profilePhotoBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#FFF" />
          <Text style={styles.profilePhotoBadgeText}>Profil</Text>
        </View>
      )}
    </View>
  );
};

export default function ProfileEditScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const { userProfile, fetchUserProfile } = useProfile();
  
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' veya 'preview'
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [photoLimit, setPhotoLimit] = useState(MAX_PHOTOS);
  const [usedPhotoCount, setUsedPhotoCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Sürükleme animasyonu için ref
  const pan = useRef(new Animated.ValueXY()).current;
  
  // Form değerleri
  const [formData, setFormData] = useState<AccountUpdateRequest>({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    username: userProfile.username || '',
    email: userProfile.email || '',
    bio: userProfile.bio || '',
  });

  // Bu 3 state yerine 1 array state kullanacağız
  const photoStates = useRef<{
    translateX: Animated.Value,
    translateY: Animated.Value,
    scale: Animated.Value,
    opacity: Animated.Value,
  }[]>([]);
  
  // Fotoğrafların animasyon değerleri için state
  const [animatedPhotos, setAnimatedPhotos] = useState<AnimatedPhoto[]>([]);
  
  // Sürükleme için değişkenler
  const activeIndex = useSharedValue<number>(-1);
  const activeOriginX = useSharedValue<number>(0);
  const activeOriginY = useSharedValue<number>(0);
  
  // Yardımcı fonksiyonlar
  const getPhotoPosition = useCallback((index: number) => {
    const photoWidth = (width - 72) / 3; // 3 sütun için genişlik
    const photoMargin = 6;
    const row = Math.floor(index / 3);
    const col = index % 3;
    
    return {
      x: col * (photoWidth + photoMargin * 2) + photoMargin,
      y: row * (photoWidth + photoMargin * 2) + photoMargin
    };
  }, [width]);
  
  // Photos değiştiğinde, animatedPhotos'u güncelle
  useEffect(() => {
    if (photos.length > 0) {
      // Hook çağrısı yapmak yerine, önceden oluşturulmuş animasyon değerlerini kullan
      const newAnimatedPhotos = photos.map(photo => {
        const existingAnimatedPhoto = animatedPhotos.find(ap => ap.id === photo.id);
        
        if (existingAnimatedPhoto) {
          return {
            ...photo,
            translateX: existingAnimatedPhoto.translateX,
            translateY: existingAnimatedPhoto.translateY, 
            scale: existingAnimatedPhoto.scale,
            zIndex: existingAnimatedPhoto.zIndex,
            opacity: existingAnimatedPhoto.opacity
          };
        } else {
          // Yeni fotoğraf için ref değerlerini manuel olarak oluştur
          return {
            ...photo,
            translateX: { value: 0 },
            translateY: { value: 0 },
            scale: { value: 1 },
            zIndex: { value: 1 },
            opacity: { value: 1 }
          } as any;
        }
      });
      
      setAnimatedPhotos(newAnimatedPhotos);
    } else {
      setAnimatedPhotos([]);
    }
  }, [photos]);
  
  // Form değerleri güncelleme
  const handleChange = (field: keyof AccountUpdateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Pan responder oluştur
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        setIsDragging(false);
        // Pozisyonu sıfırla
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
        
        if (draggingIndex !== null) {
          // Hedef pozisyonu hesapla
          const photoWidth = (width - 56) / 2;
          const targetIndex = Math.floor((e.nativeEvent.pageX - 8) / photoWidth);
          
          // Geçerli hedef indeksi için kontrol
          if (targetIndex >= 0 && targetIndex < photos.length && targetIndex !== draggingIndex) {
            // Fotoğrafları yeniden sırala
            const newPhotos = [...photos];
            const draggedPhoto = newPhotos[draggingIndex];
            newPhotos.splice(draggingIndex, 1);
            newPhotos.splice(targetIndex, 0, draggedPhoto);
            
            // State'i güncelle
            setPhotos(newPhotos);
            
            // API'ye sıralama değişikliğini gönder
            updatePhotoOrderOnServer(newPhotos);
          }
        }
        
        setDraggingIndex(null);
      }
    })
  ).current;
  
  // Önce updatePhotoOrderOnServer fonksiyonunu tanımla
  const updatePhotoOrderOnServer = async (updatedPhotos: Photo[]) => {
    try {
      const photoIds = updatedPhotos.map(photo => photo.publicId);
      await photoService.updatePhotoOrder({ photoIds });
      console.log('Fotoğraf sıralaması başarıyla güncellendi');
    } catch (error: any) {
      console.error('Fotoğraf sırası güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Fotoğraf sıralaması güncellenirken bir hata oluştu');
      await fetchPhotos();
    }
  };
  
  // Sonra updatePhotoOrder fonksiyonunu tanımla
  const updatePhotoOrder = useCallback((from: number, to: number) => {
    if (from === to) return;
    
    const newPhotos = [...photos];
    const movedPhoto = newPhotos.splice(from, 1)[0];
    newPhotos.splice(to, 0, movedPhoto);
    
    setPhotos(newPhotos);
    updatePhotoOrderOnServer(newPhotos);
  }, [photos]);
  
  // Hesap bilgilerini güncelleme
  const handleUpdateAccount = async () => {
    try {
      setIsLoading(true);
      await userApi.updateAccount(formData);
      
      // Profil bilgilerini yenile
      await fetchUserProfile();
      
      Alert.alert('Başarılı', 'Profil bilgileri başarıyla güncellendi', [
        { 
          text: 'Tamam', 
          onPress: () => {
            // Profil sayfasına yönlendir
            router.push('/profileScreen' as any);
          }
        }
      ]);
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fotoğraf yükleme
  const handleAddPhoto = async () => {
    try {
      if (usedPhotoCount >= photoLimit) {
        Alert.alert(
          'Fotoğraf Limiti',
          `Maksimum ${photoLimit} fotoğraf yükleyebilirsiniz. Daha fazla fotoğraf eklemek için bazı fotoğrafları silin.`
        );
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermeniz gerekiyor');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsLoading(true);
        console.log('Seçilen fotoğraf:', result.assets[0]);

        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop() || `photo_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        const file = {
          uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
          name: filename,
          type,
        };
        
        console.log('Yüklenecek dosya bilgileri:', file);

        try {
          const uploadResponse = await photoService.uploadPhoto(file);
          console.log('Yükleme başarılı, yanıt:', uploadResponse);

          // Yeni fotoğrafı oluştur
          const newPhoto = {
            id: uploadResponse.id,
            publicId: uploadResponse.publicId,
            url: uploadResponse.url,
            isProfilePhoto: photos.length === 0, // İlk fotoğraf profil fotoğrafı olsun
          };

          // Fotoğrafı state'e ekle
          setPhotos((prev) => [...prev, newPhoto]);
          setUsedPhotoCount(prev => prev + 1);
          
          // İlk fotoğraf yüklendiğinde otomatik olarak profil fotoğrafı olarak ayarla
          if (photos.length === 0) {
            try {
              await userApi.setAsProfilePhoto(uploadResponse.id);
              console.log('İlk fotoğraf profil fotoğrafı olarak ayarlandı');
              
              // Global ProfileContext'i refresh et
              await refreshProfile();
            } catch (profilePhotoError) {
              console.error('Profil fotoğrafı ayarlanırken hata:', profilePhotoError);
            }
          }

          Alert.alert('Başarılı', 'Fotoğraf başarıyla yüklendi');
        } catch (uploadError: any) {
          console.error('Fotoğraf yükleme işleminde hata:', uploadError);
          Alert.alert(
            'Yükleme Hatası', 
            uploadError?.error || 'Fotoğraf yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.'
          );
        }
      }
    } catch (error: any) {
      console.error('Fotoğraf seçme/yükleme hatası:', error);
      Alert.alert('Hata', error?.error || error?.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fotoğrafı sil
  const handleDeletePhoto = async (photoId: string) => {
    try {
      // Silinecek fotoğrafın profil fotoğrafı olup olmadığını kontrol et
      const photoToDelete = photos.find(photo => photo.publicId === photoId);
      const isProfilePhoto = photoToDelete?.isProfilePhoto || false;
      
      console.log('Silinecek fotoğraf:', photoToDelete);
      console.log('Profil fotoğrafı mı:', isProfilePhoto);
      
      // Fotoğrafı sil
      await userApi.deletePhoto(photoId);
      
      // Fotoğrafları yeniden çek
      await fetchPhotos();
      
      // Eğer silinen fotoğraf profil fotoğrafıysa ve başka fotoğraflar varsa
      if (isProfilePhoto) {
        // Güncel fotoğraf listesini al (silme işleminden sonra)
        const updatedPhotos = await userApi.getPhotos();
        
        if (updatedPhotos && updatedPhotos.length > 0) {
          // İlk kalan fotoğrafı profil fotoğrafı yap
          const firstPhoto = updatedPhotos[0];
          console.log('İlk kalan fotoğraf profil fotoğrafı yapılıyor:', firstPhoto);
          
          try {
            await photoService.setAsProfilePhoto(firstPhoto.id);
            console.log('Otomatik profil fotoğrafı ayarlandı');
            
            // Profil bilgilerini ve fotoğrafları yenile
            await fetchUserProfile();
            await fetchPhotos();
            
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
    } catch (error: any) {
      console.error('Fotoğraf silme hatası:', error);
      Alert.alert('Hata', error.message || 'Fotoğraf silinirken bir hata oluştu');
    }
  };
  
  // Profil fotoğrafı olarak ayarla
  const handleSetAsProfilePhoto = async (index: number) => {
    try {
      setIsLoading(true);
      const selectedPhoto = photos[index];
      
      if (!selectedPhoto || !selectedPhoto.id) {
        throw new Error('Fotoğraf bilgisi bulunamadı');
      }
      
      console.log('Profil fotoğrafı olarak ayarlanıyor, fotoğraf ID:', selectedPhoto.id);
      
      // API'ye fotoğraf ID'sini gönder (publicId değil)
      await photoService.setAsProfilePhoto(selectedPhoto.id);
      
      // Fotoğrafları yenile
      await fetchPhotos();
      
      // Profil bilgilerini yenile
      await fetchUserProfile();
      
      // Global ProfileContext'i refresh et (diğer ekranlar için)
      await refreshProfile();
      
      // Kullanıcı profilindeki profil fotoğrafını güncelle (geçici olarak)
      if (userProfile) {
        userProfile.profileImage = selectedPhoto.url;
      }
      
      Alert.alert('Başarılı', 'Profil fotoğrafı başarıyla güncellendi');
    } catch (error: any) {
      console.error('Profil fotoğrafı ayarlanırken hata:', error);
      Alert.alert('Hata', error.message || 'Profil fotoğrafı güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fotoğrafları getir
  const fetchPhotos = async () => {
    try {
      setIsLoadingPhotos(true);
      
      try {
        const photos = await userApi.getPhotos();
        
        if (!photos) {
          throw new Error('Fotoğraflar alınamadı');
        }
        
        // Dönen veriyi işle
        setPhotos(photos.map(photo => ({
          id: photo.id,
          publicId: photo.publicId,
          url: photo.url,
          isProfilePhoto: photo.isProfilePhoto,
          displayOrder: photo.displayOrder
        })));
        
        // Kullanılan fotoğraf sayısını güncelle
        setUsedPhotoCount(photos.length);
        
        console.log('Fotoğraflar başarıyla getirildi:', photos);
      } catch (apiError: any) {
        console.error('API fotoğraf getirme hatası:', apiError);
        
        // Hata durumunda boş liste kullan
        Alert.alert(
          'Bilgi',
          'Fotoğraflarınız şu anda getirilemedi. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam', style: 'default' }]
        );
        
        console.log('Fotoğraf getirme hatası oluştu, boş liste kullanılıyor.');
        setPhotos([]);
        setUsedPhotoCount(0);
      }
    } catch (error: any) {
      console.error('Fotoğrafları getirme hatası:', error);
      Alert.alert('Hata', error.error || 'Fotoğraflar yüklenemedi');
    } finally {
      setIsLoadingPhotos(false);
    }
  };
  
  // Sayfa yüklendiğinde profil bilgilerini ve fotoğrafları getir
  useEffect(() => {
    fetchUserProfile();
    fetchPhotos();
  }, []);
  
  // Form değerlerini profile bilgileri değiştiğinde güncelle
  useEffect(() => {
    setFormData({
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      username: userProfile.username || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
    });
  }, [userProfile]);
  
  // Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    try {
      Alert.alert(
        'Çıkış Yap',
        'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Çıkış Yap',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                await authService.logout();
                
                // Login sayfasına yönlendir
                router.replace('/(auth)/login');
              } catch (error) {
                console.error('Çıkış yaparken hata:', error);
                Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Çıkış işlemi başlatılırken hata:', error);
      Alert.alert('Hata', 'Çıkış işlemi başlatılamadı');
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
      await fetchPhotos();
    } catch (error) {
      console.error('Yenileme hatası:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }}>
        <Stack.Screen
          options={{
            title: 'Profili Düzenle',
            headerStyle: {
              backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff',
            },
            headerTintColor: isDark ? '#FFFFFF' : '#2c2c54',
            headerShown: true,
            headerBackTitle: 'Geri',
          }}
        />
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#FFFFFF' : '#2c2c54'}
            />
          }
        >
          {/* Profil Fotoğrafı Bölümü */}
          <View style={styles.profilePhotoSection}>
            <View style={styles.profileImageContainer}>
              {userProfile.profileImage ? (
                <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.noProfileImageContainer}>
                  <Ionicons name="person-outline" size={50} color="#CCC" />
                </View>
              )}
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={handleAddPhoto}
              >
                <Ionicons name="camera-outline" size={22} color="#FFF" />
                <Text style={styles.changePhotoText}>Değiştir</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Alanları */}
          <View style={[styles.formSection, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF' }]}>
            {/* Ad */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>Ad</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e1e3f' : '#F5F5F5' }]}>
                <Ionicons name="person-outline" size={20} color={isDark ? '#FFFFFF' : '#2c2c54'} />
                <TextInput 
                  style={[styles.inputValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                  placeholder="Adınız"
                  placeholderTextColor={isDark ? '#a0a0ff' : '#6e6e9f'}
                />
              </View>
            </View>

            {/* Soyad */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>Soyad</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e1e3f' : '#F5F5F5' }]}>
                <Ionicons name="person-outline" size={20} color={isDark ? '#FFFFFF' : '#2c2c54'} />
                <TextInput 
                  style={[styles.inputValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  placeholder="Soyadınız"
                  placeholderTextColor={isDark ? '#a0a0ff' : '#6e6e9f'}
                />
              </View>
            </View>

            {/* Kullanıcı Adı */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>Kullanıcı Adı</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e1e3f' : '#F5F5F5' }]}>
                <Ionicons name="at-outline" size={20} color={isDark ? '#FFFFFF' : '#2c2c54'} />
                <TextInput 
                  style={[styles.inputValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}
                  value={formData.username}
                  onChangeText={(text) => handleChange('username', text)}
                  placeholder="Kullanıcı adınız"
                  placeholderTextColor={isDark ? '#a0a0ff' : '#6e6e9f'}
                />
              </View>
            </View>

            {/* E-posta */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>E-posta</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e1e3f' : '#F5F5F5' }]}>
                <Ionicons name="mail-outline" size={20} color={isDark ? '#FFFFFF' : '#2c2c54'} />
                <TextInput 
                  style={[styles.inputValue, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor={isDark ? '#a0a0ff' : '#6e6e9f'}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Biyografi */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>Biyografi</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e1e3f' : '#F5F5F5', minHeight: 80 }]}>
                <Ionicons name="chatbox-outline" size={20} color={isDark ? '#FFFFFF' : '#2c2c54'} style={{marginTop: 10}} />
                <TextInput 
                  style={[styles.inputValue, { color: isDark ? '#FFFFFF' : '#2c2c54', flex: 1, textAlignVertical: 'top' }]}
                  value={formData.bio}
                  onChangeText={(text) => handleChange('bio', text)}
                  placeholder="Kendinizden bahsedin..."
                  placeholderTextColor={isDark ? '#a0a0ff' : '#6e6e9f'}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Kaydet Butonu */}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: isDark ? '#a0a0ff' : '#2c2c54' }]}
              onPress={handleUpdateAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Fotoğraflarım */}
          <View style={[styles.photosSection, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
              Fotoğraflarım ({photos.length}/{photoLimit})
            </Text>
            
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <PhotoItem
                  key={photo.id || index}
                  photo={photo}
                  index={index}
                  onDelete={handleDeletePhoto}
                  onSetAsProfile={handleSetAsProfilePhoto}
                  isDark={isDark}
                />
              ))}
              
              {photos.length < photoLimit && (
                <TouchableOpacity 
                  style={[styles.addPhotoButton, { backgroundColor: isDark ? '#1e1e3f' : '#F5F5F5' }]}
                  onPress={handleAddPhoto}
                >
                  <Ionicons name="add-circle-outline" size={40} color={isDark ? '#FFFFFF' : '#2c2c54'} />
                  <Text style={[styles.addPhotoText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
                    Fotoğraf Ekle
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profilePhotoSection: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#444',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#2c2c54',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 45,
    backgroundColor: 'rgba(44, 44, 84, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
  },
  formSection: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
  },
  inputValue: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  photosSection: {
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
    height: Math.ceil(MAX_PHOTOS / 3) * (PHOTO_SIZE + PHOTO_MARGIN * 2),
    marginHorizontal: -PHOTO_MARGIN,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#444',
  },
  dragHandle: {
    width: '100%',
    height: '100%',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoActions: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
  },
  photoAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  photoActionDelete: {
    backgroundColor: 'rgba(255,0,0,0.5)',
  },
  profilePhotoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#2c2c54',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhotoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  addPhotoButton: {
    width: (width - 72) / 3, // Fotoğraflarla aynı boyutta
    height: (width - 72) / 3,
    margin: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#a0a0ff',
  },
  addPhotoText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  noProfileImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 44, 84, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  dragInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  dragInfoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 