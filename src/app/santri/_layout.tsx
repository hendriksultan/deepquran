import { Redirect, Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ParticipantNavigation from '../../components/santri/ParticipantNavigation';
export default function ParticipantLayout() {
  const { user, ready, startupError } = useAuth();
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#17654f" /></View>;
  if (!user || startupError) return <Redirect href="/login" />;
  return <View style={{ flex: 1, backgroundColor: '#f6f8f7' }}><View style={{ flex: 1 }}><Slot /></View><ParticipantNavigation /></View>;
}
