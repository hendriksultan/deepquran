import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
export default function Login() {
  const { user, ready, login, startupError, restore } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [visible, setVisible] = useState(false);
  async function submit() {
    if (busy) return;
    if (!email.trim() || !password) { setError('Isi email dan password Anda.'); return; }
    setBusy(true); setError('');
    try { await login(email, password); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  if (!ready) return <ActivityIndicator style={{ flex: 1 }} color="#059669" />;
  if (user && !startupError) return <Redirect href="/santri/dashboard" />;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#064e3b' }}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#6ee7b7', textAlign: 'center', fontSize: 16 }}>Ahlan Wa Sahlan</Text>
      <Text style={{ color: 'white', textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginBottom: 28 }}>Deep Quran Academy</Text>
      <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 480, alignSelf: 'center', gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827' }}>Masuk sebagai peserta</Text>
        <Text style={{ color: '#4b5563' }}>Gunakan akun yang sama dengan aplikasi web.</Text>
        {startupError ? <><Text style={{ color: '#b91c1c' }}>{startupError}</Text><TouchableOpacity onPress={() => void restore()}><Text style={{ color: '#047857' }}>Coba pulihkan sesi</Text></TouchableOpacity></> : null}
        <TextInput accessibilityLabel="Email" placeholder="Email" placeholderTextColor="#6b7280" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, color: '#111827' }} />
        <TextInput accessibilityLabel="Password" placeholder="Password" placeholderTextColor="#6b7280" value={password} onChangeText={setPassword} secureTextEntry={!visible} autoCapitalize="none" autoComplete="current-password" onSubmitEditing={() => void submit()} style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, color: '#111827' }} />
        <TouchableOpacity onPress={() => setVisible(!visible)}><Text style={{ color: '#047857' }}>{visible ? 'Sembunyikan' : 'Tampilkan'} password</Text></TouchableOpacity>
        {error ? <Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text> : null}
        <TouchableOpacity disabled={busy} onPress={() => void submit()} style={{ backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center', opacity: busy ? 0.6 : 1 }}>{busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Masuk</Text>}</TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
