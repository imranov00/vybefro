import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ZodiacSign, getZodiacInfo } from '../../types/zodiac';
import { getCompatibility } from '../../types/zodiacCompatibility';
import { getDailyZodiacComment } from '../../types/zodiacDailyComments';

const { width, height } = Dimensions.get('window');

// Burç Detay Modalı
export function ZodiacDetailModal({
  visible,
  zodiac,
  onClose,
  onCompatibilityPress,
}: {
  visible: boolean;
  zodiac: ZodiacSign;
  onClose: () => void;
  onCompatibilityPress: (sign: ZodiacSign) => void;
}) {
  const zodiacInfo = getZodiacInfo(zodiac);
  const dailyComment = getDailyZodiacComment(zodiac);
  
  // Tüm burçlarla uyumluluk
  const allSigns = Object.values(ZodiacSign);
  const compatibilities = allSigns
    .filter(s => s !== zodiac)
    .map(s => ({
      sign: s,
      info: getZodiacInfo(s),
      compatibility: getCompatibility(zodiac, s)
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score)
    .slice(0, 6); // İlk 6 uyumlu burç

  if (!zodiacInfo) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <Animated.View entering={FadeIn.duration(200)} style={modalStyles.container}>
          <LinearGradient
            colors={['#0F0C29', '#302B63', '#24243e']}
            style={modalStyles.gradient}
          >
            {/* Header */}
            <View style={modalStyles.header}>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Ana Kart */}
              <Animated.View entering={FadeInDown.delay(100).duration(300)}>
                <View style={modalStyles.mainCard}>
                  <Text style={modalStyles.mainEmoji}>{zodiacInfo.emoji}</Text>
                  <Text style={modalStyles.mainTitle}>{zodiacInfo.turkishName}</Text>
                  <Text style={modalStyles.mainSubtitle}>
                    {zodiacInfo.element} • {zodiacInfo.planet}
                  </Text>
                  <Text style={modalStyles.description}>{zodiacInfo.description}</Text>
                </View>
              </Animated.View>

              {/* Günlük Yorum */}
              <Animated.View entering={FadeInUp.delay(200).duration(300)} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🔮 Bugün Sizin İçin</Text>
                <View style={modalStyles.card}>
                  <LinearGradient
                    colors={['rgba(138,43,226,0.3)', 'rgba(75,0,130,0.3)']}
                    style={modalStyles.cardGradient}
                  >
                    <Text style={modalStyles.comment}>{dailyComment.comment}</Text>
                    
                    <View style={modalStyles.moodRow}>
                      <Text style={modalStyles.label}>Ruh Hali:</Text>
                      <Text style={modalStyles.value}>{dailyComment.mood}</Text>
                    </View>

                    <View style={modalStyles.adviceBox}>
                      <Text style={modalStyles.adviceIcon}>💡</Text>
                      <Text style={modalStyles.adviceText}>{dailyComment.advice}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* En Uyumlu Burçlar */}
              <Animated.View entering={FadeInUp.delay(300).duration(300)} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>💫 En Uyumlu Burçlar</Text>
                {compatibilities.map((item, index: number) => (
                  <TouchableOpacity
                    key={`${item.sign}-${index}`}
                    style={modalStyles.compatCard}
                    onPress={() => {
                      onClose();
                      onCompatibilityPress(item.sign);
                    }}
                  >
                    <LinearGradient
                      colors={
                        item.compatibility.score >= 85
                          ? ['rgba(34,193,195,0.3)', 'rgba(253,187,45,0.3)']
                          : ['rgba(138,43,226,0.3)', 'rgba(75,0,130,0.3)']
                      }
                      style={modalStyles.compatGradient}
                    >
                      <View style={modalStyles.compatHeader}>
                        <View style={modalStyles.compatLeft}>
                          <Text style={modalStyles.compatEmoji}>{item.info?.emoji}</Text>
                          <View>
                            <Text style={modalStyles.compatName}>{item.info?.turkishName}</Text>
                            <Text style={modalStyles.compatElement}>{item.info?.element}</Text>
                          </View>
                        </View>
                        <Text style={[modalStyles.compatScore, { color: getScoreColor(item.compatibility.score) }]}>
                          {item.compatibility.score}%
                        </Text>
                      </View>
                      <Text style={modalStyles.compatSummary} numberOfLines={2}>
                        {item.compatibility.summary}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </Animated.View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Kategori Detay Modalı
export function CategoryDetailModal({
  visible,
  category,
  zodiac,
  score,
  onClose,
}: {
  visible: boolean;
  category: 'love' | 'career' | 'health' | 'creativity';
  zodiac: ZodiacSign;
  score: number;
  onClose: () => void;
}) {
  const zodiacInfo = getZodiacInfo(zodiac);
  
  const categoryInfo = {
    love: {
      icon: '💕',
      title: 'Aşk & İlişkiler',
      color: ['#FF1493', '#FF69B4'],
      description: 'Bugün aşk hayatınızda heyecan verici gelişmeler olabilir. Romantik enerjiniz yüksek! Venüs\'ün etkisiyle duygusal derinliğiniz artmış durumda. İlişkinize yeni bir soluk getirebilir veya yeni bir aşka adım atabilirsiniz.',
      tips: [
        'Partnerinizle kaliteli vakit geçirin - telefonları bir kenara bırakın ve birbirinize odaklanın',
        'Samimi ve dürüst bir konuşma başlatın - içinizde biriken duyguları paylaşmanın zamanı geldi',
        'Küçük jestlerle sevginizi gösterin - sabah kahvesi, el yazısı not, beklenmedik bir hediye',
        'Romantik bir sürpriz planlayın - akşam yemeği, piknik veya özel bir gezinti',
        'Geçmiş sorunları artık geride bırakın - affetmek ve ilerlemek için mükemmel bir gün',
        'Partnerinizin hobilerine ilgi gösterin - onun dünyasına katılmak bağınızı güçlendirir',
        'Bekar iseniz sosyal aktivitelere katılın - yeni tanışmalara açık olun, kader şaşırtabilir',
        'Kendinize de romantizm gösterin - self-care aşkın ilk adımıdır',
        'İlişkinizde sınırlarınızı net ifade edin - sağlıklı ilişki karşılıklı saygı gerektirir',
        'Eski aşklardan gelen mesajlara dikkat - geçmiş bazen geri dönebilir ama ileriye bakmak daha önemli'
      ],
      advice: 'Aşk bir denge sanatıdır. Hem vermeyi hem almayı bilin. Kendinizi kaybetmeden sevmeyi öğrenin. Bugün, partnerinizle ya da kendinizle olan ilişkinizi güçlendirmek için mükemmel bir fırsat.'
    },
    career: {
      icon: '💼',
      title: 'Kariyer & İş',
      color: ['#4169E1', '#1E90FF'],
      description: 'Profesyonel hayatınızda önemli fırsatlar kapınızı çalabilir. Hazır olun! Merkür ve Jüpiter\'in uyumlu açısı, kariyerinizde büyüme ve gelişme için ideal bir enerji yaratıyor. Liderlik nitelikleriniz öne çıkacak.',
      tips: [
        'Kısa ve uzun vadeli hedeflerinizi yazıya dökün - görselleştirmek başarının ilk adımı',
        'Yöneticinizle bir görüşme talep edin - terfi veya yeni projeler için kendinizi ifade edin',
        'Networking etkinliklerine katılın - profesyonel bağlantılarınızı genişletin',
        'LinkedIn profilinizi güncelleyin - dijital varlığınız önemli fırsatlar getirebilir',
        'Yeni bir beceri öğrenmeye başlayın - online kurs, sertifika programı veya workshop',
        'Ekip çalışmasına önem verin - başarı tek başına gelmez, iş birliği gücü çoğaltır',
        'Masanızı ve çalışma alanınızı düzenleyin - fiziksel düzen zihinsel netlik getirir',
        'Zorlu bir projeyi üstlenin - konfor alanınızdan çıkmak sizi büyütür',
        'Mentörlük arayın veya verin - bilgi paylaşımı karşılıklı büyüme sağlar',
        'İş-yaşam dengesini koruyun - sürdürülebilir başarı dinlenmiş bir zihinle gelir'
      ],
      advice: 'Kariyer bir maraton, sprint değil. Sabırlı olun, kararlı kalın ve her gün küçük adımlar atın. Bugün attığınız adım, yarının büyük başarısının temelidir. Kendinize ve sürecinize güvenin.'
    },
    health: {
      icon: '💪',
      title: 'Sağlık & Enerji',
      color: ['#32CD32', '#00FA9A'],
      description: 'Fiziksel ve mental enerjiniz dengede. Bunu korumak için özenli olun. Ay ve Mars\'ın etkileşimi, vitalite seviyenizi artırırken dinlenmeye de dikkat etmenizi gerektiriyor. Beden ve zihin uyumu çok önemli.',
      tips: [
        'Sabah güneş ışığına çıkın - 10-15 dakika doğal ışık D vitamini ve morali yükseltir',
        'En az 30 dakika aktif hareket - yürüyüş, koşu, yoga veya dans, vücudunuz hareket için tasarlandı',
        '8 bardak su için - hidrasyon enerji seviyeniz için kritik, telefonunuza hatırlatıcı kurun',
        '7-9 saat kaliteli uyku - telefonları yatak odasından uzak tutun, düzenli uyku saatleri belirleyin',
        'Meditasyon veya derin nefes egzersizleri - günde 5 dakika bile zihinsel netlik getirir',
        'Sebze ve meyve tüketimini artırın - renkli tabaklar, sağlıklı bedenler yaratır',
        'İşlenmiş gıdalardan kaçının - doğal, tam gıdalar vücudunuzu besler',
        'Düzenli check-up yaptırın - önlem tedaviden iyidir, sağlığınızı takip edin',
        'Sosyal bağlantılarınızı güçlendirin - sevdiklerinizle vakit geçirmek mental sağlık için şart',
        'Ekran süresini sınırlayın - dijital detoks, fiziksel ve zihinsel enerjinizi yeniler'
      ],
      advice: 'Vücudunuz bir tapınaktır. Ona özen gösterin, sinyallerini dinleyin ve ihtiyaçlarını karşılayın. Sağlık, zenginliğin ta kendisidir. Bugün kendiniz için yaptığınız her küçük iyilik, yarının enerjisidir.'
    },
    creativity: {
      icon: '🎨',
      title: 'Yaratıcılık & Hobiler',
      color: ['#FF8C00', '#FFA500'],
      description: 'Yaratıcı enerjiniz zirveye. Sanatsal projelerinize odaklanın! Uranüs ve Neptün\'ün etkisiyle hayal gücünüz olağanüstü aktif. Özgün fikirleriniz ve sanatsal ifadeniz bugün parlıyor. Kendinizi ifade etme zamanı!',
      tips: [
        'Günlük tutmaya başlayın - sabah sayfaları, düşünce akışınızı serbest bırakır',
        'Yeni bir sanat formu deneyin - resim, müzik, yazı, fotoğrafçılık - sınırlarınızı zorlayın',
        'Doğada zaman geçirin - doğal güzellik yaratıcılığınızı tetikler, ilham verir',
        'Müze, galeri veya tiyatroya gidin - başka sanatçıların eserlerine maruz kalmak size yeni perspektifler kazandırır',
        'Bir DIY projesine başlayın - elleriyle bir şey yaratmak, zihnin rahatlamasını sağlar',
        'Müzik dinleyin veya bir enstrüman çalın - ses dalgaları yaratıcı enerjinizi harekete geçirir',
        'Yaratıcı bir topluluğa katılın - atölye, workshop veya online grup, ilham paylaşımı çok değerlidir',
        'Çocukluktan bir hobinizi yeniden keşfedin - geçmişte sevdiğiniz şeyler hâlâ içinizde',
        'Mükemmeliyetçiliği bırakın - sanat kusursuzluk değil, ifadedir, deneme yanılma sürecinin keyfini çıkarın',
        'Başka disiplinlerden ilham alın - bilim, felsefe, tarih - yaratıcılık sınır tanımaz'
      ],
      advice: 'Yaratıcılık bir kas gibidir - ne kadar çok kullanırsanız o kadar güçlenir. Mükemmel olmaya çalışmayın, özgün olmaya çalışın. En güzel sanat eserleri, cesaretli deneylerden doğar. Bugün, içinizdeki sanatçıyı özgür bırakın.'
    }
  };

  const info = categoryInfo[category];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <Animated.View entering={FadeIn.duration(200)} style={modalStyles.container}>
          <LinearGradient
            colors={['#0F0C29', '#302B63', '#24243e']}
            style={modalStyles.gradient}
          >
            <View style={modalStyles.header}>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Ana Başlık */}
              <Animated.View entering={FadeInDown.delay(100).duration(300)}>
                <View style={modalStyles.categoryHeader}>
                  <Text style={modalStyles.categoryIcon}>{info.icon}</Text>
                  <Text style={modalStyles.categoryTitle}>{info.title}</Text>
                  <Text style={modalStyles.categoryZodiac}>
                    {zodiacInfo?.emoji} {zodiacInfo?.turkishName}
                  </Text>
                </View>

                {/* Skor */}
                <View style={modalStyles.scoreCard}>
                  <LinearGradient
                    colors={[`${info.color[0]}40`, `${info.color[1]}40`]}
                    style={modalStyles.scoreGradient}
                  >
                    <Text style={modalStyles.scoreLabel}>Bugünkü Puanınız</Text>
                    <Text style={[modalStyles.scoreValue, { color: info.color[0] }]}>{score}%</Text>
                    <View style={modalStyles.scoreBar}>
                      <LinearGradient
                        colors={info.color as [string, string]}
                        style={[modalStyles.scoreBarFill, { width: `${score}%` }]}
                      />
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* Açıklama */}
              <Animated.View entering={FadeInUp.delay(200).duration(300)} style={modalStyles.section}>
                <View style={modalStyles.card}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={modalStyles.cardGradient}
                  >
                    <Text style={modalStyles.description}>{info.description}</Text>
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* İpuçları */}
              <Animated.View entering={FadeInUp.delay(300).duration(300)} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>✨ İpuçları</Text>
                {info.tips.map((tip, index) => (
                  <View key={index} style={modalStyles.tipItem}>
                    <View style={modalStyles.tipBullet}>
                      <Text style={modalStyles.tipBulletText}>{index + 1}</Text>
                    </View>
                    <Text style={modalStyles.tipText}>{tip}</Text>
                  </View>
                ))}
              </Animated.View>

              {/* Tavsiye */}
              <Animated.View entering={FadeInUp.delay(400).duration(300)} style={modalStyles.section}>
                <View style={modalStyles.card}>
                  <LinearGradient
                    colors={[`${info.color[0]}30`, `${info.color[1]}30`]}
                    style={modalStyles.cardGradient}
                  >
                    <View style={modalStyles.adviceBox}>
                      <Text style={modalStyles.adviceIcon}>💡</Text>
                      <Text style={modalStyles.adviceText}>{info.advice}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Uyumluluk Detay Modalı
export function CompatibilityDetailModal({
  visible,
  sign1,
  sign2,
  onClose,
}: {
  visible: boolean;
  sign1: ZodiacSign;
  sign2: ZodiacSign;
  onClose: () => void;
}) {
  const info1 = getZodiacInfo(sign1);
  const info2 = getZodiacInfo(sign2);
  const compatibility = getCompatibility(sign1, sign2);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <Animated.View entering={FadeIn.duration(200)} style={modalStyles.container}>
          <LinearGradient
            colors={['#0F0C29', '#302B63', '#24243e']}
            style={modalStyles.gradient}
          >
            <View style={modalStyles.header}>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Başlık */}
              <Animated.View entering={FadeInDown.delay(100).duration(300)}>
                <View style={modalStyles.compatTitleCard}>
                  <View style={modalStyles.compatTitleRow}>
                    <View style={modalStyles.compatSignBox}>
                      <Text style={modalStyles.compatTitleEmoji}>{info1?.emoji}</Text>
                      <Text style={modalStyles.compatTitleName}>{info1?.turkishName}</Text>
                    </View>
                    <Text style={modalStyles.compatVs}>💫</Text>
                    <View style={modalStyles.compatSignBox}>
                      <Text style={modalStyles.compatTitleEmoji}>{info2?.emoji}</Text>
                      <Text style={modalStyles.compatTitleName}>{info2?.turkishName}</Text>
                    </View>
                  </View>
                  
                  <View style={modalStyles.totalScoreBox}>
                    <Text style={modalStyles.totalScoreLabel}>Genel Uyumluluk</Text>
                    <Text style={[modalStyles.totalScoreValue, { color: getScoreColor(compatibility.score) }]}>
                      {compatibility.score}%
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Özet */}
              <Animated.View entering={FadeInUp.delay(200).duration(300)} style={modalStyles.section}>
                <View style={modalStyles.card}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={modalStyles.cardGradient}
                  >
                    <Text style={modalStyles.description}>{compatibility.summary}</Text>
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* Kategori Skorları */}
              <Animated.View entering={FadeInUp.delay(300).duration(300)} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>📊 Detaylı Analiz</Text>
                <View style={modalStyles.scoreGrid}>
                  <ScoreItem icon="💕" label="Aşk" score={compatibility.love} />
                  <ScoreItem icon="🤝" label="Arkadaşlık" score={compatibility.friendship} />
                  <ScoreItem icon="💼" label="Kariyer" score={compatibility.career} />
                  <ScoreItem icon="💬" label="İletişim" score={compatibility.communication} />
                </View>
              </Animated.View>

              {/* Güçlü Yönler */}
              <Animated.View entering={FadeInUp.delay(400).duration(300)} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>✨ Güçlü Yönler</Text>
                <View style={modalStyles.card}>
                  <LinearGradient
                    colors={['rgba(34,193,195,0.2)', 'rgba(253,187,45,0.2)']}
                    style={modalStyles.cardGradient}
                  >
                    {compatibility.strengths.map((strength: string, index: number) => (
                      <View key={index} style={modalStyles.listItem}>
                        <Text style={modalStyles.listBullet}>✓</Text>
                        <Text style={modalStyles.listText}>{strength}</Text>
                      </View>
                    ))}
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* Zorluklar */}
              <Animated.View entering={FadeInUp.delay(500).duration(300)} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>⚠️ Dikkat Edilmesi Gerekenler</Text>
                <View style={modalStyles.card}>
                  <LinearGradient
                    colors={['rgba(255,99,71,0.2)', 'rgba(255,140,0,0.2)']}
                    style={modalStyles.cardGradient}
                  >
                    {compatibility.challenges.map((challenge: string, index: number) => (
                      <View key={index} style={modalStyles.listItem}>
                        <Text style={modalStyles.listBullet}>•</Text>
                        <Text style={modalStyles.listText}>{challenge}</Text>
                      </View>
                    ))}
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* Tavsiye */}
              <Animated.View entering={FadeInUp.delay(600).duration(300)} style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>💡 Uzman Tavsiyesi</Text>
                <View style={modalStyles.card}>
                  <LinearGradient
                    colors={['rgba(138,43,226,0.3)', 'rgba(75,0,130,0.3)']}
                    style={modalStyles.cardGradient}
                  >
                    <View style={modalStyles.adviceBox}>
                      <Text style={modalStyles.adviceIcon}>💫</Text>
                      <Text style={modalStyles.adviceText}>{compatibility.advice}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Yardımcı Bileşenler
