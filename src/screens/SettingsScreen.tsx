import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  Cpu,
  MapPin,
  PhoneCall,
  ShieldCheck,
  User,
  Users,
  Wrench,
} from 'lucide-react-native';
import { supabase } from '../supabaseClient';
import {
  AppHeader,
  BottomNavigation,
  QuickActionCard,
  StatusBadge,
  AppRole,
  ROLE_MAP,
} from '../components';

type Props = { navigation: any; route?: any };
type TabKey = 'Home' | 'History' | 'Notifications' | 'Settings';

const ROLE_SETTINGS: Record<
  AppRole,
  {
    title: string;
    subtitle: string;
    color: string;
    homeRoute: string;
    accountTitle: string;
    trackingTitle: string;
    primaryTitle: string;
    primarySubtitle: string;
    primaryIcon: React.ReactNode;
  }
> = {
  customer: {
    title: 'Customer Settings',
    subtitle: 'Vehicle & roadside assistance controls',
    color: '#1687FF',
    homeRoute: 'CustomerHome',
    accountTitle: 'My vehicle & account',
    trackingTitle: 'Location Sharing',
    primaryTitle: 'Vehicle Profile',
    primarySubtitle: 'Manage your vehicle information',
    primaryIcon: <Car size={19} color="#1687FF" />,
  },
  mechanic: {
    title: 'Mechanic Settings',
    subtitle: 'Availability & service controls',
    color: '#16C784',
    homeRoute: 'MechanicFeed',
    accountTitle: 'Professional account',
    trackingTitle: 'Service Availability',
    primaryTitle: 'Professional Profile',
    primarySubtitle: 'Manage specialty and verification details',
    primaryIcon: <Wrench size={19} color="#16C784" />,
  },
  b2b: {
    title: 'B2B Settings',
    subtitle: 'Fleet & business management controls',
    color: '#8B5CF6',
    homeRoute: 'B2BDispatch',
    accountTitle: 'Business account',
    trackingTitle: 'Fleet Tracking',
    primaryTitle: 'Business Profile',
    primarySubtitle: 'Manage company and fleet information',
    primaryIcon: <BriefcaseBusiness size={19} color="#8B5CF6" />,
  },
  driver: {
    title: 'Driver Settings',
    subtitle: 'Duty, vehicle & safety controls',
    color: '#FF8A00',
    homeRoute: 'DriverDashboard',
    accountTitle: 'Driver account',
    trackingTitle: 'Live Duty Tracking',
    primaryTitle: 'Driver Profile',
    primarySubtitle: 'Manage license and assigned vehicle',
    primaryIcon: <Car size={19} color="#FF8A00" />,
  },
};

