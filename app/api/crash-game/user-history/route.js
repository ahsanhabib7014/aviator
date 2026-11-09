
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/db";
// import User from "@/models/User"; // 🆕 User মডেল ইমপোর্ট
// import { CrashRound } from "@/models/CrashRound"; 
// export async function GET(req) {
//   try {
//     await dbConnect();

//     // 🆕 ১. HttpOnly কুকি থেকে টোকেন চেক
//     const token = req.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json({ success: false, message: "লগইন করুন" }, { status: 401 });
//     }

//     // 🆕 ২. টোকেন ভেরিফাই (এরর হলে ক্র্যাশ হবে না)
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       return NextResponse.json({ success: false, message: "টোকেন অবৈধ" }, { status: 401 });
//     }

//     const identifier = decoded.uid || decoded.phone || decoded.userId;

//     // 🆕 ৩. ডাটাবেস থেকে ইউজার খোঁজা (uid বা phone দিয়ে)
//     const user = await User.findOne({
//       $or: [{ uid: identifier }, { phone: identifier }],
//     });
    
//     if (!user) {
//       return NextResponse.json({ success: false, message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
//     }

//     // 🆕 ৪. এই ইউজারের বাজি খোঁজা (userId দিয়ে, phone দিয়ে নয়)
//     const rounds = await GameRound.find({
//       "bets.userId": user._id, 
//       status: "closed"
//     })
//     .sort({ updatedAt: -1 })
//     .limit(20)
//     .lean();

//     const history = rounds.map(round => {
//       // ওই রাউন্ডে এই ইউজারের বাজি
//       const userBet = round.bets.find(
//         b => b.userId && b.userId.toString() === user._id.toString()
//       );

//       if (!userBet) return null;

//       // 🆕 ক্যাশআউট চেক (শুধু Number > 0 হলেই WIN)
//       const cashedOutValue = userBet.cashedOutAt;
//       const isWin = cashedOutValue !== null && 
//                     cashedOutValue !== undefined && 
//                     Number(cashedOutValue) > 0;

//       const betAmount = Number(userBet.amount) || 0;
//       const multiplier = isWin ? Number(cashedOutValue) : 0;
//       const payout = isWin ? (betAmount * multiplier) : 0;
//       const lossAmount = isWin ? 0 : betAmount; // লস অ্যামাউন্ট

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
//     console.error("History API Error:", error);
//     return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
//   }
// }
// ////////////////////////////////////////////
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
      return NextResponse.json({ success: false, message: "লগইন করুন" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, message: "টোকেন অবৈধ" }, { status: 401 });
    }

    const identifier = decoded.uid || decoded.phone || decoded.userId;

    const user = await User.findOne({
      $or: [{ uid: identifier }, { phone: identifier }],
    });
    
    if (!user) {
      return NextResponse.json({ success: false, message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    // 🆕 এখানে GameRound এর জায়গায় CrashRound বসানো হয়েছে এবং userId/phone দুটোই চেক করা হয়েছে
    const rounds = await CrashRound.find({
      $or: [
        { "bets.userId": user._id },
        { "bets.userId": user._id.toString() },
        { "bets.phone": user.phone }
      ],
      status: "closed"
    })
    .sort({ updatedAt: -1 })
    .limit(20)
    .lean();

    const history = rounds.map(round => {
      const userBet = round.bets.find(
        b => (b.userId && b.userId.toString() === user._id.toString()) || 
             (b.phone && b.phone === user.phone)
      );

      if (!userBet) return null;

      const cashedOutValue = userBet.cashedOutAt;
      const isWin = cashedOutValue !== null && 
                    cashedOutValue !== undefined && 
                    Number(cashedOutValue) > 0;

      const betAmount = Number(userBet.amount) || 0;
      const multiplier = isWin ? Number(cashedOutValue) : 0;
      const payout = isWin ? (betAmount * multiplier) : 0;
      const lossAmount = isWin ? 0 : betAmount;

      return {
        roundId: round.periodNumber || "N/A",
        betAmount: betAmount,
        isWin: isWin, 
        multiplier: multiplier,
        payout: payout,
        lossAmount: lossAmount, 
        winNumber: round.winningNumber || 0
      };
    }).filter(Boolean);

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("User History API Error:", error);
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}