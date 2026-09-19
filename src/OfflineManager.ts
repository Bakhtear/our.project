import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { supabase } from './supabaseClient'; // তোমার সুপাবেস ক্লায়েন্ট পাথ অনুযায়ী চেঞ্জ করতে পারো

// 📦 অফলাইন SQLite ডাটাবেজ ওপেন করা
const db = SQLite.openDatabaseSync('offline_assistance.db');

export const OfflineManager = {
  
  // ১. লোকাল ডাটাবেজে টেবিল তৈরি করা (প্রজেক্ট ইনিশিয়াল করার সময় কল হবে)
  initDatabase: () => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS route_mechanics (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          specialty TEXT
        );
      `);
      console.log("💾 Offline SQLite Database & Table Initialized!");
    } catch (error) {
      console.error("Database initialization failed:", error);
    }
  },

  // ২. অনলাইন থাকা অবস্থায় রেগুলার রুটের মেকানিক ডাটা সুপাবেস থেকে ডাউনলোড করে লোকাল ফোনে সেভ করা
  downloadRouteData: async (companyId: string) => {
    try {
      // সুপাবেস থেকে মেকানিকদের ডাটা ফেচ করা
      const { data, error } = await supabase
        .from('mechanic_profiles') // তোমার টেবিল নেম অনুযায়ী চেঞ্জ করতে পারো
        .select('id, name, phone, latitude, longitude, specialty');

      if (error) throw error;

      if (data && data.length > 0) {
        // পুরনো ডাটা ক্লিয়ার করা
        db.execSync('DELETE FROM route_mechanics;');
        
        // নতুন ডাটা ইনসার্ট করা
        for (const mech of data) {
          db.runSync(
            'INSERT INTO route_mechanics (id, name, phone, latitude, longitude, specialty) VALUES (?, ?, ?, ?, ?, ?);',
            [mech.id, mech.name, mech.phone, mech.latitude, mech.longitude, mech.specialty || 'General']
          );
        }
        return { success: true, count: data.length };
      }
      return { success: false, message: "No mechanic data found on server." };
    } catch (error: any) {
      console.error("Failed to download route data:", error);
      return { success: false, error: error.message };
    }
  },

  // ৩. অফলাইন মোডে লোকাল ফোনে সেভ থাকা আশেপাশের মেকানিকদের খুঁজে বের করা (যেমন: কারেন্ট লোকেশন থেকে ১০ কিমি এর মধ্যে)
  getOfflineMechanics: () => {
    try {
      const rows = db.getAllSync('SELECT * FROM route_mechanics;');
      return rows;
    } catch (error) {
      console.error("Failed to fetch offline mechanics:", error);
      return [];
    }
  },

  // ৪. জিপিএস কোঅর্ডিনেট সহ সেন্ট্রাল বা মেকানিক নাম্বারে অটো-এসএমএস পাঠানো
  sendEmergencySMS: async (targetPhone: string, driverName: string, vehicleInfo: string) => {
    try {
      // প্রথমে জিপিএস পারমিশন চেক ও কারেন্ট লোকেশন নেওয়া
      let { status } = await Location.requestForegroundPermissionsAsync();
      let locationText = "Location unknown (GPS failed)";
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        locationText = `Lat: ${location.coords.latitude}, Lng: ${location.coords.longitude}`;
      }

      // ইমার্জেন্সি মেসেজ বডি তৈরি
      const messageBody = `[SOS - OFFLINE EMERGENCY]\nDriver: ${driverName}\nVehicle: ${vehicleInfo}\n${locationText}\nNeed immediate roadside assistance!`;

      // এক্সপো এসএমএস মডিউল দিয়ে মেসেজ পাঠানো
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync([targetPhone], messageBody);
        return { success: true, result };
      } else {
        return { success: false, message: "SMS service is not available on this device." };
      }
    } catch (error: any) {
      console.error("SMS sending failed:", error);
      return { success: false, error: error.message };
    }
  }
};