
import mongoose from "mongoose";

const BetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone: { type: String, required: true },
  // 🆕 red, black যোগ করা হলো
  betType: {
    type: String,
    enum: [  "number", 
      "odd", 
      "even", 
      "red", 
      "black", 
      "1-12", 
      "13-24", 
      "25-36",
      "1-18",     // 🆕
      "19-36",    // 🆕
      "col_1",    // 🆕
      "col_2",    // 🆕
      "col_3"  ],
    required: true,
  },
  selection: { type: String, required: true }, // "0", "red", "black", "5", "odd", "1-12"
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "win", "loss"],
    default: "pending",
  },
  multiplier: { type: Number, default: 0 },
  payout: { type: Number, default: 0 },
});

const GameRoundSchema = new mongoose.Schema(
  {
    periodNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    endTime: { type: Date, default: null }, // 🆕 required সরানো হলো
    winningNumber: { type: Number, default: null },
    totalBets: { type: Number, default: 0 },
    bets: [BetSchema],
    resultProcessedAt: { type: Date },
  },
  { timestamps: true },
);

// 🆕 সার্ভার রিস্টার্টের পর নতুন স্কিমা লোড হবে
if (mongoose.models.GameRound) {
  delete mongoose.models.GameRound;
}
export const GameRound = mongoose.model("GameRound", GameRoundSchema);
