import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Clock3, Home, Settings } from 'lucide-react-native';

type TabKey = 'Home' | 'History' | 'Notifications' | 'Settings';

const TABS: Array<{ key: TabKey; label: string; Icon: any }> = [
  { key: 'Home', label: 'Home', Icon: Home },
  { key: 'History', label: 'History', Icon: Clock3 },
  { key: 'Notifications', label: 'Alerts', Icon: Bell },
  { key: 'Settings', label: 'Settings', Icon: Settings },
];

type Props = { activeTab: TabKey; onChange: (tab: TabKey) => void; accentColor?: string };

export default function BottomNavigation({ activeTab, onChange, accentColor = '#1687FF' }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map(({ key, label, Icon }) => {
        const active = key === activeTab;
        return (
          <TouchableOpacity key={key} style={styles.tab} activeOpacity={0.8} onPress={() => onChange(key)}>
            <View style={[styles.iconWrap, active && { backgroundColor: `${accentColor}22` }]}>
              <Icon size={20} color={active ? accentColor : '#94A3B8'} />
            </View>
            <Text style={[styles.label, { color: active ? accentColor : '#94A3B8' }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 72, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10, backgroundColor: '#06111F', borderTopWidth: 1, borderTopColor: '#17263A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconWrap: { width: 36, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '800' },
});
