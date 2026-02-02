import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLoading } from '../context/LoadingContext';
import { authApi } from '../services/api';

const { width, height } = Dimensions.get('window');

// Manuel tarih seçici için yardımcı fonksiyonlar
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = [
  { value: 0, label: 'Ocak' },
  { value: 1, label: 'Şubat' },
  { value: 2, label: 'Mart' },
  { value: 3, label: 'Nisan' },
  { value: 4, label: 'Mayıs' },
  { value: 5, label: 'Haziran' },
  { value: 6, label: 'Temmuz' },
  { value: 7, label: 'Ağustos' },
  { value: 8, label: 'Eylül' },
  { value: 9, label: 'Ekim' },
  { value: 10, label: 'Kasım' },
  { value: 11, label: 'Aralık' }
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function RegisterMusicScreen() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [birthDate, setBirthDate] = useState(new Date());
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Tarih seçici state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(birthDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(birthDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(birthDate.getFullYear());
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  // Cinsiyet seçenekleri ve API karşılıkları
  const genderOptions = [
    { label: 'Erkek', value: 'MALE' },
    { label: 'Kadın', value: 'FEMALE' },
    { label: 'Diğer', value: 'OTHER' }
  ];
  
  // Ay veya yıl değiştiğinde, aydaki gün sayısını güncelle
  useEffect(() => {
    const dayCount = getDaysInMonth(selectedYear, selectedMonth);
    setDaysInMonth(Array.from({ length: dayCount }, (_, i) => i + 1));
    
    // Eğer seçili gün, yeni ay için geçerli değilse, son günü seç
    if (selectedDay > dayCount) {
      setSelectedDay(dayCount);
    }
  }, [selectedMonth, selectedYear]);
  
  // Şifre eşleşme kontrolü
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordMatch(true);
      return;
    }
    setPasswordMatch(password.trim() === confirmPassword.trim());
  }, [password, confirmPassword]);

  // Şifre güvenliğini değerlendir
  useEffect(() => {
    if (!password || password.length < 8) {
      setPasswordStrength(0); // 8 karakterden kısa şifre direkt Zayıf
      return;
    }
    
    let strength = 0;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if ((hasLowerCase && hasUpperCase) || (hasNumbers && hasSpecialChars)) strength += 1;
    if ((hasLowerCase || hasUpperCase) && hasNumbers && hasSpecialChars) strength += 1;
    
    setPasswordStrength(Math.min(strength, 2));
  }, [password]);

  // E-posta ve kullanıcı adı validasyonu için regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/; // 3-15 karakter, sadece harf, rakam ve alt çizgi

  // Sağa kaydırma ile geri dönüş için
  useEffect(() => {
    router.setParams({
      gestureEnabled: 'true',
      gestureDirection: 'horizontal'
    });
  }, []);

  const handleConfirmDate = () => {
    // Yeni bir tarih oluştur
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    setBirthDate(newDate);
    
    // Modal'ı kapat
    setShowDatePicker(false);
  };
  
  const handleRegister = async () => {
    try {
      if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !gender || !birthDate) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
        return;
      }

      if (!birthDate || isNaN(birthDate.getTime())) {
        Alert.alert('Hata', 'Geçerli bir doğum tarihi seçmelisiniz.');
        return;
      }

      if (!emailRegex.test(email)) {
        Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
        return;
      }

      if (!usernameRegex.test(username)) {
        Alert.alert('Hata', 'Kullanıcı adı 3-15 karakter arasında olmalı ve yalnızca harf, rakam, alt çizgi içermelidir.');
        return;
      }

      if (!passwordMatch) {
        Alert.alert('Hata', 'Şifreler eşleşmiyor.');
        return;
      }

      setLoading(true);
      showLoading('Kayıt yapılıyor...');
      
      const formattedBirthDate = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
      console.log("Formatted BirthDate:", formattedBirthDate); // Debug için

      const registerData = {
        username,
        email,
        firstName,
        lastName,
        birthDate: formattedBirthDate,
        password,
        gender
      };

      await authApi.register(registerData);
      hideLoading();
      Alert.alert('Başarılı', 'Kaydınız başarıyla tamamlandı. Giriş yapabilirsiniz.');
      router.replace({
        pathname: '/(auth)/login-music',
        params: { email: email }
      });
      
    } catch (error: any) {
      hideLoading();
      if (error.response?.data?.error) {
        Alert.alert('Hata', error.response.data.error);
      } else {
        Alert.alert('Hata', 'Kayıt işlemi sırasında bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Şifre güvenliği rengi
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return '#FF6B6B'; // Zayıf: Kırmızı
      case 1: return '#FFD700'; // Orta: Sarı
      case 2: return '#66BB6A'; // Güçlü: Yeşil
      default: return '#FF6B6B';
    }
  };
  
  // Şifre güvenliği metni
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Zayıf';
      case 1: return 'Orta';
      case 2: return 'Güçlü';
      default: return 'Zayıf';
    }
  };

  // Platform özelliklerini belirle
  const isAndroid = Platform.OS === 'android';

  return (
    <KeyboardAvoidingView 
      behavior={isAndroid ? 'height' : 'padding'}
      keyboardVerticalOffset={isAndroid ? 100 : 0}
      style={styles.container}
    >
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1DB954', '#1E7E34', '#145A24']}
        style={styles.background}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Başlık */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Kayıt Ol</Text>
          <Text style={styles.headerSubText}>Müzik Zevki Modu</Text>
        </View>
        
        {/* Form Container */}
        {!isAndroid && Platform.OS === 'ios' ? (
          <BlurView intensity={20} style={styles.formContainer}>
            {/* Form içeriği iOS için */}
            {renderFormContent()}
          </BlurView>
        ) : (
          <View style={[styles.formContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
            {/* Form içeriği Android için */}
            {renderFormContent()}
          </View>
        )}
      </ScrollView>
      
      {/* Tarih Seçici Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Doğum Tarihi Seçin</Text>
            
            <View style={styles.dateSelectors}>
              {/* Gün seçimi */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Gün</Text>
                <ScrollView 
                  style={styles.datePickerScroll} 
                  showsVerticalScrollIndicator={false}
                >
                  {daysInMonth.map(day => (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.datePickerItem,
                        selectedDay === day && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text 
                        style={[
                          styles.datePickerItemText,
                          selectedDay === day && styles.datePickerItemTextSelected
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Ay seçimi */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Ay</Text>
                <ScrollView 
                  style={styles.datePickerScroll} 
                  showsVerticalScrollIndicator={false}
                >
                  {MONTHS.map(month => (
                    <TouchableOpacity
                      key={`month-${month.value}`}
                      style={[
                        styles.datePickerItem,
                        selectedMonth === month.value && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <Text 
                        style={[
                          styles.datePickerItemText,
                          selectedMonth === month.value && styles.datePickerItemTextSelected
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Yıl seçimi */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Yıl</Text>
                <ScrollView 
                  style={styles.datePickerScroll} 
                  showsVerticalScrollIndicator={false}
                >
                  {YEARS.map(year => (
                    <TouchableOpacity
                      key={`year-${year}`}
                      style={[
                        styles.datePickerItem,
                        selectedYear === year && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text 
                        style={[
                          styles.datePickerItemText,
                          selectedYear === year && styles.datePickerItemTextSelected
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmDate}
              >
                <Text style={styles.modalButtonText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Tema Değiştirme Butonu */}
      <TouchableOpacity 
        style={styles.themeToggle}
        activeOpacity={0.7}
        onPress={() => {
          try {
            if (isAndroid) {
              // Android için daha güvenli navigasyon
              router.replace({
                pathname: '/(auth)/register'
              });
            } else {
              // iOS için standart navigasyon
              setTimeout(() => {
                router.replace('/(auth)/register');
              }, 50);
            }
          } catch (error) {
            console.error('Tema değiştirme hatası:', error);
          }
        }}
      >
        <Ionicons name="planet" size={24} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );

  // Form içeriğini render eden iç fonksiyon
  function renderFormContent() {
    return (
      <>
        {/* Temel Bilgiler */}
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ad</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Adınız"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Soyad</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Soyadınız"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Kullanıcı adınız"
            placeholderTextColor="rgba(255,255,255,0.5)"
            autoCapitalize="none"
            textContentType="username"
            autoComplete="username"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta adresiniz"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Doğum Tarihi</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {birthDate.toLocaleDateString('tr-TR')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Şifre</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifreniz"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={!showPassword}
              textContentType="oneTimeCode"
              autoComplete="off"
              passwordRules="minlength: 8;"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              contextMenuHidden={true}
              keyboardType="default"
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color="rgba(255,255,255,0.7)" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Şifre güvenlik göstergesi */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: passwordStrength >= 0 ? getPasswordStrengthColor() : 'rgba(255,255,255,0.1)',
                      width: '32%'
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: passwordStrength >= 1 ? getPasswordStrengthColor() : 'rgba(255,255,255,0.1)',
                      width: '32%'
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: passwordStrength >= 2 ? getPasswordStrengthColor() : 'rgba(255,255,255,0.1)',
                      width: '32%'
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                {getPasswordStrengthText()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Şifre Tekrarı</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                confirmPassword.length > 0 && !passwordMatch && styles.passwordMismatch
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Şifrenizi tekrar girin"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={!showConfirmPassword}
              textContentType="oneTimeCode"
              autoComplete="off"
              passwordRules="minlength: 8;"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              contextMenuHidden={true}
              keyboardType="default"
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color="rgba(255,255,255,0.7)" 
              />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && !passwordMatch && (
            <Text style={styles.errorText}>Şifreler eşleşmiyor</Text>
          )}
        </View>
        
        {/* Cinsiyet Seçimi */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cinsiyet</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  gender === option.value && styles.genderButtonSelected
                ]}
                onPress={() => setGender(option.value as 'MALE' | 'FEMALE' | 'OTHER')}
              >
                <Text 
                  style={[
                    styles.genderButtonText,
                    gender === option.value && styles.genderButtonTextSelected
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Kayıt Ol Butonu */}
        <TouchableOpacity 
          style={[
            styles.registerButton,
            (loading || !firstName || !lastName || !email || !username || !password || !confirmPassword || !passwordMatch) && 
            styles.registerButtonDisabled
          ]}
          onPress={handleRegister}
          disabled={loading || !firstName || !lastName || !email || !username || !password || !confirmPassword || !passwordMatch}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Text>
        </TouchableOpacity>
        
        {(!firstName || !lastName || !email || !username || !password || !confirmPassword || !passwordMatch) && (
          <Text style={styles.helperText}>
            * Tüm alanları eksiksiz doldurun ve şifrelerin eşleştiğinden emin olun.
          </Text>
        )}
        
        {/* Giriş Linki */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity 
            onPress={() => router.replace('/login-music')}
          >
            <Text style={styles.loginLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    marginTop: 60,
    marginBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 5,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '300',
    color: 'white',
    letterSpacing: 1,
  },
  headerSubText: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  formContainer: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 16,
  },
  passwordMismatch: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  eyeButton: {
    padding: 10,
    marginRight: 5,
  },
  strengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 10,
    justifyContent: 'space-between',
  },
  strengthBar: {
    height: 6,
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  genderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  genderButtonText: {
    color: 'white',
    fontSize: 14,
  },
  genderButtonTextSelected: {
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  registerButtonText: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  loginLink: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  themeToggle: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  dateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  helperText: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  // Tarih seçici modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 10,
  },
  datePickerScroll: {
    height: 200,
    width: '100%',
  },
  datePickerItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  datePickerItemSelected: {
    backgroundColor: '#1DB954',
  },
  datePickerItemText: {
    fontSize: 16,
    color: '#555',
  },
  datePickerItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#ddd',
  },
  modalButtonConfirm: {
    backgroundColor: '#1DB954',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
}); 