import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Car, ShieldCheck, Wrench } from 'lucide-react-native';
import LiveMap from '../components/LiveMap';
import SubscriptionPackages from '../components/SubscriptionPackages';
import PaymentBox from '../components/PaymentBox';
import ReviewReportBox from '../components/ReviewReportBox';
import TroubleSearch from '../components/TroubleSearch';
import SOSButton from '../components/SOSButton';
import EmergencyMechanicRequest from '../components/EmergencyMechanicRequest';
import VehicleHealth from '../components/VehicleHealth';
import { addServiceHistory, AppHeader, BottomNavigation, QuickActionCard, StatCard, StatusBadge } from '../components';
import { supabase } from '../supabaseClient';
import { layout } from '../theme/layout';

type Mechanic = {
  id: string; name: string; specialty: string; vehicle: string; problemType: string;
  rating: string; reviews: string; distance: string; phone: string;
};

type HistoryItem = { id: string; title: string; date: string; partner: string; amount: string; status: 'completed' | 'pending' | 'cancelled'; vehicle?: string; location?: string };

type CustomerProfile = { name: string; phone: string; email: string; userId: string };

export default function CustomerDashboard({ route, navigation }: any) {
  const customerVehicle = 'Car';
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'searching' | 'list' | 'accepted'>('idle');
  const [customerProfile] = useState<CustomerProfile>({
    name: 'বখতিয়ার', phone: '017XXXXXXXX', email: route?.params?.email || 'bakhtiar@cse.com',
    userId: route?.params?.userId || '7e9ed702-24c6-4d52-9ff8-7db41276ad4c',
  });
  const [customerLocation, setCustomerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [detectedProblemTypes] = useState<string[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [pendingAmount, setPendingAmount] = useState(500);
  const [extraCharges, setExtraCharges] = useState(0);
  const [isBillPaid, setIsBillPaid] = useState(false);
  const [hasExtraBill, setHasExtraBill] = useState(false);
  const [isExtraBillConfirmed, setIsExtraBillConfirmed] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<HistoryItem[]>([
    { id: 'customer-demo-1', title: 'Engine overheating assistance', date: '২০২৬-০৯-05', partner: 'আব্দুর রহিম', amount: '৳৯০০', status: 'completed', vehicle: 'Car', location: 'Dhaka' },
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const fallback = { latitude: 23.8103, longitude: 90.4125 };
        if (mounted) { setCustomerLocation(fallback); setIsMapLoading(false); }
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (mounted) setCustomerLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        }
      } catch (error) {
        console.log('Location error:', error);
        if (mounted) { setCustomerLocation({ latitude: 23.8103, longitude: 90.4125 }); setIsMapLoading(false); }
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (requestStatus !== 'accepted' || hasExtraBill) return;
    const timer = setTimeout(() => { setHasExtraBill(true); setExtraCharges(300); Alert.alert('⚠️ অতিরিক্ত বিল', 'মেকানিক নতুন পার্টসের জন্য ৳৩০০ অতিরিক্ত বিল যোগ করেছেন।'); }, 5000);
    return () => clearTimeout(timer);
  }, [requestStatus, hasExtraBill]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.reset({ index: 0, routes: [{ name: 'AuthScreen' }] });
    } catch (error: any) {
      Alert.alert('Logout Error', error?.message || 'লগআউট করতে সমস্যা হয়েছে।');
    }
  };

  const handleSelectMechanic = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic); setPendingAmount(500); setExtraCharges(0); setHasExtraBill(false);
    setIsExtraBillConfirmed(false); setIsBillPaid(false); setRequestStatus('accepted');
  };

  const handleFindMechanic = (mode: 'manual' | 'auto', mechanicsList: Mechanic[]) => {
    if ([...selectedProblems, ...detectedProblemTypes].length === 0) {
      Alert.alert('দুঃখিত', 'দয়া করে অন্তত একটি সমস্যা সিলেক্ট করুন।'); return;
    }
    setRequestStatus('searching');
    setTimeout(() => { setFilteredMechanics(mechanicsList); mode === 'auto' && mechanicsList.length ? handleSelectMechanic(mechanicsList[0]) : setRequestStatus('list'); }, 1500);
  };

  const handleBottomNav = (tab: 'Home' | 'History' | 'Notifications' | 'Settings') => {
    if (tab === 'Home') return;
    if (tab === 'History') return navigation.navigate('ServiceHistory', { role: 'customer', history: serviceHistory });
    if (tab === 'Notifications') return navigation.navigate('NotificationScreen', { role: 'customer' });
    navigation.navigate('SettingsScreen', { role: 'customer' });
  };

  const handlePaymentSuccess = () => { setIsPaymentModalVisible(false); setIsBillPaid(true); setIsRatingModalVisible(true); };
  const handleRatingSubmitFinished = () => {
    if (selectedMechanic) {
      const item = { id: `customer-${Date.now()}`, title: selectedMechanic.specialty || 'Roadside assistance', date: new Date().toISOString().slice(0,10), partner: selectedMechanic.name, amount: `৳${pendingAmount + extraCharges}`, status: 'completed' as const, vehicle: customerVehicle, location: 'Current location' }; addServiceHistory('customer', item); setServiceHistory(prev => [item, ...prev]);
    }
    setIsRatingModalVisible(false); setRequestStatus('idle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <AppHeader
        name={customerProfile.name} email={customerProfile.email} role="customer" avatarText={customerProfile.name.charAt(0)}
        onProfile={() => navigation.navigate('ProfileScreen', { role: 'customer', userId: customerProfile.userId })}
        onSettings={() => navigation.navigate('SettingsScreen', { role: 'customer' })}
        onLogout={handleLogout}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          {isMapLoading || !customerLocation ? <ActivityIndicator size="large" color="#1687FF" style={styles.mapLoader} /> : <LiveMap userRole="customer" currentLocation={customerLocation} targetLocation={requestStatus === 'accepted' && selectedMechanic ? { latitude: 23.815, longitude: 90.415 } : null} />}
        </View>

        <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>Vehicle Overview</Text><Text style={styles.sectionSub}>Your car at a glance</Text></View><StatusBadge text="Healthy" type="success" /></View>
        <View style={styles.statsRow}>
          <StatCard label="Vehicle" value={customerVehicle} icon={<Car size={18} color="#1687FF" />} accentColor="#1687FF" compact />
          <StatCard label="Services" value={String(serviceHistory.length)} icon={<Wrench size={18} color="#10B981" />} accentColor="#10B981" compact />
        </View>
        <VehicleHealth driverId="c1" />

        <View style={styles.quickArea}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActionCard title="Service History" subtitle="See your previous repairs and rescue jobs" icon={<ShieldCheck size={20} color="#16C784" />} accentColor="#16C784" onPress={() => navigation.navigate('ServiceHistory', { role: 'customer', history: serviceHistory })} />
        </View>

        {requestStatus === 'idle' && (
          <View style={styles.subscriptionSection}>
            <View style={styles.subscriptionHeaderRow}><Text style={styles.sectionTitlePremium}>💎 এক্সক্লুসিভ সাবস্ক্রিপশন</Text><View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>PRO</Text></View></View>
            <SubscriptionPackages onBack={() => {}} onSubscribeSuccess={() => Alert.alert('সফল', 'সাবস্ক্রিপশন সফল হয়েছে')} />
          </View>
        )}

        <EmergencyMechanicRequest
          requestStatus={requestStatus} selectedProblems={selectedProblems} detectedProblemTypes={detectedProblemTypes}
          filteredMechanics={filteredMechanics} selectedMechanic={selectedMechanic} hasExtraBill={hasExtraBill}
          isExtraBillConfirmed={isExtraBillConfirmed} isBillPaid={isBillPaid} pendingAmount={pendingAmount} extraCharges={extraCharges}
          customerVehicle={customerVehicle} onToggleProblem={(id) => setSelectedProblems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
          onFindMechanic={handleFindMechanic} onSelectMechanic={handleSelectMechanic} onRequestStatusChange={setRequestStatus}
          onConfirmExtraBill={() => setIsExtraBillConfirmed(true)}
          onOpenPayment={() => { if (hasExtraBill && !isExtraBillConfirmed) return Alert.alert('⚠️ অ্যাকশন প্রয়োজন', 'আগে অতিরিক্ত বিলটি কনফার্ম করুন।'); setIsPaymentModalVisible(true); }}
          onOpenAiModal={() => setIsAiModalVisible(true)}
        />
      </ScrollView>

      {isAiModalVisible && <Modal visible animationType="slide" transparent onRequestClose={() => setIsAiModalVisible(false)}><TroubleSearch onMechanicSelect={(mech: any) => { setIsAiModalVisible(false); handleSelectMechanic(mech); }} /></Modal>}
      <Modal visible={isPaymentModalVisible} animationType="fade" transparent onRequestClose={() => setIsPaymentModalVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}><PaymentBox requestId="req_active_123" baseFee={pendingAmount} extraCharges={extraCharges} onPaymentSuccess={handlePaymentSuccess} /></View></View>
      </Modal>
      <Modal visible={isRatingModalVisible} animationType="fade" transparent onRequestClose={handleRatingSubmitFinished}>
        <View style={styles.modalOverlay}><View style={styles.modalCard}><ReviewReportBox requestId="sample_id" fromUserId={customerProfile.userId} toUserId={selectedMechanic?.id || 'mech_123'} userRole="customer" onComplete={handleRatingSubmitFinished} /></View></View>
      </Modal>

      {requestStatus === 'idle' && <SOSButton userId={customerProfile.userId} currentLocation={customerLocation} userRole="customer" />}
      <BottomNavigation activeTab="Home" onChange={handleBottomNav} accentColor="#1687FF" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' },
  scroll: { padding: layout.screenPadding, paddingBottom: 20 },
  mapContainer: { height: 260, backgroundColor: '#0D1B2D', marginHorizontal: -layout.screenPadding, marginBottom: 16, overflow: 'hidden', borderBottomWidth: 1, borderColor: '#1B2B40' },
  mapLoader: { marginTop: 115 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
  sectionSub: { color: '#64748B', fontSize: 10, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  quickArea: { marginTop: 2, marginBottom: 14 },
  subscriptionSection: { marginBottom: 14, backgroundColor: '#0D1B2D', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#26384D' },
  subscriptionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitlePremium: { flex: 1, color: '#38BDF8', fontSize: 13, fontWeight: '800' },
  premiumBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  premiumBadgeText: { color: '#06111F', fontSize: 10, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#06111F', borderRadius: 18, width: '100%', maxHeight: '92%', overflow: 'hidden', padding: 10 },
});
