import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '../components/Modal';

export default function BirthChartPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [utcDt, setUtcDt] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setModalVisible(true);
    setStep(0);
    setResult(null);
    setError(null);
  };

  const close = () => {
    setModalVisible(false);
  };

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: name || 'Kullanıcı',
        utc_dt: utcDt,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };

      const res = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
      setModalVisible(false);
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>Doğum Haritası</ThemedText>
        <ThemedText style={styles.help}>Kullanıcının doğum bilgilerini adım adım girerek doğum haritası oluşturun.</ThemedText>

        <TouchableOpacity style={styles.button} onPress={open}>
          <Ionicons name="planet" size={18} color="#fff" />
          <ThemedText style={styles.buttonText}>Doğum Haritası Oluştur</ThemedText>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultBox}>
            <ThemedText style={{ fontWeight: '700', marginBottom: 8 }}>Sunucudan Gelen Yanıt</ThemedText>
            <ThemedText>{JSON.stringify(result, null, 2)}</ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.resultBox}>
            <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} onClose={close}>
        <ThemedText style={styles.modalTitle}>Adım {step + 1} / 4</ThemedText>

        {step === 0 && (
          <View>
            <ThemedText>İsim</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ad"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        {step === 1 && (
          <View>
            <ThemedText>UTC Tarih-Saat</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="1990-05-15T10:30:00"
              placeholderTextColor="#aaa"
              value={utcDt}
              onChangeText={setUtcDt}
            />
            <ThemedText style={{ marginTop: 8, fontSize: 12 }}>(YYYY-MM-DDTHH:MM:SS)</ThemedText>
          </View>
        )}

        {step === 2 && (
          <View>
            <ThemedText>Enlem (lat)</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="41.0082"
              placeholderTextColor="#aaa"
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <ThemedText>Boylam (lon)</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="28.9784"
              placeholderTextColor="#aaa"
              value={lon}
              onChangeText={setLon}
              keyboardType="numeric"
            />
          </View>
        )}

        <View style={styles.modalButtons}>
          {step > 0 ? (
            <TouchableOpacity style={styles.navButton} onPress={back}>
              <ThemedText>Geri</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 72 }} />
          )}

          {step < 3 ? (
            <TouchableOpacity style={styles.navButton} onPress={next}>
              <ThemedText>İleri</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={loading}>
              <ThemedText style={{ color: '#fff' }}>{loading ? 'Gönderiliyor...' : 'Gönder'}</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  help: { marginBottom: 18, color: '#ddd' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b21a8',
    padding: 12,
    borderRadius: 12,
    width: '60%',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  resultBox: { marginTop: 18, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' },

  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    color: '#fff'
  },
  modalButtons: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#10b981'
  }
});
