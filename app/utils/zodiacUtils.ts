export const calculateZodiacSign = (birthDate: Date): string => {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;

  const zodiacSigns = {
    'Koç': [[3, 21, 4, 19]],
    'Boğa': [[4, 20, 5, 20]],
    'İkizler': [[5, 21, 6, 20]],
    'Yengeç': [[6, 21, 7, 22]],
    'Aslan': [[7, 23, 8, 22]],
    'Başak': [[8, 23, 9, 22]],
    'Terazi': [[9, 23, 10, 22]],
    'Akrep': [[10, 23, 11, 21]],
    'Yay': [[11, 22, 12, 21]],
    'Oğlak': [[12, 22, 1, 19]],
    'Kova': [[1, 20, 2, 18]],
    'Balık': [[2, 19, 3, 20]]
  };

  for (const [sign, [[startMonth, startDay, endMonth, endDay]]] of Object.entries(zodiacSigns)) {
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return sign;
    }
  }
  
  // Oğlak burcu için özel kontrol (yıl sonu - yıl başı)
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return 'Oğlak';
  }

  return '';
};

// İngilizce burç adını Türkçe burç adına dönüştüren yardımcı fonksiyon
export const formatZodiacSign = (zodiacSign: string): string => {
  const zodiacTranslations: Record<string, { name: string, emoji: string }> = {
    'ARIES': { name: 'Koç', emoji: '♈' },
    'TAURUS': { name: 'Boğa', emoji: '♉' },
    'GEMINI': { name: 'İkizler', emoji: '♊' },
    'CANCER': { name: 'Yengeç', emoji: '♋' },
    'LEO': { name: 'Aslan', emoji: '♌' },
    'VIRGO': { name: 'Başak', emoji: '♍' },
    'LIBRA': { name: 'Terazi', emoji: '♎' },
    'SCORPIO': { name: 'Akrep', emoji: '♏' },
    'SAGITTARIUS': { name: 'Yay', emoji: '♐' },
    'CAPRICORN': { name: 'Oğlak', emoji: '♑' },
    'AQUARIUS': { name: 'Kova', emoji: '♒' },
    'PISCES': { name: 'Balık', emoji: '♓' }
  };

  // Burç bilgisi bulunamazsa olduğu gibi döndür
  const zodiacInfo = zodiacTranslations[zodiacSign.toUpperCase()];
  if (!zodiacInfo) return zodiacSign;
  
  // Emoji ve Türkçe ismi döndür
  return `${zodiacInfo.emoji} ${zodiacInfo.name}`;
};

// Default export
const zodiacUtils = {
  calculateZodiacSign,
  formatZodiacSign
};

export default zodiacUtils; 