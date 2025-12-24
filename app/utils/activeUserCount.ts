// utils/activeUserCount.ts
// Utility to calculate the dynamic active user count for global chat

export function calculateActiveUserCount(date: Date = new Date()): number {
  const now = date;
  const hour = now.getHours();

  let minCount: number;
  let maxCount: number;

  // Saatlere göre aktif kullanıcı aralığı
  if (hour >= 6 && hour < 12) {
    // Sabah (06:00-11:59): 100-200 arası
    minCount = 100;
    maxCount = 200;
  } else if (hour >= 12 && hour < 18) {
    // Öğlen (12:00-17:59): 300-500 arası
    minCount = 300;
    maxCount = 500;
  } else {
    // Akşam/Gece (18:00-05:59): 1000+
    minCount = 1000;
    maxCount = 1500;
  }

  // Random sayı üret (her dakika değişmesin diye saat bazlı)
  const seed = now.getFullYear() + now.getMonth() + now.getDate() + Math.floor(hour / 2);
  const random = (seed * 9301 + 49297) % 233280;
  const normalized = random / 233280;

  const count = Math.floor(minCount + (maxCount - minCount) * normalized);
  return count;
}
