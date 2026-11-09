// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema(
//   {
//     uid: { type: String, required: true, unique: true },
//     phone: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     balance: { type: Number, default: 0 },
//     turnover: { type: Number, default: 0 },
//     isBlocked: { type: Boolean, default: false },
//     ipAddress: { type: String, default: "" },
//     pin: { type: String, required: true },

//     // 🔄 আপডেট করা রোল — 'agent' যোগ করা হলো
//     role: {
//       type: String,
//       enum: ["user", "admin", "sub-admin", "agent"],
//       default: "user",
//     },
//     permissionExpiresAt: {
//       type: Date,
//       default: null,
//     },

//     // 🆕 নতুন পারমিশন ফিল্ড যুক্ত করা হলো
//     permissions: [
//       {
//         type: String,
//       },
//     ],
//     agentCryptoAddress: { type: String, default: "" },

//     // 🆕 এজেন্টের একাধিক পেমেন্ট অ্যাকাউন্ট (নাম্বার/অ্যাড্রেস)
//     agentPaymentAccounts: [
//       {
//         method: { type: String, default: "" }, // যেমন: bKash Personal, Nagad, USDT
//         accountNumber: { type: String, default: "" }, // নাম্বার বা অ্যাড্রেস
//       },
//     ],

//     // ==========================================
//     // 🆕 এজেন্ট সিস্টেম ফিল্ড
//     // ==========================================
//     agentCode: { type: String, unique: true, sparse: true },
//     agentPhone: { type: String, default: "" },
//     agentCryptoAddress: { type: String, default: "" },
//     agentMainBalance: { type: Number, default: 0, min: 0 },
//     agentCommissionBalance: { type: Number, default: 0, min: 0 },
//     agentDepositCommission: { type: Number, default: 0, min: 0, max: 100 },
//     agentWithdrawCommission: { type: Number, default: 0, min: 0, max: 100 },
//     agentIsActive: { type: Boolean, default: false },
//     agentIsBlocked: { type: Boolean, default: false },

//     // 🔐 Login brute-force protection
//     loginAttempts: { type: Number, default: 0 },
//     loginLockedUntil: { type: Date, default: null },

//     // 🎁 রেফারেল সিস্টেম
//     referralBalance: { type: Number, default: 0 },
//     referralCode: { type: String, unique: true, sparse: true },
//     referredBy: { type: String, default: null },
//     customCommission: { type: Number, default: null },

//     // ==========================================
//     // ✅ বোনাস ট্র্যাকিং — সাপ্তাহিক
//     // ==========================================
//     weeklyTurnover: { type: Number, default: 0 },
//     weeklyLost: { type: Number, default: 0 },
//     weeklyDeposit: { type: Number, default: 0 },

//     // ==========================================
//     // ✅ বোনাস ট্র্যাকিং — মাসিক
//     // ==========================================
//     monthlyTurnover: { type: Number, default: 0 },
//     monthlyLost: { type: Number, default: 0 },
//     monthlyCashbackReceived: { type: Number, default: 0 },

//     // ==========================================
//     // ✅ সব সময়ের ট্র্যাকিং
//     // ==========================================
//     totalLost: { type: Number, default: 0 },

//     // ==========================================
//     // 🎖️ VIP Level System
//     // ==========================================
//     totalDeposit: { type: Number, default: 0 },
//     vipLevel: {
//       type: String,
//       enum: ["none", "bronze", "silver", "gold", "diamond"],
//       default: "none",
//     },
//     vipLevelUpdatedAt: { type: Date, default: null },

//     // ==========================================
//     // ✅ শেষ বোনাস কবে পেয়েছে
//     // ==========================================
//     lastWeeklyBonusAt: { type: Date, default: null },
//     lastMonthlyBonusAt: { type: Date, default: null },

//     // ==========================================
//     // ✅ বোনাস হিস্ট্রি
//     // ==========================================
//     weeklyBonusHistory: [
//       {
//         amount: { type: Number, default: 0 },
//         type: {
//           type: String,
//           enum: ["deposit", "cashback"],
//           default: "deposit",
//         },
//         week: { type: String },
//         givenAt: { type: Date, default: Date.now },
//       },
//     ],

//     monthlyBonusHistory: [
//       {
//         amount: { type: Number, default: 0 },
//         type: { type: String, enum: ["top_ranker"], default: "top_ranker" },
//         month: { type: String },
//         rank: { type: Number, default: 0 },
//         givenAt: { type: Date, default: Date.now },
//       },
//     ],

//     // ==========================================
//     // 🆕 বোনাস রিসেট হিস্ট্রি (রিসেটের আগের মান সংরক্ষণ)
//     // ==========================================
//     weeklyTurnoverHistory: [
//       {
//         week: { type: String },
//         weeklyTurnover: { type: Number, default: 0 },
//         weeklyLost: { type: Number, default: 0 },
//         weeklyDeposit: { type: Number, default: 0 },
//         resetAt: { type: Date, default: Date.now },
//       },
//     ],

