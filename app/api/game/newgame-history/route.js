import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { GameRound } from "@/models/GameRound";

export async function GET(req) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "লগইন করুন" },
        { status: 401 },
      );

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "টোকেন অবৈধ" },
        { status: 401 },
      );
    }

    const identifier = decoded.uid || decoded.phone || decoded.userId;
    const user = await User.findOne({
      $or: [{ uid: identifier }, { phone: identifier }],
    });

    if (!user)
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি" },
        { status: 404 },
      );

    const rounds = await GameRound.find({
      "bets.userId": user._id,
      status: "closed",
    })
      .sort({ resultProcessedAt: -1 })
      .limit(20)
      .lean();

    const history = rounds.map((round) => {
      // এই রাউন্ডে এই ইউজারের সব বাজি বের করা
      const userBets = round.bets.filter(
        (b) => b.userId.toString() === user._id.toString(),
      );

      let totalAmount = 0;
      let totalPayout = 0;
      let totalMultiplier = 0;
      let choices = [];
      let overallStatus = "loss";

      userBets.forEach((bet) => {
        totalAmount += bet.amount;
        if (bet.status === "win") {
          totalPayout += bet.payout;
          totalMultiplier = bet.multiplier; // যেকোনো একটার মাল্টিপ্লায়ার দেখালেই হবে
          overallStatus = "win";
        }
        choices.push(bet.selection); // চয়েসগুলো জমা করা
      });

      return {
        periodNumber: round.periodNumber || "N/A",
        // winningNumber: round.winningNumber || "N/A",
        winningNumber:
          round.winningNumber !== undefined && round.winningNumber !== null
            ? round.winningNumber
            : "N/A",
        betAmount: totalAmount,
        payout: totalPayout,
        multiplier: totalMultiplier,
        status: overallStatus,
        userChoice: choices.join(", "), // একাধিক চয়েস কমা দিয়ে দেখানো
        date: round.resultProcessedAt || round.updatedAt,
      };
    });

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
