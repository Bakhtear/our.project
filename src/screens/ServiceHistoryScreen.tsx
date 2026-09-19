import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Banknote, Building2, CalendarDays, Car, CheckCircle2, Clock3, MapPin, Truck, User, Wrench } from 'lucide-react-native';
import { AppHeader, BottomNavigation, EmptyState, getServiceHistory, RoleBadge, ServiceHistoryItem, StatCard, StatusBadge, AppRole, replaceServiceHistory } from '../components';

type TabKey = 'Home' | 'History' | 'Notifications' | 'Settings';

export default function ServiceHistoryScreen({ navigation, route }: any) {
  const role = (route?.params?.role || 'customer') as AppRole;
  const [items, setItems] = useState<ServiceHistoryItem[]>([]);

  useEffect(() => {
    const passed = route?.params?.history;
    if (Array.isArray(passed) && passed.length) {
      replaceServiceHistory(role, passed);
      setItems(passed);
    } else {
      setItems(getServiceHistory(role));
    }
  }, [role, route?.params?.history]);

  const color = role === 'customer' ? '#1687FF' : role === 'mechanic' ? '#16C784' : role === 'b2b' ? '#8B5CF6' : '#FF8A00';
  const completed = useMemo(() => items.filter(item => item.status === 'completed').length, [items]);
  const pending = useMemo(() => items.filter(item => item.status === 'pending').length, [items]);

  const title = role === 'b2b' ? 'Fleet Service History' : `${role === 'customer' ? 'Customer' : role === 'mechanic' ? 'Mechanic' : 'Driver'} Service History`;
  const subtitle = role === 'b2b' ? 'Fleet maintenance and driver service records' : 'Your completed service, rescue and maintenance records';

  const handleNav = (tab: TabKey) => {
    if (tab === 'History') return;
    if (tab === 'Notifications') return navigation.navigate('NotificationScreen', { role });
    if (tab === 'Settings') return navigation.navigate('SettingsScreen', { role });
    const home = role === 'customer' ? 'CustomerHome' : role === 'mechanic' ? 'MechanicFeed' : role === 'b2b' ? 'B2BDispatch' : 'DriverDashboard';
    navigation.navigate(home);
  };

  const partnerLabel = role === 'mechanic' ? 'Customer / Partner' : role === 'b2b' ? 'Service Provider' : 'Partner / Mechanic';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <AppHeader name={title} email={subtitle} role={role} showProfile={false} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { borderColor: `${color}55` }]}> 
          <View style={[styles.heroIcon, { backgroundColor: `${color}18` }]}><Clock3 size={23} color={color} /></View>
          <View style={styles.heroBody}><Text style={styles.heroTitle}>Service timeline</Text><Text style={styles.heroSub}>{role === 'b2b' ? 'সব fleet service এক জায়গায়' : 'সব service এবং rescue record এক জায়গায়'}</Text></View>
          <RoleBadge role={role} />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Total" value={String(items.length)} icon={<Wrench size={18} color={color} />} accentColor={color} compact />
          <StatCard label="Completed" value={String(completed)} icon={<CheckCircle2 size={18} color="#16C784" />} accentColor="#16C784" compact />
          <StatCard label="Pending" value={String(pending)} icon={<Clock3 size={18} color="#F59E0B" />} accentColor="#F59E0B" compact />
        </View>

        {items.length === 0 ? (
          <EmptyState title="No service history yet" message="Service complete হলে এই page-এ record দেখতে পারবেন।" icon={<Wrench size={24} color={color} />} />
        ) : (
          items.map(item => (
            <View key={item.id} style={[styles.card, { borderColor: item.status === 'completed' ? `${color}66` : '#1B2B40' }]}> 
              <View style={styles.cardTop}>
                <View style={[styles.serviceIcon, { backgroundColor: `${color}18` }]}><Wrench size={19} color={color} /></View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardPartner}>{partnerLabel}: {item.partner}</Text>
                </View>
                <StatusBadge text={item.status === 'completed' ? 'Completed' : item.status === 'pending' ? 'Pending' : 'Cancelled'} type={item.status === 'completed' ? 'success' : item.status === 'pending' ? 'warning' : 'danger'} />
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detail}><CalendarDays size={15} color="#94A3B8" /><Text style={styles.detailText}>{item.date}</Text></View>
                <View style={styles.detail}><Banknote size={15} color="#94A3B8" /><Text style={styles.detailText}>{item.amount}</Text></View>
                {item.vehicle ? <View style={styles.detail}><Car size={15} color="#94A3B8" /><Text style={styles.detailText}>{item.vehicle}</Text></View> : null}
                {item.location ? <View style={styles.detail}><MapPin size={15} color="#94A3B8" /><Text style={styles.detailText}>{item.location}</Text></View> : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNavigation activeTab="History" onChange={handleNav} accentColor={color} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' },
  scroll: { padding: 16, paddingBottom: 25 },
  hero: { padding: 14, borderRadius: 17, borderWidth: 1, backgroundColor: '#0D1B2D', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  heroIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heroBody: { flex: 1 },
  heroTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  heroSub: { color: '#94A3B8', fontSize: 10, lineHeight: 15, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 13 },
  card: { backgroundColor: '#0D1B2D', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '900' },
  cardPartner: { color: '#94A3B8', fontSize: 10, marginTop: 4 },
  detailGrid: { marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: '#1B2B40', flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  detail: { minWidth: '46%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#CBD5E1', fontSize: 10, flexShrink: 1 },
});
