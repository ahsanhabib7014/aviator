// import { NextResponse } from "next/server";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import Deposit from "@/models/Deposit";
// import Withdraw from "@/models/Withdraw";
// import { GameRound } from "@/models/GameRound";
// import Bet from "@/models/Bet";
// import jwt from "jsonwebtoken";
// import { GameResult } from "@/models/Game";
// export async function GET(req) {
//   try {
//     await dbConnect();

//     // 🆕 অথেনটিকেশন চেক (টোকেন থেকে)
//     const token = req.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "লগইন করুন" },
//         { status: 401 },
//       );
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       return NextResponse.json(
//         { success: false, message: "টোকেন অবৈধ" },
//         { status: 401 },
//       );
//     }

//     const authUserRole = decoded.role || "";

//     // 🆕 শুধুমাত্র অ্যাডমিন এবং এজেন্টরাই এই ডেটা দেখতে পারবে
//     if (authUserRole !== "admin" && authUserRole !== "agent") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "অননুমোদিত! শুধু অ্যাডমিন বা এজেন্ট দেখতে পারবে।",
//         },
//         { status: 403 },
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const phone = searchParams.get("phone");
//     const uid = searchParams.get("uid");

//     if (!phone && !uid) {
//       return NextResponse.json(
//         { success: false, message: "ইউজার আইডি বা ফোন দিন" },
//         { status: 400 },
//       );
//     }

//     // ১. ইউজার প্রোফাইল
//     const user = await User.findOne({
//       $or: [{ uid: uid }, { phone: phone }],
//     }).lean();

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "ইউজার পাওয়া যায়নি" },
//         { status: 404 },
//       );
//     }

//     // ২. ডিপোজিট ও উইথড্র
//     const deposits = await Deposit.find({
//       $or: [{ uid: user.uid }, { uid: user.phone }],
//     })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();
//     const withdraws = await Withdraw.find({
//       $or: [{ uid: user.uid }, { uid: user.phone }],
//     })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();

//     // // ৩. রুলেট গেমের বেট (GameRound)
//     // const recentRounds = await GameRound.find({ "bets.userId": user._id })
//     //   .sort({ createdAt: -1 })
//     //   .limit(5)
//     //   .lean();
//     // const rouletteBets = recentRounds.map((round) => {
//     //   const userBet = round.bets.find(
//     //     (b) => b.userId.toString() === user._id.toString(),
//     //   );
//     //   return {
//     //     periodNumber: round.periodNumber,
//     //     winningNumber: round.winningNumber,
//     //     betAmount: userBet?.amount || 0,
//     //     userChoice: userBet?.selection || "N/A",
//     //     status: userBet?.status || "N/A",
//     //     payout: userBet?.payout || 0,
//     //     date: round.resultProcessedAt || round.updatedAt || round.createdAt,
//     //   };
//     // });

//     // ৩. রুলেট গেমের বেট (GameRound)
//     const recentRounds = await GameRound.find({ "bets.userId": user._id })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();

//     const rouletteBets = recentRounds.map((round) => {
//       // 🆕 ওই রাউন্ডে ইউজারের সব বেট বের করা (find এর বদলে filter)
//       const userBets = round.bets.filter(
//         (b) => b.userId.toString() === user._id.toString(),
//       );

//       // 🆕 সব বেটের টাকা যোগ করা
//       const totalBetAmount = userBets.reduce(
//         (sum, b) => sum + (b.amount || 0),
//         0,
//       );

//       // 🆕 সব চয়েস একসাথে করা (কমা দিয়ে)
//       const choices = userBets.map((b) => b.selection).join(", ");

//       // 🆕 মোট পে-আউট বের করা
//       const totalPayout = userBets.reduce((sum, b) => sum + (b.payout || 0), 0);

//       // 🆕 যদি কোনো একটাতে জিতে থাকে তবে status হবে win
//       const hasWin = userBets.some((b) => b.status === "win");

//       return {
//         periodNumber: round.periodNumber,
//         winningNumber: round.winningNumber,
//         betAmount: totalBetAmount, // 👈 মোট টাকা (যেমন ৮০)
//         userChoice: choices, // 👈 সব চয়েস (যেমন: 0, 1-12, 13-24)
//         status: hasWin ? "win" : "loss", // 👈 জিতলে win, না জিতলে loss
//         payout: totalPayout, // 👈 মোট লাভ
//         date: round.resultProcessedAt || round.updatedAt || round.createdAt,
//       };
//     });
//     // ৪. বিগ-স্মল গেমের বেট (Bet + GameResult) - Optimized
//     const recentBets = await Bet.find({ userId: user._id })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();

