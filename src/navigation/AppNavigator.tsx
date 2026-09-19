import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AuthScreen from './screens/AuthScreen';
import CustomerDashboard from './screens/CustomerDashboard';
import DriverDashboard from './screens/DriverDashboard';
import MechanicDashboard from './screens/MechanicDashboard';
import B2BDashboard from './screens/B2BDashboard';
import OfflineAssistanceScreen from './screens/OfflineAssistanceScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import ServiceHistoryScreen from './screens/ServiceHistoryScreen';
import NotificationScreen from './screens/NotificationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthScreen" screenOptions={{ headerShown: false }}>
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
  );
}