//     monthlyTurnoverHistory: [
//       {
//         month: { type: String },
//         monthlyTurnover: { type: Number, default: 0 },
//         monthlyLost: { type: Number, default: 0 },
//         monthlyCashbackReceived: { type: Number, default: 0 },
//         resetAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true },
// );

// if (mongoose.models.User) {
//   delete mongoose.models.User;
// }

// export default mongoose.model("User", UserSchema);
// ////////////////////////////////////////
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // 🆕 balance-এ set ফাংশন যোগ করা হলো
    balance: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    // 🆕 turnover-এ set ফাংশন যোগ করা হলো
    turnover: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    isBlocked: { type: Boolean, default: false },
    ipAddress: { type: String, default: "" },
    pin: { type: String, required: true },

    // 🔄 আপডেট করা রোল — 'agent' যোগ করা হলো
    role: {
      type: String,
      enum: ["user", "admin", "sub-admin", "agent"],
      default: "user",
    },
    permissionExpiresAt: {
      type: Date,
      default: null,
    },

    // 🆕 নতুন পারমিশন ফিল্ড যুক্ত করা হলো
    permissions: [
      {
        type: String,
      },
    ],
    agentCryptoAddress: { type: String, default: "" },

    // 🆕 এজেন্টের একাধিক পেমেন্ট অ্যাকাউন্ট (নাম্বার/অ্যাড্রেস)
    agentPaymentAccounts: [
      {
        method: { type: String, default: "" }, // যেমন: bKash Personal, Nagad, USDT
        accountNumber: { type: String, default: "" }, // নাম্বার বা অ্যাড্রেস
      },
    ],

    // ==========================================
    // 🆕 এজেন্ট সিস্টেম ফিল্ড
    // ==========================================
    agentCode: { type: String, unique: true, sparse: true },
    agentPhone: { type: String, default: "" },
    agentCryptoAddress: { type: String, default: "" },
    // 🆕 এজেন্ট ব্যালেন্সেও set ফাংশন
    agentMainBalance: { 
      type: Number, 
      default: 0, 
      min: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    agentCommissionBalance: { 
      type: Number, 
      default: 0, 
      min: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    agentDepositCommission: { type: Number, default: 0, min: 0, max: 100 },
    agentWithdrawCommission: { type: Number, default: 0, min: 0, max: 100 },
    agentIsActive: { type: Boolean, default: false },
    agentIsBlocked: { type: Boolean, default: false },

    // 🔐 Login brute-force protection
    loginAttempts: { type: Number, default: 0 },
    loginLockedUntil: { type: Date, default: null },

    // 🎁 রেফারেল সিস্টেম
    // 🆕 রেফারেল ব্যালেন্সেও set ফাংশন
    referralBalance: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    customCommission: { type: Number, default: null },

    // ==========================================
    // ✅ বোনাস ট্র্যাকিং — সাপ্তাহিক
    // ==========================================
    weeklyTurnover: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    weeklyLost: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    weeklyDeposit: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },

    // ==========================================
    // ✅ বোনাস ট্র্যাকিং — মাসিক
    // ==========================================
    monthlyTurnover: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    monthlyLost: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    monthlyCashbackReceived: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },

    // ==========================================
    // ✅ সব সময়ের ট্র্যাকিং
    // ==========================================
    totalLost: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },

    // ==========================================
    // 🎖️ VIP Level System
    // ==========================================
    totalDeposit: { 
      type: Number, 
      default: 0,
      set: (v) => Number(Number(v).toFixed(2))
    },
    vipLevel: {
      type: String,
      enum: ["none", "bronze", "silver", "gold", "diamond"],
      default: "none",
    },
    vipLevelUpdatedAt: { type: Date, default: null },

    // ==========================================
    // ✅ শেষ বোনাস কবে পেয়েছে
    // ==========================================
    lastWeeklyBonusAt: { type: Date, default: null },
    lastMonthlyBonusAt: { type: Date, default: null },

    // ==========================================
    // ✅ বোনাস হিস্ট্রি
    // ==========================================
    weeklyBonusHistory: [
      {
        amount: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        type: {
          type: String,
          enum: ["deposit", "cashback"],
          default: "deposit",
        },
        week: { type: String },
        givenAt: { type: Date, default: Date.now },
      },
    ],

    monthlyBonusHistory: [
      {
        amount: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        type: { type: String, enum: ["top_ranker"], default: "top_ranker" },
        month: { type: String },
        rank: { type: Number, default: 0 },
        givenAt: { type: Date, default: Date.now },
      },
    ],

    // ==========================================
    // 🆕 বোনাস রিসেট হিস্ট্রি (রিসেটের আগের মান সংরক্ষণ)
    // ==========================================
    weeklyTurnoverHistory: [
      {
        week: { type: String },
        weeklyTurnover: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        weeklyLost: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        weeklyDeposit: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        resetAt: { type: Date, default: Date.now },
      },
    ],

    monthlyTurnoverHistory: [
      {
        month: { type: String },
        monthlyTurnover: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        monthlyLost: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        monthlyCashbackReceived: { 
          type: Number, 
          default: 0,
          set: (v) => Number(Number(v).toFixed(2))
        },
        resetAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model("User", UserSchema);