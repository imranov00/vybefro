import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardEvent,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { MessageLimitInfo } from '../../services/api';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
  limitInfo: MessageLimitInfo | null;
  placeholder?: string;
  disabled?: boolean;
  chatRoomId?: number;
  onTypingChange?: (isTyping: boolean) => void;
  showPremiumNotice?: boolean;
}

export default function MessageInput({ 
  onSendMessage, 
  limitInfo, 
  placeholder = "Mesaj yazın...",
  disabled = false,
  chatRoomId,
  onTypingChange,
  showPremiumNotice = false
}: MessageInputProps) {
  const { currentMode } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tema renklerini belirle
  const theme = {
    astrology: {
      primary: '#8000FF',
      secondary: '#5B00B5',
      accent: '#FFD700',
      gradient: ['#8000FF', '#5B00B5']
    },
    music: {
      primary: '#1DB954',
      secondary: '#1ED760', 
      accent: '#FFD700',
      gradient: ['#1DB954', '#1ED760']
    }
  };

  const currentTheme = theme[currentMode];

  // Klavye event listener'ları
  useEffect(() => {
    const keyboardWillShow = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    };

    const keyboardWillHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const keyboardDidShow = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    };

    const keyboardDidHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    if (Platform.OS === 'ios') {
      const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      const hideSubscription = Keyboard.addListener('keyboardWillHide', keyboardWillHide);
      
      return () => {
        showSubscription?.remove();
        hideSubscription?.remove();
      };
    } else {
      const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
      const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
      
      return () => {
        showSubscription?.remove();
        hideSubscription?.remove();
      };
    }
  }, []);

  // Input focus yönetimi
  const focusInput = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  };

  const blurInput = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Typing indicator yönetimi
  const handleTypingChange = (typing: boolean) => {
    if (isTyping !== typing) {
      setIsTyping(typing);
      onTypingChange?.(typing);
    }
  };

  // Text input değişiklik handler'ı
  const handleTextChange = (text: string) => {
    setMessage(text);
    
    // Typing indicator'ı başlat
    if (text.length > 0) {
      handleTypingChange(true);
    }
    
    // Typing timeout'u sıfırla
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 1.5 saniye sonra typing'i durdur
    typingTimeoutRef.current = setTimeout(() => {
      if (text.length === 0) {
        handleTypingChange(false);
      }
    }, 1500);
  };

  // Component unmount'ta timeout'u temizle
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Premium sayfasına yönlendirme
  const handlePremiumPress = () => {
    console.log('👑 [MESSAGE INPUT] Premium butonuna tıklandı');
    router.push('/(profile)/premiumScreen');
  };

  // Mesaj gönderme - Optimistic Update ile
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    
    console.log('📤 [MESSAGE INPUT] handleSendMessage çağrıldı:', {
      hasMessage: !!trimmedMessage,
      isSending,
      disabled,
      limitInfo: limitInfo ? {
        canSendMessage: limitInfo.canSendMessage,
        remainingSeconds: limitInfo.remainingSeconds
      } : 'null'
    });
    
    if (!trimmedMessage || isSending || disabled) {
      console.log('⚠️ [MESSAGE INPUT] Mesaj gönderme engellendi: temel kontroller');
      return;
    }

    // Limit kontrolü
    if (limitInfo && limitInfo.canSendMessage === false) {
      console.log('⏰ [MESSAGE INPUT] Mesaj limiti aktif, gönderme engellendi');
      return;
    }

    try {
      setIsSending(true);
      
      // Animasyon
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Optimistic Update: Mesajı hemen gönder ve input'u temizle
      const success = await onSendMessage(trimmedMessage);
      
      if (success) {
        // Mesaj başarıyla gönderildi (optimistic update sayesinde hemen görünür)
        setMessage('');
        // Mesaj gönderildikten sonra typing'i durdur
        handleTypingChange(false);
        // Klavyeyi kapatma - kullanıcı manuel olarak kapatacak
        // blurInput(); // Bu satırı kaldırdık
        
        console.log('✅ [MESSAGE INPUT] Mesaj gönderildi (optimistic update)');
      } else {
        // Hata durumunda mesaj input'ta kalır (kullanıcı tekrar deneyebilir)
        console.log('❌ [MESSAGE INPUT] Mesaj gönderilemedi, input temizlenmedi');
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      // Hata durumunda mesaj input'ta kalır
    } finally {
      setIsSending(false);
    }
  };

  // Gönder butonu aktiflik durumu
  const canSendMessage = () => {
    const hasMessage = message.trim().length > 0;
    const notSending = !isSending;
    const notDisabled = !disabled;
    const canSend = limitInfo ? (limitInfo.canSendMessage !== false) : true;
    
    return hasMessage && notSending && notDisabled && canSend;
  };

  // Limit mesajını formatla
  const formatLimitMessage = () => {
    if (!limitInfo) return '';
    
    if (limitInfo.isBanned) {
      return `🚫 ${limitInfo.message}`;
    }
    
    if (!limitInfo.canSendMessage && !limitInfo.isPremium) {
      return `⏰ ${limitInfo.message}`;
    }
    
    if (limitInfo.isPremium) {
      return '👑 Premium - Sınırsız mesaj';
    }
    
    return '';
  };

  return (
    <View style={[styles.container, { paddingBottom: isKeyboardVisible ? 0 : Platform.OS === 'ios' ? 34 : 12 }]}>
      {/* Limit bilgisi - Premium kullanıcılara gösterme */}
      {limitInfo && !limitInfo.canSendMessage && !userProfile?.isPremium && (
        <View style={[styles.limitInfo, { borderTopColor: currentTheme.primary }]}>
          <Text style={[styles.limitText, { color: currentTheme.primary }]}>
            {formatLimitMessage()}
          </Text>
          {!limitInfo.isPremium && (
            <TouchableOpacity 
              style={styles.premiumButton}
              onPress={handlePremiumPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.premiumButtonText, { color: currentTheme.primary }]}>
                Premium Ol
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Premium olmayan kullanıcılara özel mesaj - input kapalıyken */}
      {showPremiumNotice && limitInfo && !limitInfo.canSendMessage && !userProfile?.isPremium && (
        <View style={[styles.premiumNoticeContainer, { backgroundColor: `${currentTheme.primary}15` }]}>
          <Ionicons name="star" size={24} color={currentTheme.primary} style={styles.premiumNoticeIcon} />
          <View style={styles.premiumNoticeContent}>
            <Text style={[styles.premiumNoticeTitle, { color: currentTheme.primary }]}>
              Sınırsız Mesajlar İçin Premium'a Geçin
            </Text>
            <Text style={styles.premiumNoticeSubtitle}>
              Genel sohbette sadece bir mesaj gönderebilirsiniz. Premium olarak sınırsız mesaj gönderin ve tüm özelliklerin kilidini açın!
            </Text>
          </View>
        </View>
      )}

      {/* Input container */}
      <View style={styles.inputContainer}>
        {/* Text input */}
        <TouchableOpacity 
          style={[styles.textInputContainer, { borderColor: currentTheme.primary }]}
          onPress={focusInput}
          activeOpacity={0.8}
        >
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={message}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
            editable={!disabled && (limitInfo ? limitInfo.canSendMessage : true)}
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
            returnKeyType="send"
            enablesReturnKeyAutomatically={true}
            textAlignVertical="center"
            autoCorrect={false}
            autoCapitalize="sentences"
            keyboardType="default"
            keyboardAppearance={Platform.OS === 'ios' ? 'dark' : 'default'}
          />
          
          {/* Karakter sayısı */}
          {message.length > 400 && (
            <Text style={[styles.charCount, { 
              color: message.length > 480 ? '#FF4757' : '#999' 
            }]}>
              {message.length}/500
            </Text>
          )}
        </TouchableOpacity>

        {/* Send button */}
        <Animated.View style={[styles.sendButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !canSendMessage() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!canSendMessage()}
          >
            {canSendMessage() && !isSending ? (
              <LinearGradient
                colors={currentTheme.gradient as any}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="send" size={20} color="white" />
              </LinearGradient>
            ) : (
              <View style={[styles.sendButtonGradient, styles.sendButtonDisabledBg]}>
                <Ionicons 
                  name={isSending ? "hourglass" : "send"} 
                  size={20} 
                  color="#999" 
                />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  
  // Premium notice
  premiumNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  premiumNoticeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  premiumNoticeContent: {
    flex: 1,
  },
  premiumNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumNoticeSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  
  // Limit bilgisi
  limitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(128, 0, 255, 0.05)',
    borderTopWidth: 2,
  },
  limitText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  premiumButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#8000FF',
    backgroundColor: 'rgba(128, 0, 255, 0.05)',
    shadowColor: '#8000FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Input container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInputContainer: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F8F8F8',
    minHeight: 44,
    maxHeight: 120,
    position: 'relative',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    maxHeight: 80,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  charCount: {
    position: 'absolute',
    bottom: 4,
    right: 12,
    fontSize: 10,
    fontWeight: '500',
  },

  // Send button
  sendButtonContainer: {
    marginBottom: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonDisabledBg: {
    backgroundColor: '#E5E5E5',
  },
});
