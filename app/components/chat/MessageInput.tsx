import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MessageLimitInfo } from '../../services/api';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
  limitInfo: MessageLimitInfo | null;
  placeholder?: string;
  disabled?: boolean;
  chatRoomId?: number;
  onTypingChange?: (isTyping: boolean) => void;
}

export default function MessageInput({ 
  onSendMessage, 
  limitInfo, 
  placeholder = "Mesaj yazın...",
  disabled = false,
  chatRoomId,
  onTypingChange
}: MessageInputProps) {
  const { currentMode } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
    if (text.length > 0 && !isTyping) {
      handleTypingChange(true);
    }
    
    // Typing timeout'u sıfırla
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 3 saniye sonra typing'i durdur
    typingTimeoutRef.current = setTimeout(() => {
      if (message.length === 0) {
        handleTypingChange(false);
      }
    }, 3000);
  };

  // Klavye event listener'ları
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
        // Klavye açıldığında input'u focus'la
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
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

  // Mesaj gönderme
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

      const success = await onSendMessage(trimmedMessage);
      
      if (success) {
        setMessage('');
        inputRef.current?.blur();
        // Mesaj gönderildikten sonra typing'i durdur
        handleTypingChange(false);
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={[
        styles.container,
        isKeyboardVisible && Platform.OS === 'android' && { paddingBottom: keyboardHeight }
      ]}>
        {/* Limit bilgisi */}
        {limitInfo && !limitInfo.canSendMessage && (
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

        {/* Input container */}
        <View style={styles.inputContainer}>
          {/* Text input */}
          <TouchableOpacity 
            style={[styles.textInputContainer, { borderColor: currentTheme.primary }]}
            onPress={() => {
              console.log('📱 [MESSAGE INPUT] Container pressed, focusing input');
              inputRef.current?.focus();
            }}
            activeOpacity={1}
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
              returnKeyType="default"
              autoCapitalize="sentences"
              autoCorrect={true}
              spellCheck={Platform.OS === 'ios'}
              keyboardType="default"
              textContentType="none"
              autoComplete="off"
              importantForAccessibility="yes"
              accessible={true}
              accessibilityLabel="Mesaj yazma alanı"
              enablesReturnKeyAutomatically={true}
              onFocus={() => {
                console.log('📱 [MESSAGE INPUT] TextInput focused');
              }}
              onBlur={() => {
                console.log('📱 [MESSAGE INPUT] TextInput blurred');
              }}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  container: {
    backgroundColor: 'white',
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
    alignItems: Platform.OS === 'ios' ? 'flex-end' : 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 10 : 12,
  },
  textInputContainer: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    marginRight: 8,
    backgroundColor: '#F8F8F8',
    minHeight: Platform.OS === 'ios' ? 44 : 40,
    maxHeight: 120,
    position: 'relative',
    justifyContent: Platform.OS === 'ios' ? 'center' : 'flex-start',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    maxHeight: 80,
    minHeight: Platform.OS === 'ios' ? 28 : 24,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: 0,
    textAlignVertical: Platform.OS === 'android' ? 'center' : 'top',
    lineHeight: Platform.OS === 'ios' ? 20 : 20,
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
