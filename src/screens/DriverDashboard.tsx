import React, { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import NetInfo from '@react-native-community/netinfo';
import { Activity, Car, CheckCircle2, Power, ShieldCheck } from 'lucide-react-native';
import LiveMap from '../components/LiveMap';
import EmergencyMechanicRequest from '../components/EmergencyMechanicRequest';
import PaymentBox from '../components/PaymentBox';
import ReviewReportBox from '../components/ReviewReportBox';
import TroubleSearch from '../components/TroubleSearch';
import SOSButton from '../components/SOSButton';
import VehicleHealth from '../components/VehicleHealth';
import { addServiceHistory, AppHeader, BottomNavigation, QuickActionCard, StatCard, StatusBadge } from '../components';
import { supabase } from '../supabaseClient';

type HistoryItem = { id: string; title: string; date: string; partner: string; amount: string; status: 'completed' | 'pending' | 'cancelled'; vehicle?: string; location?: string };
const BACKGROUND_LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) { console.error('Background location task:', error); return; }
  const locations = data?.locations;
  if (!locations?.length) return;
  const { latitude, longitude } = locations[0].coords;
  try {
    await supabase.from('vehicle_locations').upsert({ driver_id: 'v1', latitude, longitude, updated_at: new Date().toISOString() });
  } catch (err) {
    console.log('Supabase background push failed:', err);
  }
});

