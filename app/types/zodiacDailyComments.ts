import { ZodiacSign } from './zodiac';

// Günlük burç yorumları interface'i
export interface DailyZodiacComment {
  day: string;
  comment: string;
  mood: string;
  advice: string;
}

// Her burç için çok sayıda yorum (rastgele seçilecek)
export const DAILY_ZODIAC_COMMENTS: Record<ZodiacSign, DailyZodiacComment[]> = {
  [ZodiacSign.ARIES]: [
    {
      day: 'Her Gün',
      comment: 'Bugün enerjiniz dorukta! Yeni projeler için mükemmel bir gün. Cesaretinizi toplayın ve adım atın.',
      mood: 'Enerjik ve kararlı',
      advice: 'Sabırsızlığınızı kontrol edin, acele etmeyin.'
    },
    {
      day: 'Her Gün',
      comment: 'Liderlik özellikleriniz ön plana çıkacak. Takım çalışmasında öncü olun ve vizyonunuzu paylaşın.',
      mood: 'Lider ruhlu ve ilham verici',
      advice: 'Başkalarının fikirlerini de dinleyin, tek başınıza değilsiniz.'
    },
    {
      day: 'Her Gün',
      comment: 'Mars enerjisi bugün sizi çok aktif kılacak. Sporun ve fiziksel aktivitelerin keyfini çıkarın.',
      mood: 'Dinamik ve güçlü',
      advice: 'Aşırıya kaçmayın, enerjinizi akıllıca kullanın.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün cesur adımlar atmak için ideal bir zaman. Kalbinizin sesini dinleyin ve harekete geçin.',
      mood: 'Cesur ve kararlı',
      advice: 'Her risk almadan önce bir an durup düşünün.'
    },
    {
      day: 'Her Gün',
      comment: 'Yaratıcı fikirleriniz bugün çok değerli. Yeni projeler başlatmak için harika bir gün.',
      mood: 'Yaratıcı ve yenilikçi',
      advice: 'Fikirlerinizi somut adımlara dönüştürmeyi unutmayın.'
    },
    {
      day: 'Her Gün',
      comment: 'Sosyal çevrenizde fırtınalar estiriyorsunuz! İnsanlar sizi takip etmek istiyor.',
      mood: 'Karizmatik ve çekici',
      advice: 'Gücünüzü iyi yönlerde kullanın, manipülasyon tuzağına düşmeyin.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün sabırsızlık hissedebilirsiniz ama yavaş ilerlemek bazen daha etkilidir.',
      mood: 'Sabırsız ama farkında',
      advice: 'Derin bir nefes alın ve adım adım ilerleyin.'
    },
    {
      day: 'Her Gün',
      comment: 'İş hayatınızda önemli bir atılım yapabilirsiniz. Patronlarınız sizi fark edecek.',
      mood: 'Hırslı ve başarı odaklı',
      advice: 'Ekip çalışmasını ihmal etmeyin, yalnız başarı kalıcı olmaz.'
    },
    {
      day: 'Her Gün',
      comment: 'Aşk hayatınızda tutku dolu anlar sizi bekliyor. Duygularınızı açıkça ifade edin.',
      mood: 'Tutkulu ve romantik',
      advice: 'Partner seçiminde aceleci davranmayın, gerçek bağları fark edin.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün rekabet duygunuz yüksek. Ancak kazanmak her şey değildir, süreçten keyif alın.',
      mood: 'Rekabetçi ve mücadeleci',
      advice: 'Kaybetmeyi öğrenmek, kazanmayı öğrenmek kadar önemlidir.'
    },
    {
      day: 'Her Gün',
      comment: 'Finansal konularda cesur kararlar almanız gerekebilir. Risk alın ama hesaplı olun.',
      mood: 'Girişimci ve cesur',
      advice: 'Tüm yumurtaları aynı sepete koymayın.'
    },
    {
      day: 'Her Gün',
      comment: 'Sağlığınıza dikkat etmeniz gereken bir dönem. Enerjinizi doğru yönlendirin.',
      mood: 'Dikkatli ve bilinçli',
      advice: 'Uyku düzeninize özen gösterin, yorgunluk ani patlamalara yol açabilir.'
    },
    {
      day: 'Her Gün',
      comment: 'Arkadaşlarınızla macera dolu aktiviteler planlayın. Anılar biriktirme zamanı!',
      mood: 'Maceracı ve eğlenceli',
      advice: 'Güvenliği de göz ardı etmeyin, akıllı risk alın.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün kendinize zaman ayırın. İçsel fırtınalarınızı dinlendirmeniz gerekiyor.',
      mood: 'İçe dönük ve düşünceli',
      advice: 'Meditasyon veya yoga deneyin, zihninizi dinlendirin.'
    },
    {
      day: 'Her Gün',
      comment: 'Ailevi konularda sabır göstermeniz gerekecek. Herkesin sizi takip etmesi gerekmiyor.',
      mood: 'Sabırlı ve anlayışlı',
      advice: 'Sevdiklerinize baskı yapmak yerine, onlara ilham olun.'
    },
    {
      day: 'Her Gün',
      comment: 'Eğitim ve öğrenme konularında çok isteklisiniz. Yeni bir beceri öğrenmek için harika bir zaman.',
      mood: 'Öğrenmeye açık ve meraklı',
      advice: 'Sabırsızlıktan dolayı yarım bırakmayın, ustalaşmak zaman ister.'
    },
    {
      day: 'Her Gün',
      comment: 'Seyahat planları yapın! Yeni yerler keşfetmek ruhunuzu besleyecek.',
      mood: 'Gezgin ve özgür ruhlu',
      advice: 'Spontane olmak güzel ama biraz plan da yapın.'
    },
    {
      day: 'Her Gün',
      comment: 'İletişim becerileriniz bugün çok kuvvetli. Önemli görüşmeler yapabilirsiniz.',
      mood: 'İletişim odaklı ve etkili',
      advice: 'Dinlemek, konuşmak kadar önemlidir.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün geçmişle yüzleşme zamanı. Bazı konuları çözmeniz gerekiyor.',
      mood: 'Cesur ve yüzleşen',
      advice: 'Geçmiş geçmişte kalsın, bugüne odaklanın.'
    },
    {
      day: 'Her Gün',
      comment: 'Yaratıcı projelere başlamak için muhteşem bir gün. Hayal gücünüz sınırsız!',
      mood: 'Yaratıcı ve sınırsız',
      advice: 'Fikirlerinizi not alın, sonra hangisini uygulayacağınıza karar verin.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün sürprizlere hazır olun! Beklenmedik olaylar sizi heyecanlandıracak.',
      mood: 'Heyecanlı ve meraklı',
      advice: 'Her sürpriz güzel olmayabilir, soğukkanlılığınızı koruyun.'
    },
    {
      day: 'Her Gün',
      comment: 'İş-yaşam dengenizi gözden geçirin. Kendinize yeterince zaman ayırıyor musunuz?',
      mood: 'Dengeli ve bilinçli',
      advice: 'Sürekli koşturmak sizi yıpratır, ara vermek güçtür.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün eski bir dostla iletişime geçebilirsiniz. Geçmiş anılar canlanacak.',
      mood: 'Nostaljik ve duygusal',
      advice: 'Geçmiş güzeldir ama şimdiye odaklanın.'
    },
    {
      day: 'Her Gün',
      comment: 'Kendinize meydan okuyun! Korkularınızı yenme zamanı geldi.',
      mood: 'Cesur ve güçlü',
      advice: 'Korkuların üstüne gitmek, onları yenmekle aynı şey değildir. Adım adım ilerleyin.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün içsel sezgileriniz çok güçlü. İlk içgüdülerinize güvenin.',
      mood: 'Sezgisel ve içgüdüsel',
      advice: 'Mantık da önemlidir, dengeyi kurun.'
    },
    {
      day: 'Her Gün',
      comment: 'Partnerlik ve işbirliği bugün ön planda. Yalnız başına değil, birlikte güçlüsünüz.',
      mood: 'İşbirlikçi ve uyumlu',
      advice: 'Kontrol etme isteğinizi bırakın, paylaşmayı öğrenin.'
    },
    {
      day: 'Her Gün',
      comment: 'Maddi konularda dikkatli olun. Anlık harcamalar sizi zorlayabilir.',
      mood: 'Dikkatli ve hesaplı',
      advice: 'Bütçe yapın ve ona sadık kalın.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün kendinizi ifade etmek için sanatı kullanın. Müzik, resim, yazı... Ne olursa olsun!',
      mood: 'Sanatsal ve ifade dolu',
      advice: 'Mükemmeliyetçilik sanatın düşmanıdır, serbest bırakın kendinizi.'
    },
    {
      day: 'Her Gün',
      comment: 'Ruhsal gelişiminize odaklanın. Meditasyon veya yoga yaparak iç huzurunuzu bulun.',
      mood: 'Ruhsal ve huzurlu',
      advice: 'Dışarıda aradığınız her şey içinizdedir.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün sınırlarınızı zorlamayın. Bazen geri çekilmek de bir güç gösterisidir.',
      mood: 'Akılcı ve stratejik',
      advice: 'Her savaşı kazanmanız gerekmiyor, savaşı seçmek de bir beceridir.'
    }
  ],
  [ZodiacSign.TAURUS]: [
    {
      day: 'Her Gün',
      comment: 'Bugün pratik çözümler bulma konusunda çok başarılısınız. Sabırlı yaklaşımınız ödüllendirilecek.',
      mood: 'Sabırlı ve kararlı',
      advice: 'Acele etmeyin, doğru zamanı bekleyin.'
    },
    {
      day: 'Her Gün',
      comment: 'Maddi konularda şanslısınız. Yatırım yapmak için uygun bir gün, ancak araştırmanızı iyi yapın.',
      mood: 'Güvenli ve istikrarlı',
      advice: 'Büyük harcamalar yapmadan önce iki kez düşünün ve uzman görüşü alın.'
    },
    {
      day: 'Her Gün',
      comment: 'Güzellik ve estetik konularında ilham alacaksınız. Sanat galerileri ve müzik dinlemek ruhunuzu besleyecek.',
      mood: 'Estetik ve zarif',
      advice: 'Kendinize güzel şeyler yapın, değerinizi bilin.'
    },
    {
      day: 'Her Gün',
      comment: 'Venüs enerjisi bugün sizi çok çekici kılıyor. İlişkilerde derin bağlar kurabilirsiniz.',
      mood: 'Çekici ve karizmatik',
      advice: 'Yüzeysel flörtlerden kaçının, kalıcı bağlara odaklanın.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün doğayla bağ kurmanız şart! Bahçeyle uğraşın ya da doğa yürüyüşü yapın.',
      mood: 'Doğal ve topraklı',
      advice: 'Teknolojiden uzak durun, toprağı hissedin.'
    },
    {
      day: 'Her Gün',
      comment: 'Mutfakta harikalar yaratma zamanı! Yemek pişirmek sizi rahatlatacak.',
      mood: 'Yaratıcı ve tatmin olmuş',
      advice: 'Sevdiklerinizle yaptığınız yemekleri paylaşın.'
    },
    {
      day: 'Her Gün',
      comment: 'İnatçılığınız bugün işe yarayacak. Pes etmeyin, hedeflerinize ulaşacaksınız.',
      mood: 'Kararlı ve sebatkâr',
      advice: 'İnat ile akılcılığı dengeyi kurun, bazen esneklik de gerekir.'
    },
    {
      day: 'Her Gün',
      comment: 'Konfor alanınızda kalmak isteyebilirsiniz ama büyümek için risk almanız gerek.',
      mood: 'Rahat ama bilinçli',
      advice: 'Küçük adımlarla değişime açılın, her şeyi birden değiştirmeyin.'
    },
    {
      day: 'Her Gün',
      comment: 'Finansal planlarınızı gözden geçirin. Uzun vadeli düşünme zamanı!',
      mood: 'Stratejik ve hesaplı',
      advice: 'Acil durumlar için tasarruf yapın, geleceğinizi güvence altına alın.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün sevdiklerinize hediye almak isteyebilirsiniz. Maddi değer değil, manevi değer önemli.',
      mood: 'Cömert ve sevgi dolu',
      advice: 'El emeği göz nuru hediyeler en değerlisidir.'
    },
    {
      day: 'Her Gün',
      comment: 'İşinizde istikrarlı ilerliyorsunuz. Sabırla ördüğünüz ağ sizi zirveye taşıyacak.',
      mood: 'İstikrarlı ve güvenilir',
      advice: 'Başarı bir gecede gelmez, süreklilik şarttır.'
    },
    {
      day: 'Her Gün',
      comment: 'Ev düzenlemesi ve dekorasyon için harika bir gün. Yaşam alanınızı güzelleştirin.',
      mood: 'Ev odaklı ve konforlu',
      advice: 'Minimalizm ve fonksiyonellik önemli, gereksiz eşyadan kurtulun.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün değişime direnç gösterebilirsiniz ama yeniliklere açık olun.',
      mood: 'Muhafazakâr ama esnek',
      advice: 'Eski alışkanlıklar her zaman iyi değildir, yeniliklere şans verin.'
    },
    {
      day: 'Her Gün',
      comment: 'Lüks ve konfora düşkünlüğünüz bugün ön planda. Kendinizi ödüllendirin!',
      mood: 'Lüks seven ve rahat',
      advice: 'Paranızı akıllıca harcayın, kalite odaklı olun.'
    },
    {
      day: 'Her Gün',
      comment: 'Sanat eserleri koleksiyonu yapmayı düşünebilirsiniz. Estetik zevkiniz mükemmel.',
      mood: 'Sanatsever ve kültürlü',
      advice: 'Yatırım değeri taşıyan eserleri araştırın.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün fiziksel egzersiz yapmanız gerekiyor. Yoga veya pilates idealdir.',
      mood: 'Bedensel bilinçli',
      advice: 'Vücudunuzu dinleyin, aşırıya kaçmayın.'
    },
    {
      day: 'Her Gün',
      comment: 'Partnerinizle romantik bir akşam planlayın. İlişkinizi besleyin.',
      mood: 'Romantik ve şefkatli',
      advice: 'Sözler değil eylemler önemlidir, sevginizi gösterin.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün mali konularda ihtiyatlı olun. Gereksiz harcamalardan kaçının.',
      mood: 'Tutumlu ve akıllı',
      advice: 'İhtiyaç mı yoksa istek mi? Kendinize sorun.'
    },
    {
      day: 'Her Gün',
      comment: 'Güzellik rutininize özel zaman ayırın. Kendinizi iyi hissetmek önemli.',
      mood: 'Kendine özen gösteren',
      advice: 'Dışarıdan içeriye güzellik başlar, sağlıklı beslenin.'
    },
    {
      day: 'Her Gün',
      comment: 'Müzik dinlemek bugün ruhunuza ilaç gibi gelecek. Favori şarkılarınızı açın.',
      mood: 'Müziksever ve huzurlu',
      advice: 'Yeni müzik türlerini keşfedin, ufkunuzu genişletin.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün arkadaşlarınızla lezzetli bir yemek yiyin. Sosyalleşme zamanı!',
      mood: 'Sosyal ve keyifli',
      advice: 'Kaliteli vakit geçirmek miktar değil kalitedir.'
    },
    {
      day: 'Her Gün',
      comment: 'Toprak elementiniz size güç veriyor. Bahçıvanlık veya çömlekçilik deneyin.',
      mood: 'Yaratıcı ve topraklı',
      advice: 'Ellerinizle bir şeyler üretmek terapötiktir.'
    },
    {
      day: 'Her Gün',
      comment: 'İş hayatınızda sabır ve kararlılık gösterin. Başarı yakındır.',
      mood: 'Azimli ve odaklanmış',
      advice: 'Kısa vadeli hayal kırıklıkları uzun vadeli başarıyı engellemesin.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün eski eşyalarınızı gözden geçirin. Sadeleşme zamanı geldi.',
      mood: 'Minimalist ve pratik',
      advice: 'Kullanmadığınız şeyleri bağışlayın, başkalarına faydalı olsun.'
    },
    {
      day: 'Her Gün',
      comment: 'Aile büyüklerinizle vakit geçirin. Geleneksel değerler size iyi gelecek.',
      mood: 'Ailevi ve geleneksel',
      advice: 'Büyüklerden öğrenilecek çok şey vardır.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün kendinize bir spa günü hediye edin. Rahatlamayı hak ediyorsunuz.',
      mood: 'Rahatlamış ve bakımlı',
      advice: 'Self-care bencillik değil gereklilikir.'
    },
    {
      day: 'Her Gün',
      comment: 'Yeni bir hobi edinmeyi düşünün. El işleri veya bahçıvanlık sizi mutlu edecek.',
      mood: 'Hobili ve üretken',
      advice: 'Hobileriniz gelir kaynağına da dönüşebilir, düşünün.'
    },
    {
      day: 'Her Gün',
      comment: 'Güvenlik duygunuz bugün çok önemli. Evinizi ve sevdiklerinizi koruyun.',
      mood: 'Koruyucu ve güvenli',
      advice: 'Aşırı korumacılık boğucu olabilir, dengeyi kurun.'
    },
    {
      day: 'Her Gün',
      comment: 'Bugün kırsalda bir kaçış planı yapın. Şehir hayatından uzaklaşın.',
      mood: 'Doğa sevdalısı',
      advice: 'Dijital detoks yapın, telefonunuzu evde bırakın.'
    },
    {
      day: 'Her Gün',
      comment: 'Sevdiğiniz biriyle kaliteli zaman geçirin. Basit anlar en değerlisidir.',
      mood: 'Sevgi dolu ve huzurlu',
      advice: 'Anı biriktirmek maddi şeylerden daha değerlidir.'
    }
  ],
  [ZodiacSign.GEMINI]: [
    { day: 'Her Gün', comment: 'Zihniniz ışık hızında çalışıyor! Fikirlerinizi kaydedin, sonra elemeden geçirin.', mood: 'Hızlı ve meraklı', advice: 'Her fikri aynı gün uygulamak zorunda değilsiniz.' },
    { day: 'Her Gün', comment: 'İletişim bugün en büyük gücünüz. Arayıp sormanız gereken iki kişi var.', mood: 'Sosyal ve konuşkan', advice: 'Dinlemek, konuşmak kadar etkili olabilir.' },
    { day: 'Her Gün', comment: 'Kısa bir yürüyüş zihninizi toplar. Sonra bir oturuşta üç işi bitirebilirsiniz.', mood: 'Dinamik ve üretken', advice: 'Pomodoro tekniği deneyin: 25 dk odak, 5 dk mola.' },
    { day: 'Her Gün', comment: 'Yeni bir dil ya da uygulama keşfetmek için harika bir gün.', mood: 'Öğrenmeye açık', advice: 'Küçük hedef: 15 dakikalık mikro öğrenme.' },
    { day: 'Her Gün', comment: 'İkili doğanız devrede: iki seçenek arasında kalabilirsiniz. Artı-eksi listesi yapın.', mood: 'Kararsız ama analitik', advice: 'Kararı zaman kutusuna bağlayın; süre bitince seçin.' },
    { day: 'Her Gün', comment: 'Sosyal ağınızı tazeleyin. Eski bir arkadaşla mesajlaşın.', mood: 'Bağlantı kuran', advice: 'Mesajınızı kısa, net ve sıcak tutun.' },
    { day: 'Her Gün', comment: 'Yazıya döktüğünüz düşünceler netleşir. Not defteriniz bugün mükemmel bir araç.', mood: 'İfade odaklı', advice: '3 paragraf gün sonu özeti yazın.' },
    { day: 'Her Gün', comment: 'Merak duygunuz sizi yeni içeriklere götürüyor: podcast, makale, video…', mood: 'Keşfetmeye istekli', advice: 'Tükettiğiniz kadar üretmeyi de deneyin.' },
    { day: 'Her Gün', comment: 'Kısa yolculuklar şifa olur. Mahallede yeni bir rota deneyin.', mood: 'Hafif ve esnek', advice: 'Telefonu cebinizde bırakın, çevreyi gözlemleyin.' },
    { day: 'Her Gün', comment: 'Çok görevli çalışma sizi yorabilir. Öncelik matrisi çizin.', mood: 'Dağınık ama çevik', advice: 'Önemli-acele matrisi ile sadeleştirin.' },
    { day: 'Her Gün', comment: 'Nüktedanlığınız insanları etkiliyor. Esprilerinizi dozunda kullanın.', mood: 'Neşeli ve zeki', advice: 'İroni yerine nezaketi seçin.' },
    { day: 'Her Gün', comment: 'Bir satış, sunum veya müzakere için uygun zaman.', mood: 'İkna edici', advice: 'Önce ihtiyaç dinleyin, sonra çözüm önerin.' },
    { day: 'Her Gün', comment: 'Kardeşler/kuzenler gündeme gelebilir. Küçük bir jest büyük etki yaratır.', mood: 'Yakın çevre odaklı', advice: 'Bir kahve daveti teklif edin.' },
    { day: 'Her Gün', comment: 'Gün içinde fikir değiştirmeniz normal. Esnek kalın ama bir çıpa belirleyin.', mood: 'Değişken ama uyumlu', advice: 'Günün tek zorunlu hedefini baştan seçin.' },
    { day: 'Her Gün', comment: 'Teknoloji şans getiriyor. Otomasyon kurun: şablon mail, klavye kısayolu…', mood: 'Verimlilik arayan', advice: '5 dakikalık bir otomasyon, saatler kazandırır.' },
    { day: 'Her Gün', comment: 'Beyin fırtınası için ideal. İyi fikirler sessizlikte de doğar.', mood: 'Yaratıcı ve çevik', advice: 'Sessiz 10 dakika: fikirlerinizin olgunlaşmasına izin verin.' },
    { day: 'Her Gün', comment: 'Sosyal ortamlarda parlıyorsunuz. Network, fırsatların anahtarı.', mood: 'Dışadönük', advice: 'Kendinizi tek cümlede tanımlayan bir “intro” hazırlayın.' },
    { day: 'Her Gün', comment: 'Yeni bir hobi seçin: hızlı okuma, tipografi, kısa videolar.', mood: 'Deneysel', advice: '1 haftalık mini proje belirleyin.' },
    { day: 'Her Gün', comment: 'Gıybet cazip gelebilir, uzak durun. Bilgi, sorumluluk ister.', mood: 'Dikkatli ve etik', advice: 'Doğrulamadığınız bilgiyi yaymayın.' },
    { day: 'Her Gün', comment: 'Nefes egzersizi sinir sisteminizi sakinleştirir.', mood: 'Farkındalıklı', advice: '4-7-8 nefes tekniğini 3 tur uygulayın.' },
    { day: 'Her Gün', comment: 'Mikro-egzersizler: 5 dakikalık esneme ve su molaları.', mood: 'Canlı ve hafif', advice: 'Alarm kurun: her 60 dakikada 2 dakika hareket.' },
    { day: 'Her Gün', comment: 'İki projeyi aynı anda yürütmek mümkün; ritim kurun.', mood: 'Çok yönlü', advice: 'Sabah A projesi, öğleden sonra B projesi kuralı.' },
    { day: 'Her Gün', comment: 'Okuma listenizi sadeleştirin. Birini bitirmeden yenisine başlamayın.', mood: 'Odaklı', advice: '“Şimdi okunanlar” klasörü oluşturun.' },
    { day: 'Her Gün', comment: 'Kısa format içerik üretimi için verimli zaman.', mood: 'Üretken', advice: '30 saniyelik bir fikir paylaşın; mükemmel olmasına gerek yok.' },
    { day: 'Her Gün', comment: 'Duygusal hava değişken; mizah ile yumuşatın.', mood: 'Dalgalı ama esprili', advice: 'Kendinize nazik davranın, etiketlemeyin.' },
    { day: 'Her Gün', comment: 'Mentorluk veya koçluk alışverişi yapın. Bilgi dolaşınca değerlenir.', mood: 'Paylaşımcı', advice: 'Birine bildiğiniz bir şeyi öğretin.' },
    { day: 'Her Gün', comment: 'Yan proje (side project) için kıvılcım var.', mood: 'Girişimci', advice: '1 sayfalık taslak hazırlayın: amaç, kullanıcı, ilk adım.' },
    { day: 'Her Gün', comment: 'Takvim ve görevleri eşitleyin. Dijital dağınıklığı toplayın.', mood: 'Organize', advice: 'Gereksiz bildirimleri kapatın.' },
    { day: 'Her Gün', comment: 'Kısa bir eğitim/atölye büyük fark yaratır.', mood: 'Gelişim odaklı', advice: 'Bugün bir video ders bitirin.' },
    { day: 'Her Gün', comment: 'İkili ilişkilerde mizah köprü kurar. Ama hassas sınırları aşmayın.', mood: 'Şakacı ve zarif', advice: 'Empati filtresi: “Bunu bana söyleseler nasıl hissederdim?”' },
    { day: 'Her Gün', comment: 'Analitik ve yaratıcı beyniniz iş birliği içinde. Karmaşık problemi basitleştirin.', mood: 'Akıllı ve çevik', advice: 'Problemi 3 cümlede tarif edin, sonra çözüm üretin.' }
  ],
  [ZodiacSign.CANCER]: [
    { day: 'Her Gün', comment: 'Ay enerjisi güçlü: duygularınız dalgalanabilir. Günlük yazmak iyi gelir.', mood: 'Duygusal ve derin', advice: 'Duyguları bastırmayın, akmasına izin verin.' },
    { day: 'Her Gün', comment: 'Aile üyelerinizden biri size ihtiyaç duyuyor. Sıcak bir mesaj gönderin.', mood: 'Koruyucu ve şefkatli', advice: 'İhtiyaç duymadan önce siz ulaşın.' },
    { day: 'Her Gün', comment: 'Eviniz bugün sığınağınız. Yastıklar, mumlar, yumuşak ışık...', mood: 'Yuva odaklı', advice: 'Kişisel alanınızı kutsayın.' },
    { day: 'Her Gün', comment: 'Sezgileriniz hiç yanılmıyor. O "his" gerçek; dinleyin.', mood: 'Sezgisel', advice: 'Mantık bazen sezginin arkasından gelir.' },
    { day: 'Her Gün', comment: 'Ev yapımı yemek pişirmek ruhunuzu besler. Annenizin tarifini deneyin.', mood: 'Besleyici', advice: 'Yemek yaparken müzik açın, ritüel olsun.' },
    { day: 'Her Gün', comment: 'Geçmişten bir anı canlandı. Nostaljiye dalmak güzel ama bugüne de kök salın.', mood: 'Nostaljik', advice: 'Hatıralar güzel ama şimdiyi yaşayın.' },
    { day: 'Her Gün', comment: 'Güvenlik duygunuzu koruyun: mali tasarruf, sağlık sigortası, acil fon...', mood: 'Güvenlik arayan', advice: '3 aylık acil fon hedefleyin.' },
    { day: 'Her Gün', comment: 'Duygusal bağımlılık sinyali: başkalarının onayına çok ihtiyaç duyuyor musunuz?', mood: 'İçe dönük', advice: 'Kendinize onay vermeyi öğrenin.' },
    { day: 'Her Gün', comment: 'Sevdiklerinize küçük jestler: el yazısı not, favori çayı hazırlamak...', mood: 'İlgili ve sevecen', advice: 'Küçük detaylar büyük etki yapar.' },
    { day: 'Her Gün', comment: 'Ay döngüsü etkisi altındasınız. Hangi faz? Dolunay mı, yeniay mı?', mood: 'Ay bağlantılı', advice: 'Ay takvimi tutun, kendinizi gözlemleyin.' },
    { day: 'Her Gün', comment: 'Sınırlarınızı koruyun. "Hayır" demek, sevgiyi azaltmaz.', mood: 'Dengeli', advice: 'Hayır demek, kendinize evet demektir.' },
    { day: 'Her Gün', comment: 'Empati gücünüz yüksek; ama başkasının yükünü sırtınıza almayın.', mood: 'Empatik', advice: 'Destek olmak, kurtarmak demek değildir.' },
    { day: 'Her Gün', comment: 'Su elementi fısıldıyor: banyo, yüzme, deniz sesi... Şifa gelir sulardan.', mood: 'Su elementi güçlü', advice: 'Günde 10 dakika su sesi dinleyin.' },
    { day: 'Her Gün', comment: 'Çocukluk travmalarınızla yüzleşme zamanı. Terapi veya günlük yazımı etkilidir.', mood: 'İyileşen', advice: 'Profesyonel destek almaktan çekinmeyin.' },
    { day: 'Her Gün', comment: 'Ev düzenlemesi: eski eşyaların hikayesi var ama yer kaplıyorlar mı?', mood: 'Sadeleşen', advice: 'Anılar kalbe yerleşir, eşyalara değil.' },
    { day: 'Her Gün', comment: 'Çocuklarla (veya çocuk ruhla) vakit geçirmek sizi gençleştirir.', mood: 'Oyuncu', advice: 'Çocuk kitapları okuyun, masumiyet iyileştirir.' },
    { day: 'Her Gün', comment: 'Bugün kendinize sıcak bir içecek ve sessizlik hediye edin.', mood: 'Kendine özenli', advice: 'Kahve/çay hazırlarken farkındalıkla yapın.' },
    { day: 'Her Gün', comment: 'Koruma içgüdüleriniz yüksek. Ama aşırı korumacılık boğar; farkında olun.', mood: 'Koruyucu', advice: 'Sevdiklerinize nefes alanı bırakın.' },
    { day: 'Her Gün', comment: 'Anne-baba ilişkiniz bugün zihninizdedir. Barış mı, hesaplaşma mı?', mood: 'Derin düşünen', advice: 'Affetmek sizi özgürleştirir, karşınızdakini değil.' },
    { day: 'Her Gün', comment: 'Duygusal yeme isteği gelebilir. Açlık mı, hissin mi, farkına varın.', mood: 'Bedensel bilinçli', advice: 'Yemeden önce 5 dakika bekleyin ve sorun: gerçekten aç mıyım?' },
    { day: 'Her Gün', comment: 'Yaratıcılık sizde el işiyle çıkar: örgü, dikiş, seramik...', mood: 'Yaratıcı', advice: 'Elleriniz meşgulken zihniniz dinlenir.' },
    { day: 'Her Gün', comment: 'Eski fotoğraf albümü karıştırmak tatlı bir yolculuktur.', mood: 'Nostaljik ve şükredici', advice: 'Geçmişe şükür, geleceğe umut.' },
    { day: 'Her Gün', comment: 'Duygusal dayanıklılık kasınızı güçlendirin. Ağlamak güçtür, zaaf değil.', mood: 'Duygusal olgunluk', advice: 'Gözyaşları toksinleri atar, rahatlamayı sağlar.' },
    { day: 'Her Gün', comment: 'Sevgiliniz/partnerinizle derin bir konuşma yapın. Yüzeysellikten sıyrılın.', mood: 'Bağ kuran', advice: 'Dört göz, telefonsuz, 20 dakika.' },
    { day: 'Her Gün', comment: 'Finansal güvencenize katkı: küçük de olsa düzenli tasarruf.', mood: 'İleriyi planlayan', advice: 'Otomatik ödeme talimatı verin, siz unutursunuz.' },
    { day: 'Her Gün', comment: 'Evcil hayvanınız (varsa) size bugün iyi gelecek. Yoksa bitki bakımı da şifa verir.', mood: 'Besleyici', advice: 'Canlılara bakmak öz değerinizi hatırlatır.' },
    { day: 'Her Gün', comment: 'Sabah rutininize şükür anı ekleyin: 3 şey için minnettarlık.', mood: 'Şükredici', advice: 'Minnet tutumu beyni yeniden programlar.' },
    { day: 'Her Gün', comment: 'İçe kapanma isteği normaldir; ama sosyal bağları tamamen kesmeyin.', mood: 'Yalnızlık arayan', advice: 'Yalnızlık ile izolasyon farklıdır; farkında olun.' },
    { day: 'Her Gün', comment: 'Geçmiş ilişkilerden kalma yaralar bugün gündeme gelebilir.', mood: 'İyileşme sürecinde', advice: 'Yara izleri hikayenizin parçasıdır, utanılacak değil.' },
    { day: 'Her Gün', comment: 'Rüyalarınız anlamlı mesajlar taşıyabilir. Sabah ilk iş not alın.', mood: 'Rüya bilinçli', advice: 'Rüya defteri tutun, desenler ortaya çıkar.' },
    { day: 'Her Gün', comment: 'Evinizin enerjisini temizleyin: tütsü, açık pencere, müzik...', mood: 'Enerji temizleyici', advice: 'Evinizdeki her köşe sizin enerjinizi yansıtır.' }
  ],
  [ZodiacSign.LEO]: [
    { day: 'Her Gün', comment: 'Güneş enerjiniz yüksek: parıldıyorsunuz. Ama ego kontrolü önemli.', mood: 'Işıltılı ve özgüvenli', advice: 'Parlamak için başkalarını gölgelemeyin.' },
    { day: 'Her Gün', comment: 'Liderlik fırsatı var. Ekibi yönlendirin ama diktaya kaymayin.', mood: 'Lider ruhlu', advice: 'Liderlik hizmet demektir, hakimiyet değil.' },
    { day: 'Her Gün', comment: 'Yaratıcı projeniz ilerleme istiyor. Dramatik dokunuşunuz fark yaratır.', mood: 'Yaratıcı', advice: 'Sahnede olmak yetenektir ama gösteriş değil.' },
    { day: 'Her Gün', comment: 'Övgü ve takdir alma ihtiyacınız yüksek. Ama bağımlı olmayın.', mood: 'Takdir arayan', advice: 'İç değerinizi dışarıdan gelen onaya bağlamayın.' },
    { day: 'Her Gün', comment: 'Cömertliğiniz sizi özel kılar. Bugün birine jest yapın.', mood: 'Cömert', advice: 'Cömertlik karşılık beklemeden vermektir.' },
    { day: 'Her Gün', comment: 'Gururunuz incinmiş olabilir. Affetmek kraliyet hamlesidir.', mood: 'Onurlu', advice: 'Gurur gücü kırmak değil, yükseltmektir.' },
    { day: 'Her Gün', comment: 'Drama içgüdüleriniz tetiklenebilir. Küçük durumu büyütmeyin.', mood: 'Duygusal ve teatral', advice: 'Her şey bir dram sahnesi değildir.' },
    { day: 'Her Gün', comment: 'Çocuklar ve yaratıcı oyunlar size iyi gelir. Ciddiyetten uzaklaşın.', mood: 'Oyuncu', advice: 'Hayat bir oyundur, katılın.' },
    { day: 'Her Gün', comment: 'Romantizm havadasınız. Büyük jest yapmak istiyorsunuz.', mood: 'Romantik ve tutkulu', advice: 'Aşk doğal olsun, zorlamayin.' },
    { day: 'Her Gün', comment: 'Sosyal ortamda merkez olma isteği güçlü. Başkalarına da alan bırakın.', mood: 'Sosyal ve popüler', advice: 'Spot ışığını paylaşın, tek başınıza parlamayın.' },
    { day: 'Her Gün', comment: 'Kalp sağlığınıza dikkat: stres, kızgınlık, aşırı heyecan...', mood: 'Sağlık bilinçli', advice: 'Kardiyoyu ihmal etmeyin, kalp sizin gücünüz.' },
    { day: 'Her Gün', comment: 'Gösteriş yapma isteği vs. gerçek değer. Özü üste çıkarın.', mood: 'Kendini sorgulayan', advice: 'İçten değerli olmak, gösterişten üstündür.' },
    { day: 'Her Gün', comment: 'Sadakat sizin kraliyet özelliğiniz. Sevdiklerinize bağlılık gösterin.', mood: 'Sadık', advice: 'Sadakat karşılıklıdır, tek yönlü değil.' },
    { day: 'Her Gün', comment: 'Yaratıcı blok: mükemmeliyetçilik mi engelliyor? İlk taslak kötü olabilir.', mood: 'Yaratıcı çıkmaz', advice: 'Başlamak için mükemmel olmak gerekmiyor.' },
    { day: 'Her Gün', comment: 'Güneş elementi: dışarı çıkın, D vitamini alın, ışıkta olun.', mood: 'Ateş elementi güçlü', advice: '15 dakika güneşte olmak ruh halinizi değiştirir.' },
    { day: 'Her Gün', comment: 'Lüks ve konfor size iyi gelir ama bağımlılık yaratmayın.', mood: 'Lüks seven', advice: 'Konfor ödüldür, sürekli hak değil.' },
    { day: 'Her Gün', comment: 'Kendinize yatırım yapın: kurs, workshop, kişisel gelişim.', mood: 'Kendini geliştiren', advice: 'En iyi yatırım kendinizedir.' },
    { day: 'Her Gün', comment: 'Eleştiriye açık olmak krallara yakışır. Geri bildirimi dinleyin.', mood: 'Olgunlaşan', advice: 'Eleştiri size düşman değil, ayna tutuyor.' },
    { day: 'Her Gün', comment: 'Performans kaygısı: herkesi memnun etmeye çalışıyorsunuz.', mood: 'Baskı altında', advice: 'Kendiniz olmak, herkes için rol yapmaktan iyidir.' },
    { day: 'Her Gün', comment: 'Cesaret kas gibidir, çalıştırılmalı. Bugün küçük cesaret adımı atın.', mood: 'Cesaretli', advice: 'Cesaret korkusuzluk değil, korkuya rağmen hareket etmektir.' },
    { day: 'Her Gün', comment: 'Yardım etmek ve korumak doğal içgüdünüz. Ama kurtarıcı olmayın.', mood: 'Koruyucu', advice: 'İnsanları güçlendirin, bağımlı hale getirmeyin.' },
    { day: 'Her Gün', comment: 'Kıskançlık ve rekabet duygusu: başkalarının başarısı sizinkini azaltmaz.', mood: 'Rekabetçi', advice: 'Bolluk mentalitesi: herkes için yeterli başarı var.' },
    { day: 'Her Gün', comment: 'Saç, görünüm, stil: kendinizi iyi hissetmek için özen gösterin.', mood: 'Stil sahibi', advice: 'Görünüm önemli ama karakter daha önemli.' },
    { day: 'Her Gün', comment: 'Heyecan arayışı: risk almak istersiniz ama hesaplı olun.', mood: 'Maceracı', advice: 'Akıllı risk, öngörüsüz atılganlık değildir.' },
    { day: 'Her Gün', comment: 'Mentörlük yapın: bilginizi, deneyiminizi paylaşın. Krallık mirasıdır.', mood: 'Öğreten', advice: 'Bilgiyi paylaşmak onu azaltmaz, çoğaltır.' },
    { day: 'Her Gün', comment: 'Sahne korkusu veya konuşma kaygısı: içinizde zaten parlama var.', mood: 'Sahne ışığında', advice: 'Kendiniz olun, karakter oynamayın.' },
    { day: 'Her Gün', comment: 'Altın ve sarı renk bugün enerjinizi artırır. Giyin veya çevrenize ekleyin.', mood: 'Renkle uyumlu', advice: 'Renkler titreşimdir, güneş rengini kullanın.' },
    { day: 'Her Gün', comment: 'Hediye vermek sevginizi gösterir. Ama karşılık beklentisi olmadan.', mood: 'Veren el', advice: 'Gerçek cömertlik sessizdir, gösteriş değil.' },
    { day: 'Her Gün', comment: 'Güç dengesi: kontrol etmek mi, işbirliği mi? İkincisi sürdürülebilir.', mood: 'Liderlik dersi', advice: 'Güç paylaşıldıkça artar, tekelde azalır.' },
    { day: 'Her Gün', comment: 'Oyunculuk, drama, tiyatro: doğal yetenekleriniz. Hobi olarak deneyin.', mood: 'Sanatsal', advice: 'İfade gücünüzü sahnede keşfedin.' },
    { day: 'Her Gün', comment: 'Kalpten yaşamak cesarettir. Mantığa hapsolmayın.', mood: 'Kalp odaklı', advice: 'Kalp aklından daha bilge olabilir.' }
  ],
  [ZodiacSign.VIRGO]: [
    { day: 'Her Gün', comment: 'Mükemmeliyetçilik sizi bloke ediyor mu? "Yeterince iyi" de iyidir.', mood: 'Mükemmeliyetçi', advice: 'Bitirmiş olmak, mükemmel olmaktan iyidir.' },
    { day: 'Her Gün', comment: 'Detay gözünüz keskin: hata avına çıkmak yerine çözüm üretin.', mood: 'Detaycı', advice: 'Eleştirmek kolay, yapmak zor.' },
    { day: 'Her Gün', comment: 'Sağlık paranoyanız mı tetiklendi? Google yerine doktora gidin.', mood: 'Sağlık bilinçli', advice: 'Hafif endişe normaldir, takıntı değil.' },
    { day: 'Her Gün', comment: 'Organize olmak yeteneğiniz; ama her şey planlanabilir mi?', mood: 'Organize', advice: 'Kaos da hayatın bir parçasıdır.' },
    { day: 'Her Gün', comment: 'To-do listeleriniz listeleri geçti. Önceliklendirin.', mood: 'Görev odaklı', advice: 'Her şeyi yapmaya çalışmak hiçbir şeyi yapmamaktır.' },
    { day: 'Her Gün', comment: 'Hizmet etmek doğanızda; ama sömürülmeyin.', mood: 'Hizmet odaklı', advice: 'Yardım etmek ile kullanılmak farklıdır.' },
    { day: 'Her Gün', comment: 'Beden sağlığı: beslenme, egzersiz, uyku dengesi kurulmalı.', mood: 'Bütünsel sağlık', advice: 'Sağlık tek alanda değil, dengede aranır.' },
    { day: 'Her Gün', comment: 'Eleştiri dili acı olabilir. Yapıcı konuşun.', mood: 'Eleştirel', advice: 'Doğru söylemek yeter, kırıcı olması gerekmez.' },
    { day: 'Her Gün', comment: 'Temizlik ve düzen ruh halinizi etkiler. Çevrenizi düzeltin.', mood: 'Düzen sever', advice: '5 dakika düzenleme, 5 saat huzur verir.' },
    { day: 'Her Gün', comment: 'Başkalarını düzeltme isteği: ama herkes sizin gibi olmak istemez.', mood: 'Geliştirici', advice: 'İstenmeyen tavsiye rahatsız eder.' },
    { day: 'Her Gün', comment: 'Analitik zekanız güçlü: verileri okuyun, karar verin.', mood: 'Analitik', advice: 'Veri önemlidir ama sezgi de değerlidir.' },
    { day: 'Her Gün', comment: 'Mikrobiyom sağlığı: probiyotik, fermente gıda, bağırsak dengesi.', mood: 'Beslenme uzmanı', advice: 'Bağırsak sağlığı = ruh sağlığı.' },
    { day: 'Her Gün', comment: 'İş-hayat dengesi sıkıntı. Sadece çalışmak için yaşamıyorsunuz.', mood: 'İş odaklı', advice: 'Mola vermek tembellik değil, sürdürülebilirliktir.' },
    { day: 'Her Gün', comment: 'Endişe düşüncelerinizi ele geçirdi mi? Yazın, boşaltın.', mood: 'Endişeli', advice: 'Kağıda dökmek zihni rahatlatır.' },
    { day: 'Her Gün', comment: 'Doğa elementi: toprak. Bahçe işi, bitki bakımı, toprakla temas.', mood: 'Toprak elementi', advice: 'Toprağa dokunmak grounding yapar.' },
    { day: 'Her Gün', comment: 'Beceri geliştirme: yeni bir şey öğrenin, ustalaşın.', mood: 'Öğrenen', advice: 'Uzmanlaşmak bin saat ister, başlayın.' },
    { day: 'Her Gün', comment: 'Kendinize karşı aşırı sert misiniz? Şefkat gösterin.', mood: 'İçsel eleştiri', advice: 'Kendinize düşman gibi konuşmayın.' },
    { day: 'Her Gün', comment: 'Minimalizm çağrısı: gereksizi atın, sadeleşin.', mood: 'Sadeleşen', advice: 'Az eşya = az stres.' },
    { day: 'Her Gün', comment: 'Başkalarının hatalarını görmek kolay, kendinizinkini?', mood: 'Kendini sorgulayan', advice: 'Önce kendi kiriş, sonra başkasının çöpü.' },
    { day: 'Her Gün', comment: 'Rutin sevginiz var ama esneklik de önemli.', mood: 'Rutinli', advice: 'Arada sıradışı yapın, esneklik kasını çalıştırın.' },
    { day: 'Her Gün', comment: 'Yardım talebi: "Evet" demeden önce düşünün.', mood: 'Sınır koruyan', advice: '"Hayır" demek egoizm değildir.' },
    { day: 'Her Gün', comment: 'Sindirim sisteminiz stresten etkilenir. Yavaş yiyin, çiğneyin.', mood: 'Beden dinleyen', advice: 'Stresli yemek yemeyin, önce sakinleşin.' },
    { day: 'Her Gün', comment: 'Verimlilik takıntısı: her anınız "productive" olmak zorunda değil.', mood: 'Verimlilik tutsağı', advice: 'Boş vakit tembel değil, gereklidir.' },
    { day: 'Her Gün', comment: 'El işleri, tamirat, pratik beceriler sizde parlıyor.', mood: 'Pratik', advice: 'Ellerinizle bir şey yapın, tatmin edici.' },
    { day: 'Her Gün', comment: 'Başkalarına hizmet etmek size anlam verir. Gönüllü çalışma deneyin.', mood: 'Fedakar', advice: 'Verdiğiniz zaman size de dönüş yapar.' },
    { day: 'Her Gün', comment: 'Takıntılı düşünce döngüsü: bir problemi çözemiyorsanız bırakın.', mood: 'Zihin döngüsü', advice: 'Bıraktığınızda çözüm gelir.' },
    { day: 'Her Gün', comment: 'Bütçe, hesap, tasarruf: mali düzen sizin işiniz.', mood: 'Mali disiplinli', advice: 'Küçük tasarruf büyük fark yaratır.' },
    { day: 'Her Gün', comment: 'Alçak gönüllülük güçtür ama kendinizi küçümsemeyin.', mood: 'Alçakgönüllü', advice: 'Tevazu iyidir, kendini yok saymak değil.' },
    { day: 'Her Gün', comment: 'Eleştiri almanız zor: mükemmel olmak zorunlu değil.', mood: 'Savunmacı', advice: 'Geri bildirim hediyedir, suçlama değil.' },
    { day: 'Her Gün', comment: 'Diyetler, temizlikler, detoks: radikal değil, sürdürülebilir olsun.', mood: 'Şifa arayan', advice: 'Aşırı rejimler geri teper, denge önemli.' },
    { day: 'Her Gün', comment: 'Her şeyi kontrol edemezsiniz. Bırakmayı öğrenin.', mood: 'Kontrol bırakan', advice: 'Bırakmak teslim olmak değil, huzur bulmaktır.' }
  ],
  [ZodiacSign.LIBRA]: [
    { day: 'Her Gün', comment: 'Karar kilitlenmeniz mi var? Her seçeneği tartmak sizi yavaşlatıyor.', mood: 'Kararsız', advice: 'Mükemmel karar yoktur, yeterince iyi olanı seçin.' },
    { day: 'Her Gün', comment: 'Denge arayışınız sizi dinlendiriyor mu, yoksa gerginlik mi?', mood: 'Dengeli', advice: 'Denge statik değil, dinamik ayarlamadır.' },
    { day: 'Her Gün', comment: 'İlişkiler sizin için can simididir. Ama tek başınıza da olabilmelisiniz.', mood: 'İlişki odaklı', advice: 'Partnere ihtiyaç ile bağımlılık farklıdır.' },
    { day: 'Her Gün', comment: 'Çatışmadan kaçınmak diplomatik mi, kaçamak mı?', mood: 'Uyum arayan', advice: 'Bazen sağlıklı çatışma gereklidir.' },
    { day: 'Her Gün', comment: 'Estetik göz: güzellik sizde doğal bir radar.', mood: 'Estetik tutkunu', advice: 'Güzellik sadece dışarıda değil, içeride de aranır.' },
    { day: 'Her Gün', comment: 'Başkalarını memnun etmek için kendinizi feda ediyor musunuz?', mood: 'Uysal', advice: 'Herkesin mutluluğu sizin sorumluluğunuz değil.' },
    { day: 'Her Gün', comment: 'Adalet duygunuz yüksek: haksızlığa tahammül edemezsiniz.', mood: 'Adalet savaşçısı', advice: 'Her savaşı vermek zorunda değilsiniz.' },
    { day: 'Her Gün', comment: 'Diplomasi yeteneğiniz: arabuluculuk yapabilirsiniz.', mood: 'Arabulucu', advice: 'Ortada kalmak yıpratır, kendinize de bakın.' },
    { day: 'Her Gün', comment: 'Hava elementi: sosyalleşmek, konuşmak, paylaşmak iyi gelir.', mood: 'Sosyal', advice: 'Yalnız kalmaktan korkmayın, denge gerek.' },
    { day: 'Her Gün', comment: 'Karşınızdakinin aynasısınız: onları yansıtıyorsunuz.', mood: 'Ayna etkisi', advice: 'Kendinizi başkalarında kaybetmeyin.' },
    { day: 'Her Gün', comment: 'Romantizm ve partnerlık hayaliniz güçlü. İdealize etmeyin.', mood: 'Romantik', advice: 'Gerçek aşk mükemmel değil, kabul edicidir.' },
    { day: 'Her Gün', comment: 'Moda, stil, görünüm: kendinizi iyi hissettiren şeyler giyin.', mood: 'Stil sahibi', advice: 'Görünüm ifadedir ama kimlik değildir.' },
    { day: 'Her Gün', comment: 'İki tarafı da görebiliyorsunuz; gri tonları idare etmek zor.', mood: 'Çok perspektifli', advice: 'Bazen siyah-beyaz netlik gereklidir.' },
    { day: 'Her Gün', comment: 'Venüs enerjisi: sevgi, güzellik, sanat sizi besler.', mood: 'Venüs güçlü', advice: 'Sanat müzesine gidin, ruhunuza iyi gelir.' },
    { day: 'Her Gün', comment: 'Onay arama: başkalarının beğenisine ihtiyaç duyuyor musunuz?', mood: 'Onay arayan', advice: 'Kendinizi onaylamak dışarıdan daha güçlüdür.' },
    { day: 'Her Gün', comment: 'Ortaklık doğal alanınız: iş, ilişki, arkadaşlık birlikte yürür.', mood: 'Ortak çalışan', advice: 'Bağımsızlık kasınızı da çalıştırın.' },
    { day: 'Her Gün', comment: 'Pasif agresiflik tuzağı: doğrudan ifade etmek yerine dolaylı davranış.', mood: 'Dolaylı', advice: 'Doğrudan iletişim daha sağlıklıdır.' },
    { day: 'Her Gün', comment: 'Çelişkili istekler: bağımsızlık vs. birliktelik.', mood: 'İkilemde', advice: 'İkisi de olabilir, ya da değil, seçim sizin.' },
    { day: 'Her Gün', comment: 'Nezaket, incelik, zarafet: sosyal graces sizde doğal.', mood: 'Zarif', advice: 'Kibarlık zayıflık değil, güçtür.' },
    { day: 'Her Gün', comment: 'Hakemlik yapma eğilimi: ama taraf olmak da gerekebilir.', mood: 'Hakem', advice: 'Bazen taraf seçmek gerekir.' },
    { day: 'Her Gün', comment: 'Sanat, müzik, dans, edebiyat: yaratıcılığınızı keşfedin.', mood: 'Sanatsal', advice: 'Yaratıcılık mükemmel olmayı gerektirmez.' },
    { day: 'Her Gün', comment: 'Çift olmak kimliğiniz haline geldi mi? Siz kiminiz tek başınıza?', mood: 'Kimlik sorgulaması', advice: 'Tam bir birey olun, önce kendiniz sonra çift.' },
    { day: 'Her Gün', comment: 'Güzel konuşma yeteneği: kelimeler sizde şiir gibi.', mood: 'Etkileyici konuşmacı', advice: 'Söz gümüşse, dinlemek altındır.' },
    { day: 'Her Gün', comment: 'Çatışma anında donma: kaç, savaş, donakala. Hangisi?', mood: 'Çatışmadan kaçan', advice: 'Sağlıklı çatışma çözme öğrenin.' },
    { day: 'Her Gün', comment: 'Terazi simgesi: denge, eşitlik, adalet. Yaşatın.', mood: 'Sembol odaklı', advice: 'Denge peşinde koşulduğunda kaybolur, yaşandığında bulunur.' },
    { day: 'Her Gün', comment: 'Başkalarının ihtiyaçlarını kendi ihtiyaçlarınızdan üstün tutuyorsunuz.', mood: 'Fedakar', advice: 'Kendi ihtiyaçlarınız da önemlidir.' },
    { day: 'Her Gün', comment: 'Mükemmel partner arayışı: gerçekçi beklentiler önemli.', mood: 'İdeal arayan', advice: 'Kusursuz insan yoktur, uyumlu insan vardır.' },
    { day: 'Her Gün', comment: 'İç dünyanız vs. dış dünyanız: bazen uyumsuzluk olabilir.', mood: 'İçsel çelişki', advice: 'Dışarıya neyi yansıttığınıza dikkat edin.' },
    { day: 'Her Gün', comment: 'Popülerlik arzusu: herkesin sizi sevmesini istiyorsunuz.', mood: 'Sevilmek isteyen', advice: 'Herkes sizi sevmeyecek, bu normal.' },
    { day: 'Her Gün', comment: 'Ortam güzelleştirme: çevrenizi estetik yapın, iyi hissedersiniz.', mood: 'Mekan tasarımcısı', advice: 'Güzellik lüks değil, ihtiyaçtır.' },
    { day: 'Her Gün', comment: 'Karşılaştırma tuzağı: siz sizsiniz, başkası başkasıdır.', mood: 'Karşılaştıran', advice: 'Kendinizi başkalarıyla ölçmeyin.' }
  ],
  [ZodiacSign.SCORPIO]: [
    { day: 'Her Gün', comment: 'Yoğunluk seviyeniz yüksek. Her şeyi ya hep ya hiç yaşıyorsunuz.', mood: 'Yoğun', advice: 'Bazen orta yol da güzeldir.' },
    { day: 'Her Gün', comment: 'Gizlilik içgüdüsü: sırlarınızı koruyorsunuz. Ama izolasyon yaratıyor mu?', mood: 'Gizemli', advice: 'Güven inşa etmek paylaşımla olur.' },
    { day: 'Her Gün', comment: 'İntikam fantezileri: zarar verildi, hesap soracaksınız.', mood: 'İntikam arayan', advice: 'Affetmek zehiri siz içmeden karşı tarafa vermemektir.' },
    { day: 'Her Gün', comment: 'Kontrol ihtiyacı güçlü. Ama kontrol edilemeyeni kabul edin.', mood: 'Kontrol eden', advice: 'Bırakmak güçsüzlük değil, özgürlüktür.' },
    { day: 'Her Gün', comment: 'Sezgisel radar keskin: yalan, aldatma, gizli ajanda. Hepsini görürsünüz.', mood: 'Sezgisel dedektif', advice: 'Her savaşa girmeyin, seçici olun.' },
    { day: 'Her Gün', comment: 'Derinlik arayışı: yüzeysel konuşma sizi sıkıyor.', mood: 'Derin düşünen', advice: 'Herkes derin olacak diye bir kural yok.' },
    { day: 'Her Gün', comment: 'Cinsellik enerjiniz yüksek. İçgüdüsel ve güçlü.', mood: 'Tutkulu', advice: 'Cinsellik güçtür ama tek boyut değildir.' },
    { day: 'Her Gün', comment: 'Psikolojik keşif: kendi gölgenizle yüzleşin.', mood: 'Gölge çalışması', advice: 'Karanlık yanlarınız sizi tamamlar, yok etmez.' },
    { day: 'Her Gün', comment: 'Dönüşüm yetenekleriniz mitolojik: küllerden doğarsınız.', mood: 'Phoenix gibi', advice: 'Her bitiş yeni bir başlangıçtır.' },
    { day: 'Her Gün', comment: 'Kıskançlık ve sahiplenme: sevdiklerinizi kaybetme korkusu.', mood: 'Kıskanç', advice: 'Sevgi özgürlük ister, kafes değil.' },
    { day: 'Her Gün', comment: 'Su elementi: derin, sessiz, güçlü. Okyanus gibisiniz.', mood: 'Su elementi derin', advice: 'Yüzeyde sakin görünseniz de derinlerde fırtına var.' },
    { day: 'Her Gün', comment: 'Paranoya eğilimi: herkese şüphe ile bakıyorsunuz.', mood: 'Şüpheci', advice: 'Güvenmek risk almaktır ama değer.' },
    { day: 'Her Gün', comment: 'Manipülasyon becerileriniz var. Ama etik kullanın.', mood: 'Stratejik', advice: 'Güç, sorumlulukla gelir.' },
    { day: 'Her Gün', comment: 'Ölüm, sonluk, kayıp: egzistansiyel temalar size yakın.', mood: 'Felsefi', advice: 'Ölüm farkındalığı yaşamı değerli kılar.' },
    { day: 'Her Gün', comment: 'Saplantılı düşünce: bir konu kafanızda dönüp duruyor.', mood: 'Obsesif', advice: 'Bırakın, zihin dinlensin.' },
    { day: 'Her Gün', comment: 'Gizli ajanda: asıl niyetlerinizi gizliyorsunuz.', mood: 'Stratejik planlayan', advice: 'Şeffaflık güven inşa eder.' },
    { day: 'Her Gün', comment: 'Kriz yönetimi: kaos ortamında sakin kalırsınız.', mood: 'Kriz yöneticisi', advice: 'Sakinlik en büyük gücünüzdür.' },
    { day: 'Her Gün', comment: 'Terk edilme korkusu: yakınlık istersiniz ama savunmalisiniz.', mood: 'Koruyucu duvar', advice: 'Duvarları yavaş yavaş indirin.' },
    { day: 'Her Gün', comment: 'Okült, mistik, gizli bilgi: çekiyor sizi.', mood: 'Gizemci', advice: 'Bilgi güçtür ama hikmet daha güçlü.' },
    { day: 'Her Gün', comment: 'Sadakat sizin kutsal özelliğiniz. İhanete tolerans yok.', mood: 'Sadık', advice: 'İhanet yoksa bile paranoya yaratmayın.' },
    { day: 'Her Gün', comment: 'Güç mücadelesi: kim üstte? Kontrol kimde?', mood: 'Güç oyunu', advice: 'Eşit ortaklık, hakimiyetten iyidir.' },
    { day: 'Her Gün', comment: 'Sessiz gözlem: konuşmadan çok şey öğrenirsiniz.', mood: 'Gözlemci', advice: 'Dinlemek güçtür, konuşmak kolaydır.' },
    { day: 'Her Gün', comment: 'Duygusal yoğunluk: hafif hissetmek zordur.', mood: 'Derin hisseden', advice: 'Ağır duygular sizi boğmasın, akıtsın.' },
    { day: 'Her Gün', comment: 'Terapi, psikoloji, iyileşme: yolculuğunuz derin.', mood: 'İyileşme yolcusu', advice: 'İyileşmek doğrusal değil, sarmal bir süreçtir.' },
    { day: 'Her Gün', comment: 'Güvenilir ve sağlam: size emanet edilen sır asla çıkmaz.', mood: 'Güvenilir', advice: 'Sadakat iki yönlüdür.' },
    { day: 'Her Gün', comment: 'Kin tutma: geçmişi bırakmak zor geliyor.', mood: 'Kinci', advice: 'Kin içmek zehirdir, bırakın gitsin.' },
    { day: 'Her Gün', comment: 'Araştırmacı zeka: her şeyin derinini öğrenmek istersiniz.', mood: 'Araştırmacı', advice: 'Bilgi toplamak güzel, uygulamak daha güzel.' },
    { day: 'Her Gün', comment: 'Birleşme arzusu: partnerde tam eriyip kaybolmak.', mood: 'Birleşme arayan', advice: 'Sınırlar sağlıklı ilişkinin temelidir.' },
    { day: 'Her Gün', comment: 'Karizmatik ve manyetik: insanlar size çekilir.', mood: 'Manyetik', advice: 'Gücünüzü manipülasyona değil, ilhama kullanın.' },
    { day: 'Her Gün', comment: 'Gece kuşu: karanlık saatler size ait.', mood: 'Gece yaratığı', advice: 'Uyku düzeni de önemli, dengeyi unutmayın.' },
    { day: 'Her Gün', comment: 'Yeniden doğuş: eski ben öldü, yeni ben doğuyor.', mood: 'Dönüşen', advice: 'Değişim acı verebilir ama gereklidir.' }
  ],
  [ZodiacSign.SAGITTARIUS]: [
    { day: 'Her Gün', comment: 'Özgürlük aşkınız sınırsız: kafes hayatı sizi boğar.', mood: 'Özgür ruhlu', advice: 'Özgürlük sorumluluksuzluk değildir.' },
    { day: 'Her Gün', comment: 'Macera çağrısı: yeni yerler, yeni insanlar, yeni deneyimler.', mood: 'Maceracı', advice: 'Güvenli bölgeden çıkmak büyüme getirir.' },
    { day: 'Her Gün', comment: 'İyimserlik doğanız: bardağın hep dolu tarafını görürsünüz.', mood: 'İyimser', advice: 'Gerçekçilik de önemli, körü körüne iyimserlik tuzak olabilir.' },
    { day: 'Her Gün', comment: 'Doğruculuk: acı gerçeği söylersiniz, diplomatik değil.', mood: 'Doğrucu', advice: 'Doğru söylemek yeter, kırıcı olmak gerekmez.' },
    { day: 'Her Gün', comment: 'Felsefe ve anlam arayışı: hayatın büyük soruları sizi çeker.', mood: 'Felsefi', advice: 'Sorular cevaplardan daha değerlidir.' },
    { day: 'Her Gün', comment: 'Seyahat hasreti: farklı kültürler, uzak diyarlar...', mood: 'Gezgin', advice: 'Seyahat sadece mekanda değil, zihinde de olur.' },
    { day: 'Her Gün', comment: 'Komitment fobisi: bağlanmak özgürlüğü tehdit eder gibi.', mood: 'Bağımsız', advice: 'Bağlanmak özgürlüğü azaltmaz, çoğaltabilir.' },
    { day: 'Her Gün', comment: 'Heyecan arayışı: rutin sizi öldürür.', mood: 'Heyecan arayan', advice: 'Rutin bazen huzur da verebilir.' },
    { day: 'Her Gün', comment: 'Ateş elementi: coşkulu, hareketli, yaşam dolu.', mood: 'Ateş elementi güçlü', advice: 'Ateş ısıtır ama yakar da, denge önemli.' },
    { day: 'Her Gün', comment: 'Öğretmen ruhu: öğrendiklerinizi paylaşmak istersiniz.', mood: 'Öğretmen', advice: 'Bilgiyi dayatmadan paylaşın.' },
    { day: 'Her Gün', comment: 'Sabırsızlık: beklemek sizin işiniz değil.', mood: 'Sabırsız', advice: 'Bazı şeyler zamana ihtiyaç duyar.' },
    { day: 'Her Gün', comment: 'Geniş perspektif: ufkunuz geniş, detayları gözden kaçırabilirsiniz.', mood: 'Geniş görüşlü', advice: 'Detaylar da önemlidir.' },
    { day: 'Her Gün', comment: 'Spor, hareket, açık hava: enerji deşarjı gerekli.', mood: 'Aktif', advice: 'Fiziksel aktivite ruh halini düzenler.' },
    { day: 'Her Gün', comment: 'Abartma eğilimi: her şey büyük, muhteşem, inanılmaz...', mood: 'Abartılı', advice: 'Gerçekler de güzeldir, abartmaya gerek yok.' },
    { day: 'Her Gün', comment: 'Çok yönlülük: birçok şeyle ilgilisiniz, uzmanlaşmak zor.', mood: 'Çok yönlü', advice: 'Genelci olmak da bir uzmanlıktır.' },
    { day: 'Her Gün', comment: 'İnanç sistemi: maneviyat, din, felsefe, anlam...', mood: 'İnanan', advice: 'İnanç dogmaya dönüşmemeli.' },
    { day: 'Her Gün', comment: 'Dürüstlük: yalandan nefret edersiniz.', mood: 'Dürüst', advice: 'Dürüstlük kibarlıkla birleşebilir.' },
    { day: 'Her Gün', comment: 'Risk alma: güvenli oyunu oynamak sıkıcı.', mood: 'Risk alan', advice: 'Hesaplı risk, öngörüsüz atılganlık değil.' },
    { day: 'Her Gün', comment: 'Kültürel merak: farklı dil, din, gelenek...', mood: 'Kültürel gezgin', advice: 'Her kültürün öğretecek şeyi var.' },
    { day: 'Her Gün', comment: 'Yüksek öğrenim: akademik ilgi, araştırma, öğrenme.', mood: 'Akademik', advice: 'Öğrenmek ömür boyu devam eder.' },
    { day: 'Her Gün', comment: 'Ahlaki pusula: doğru-yanlış önemlidir.', mood: 'Ahlaki', advice: 'Gri tonlar da vardır, her şey siyah-beyaz değil.' },
    { day: 'Her Gün', comment: 'Neşe taşıyıcısı: ortamı coşturursunuz.', mood: 'Neşeli', advice: 'Her an eğlence olmak yorucu olabilir.' },
    { day: 'Her Gün', comment: 'Aşırı özgüven: bazen kendinize çok güveniyorsunuz.', mood: 'Özgüvenli', advice: 'Güven iyi, kibir değil.' },
    { day: 'Her Gün', comment: 'Plan yapmaktan çok spontan akış: anı yaşayın.', mood: 'Spontan', advice: 'Bazen plan yapmak stres azaltır.' },
    { day: 'Her Gün', comment: 'Umut ve vizyon: gelecek parlak görünür.', mood: 'Vizyoner', advice: 'Gelecek bugünden inşa edilir.' },
    { day: 'Her Gün', comment: 'Bağımsız düşünme: kitleye uymak istemezsiniz.', mood: 'Bağımsız düşünen', advice: 'Farklı olmak için farklı olmayın.' },
    { day: 'Her Gün', comment: 'Publikasyon, yazma, paylaşma: fikirlerinizi yayın.', mood: 'Yazar', advice: 'Yazmak düşünceyi netleştirir.' },
    { day: 'Her Gün', comment: 'Şaka ve mizah: hayatı ciddiye almayın.', mood: 'Şakacı', advice: 'Mizah iyi ama her zaman değil.' },
    { day: 'Her Gün', comment: 'Yabancı dil öğrenme: iletişim köprüsü.', mood: 'Dilci', advice: 'Her yeni dil yeni bir dünya açar.' },
    { day: 'Her Gün', comment: 'At, ok, hedef: sembolünüz uzağı gösterir.', mood: 'Hedef odaklı', advice: 'Yolculuk da hedef kadar önemli.' },
    { day: 'Her Gün', comment: 'Doğada olmak: açık alan, dağ, orman...', mood: 'Doğa sever', advice: 'Doğa sizi topraklar, huzur verir.' }
  ],
  [ZodiacSign.CAPRICORN]: [
    { day: 'Her Gün', comment: 'Çalışma disiplininiz demir gibi. Ama yorgunluğu fark edemiyor musunuz?', mood: 'Disiplinli', advice: 'Dinlenmek tembellik değildir.' },
    { day: 'Her Gün', comment: 'Kariyer hedefleri zirveye doğru: başarı sizin için hayati.', mood: 'Hırslı', advice: 'Zirveye çıkarken insanları ezmeyin.' },
    { day: 'Her Gün', comment: 'Sorumluluk omuzlarınızda ağır: herkes size güveniyor.', mood: 'Sorumlu', advice: 'Her şeyi tek başınıza taşımak zorunda değilsiniz.' },
    { day: 'Her Gün', comment: 'Sabır ve sebat: yavaş ve kararlı kazanır.', mood: 'Sabırlı', advice: 'Sabır iyi ama hayat çok hızlı da akabilir.' },
    { day: 'Her Gün', comment: 'Toplumsal statü: saygınlık ve tanınma önemli.', mood: 'Statü odaklı', advice: 'İçsel değer, dışsal unvandan önemli.' },
    { day: 'Her Gün', comment: 'Geleneklere bağlılık: eski yöntemler test edilmiş.', mood: 'Geleneksel', advice: 'Yenilik de bazen gereklidir.' },
    { day: 'Her Gün', comment: 'Pratik ve realist: hayal kurmak yerine yaparsınız.', mood: 'Pragmatik', advice: 'Hayal kurmak da güzeldir.' },
    { day: 'Her Gün', comment: 'Toprak elementi: sağlam, güvenilir, kalıcı.', mood: 'Toprak elementi güçlü', advice: 'Esneklik de gücü tamamlar.' },
    { day: 'Her Gün', comment: 'Zaman yönetimi ustası: her dakika planlanmış.', mood: 'Organize', advice: 'Spontanlık da yaşamın bir parçası.' },
    { day: 'Her Gün', comment: 'Duygusal mesafe: hisleri göstermek zayıflık gibi.', mood: 'Mesafeli', advice: 'Duyguları göstermek cesaret gerektirir.' },
    { day: 'Her Gün', comment: 'Mali güvenlik: bütçe, tasarruf, yatırım.', mood: 'Mali bilinçli', advice: 'Para önemli ama her şey değil.' },
    { day: 'Her Gün', comment: 'Otorite figürü: sizi dinlerler, saygı duyarlar.', mood: 'Otorite', advice: 'Otorite baskıya dönüşmemeli.' },
    { day: 'Her Gün', comment: 'Kendine sert eleştiri: kendinize çok yükleniyorsunuz.', mood: 'Eleştirel', advice: 'Kendinize şefkat gösterin.' },
    { day: 'Her Gün', comment: 'Uzun vadeli planlama: 5 yıl, 10 yıl, 20 yıl sonra...', mood: 'Stratejik', advice: 'Bugünü de yaşayın.' },
    { day: 'Her Gün', comment: 'Başarı korkusu paradoksu: başarmak sizi mutlu ediyor mu?', mood: 'Başarı tutsağı', advice: 'Başarı bir araçtır, amaç değil.' },
    { day: 'Her Gün', comment: 'Keçi sembolü: zorlu arazide tırmanma yeteneği.', mood: 'Tırmanıcı', advice: 'Yolculuk da önemli, sadece zirve değil.' },
    { day: 'Her Gün', comment: 'İş-hayat dengesi nerede? Hep çalışmak yoruyor.', mood: 'İş odaklı', advice: 'İş, hayatın sadece bir parçası.' },
    { day: 'Her Gün', comment: 'Olgun ve ciddi: çocuksu olmak size uzak.', mood: 'Olgun', advice: 'İçinizdeki çocuğa da yer açın.' },
    { day: 'Her Gün', comment: 'Kalite standartları yüksek: ortalama kabul edilemez.', mood: 'Standartlı', advice: '"Yeterince iyi" de bazen kabul edilebilir.' },
    { day: 'Her Gün', comment: 'Güven inşası yavaş: ilişkilerde temkinlisiniz.', mood: 'Temkinli', advice: 'Risk almadan güven kurulamaz.' },
    { day: 'Her Gün', comment: 'Kemik, diz, eklem: fiziksel yapınızın hassas noktası.', mood: 'Beden bilinçli', advice: 'Eklem sağlığına dikkat edin, esneme yapın.' },
    { day: 'Her Gün', comment: 'Kıdemli, yaşlı, tecrübeli: gençken bile yaşlı görünürsünüz.', mood: 'Yaşının önünde', advice: 'Gençleştikçe daha genç görünebilirsiniz.' },
    { day: 'Her Gün', comment: 'Kariyer zirvesi: CEO, müdür, lider pozisyonlar.', mood: 'Yönetici', advice: 'Liderlik hizmet demektir.' },
    { day: 'Her Gün', comment: 'Pessimizm eğilimi: en kötü senaryoyu düşünürsünüz.', mood: 'Kötümser', advice: 'Gerçekçilik ile kötümserlik farklıdır.' },
    { day: 'Her Gün', comment: 'İtibar: adınız çok değerli, lekelenmesine izin vermezsiniz.', mood: 'İtibar odaklı', advice: 'Hatalar insanidir, mükemmellik değil.' },
    { day: 'Her Gün', comment: 'Boş zaman suçluluğu: dinlenirken bile iş düşünüyorsunuz.', mood: 'Suçluluk duyan', advice: 'Dinlenmek haktır, ayrıcalık değil.' },
    { day: 'Her Gün', comment: 'Miras, aile işi, gelenek: geçmişten gelen yük.', mood: 'Miras taşıyan', advice: 'Geçmişe saygılı ama tutsak olmayın.' },
    { day: 'Her Gün', comment: 'Saturn enerjisi: sınırlar, disiplin, yapılandırma.', mood: 'Satürn etkili', advice: 'Sınırlar koruyucudur ama hapsetmemeli.' },
    { day: 'Her Gün', comment: 'Yalnız kurt: gruptan çok bireysel çalışmayı seversiniz.', mood: 'Bağımsız çalışan', advice: 'İşbirliği de güç çarpanıdır.' },
    { day: 'Her Gün', comment: 'Ağaç gibi büyüme: yavaş ama sağlam ve kalıcı.', mood: 'Yavaş büyüyen', advice: 'Yavaş büyümek sürdürülebilirdir.' },
    { day: 'Her Gün', comment: 'Başarı sonrası boşluk: hedef tamamlandı, şimdi ne?', mood: 'Anlam arayan', advice: 'Yolculuk hedeften daha anlamlıdır.' }
  ],
  [ZodiacSign.AQUARIUS]: [
    { day: 'Her Gün', comment: 'Farklı olmak sizin doğanız: kalabalıktan sıyrılırsınız.', mood: 'Farklı', advice: 'Farklılık için farklı olmayın.' },
    { day: 'Her Gün', comment: 'Gelecek vizyonu: trend setter, ileri görüşlüsünüz.', mood: 'Vizyoner', advice: 'Gelecek bugünden inşa edilir.' },
    { day: 'Her Gün', comment: 'Toplumsal duyarlılık: eşitlik, adalet, insanlık.', mood: 'Aktivist', advice: 'Değişim küçük adımlarla başlar.' },
    { day: 'Her Gün', comment: 'Duygusal mesafe: hisleri mantığa tercih edersiniz.', mood: 'Rasyonel', advice: 'Duygular da gerçektir, göz ardı etmeyin.' },
    { day: 'Her Gün', comment: 'Teknoloji tutkunu: dijital dünya size doğal habitat.', mood: 'Teknolojik', advice: 'Offline hayat da önemli.' },
    { day: 'Her Gün', comment: 'Arkadaşlık öncelikli: partnerden çok arkadaş ararsınız.', mood: 'Arkadaş odaklı', advice: 'Romantizm de güzeldir.' },
    { day: 'Her Gün', comment: 'İsyan ruhu: kurallara uymak zor gelir.', mood: 'İsyancı', advice: 'Her kural kötü değildir.' },
    { day: 'Her Gün', comment: 'Hava elementi: fikir, iletişim, sosyal ağlar.', mood: 'Hava elementi güçlü', advice: 'Topraklanmayı unutmayın.' },
    { day: 'Her Gün', comment: 'Duygusal kopukluk: hissettirmek zor gelir.', mood: 'Kopuk', advice: 'Yakınlık korkusu değil, bağlanma biçimidir.' },
    { day: 'Her Gün', comment: 'Orjinalite: yaratıcılığınız sıradışı.', mood: 'Orijinal', advice: 'Her fikir uygulanabilir olmayabilir.' },
    { day: 'Her Gün', comment: 'Komün, topluluk, kolektif: bireyden çok grup.', mood: 'Topluluk odaklı', advice: 'Bireysellik de önemli.' },
    { day: 'Her Gün', comment: 'Bilim kurgu, distopya, gelecek: ilginiz sınırsız.', mood: 'Fütürist', advice: 'Şimdiki zaman da yaşanmalı.' },
    { day: 'Her Gün', comment: 'Uranus enerjisi: ani değişim, devrim, şok.', mood: 'Uranus etkili', advice: 'İstikrar da bazen gereklidir.' },
    { day: 'Her Gün', comment: 'Sıradışı ilişki modelleri: poliamori, açık ilişki...', mood: 'Geleneksel olmayan', advice: 'Her model herkes için değildir.' },
    { day: 'Her Gün', comment: 'Soğuk görünüm: duygularınızı gizliyorsunuz.', mood: 'Mesafeli', advice: 'Soğukluk koruma mekanizmasıdır.' },
    { day: 'Her Gün', comment: 'Astroloji, astronomi, uzay: yıldızlara bağlısınız.', mood: 'Kozmik', advice: 'Evren sonsuz ama şimdi burada yaşıyorsunuz.' },
    { day: 'Her Gün', comment: 'Radikal fikirler: toplum sizi anlamakta zorlanabilir.', mood: 'Radikal', advice: 'Zamanınızın önündesiniz.' },
    { day: 'Her Gün', comment: 'Entelektüel üstünlük: zekanızla gurur duyuyorsunuz.', mood: 'Entelektüel', advice: 'Bilgi kibre dönüşmemeli.' },
    { day: 'Her Gün', comment: 'Topluluk projeleri: grup çalışması size enerji verir.', mood: 'İşbirlikçi', advice: 'Liderlik bazen tek başına karar verir.' },
    { day: 'Her Gün', comment: 'Bağımlılık korkusu: yakınlık tehdit gibi görünür.', mood: 'Bağımsızlık tutkunu', advice: 'Bağlanmak zaaf değildir.' },
    { day: 'Her Gün', comment: 'İnsanlık tarihi: geçmişten ders çıkarırsınız.', mood: 'Tarih bilinci', advice: 'Geçmiş bilgi, gelecek ümittir.' },
    { day: 'Her Gün', comment: 'Dışlanma hissi: farklı olmak yalnızlık getirir.', mood: 'Dışlanmış', advice: 'Kabilenizi bulun, orada aitsinizdir.' },
    { day: 'Her Gün', comment: 'İnovasyon: yeni yöntemler, yeni teknolojiler.', mood: 'Yenilikçi', advice: 'Her yenilik çözüm getirmez, test edin.' },
    { day: 'Her Gün', comment: 'Kötümserlik paradoksu: insanlığa umut ama bireye şüphe.', mood: 'Paradoksal', advice: 'Bireyler insanlığı oluşturur.' },
    { day: 'Her Gün', comment: 'Elektrik gibisiniz: ani, şok edici, enerjik.', mood: 'Elektrikli', advice: 'Elektrik yakar da, dikkatli olun.' },
    { day: 'Her Gün', comment: 'Kalabalıkta yalnızlık: sosyalsiniz ama yalnızsınız.', mood: 'Yalnız', advice: 'Yüzeysel sosyallik yerine derin bağ kurun.' },
    { day: 'Her Gün', comment: 'Aktivizm çağrısı: haksızlığa sessiz kalamazsınız.', mood: 'Eylemci', advice: 'Her savaş sizin savaşınız olmak zorunda değil.' },
    { day: 'Her Gün', comment: 'Eşitlik savunucusu: hiyerarşiden nefret edersiniz.', mood: 'Eşitlikçi', advice: 'Farklılıklar da gerçektir.' },
    { day: 'Her Gün', comment: 'Tanrıtanımaz, spiritüel ama kurumsal değil.', mood: 'Spiritüel ama serbest', advice: 'İnanç bireyseldir.' },
    { day: 'Her Gün', comment: 'Kumbara simgesi: bilgi taşıyıcısı, bilgelik dağıtıcısı.', mood: 'Bilgi taşıyıcı', advice: 'Bilgiyi özgürce paylaşın.' },
    { day: 'Her Gün', comment: 'Ani kopuşlar: ilişkileri ani bitirebilirsiniz.', mood: 'Keskin', advice: 'İletişim kopuştan daha iyidir.' }
  ],
  [ZodiacSign.PISCES]: [
    { day: 'Her Gün', comment: 'Empati sünger gibi: başkalarının duygularını emiyorsunuz.', mood: 'Empatik', advice: 'Enerji temizliği yapın, her şey sizin değil.' },
    { day: 'Her Gün', comment: 'Hayal dünyası zengin: gerçeklik bazen sıkıcı gelir.', mood: 'Hayalperest', advice: 'Hayaller güzel ama ayaklar yerde olmalı.' },
    { day: 'Her Gün', comment: 'Sezgiler güçlü: ama mantığa da yer açın.', mood: 'Sezgisel', advice: 'His ile mantık birlikte en güçlüdür.' },
    { day: 'Her Gün', comment: 'Kurban rolü: başkalarını kurtarmak için kendinizi feda ediyorsunuz.', mood: 'Fedakar', advice: 'Kurtarıcı olmak zorunda değilsiniz.' },
    { day: 'Her Gün', comment: 'Sınırlar bulanık: nerede siz bitersiniz, başkası başlar?', mood: 'Sınırsız', advice: 'Sınırlar sizi korur, sınırlandırmaz.' },
    { day: 'Her Gün', comment: 'Sanat ruhu: müzik, resim, şiir, dans...', mood: 'Sanatsal', advice: 'Yaratıcılık sizi iyileştirir.' },
    { day: 'Her Gün', comment: 'Kaçış mekanizmaları: uyku, hayal, alkol, seri...', mood: 'Kaçış arayan', advice: 'Gerçeklikle yüzleşmek özgürleştirir.' },
    { day: 'Her Gün', comment: 'Su elementi en derin: okyanus gibi uçsuz bucaksızsınız.', mood: 'Su elementi en derin', advice: 'Derinlik boğulmak değil, akıştır.' },
    { day: 'Her Gün', comment: 'Ağlama: gözyaşları sizde doğal, terapi gibi.', mood: 'Duygusal', advice: 'Ağlamak güçtür, zaaf değil.' },
    { day: 'Her Gün', comment: 'Mistik ve okült: görünmez dünya sizi çeker.', mood: 'Mistik', advice: 'Spiritüellik ile gerçeklik dengelenebilir.' },
    { day: 'Her Gün', comment: 'Pasif agresif: doğrudan çatışmak yerine dolaylı.', mood: 'Dolaylı', advice: 'Net iletişim sağlıklıdır.' },
    { day: 'Her Gün', comment: 'Kurtuluş arayışı: dünyadan kaçmak istersiniz.', mood: 'Arayışta', advice: 'Kurtuluş içeride bulunur, dışarıda değil.' },
    { day: 'Her Gün', comment: 'Müzik tedavi: melodi ruhu besler.', mood: 'Müzik tutkunu', advice: 'Günde 20 dakika müzik şifadır.' },
    { day: 'Her Gün', comment: 'Bağımlılık eğilimi: duygulardan kaçış yolları.', mood: 'Bağımlılık riski', advice: 'Sağlıklı başa çıkma yöntemleri öğrenin.' },
    { day: 'Her Gün', comment: 'İki balık sembolü: zıt yönlere gitmek istersiniz.', mood: 'İkilemde', advice: 'Bir yön seçmek gerekebilir.' },
    { day: 'Her Gün', comment: 'Evrensel sevgi: herkese şefkat duyarsınız.', mood: 'Şefkatli', advice: 'Kendinize de şefkat gösterin.' },
    { day: 'Her Gün', comment: 'Uyku düzeni bozuk: rüya dünyası daha çekici.', mood: 'Uyku düzensiz', advice: 'Düzenli uyku ruh sağlığının temelidir.' },
    { day: 'Her Gün', comment: 'Yardım eli: ihtiyaç duyana uzanırsınız.', mood: 'Yardım eden', advice: 'Yardım ederken kendinizi tüketmeyin.' },
    { day: 'Her Gün', comment: 'Neptün enerjisi: illüzyon, hayal, spiritüellik.', mood: 'Neptün etkili', advice: 'İllüzyon ile gerçeği ayırt edin.' },
    { day: 'Her Gün', comment: 'Romantik ruh: aşk size peri masalı gibi.', mood: 'Romantik', advice: 'Gerçek aşk mükemmel değildir.' },
    { day: 'Her Gün', comment: 'Mağduriyet: kendinizi kurban gibi hissediyorsunuz.', mood: 'Mağdur', advice: 'Güç sizde, mağdur değilsiniz.' },
    { day: 'Her Gün', comment: 'İyileştirici: dokunuş, enerji, şifa...', mood: 'Şifacı', advice: 'Kendi yaranızı da iyileştirin.' },
    { day: 'Her Gün', comment: 'Belirsizlik rahat: net olmak zorunda değilsiniz.', mood: 'Akışkan', advice: 'Bazen netlik gerekliliktir.' },
    { day: 'Her Gün', comment: 'Deniz, su, okyanus: eliniz su değerse huzur bulursunuz.', mood: 'Su seven', advice: 'Suyla temas günlük olmalı.' },
    { day: 'Her Gün', comment: 'Rüya analizi: bilinçaltı mesajları çözümleyebilirsiniz.', mood: 'Rüya yorumcu', advice: 'Rüyalar rehberdir.' },
    { day: 'Her Gün', comment: 'Karizmatik çekim: insanlar size güvenir, açılır.', mood: 'Güven verici', advice: 'Güven istismar edilmemeli.' },
    { day: 'Her Gün', comment: 'Zaman algısı farklı: geç kalma normaldir.', mood: 'Zamansız', advice: 'Başkaları zaman sınırı koyar, saygı gösterin.' },
    { day: 'Her Gün', comment: 'Maneviyat arayışı: din, yoga, meditasyon...', mood: 'Manevi', advice: 'Spiritüellik dogma değil, deneyimdir.' },
    { day: 'Her Gün', comment: 'Ayak sağlığı: burç sembolünüz ayak.', mood: 'Beden bilinçli', advice: 'Ayak masajı, refleksoloji deneyin.' },
    { day: 'Her Gün', comment: 'Sonsuzluk hissi: zamanın ötesinde yaşıyorsunuz.', mood: 'Sonsuz', advice: 'Şimdi de önemlidir.' },
    { day: 'Her Gün', comment: 'Evrenle bir olma: birleşme, çözülme, kaybolma...', mood: 'Birlik arayan', advice: 'Kendinizi kaybetmeden birlik mümkün.' }
  ]
};

// Günlük burç yorumu getirme fonksiyonu
export const getDailyZodiacComment = (zodiacSign: ZodiacSign): DailyZodiacComment => {
  const comments = DAILY_ZODIAC_COMMENTS[zodiacSign];
  if (!comments || comments.length === 0) {
    return {
      day: 'Bilinmiyor',
      comment: 'Burç yorumu bulunamadı.',
      mood: 'Bilinmiyor',
      advice: 'Daha sonra tekrar deneyin.'
    };
  }
  
  // Bugünün tarihini seed olarak kullan (her gün aynı yorum ama her gün farklı)
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Seed'e göre rastgele (ama tutarlı) index seç
  const randomIndex = dayOfYear % comments.length;
  
  return comments[randomIndex];
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
