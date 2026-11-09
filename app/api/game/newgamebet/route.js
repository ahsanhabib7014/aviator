// import { NextResponse } from "next/server";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import { GameRound } from "@/models/GameRound";
// import { GameSetting } from "@/models/GameSetting";
// import jwt from "jsonwebtoken";

// export async function POST(req) {
//   try {
//     await dbConnect();

//     // ১. ইউজার অথেনটিকেশন
//     const token = req.cookies.get("token")?.value;
//     if (!token)
//       return NextResponse.json(
//         { success: false, message: "লগইন করুন" },
//         { status: 401 },
//       );

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       return NextResponse.json(
//         { success: false, message: "টোকেন অবৈধ" },
//         { status: 401 },
//       );
//     }
//     const identifier = decoded.uid || decoded.phone || decoded.userId;

//     const { bets, periodNumber } = await req.json();

//     // ২. ভ্যালিডেশন
//     if (!bets || bets.length === 0 || !periodNumber) {
//       return NextResponse.json(
//         { success: false, message: "ভুল ডেটা!" },
//         { status: 400 },
//       );
//     }

//     // ==========================================
//     // 🆕 চালাকি আটকানোর ভ্যালিডেশন
//     // ==========================================
//     const hasOdd = bets.some((b) => b.type === "odd");
//     const hasEven = bets.some((b) => b.type === "even");
//     if (hasOdd && hasEven) {
//       return NextResponse.json(
//         { success: false, message: "Odd এবং Even একসাথে বাজি ধরা যাবে না!" },
//         { status: 400 },
//       );
//     }

//     const hasRed = bets.some((b) => b.type === "red");
//     const hasBlack = bets.some((b) => b.type === "black");
//     if (hasRed && hasBlack) {
//       return NextResponse.json(
//         { success: false, message: "Red এবং Black একসাথে বাজি ধরা যাবে না!" },
//         { status: 400 },
//       );
//     }

//     const dozenCount = bets.filter((b) =>
//       ["1-12", "13-24", "25-36"].includes(b.type),
//     ).length;
//     // 🆕 সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে (৩টি পারবে না)
//     if (dozenCount > 2) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
//         },
//         { status: 400 },
//       );
//     }
//     // ==========================================

//     const totalAmount = bets.reduce((sum, b) => sum + Number(b.amount), 0);
//     if (totalAmount <= 0) {
//       return NextResponse.json(
//         { success: false, message: "সঠিক পরিমাণ লিখুন!" },
//         { status: 400 },
//       );
//     }

//     // ৩. গেম সেটিংস চেক
//     let settings = await GameSetting.findOne({});
//     if (!settings) settings = await GameSetting.create({});
//     if (!settings.isActive) {
//       return NextResponse.json(
//         { success: false, message: "গেম বর্তমানে বন্ধ আছে" },
//         { status: 400 },
//       );
//     }

//     // ৪. ইউজারের ব্যালেন্স কাটা
//     const user = await User.findOneAndUpdate(
//       {
//         $or: [{ uid: identifier }, { phone: identifier }],
//         balance: { $gte: totalAmount },
//         isBlocked: false,
//       },
//       {
//         $inc: {
//           balance: -totalAmount,
//           turnover: -totalAmount,
//           weeklyTurnover: totalAmount,
//           monthlyTurnover: totalAmount,
//         },
//       },
//       { new: true },
//     );

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "পর্যাপ্ত ব্যালেন্স নেই বা অ্যাকাউন্ট ব্লকড!",
//         },
//         { status: 400 },
//       );
//     }

//     // ৫. রাউন্ড খোঁজা বা তৈরি করা
//     let currentRound = await GameRound.findOne({
//       periodNumber,
//       status: "active",
//     });
//     if (!currentRound) {
//       const newEndTime = new Date(Date.now() + 60000);
//       currentRound = await GameRound.create({
//         periodNumber,
//         status: "active",
//         totalBets: 0,
//         endTime: newEndTime,
//         winningNumber: null,
//       });
//     }

//     // ৬. ডাবল বেট চেক (একই রাউন্ডে একাধিকবার)
//     const alreadyBet = currentRound.bets.find(
//       (b) => b.userId.toString() === user._id.toString(),
//     );
//     if (alreadyBet) {
//       // 🆕 এখানে turnover: totalAmount (প্লাস) করা হলো, যাতে রিফান্ড ঠিকমতো হয়
//       await User.updateOne(
//         { _id: user._id },
//         {
//           $inc: {
//             balance: totalAmount,
//             turnover: totalAmount, // ✅ ঠিক করা হয়েছে
//             weeklyTurnover: -totalAmount,
//             monthlyTurnover: -totalAmount,
//           },
//         },
//       );
//       return NextResponse.json(
//         { success: false, message: "এই রাউন্ডে ইতিমধ্যে বাজি ধরেছেন!" },
//         { status: 400 },
//       );
//     }

//     // ৭. একাধিক বাজি সেভ করা
//     bets.forEach((bet) => {
//       currentRound.bets.push({
//         userId: user._id,
//         phone: user.phone,
//         betType: bet.type,
//         selection: bet.selection,
//         amount: Number(bet.amount),
//         status: "pending",
//       });
//     });

//     currentRound.totalBets += totalAmount;
//     await currentRound.save();

//     return NextResponse.json(
//       {
//         success: true,
//         message: `৳${totalAmount} বাজি সফলভাবে প্লেস হয়েছে!`,
//         newBalance: user.balance,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Bet API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর" },
//       { status: 500 },
//     );
//   }
// }
// ////////////////////////////////////////////////
import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { GameRound } from "@/models/GameRound";
import { GameSetting } from "@/models/GameSetting";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await dbConnect();

    // ১. ইউজার অথেনটিকেশন
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

    const { bets, periodNumber } = await req.json();

    // ২. ভ্যালিডেশন
    if (!bets || bets.length === 0 || !periodNumber) {
      return NextResponse.json(
        { success: false, message: "ভুল ডেটা!" },
        { status: 400 },
      );
    }

    // ==========================================
    // 🆕 চালাকি আটকানোর ভ্যালিডেশন
    // ==========================================
    
    // ১. Odd এবং Even একসাথে নয়
    const hasOdd = bets.some((b) => b.type === "odd");
    const hasEven = bets.some((b) => b.type === "even");
    if (hasOdd && hasEven) {
      return NextResponse.json(
        { success: false, message: "Odd এবং Even একসাথে বাজি ধরা যাবে না!" },
        { status: 400 },
      );
    }

    // ২. Red এবং Black একসাথে নয়
    const hasRed = bets.some((b) => b.type === "red");
    const hasBlack = bets.some((b) => b.type === "black");
    if (hasRed && hasBlack) {
      return NextResponse.json(
        { success: false, message: "Red এবং Black একসাথে বাজি ধরা যাবে না!" },
        { status: 400 },
      );
    }

    // ৩. 🆕 ১-১৮ এবং ১৯-৩৬ একসাথে নয়
    const has1_18 = bets.some((b) => b.type === "1-18");
    const has19_36 = bets.some((b) => b.type === "19-36");
    if (has1_18 && has19_36) {
      return NextResponse.json(
        { success: false, message: "1-18 এবং 19-36 একসাথে বাজি ধরা যাবে না!" },
        { status: 400 },
      );
    }

    // ৪. সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে (৩টি পারবে না)
    const dozenCount = bets.filter((b) =>
      ["1-12", "13-24", "25-36"].includes(b.type),
    ).length;
    if (dozenCount > 2) {
      return NextResponse.json(
        {
          success: false,
          message: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
        },
        { status: 400 },
      );
    }

    // ৫. 🆕 সর্বোচ্চ ২টি 2:1 (col_1, col_2, col_3) বাজি ধরা যাবে (৩টি পারবে না)
    const colCount = bets.filter((b) =>
      ["col_1", "col_2", "col_3"].includes(b.type),
    ).length;
    if (colCount > 2) {
      return NextResponse.json(
        {
          success: false,
          message: "একসাথে সর্বোচ্চ ২টি 2:1 কলাম বাজি ধরা যাবে!",
        },
        { status: 400 },
      );
    }
      // ০ সহ ৩৭ ও ১ থেকে ৩৬ চেক (লিমিট ৩০)
    const numberBets = bets.filter((b) => b.type === "number");

    // সর্বোচ্চ ৩০টি ঘরে বাজি ধরা যাবে
    if (numberBets.length > 30) {
      return NextResponse.json(
        { success: false, message: "একসাথে সর্বোচ্চ ৩০টি ঘরে বাজি ধরা যাবে!" },
        { status: 400 },
      );
    }
    // ==========================================

    const totalAmount = bets.reduce((sum, b) => sum + Number(b.amount), 0);
    if (totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "সঠিক পরিমাণ লিখুন!" },
        { status: 400 },
      );
    }

    // ৩. গেম সেটিংস চেক
    let settings = await GameSetting.findOne({});
    if (!settings) settings = await GameSetting.create({});
    if (!settings.isActive) {
      return NextResponse.json(
        { success: false, message: "গেম বর্তমানে বন্ধ আছে" },
        { status: 400 },
      );
    }

    // ৪. ইউজারের ব্যালেন্স কাটা
    const user = await User.findOneAndUpdate(
      {
        $or: [{ uid: identifier }, { phone: identifier }],
        balance: { $gte: totalAmount },
        isBlocked: false,
      },
      {
        $inc: {
          balance: -totalAmount,
          turnover: -totalAmount,
          weeklyTurnover: totalAmount,
          monthlyTurnover: totalAmount,
        },
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "পর্যাপ্ত ব্যালেন্স নেই বা অ্যাকাউন্ট ব্লকড!",
        },
        { status: 400 },
      );
    }

    // ৫. রাউন্ড খোঁজা বা তৈরি করা
    let currentRound = await GameRound.findOne({
      periodNumber,
      status: "active",
    });
    if (!currentRound) {
      const newEndTime = new Date(Date.now() + 60000);
      currentRound = await GameRound.create({
        periodNumber,
        status: "active",
        totalBets: 0,
        endTime: newEndTime,
        winningNumber: null,
      });
    }

    // ৬. ডাবল বেট চেক (একই রাউন্ডে একাধিকবার)
    const alreadyBet = currentRound.bets.find(
      (b) => b.userId.toString() === user._id.toString(),
    );
    if (alreadyBet) {
      await User.updateOne(
        { _id: user._id },
        {
          $inc: {
            balance: totalAmount,
            turnover: totalAmount,
            weeklyTurnover: -totalAmount,
            monthlyTurnover: -totalAmount,
          },
        },
      );
      return NextResponse.json(
        { success: false, message: "এই রাউন্ডে ইতিমধ্যে বাজি ধরেছেন!" },
        { status: 400 },
      );
    }

    // ৭. একাধিক বাজি সেভ করা
    bets.forEach((bet) => {
      currentRound.bets.push({
        userId: user._id,
        phone: user.phone,
        betType: bet.type,
        selection: bet.selection,
        amount: Number(bet.amount),
        status: "pending",
      });
    });

    currentRound.totalBets += totalAmount;
    await currentRound.save();

    return NextResponse.json(
      {
        success: true,
        message: `৳${totalAmount} বাজি সফলভাবে প্লেস হয়েছে!`,
        newBalance: user.balance,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bet API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}