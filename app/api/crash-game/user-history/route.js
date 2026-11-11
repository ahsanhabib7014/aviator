// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import { CrashRound } from "@/models/CrashRound";

// export async function GET(req) {
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

//     const user = await User.findOne({
//       $or: [{ uid: identifier }, { phone: identifier }],
//     });

//     if (!user) {
//       return NextResponse.json({ success: false, message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
//     }

//     // 🆕 এখানে GameRound এর জায়গায় CrashRound বসানো হয়েছে এবং userId/phone দুটোই চেক করা হয়েছে
//     const rounds = await CrashRound.find({
//       $or: [
//         { "bets.userId": user._id },
//         { "bets.userId": user._id.toString() },
//         { "bets.phone": user.phone }
//       ],
//       status: "closed"
//     })
//     .sort({ updatedAt: -1 })
//     .limit(20)
//     .lean();

//     const history = rounds.map(round => {
//       const userBet = round.bets.find(
//         b => (b.userId && b.userId.toString() === user._id.toString()) ||
//              (b.phone && b.phone === user.phone)
//       );

//       if (!userBet) return null;

//       const cashedOutValue = userBet.cashedOutAt;
//       const isWin = cashedOutValue !== null &&
//                     cashedOutValue !== undefined &&
//                     Number(cashedOutValue) > 0;

//       const betAmount = Number(userBet.amount) || 0;
//       const multiplier = isWin ? Number(cashedOutValue) : 0;
//       const payout = isWin ? (betAmount * multiplier) : 0;
//       const lossAmount = isWin ? 0 : betAmount;

//       return {
//         roundId: round.periodNumber || "N/A",
//         betAmount: betAmount,
//         isWin: isWin,
//         multiplier: multiplier,
//         payout: payout,
//         lossAmount: lossAmount,
//         winNumber: round.winningNumber || 0
//       };
//     }).filter(Boolean);

//     return NextResponse.json({ success: true, history });
//   } catch (error) {
//     console.error("User History API Error:", error);
//     return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
//   }
// }
// ///////////////////////////////////////
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { CrashRound } from "@/models/CrashRound";

export async function GET(req) {
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

    const rounds = await CrashRound.find({
      $or: [
        { "bets.userId": user._id },
        { "bets.userId": user._id.toString() },
        { "bets.phone": user.phone },
      ],
      status: "closed",
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    // 🆕 history অ্যারেতে প্রতিটি স্লটের বেট আলাদাভাবে পুশ করা হবে
    const history = [];

    rounds.forEach((round) => {
      // 🆕 find এর বদলে filter ব্যবহার করুন (যাতে সব স্লট পাওয়া যায়)
      const userBets = round.bets.filter(
        (b) =>
          (b.userId && b.userId.toString() === user._id.toString()) ||
          (b.phone && b.phone === user.phone),
      );

      // 🆕 প্রতিটি স্লটের বেটের জন্য আলাদা এন্ট্রি তৈরি করুন
      userBets.forEach((bet) => {
        const cashedOutValue = bet.cashedOutAt;
        const isWin =
          cashedOutValue !== null &&
          cashedOutValue !== undefined &&
          Number(cashedOutValue) > 0;

        const betAmount = Number(bet.amount) || 0;
        const multiplier = isWin ? Number(cashedOutValue) : 0;
        const payout = isWin ? betAmount * multiplier : 0;
        const lossAmount = isWin ? 0 : betAmount;

        history.push({
          roundId: round.periodNumber || "N/A",
          slot: bet.slot || 1, // 🆕 স্লট নাম্বার যুক্ত করা হলো
          betAmount: betAmount,
          isWin: isWin,
          multiplier: multiplier,
          payout: payout,
          lossAmount: lossAmount,
          winNumber: round.winningNumber || 0,
        });
      });
    });

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("User History API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}