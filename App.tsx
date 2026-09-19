import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FakeShutdownProvider } from './src/components/FakeShutdownProvider';
import AuthScreen from './src/screens/AuthScreen';
import CustomerDashboard from './src/screens/CustomerDashboard';
import DriverDashboard from './src/screens/DriverDashboard';
import MechanicDashboard from './src/screens/MechanicDashboard';
import B2BDashboard from './src/screens/B2BDashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OfflineAssistanceScreen from './src/screens/OfflineAssistanceScreen';
import ServiceHistoryScreen from './src/screens/ServiceHistoryScreen';
import NotificationScreen from './src/screens/NotificationScreen';

type AppRole = 'customer' | 'mechanic' | 'b2b' | 'driver';
type HistoryItem = {
  id: string;
  title: string;
  date: string;
  partner: string;
  amount: string;
  status: 'completed' | 'pending' | 'cancelled';
  vehicle?: string;
  location?: string;
};

export type RootStackParamList = {
  AuthScreen: undefined;
  CustomerDashboard: { email?: string; bypass?: boolean } | undefined;
  CustomerHome: { email?: string; bypass?: boolean } | undefined;
  DriverDashboard: { email?: string; bypass?: boolean } | undefined;
  MechanicDashboard: { email?: string; bypass?: boolean } | undefined;
  MechanicFeed: { email?: string; bypass?: boolean } | undefined;
  B2BDashboard: { email?: string; bypass?: boolean } | undefined;
  B2BDispatch: { email?: string; bypass?: boolean } | undefined;
  OfflineAssistance: undefined;
  ProfileScreen: { role?: AppRole; userId?: string } | undefined;
  SettingsScreen: { role?: AppRole } | undefined;
  ServiceHistory: { role?: AppRole; history?: HistoryItem[] } | undefined;
  NotificationScreen: { role?: AppRole } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <FakeShutdownProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#0B0F19" />
          <Stack.Navigator
            initialRouteName="AuthScreen"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0B0F19' },
            }}
          >
            <Stack.Screen name="AuthScreen" component={AuthScreen} />
            <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
            <Stack.Screen name="CustomerHome" component={CustomerDashboard} />
            <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
            <Stack.Screen name="MechanicDashboard" component={MechanicDashboard} />
            <Stack.Screen name="MechanicFeed" component={MechanicDashboard} />
            <Stack.Screen name="B2BDashboard" component={B2BDashboard} />
            <Stack.Screen name="B2BDispatch" component={B2BDashboard} />
            <Stack.Screen name="OfflineAssistance" component={OfflineAssistanceScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </FakeShutdownProvider>
    </SafeAreaProvider>
  );
}
