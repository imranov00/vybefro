import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface ChatActionModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  onViewProfile: () => void;
  onBlock: () => void;
  onUnmatch: () => void;
  isLoading: boolean;
  themeColors: {
    primary: string;
    gradient: readonly [string, string, string];
  };
}

export default function ChatActionModal({
  visible,
  onClose,
  userName,
  onViewProfile,
  onBlock,
  onUnmatch,
  isLoading,
  themeColors
}: ChatActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'fade' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={['rgba(20, 15, 35, 0.98)', 'rgba(40, 25, 60, 0.98)']}
            style={styles.modalContent}
          >
            {/* Üst kısım - Kullanıcı bilgisi */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <LinearGradient
                  colors={themeColors.gradient as any}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person" size={24} color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.subtitle}>İşlem seçin</Text>
            </View>

            {/* Aksiyon butonları */}
            <View style={styles.actionsContainer}>
              {/* Profili Görüntüle butonu */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onViewProfile}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(128, 0, 255, 0.15)', 'rgba(59, 0, 181, 0.25)']}
                  style={styles.actionButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionButtonContent}>
                    <View style={styles.actionIconContainer}>
                      <Ionicons name="person-circle-outline" size={28} color={themeColors.primary} />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Profili Görüntüle</Text>
                      <Text style={styles.actionDescription}>
                        Kullanıcının profil sayfasına git
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Unmatch butonu */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onUnmatch}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(255, 107, 107, 0.15)', 'rgba(255, 107, 107, 0.25)']}
                  style={styles.actionButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionButtonContent}>
                    <View style={styles.actionIconContainer}>
                      <Ionicons name="close-circle-outline" size={28} color="#FF6B6B" />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Sohbeti Bitir</Text>
                      <Text style={styles.actionDescription}>
                        Eşleşme kaldırılır ve sohbet sonlanır
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Block butonu */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onBlock}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(139, 0, 0, 0.15)', 'rgba(139, 0, 0, 0.25)']}
                  style={styles.actionButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionButtonContent}>
                    <View style={styles.actionIconContainer}>
                      <Ionicons name="ban-outline" size={28} color="#DC143C" />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionTitle}>Engelle</Text>
                      <Text style={styles.actionDescription}>
                        Kullanıcı engellenir ve mesajlaşma kapanır
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* İptal butonu */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={themeColors.gradient as any}
                style={styles.cancelButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          {/* iOS tarzı kapatma çubuğu */}
          {Platform.OS === 'ios' && (
            <View style={styles.handleBar} />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  modalContainer: {
    width: '100%',
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        width: width * 0.9,
        maxWidth: 450,
        borderRadius: 20,
        overflow: 'hidden',
      },
      android: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
      },
    }),
  },
  modalContent: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 34,
    ...Platform.select({
      ios: {
        borderRadius: 20,
      },
    }),
  },
  handleBar: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButtonGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  actionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  cancelButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  cancelButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
