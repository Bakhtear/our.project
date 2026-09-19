import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView 
} from 'react-native';
import { ShieldAlert, WifiOff, PhoneCall, MessageSquare, Crown, RefreshCw } from 'lucide-react-native';
import { OfflineManager } from '../OfflineManager';
import { supabase } from '../supabaseClient';
import { StatusBadge, AppHeader } from '../components';

export default function OfflineAssistanceScreen({ navigation, route }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [offlineMechanics, setOfflineMechanics] = useState<any[]>([]);

  // ডেমো ডেটা (তোমার রিয়েল ড্রাইভারে প্রোফাইল থেকে আসবে)
  const driverName = "মো: কুদ্দুস মিয়া";
  const vehicleInfo = "Delivery Truck X-12 (Dhaka Metro-Ta-11-2222)";
  const emergencyCentralNumber = "01712345678"; // আমাদের মেইন কোম্পানির হটলাইন নম্বর

  useEffect(() => {
    // ডাটাবেজ ইনিশিয়াল করা
    OfflineManager.initDatabase();
    checkSubscriptionAndLoad();
  }, []);

  // 💳 প্রিমিয়াম সাবস্ক্রিপশন এবং অফলাইন ডাটা চেক লজিক
 // 💳 সাবস্ক্রিপশন চেক লজিক (মালিক অথবা কাস্টমারের জন্য)
  const checkSubscriptionAndLoad = async () => {
    setIsLoading(true);
    try {
      // ১. প্রথমে সুপাবেস বা লোকাল স্টোরেজ থেকে কারেন্ট ইউজারের রোল (Role) বের করা
      // ডেমো হিসেবে আমরা ধরে নিচ্ছি ইউজারের রোল 'driver' অথবা 'customer'
      const userRole = "driver"; // 👈 টেস্ট করার জন্য এখানে 'customer' বা 'driver' লিখে চেক করতে পারো
      
      if (userRole === "driver") {
        // 🚛 ড্রাইভার হলে চেক হবে তার কোম্পানির মালিকের (B2B) সাবস্ক্রিপশন আছে কি না
        const companyId = 'c1'; // ড্রাইভারের প্রোফাইলে থাকা মালিকের আইডি
        const { data, error } = await supabase
          .from('b2b_profiles')
          .select('has_active_package')
          .eq('id', companyId)
          .single();

        if (error) throw error;
        setIsPremium(data?.has_active_package || false);

      } else if (userRole === "customer") {
        // 🚗 নরমাল কাস্টমার হলে তার নিজের প্রোফাইলের সাবস্ক্রিপশন চেক হবে
        const customerId = 'cust123'; // কাস্টমার আইডি
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('is_premium_user')
          .eq('id', customerId)
          .single();

        if (error) throw error;
        setIsPremium(data?.is_premium_user || false);
      }

      // যদি সাবস্ক্রিপশন ভ্যালিড হয়, তবে অফলাইন মেকানিক লিস্ট লোড হবে
      if (isPremium) {
        const localMechs = OfflineManager.getOfflineMechanics();
        setOfflineMechanics(localMechs);
      }

    } catch (err) {
      // ইন্টারনেট একদম না থাকলে ক্যাটচ ব্লকে আসবে। 
      // ডিফেন্স বা টেস্টিং এর সুবিধার্থে অফলাইনেও যেন প্রিমিয়াম ফিচার দেখতে পারো, তাই এখানে ট্রু রাখা হলো
      console.log("Offline or connection failed. Bypassing check for presentation...");
      setIsPremium(true); 
      const localMechs = OfflineManager.getOfflineMechanics();
      setOfflineMechanics(localMechs);
    } finally {
      setIsLoading(false);
    }
  };

  // 📨 ইমার্জেন্সি এসএমএস ট্রিগার
  const handleEmergencySMS = async (phone: string) => {
    const res = await OfflineManager.sendEmergencySMS(phone, driverName, vehicleInfo);
    if (res.success) {
      Alert.alert("সফল হয়েছে", "আপনার জিপিএস লোকেশন সহ ইমার্জেন্সি এসএমএস পাঠানো হয়েছে।");
    } else {
      Alert.alert("ব্যর্থ হয়েছে", res.message || "এসএমএস পাঠানো যায়নি।");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // ❌ ১. যদি কাস্টমার নরমাল (ফ্রি ইউজার) হয় — তাকে এই স্ক্রিন লক দেখাবে
  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockBox}>
          <WifiOff size={64} color="#EF4444" style={{ marginBottom: 20 }} />
          <Text style={styles.lockTitle}>কোনো ইন্টারনেট কানেকশন নেই!</Text>
          <Text style={styles.lockSub}>
            দুঃখিত, আপনি বর্তমানে অফলাইনে আছেন। আমাদের ইমার্জেন্সি অফলাইন এসএমএস এবং অফলাইন রুট মেকানিক সিস্টেমটি ব্যবহার করতে ইন্টারনেটে কানেক্ট করুন।
          </Text>
          
          <View style={styles.premiumBenefitCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Crown size={20} color="#F59E0B" />
              <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>প্রিমিয়াম মেম্বারশিপের সুবিধা সমূহ:</Text>
            </View>
            <Text style={styles.benefitText}>• ইন্টারনেট ছাড়াই জিপিএস ট্র্যাকিং ও অটো-এসএমএস</Text>
            <Text style={styles.benefitText}>• অফলাইন রুটের মেকানিকদের ফোন নম্বর ও ডিরেক্ট কল</Text>
            <Text style={styles.benefitText}>• ২৪/৭ সেন্ট্রাল ইমার্জেন্সি ব্যাকআপ সাপোর্ট</Text>
          </View>

          <TouchableOpacity style={styles.retryBtn} onPress={checkSubscriptionAndLoad}>
            <RefreshCw size={16} color="#0F172A" />
            <Text style={styles.retryBtnText}>আবার চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 👑 ২. যদি কাস্টমার প্রিমিয়াম সাবস্ক্রিপশন হোল্ডার হয় — তাকে ফুল অফলাইন ড্যাশবোর্ড দেখাবে
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>প্রিমিয়াম অফলাইন অ্যাসিস্ট্যান্স</Text>
          <View style={{ marginTop: 6 }}><StatusBadge text="OFFLINE MODE" type="danger" /></View>
        </View>
        <Crown size={22} color="#F59E0B" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {/* ইমার্জেন্সি সেন্ট্রাল বাটন */}
        <View style={[styles.premiumCard, { borderColor: '#EF4444' }]}>
          <Text style={styles.cardTitle}>🚨 সেন্ট্রাল হেল্পলাইন (SMS Fallback)</Text>
          <Text style={styles.cardSub}>
            ইন্টারনেট না থাকলেও নিচের বাটনে চাপ দিলে আপনার বর্তমান নিখুঁত জিপিএস অক্ষাংশ ও দ্রাঘিমাংশ সহ কোম্পানির সেন্ট্রাল ডেস্কে একটি অটোমেটিক সাহায্য বার্তা চলে যাবে।
          </Text>
          <TouchableOpacity style={styles.sosBtn} onPress={() => handleEmergencySMS(emergencyCentralNumber)}>
            <MessageSquare size={18} color="#FFF" />
            <Text style={styles.sosBtnText}>কোম্পানিকে ইমার্জেন্সি SMS পাঠান</Text>
          </TouchableOpacity>
        </View>

        {/* ডাউনলোড করা অফলাইন রুট মেকানিক লিস্ট */}
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>📍 আপনার সেভ করা রুটের অফলাইন মেকানিকগণ</Text>
          <Text style={styles.cardSub}>আপনার এই যাতায়াতের রাস্তায় ইন্টারনেট ছাড়াই নিচের মেকানিকদের সরাসরি কল বা এসএমএস করতে পারবেন:</Text>
          
          {offlineMechanics.length === 0 ? (
            <Text style={styles.noDataText}>কোনো অফলাইন রুট ডাটা ডাউনলোড করা নেই। অনলাইনে থাকা অবস্থায় ডাটা সিঙ্ক করে নিন।</Text>
          ) : (
            offlineMechanics.map((mech) => (
              <View key={mech.id} style={styles.mechanicRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>{mech.name}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>🛠️ স্পেশালিস্ট: {mech.specialty}</Text>
                  <Text style={{ color: '#38BDF8', fontSize: 11, marginTop: 1 }}>📞 {mech.phone}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleEmergencySMS(mech.phone)}>
                    <MessageSquare size={16} color="#38BDF8" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionIconBtn, { borderColor: '#10B98133' }]}>
                    <PhoneCall size={16} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  centerContainer: { flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', alignItems: 'center' },
  lockBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  lockTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  lockSub: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  premiumBenefitCard: { backgroundColor: '#111827', padding: 16, borderRadius: 12, width: '100%', borderWidth: 1, borderColor: '#F59E0B33', marginBottom: 25 },
  benefitText: { color: '#9CA3AF', fontSize: 13, marginTop: 6, lineHeight: 18 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#38BDF8', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  retryBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#111827', borderBottomWidth: 1, borderColor: '#1F2937', gap: 10 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  badge: { backgroundColor: '#EF444422', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#EF444444' },
  badgeText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' },
  scrollBody: { padding: 14, gap: 14 },
  premiumCard: { backgroundColor: '#111827', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#1F2937' },
  cardTitle: { color: '#F3F4F6', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  cardSub: { color: '#9CA3AF', fontSize: 12, lineHeight: 18, marginBottom: 14 },
  sosBtn: { flexDirection: 'row', backgroundColor: '#DC2626', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8 },
  sosBtnText: { color: '#FFF', fontWeight: 'bold' },
  noDataText: { color: '#64748B', fontSize: 13, textAlign: 'center', paddingVertical: 20, lineHeight: 18 },
  mechanicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F2937', padding: 14, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#374151' },
  actionIconBtn: { padding: 10, backgroundColor: '#111827', borderRadius: 8, borderWidth: 1, borderColor: '#374151' }
});