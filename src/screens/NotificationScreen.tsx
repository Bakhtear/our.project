import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Check, ChevronRight, DollarSign, ShieldAlert, Truck, User, Wrench, Building2 } from 'lucide-react-native';
import { AppHeader, BottomNavigation, StatusBadge, AppRole, ROLE_MAP } from '../components';

type Notice = { id: string; title: string; message: string; time: string; type: 'service' | 'payment' | 'alert' | 'fleet'; read: boolean };
type TabKey = 'Home' | 'History' | 'Notifications' | 'Settings';

const ROLE_NOTICES: Record<AppRole, Notice[]> = {
  customer: [
    { id: 'customer-service', title: 'Mechanic request update', message: 'আপনার roadside service request-এর নতুন update এসেছে।', time: '2 min ago', type: 'service', read: false },
    { id: 'customer-payment', title: 'Payment update', message: 'আপনার latest service payment সফলভাবে complete হয়েছে।', time: '1 hour ago', type: 'payment', read: false },
    { id: 'customer-health', title: 'Vehicle health reminder', message: 'গাড়ির health information নিয়মিত update রাখুন।', time: 'Yesterday', type: 'alert', read: true },
  ],
  mechanic: [
    { id: 'mechanic-request', title: 'New service request', message: 'আপনার কাছাকাছি একটি নতুন service request available।', time: '1 min ago', type: 'service', read: false },
    { id: 'mechanic-payment', title: 'Payment received', message: 'সম্পন্ন service-এর payment update হয়েছে।', time: '45 min ago', type: 'payment', read: false },
    { id: 'mechanic-rating', title: 'Customer review', message: 'একজন customer আপনার recent service-এ review দিয়েছেন।', time: 'Yesterday', type: 'alert', read: true },
  ],
  b2b: [
    { id: 'b2b-alert', title: 'Fleet maintenance alert', message: 'আপনার fleet-এর একটি vehicle maintenance attention চাইছে।', time: '5 min ago', type: 'fleet', read: false },
    { id: 'b2b-driver', title: 'Driver status update', message: 'একজন assigned driver duty mode-এ online হয়েছে।', time: '1 hour ago', type: 'service', read: false },
    { id: 'b2b-service', title: 'Service completed', message: 'একটি fleet maintenance job successfully completed হয়েছে।', time: 'Yesterday', type: 'payment', read: true },
  ],
  driver: [
    { id: 'driver-duty', title: 'Duty status', message: 'আপনার live duty tracking বর্তমানে active।', time: '2 min ago', type: 'service', read: false },
    { id: 'driver-assignment', title: 'Vehicle assignment', message: 'আপনার assigned vehicle information update হয়েছে।', time: '1 hour ago', type: 'fleet', read: false },
    { id: 'driver-safety', title: 'Safety reminder', message: 'Drive safe এবং emergency contact information updated রাখুন।', time: 'Yesterday', type: 'alert', read: true },
  ],
};

export default function NotificationScreen({ navigation, route }: any) {
  const role = (route?.params?.role || 'customer') as AppRole;
  const color = ROLE_MAP[role].color;
  const [notifications, setNotifications] = useState<Notice[]>(() => ROLE_NOTICES[role] || ROLE_NOTICES.customer);
  const unread = useMemo(() => notifications.filter(item => !item.read).length, [notifications]);

  const markAll = () => setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));

  const handleNav = (tab: TabKey) => {
    if (tab === 'Notifications') return;
    if (tab === 'History') return navigation.navigate('ServiceHistory', { role });
    if (tab === 'Settings') return navigation.navigate('SettingsScreen', { role });
    const home = role === 'customer' ? 'CustomerHome' : role === 'mechanic' ? 'MechanicFeed' : role === 'b2b' ? 'B2BDispatch' : 'DriverDashboard';
    navigation.navigate(home);
  };

  const iconFor = (type: Notice['type']) => {
    if (type === 'service') return { Icon: Wrench, color: '#38BDF8' };
    if (type === 'payment') return { Icon: DollarSign, color: '#10B981' };
    if (type === 'fleet') return { Icon: role === 'b2b' ? Building2 : Truck, color: '#A78BFA' };
    return { Icon: ShieldAlert, color: '#F59E0B' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <AppHeader name="Notifications" email={`${ROLE_MAP[role].label} alerts & updates`} role={role} showProfile={false} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { borderColor: `${color}55` }]}> 
          <View style={[styles.heroIcon, { backgroundColor: `${color}18` }]}><Bell size={23} color={color} /></View>
          <View style={styles.heroBody}><Text style={styles.heroTitle}>{unread ? `${unread} unread alerts` : 'All caught up'}</Text><Text style={styles.heroSub}>আপনার role অনুযায়ী service, payment, safety ও account update</Text></View>
          <StatusBadge text={ROLE_MAP[role].label} type="info" />
        </View>

        <View style={styles.topRow}>
          <View><Text style={styles.title}>Latest updates</Text><Text style={styles.sub}>Tap any notification to mark it as read</Text></View>
          <TouchableOpacity style={[styles.markBtn, { borderColor: `${color}66` }]} onPress={markAll} activeOpacity={0.8}><Check size={15} color={color} /><Text style={[styles.markText, { color }]}>Mark all read</Text></TouchableOpacity>
        </View>

        {notifications.map(item => {
          const info = iconFor(item.type);
          const Icon = info.Icon;
          return (
            <TouchableOpacity key={item.id} onPress={() => markRead(item.id)} activeOpacity={0.85} style={[styles.card, !item.read && { borderColor: `${color}88` }]}> 
              <View style={[styles.icon, { backgroundColor: `${info.color}22` }]}><Icon size={19} color={info.color} /></View>
              <View style={styles.body}>
                <View style={styles.row}><Text style={styles.cardTitle}>{item.title}</Text>{!item.read && <View style={[styles.unreadDot, { backgroundColor: color }]} />}</View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <ChevronRight size={17} color="#64748B" />
            </TouchableOpacity>
          );
        })}

        <View style={[styles.infoCard, { borderColor: `${color}44`, backgroundColor: `${color}0B` }]}> 
          <Bell size={19} color={color} /><Text style={styles.infoText}>এই notification center app-এর in-app alerts দেখায়। Role বদলালে alert-এর ধরনও বদলাবে।</Text>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="Notifications" onChange={handleNav} accentColor={color} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' },
  scroll: { padding: 16, paddingBottom: 25 },
  hero: { padding: 14, borderRadius: 17, borderWidth: 1, backgroundColor: '#0D1B2D', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 17 },
  heroIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heroBody: { flex: 1 },
  heroTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  heroSub: { color: '#94A3B8', fontSize: 10, lineHeight: 15, marginTop: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 13 },
  title: { color: '#F8FAFC', fontSize: 19, fontWeight: '900' },
  sub: { color: '#64748B', fontSize: 10, marginTop: 3 },
  markBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 8 },
  markText: { fontSize: 10, fontWeight: '900' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 16, backgroundColor: '#0D1B2D', borderWidth: 1, borderColor: '#1B2B40', marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '800', flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  message: { color: '#CBD5E1', fontSize: 11, lineHeight: 16, marginTop: 4 },
  time: { color: '#64748B', fontSize: 10, marginTop: 5 },
  infoCard: { marginTop: 3, borderRadius: 15, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1, color: '#CBD5E1', fontSize: 10, lineHeight: 15 },
});
