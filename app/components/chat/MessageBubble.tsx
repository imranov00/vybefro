import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../services/api';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  onPress?: () => void;
  showReadReceipt?: boolean;
  hideTime?: boolean;
}

export default function MessageBubble({ 
  message, 
  isCurrentUser, 
  showAvatar = true, 
  onPress, 
  showReadReceipt = false,
  hideTime = false
}: MessageBubbleProps) {
  const { currentMode } = useAuth();
  



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

  // Sistem mesajı kontrolü
  if (message.type === 'SYSTEM') {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>
          {message.content}
        </Text>
      </View>
    );
  }

  // Premium badge gösterimi
  const renderPremiumBadge = () => {
    if (!message.sender.isPremium) return null;
    
    return (
      <View style={styles.premiumBadge}>
        <Text style={styles.premiumBadgeText}>👑</Text>
      </View>
    );
  };

  // Mesaj durumu ikonu
  const renderMessageStatus = () => {
    if (!isCurrentUser) return null;
    if (!showReadReceipt) return null;

    let icon = 'checkmark';
    let color = '#666';
    let tooltip = '';

    switch (message.status) {
      case 'SENT':
        icon = 'checkmark';
        color = '#999';
        tooltip = 'Gönderildi';
        break;
      case 'DELIVERED':
        icon = 'checkmark-done';
        color = '#666';
        tooltip = 'İletildi';
        break;
      case 'READ':
        icon = 'checkmark-done';
        color = currentTheme.primary;
        tooltip = 'Görüldü';
        break;
    }

    return (
      <View style={styles.statusContainer}>
        <Ionicons 
          name={icon as any} 
          size={12} 
          color={color} 
          style={styles.statusIcon} 
        />
        {message.status === 'READ' && (
          <Text style={[styles.statusText, { color: currentTheme.primary }]}>
            Görüldü
          </Text>
        )}
      </View>
    );
  };

  // Zaman formatı
  const formatTime = (timeAgo: string) => {
    if (timeAgo === 'Şimdi') return timeAgo;
    return timeAgo;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Avatar (sadece diğer kullanıcılar için ve sol tarafta) */}
      {!isCurrentUser && showAvatar && (
        <View style={styles.avatarContainer}>
          {message.sender.profileImageUrl ? (
            <Image 
              source={{ uri: message.sender.profileImageUrl }} 
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: currentTheme.secondary }]}>
              <Text style={styles.avatarText}>
                {message.sender.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Online indicator */}
          {message.sender.isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
      )}

      {/* Mesaj içeriği */}
      <View style={[
        styles.messageContent,
        isCurrentUser ? styles.currentUserContent : styles.otherUserContent
      ]}>
        {/* Kullanıcı adı (diğer kullanıcılar için) */}
        {!isCurrentUser && (
          <View style={styles.senderInfo}>
            <LinearGradient
              colors={currentTheme.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.senderNameGradient}
            >
              <Text style={styles.senderName}>
                {message.sender.displayName}
              </Text>
            </LinearGradient>
            {renderPremiumBadge()}
          </View>
        )}

        {/* Mesaj balonu */}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          {isCurrentUser && (
            <LinearGradient
              colors={currentTheme.gradient as any}
              style={styles.currentUserGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.currentUserText}>
                {message.content}
              </Text>
            </LinearGradient>
          )}
          
          {!isCurrentUser && (
            <Text style={styles.otherUserText}>
              {message.content}
            </Text>
          )}
        </View>

        {/* Zaman ve durum */}
        <View style={[
          styles.messageFooter,
          isCurrentUser ? styles.currentUserFooter : styles.otherUserFooter
        ]}>
          {!hideTime && (
            <Text style={styles.timeText}>
              {formatTime(message.timeAgo)}
            </Text>
          )}
          {renderMessageStatus()}
          {message.isEdited && (
            <Text style={styles.editedText}> • düzenlendi</Text>
          )}
        </View>
      </View>

      {/* Avatar (sadece benim mesajlarım için ve sağ tarafta) */}
      {isCurrentUser && showAvatar && (
        <View style={styles.currentUserAvatarContainer}>
          {/* Benim avatarım burada gösterilebilir */}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    width: '100%', // iOS'ta hizalama için tam genişlik
  },
  currentUserContainer: {
    justifyContent: 'flex-end', // Benim mesajlarım sağ tarafta
  },
  otherUserContainer: {
    justifyContent: 'flex-start', // Diğer kullanıcının mesajları sol tarafta
  },
  
  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 20,
  },
  currentUserAvatarContainer: {
    position: 'relative',
    marginLeft: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF7F',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 1, // Avatar'ın üstünde kalması için
  },

  // Mesaj içeriği
  messageContent: {
    maxWidth: '70%', // Mesaj genişliğini sınırla
  },
  currentUserContent: {
    alignItems: 'flex-end', // İçerik sağa hizala
    alignSelf: 'flex-end', // Balonu sağ tarafa konumlandır
  },
  otherUserContent: {
    alignItems: 'flex-start', // İçerik sola hizala
    alignSelf: 'flex-start', // Balonu sol tarafa konumlandır
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderNameGradient: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumBadge: {
    marginLeft: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
  },

  // Mesaj balonu
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  currentUserBubble: {
    backgroundColor: 'transparent', // Gradient kullanacağız
    borderBottomRightRadius: 4, // Sağ alt köşe keskin
  },
  otherUserBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4, // Sol alt köşe keskin
  },
  currentUserGradient: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: -16,
    marginVertical: -10,
  },
  currentUserText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 20,
  },
  otherUserText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 20,
  },

  // Mesaj footer
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUserFooter: {
    justifyContent: 'flex-end', // Sağa hizala
  },
  otherUserFooter: {
    justifyContent: 'flex-start', // Sola hizala
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  editedText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },

  // Sistem mesajı
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemMessageText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
