import React, { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { CheckCircle2, MapPin, Power, Star, Wrench } from 'lucide-react-native';
import LiveMap from '../components/LiveMap';
import { addServiceHistory, AppHeader, BottomNavigation, QuickActionCard, StatCard, StatusBadge } from '../components';
import { supabase } from '../supabaseClient';

type HistoryItem = { id: string; title: string; date: string; partner: string; amount: string; status: 'completed' | 'pending' | 'cancelled'; vehicle?: string; location?: string };

export default function MechanicDashboard({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'feed' | 'active'>('feed');
  const [isOnline, setIsOnline] = useState(true);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [extraBill, setExtraBill] = useState('');
  const [extraBillReason, setExtraBillReason] = useState('');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [customerComment, setCustomerComment] = useState('');
  const [serviceHistory, setServiceHistory] = useState<HistoryItem[]>([
    { id: 'm-demo-1', title: 'Engine overheating repair', date: '২০২৬-০৯-12', partner: 'Customer #C102', amount: '৳৯০০', status: 'completed', vehicle: 'Car', location: 'Dhaka' },
  ]);
  const [requests, setRequests] = useState([
    { id: '1', title: 'Car engine overheated & smoking', distance: '২.৪ কিমি দূরে', reward: '৳৯০০', basePrice: 900, customerLocation: { latitude: 23.82, longitude: 90.42 } },
    { id: '2', title: 'Flat Tire Replacement Needed', distance: '৪.১ কিমি দূরে', reward: '৳৪৫০', basePrice: 450, customerLocation: { latitude: 23.83, longitude: 90.43 } },
  ]);
  const mechanicLocation = { latitude: 23.8145, longitude: 90.4165 };

  useEffect(() => {
    if (!activeJob || activeJob.paymentStatus === 'paid_online') return;
    const timer = setTimeout(() => setActiveJob((prev: any) => prev ? { ...prev, paymentStatus: 'paid_online' } : null), 15000);
    return () => clearTimeout(timer);
  }, [activeJob]);

  const handleLogout = async () => {
    setIsOnline(false);
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'AuthScreen' }] });
  };

  const handleAcceptRequest = (req: any) => {
    if (!isOnline) return Alert.alert('⚠️ অফলাইন', 'কাজ এক্সেপ্ট করতে প্রথমে অনলাইন হোন!');
    setActiveJob({ ...req, paymentStatus: 'pending' });
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActiveTab('active');
  };

  const handlePushExtraBill = () => {
    if (!extraBill || !extraBillReason.trim()) return Alert.alert('ভুল ইনপুট ⚠️', 'বিলের অংক এবং কারণ লিখুন।');
    Alert.alert('সফল!', `৳${extraBill} অতিরিক্ত বিল কাস্টমারকে পাঠানো হয়েছে।`);
    setExtraBill(''); setExtraBillReason('');
  };

  const handleSubmitRating = () => {
    if (activeJob) {
      const item = { id: `mechanic-${Date.now()}`, title: activeJob.title, date: new Date().toISOString().slice(0, 10), partner: 'Customer', amount: `৳${activeJob.basePrice || 0}`, status: 'completed' as const, vehicle: 'Car', location: 'Dhaka' }; addServiceHistory('mechanic', item); setServiceHistory(prev => [item, ...prev]);
    }
    setRatingModalVisible(false); setCustomerComment(''); setActiveJob(null); setActiveTab('feed');
    Alert.alert('ধন্যবাদ!', 'কাজ সফলভাবে সম্পন্ন হয়েছে।');
  };

  const handleNav = (tab: 'Home' | 'History' | 'Notifications' | 'Settings') => {
    if (tab === 'Home') return;
    if (tab === 'History') return navigation.navigate('ServiceHistory', { role: 'mechanic', history: serviceHistory });
    if (tab === 'Notifications') return navigation.navigate('NotificationScreen', { role: 'mechanic' });
    navigation.navigate('SettingsScreen', { role: 'mechanic' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <AppHeader name="মেকানিক ড্যাশবোর্ড" email={isOnline ? '● অনলাইন' : '● অফলাইন'} role="mechanic" avatarText="M" onProfile={() => navigation.navigate('ProfileScreen', { role: 'mechanic' })} onSettings={() => navigation.navigate('SettingsScreen', { role: 'mechanic' })} onLogout={handleLogout} />

      <View style={styles.statusCard}>
        <View style={styles.statusLeft}><View style={[styles.statusIcon, { backgroundColor: isOnline ? '#123B2A' : '#3D1417' }]}><Power size={19} color={isOnline ? '#34D399' : '#F87171'} /></View><View><Text style={styles.statusTitle}>Service availability</Text><Text style={styles.statusSub}>{isOnline ? 'You are ready to receive requests' : 'You are currently offline'}</Text></View></View>
        <Switch value={isOnline} onValueChange={(value) => { if (activeJob && !value) return Alert.alert('⚠️ অ্যাকশন ব্লকড!', 'চলমান কাজ থাকা অবস্থায় আপনি অফলাইন হতে পারবেন না।'); setIsOnline(value); }} trackColor={{ false: '#334155', true: '#16A34A' }} thumbColor='#FFFFFF' />
      </View>

      <View style={styles.tabRow}>
        <View style={styles.tabInner}>
          <Text onPress={() => setActiveTab('feed')} style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>রিকোয়েস্ট</Text>
          <Text onPress={() => setActiveTab('active')} style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>চলমান</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard label="Available" value={String(requests.length)} icon={<Wrench size={18} color="#16C784" />} accentColor="#16C784" compact />
          <StatCard label="Completed" value={String(serviceHistory.length)} icon={<CheckCircle2 size={18} color="#1687FF" />} accentColor="#1687FF" compact />
        </View>

        {activeTab === 'feed' ? (
          <>
            <Text style={styles.sectionTitle}>Nearby Requests</Text>
            {requests.map(req => (
              <QuickActionCard key={req.id} title={req.title} subtitle={`${req.distance} • ${req.reward}`} icon={<MapPin size={20} color="#16C784" />} accentColor="#16C784" badge="NEW" onPress={() => handleAcceptRequest(req)} />
            ))}
            {!requests.length && <Text style={styles.empty}>এই মুহূর্তে কোনো নতুন কাজ নেই।</Text>}
          </>
        ) : activeJob ? (
          <>
            <View style={[styles.paymentBanner, { backgroundColor: activeJob.paymentStatus === 'paid_online' ? '#123B2A' : '#3D2D0A' }]}><Text style={{ color: activeJob.paymentStatus === 'paid_online' ? '#34D399' : '#FBBF24', fontWeight: '800' }}>{activeJob.paymentStatus === 'paid_online' ? '✓ পেমেন্ট রিসিভড!' : '⏳ পেমেন্টের অপেক্ষা...'}</Text></View>
            <View style={styles.card}><TextInput style={styles.input} placeholder="অতিরিক্ত বিল (টাকা)" placeholderTextColor="#64748B" keyboardType="numeric" value={extraBill} onChangeText={setExtraBill} /><TextInput style={styles.input} placeholder="বিল পাঠানোর কারণ" placeholderTextColor="#64748B" value={extraBillReason} onChangeText={setExtraBillReason} /><QuickActionCard title="Send Extra Bill" subtitle="কাস্টমারকে অতিরিক্ত কাজের বিল পাঠান" icon={<Wrench size={19} color="#1687FF" />} accentColor="#1687FF" onPress={handlePushExtraBill} /></View>
            <View style={styles.mapCard}><LiveMap userRole="mechanic" currentLocation={mechanicLocation} targetLocation={activeJob.customerLocation} /></View>
            <QuickActionCard title="Complete Job" subtitle="কাজ শেষ হলে রেটিং স্ক্রিন খুলবে" icon={<Star size={19} color="#F59E0B" />} accentColor="#10B981" onPress={() => setRatingModalVisible(true)} />
          </>
        ) : <Text style={styles.empty}>এই মুহূর্তে কোনো চলমান কাজ নেই।</Text>}
      </ScrollView>

      <Modal visible={ratingModalVisible} transparent animationType="slide" onRequestClose={() => setRatingModalVisible(false)}><View style={styles.modalOverlay}><View style={styles.modal}><Text style={styles.modalTitle}>রেটিং ও রিভিউ</Text><TextInput style={[styles.input, { height: 90 }]} multiline placeholder="মতামত লিখুন..." placeholderTextColor="#64748B" value={customerComment} onChangeText={setCustomerComment} /><QuickActionCard title="Submit Review" icon={<Star size={18} color="#F59E0B" />} accentColor="#10B981" onPress={handleSubmitRating} /></View></View></Modal>
      <BottomNavigation activeTab="Home" onChange={handleNav} accentColor="#16C784" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' },
  statusCard: { margin: 12, padding: 12, borderRadius: 15, backgroundColor: '#0D1B2D', borderWidth: 1, borderColor: '#1B2B40', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  statusIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '800' },
  statusSub: { color: '#94A3B8', fontSize: 10, marginTop: 3 },
  tabRow: { paddingHorizontal: 16, paddingBottom: 9 },
  tabInner: { flexDirection: 'row', gap: 22, borderBottomWidth: 1, borderBottomColor: '#17263A' },
  tabText: { color: '#64748B', fontSize: 13, fontWeight: '800', paddingVertical: 10 },
  tabTextActive: { color: '#16C784', borderBottomWidth: 2, borderBottomColor: '#16C784' },
  scroll: { padding: 16, paddingTop: 4, paddingBottom: 22 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 35 },
  paymentBanner: { borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 10 },
  card: { backgroundColor: '#0D1B2D', padding: 13, borderRadius: 16, borderWidth: 1, borderColor: '#1B2B40', marginBottom: 10 },
  input: { backgroundColor: '#06111F', borderWidth: 1, borderColor: '#1B2B40', borderRadius: 10, color: '#F8FAFC', paddingHorizontal: 11, minHeight: 44, marginBottom: 9 },
  mapCard: { height: 250, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1B2B40', marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.76)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: '#0D1B2D', borderRadius: 18, padding: 16 },
  modalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 12 },
});
