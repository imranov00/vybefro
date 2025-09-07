import { ZodiacSign } from './zodiac';

// Günlük burç yorumları interface'i
export interface DailyZodiacComment {
  day: string;
  comment: string;
  mood: string;
  advice: string;
}

// Her burç için haftalık yorumlar
export const DAILY_ZODIAC_COMMENTS: Record<ZodiacSign, DailyZodiacComment[]> = {
  [ZodiacSign.ARIES]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün enerjiniz dorukta! Yeni projeler için mükemmel bir gün. Cesaretinizi toplayın ve adım atın.',
      mood: 'Enerjik ve kararlı',
      advice: 'Sabırsızlığınızı kontrol edin, acele etmeyin.'
    },
    {
      day: 'Salı',
      comment: 'Liderlik özellikleriniz ön plana çıkacak. Takım çalışmasında öncü olun.',
      mood: 'Lider ruhlu',
      advice: 'Başkalarının fikirlerini de dinleyin.'
    },
    {
      day: 'Çarşamba',
      comment: 'Yaratıcılığınız bugün çok güçlü. Sanatsal aktiviteler için ideal bir gün.',
      mood: 'Yaratıcı ve ilhamlı',
      advice: 'Yeni hobiler deneyebilirsiniz.'
    },
    {
      day: 'Perşembe',
      comment: 'Sosyal ilişkilerinizde pozitif enerji var. Arkadaşlarınızla vakit geçirin.',
      mood: 'Sosyal ve neşeli',
      advice: 'Yeni insanlarla tanışmaya açık olun.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün risk almak için uygun bir gün. Cesur kararlar verebilirsiniz.',
      mood: 'Cesur ve maceracı',
      advice: 'Hesaplı riskler alın, düşünmeden atlamayın.'
    },
    {
      day: 'Cumartesi',
      comment: 'Aile ve sevdiklerinizle kaliteli zaman geçirin. Duygusal bağlarınız güçlenecek.',
      mood: 'Sıcak ve sevecen',
      advice: 'Sevdiklerinize zaman ayırın.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve kendinizi yenileme günü. Spor yaparak enerjinizi dengeleyin.',
      mood: 'Sakin ve huzurlu',
      advice: 'Yarın için planlar yapın.'
    }
  ],
  [ZodiacSign.TAURUS]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün pratik çözümler bulma konusunda çok başarılısınız. Sabırlı yaklaşımınız ödüllendirilecek.',
      mood: 'Sabırlı ve kararlı',
      advice: 'Acele etmeyin, doğru zamanı bekleyin.'
    },
    {
      day: 'Salı',
      comment: 'Maddi konularda şanslısınız. Yatırım yapmak için uygun bir gün.',
      mood: 'Güvenli ve istikrarlı',
      advice: 'Büyük harcamalar yapmadan önce düşünün.'
    },
    {
      day: 'Çarşamba',
      comment: 'Güzellik ve estetik konularında ilham alacaksınız. Sanat ve müzikle ilgilenin.',
      mood: 'Estetik ve zarif',
      advice: 'Kendinize güzel şeyler yapın.'
    },
    {
      day: 'Perşembe',
      comment: 'İlişkilerinizde derinlik arayışındasınız. Samimi sohbetler yapın.',
      mood: 'Derin ve samimi',
      advice: 'Yüzeysel konuşmalardan kaçının.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün çalışma hayatınızda başarılar elde edeceksiniz. Ödüllendirileceksiniz.',
      mood: 'Başarılı ve gururlu',
      advice: 'Başarılarınızı kutlayın.'
    },
    {
      day: 'Cumartesi',
      comment: 'Doğayla iç içe olmak size iyi gelecek. Park yürüyüşü yapın.',
      mood: 'Doğal ve huzurlu',
      advice: 'Şehir gürültüsünden uzaklaşın.'
    },
    {
      day: 'Pazar',
      comment: 'Ev işleri ve düzenleme konularında verimli olacaksınız. Rahat bir ortam yaratın.',
      mood: 'Rahat ve konforlu',
      advice: 'Kendinizi şımartın.'
    }
  ],
  [ZodiacSign.GEMINI]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün iletişim becerileriniz çok güçlü. Önemli konuşmalar yapabilirsiniz.',
      mood: 'Konuşkan ve ikna edici',
      advice: 'Sözlerinizi dikkatli seçin.'
    },
    {
      day: 'Salı',
      comment: 'Yeni bilgiler öğrenmek için mükemmel bir gün. Kitap okuyun veya kurs alın.',
      mood: 'Meraklı ve öğrenmeye açık',
      advice: 'Bilgiyi paylaşmayı unutmayın.'
    },
    {
      day: 'Çarşamba',
      comment: 'Çoklu görev yapma yeteneğiniz bugün ön plana çıkacak. Verimli bir gün.',
      mood: 'Çok yönlü ve aktif',
      advice: 'Dikkatinizi dağıtmayın.'
    },
    {
      day: 'Perşembe',
      comment: 'Sosyal medya ve teknoloji konularında şanslısınız. Yeni bağlantılar kurun.',
      mood: 'Sosyal ve bağlantılı',
      advice: 'Gerçek ilişkileri ihmal etmeyin.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün yaratıcı yazım konusunda ilham alacaksınız. Blog yazın veya günlük tutun.',
      mood: 'Yaratıcı ve ifadeci',
      advice: 'Düşüncelerinizi yazıya dökün.'
    },
    {
      day: 'Cumartesi',
      comment: 'Kardeşleriniz ve yakın arkadaşlarınızla vakit geçirin. Eğlenceli sohbetler yapın.',
      mood: 'Neşeli ve eğlenceli',
      advice: 'Ciddi konulardan uzak durun.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve düşünme günü. Geçmiş haftayı değerlendirin.',
      mood: 'Düşünceli ve analitik',
      advice: 'Gelecek hafta için planlar yapın.'
    }
  ],
  [ZodiacSign.CANCER]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün duygusal sezgileriniz çok güçlü. İç sesinizi dinleyin.',
      mood: 'Sezgisel ve duygusal',
      advice: 'Mantık ve duyguyu dengeleyin.'
    },
    {
      day: 'Salı',
      comment: 'Aile bağlarınız güçlenecek. Anne babanızla konuşun.',
      mood: 'Aile odaklı ve koruyucu',
      advice: 'Geçmiş anıları paylaşın.'
    },
    {
      day: 'Çarşamba',
      comment: 'Ev ve yuva konularında ilham alacaksınız. Dekorasyon yapın.',
      mood: 'Ev odaklı ve yaratıcı',
      advice: 'Rahat bir ortam yaratın.'
    },
    {
      day: 'Perşembe',
      comment: 'Bugün beslenme ve sağlık konularında dikkatli olun. Sağlıklı yemekler yapın.',
      mood: 'Sağlık bilinçli ve besleyici',
      advice: 'Duygusal yeme alışkanlıklarından kaçının.'
    },
    {
      day: 'Cuma',
      comment: 'Yaratıcılığınız bugün çok güçlü. Sanat ve el işleri yapın.',
      mood: 'Yaratıcı ve sanatsal',
      advice: 'Duygularınızı sanatla ifade edin.'
    },
    {
      day: 'Cumartesi',
      comment: 'Sevdiklerinizle kaliteli zaman geçirin. Duygusal bağlarınız güçlenecek.',
      mood: 'Sevecen ve bağlı',
      advice: 'Sevginizi gösterin.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve kendinizi yenileme günü. Banyo yapın ve rahatlayın.',
      mood: 'Sakin ve huzurlu',
      advice: 'Stresten uzak durun.'
    }
  ],
  [ZodiacSign.LEO]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün doğal liderlik özellikleriniz ön plana çıkacak. Öncü olun.',
      mood: 'Lider ruhlu ve gururlu',
      advice: 'Başkalarını da öne çıkarın.'
    },
    {
      day: 'Salı',
      comment: 'Yaratıcılığınız bugün çok güçlü. Sanatsal projeler başlatın.',
      mood: 'Yaratıcı ve ilhamlı',
      advice: 'Yeteneklerinizi sergileyin.'
    },
    {
      day: 'Çarşamba',
      comment: 'Sosyal çevrenizde popüler olacaksınız. Parti ve etkinliklere katılın.',
      mood: 'Sosyal ve popüler',
      advice: 'Dikkat çekmeyi seviyorsunuz ama ölçülü olun.'
    },
    {
      day: 'Perşembe',
      comment: 'Bugün çocuklarla vakit geçirmek size iyi gelecek. Oyun oynayın.',
      mood: 'Çocuksu ve eğlenceli',
      advice: 'Ciddiyeti bir kenara bırakın.'
    },
    {
      day: 'Cuma',
      comment: 'Romantik ilişkilerinizde şanslısınız. Sevgilinizle romantik bir akşam geçirin.',
      mood: 'Romantik ve tutkulu',
      advice: 'Sevginizi büyük jestlerle gösterin.'
    },
    {
      day: 'Cumartesi',
      comment: 'Bugün kendinizi şımartma günü. Alışveriş yapın veya spa\'ya gidin.',
      mood: 'Lüks seven ve kendini seven',
      advice: 'Bütçenizi aşmayın.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve aile zamanı. Sevdiklerinizle kaliteli vakit geçirin.',
      mood: 'Aile odaklı ve sıcak',
      advice: 'Aile bağlarınızı güçlendirin.'
    }
  ],
  [ZodiacSign.VIRGO]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün detaylara odaklanma yeteneğiniz çok güçlü. Mükemmeliyetçi yaklaşımınız ödüllendirilecek.',
      mood: 'Detaycı ve mükemmeliyetçi',
      advice: 'Küçük hataları görmezden gelmeyi öğrenin.'
    },
    {
      day: 'Salı',
      comment: 'Sağlık ve beslenme konularında bilinçli olacaksınız. Sağlıklı alışkanlıklar edinin.',
      mood: 'Sağlık bilinçli ve düzenli',
      advice: 'Aşırı endişelenmeyin.'
    },
    {
      day: 'Çarşamba',
      comment: 'Çalışma hayatınızda verimlilik artacak. Organize olun ve plan yapın.',
      mood: 'Organize ve verimli',
      advice: 'Esnek olmayı da unutmayın.'
    },
    {
      day: 'Perşembe',
      comment: 'Bugün analitik düşünme yeteneğiniz ön plana çıkacak. Problem çözün.',
      mood: 'Analitik ve mantıklı',
      advice: 'Sezgilerinizi de dinleyin.'
    },
    {
      day: 'Cuma',
      comment: 'Yardım etme konusunda çok başarılısınız. Başkalarına destek olun.',
      mood: 'Yardımsever ve hizmetkar',
      advice: 'Kendinizi ihmal etmeyin.'
    },
    {
      day: 'Cumartesi',
      comment: 'Ev temizliği ve düzenleme konularında verimli olacaksınız. Temizlik yapın.',
      mood: 'Temiz ve düzenli',
      advice: 'Aşırı titizlikten kaçının.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve kendinizi yenileme günü. Kitap okuyun veya meditasyon yapın.',
      mood: 'Sakin ve huzurlu',
      advice: 'Zihninizi dinlendirin.'
    }
  ],
  [ZodiacSign.LIBRA]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün denge ve uyum arayışınız çok güçlü. Adil kararlar vereceksiniz.',
      mood: 'Dengeli ve adil',
      advice: 'Karar vermekte zorlanabilirsiniz, acele etmeyin.'
    },
    {
      day: 'Salı',
      comment: 'İlişkilerinizde diplomatik yaklaşımınız ödüllendirilecek. Uzlaşma sağlayın.',
      mood: 'Diplomatik ve uzlaşmacı',
      advice: 'Kendi ihtiyaçlarınızı da unutmayın.'
    },
    {
      day: 'Çarşamba',
      comment: 'Estetik ve güzellik konularında ilham alacaksınız. Sanat galerisi ziyaret edin.',
      mood: 'Estetik ve sanatsal',
      advice: 'Güzelliği hayatınıza dahil edin.'
    },
    {
      day: 'Perşembe',
      comment: 'Bugün sosyal ilişkilerinizde şanslısınız. Yeni arkadaşlıklar kurun.',
      mood: 'Sosyal ve çekici',
      advice: 'Yüzeysel ilişkilerden kaçının.'
    },
    {
      day: 'Cuma',
      comment: 'Romantik ilişkilerinizde uyum artacak. Sevgilinizle romantik bir akşam geçirin.',
      mood: 'Romantik ve uyumlu',
      advice: 'Sevginizi göstermekten çekinmeyin.'
    },
    {
      day: 'Cumartesi',
      comment: 'Bugün alışveriş ve moda konularında şanslısınız. Kendinizi şımartın.',
      mood: 'Şık ve zarif',
      advice: 'Bütçenizi kontrol edin.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve huzur arayışı günü. Doğayla iç içe olun.',
      mood: 'Huzurlu ve sakin',
      advice: 'Stresten uzak durun.'
    }
  ],
  [ZodiacSign.SCORPIO]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün derin sezgileriniz çok güçlü. Gizli gerçekleri keşfedeceksiniz.',
      mood: 'Sezgisel ve derin',
      advice: 'Aşırı şüpheci olmayın.'
    },
    {
      day: 'Salı',
      comment: 'Dönüşüm ve yenilenme konularında şanslısınız. Eski alışkanlıkları bırakın.',
      mood: 'Dönüştürücü ve güçlü',
      advice: 'Değişime direnmeyin.'
    },
    {
      day: 'Çarşamba',
      comment: 'Bugün finansal konularda başarılı olacaksınız. Yatırım yapın.',
      mood: 'Finansal ve stratejik',
      advice: 'Riskleri hesaplayın.'
    },
    {
      day: 'Perşembe',
      comment: 'İlişkilerinizde derinlik arayışındasınız. Samimi sohbetler yapın.',
      mood: 'Derin ve tutkulu',
      advice: 'Aşırı kıskançlıktan kaçının.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün yaratıcılığınız çok güçlü. Sanatsal projeler başlatın.',
      mood: 'Yaratıcı ve ilhamlı',
      advice: 'Duygularınızı sanatla ifade edin.'
    },
    {
      day: 'Cumartesi',
      comment: 'Gizlilik ve özel alan konularında dikkatli olun. Kendi zamanınızı geçirin.',
      mood: 'Özel ve gizli',
      advice: 'Yalnızlığınızı sevin.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve içe dönüş günü. Meditasyon yapın ve kendinizi dinleyin.',
      mood: 'İçe dönük ve huzurlu',
      advice: 'Zihninizi dinlendirin.'
    }
  ],
  [ZodiacSign.SAGITTARIUS]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün özgürlük arayışınız çok güçlü. Yeni maceralara atılın.',
      mood: 'Özgür ruhlu ve maceracı',
      advice: 'Sorumluluklarınızı ihmal etmeyin.'
    },
    {
      day: 'Salı',
      comment: 'Öğrenme ve keşfetme konularında şanslısınız. Yeni bilgiler edinin.',
      mood: 'Meraklı ve öğrenmeye açık',
      advice: 'Bilgiyi paylaşmayı unutmayın.'
    },
    {
      day: 'Çarşamba',
      comment: 'Bugün seyahat ve kültür konularında ilham alacaksınız. Plan yapın.',
      mood: 'Seyahat tutkunu ve kültürlü',
      advice: 'Hayallerinizi gerçekleştirin.'
    },
    {
      day: 'Perşembe',
      comment: 'Felsefe ve maneviyat konularında derinleşeceksiniz. Düşünün.',
      mood: 'Felsefi ve manevi',
      advice: 'Pratik konuları da unutmayın.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün sosyal ilişkilerinizde şanslısınız. Yeni insanlarla tanışın.',
      mood: 'Sosyal ve açık',
      advice: 'Yeni deneyimlere açık olun.'
    },
    {
      day: 'Cumartesi',
      comment: 'Spor ve aktivite konularında enerjik olacaksınız. Hareket edin.',
      mood: 'Enerjik ve aktif',
      advice: 'Aşırı yorulmamaya dikkat edin.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve gelecek planları günü. Hayallerinizi gözden geçirin.',
      mood: 'Hayalperest ve iyimser',
      advice: 'Gerçekçi hedefler koyun.'
    }
  ],
  [ZodiacSign.CAPRICORN]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün disiplin ve çalışma konularında çok başarılısınız. Hedeflerinize odaklanın.',
      mood: 'Disiplinli ve kararlı',
      advice: 'Kendinize çok yüklenmeyin.'
    },
    {
      day: 'Salı',
      comment: 'Kariyer ve başarı konularında şanslısınız. Yükseliş yaşayacaksınız.',
      mood: 'Hırslı ve başarı odaklı',
      advice: 'Başarılarınızı kutlayın.'
    },
    {
      day: 'Çarşamba',
      comment: 'Bugün finansal konularda dikkatli olun. Tasarruf yapın.',
      mood: 'Finansal ve güvenli',
      advice: 'Küçük harcamalardan kaçının.'
    },
    {
      day: 'Perşembe',
      comment: 'Aile ve gelenek konularında güçlü olacaksınız. Aile bağlarınızı güçlendirin.',
      mood: 'Geleneksel ve aile odaklı',
      advice: 'Yeni fikirlere de açık olun.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün sosyal statü konularında ilerleme kaydedeceksiniz. Tanınma yaşayacaksınız.',
      mood: 'Statü odaklı ve gururlu',
      advice: 'Alçakgönüllülüğü unutmayın.'
    },
    {
      day: 'Cumartesi',
      comment: 'Dinlenme ve kendinizi yenileme günü. Doğayla iç içe olun.',
      mood: 'Sakin ve huzurlu',
      advice: 'Çalışmayı bırakın ve dinlenin.'
    },
    {
      day: 'Pazar',
      comment: 'Gelecek planları ve hedefler konusunda düşünün. Strateji geliştirin.',
      mood: 'Planlı ve stratejik',
      advice: 'Esnek olmayı da öğrenin.'
    }
  ],
  [ZodiacSign.AQUARIUS]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün yenilik ve değişim konularında çok güçlüsünüz. Yeni fikirler üretin.',
      mood: 'Yenilikçi ve özgün',
      advice: 'Geleneksel yöntemleri de değerlendirin.'
    },
    {
      day: 'Salı',
      comment: 'Sosyal konular ve arkadaşlık konularında şanslısınız. Grup aktivitelerine katılın.',
      mood: 'Sosyal ve arkadaş canlısı',
      advice: 'Bireysel zamanınızı da koruyun.'
    },
    {
      day: 'Çarşamba',
      comment: 'Bugün teknoloji ve bilim konularında ilham alacaksınız. Araştırma yapın.',
      mood: 'Bilimsel ve teknolojik',
      advice: 'İnsani bağları ihmal etmeyin.'
    },
    {
      day: 'Perşembe',
      comment: 'İnsanlık ve toplumsal konular konusunda duyarlı olacaksınız. Yardım edin.',
      mood: 'İnsancıl ve yardımsever',
      advice: 'Kendi ihtiyaçlarınızı da unutmayın.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün yaratıcılığınız çok güçlü. Sanatsal projeler başlatın.',
      mood: 'Yaratıcı ve ilhamlı',
      advice: 'Yeteneklerinizi sergileyin.'
    },
    {
      day: 'Cumartesi',
      comment: 'Özgürlük ve bağımsızlık konularında dikkatli olun. Kendi kararlarınızı verin.',
      mood: 'Bağımsız ve özgür',
      advice: 'Yardım istemekten çekinmeyin.'
    },
    {
      day: 'Pazar',
      comment: 'Dinlenme ve gelecek vizyonu günü. Hayallerinizi gözden geçirin.',
      mood: 'Vizyoner ve hayalperest',
      advice: 'Pratik adımlar atmayı unutmayın.'
    }
  ],
  [ZodiacSign.PISCES]: [
    {
      day: 'Pazartesi',
      comment: 'Bugün sezgileriniz ve empati yeteneğiniz çok güçlü. Başkalarını anlayın.',
      mood: 'Empatik ve sezgisel',
      advice: 'Kendi sınırlarınızı koruyun.'
    },
    {
      day: 'Salı',
      comment: 'Yaratıcılık ve sanat konularında şanslısınız. Sanatsal aktiviteler yapın.',
      mood: 'Yaratıcı ve sanatsal',
      advice: 'Duygularınızı sanatla ifade edin.'
    },
    {
      day: 'Çarşamba',
      comment: 'Bugün maneviyat ve ruhsallık konularında derinleşeceksiniz. Meditasyon yapın.',
      mood: 'Ruhsal ve manevi',
      advice: 'Pratik konuları da ihmal etmeyin.'
    },
    {
      day: 'Perşembe',
      comment: 'İlişkilerinizde duygusal derinlik artacak. Samimi sohbetler yapın.',
      mood: 'Duygusal ve derin',
      advice: 'Aşırı duygusallıktan kaçının.'
    },
    {
      day: 'Cuma',
      comment: 'Bugün hayal gücünüz çok güçlü. Yaratıcı projeler başlatın.',
      mood: 'Hayalperest ve yaratıcı',
      advice: 'Gerçeklikle bağlantınızı koruyun.'
    },
    {
      day: 'Cumartesi',
      comment: 'Dinlenme ve huzur arayışı günü. Doğayla iç içe olun.',
      mood: 'Huzurlu ve sakin',
      advice: 'Stresten uzak durun.'
    },
    {
      day: 'Pazar',
      comment: 'Geçmiş haftayı değerlendirin ve gelecek için planlar yapın. İç sesinizi dinleyin.',
      mood: 'Düşünceli ve içe dönük',
      advice: 'Kendinizi affedin ve ileriye bakın.'
    }
  ]
};

