import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import Deposit from "@/models/Deposit";
import Withdraw from "@/models/Withdraw";
import { GameRound } from "@/models/GameRound";
import Bet from "@/models/Bet";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await dbConnect();

    // 🆕 অথেনটিকেশন চেক (টোকেন থেকে)
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "লগইন করুন" },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "টোকেন অবৈধ" },
        { status: 401 },
      );
    }

    const authUserRole = decoded.role || "";

    // 🆕 শুধুমাত্র অ্যাডমিন এবং এজেন্টরাই এই ডেটা দেখতে পারবে
    if (authUserRole !== "admin" && authUserRole !== "agent") {
      return NextResponse.json(
        {
          success: false,
          message: "অননুমোদিত! শুধু অ্যাডমিন বা এজেন্ট দেখতে পারবে।",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const uid = searchParams.get("uid");

    if (!phone && !uid) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি বা ফোন দিন" },
        { status: 400 },
      );
    }

    // ১. ইউজার প্রোফাইল
    const user = await User.findOne({
      $or: [{ uid: uid }, { phone: phone }],
    }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২. ডিপোজিট ও উইথড্র
    const deposits = await Deposit.find({
      $or: [{ uid: user.uid }, { uid: user.phone }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const withdraws = await Withdraw.find({
      $or: [{ uid: user.uid }, { uid: user.phone }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ৩. রুলেট গেমের বেট (GameRound)
    const recentRounds = await GameRound.find({ "bets.userId": user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const rouletteBets = recentRounds.map((round) => {
      const userBet = round.bets.find(
        (b) => b.userId.toString() === user._id.toString(),
      );
      return {
        periodNumber: round.periodNumber,
        winningNumber: round.winningNumber,
        betAmount: userBet?.amount || 0,
        userChoice: userBet?.selection || "N/A",
        status: userBet?.status || "N/A",
        payout: userBet?.payout || 0,
        date: round.resultProcessedAt || round.updatedAt || round.createdAt,
      };
    });

    // ৪. বিগ-স্মল গেমের বেট (Bet)
    const recentBets = await Bet.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const bigSmallBets = recentBets.map((bet) => ({
      periodNumber: bet.roundNo || bet.periodNumber || "N/A",
      result: bet.result || "N/A",
      userChoice: bet.choice || "N/A",
      betAmount: bet.amount || 0,
      status: bet.status || "N/A",
      payout: bet.payout || 0,
      date: bet.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: { user, deposits, withdraws, rouletteBets, bigSmallBets },
    });
  } catch (error) {
    console.error("User Details API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