function ScoreItem({ icon, label, score }: { icon: string; label: string; score: number }) {
  return (
    <View style={modalStyles.scoreItem}>
      <Text style={modalStyles.scoreItemIcon}>{icon}</Text>
      <Text style={modalStyles.scoreItemLabel}>{label}</Text>
      <Text style={[modalStyles.scoreItemValue, { color: getScoreColor(score) }]}>{score}%</Text>
      <View style={modalStyles.scoreItemBar}>
        <View 
          style={[
            modalStyles.scoreItemBarFill, 
            { width: `${score}%`, backgroundColor: getScoreColor(score) }
          ]} 
        />
      </View>
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#00FF88';
  if (score >= 70) return '#FFD700';
  if (score >= 50) return '#FFA500';
  return '#FF6B6B';
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.9,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 30,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    textAlign: 'center',
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
  cardGradient: {
    padding: 20,
  },
  comment: {
    fontSize: 15,
    color: 'white',
    lineHeight: 22,
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  adviceIcon: {
    fontSize: 20,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  compatCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  compatGradient: {
    padding: 16,
  },
  compatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  compatEmoji: {
    fontSize: 32,
  },
  compatName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  compatElement: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  compatScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  compatSummary: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  categoryZodiac: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  scoreCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  scoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  tipBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBulletText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  compatTitleCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  compatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 20,
  },
  compatSignBox: {
    alignItems: 'center',
  },
  compatTitleEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  compatTitleName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  compatVs: {
    fontSize: 32,
  },
  totalScoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
    minWidth: 200,
  },
  totalScoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  totalScoreValue: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreItem: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 16,
  },
  scoreItemIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  scoreItemLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  scoreItemValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreItemBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreItemBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  listBullet: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
});