// Günlük burç yorumu getirme fonksiyonu
export const getDailyZodiacComment = (zodiacSign: ZodiacSign): DailyZodiacComment => {
  const comments = DAILY_ZODIAC_COMMENTS[zodiacSign];
  if (!comments) {
    return {
      day: 'Bilinmiyor',
      comment: 'Burç yorumu bulunamadı.',
      mood: 'Bilinmiyor',
      advice: 'Daha sonra tekrar deneyin.'
    };
  }
  
  // Bugünün gününü al (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
  const today = new Date().getDay();
  
  // Pazartesi'den başlayacak şekilde ayarla (0: Pazartesi, 1: Salı, ..., 6: Pazar)
  const dayIndex = today === 0 ? 6 : today - 1;
  
  return comments[dayIndex];
};

// Günlük burç yorumu getirme fonksiyonu (string zodiac sign ile)
export const getDailyZodiacCommentByString = (zodiacSign: string): DailyZodiacComment => {
  // String'i ZodiacSign enum'una çevir
  const normalizedSign = zodiacSign.toUpperCase() as ZodiacSign;
  
  if (Object.values(ZodiacSign).includes(normalizedSign)) {
    return getDailyZodiacComment(normalizedSign);
  }
  
  // Fallback
  return {
    day: 'Bilinmiyor',
    comment: 'Burç yorumu bulunamadı.',
    mood: 'Bilinmiyor',
    advice: 'Daha sonra tekrar deneyin.'
  };
};

export default {
  DAILY_ZODIAC_COMMENTS,
  getDailyZodiacComment,
  getDailyZodiacCommentByString
};
