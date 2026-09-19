import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image 
} from 'react-native';
import { CreditCard, DollarSign, CheckCircle } from 'lucide-react-native';
import { supabase } from '../supabaseClient';
import { layout } from '../theme/layout';

interface PaymentBoxProps {
  requestId: string;
  baseFee: number;
  extraCharges: number;
  onPaymentSuccess: () => void;
}

export default function PaymentBox({ requestId, baseFee, extraCharges, onPaymentSuccess }: PaymentBoxProps) {
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'cash' | null>(null);
  const [loading, setLoading] = useState(false);
  
  const totalBill = baseFee + extraCharges;

  // 💳 পেমেন্ট প্রসেস করার ফাংশন (টেস্টিংয়ের জন্য অফলাইন মোড)
  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      Alert.alert("Car Rescue BD", "দয়া করে যেকোনো একটি পেমেন্ট মাধ্যম সিলেক্ট করুন।");
      return;
    }

    setLoading(true);

    // সুপাবেসের নেটওয়ার্ক কল বাদ দিয়ে সরাসরি সাকসেস ফ্লো চালানো হলো
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "পেমেন্ট সফল", 
        `আপনার ${totalBill} টাকা পেমেন্টটি সফলভাবে সম্পন্ন হয়েছে।`,
        [{ text: "ঠিক আছে", onPress: () => onPaymentSuccess() }]
      );
    }, 1000); // ১ সেকেন্ডের একটি ফেক লোডিং ডিলে রাখা হলো
  };

  // 💳 পেমেন্ট প্রসেস করার ফাংশন
 /* const handleProcessPayment = async () => {
    if (!selectedMethod) {
      Alert.alert("Car Rescue BD", "দয়া করে যেকোনো একটি পেমেন্ট মাধ্যম সিলেক্ট করুন।");
      return;
    }

    setLoading(true);

    try {
      // সুপাবেসের 'requests' বা 'trips' টেবিলে স্ট্যাটাস এবং পement মেথড আপডেট
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: 'paid',
          payment_method: selectedMethod,
          total_amount: totalBill,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // পেমেন্ট সফল হলে কাস্টমারকে জানানো
      Alert.alert(
        "পেমেন্ট সফল", 
        `আপনার ${totalBill} টাকা পেমেন্টটি সফলভাবে সম্পন্ন হয়েছে।`,
        [{ text: "ঠিক আছে", onPress: () => onPaymentSuccess() }]
      );

    } catch (err: any) {
      Alert.alert("দুঃখিত", "পেমেন্ট আপডেট করা যায়নি: " + err.message);
    } finally {
      setLoading(false);
    }
  };*/

  return (
    <View style={styles.paymentCard}>
      <Text style={styles.title}>Car Rescue BD - বিল ও ইনভয়েস</Text>
      
      {/* 📄 বিলের ব্রেকডাউন */}
      <View style={styles.invoiceDetails}>
        <View style={styles.billRow}>
          <Text style={styles.label}>মেকানিক ভিজিট ফি:</Text>
          <Text style={styles.value}>{baseFee} ৳</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.label}>অতিরিক্ত কাজের বিল:</Text>
          <Text style={styles.value}>{extraCharges} ৳</Text>
        </View>
        <View style={[styles.billRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>সর্বমোট বিল:</Text>
          <Text style={styles.totalValue}>{totalBill} ৳</Text>
        </View>
      </View>

      <Text style={styles.subTitle}>পেমেন্টের মাধ্যম বেছে নিন:</Text>

      {/* 📱 পেমেন্ট মেথড বাটনসমূহ */}
      <View style={styles.methodContainer}>
        {/* বিকাশ (bKash) - প্রিমিয়াম পিঙ্ক থিম */}
        <TouchableOpacity 
          style={[styles.methodBtn, selectedMethod === 'bkash' && styles.bkashSelected]} 
          onPress={() => setSelectedMethod('bkash')}
        >
          <View style={[styles.radio, selectedMethod === 'bkash' && styles.radioActive]} />
          <Text style={[styles.methodText, selectedMethod === 'bkash' && styles.activeText]}>বিকাশ (bKash)</Text>
        </TouchableOpacity>

        {/* নগদ (Nagad) - প্রিমিয়াম অরেঞ্জ থিম */}
        <TouchableOpacity 
          style={[styles.methodBtn, selectedMethod === 'nagad' && styles.nagadSelected]} 
          onPress={() => setSelectedMethod('nagad')}
        >
          <View style={[styles.radio, selectedMethod === 'nagad' && styles.radioActive]} />
          <Text style={[styles.methodText, selectedMethod === 'nagad' && styles.activeText]}>নগদ (Nagad)</Text>
        </TouchableOpacity>

        {/* হ্যান্ড ক্যাশ (Hand Cash) */}
        <TouchableOpacity 
          style={[styles.methodBtn, selectedMethod === 'cash' && styles.cashSelected]} 
          onPress={() => setSelectedMethod('cash')}
        >
          <View style={[styles.radio, selectedMethod === 'cash' && styles.radioActive]} />
          <Text style={[styles.methodText, selectedMethod === 'cash' && styles.activeText]}>হ্যান্ড ক্যাশ</Text>
        </TouchableOpacity>
      </View>

      {/* 🚀 পেমেন্ট সাবমিট বাটন */}
      <TouchableOpacity 
        style={styles.payNowBtn} 
        onPress={handleProcessPayment}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#0B0F19" /> : (
          <>
            <CheckCircle size={18} color="#0B0F19" />
            <Text style={styles.payNowText}>পেমেন্ট নিশ্চিত করুন</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  paymentCard: { backgroundColor: '#1F2937', padding: layout.cardPadding, borderRadius: layout.radiusLg, borderWidth: 1, borderColor: '#374151', width: '100%' },
  title: { color: '#38BDF8', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: layout.itemGapLg },
  subTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: layout.itemGap, marginTop: layout.itemGapSm },
  invoiceDetails: { backgroundColor: '#111827', padding: layout.itemGap, borderRadius: layout.radius, borderWidth: 1, borderColor: '#27272A', marginBottom: layout.itemGapLg },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { color: '#9CA3AF', fontSize: 13 },
  value: { color: '#FFF', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#374151', marginTop: layout.itemGapSm, paddingTop: layout.itemGap },
  totalLabel: { color: '#38BDF8', fontWeight: 'bold', fontSize: 14 },
  totalValue: { color: '#38BDF8', fontWeight: 'bold', fontSize: 15 },
  methodContainer: { gap: layout.itemGap, marginBottom: layout.itemGapLg },
  methodBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', padding: layout.itemGap, borderRadius: layout.radius, gap: layout.itemGap },
  bkashSelected: { borderColor: '#E2136E', backgroundColor: '#E2136E15' },
  nagadSelected: { borderColor: '#FA5A1E', backgroundColor: '#FA5A1E15' },
  cashSelected: { borderColor: '#10B981', backgroundColor: '#10B98115' },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#4B5563' },
  radioActive: { borderColor: '#38BDF8', backgroundColor: '#38BDF8' },
  methodText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  activeText: { color: '#FFF', fontWeight: 'bold' },
  payNowBtn: { flexDirection: 'row', backgroundColor: '#38BDF8', height: layout.btnHeight, borderRadius: layout.radius, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: layout.itemGapSm },
  payNowText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 15 }
});