import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp
} from 'react-native-reanimated';
import { ZodiacSign, getZodiacInfo } from '../types/zodiac';
import { getCategoryScores, getCompatibility } from '../types/zodiacCompatibility';
import { getDailyZodiacComment } from '../types/zodiacDailyComments';

const { width } = Dimensions.get('window');

export default function ZodiacDetailScreen() {
  const router = useRouter();
  const { sign } = useLocalSearchParams<{ sign: string }>();
  
  const zodiacSign = sign as ZodiacSign;
  const zodiacInfo = getZodiacInfo(zodiacSign);
  const dailyComment = getDailyZodiacComment(zodiacSign);
  const categoryScores = getCategoryScores(zodiacSign);

  // Tüm burçlarla uyumluluk
  const allSigns = Object.values(ZodiacSign);
  const compatibilities = allSigns
    .filter(s => s !== zodiacSign)
    .map(s => ({
      sign: s,
      info: getZodiacInfo(s),
      compatibility: getCompatibility(zodiacSign, s)
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);

  if (!zodiacInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243e']}
        style={styles.background}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Burç Detayları</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ana Burç Kartı */}
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.mainCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']}
            style={styles.cardGradient}
          >
            <Text style={styles.mainEmoji}>{zodiacInfo.emoji}</Text>
            <Text style={styles.mainTitle}>{zodiacInfo.turkishName}</Text>
            <Text style={styles.mainSubtitle}>
              {zodiacInfo.element} • {zodiacInfo.planet}
            </Text>
            <Text style={styles.mainDescription}>{zodiacInfo.description}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Günlük Yorum */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Bugün Sizin İçin</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(138,43,226,0.25)', 'rgba(75,0,130,0.25)']}
              style={styles.cardGradient}
            >
              <Text style={styles.dailyComment}>{dailyComment.comment}</Text>
              
              <View style={styles.moodContainer}>
                <View style={styles.moodItem}>
                  <Text style={styles.moodLabel}>Ruh Hali:</Text>
                  <Text style={styles.moodValue}>{dailyComment.mood}</Text>
                </View>
              </View>

              <View style={styles.adviceContainer}>
                <Text style={styles.adviceIcon}>💡</Text>
                <Text style={styles.adviceText}>{dailyComment.advice}</Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Kategori Skorları */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Günlük Enerji Seviyeniz</Text>
          <View style={styles.categoriesGrid}>
            <CategoryCard 
              icon="💕" 
              title="Aşk" 
              score={categoryScores.love}
              color={['#FF1493', '#FF69B4']}
            />
            <CategoryCard 
              icon="💼" 
              title="Kariyer" 
              score={categoryScores.career}
              color={['#4169E1', '#1E90FF']}
            />
            <CategoryCard 
              icon="💪" 
              title="Sağlık" 
              score={categoryScores.health}
              color={['#32CD32', '#00FA9A']}
            />
            <CategoryCard 
              icon="🎨" 
              title="Yaratıcılık" 
              score={categoryScores.creativity}
              color={['#FF8C00', '#FFA500']}
            />
          </View>
        </Animated.View>

        {/* Uyumluluk Listesi */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>💫 Diğer Burçlarla Uyumluluk</Text>
          
          {compatibilities.map((item, index) => (
            <Animated.View 
              key={item.sign}
              entering={FadeInUp.delay(450 + index * 50).duration(300)}
            >
              <TouchableOpacity 
                style={styles.compatibilityCard}
                onPress={() => router.push(`/zodiac-detail/${item.sign}` as any)}
              >
                <LinearGradient
                  colors={
                    item.compatibility.score >= 85 
                      ? ['rgba(34,193,195,0.2)', 'rgba(253,187,45,0.2)']
                      : item.compatibility.score >= 70
                      ? ['rgba(138,43,226,0.2)', 'rgba(75,0,130,0.2)']
                      : ['rgba(100,100,100,0.2)', 'rgba(60,60,60,0.2)']
                  }
                  style={styles.cardGradient}
                >
                  <View style={styles.compatibilityHeader}>
                    <View style={styles.compatibilityLeft}>
                      <Text style={styles.compatibilityEmoji}>{item.info?.emoji}</Text>
                      <View>
                        <Text style={styles.compatibilityName}>{item.info?.turkishName}</Text>
                        <Text style={styles.compatibilityElement}>{item.info?.element}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.compatibilityRight}>
                      <Text style={[
                        styles.compatibilityScore,
                        { color: getScoreColor(item.compatibility.score) }
                      ]}>
                        {item.compatibility.score}%
                      </Text>
                      <View style={styles.scoreBar}>
                        <View 
                          style={[
                            styles.scoreBarFill, 
                            { 
                              width: `${item.compatibility.score}%`,
                              backgroundColor: getScoreColor(item.compatibility.score)
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>

                  {/* Mini kategori skorları */}
                  <View style={styles.miniScores}>
                    <MiniScore icon="💕" value={item.compatibility.love} />
                    <MiniScore icon="🤝" value={item.compatibility.friendship} />
                    <MiniScore icon="💼" value={item.compatibility.career} />
                    <MiniScore icon="💬" value={item.compatibility.communication} />
                  </View>

                  <Text style={styles.compatibilitySummary} numberOfLines={2}>
                    {item.compatibility.summary}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Özellikler */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Temel Özellikler</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.cardGradient}
            >
              <PropertyRow label="Element" value={zodiacInfo.element} icon="🌟" />
              <PropertyRow label="Yönetici Gezegen" value={zodiacInfo.planet} icon="🪐" />
            </LinearGradient>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// Yardımcı Bileşenler
function CategoryCard({ 
  icon, 
  title, 
  score, 
  color 
}: { 
  icon: string; 
  title: string; 
  score: number; 
  color: [string, string];
}) {
  return (
    <View style={styles.categoryCard}>
      <LinearGradient
        colors={[`${color[0]}40`, `${color[1]}40`] as const}
        style={styles.categoryGradient}
      >
        <Text style={styles.categoryIcon}>{icon}</Text>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categoryScore}>{score}%</Text>
        <View style={styles.categoryBar}>
          <LinearGradient
            colors={color}
            style={[styles.categoryBarFill, { width: `${score}%` }]}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

function MiniScore({ icon, value }: { icon: string; value: number }) {
  return (
    <View style={styles.miniScore}>
      <Text style={styles.miniScoreIcon}>{icon}</Text>
      <Text style={styles.miniScoreValue}>{value}</Text>
    </View>
  );
}

function PropertyRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.propertyRow}>
      <View style={styles.propertyLeft}>
        <Text style={styles.propertyIcon}>{icon}</Text>
        <Text style={styles.propertyLabel}>{label}:</Text>
      </View>
      <Text style={styles.propertyValue}>{value}</Text>
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#00FF88';
  if (score >= 70) return '#FFD700';
  if (score >= 50) return '#FFA500';
  return '#FF6B6B';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C29',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  mainCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 20,
  },
  mainEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  mainDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dailyComment: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    marginBottom: 16,
  },
  moodContainer: {
    marginBottom: 16,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 8,
  },
  moodValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  adviceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  adviceIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  categoryBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  compatibilityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compatibilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compatibilityEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  compatibilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  compatibilityElement: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  compatibilityRight: {
    alignItems: 'flex-end',
  },
  compatibilityScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreBar: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  miniScores: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  miniScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniScoreIcon: {
    fontSize: 14,
  },
  miniScoreValue: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  compatibilitySummary: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  propertyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  propertyLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  propertyValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});