//     // 🆕 ১. বেট থেকে সব periodNumber এর লিস্ট বানানো (PER- বাদ দিয়ে)
//     const periodNumbers = recentBets.map((bet) => {
//       const rawPeriod = bet.roundNo || bet.periodNumber || "";
//       return String(rawPeriod).replace("PER-", "");
//     });

//     // 🆕 ২. এক কুয়েরিতেই সব রেজাল্ট নিয়ে আসা (Regex এর বদলে $in ব্যবহার)
//     const gameResults = await GameResult.find({
//       periodNumber: {
//         $in: periodNumbers.map((p) => new RegExp(`^PER-?${p}$`, "i")),
//       },
//     }).lean();

//     // 🆕 ৩. রেজাল্টগুলোকে ম্যাপ করে রাখা যাতে সহজে খোঁজা যায়
//     const resultMap = {};
//     gameResults.forEach((res) => {
//       const cleanP = String(res.periodNumber).replace("PER-", "");
//       resultMap[cleanP] = res.result;
//     });

//     // 🆕 ৪. ফাইনাল ম্যাপিং
//     const bigSmallBets = recentBets.map((bet) => {
//       const rawPeriod = bet.roundNo || bet.periodNumber || "N/A";
//       const cleanPeriod = String(rawPeriod).replace("PER-", "");

