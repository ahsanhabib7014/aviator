import mongoose from "mongoose";

const CrashGameSettingSchema = new mongoose.Schema(
  {
    targetProfitPercent: { type: Number, default: 20 }, // অটো প্রফিট (২০%)
    forceMultiplier: { type: Number, default: null }, // অ্যাডমিন ম্যানুয়ালি সেট করবে (যেমন: 2.5)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CrashGameSetting = 
  mongoose.models.CrashGameSetting || 
  mongoose.model("CrashGameSetting", CrashGameSettingSchema);