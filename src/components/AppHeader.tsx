import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Bell, LogOut, Settings } from 'lucide-react-native';
import RoleBadge, { AppRole } from './RoleBadge';

type Props = {
  name: string;
  email?: string;
  role?: AppRole;
  avatarText?: string;
  onBack?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onNotifications?: () => void;
  onLogout?: () => void;
  showRoleBadge?: boolean;
  showProfile?: boolean;
};

export default function AppHeader({
  name,
  email,
  role,
  avatarText,
  onBack,
  onProfile,
  onSettings,
  onNotifications,
  onLogout,
  showRoleBadge = true,
  showProfile = true,
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconButton} activeOpacity={0.8}>
            <ArrowLeft size={21} color="#F8FAFC" />
          </TouchableOpacity>
        ) : null}

        {showProfile ? (
          <TouchableOpacity
            disabled={!onProfile}
            onPress={onProfile}
            style={styles.profileButton}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(avatarText || name?.charAt(0) || 'U').toUpperCase()}
              </Text>
            </View>
            <View style={styles.identity}>
              <Text numberOfLines={1} style={styles.name}>{name || 'User'}</Text>
              {!!email && <Text numberOfLines={1} style={styles.email}>{email}</Text>}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.titleOnly}>
            <Text numberOfLines={1} style={styles.screenTitle}>{name}</Text>
            {!!email && <Text numberOfLines={1} style={styles.email}>{email}</Text>}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {showRoleBadge && role ? <RoleBadge role={role} /> : null}
        {onNotifications ? (
          <TouchableOpacity onPress={onNotifications} style={styles.actionButton} activeOpacity={0.8}>
            <Bell size={18} color="#F8FAFC" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        ) : null}
        {onSettings ? (
          <TouchableOpacity onPress={onSettings} style={styles.actionButton} activeOpacity={0.8}>
            <Settings size={18} color="#F8FAFC" />
          </TouchableOpacity>
        ) : null}
        {onLogout ? (
          <TouchableOpacity onPress={onLogout} style={styles.actionButton} activeOpacity={0.8}>
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 76, paddingHorizontal: 16, paddingTop: 22, paddingBottom: 12, backgroundColor: '#06111F', borderBottomWidth: 1, borderBottomColor: '#17263A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileButton: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1B2D' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#38BDF8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#06111F', fontSize: 16, fontWeight: '900' },
  identity: { flex: 1, marginLeft: 10 },
  name: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  screenTitle: { color: '#F8FAFC', fontSize: 19, fontWeight: '900' },
  titleOnly: { flex: 1 },
  email: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  actions: { marginLeft: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  actionButton: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#17263A' },
  notificationDot: { position: 'absolute', right: 8, top: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B', borderWidth: 1, borderColor: '#17263A' },
});