//       return {
//         periodNumber: rawPeriod,
//         result: resultMap[cleanPeriod] || "N/A", // ম্যাপ থেকে রেজাল্ট নেওয়া
//         userChoice: bet.choice || "N/A",
//         betAmount: bet.amount || 0,
//         status: bet.status || "N/A",
//         payout: bet.payout || 0,
//         date: bet.createdAt,
//       };
//     });
//     return NextResponse.json({
//       success: true,
//       data: { user, deposits, withdraws, rouletteBets, bigSmallBets },
//     });
//   } catch (error) {
//     console.error("User Details API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর" },
//       { status: 500 },
//     );
//   }
// }
// ////////////////////////////////////////
import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import Deposit from "@/models/Deposit";
import Withdraw from "@/models/Withdraw";
import { GameRound } from "@/models/GameRound";
import Bet from "@/models/Bet";
import jwt from "jsonwebtoken";
import { GameResult } from "@/models/Game";
import { CrashRound } from "@/models/CrashRound";
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
      // 🆕 ওই রাউন্ডে ইউজারের সব বেট বের করা (find এর বদলে filter)
      const userBets = round.bets.filter(
        (b) => b.userId.toString() === user._id.toString(),
      );

      // 🆕 সব বেটের টাকা যোগ করা
      const totalBetAmount = userBets.reduce(
        (sum, b) => sum + (b.amount || 0),
        0,
      );

      // 🆕 সব চয়েস একসাথে করা (কমা দিয়ে)
      const choices = userBets.map((b) => b.selection).join(", ");

      // 🆕 মোট পে-আউট বের করা
      const totalPayout = userBets.reduce((sum, b) => sum + (b.payout || 0), 0);

      // 🆕 যদি কোনো একটাতে জিতে থাকে তবে status হবে win
      const hasWin = userBets.some((b) => b.status === "win");

      return {
        periodNumber: round.periodNumber,
        winningNumber: round.winningNumber,
        betAmount: totalBetAmount, // 👈 মোট টাকা (যেমন ৮০)
        userChoice: choices, // 👈 সব চয়েস (যেমন: 0, 1-12, 13-24)
        status: hasWin ? "win" : "loss", // 👈 জিতলে win, না জিতলে loss
        payout: totalPayout, // 👈 মোট লাভ
        date: round.resultProcessedAt || round.updatedAt || round.createdAt,
      };
    });
    // // ৪. বিগ-স্মল গেমের বেট (Bet + GameResult) - Optimized
    // const recentBets = await Bet.find({ userId: user._id })
    //   .sort({ createdAt: -1 })
    //   .limit(5)
    //   .lean();

    // // 🆕 ১. বেট থেকে সব periodNumber এর লিস্ট বানানো (PER- বাদ দিয়ে)
    // const periodNumbers = recentBets.map((bet) => {
    //   const rawPeriod = bet.roundNo || bet.periodNumber || "";
    //   return String(rawPeriod).replace("PER-", "");
    // });

    // // 🆕 ২. এক কুয়েরিতেই সব রেজাল্ট নিয়ে আসা (Regex এর বদলে $in ব্যবহার)
    // const gameResults = await GameResult.find({
    //   periodNumber: {
    //     $in: periodNumbers.map((p) => new RegExp(`^PER-?${p}$`, "i")),
    //   },
    // }).lean();

    // // 🆕 ৩. রেজাল্টগুলোকে ম্যাপ করে রাখা যাতে সহজে খোঁজা যায়
    // const resultMap = {};
    // gameResults.forEach((res) => {
    //   const cleanP = String(res.periodNumber).replace("PER-", "");
    //   resultMap[cleanP] = res.result;
    // });

    // // 🆕 ৪. ফাইনাল ম্যাপিং
    // const bigSmallBets = recentBets.map((bet) => {
    //   const rawPeriod = bet.roundNo || bet.periodNumber || "N/A";
    //   const cleanPeriod = String(rawPeriod).replace("PER-", "");

    //   return {
    //     periodNumber: rawPeriod,
    //     result: resultMap[cleanPeriod] || "N/A", // ম্যাপ থেকে রেজাল্ট নেওয়া
    //     userChoice: bet.choice || "N/A",
    //     betAmount: bet.amount || 0,
    //     status: bet.status || "N/A",
    //     payout: bet.payout || 0,
    //     date: bet.createdAt,
    //   };
    // });
    // ৪. বিগ-স্মল গেমের বেট (Bet + GameResult) - Optimized
    const recentBets = await Bet.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const periodNumbers = recentBets.map((bet) => {
      const rawPeriod = bet.roundNo || bet.periodNumber || "";
      return String(rawPeriod).replace("PER-", "");
    });

    const gameResults = await GameResult.find({
      periodNumber: {
        $in: periodNumbers.map((p) => new RegExp(`^PER-?${p}$`, "i")),
      },
    }).lean();

    const resultMap = {};
    gameResults.forEach((res) => {
      const cleanP = String(res.periodNumber).replace("PER-", "");
      resultMap[cleanP] = res.result;
    });

    // 🆕 ৪. ফাইনাল ম্যাপিং (এখানে আপনার সমস্যার সমাধান)
    const bigSmallBets = recentBets.map((bet) => {
      const rawPeriod = bet.roundNo || bet.periodNumber || "N/A";
      const cleanPeriod = String(rawPeriod).replace("PER-", "");

      // 🆕 স্ট্যাটাসকে ছোট হাতের অক্ষরে (win/loss) কনভার্ট করা
      const currentStatus = String(
        bet.status || bet.outcome || "",
      ).toLowerCase();

      return {
        periodNumber: rawPeriod,
        result: resultMap[cleanPeriod] || "N/A",
        userChoice: bet.choice || "N/A",
        betAmount: bet.amount || 0,
        // 🆕 ফ্রন্টএন্ডে win পাঠানো হচ্ছে
        status: currentStatus.includes("win") ? "win" : "loss",
        // 🆕 returnAmount থেকে টাকা নেওয়া হচ্ছে
        payout: bet.returnAmount || bet.payout || 0,
        date: bet.createdAt,
      };
    });
    // ৫. 🆕 Aviator (Crash) গেমের বেট হিস্ট্রি
    const aviatorRounds = await CrashRound.find({ "bets.userId": user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const aviatorBets = aviatorRounds.map((round) => {
      // ওই রাউন্ডে ইউজারের সব বেট (স্লট) খুঁজে বের করা
      const userBets = round.bets.filter(
        (b) => b.userId.toString() === user._id.toString(),
      );

      const totalBetAmount = userBets.reduce(
        (sum, b) => sum + (b.amount || 0),
        0,
      );
      const choices = userBets
        .map((b) => (b.slot ? `Slot ${b.slot}` : "N/A"))
        .join(", ");

      // যদি ক্যাশআউট করে থাকে তবে win
      const hasWin = userBets.some((b) => b.cashedOutAt !== null);
      const totalPayout = userBets.reduce(
        (sum, b) => sum + (b.cashedOutAt ? b.amount * b.cashedOutAt : 0),
        0,
      );

      return {
        periodNumber: round.periodNumber,
        winningNumber: round.winningNumber || round.crashAt || "N/A", // Aviator এ রেজাল্ট হলো মাল্টিপ্লায়ার
        betAmount: totalBetAmount,
        userChoice: choices,
        status: hasWin ? "win" : "loss",
        payout: totalPayout,
        date: round.createdAt,
      };
    });
    return NextResponse.json({
      success: true,
      data: {
        user,
        deposits,
        withdraws,
        rouletteBets,
        bigSmallBets,
        aviatorBets,
      },
    });
  } catch (error) {
    console.error("User Details API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
