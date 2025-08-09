import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
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
}

export default function MessageInput({ 
  onSendMessage, 
  limitInfo, 
  placeholder = "Mesaj yazın...",
  disabled = false
}: MessageInputProps) {
  const { currentMode } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {/* Limit bilgisi */}
        {limitInfo && !limitInfo.canSendMessage && (
          <View style={[styles.limitInfo, { borderTopColor: currentTheme.primary }]}>
            <Text style={[styles.limitText, { color: currentTheme.primary }]}>
              {formatLimitMessage()}
            </Text>
            {!limitInfo.isPremium && (
              <TouchableOpacity style={styles.premiumButton}>
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
          <View style={[styles.textInputContainer, { borderColor: currentTheme.primary }]}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={!disabled && (limitInfo ? limitInfo.canSendMessage : true)}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            
            {/* Karakter sayısı */}
            {message.length > 400 && (
              <Text style={[styles.charCount, { 
                color: message.length > 480 ? '#FF4757' : '#999' 
              }]}>
                {message.length}/500
              </Text>
            )}
          </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
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
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8000FF',
  },
  premiumButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Input container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
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
