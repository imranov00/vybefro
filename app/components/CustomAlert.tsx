import { Alert, AlertButton } from 'react-native';

interface CustomAlertProps {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const showCustomAlert = ({
  title,
  message,
  type = 'info',
  confirmText = 'Tamam',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  showCancel = false
}: CustomAlertProps) => {
  const buttons: AlertButton[] = [];

  if (showCancel) {
    buttons.push({
      text: cancelText,
      style: 'cancel',
      onPress: onCancel
    });
  }

  buttons.push({
    text: confirmText,
    style: type === 'error' ? 'destructive' : 'default',
    onPress: onConfirm
  });

  Alert.alert(title, message, buttons, { cancelable: false });
};

// VYBE uygulamasına özel alert fonksiyonları
export const showVybeError = (message: string, onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Hata',
    message,
    type: 'error',
    confirmText: 'Tamam',
    onConfirm
  });
};

export const showVybeSuccess = (message: string, onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Başarılı',
    message,
    type: 'success',
    confirmText: 'Tamam',
    onConfirm
  });
};

export const showVybeWarning = (message: string, onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Uyarı',
    message,
    type: 'warning',
    confirmText: 'Tamam',
    onConfirm
  });
};

export const showVybeInfo = (message: string, onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Bilgi',
    message,
    type: 'info',
    confirmText: 'Tamam',
    onConfirm
  });
};

// Oturum sonlandırma için özel alert
export const showSessionTimeoutAlert = (onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Oturum Sonlandı',
    message: 'Hesabınız zaman aşımına uğradı. Güvenlik nedeniyle oturumunuz sonlandırıldı. Lütfen tekrar giriş yapınız.',
    type: 'warning',
    confirmText: 'Giriş Yap',
    onConfirm
  });
};

// Login hataları için özel alert
export const showLoginError = (message: string, onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Giriş Hatası',
    message,
    type: 'error',
    confirmText: 'Tamam',
    onConfirm
  });
};

// Register hataları için özel alert
export const showRegisterError = (message: string, onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Kayıt Hatası',
    message,
    type: 'error',
    confirmText: 'Tamam',
    onConfirm
  });
};

// Register başarı için özel alert
export const showRegisterSuccess = (onConfirm?: () => void) => {
  showCustomAlert({
    title: 'Başarılı',
    message: 'Kaydınız başarıyla tamamlandı. Giriş yapabilirsiniz.',
    type: 'success',
    confirmText: 'Tamam',
    onConfirm
  });
};

// Default export
export default {
  showSessionTimeoutAlert
};

