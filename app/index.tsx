import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isLoggedIn, isLoading } = useAuth();
  
  // AuthContext yükleniyor durumunda loading göster
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9733EE" />
      </View>
    );
  }
  
  // Token varsa ana sayfaya, yoksa login sayfasına yönlendir
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/splash" />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
}); 