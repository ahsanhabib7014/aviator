import mongoose from "mongoose";

const CrashBetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  slot: { type: Number, default: 1 },
  cashedOutAt: { type: Number, default: null },
});

const CrashRoundSchema = new mongoose.Schema(
  {
    periodNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["waiting", "active", "closed"],
      default: "waiting",
    },
    winningNumber: { type: Number, default: null },
    totalBets: { type: Number, default: 0 },
    bets: [CrashBetSchema],
  },
  { timestamps: true },
);

if (mongoose.models.CrashRound) {
  delete mongoose.models.CrashRound;
}
export const CrashRound = mongoose.model("CrashRound", CrashRoundSchema);
