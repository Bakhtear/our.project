import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Building2, Car, Mail, Phone, Save, ShieldCheck, User, Users, Wrench } from 'lucide-react-native';
import { supabase } from '../supabaseClient';
import { AppHeader, BottomNavigation, ProfileField, ProfileHeader, ProfileSection, ROLE_MAP, StatusBadge, AppRole } from '../components';

type Role = AppRole;

export default function ProfileScreen({ navigation, route }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<Role>((route?.params?.role || 'customer') as Role);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [vehicleRegNumber, setVehicleRegNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [fleetSize, setFleetSize] = useState('1');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [assignedVehicleReg, setAssignedVehicleReg] = useState('');
  const color = ROLE_MAP[role].color;
  const initials = useMemo(() => fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'U', [fullName]);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('লগইন প্রয়োজন', 'প্রোফাইল দেখতে লগইন করুন।', [{ text: 'Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'AuthScreen' }] }) }]);
        return;
      }
      setEmail(user.email || '');
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      const dbRole = (profile?.role || role || 'customer') as Role;
      const safeRole = ROLE_MAP[dbRole] ? dbRole : 'customer';
      setRole(safeRole);
      setFullName(profile?.full_name || ''); setMobileNumber(profile?.mobile_number || '');
      if (safeRole === 'customer') { const { data } = await supabase.from('customer_profiles').select('*').eq('id', user.id).maybeSingle(); setVehicleType(data?.vehicle_type || 'car'); setVehicleRegNumber(data?.vehicle_reg_number || ''); }
      else if (safeRole === 'mechanic') { const { data } = await supabase.from('mechanic_profiles').select('*').eq('id', user.id).maybeSingle(); setSpecialty(data?.specialty || ''); setNidNumber(data?.nid_number || ''); }
      else if (safeRole === 'b2b') { const { data } = await supabase.from('b2b_profiles').select('*').eq('id', user.id).maybeSingle(); setCompanyName(data?.company_name || ''); setContactPerson(data?.contact_person || ''); setFleetSize(String(data?.fleet_size || 1)); }
      else { const { data } = await supabase.from('driver_profiles').select('*').eq('id', user.id).maybeSingle(); setLicenseNumber(data?.license_number || ''); setAssignedVehicleReg(data?.assigned_vehicle_reg || ''); }
    } catch (e: any) { console.error('Profile load:', e); Alert.alert('Error', 'Profile load করতে সমস্যা হয়েছে।'); }
    finally { setLoading(false); }
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
      const { error: masterError } = await supabase.from('profiles').update({ full_name: fullName.trim(), mobile_number: mobileNumber.trim() }).eq('id', user.id); if (masterError) throw masterError;
      if (role === 'customer') { const { error } = await supabase.from('customer_profiles').upsert({ id: user.id, vehicle_type: vehicleType.trim(), vehicle_reg_number: vehicleRegNumber.trim() }); if (error) throw error; }
      else if (role === 'mechanic') { const { error } = await supabase.from('mechanic_profiles').upsert({ id: user.id, specialty: specialty.trim(), nid_number: nidNumber.trim() }); if (error) throw error; }
      else if (role === 'b2b') { const { error } = await supabase.from('b2b_profiles').upsert({ id: user.id, company_name: companyName.trim(), contact_person: contactPerson.trim(), fleet_size: parseInt(fleetSize, 10) || 1 }); if (error) throw error; }
      else { const { error } = await supabase.from('driver_profiles').upsert({ id: user.id, license_number: licenseNumber.trim(), assigned_vehicle_reg: assignedVehicleReg.trim() }); if (error) throw error; }
      Alert.alert('সফল', 'আপনার প্রোফাইল আপডেট হয়েছে।');
    } catch (e: any) { Alert.alert('Error', 'সংরক্ষণ করতে ব্যর্থ: ' + e.message); }
    finally { setSaving(false); }
  }

  const handleNav = (tab: 'Home' | 'History' | 'Notifications' | 'Settings') => {
    if (tab === 'History') return navigation.navigate('ServiceHistory', { role });
    if (tab === 'Notifications') return navigation.navigate('NotificationScreen', { role });
    if (tab === 'Settings') return navigation.navigate('SettingsScreen', { role });
    const home = role === 'customer' ? 'CustomerHome' : role === 'mechanic' ? 'MechanicFeed' : role === 'b2b' ? 'B2BDispatch' : 'DriverDashboard'; navigation.navigate(home);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={color} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />
      <AppHeader name="My Profile" email={ROLE_MAP[role].label} role={role} showProfile={false} onBack={() => navigation.goBack()} onNotifications={() => navigation.navigate('NotificationScreen', { role })} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}><StatusBadge text={ROLE_MAP[role].label} type="info" /></View>
        <ProfileHeader name={fullName} role={role} subtitle={ROLE_MAP[role].label} avatarText={initials} />
        <ProfileSection title="Basic Information" accentColor={color} icon={<User size={17} color={color} />}>
          <ProfileField label="Full Name" value={fullName} onChangeText={setFullName} icon={User} accentColor={color} />
          <ProfileField label="Email" value={email} editable={false} icon={Mail} accentColor={color} />
          <ProfileField label="Phone" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" icon={Phone} accentColor={color} />
        </ProfileSection>
        {role === 'customer' && <ProfileSection title="Vehicle Information" accentColor={color} icon={<Car size={17} color={color} />}><ProfileField label="Vehicle Type" value={vehicleType} onChangeText={setVehicleType} icon={Car} accentColor={color} /><ProfileField label="Registration Number" value={vehicleRegNumber} onChangeText={setVehicleRegNumber} icon={Car} accentColor={color} /></ProfileSection>}
        {role === 'mechanic' && <ProfileSection title="Professional Details" accentColor={color} icon={<Wrench size={17} color={color} />}><ProfileField label="Specialty" value={specialty} onChangeText={setSpecialty} icon={Wrench} accentColor={color} /><ProfileField label="NID Number" value={nidNumber} onChangeText={setNidNumber} keyboardType="number-pad" icon={ShieldCheck} accentColor={color} /></ProfileSection>}
        {role === 'b2b' && <><ProfileSection title="Business Information" accentColor={color} icon={<Building2 size={17} color={color} />}><ProfileField label="Company Name" value={companyName} onChangeText={setCompanyName} icon={Building2} accentColor={color} /><ProfileField label="Contact Person" value={contactPerson} onChangeText={setContactPerson} icon={User} accentColor={color} /></ProfileSection><ProfileSection title="Fleet Information" accentColor={color} icon={<Car size={17} color={color} />}><ProfileField label="Fleet Size" value={fleetSize} onChangeText={setFleetSize} keyboardType="number-pad" icon={Users} accentColor={color} /></ProfileSection></>}
        {role === 'driver' && <ProfileSection title="Driving Information" accentColor={color} icon={<Car size={17} color={color} />}><ProfileField label="Driving License Number" value={licenseNumber} onChangeText={setLicenseNumber} icon={ShieldCheck} accentColor={color} /><ProfileField label="Assigned Vehicle Reg." value={assignedVehicleReg} onChangeText={setAssignedVehicleReg} icon={Car} accentColor={color} /></ProfileSection>}
        <TouchableOpacity style={[styles.save, { backgroundColor: color }]} disabled={saving} onPress={saveProfile}>{saving ? <ActivityIndicator color="#FFF" /> : <><Save size={18} color="#FFF" /><Text style={styles.saveText}>Save Changes</Text></>}</TouchableOpacity>
      </ScrollView>
      <BottomNavigation activeTab="Settings" onChange={handleNav} accentColor={color} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06111F' }, loading: { flex: 1, backgroundColor: '#06111F', alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 20 }, badgeRow: { marginBottom: 8 }, save: { height: 54, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 2 }, saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
});