export default function SettingsScreen({ navigation, route }: Props) {
  const role = (route?.params?.role || 'customer') as AppRole;
  const config = ROLE_SETTINGS[role] || ROLE_SETTINGS.customer;
  const color = config.color;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(role !== 'customer');
  const [emergencyPhone, setEmergencyPhone] = useState('018XXXXXXXX');
  const [editingPhone, setEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('018XXXXXXXX');
  const [dutyOnline, setDutyOnline] = useState(role === 'mechanic' || role === 'driver');
  const [fleetAlerts, setFleetAlerts] = useState(true);

  const deviceLabel = useMemo(() => {
    if (role === 'customer') return 'Phone GPS / Vehicle GPS';
    if (role === 'mechanic') return 'Phone GPS';
    if (role === 'b2b') return 'Fleet GPS Gateway';
    return 'Phone + Vehicle GPS';
  }, [role]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.log('Logout error:', error);
          } finally {
            navigation.reset({ index: 0, routes: [{ name: 'AuthScreen' }] });
          }
        },
      },
    ]);
  };

  const handleNav = (tab: TabKey) => {
    if (tab === 'Settings') return;
    if (tab === 'History') return navigation.navigate('ServiceHistory', { role });
    if (tab === 'Notifications') return navigation.navigate('NotificationScreen', { role });
    navigation.navigate(config.homeRoute);
  };

  const saveEmergencyPhone = () => {
    setEmergencyPhone(tempPhone.trim() || '018XXXXXXXX');
    setEditingPhone(false);
    Alert.alert('Saved', 'Emergency contact updated successfully.');
  };

  const openProfile = () => navigation.navigate('ProfileScreen', { role });
  const openNotifications = () => navigation.navigate('NotificationScreen', { role });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />

      <AppHeader
        name={config.title}
        email={config.subtitle}
        role={role}
        showProfile={false}
        onBack={() => navigation.goBack()}
        onNotifications={openNotifications}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { borderColor: `${color}55` }]}> 
          <View style={[styles.heroIcon, { backgroundColor: `${color}18` }]}>
            {ROLE_MAP[role].Icon ? React.createElement(ROLE_MAP[role].Icon, { size: 24, color }) : <User size={24} color={color} />}
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>{config.accountTitle}</Text>
            <Text style={styles.heroSub}>{config.subtitle}</Text>
          </View>
          <StatusBadge text={ROLE_MAP[role].label} type="info" />
        </View>

        <Text style={styles.groupTitle}>Profile</Text>
        <QuickActionCard
          title={config.primaryTitle}
          subtitle={config.primarySubtitle}
          icon={config.primaryIcon}
          accentColor={color}
          onPress={openProfile}
        />

        {role === 'customer' && (
          <View style={styles.section}>
            <Text style={styles.groupTitle}>Vehicle & Safety</Text>
            <QuickActionCard title="Vehicle Information" subtitle="Update vehicle type and registration" icon={<Car size={19} color={color} />} accentColor={color} onPress={openProfile} />
            <QuickActionCard title="Emergency SOS Contact" subtitle="Number used for urgent assistance" icon={<PhoneCall size={19} color="#EF4444" />} accentColor="#EF4444" onPress={() => setEditingPhone(true)} />
          </View>
        )}

        {role === 'mechanic' && (
          <View style={styles.section}>
            <Text style={styles.groupTitle}>Work Controls</Text>
            <View style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#123B2A' }]}><Wrench size={18} color="#34D399" /></View>
                <View style={styles.rowText}><Text style={styles.value}>Accept service requests</Text><Text style={styles.subText}>Appear as available to customers</Text></View>
              </View>
              <Switch value={dutyOnline} onValueChange={setDutyOnline} trackColor={{ false: '#334155', true: '#16C784' }} thumbColor="#F8FAFC" />
            </View>
            <QuickActionCard title="Professional Verification" subtitle="Specialty, NID and service details" icon={<ShieldCheck size={19} color="#16C784" />} accentColor="#16C784" onPress={openProfile} />
          </View>
        )}

        {role === 'b2b' && (
          <View style={styles.section}>
            <Text style={styles.groupTitle}>Fleet Controls</Text>
            <QuickActionCard title="Manage Fleet" subtitle="Vehicles, drivers and fleet profile" icon={<Users size={19} color="#8B5CF6" />} accentColor="#8B5CF6" onPress={openProfile} />
            <View style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#25144D' }]}><Bell size={18} color="#A78BFA" /></View>
                <View style={styles.rowText}><Text style={styles.value}>Fleet maintenance alerts</Text><Text style={styles.subText}>Notify when a vehicle needs attention</Text></View>
              </View>
              <Switch value={fleetAlerts} onValueChange={setFleetAlerts} trackColor={{ false: '#334155', true: '#8B5CF6' }} thumbColor="#F8FAFC" />
            </View>
          </View>
        )}

        {role === 'driver' && (
          <View style={styles.section}>
            <Text style={styles.groupTitle}>Duty & Vehicle</Text>
            <View style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#4B2500' }]}><CheckCircle2 size={18} color="#FFB45A" /></View>
                <View style={styles.rowText}><Text style={styles.value}>Duty mode</Text><Text style={styles.subText}>{dutyOnline ? 'Online and ready for assignments' : 'Offline'}</Text></View>
              </View>
              <Switch value={dutyOnline} onValueChange={setDutyOnline} trackColor={{ false: '#334155', true: '#FF8A00' }} thumbColor="#F8FAFC" />
            </View>
            <QuickActionCard title="Assigned Vehicle" subtitle="View license and vehicle information" icon={<Car size={19} color="#FF8A00" />} accentColor="#FF8A00" onPress={openProfile} />
          </View>
        )}

        <Text style={styles.groupTitle}>{config.trackingTitle}</Text>
        <View style={styles.cardRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}><MapPin size={18} color={color} /></View>
            <View style={styles.rowText}>
              <Text style={styles.value}>Live location sharing</Text>
              <Text style={styles.subText}>{deviceLabel}</Text>
            </View>
          </View>
          <Switch value={trackingEnabled} onValueChange={setTrackingEnabled} trackColor={{ false: '#334155', true: color }} thumbColor="#F8FAFC" />
        </View>

        <Text style={styles.groupTitle}>Emergency Contact</Text>
        <View style={styles.card}>
          {editingPhone ? (
            <View style={styles.editRow}>
              <TextInput value={tempPhone} onChangeText={setTempPhone} keyboardType="phone-pad" style={styles.input} placeholder="Emergency number" placeholderTextColor="#64748B" />
              <TouchableOpacity style={[styles.smallButton, { backgroundColor: color }]} onPress={saveEmergencyPhone}><Text style={styles.smallButtonText}>Save</Text></TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayRow}>
              <View><Text style={styles.label}>Primary emergency number</Text><Text style={styles.value}>{emergencyPhone}</Text></View>
              <TouchableOpacity onPress={() => { setTempPhone(emergencyPhone); setEditingPhone(true); }}><Text style={[styles.link, { color }]}>Change</Text></TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.groupTitle}>Notifications & Security</Text>
        <View style={styles.cardRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#0A2F4A' }]}><Bell size={18} color="#38BDF8" /></View>
            <View style={styles.rowText}><Text style={styles.value}>Push notifications & sound</Text><Text style={styles.subText}>Service, payment and safety updates</Text></View>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#334155', true: '#38BDF8' }} thumbColor="#F8FAFC" />
        </View>
        <QuickActionCard title="Notifications Center" subtitle="Open all alerts and updates" icon={<Bell size={19} color="#38BDF8" />} accentColor="#38BDF8" onPress={openNotifications} />
        <QuickActionCard title="Service History" subtitle="See your completed services and rescues" icon={<Wrench size={19} color="#F59E0B" />} accentColor="#F59E0B" onPress={() => navigation.navigate('ServiceHistory', { role })} />
        <QuickActionCard title="Linked Device" subtitle={role === 'b2b' ? 'Fleet gateway and connected vehicles' : 'Device and connection status'} icon={<Cpu size={19} color="#A78BFA" />} accentColor="#8B5CF6" onPress={() => Alert.alert('Device', `${deviceLabel} is configured for this account.`)} />
        <QuickActionCard title="Log Out" subtitle="Sign out from this account" icon={<User size={19} color="#EF4444" />} accentColor="#EF4444" onPress={handleLogout} />
      </ScrollView>

      <BottomNavigation activeTab="Settings" onChange={handleNav} accentColor={color} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' },
  scroll: { padding: 16, paddingBottom: 28 },
  hero: { padding: 14, borderRadius: 17, borderWidth: 1, backgroundColor: '#0D1B2D', flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 18 },
  heroIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heroBody: { flex: 1 },
  heroTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900' },
  heroSub: { color: '#94A3B8', fontSize: 10, lineHeight: 15, marginTop: 3 },
  groupTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '900', marginBottom: 9, marginTop: 3 },
  section: { marginBottom: 4 },
  card: { backgroundColor: '#0D1B2D', borderRadius: 15, padding: 14, borderWidth: 1, borderColor: '#1B2B40', marginBottom: 10 },
  cardRow: { backgroundColor: '#0D1B2D', borderRadius: 15, padding: 13, borderWidth: 1, borderColor: '#1B2B40', marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  value: { color: '#F8FAFC', fontSize: 13, fontWeight: '800' },
  subText: { color: '#94A3B8', fontSize: 10, lineHeight: 15, marginTop: 3 },
  label: { color: '#64748B', fontSize: 10, marginBottom: 4 },
  displayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  input: { flex: 1, height: 42, backgroundColor: '#06111F', borderRadius: 10, borderWidth: 1, borderColor: '#1B2B40', paddingHorizontal: 10, color: '#F8FAFC' },
  smallButton: { height: 42, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  smallButtonText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  link: { fontSize: 11, fontWeight: '900' },
});
