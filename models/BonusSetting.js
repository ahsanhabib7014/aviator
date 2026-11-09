
import mongoose from 'mongoose';

const BonusSettingSchema = new mongoose.Schema({
  // ==========================================
  // 📅 সাপ্তাহিক বোনাস সেটিংস
  // ==========================================
  weeklyBonusEnabled: { type: Boolean, default: true },

  // ডিপোজিট বোনাস
  depositBonusEnabled: { type: Boolean, default: true },
  depositBonusPercent: { type: Number, default: 5 },        // ৫%
  depositBonusMax: { type: Number, default: 1000 },         // সর্বোচ্চ ৳১,০০০
  depositBonusMinDeposit: { type: Number, default: 1000 },  // ন্যূনতম ৳১,০০০

  // ক্যাশব্যাক
  cashbackEnabled: { type: Boolean, default: true },
  cashbackPercent: { type: Number, default: 5 },            // ৫%
  cashbackMax: { type: Number, default: 500 },              // সর্বোচ্চ ৳৫০০
  cashbackMinTurnover: { type: Number, default: 1000 },     // ন্যূনতম টার্নওভার ৳১,০০০

  // ==========================================
  // 🏆 মাসিক টপ র‍্যাংকার সেটিংস
  // ==========================================
  topRankerEnabled: { type: Boolean, default: true },
  topRankerCount: { type: Number, default: 10 },            // Top 10

  // 🆕 অ্যাডমিনের বাজেট কন্ট্রোলের জন্য সর্বোচ্চ বোনাস লিমিট (Max Cap)
  topRankerMaxBonus: { type: Number, default: 5000 },       // কোনো ইউজার সর্বোচ্চ ৳৫,০০০ বোনাস পাবে

  // 🆕 শতাংশ (Percentage) হিসেবে প্রাইজ সেট করা হলো
  rank1Percent:  { type: Number, default: 10 },    // 🥇 ১ম স্থান (১০%)
  rank2Percent:  { type: Number, default: 8 },     // 🥈 ২য় স্থান (৮%)
  rank3Percent:  { type: Number, default: 5 },     // 🥉 ৩য় স্থান (৫%)
  rank4Percent:  { type: Number, default: 4 },     // ৪র্থ
  rank5Percent:  { type: Number, default: 3 },     // ৫ম
  rank6Percent:  { type: Number, default: 2 },     // ৬ষ্ঠ
  rank7Percent:  { type: Number, default: 2 },     // ৭ম
  rank8Percent:  { type: Number, default: 1 },     // ৮ম
  rank9Percent:  { type: Number, default: 1 },     // ৯ম
  rank10Percent: { type: Number, default: 1 },     // ১০ম
  rank11PlusPercent: { type: Number, default: 0.5 }, // ১১ থেকে সর্বোচ্চ

  // ==========================================
  // 📊 ট্র্যাকিং
  // ==========================================
  lastWeeklyBonusAt: { type: Date, default: null },
  lastMonthlyBonusAt: { type: Date, default: null },
  weeklyBonusGivenCount: { type: Number, default: 0 },      // মোট কতবার সাপ্তাহিক বোনাস দেওয়া হয়েছে
  monthlyBonusGivenCount: { type: Number, default: 0 },     // মোট কতবার মাসিক বোনাস দেওয়া হয়েছে

}, { timestamps: true });

// Next.js ক্যাশ সমস্যা এড়াতে মডেল মুছে নতুন করে কম্পাইল
if (mongoose.models.BonusSetting) {
  delete mongoose.models.BonusSetting;
}

export default mongoose.model('BonusSetting', BonusSettingSchema);