// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import { CrashRound } from "@/models/CrashRound"; // 🆕 CrashRound

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

//     // 🆕 _id বাদ দেওয়া হলো
//     const user = await User.findOne({ $or: [{ uid: identifier }, { phone: identifier }] });

//     if (!user) {
//       return NextResponse.json({ success: false, message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
//     }

//     const { betAmount, multiplier } = await req.json();
//     if (!betAmount || !multiplier) {
//       return NextResponse.json({ success: false, message: "সঠিক ডাটা দিন" }, { status: 400 });
//     }

//     const currentRoundId = global.crashGameState?.roundId || "CRASH-TEMP";

//     // 🆕 ডাটাবেসে ক্যাশআউট আপডেট করা
//     const currentRound = await CrashRound.findOne({ periodNumber: currentRoundId });

//     if (!currentRound) {
//       return NextResponse.json({ success: false, message: "রাউন্ড পাওয়া যায়নি" }, { status: 404 });
//     }

//     // 🆕 ওই ইউজারের বেট খুঁজে বের করা
//     const userBet = currentRound.bets.find(
//       (b) => b.userId.toString() === user._id.toString() && b.cashedOutAt === null
//     );

//     if (!userBet) {
//       return NextResponse.json({ success: false, message: "ক্যাশআউট করার মত কোনো বেট নেই!" }, { status: 400 });
//     }

//     // 🆕 ক্যাশআউট আপডেট
//     userBet.cashedOutAt = Number(multiplier);
//     await currentRound.save();

//     // 🆕 ইউজারের ব্যালেন্স বাড়ানো
//     const winAmount = Number((Number(betAmount) * Number(multiplier)).toFixed(2));
//     const updatedUser = await User.findOneAndUpdate(
//       { _id: user._id },
//       { $inc: { balance: winAmount } },
//       { returnDocument: "after" }
//     );

//     return NextResponse.json({
//       success: true,
//       message: "ক্যাশআউট সফল হয়েছে!",
//       newBalance: updatedUser.balance
//     });

//   } catch (error) {
//     console.error("Cashout API Error:", error);
//     return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
//   }
// }
// //////////////////////////////////////
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

    const { betAmount, multiplier } = await req.json();
    if (!betAmount || !multiplier) {
      return NextResponse.json(
        { success: false, message: "সঠিক ডাটা দিন" },
        { status: 400 },
      );
    }

    const currentRoundId = global.crashGameState?.roundId || "CRASH-TEMP";

    const currentRound = await CrashRound.findOne({
      periodNumber: currentRoundId,
    });

    if (!currentRound) {
      return NextResponse.json(
        { success: false, message: "রাউন্ড পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    const userBet = currentRound.bets.find(
      (b) =>
        b.userId.toString() === user._id.toString() && b.cashedOutAt === null,
    );

    if (!userBet) {
      return NextResponse.json(
        { success: false, message: "ক্যাশআউট করার মত কোনো বেট নেই!" },
        { status: 400 },
      );
    }

    // 🆕 ক্যাশআউট আপডেট
    userBet.cashedOutAt = Number(multiplier);
    await currentRound.save();

    // 🆕 ইউজারের ব্যালেন্স বাড়ানো (রাউন্ড করা)
    const winAmount = Number(
      (Number(betAmount) * Number(multiplier)).toFixed(2),
    );

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { balance: winAmount } },
      { returnDocument: "after" },
    );

    // 🆕 রেসপন্সে রাউন্ড করা ব্যালেন্স পাঠানো
    const newBalance = Number(updatedUser.balance.toFixed(2));

    return NextResponse.json({
      success: true,
      message: "ক্যাশআউট সফল হয়েছে!",
      newBalance: newBalance,
    });
  } catch (error) {
    console.error("Cashout API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
