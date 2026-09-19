import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AlertTriangle, Building2, Layers, MapPin, ShieldCheck, Truck, User } from 'lucide-react-native';
import { supabase } from '../supabaseClient';
import { AppHeader, BottomNavigation, QuickActionCard, StatCard, StatusBadge } from '../components';

type Fleet = {
  id: string; name: string; vehicleNumber: string; status: string; lat: number; lng: number; alert: boolean;
  driverName: string; driverPhone: string; driverNID: string;
  health: { engineHealth: string; batteryStatus: string; brakeStatus: string; fuelLevel: string; temperature: string };
  serviceHistory: Array<{ date: string; issue: string; cost: string; mechanic: string }>;
  locationHistory: string[];
};

type HistoryItem = { id: string; title: string; date: string; partner: string; amount: string; status: 'completed' | 'pending' | 'cancelled'; vehicle?: string; location?: string };

export default function B2BDashboard({ navigation }: any) {
  const [subTab, setSubTab] = useState<'tracking' | 'drivers'>('tracking');
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [activeFleets, setActiveFleets] = useState<Fleet[]>([
    { id: 'v1', name: 'Delivery Truck X-12', vehicleNumber: 'ঢাকা মেট্রো-ট ১১-২২৩৩', status: 'On Route', lat: 23.8103, lng: 90.4125, alert: false, driverName: 'মো: কুদ্দুস মিয়া', driverPhone: '+8801711223344', driverNID: '19952612345678901', health: { engineHealth: '92%', batteryStatus: 'Good', brakeStatus: 'Normal', fuelLevel: '78%', temperature: '85°C' }, serviceHistory: [{ date: '২০২৬-০৫-১০', issue: 'ইঞ্জিন অয়েল চেঞ্জ', cost: '৳৪,৫০০', mechanic: 'রহিম মটরস' }], locationHistory: ['গাবতলী টার্মিনাল', 'সাভার বাস স্ট্যান্ড', 'চন্দ্রা মোড়', 'টাঙ্গাইল বাইপাস'] },
    { id: 'v2', name: 'Cargo Van Y-04', vehicleNumber: 'ঢাকা মেট্রো-চ ৪৪-৫৫৬৬', status: 'Needs Maintenance', lat: 23.8165, lng: 90.4210, alert: true, driverName: 'আলমগীর হোসেন', driverPhone: '+8801911998877', driverNID: '19882698765432102', health: { engineHealth: '90%', batteryStatus: 'Good', brakeStatus: 'Normal', fuelLevel: '78%', temperature: '85°C' }, serviceHistory: [{ date: '২০২৬-০৫-২০', issue: 'এসি গ্যাস রিফিল', cost: '৳২,৮০০', mechanic: 'Car Rescue BD Team' }], locationHistory: ['তেজগাঁও শিল্প এলাকা', 'মহাখালী ফ্লাইওভার', 'মিরপুর ১০'] },
  ]);

  useEffect(() => {
    const subscription = supabase.channel('live-fleet-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicle_locations' }, payload => {
        const v: any = payload.new;
        setActiveFleets(prev => prev.map(f => f.id === v.driver_id ? { ...f, lat: v.latitude, lng: v.longitude } : f));
      }).subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const history = useMemo<HistoryItem[]>(() => activeFleets.flatMap(fleet => fleet.serviceHistory.map((item, i) => ({ id: `${fleet.id}-${i}`, title: item.issue, date: item.date, partner: item.mechanic, amount: item.cost, status: 'completed' as const, vehicle: fleet.name, location: fleet.locationHistory[0] }))), [activeFleets]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'AuthScreen' }] });
  };

  const handleNav = (tab: 'Home' | 'History' | 'Notifications' | 'Settings') => {
    if (tab === 'Home') return;
    if (tab === 'History') return navigation.navigate('ServiceHistory', { role: 'b2b', history });
    if (tab === 'Notifications') return navigation.navigate('NotificationScreen', { role: 'b2b' });
    navigation.navigate('SettingsScreen', { role: 'b2b' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <AppHeader name="আকিজ লজিস্টিকস হাব" email="B2B Fleet Management" role="b2b" avatarText="A" onProfile={() => navigation.navigate('ProfileScreen', { role: 'b2b' })} onSettings={() => navigation.navigate('SettingsScreen', { role: 'b2b' })} onLogout={handleLogout} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}><View style={styles.heroIcon}><Building2 size={25} color="#8B5CF6" /></View><View style={{ flex: 1 }}><Text style={styles.heroTitle}>Fleet Command Center</Text><Text style={styles.heroSub}>লাইভ fleet status, drivers এবং maintenance একসাথে</Text></View><StatusBadge text="B2B" type="info" /></View>

        <View style={styles.statsRow}>
          <StatCard label="Total Fleet" value={String(activeFleets.length)} icon={<Truck size={18} color="#8B5CF6" />} accentColor="#8B5CF6" compact />
          <StatCard label="Breakdown" value={String(activeFleets.filter(x => x.alert).length)} icon={<AlertTriangle size={18} color="#EF4444" />} accentColor="#EF4444" compact />
        </View>

        <View style={styles.subTabs}>
          <TouchableOpacity onPress={() => { setSubTab('tracking'); setSelectedFleet(null); }} style={[styles.subTab, subTab === 'tracking' && styles.subTabActive]}><Layers size={16} color={subTab === 'tracking' ? '#8B5CF6' : '#94A3B8'} /><Text style={[styles.subTabText, subTab === 'tracking' && styles.subTabActiveText]}>Live Tracking</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setSubTab('drivers')} style={[styles.subTab, subTab === 'drivers' && styles.subTabActive]}><User size={16} color={subTab === 'drivers' ? '#8B5CF6' : '#94A3B8'} /><Text style={[styles.subTabText, subTab === 'drivers' && styles.subTabActiveText]}>Drivers & Vehicles</Text></TouchableOpacity>
        </View>

        {subTab === 'tracking' && (
          <>
            <Text style={styles.sectionTitle}>🗺️ Live Fleet Location</Text>
            <View style={styles.mapCard}><MapView style={StyleSheet.absoluteFillObject} initialRegion={{ latitude: 23.8134, longitude: 90.4168, latitudeDelta: 0.04, longitudeDelta: 0.04 }}>{activeFleets.map(f => <Marker key={f.id} coordinate={{ latitude: f.lat, longitude: f.lng }} title={f.name} description={`Driver: ${f.driverName}`} pinColor={f.alert ? '#EF4444' : '#10B981'} />)}</MapView></View>
            <Text style={styles.sectionTitle}>Active Vehicles</Text>
            {activeFleets.map(f => <QuickActionCard key={f.id} title={f.name} subtitle={`${f.vehicleNumber} • ${f.driverName}`} icon={<Truck size={20} color={f.alert ? '#EF4444' : '#10B981'} />} accentColor={f.alert ? '#EF4444' : '#10B981'} badge={f.alert ? 'ALERT' : 'LIVE'} onPress={() => { setSubTab('drivers'); setSelectedFleet(f); }} />)}
          </>
        )}

        {subTab === 'drivers' && !selectedFleet && (
          <>
            <Text style={styles.sectionTitle}>Drivers & Registered Vehicles</Text>
            {activeFleets.map(f => <QuickActionCard key={f.id} title={f.driverName} subtitle={`${f.name} • ${f.vehicleNumber}`} icon={<User size={20} color="#8B5CF6" />} accentColor="#8B5CF6" badge={f.alert ? 'MAINTENANCE' : 'OK'} onPress={() => setSelectedFleet(f)} />)}
          </>
        )}

        {subTab === 'drivers' && selectedFleet && (
          <>
            <QuickActionCard title="Back to vehicles" subtitle="Return to fleet list" icon={<Layers size={18} color="#8B5CF6" />} accentColor="#8B5CF6" onPress={() => setSelectedFleet(null)} />
            <View style={styles.detailCard}><Text style={styles.detailTitle}>Driver & Vehicle Profile</Text><View style={styles.divider} /><Text style={styles.label}>Driver</Text><Text style={styles.value}>{selectedFleet.driverName}</Text><Text style={styles.label}>Phone</Text><Text style={styles.value}>{selectedFleet.driverPhone}</Text><Text style={styles.label}>NID</Text><Text style={styles.value}>{selectedFleet.driverNID}</Text><Text style={styles.label}>Vehicle</Text><Text style={styles.value}>{selectedFleet.name}</Text><Text style={styles.label}>Plate</Text><Text style={styles.value}>{selectedFleet.vehicleNumber}</Text></View>
            <View style={styles.detailCard}><Text style={styles.detailTitle}>Vehicle Health</Text><View style={styles.divider} /><View style={styles.healthGrid}>{Object.entries({ Engine: selectedFleet.health.engineHealth, Battery: selectedFleet.health.batteryStatus, Brake: selectedFleet.health.brakeStatus, Fuel: selectedFleet.health.fuelLevel }).map(([k, v]) => <View key={k} style={styles.healthItem}><Text style={styles.label}>{k}</Text><Text style={[styles.healthValue, { color: k === 'Battery' ? '#38BDF8' : '#10B981' }]}>{v}</Text></View>)}</View></View>
            <View style={styles.detailCard}><Text style={styles.detailTitle}>Service History</Text><View style={styles.divider} />{selectedFleet.serviceHistory.map((s, i) => <View key={i} style={styles.serviceItem}><View style={styles.rowBetween}><Text style={styles.value}>{s.issue}</Text><Text style={styles.amount}>{s.cost}</Text></View><Text style={styles.meta}>{s.date} • {s.mechanic}</Text></View>)}</View>
            <View style={styles.detailCard}><Text style={styles.detailTitle}>Location History</Text><View style={styles.divider} />{selectedFleet.locationHistory.map((loc, i) => <View key={i} style={styles.locationRow}><MapPin size={14} color="#8B5CF6" /><Text style={styles.meta}>{loc}</Text></View>)}</View>
            {selectedFleet.alert && <TouchableOpacity style={styles.rescueBtn} onPress={() => Alert.alert('SOS', 'মেকানিক টিমকে এলার্ট পাঠানো হয়েছে।')}><ShieldCheck size={17} color="#FFF" /><Text style={styles.rescueText}>Priority Rescue Call</Text></TouchableOpacity>}
          </>
        )}
      </ScrollView>

      <BottomNavigation activeTab="Home" onChange={handleNav} accentColor="#8B5CF6" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' },
  scroll: { padding: 16, paddingBottom: 22 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 14 },
  heroIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#8B5CF622', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900' },
  heroSub: { color: '#94A3B8', fontSize: 10, marginTop: 3, lineHeight: 15 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  subTabs: { flexDirection: 'row', backgroundColor: '#0D1B2D', borderRadius: 14, borderWidth: 1, borderColor: '#1B2B40', padding: 4, marginBottom: 15 },
  subTab: { flex: 1, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  subTabActive: { backgroundColor: '#8B5CF622' },
  subTabText: { color: '#94A3B8', fontSize: 11, fontWeight: '800' },
  subTabActiveText: { color: '#8B5CF6' },
  sectionTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '900', marginBottom: 9 },
  mapCard: { height: 250, borderRadius: 16, borderWidth: 1, borderColor: '#1B2B40', overflow: 'hidden', marginBottom: 15 },
  detailCard: { backgroundColor: '#0D1B2D', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#1B2B40', marginBottom: 10 },
  detailTitle: { color: '#8B5CF6', fontSize: 14, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#1B2B40', marginVertical: 10 },
  label: { color: '#64748B', fontSize: 10, fontWeight: '700', marginTop: 4 },
  value: { color: '#F8FAFC', fontSize: 13, fontWeight: '800', marginTop: 2, marginBottom: 5 },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  healthItem: { width: '48%', backgroundColor: '#06111F', borderWidth: 1, borderColor: '#1B2B40', borderRadius: 11, padding: 10 },
  healthValue: { fontSize: 16, fontWeight: '900', marginTop: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  amount: { color: '#34D399', fontSize: 13, fontWeight: '900' },
  meta: { color: '#94A3B8', fontSize: 10, marginTop: 3 },
  serviceItem: { backgroundColor: '#06111F', padding: 10, borderRadius: 10, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  rescueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#EF4444', paddingVertical: 13, borderRadius: 12, marginTop: 2 },
  rescueText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
});
