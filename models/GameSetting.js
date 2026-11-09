import mongoose from "mongoose";

const GameSettingSchema = new mongoose.Schema(
  {
    // ❌ maxMultiplier সরিয়ে দেওয়া হলো (নতুন গেমে এর দরকার নেই)

    targetProfitPercent: { type: Number, default: 0 }, // 🆕 ডিফল্ট ০ (সিস্টেম নিজে হিসেব করবে)
    forceMultiplier: { type: Number, default: null },
    isActive: { type: Boolean, default: true },

    // গুণকসমূহ (Multipliers)
    singleNumberMultiplier: { type: Number, default: 20 }, // সিঙ্গেল নাম্বারে কত গুণ
    oddEvenMultiplier: { type: Number, default: 2 }, // Odd/Even-এ কত গুণ
    dozenMultiplier: { type: Number, default: 3 },
    redBlackMultiplier: { type: Number, default: 2 }, // দাগে (১-১২, ১৩-২৪) কত গুণ
      // 🆕 নতুন বাজির মাল্টিপ্লায়ার (১-১৮, ১৯-৩৬ এবং ২:১)
    lowHighMultiplier: { type: Number, default: 2 },
    columnMultiplier: { type: Number, default: 2 },
  },

  { timestamps: true },
);

export const GameSetting =
  mongoose.models.GameSetting ||
  mongoose.model("GameSetting", GameSettingSchema);