export default function DriverDashboard({ route, navigation }: any) {
  useKeepAwake();
  const driverName = 'মো: কুদ্দুস মিয়া';
  const driverId = route?.params?.driverId || 'v1';
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 23.8103, longitude: 90.4125 });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'searching' | 'list' | 'accepted'>('idle');
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [detectedProblemTypes] = useState<string[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<any[]>([]);
  const [hasExtraBill, setHasExtraBill] = useState(false);
  const [isExtraBillConfirmed, setIsExtraBillConfirmed] = useState(false);
  const [isBillPaid, setIsBillPaid] = useState(false);
  const [pendingAmount] = useState(500);
  const [extraCharges, setExtraCharges] = useState(0);
  const [customerVehicle] = useState('Car');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<HistoryItem[]>([
    { id: 'd-demo-1', title: 'Engine overheating assistance', date: '২০২৬-০৯-11', partner: 'আব্দুর রহিম', amount: '৳৯০০', status: 'completed', vehicle: 'Delivery Truck X-12', location: 'Dhaka' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      } catch (error) { console.log('Initial location fetch failed:', error); }
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    const toggleTracking = async () => {
      try {
        if (isOnline) {
          const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
          const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
          if (fgStatus !== 'granted' || bgStatus !== 'granted') {
            if (mounted) setIsOnline(false);
            Alert.alert('পারমিশন রিফিউজড', 'লাইভ duty tracking-এর জন্য location permission দিন।');
            return;
          }
          const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
          if (!registered) await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 1, foregroundService: { notificationTitle: 'ড্রাইভার ডিউটি মোড সক্রিয়', notificationBody: 'ব্যাকগ্রাউন্ডে ট্র্যাকিং লাইভ রয়েছে...', notificationColor: '#10B981' } });
        } else {
          const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
          if (registered) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        }
      } catch (error) { console.log('Tracking toggle error:', error); }
    };
    toggleTracking();
    return () => { mounted = false; };
  }, [isOnline]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected === false) Alert.alert('নেটওয়ার্ক অফলাইন!', 'ইন্টারনেট বিচ্ছিন্ন হয়েছে।', [{ text: 'ঠিক আছে', onPress: () => navigation.navigate('OfflineAssistance') }]);
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    setIsOnline(false);
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'AuthScreen' }] });
  };

  const handleFindMechanic = (_mode: 'manual' | 'auto', mechanicsList: any[]) => {
    if (!selectedProblems.length && !detectedProblemTypes.length) return Alert.alert('দুঃখিত', 'দয়া করে অন্তত একটি সমস্যা সিলেক্ট করুন।');
    setFilteredMechanics(mechanicsList); setRequestStatus('searching');
    setTimeout(() => setRequestStatus('list'), 1500);
  };
  const handleSelectMechanic = (mechanic: any) => { setSelectedMechanic(mechanic); setExtraCharges(0); setHasExtraBill(false); setIsExtraBillConfirmed(false); setIsBillPaid(false); setRequestStatus('accepted'); };
  const handlePaymentSuccess = () => { setIsPaymentModalVisible(false); setIsBillPaid(true); setIsRatingModalVisible(true); };
  const handleRatingComplete = () => {
    if (selectedMechanic) { const item = { id: `driver-${Date.now()}`, title: selectedMechanic.specialty || 'Roadside assistance', date: new Date().toISOString().slice(0,10), partner: selectedMechanic.name, amount: `৳${pendingAmount + extraCharges}`, status: 'completed' as const, vehicle: 'Delivery Truck X-12', location: 'Current location' }; addServiceHistory('driver', item); setServiceHistory(prev => [item, ...prev]); }
    setIsRatingModalVisible(false); setRequestStatus('idle'); setSelectedMechanic(null);
  };
  const handleNav = (tab: 'Home' | 'History' | 'Notifications' | 'Settings') => {
    if (tab === 'Home') return; if (tab === 'History') return navigation.navigate('ServiceHistory', { role: 'driver', history: serviceHistory });
    if (tab === 'Notifications') return navigation.navigate('NotificationScreen', { role: 'driver' });
    navigation.navigate('SettingsScreen', { role: 'driver' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <AppHeader name={driverName} email="Delivery Truck X-12" role="driver" avatarText="K" onProfile={() => navigation.navigate('ProfileScreen', { role: 'driver' })} onSettings={() => navigation.navigate('SettingsScreen', { role: 'driver' })} onLogout={handleLogout} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}><View style={styles.heroIcon}><Car size={24} color="#FF8A00" /></View><View style={{ flex: 1 }}><Text style={styles.heroTitle}>Driver Control Center</Text><Text style={styles.heroSub}>লাইভ duty, vehicle health ও rescue assistance</Text></View><StatusBadge text={isOnline ? 'ONLINE' : 'OFFLINE'} type={isOnline ? 'success' : 'danger'} /></View>

        <View style={styles.statsRow}><StatCard label="Duty" value={isOnline ? 'Active' : 'Off'} icon={<Power size={18} color="#FF8A00" />} accentColor="#FF8A00" compact /><StatCard label="Services" value={String(serviceHistory.length)} icon={<CheckCircle2 size={18} color="#10B981" />} accentColor="#10B981" compact /></View>

        <View style={[styles.dutyCard, isOnline && styles.dutyCardOn]}><View style={styles.dutyLeft}><View style={[styles.powerIcon, { backgroundColor: isOnline ? '#123B2A' : '#17263A' }]}><Power size={21} color={isOnline ? '#34D399' : '#94A3B8'} /></View><View style={{ flex: 1 }}><Text style={styles.dutyTitle}>অন-ডিউটি / Location Broadcast</Text><Text style={styles.dutySub}>{isOnline ? 'আপনার গাড়ি এখন লাইভ দেখা যাচ্ছে' : 'ডিউটি চালু করলে live tracking শুরু হবে'}</Text></View></View><Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: '#334155', true: '#059669' }} thumbColor="#F8FAFC" /></View>

        <View style={styles.mapCard}><LiveMap currentLocation={currentLocation} userRole="driver" /></View>
        <VehicleHealth driverId={driverId} />

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionCard title="Service History" subtitle="আপনার আগের rescue ও service দেখুন" icon={<Activity size={20} color="#FF8A00" />} accentColor="#FF8A00" onPress={() => navigation.navigate('ServiceHistory', { role: 'driver', history: serviceHistory })} />
        <QuickActionCard title="Offline Assistance" subtitle="নেট না থাকলেও emergency support" icon={<ShieldCheck size={20} color="#38BDF8" />} accentColor="#38BDF8" onPress={() => navigation.navigate('OfflineAssistance')} />

        <EmergencyMechanicRequest requestStatus={requestStatus} selectedProblems={selectedProblems} detectedProblemTypes={detectedProblemTypes} filteredMechanics={filteredMechanics} selectedMechanic={selectedMechanic} hasExtraBill={hasExtraBill} isExtraBillConfirmed={isExtraBillConfirmed} isBillPaid={isBillPaid} pendingAmount={pendingAmount} extraCharges={extraCharges} customerVehicle={customerVehicle} onToggleProblem={(id) => setSelectedProblems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} onFindMechanic={handleFindMechanic} onSelectMechanic={handleSelectMechanic} onRequestStatusChange={setRequestStatus} onConfirmExtraBill={() => setIsExtraBillConfirmed(true)} onOpenPayment={() => setIsPaymentModalVisible(true)} onOpenAiModal={() => setIsAiModalVisible(true)} />

        {requestStatus === 'accepted' && <View style={styles.acceptedCard}><Activity size={22} color="#F59E0B" /><View style={{ flex: 1 }}><Text style={styles.acceptedTitle}>মেকানিক আসছে</Text><Text style={styles.acceptedSub}>{selectedMechanic?.name || 'এক্সপার্ট মেকানিক'} আপনার location-এ যাচ্ছে।</Text></View></View>}
      </ScrollView>

      <Modal visible={isAiModalVisible} transparent animationType="slide" onRequestClose={() => setIsAiModalVisible(false)}><TroubleSearch onMechanicSelect={(mech: any) => { setIsAiModalVisible(false); handleSelectMechanic(mech); }} /></Modal>
      <Modal visible={isPaymentModalVisible} transparent animationType="fade" onRequestClose={() => setIsPaymentModalVisible(false)}><View style={styles.modalOverlay}><View style={styles.modalCard}><PaymentBox requestId="driver_req_001" baseFee={pendingAmount} extraCharges={extraCharges} onPaymentSuccess={handlePaymentSuccess} /></View></View></Modal>
      <Modal visible={isRatingModalVisible} transparent animationType="fade" onRequestClose={handleRatingComplete}><View style={styles.modalOverlay}><View style={styles.modalCard}><ReviewReportBox requestId="driver_req_001" fromUserId={driverId} toUserId={selectedMechanic?.id || 'mech_123'} userRole="driver" onComplete={handleRatingComplete} /></View></View></Modal>
      <SOSButton userId={driverId} currentLocation={currentLocation} userRole="driver" />
      <BottomNavigation activeTab="Home" onChange={handleNav} accentColor="#FF8A00" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' },
  scroll: { padding: 16, paddingBottom: 22 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  heroIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#FF8A0022', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900' },
  heroSub: { color: '#94A3B8', fontSize: 10, marginTop: 3, lineHeight: 15 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  dutyCard: { backgroundColor: '#0D1B2D', borderRadius: 16, padding: 13, borderWidth: 1, borderColor: '#1B2B40', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  dutyCardOn: { borderColor: '#05966966', backgroundColor: '#064E3B18' },
  dutyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  powerIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dutyTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '800' },
  dutySub: { color: '#94A3B8', fontSize: 10, lineHeight: 15, marginTop: 3 },
  mapCard: { height: 250, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1B2B40', marginBottom: 14 },
  sectionTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '900', marginBottom: 10 },
  acceptedCard: { padding: 13, borderRadius: 15, backgroundColor: '#3D2D0A', borderWidth: 1, borderColor: '#F59E0B55', flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
  acceptedTitle: { color: '#FBBF24', fontSize: 13, fontWeight: '900' },
  acceptedSub: { color: '#CBD5E1', fontSize: 10, lineHeight: 15, marginTop: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.76)', justifyContent: 'center', padding: 15 },
  modalCard: { backgroundColor: '#06111F', borderRadius: 18, padding: 10, width: '100%', maxHeight: '92%', overflow: 'hidden' },
});
