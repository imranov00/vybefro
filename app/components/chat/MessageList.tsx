import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../services/api';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: number;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  emptyMessage?: string;
  typingUsers?: Set<string>;
  otherUserName?: string;
  hideTime?: boolean;
}

export interface MessageListRef {
  scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
  scrollToEnd: (params?: { animated?: boolean }) => void;
}

const MessageList = forwardRef<MessageListRef, MessageListProps>(({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  onRefresh,
  isRefreshing,
  emptyMessage = "Henüz mesaj yok. İlk mesajı sen gönder! 💬",
  typingUsers,
  otherUserName,
  hideTime = false
}, ref) => {
  const { currentMode } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

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

  // Ref methods'ları expose et
  useImperativeHandle(ref, () => ({
    scrollToOffset: (params) => {
      flatListRef.current?.scrollToOffset(params);
    },
    scrollToEnd: (params) => {
      flatListRef.current?.scrollToEnd(params);
    }
  }));

  // Yeni mesaj geldiğinde scroll'u en alta kaydır
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Son okunmuş mesajın index'ini bul (status === 'READ' olan son mesaj)
  const lastReadMessageIndex = messages.findIndex((msg) => msg.status === 'READ');

  // Kullanıcının son mesajının index'ini bul (eski yöntem - artık kullanılmıyor)
  const lastCurrentUserMsgIndex = messages.findIndex(
    (msg, idx) => Number(msg.sender.id) === Number(currentUserId) &&
      !messages.slice(idx + 1).some(m => Number(m.sender.id) === Number(currentUserId))
  );

  // Mesaj render fonksiyonu
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isCurrentUser = Number(item.sender.id) === Number(currentUserId);
    const previousMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const showAvatar = !previousMessage || 
                      previousMessage.sender.id !== item.sender.id ||
                      item.type === 'SYSTEM';
    // En son okunmuş mesajda read receipt göster (status === 'READ' olan son mesaj)
    const showReadReceipt = isCurrentUser && index === lastReadMessageIndex;
    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
        showReadReceipt={showReadReceipt}
        hideTime={hideTime}
      />
    );
  };

  // Liste ayırıcısı
  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  // Typing indicator render fonksiyonu
  const renderTypingIndicator = () => {
    if (!typingUsers || typingUsers.size === 0) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { backgroundColor: currentTheme.primary }]} />
            <View style={[styles.typingDot, { backgroundColor: currentTheme.primary }]} />
            <View style={[styles.typingDot, { backgroundColor: currentTheme.primary }]} />
          </View>
          <Text style={styles.typingText}>
            {otherUserName || 'Birisi'} yazıyor...
          </Text>
        </View>
      </View>
    );
  };

  // Yükleme göstergesi (daha fazla mesaj için)
  const renderFooter = () => {
    if (!isLoading || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.primary }]}>
          Daha fazla mesaj yükleniyor...
        </Text>
      </View>
    );
  };

  // Boş liste gösterimi
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={styles.emptyText}>Mesajlar yükleniyor...</Text>
        </View>
      );
    }

    return (
      <View style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}>
        <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  // Scroll durumunu takip et
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToBottom(offsetY > 200);
  };

  // En alta kaydır
  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollToBottom(false);
  };

  // Daha fazla mesaj yükle (scroll to top)
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      onLoadMore();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        inverted // En yeni mesajlar altta görünür
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={currentTheme.primary}
            colors={[currentTheme.primary]}
          />
        }
        ItemSeparatorComponent={renderSeparator}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderTypingIndicator}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={messages.length === 0 ? styles.emptyContentContainer : undefined}
      />

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <TouchableOpacity 
          style={[styles.scrollToBottomButton, { backgroundColor: currentTheme.primary }]}
          onPress={scrollToBottom}
        >
          <Ionicons name="chevron-down" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  separator: {
    height: 2,
  },
  
  // Loading footer
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },

  // Scroll to bottom button
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  // Typing indicator
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
