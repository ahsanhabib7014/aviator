// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import { CrashRound } from "@/models/CrashRound";

// export async function POST(req) {
//   try {
//     await dbConnect();

//     const token = req.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json({ success: false, message: "লগইন করুন" }, { status: 401 });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       return NextResponse.json({ success: false, message: "টোকেন অবৈধ" }, { status: 401 });
//     }

//     const identifier = decoded.uid || decoded.phone || decoded.userId;

//     // 🆕 _id বাদ দেওয়া হলো কারণ identifier হলো ফোন নম্বর (যা 24 অক্ষরের ObjectId নয়)
//     const user = await User.findOne({ $or: [{ uid: identifier }, { phone: identifier }] });

//     if (!user) {
//       return NextResponse.json({ success: false, message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
//     }

//     const { betAmount } = await req.json();
//     if (!betAmount || betAmount <= 0) {
//       return NextResponse.json({ success: false, message: "সঠিক পরিমাণ দিন" }, { status: 400 });
//     }

//     if (user.balance < betAmount) {
//       return NextResponse.json({ success: false, message: "পর্যাপ্ত ব্যালেন্স নেই!" }, { status: 400 });
//     }

//     if (global.crashGameState) {
//       global.crashGameState.totalBetAmount = (global.crashGameState.totalBetAmount || 0) + Number(betAmount);
//     }

//     // ব্যালেন্স কাটা
//     const updatedUser = await User.findOneAndUpdate(
//       { _id: user._id },
//       { $inc: { balance: -betAmount, turnover: -betAmount } },
//       { returnDocument: "after" }
//     );

//     // 🆕 ডাটাবেসে বাজি সেভ করা
//     try {
//       const currentRoundId = global.crashGameState?.roundId || "CRASH-TEMP";

//       let currentRound = await CrashRound.findOne({ periodNumber: currentRoundId });

//       if (!currentRound) {
//         currentRound = await CrashRound.create({
//           periodNumber: currentRoundId,
//           status: "active",
//           totalBets: 0,
//           bets: [],
//         });
//       }

//       currentRound.bets.push({
//         userId: user._id,
//         phone: user.phone || "01700000000",
//         amount: Number(betAmount),
//         cashedOutAt: null,
//       });

//       await currentRound.save();
//       console.log("✅ বেট সফলভাবে সেভ হয়েছে:", currentRoundId);

//     } catch (dbErr) {
//       console.error("❌ বেট সেভ করতে ব্যর্থ:", dbErr);
//       // বেট সেভ ফেইল করলে ব্যালেন্স ফেরত দিবে
//       await User.updateOne({ _id: user._id }, { $inc: { balance: betAmount, turnover: betAmount } });
//       return NextResponse.json({ success: false, message: "বেট সেভ করা যায়নি, আবার চেষ্টা করুন" }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, newBalance: updatedUser.balance });

//   } catch (error) {
//     console.error("Bet API Error:", error);
//     return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
//   }
// }
// ////////////////////////////////////
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { CrashRound } from "@/models/CrashRound";

export async function POST(req) {
  try {
    await dbConnect();

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

    const identifier = decoded.uid || decoded.phone || decoded.userId;

    const user = await User.findOne({
      $or: [{ uid: identifier }, { phone: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // 🆕 ১. গেমের স্টেট চেক করা (রাউন্ড চললে বেট আটকে দেওয়া)
    if (!global.crashGameState || global.crashGameState.status !== "waiting") {
      return NextResponse.json(
        {
          success: false,
          message: "রাউন্ড চলছে! বেট ধরার সময় শেষ।",
        },
        { status: 400 },
      );
    }

    // 🆕 ২. কাউন্টডাউন শেষ হয়ে গেছে কিনা চেক করা (রেস কন্ডিশন আটকাতে)
    if (Date.now() > global.crashGameState.nextRoundTime) {
      return NextResponse.json(
        {
          success: false,
          message: "বেট ধরার সময় শেষ হয়ে গেছে!",
        },
        { status: 400 },
      );
    }

    const { betAmount } = await req.json();
    if (!betAmount || betAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "সঠিক পরিমাণ দিন" },
        { status: 400 },
      );
    }

    if (user.balance < betAmount) {
      return NextResponse.json(
        { success: false, message: "পর্যাপ্ত ব্যালেন্স নেই!" },
        { status: 400 },
      );
    }

    const currentRoundId = global.crashGameState?.roundId || "CRASH-TEMP";

    // 🆕 ৩. চেক করা এই ইউজার ইতিমধ্যে এই রাউন্ডে বেট ধরেছে কিনা
    let currentRound = await CrashRound.findOne({
      periodNumber: currentRoundId,
    });

    if (currentRound) {
      const existingBet = currentRound.bets.find(
        (b) => b.userId.toString() === user._id.toString(),
      );
      if (existingBet) {
        return NextResponse.json(
          {
            success: false,
            message: "আপনি ইতিমধ্যে এই রাউন্ডে বেট ধরেছেন!",
          },
          { status: 400 },
        );
      }
    }

    // গ্লোবাল স্টেটে মোট বেট যোগ করা
    global.crashGameState.totalBetAmount =
      (global.crashGameState.totalBetAmount || 0) + Number(betAmount);

    // ব্যালেন্স কাটা
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { balance: -betAmount, turnover: -betAmount } },
      { returnDocument: "after" },
    );

    // 🆕 ডাটাবেসে বাজি সেভ করা
    try {
      if (!currentRound) {
        currentRound = await CrashRound.create({
          periodNumber: currentRoundId,
          status: "active",
          totalBets: 0,
          bets: [],
        });
      }

      currentRound.bets.push({
        userId: user._id,
        phone: user.phone || "01700000000",
        amount: Number(betAmount),
        cashedOutAt: null,
      });

      await currentRound.save();
      console.log("✅ বেট সফলভাবে সেভ হয়েছে:", currentRoundId);
    } catch (dbErr) {
      console.error("❌ বেট সেভ করতে ব্যর্থ:", dbErr);
      // বেট সেভ ফেইল করলে ব্যালেন্স ফেরত দিবে (Rollback)
      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: betAmount, turnover: betAmount } },
      );
      return NextResponse.json(
        { success: false, message: "বেট সেভ করা যায়নি, আবার চেষ্টা করুন" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.balance,
    });
  } catch (error) {
    console.error("Bet API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
