// // // // // // // import { NextResponse } from "next/server";
// // // // // // // import jwt from "jsonwebtoken";
// // // // // // // import dbConnect from "@/utils/db";
// // // // // // // import { GameRound } from "@/models/GameRound";
// // // // // // // import { GameSetting } from "@/models/GameSetting";
// // // // // // // import User from "@/models/User";

// // // // // // // // 🆕 রুলেটের লাল নাম্বারগুলো
// // // // // // // const RED_NUMBERS = [
// // // // // // //   1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // // // // // // ];

// // // // // // // export async function GET(req) {
// // // // // // //   try {
// // // // // // //     await dbConnect();

// // // // // // //     let currentRound = await GameRound.findOne({ status: "active" }).sort({
// // // // // // //       createdAt: -1,
// // // // // // //     });
// // // // // // //     const now = new Date();

// // // // // // //     // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
// // // // // // //     if (
// // // // // // //       currentRound &&
// // // // // // //       currentRound.endTime &&
// // // // // // //       now > new Date(currentRound.endTime)
// // // // // // //     ) {
// // // // // // //       console.log("⏰ Round time over, processing smart result for 0-36...");

// // // // // // //       const settings = (await GameSetting.findOne({})) || {
// // // // // // //         targetProfitPercent: 20,
// // // // // // //         forceMultiplier: null,
// // // // // // //         singleNumberMultiplier: 36,
// // // // // // //         oddEvenMultiplier: 2,
// // // // // // //         dozenMultiplier: 3,
// // // // // // //         redBlackMultiplier: 2,
// // // // // // //       };

// // // // // // //       const totalCollection = currentRound.totalBets;
// // // // // // //       let winningNumber = null;

// // // // // // //       // 🧠 স্মার্ট অ্যালগরিদম
// // // // // // //       if (
// // // // // // //         settings.forceMultiplier !== null &&
// // // // // // //         settings.forceMultiplier >= 0 &&
// // // // // // //         settings.forceMultiplier <= 36
// // // // // // //       ) {
// // // // // // //         // অ্যাডমিন যদি ফোর্স করে (০-৩৬ এর মধ্যে)
// // // // // // //         winningNumber = settings.forceMultiplier;

// // // // // // //         // 🆕 ফোর্স রেজাল্ট ব্যবহারের পর সেটি রিসেট করা হলো
// // // // // // //         await GameSetting.updateOne(
// // // // // // //           { _id: settings._id },
// // // // // // //           { $set: { forceMultiplier: null } },
// // // // // // //         );
// // // // // // //       } else {
// // // // // // //         const MULTIPLIERS = {
// // // // // // //           single: settings.singleNumberMultiplier || 36,
// // // // // // //           oddEven: settings.oddEvenMultiplier || 2,
// // // // // // //           dozen: settings.dozenMultiplier || 3,
// // // // // // //           redBlack: settings.redBlackMultiplier || 2,
// // // // // // //         };

// // // // // // //         // 🆕 যদি টার্গেট প্রফিট সেট করা থাকে
// // // // // // //         if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
// // // // // // //           const targetProfit =
// // // // // // //             totalCollection * (settings.targetProfitPercent / 100);
// // // // // // //           const maxPayoutAllowed = totalCollection - targetProfit;
// // // // // // //           let validNumbers = [];

// // // // // // //           // ০ থেকে ৩৬ পর্যন্ত চেক
// // // // // // //           for (let num = 0; num <= 36; num++) {
// // // // // // //             let payoutIfThisWins = 0;
// // // // // // //             const isRed = RED_NUMBERS.includes(num);
// // // // // // //             const isBlack = num !== 0 && !isRed;

// // // // // // //             currentRound.bets.forEach((bet) => {
// // // // // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // // // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // // //               if (bet.betType === "red" && isRed)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // // //               if (bet.betType === "black" && isBlack)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // // //             });

// // // // // // //             if (payoutIfThisWins <= maxPayoutAllowed) {
// // // // // // //               validNumbers.push(num);
// // // // // // //             }
// // // // // // //           }

// // // // // // //           if (validNumbers.length === 0) {
// // // // // // //             winningNumber = Math.floor(Math.random() * 37);
// // // // // // //           } else {
// // // // // // //             winningNumber =
// // // // // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // // // // //           }
// // // // // // //         }
// // // // // // //         // 🆕 যদি টার্গেট প্রফিট খালি থাকে (সিস্টেম নিজেই সর্বোচ্চ লাভ বেছে নেবে)
// // // // // // //         else {
// // // // // // //           let bestPayout = Infinity;
// // // // // // //           let validNumbers = [];

// // // // // // //           for (let num = 0; num <= 36; num++) {
// // // // // // //             let payoutIfThisWins = 0;
// // // // // // //             const isRed = RED_NUMBERS.includes(num);
// // // // // // //             const isBlack = num !== 0 && !isRed;

// // // // // // //             currentRound.bets.forEach((bet) => {
// // // // // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // // // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // // //               if (bet.betType === "red" && isRed)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // // //               if (bet.betType === "black" && isBlack)
// // // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // // //             });

// // // // // // //             if (payoutIfThisWins < bestPayout) {
// // // // // // //               bestPayout = payoutIfThisWins;
// // // // // // //               validNumbers = [num];
// // // // // // //             } else if (payoutIfThisWins === bestPayout) {
// // // // // // //               validNumbers.push(num);
// // // // // // //             }
// // // // // // //           }

// // // // // // //           if (totalCollection === 0 || validNumbers.length === 0) {
// // // // // // //             winningNumber = Math.floor(Math.random() * 37);
// // // // // // //           } else {
// // // // // // //             winningNumber =
// // // // // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // // // // //           }
// // // // // // //         }
// // // // // // //       }

// // // // // // //       // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
// // // // // // //       currentRound.winningNumber = winningNumber;
// // // // // // //       currentRound.status = "closed";
// // // // // // //       currentRound.resultProcessedAt = new Date();

// // // // // // //       const isRedWin = RED_NUMBERS.includes(winningNumber);
// // // // // // //       const isBlackWin = winningNumber !== 0 && !isRedWin;

// // // // // // //       for (let i = 0; i < currentRound.bets.length; i++) {
// // // // // // //         let bet = currentRound.bets[i];
// // // // // // //         let isWin = false;
// // // // // // //         let multiplier = 0;

// // // // // // //         if (
// // // // // // //           bet.betType === "number" &&
// // // // // // //           bet.selection === String(winningNumber)
// // // // // // //         ) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.singleNumberMultiplier || 36;
// // // // // // //         } else if (
// // // // // // //           bet.betType === "odd" &&
// // // // // // //           winningNumber !== 0 &&
// // // // // // //           winningNumber % 2 !== 0
// // // // // // //         ) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // // // // //         } else if (
// // // // // // //           bet.betType === "even" &&
// // // // // // //           winningNumber !== 0 &&
// // // // // // //           winningNumber % 2 === 0
// // // // // // //         ) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // // // // //         } else if (
// // // // // // //           bet.betType === "1-12" &&
// // // // // // //           winningNumber >= 1 &&
// // // // // // //           winningNumber <= 12
// // // // // // //         ) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // // // //         } else if (
// // // // // // //           bet.betType === "13-24" &&
// // // // // // //           winningNumber >= 13 &&
// // // // // // //           winningNumber <= 24
// // // // // // //         ) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // // // //         } else if (
// // // // // // //           bet.betType === "25-36" &&
// // // // // // //           winningNumber >= 25 &&
// // // // // // //           winningNumber <= 36
// // // // // // //         ) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // // // //         } else if (bet.betType === "red" && isRedWin) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.redBlackMultiplier || 2;
// // // // // // //         } else if (bet.betType === "black" && isBlackWin) {
// // // // // // //           isWin = true;
// // // // // // //           multiplier = settings.redBlackMultiplier || 2;
// // // // // // //         }

// // // // // // //         if (isWin) {
// // // // // // //           const winAmount = bet.amount * multiplier;
// // // // // // //           bet.status = "win";
// // // // // // //           bet.multiplier = multiplier;
// // // // // // //           bet.payout = winAmount;
// // // // // // //           await User.updateOne(
// // // // // // //             { _id: bet.userId },
// // // // // // //             { $inc: { balance: winAmount } },
// // // // // // //           );
// // // // // // //         } else {
// // // // // // //           bet.status = "loss";
// // // // // // //           bet.payout = 0;
// // // // // // //         }
// // // // // // //       }
// // // // // // //       await currentRound.save();

// // // // // // //       // ৪. নতুন রাউন্ড শুরু করা
// // // // // // //       const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
// // // // // // //       const newEndTime = new Date(now.getTime() + 60000);

// // // // // // //       currentRound = await GameRound.create({
// // // // // // //         periodNumber: nextPeriodNumber,
// // // // // // //         status: "active",
// // // // // // //         endTime: newEndTime,
// // // // // // //         totalBets: 0,
// // // // // // //         bets: [],
// // // // // // //       });
// // // // // // //       console.log(
// // // // // // //         `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
// // // // // // //       );
// // // // // // //     }

// // // // // // //     // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে
// // // // // // //     else if (!currentRound || !currentRound.endTime) {
// // // // // // //       const newEndTime = new Date(now.getTime() + 60000);

// // // // // // //       if (currentRound) {
// // // // // // //         currentRound.endTime = newEndTime;
// // // // // // //         await currentRound.save();
// // // // // // //       } else {
// // // // // // //         currentRound = await GameRound.create({
// // // // // // //           periodNumber: "PER-10001",
// // // // // // //           status: "active",
// // // // // // //           endTime: newEndTime,
// // // // // // //           totalBets: 0,
// // // // // // //           bets: [],
// // // // // // //         });
// // // // // // //       }
// // // // // // //     }

// // // // // // //     // 🆕 টাইমার ক্যালকুলেশন
// // // // // // //     const end = new Date(currentRound.endTime).getTime();
// // // // // // //     const current = new Date().getTime();
// // // // // // //     const diff = Math.max(0, Math.floor((end - current) / 1000));

// // // // // // //     // ==========================================
// // // // // // //     // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা (উইন পপআপ দেখানোর জন্য)
// // // // // // //     // ==========================================
// // // // // // //     let userResult = null;
// // // // // // //     const token = req.cookies.get("token")?.value;

// // // // // // //     if (token) {
// // // // // // //       try {
// // // // // // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // //         const identifier = decoded.uid || decoded.phone || decoded.userId;

// // // // // // //         const userDoc = await User.findOne({
// // // // // // //           $or: [{ uid: identifier }, { phone: identifier }],
// // // // // // //         });

// // // // // // //         if (userDoc) {
// // // // // // //           const lastRound = await GameRound.findOne({ status: "closed" }).sort({
// // // // // // //             resultProcessedAt: -1,
// // // // // // //           });

// // // // // // //           if (lastRound) {
// // // // // // //             const userBet = lastRound.bets.find(
// // // // // // //               (b) => b.userId.toString() === userDoc._id.toString(),
// // // // // // //             );

// // // // // // //             if (userBet) {
// // // // // // //               userResult = {
// // // // // // //                 status: userBet.status,
// // // // // // //                 multiplier: userBet.multiplier,
// // // // // // //                 payout: userBet.payout,
// // // // // // //                 round: lastRound.periodNumber,
// // // // // // //                 winningNumber: lastRound.winningNumber,
// // // // // // //               };
// // // // // // //             }
// // // // // // //           }
// // // // // // //         }
// // // // // // //       } catch (err) {
// // // // // // //         console.error("User result fetch error:", err);
// // // // // // //       }
// // // // // // //     }

// // // // // // //     return NextResponse.json({
// // // // // // //       success: true,
// // // // // // //       periodNumber: currentRound.periodNumber,
// // // // // // //       endTime: currentRound.endTime,
// // // // // // //       timeLeft: diff,
// // // // // // //       userResult: userResult,
// // // // // // //     });
// // // // // // //   } catch (error) {
// // // // // // //     console.error("❌ State API Error:", error);
// // // // // // //     return NextResponse.json(
// // // // // // //       { success: false, message: error.message },
// // // // // // //       { status: 500 },
// // // // // // //     );
// // // // // // //   }
// // // // // // // }
// // // // // // // /////////////////////////////////////////
// // // // // // import { NextResponse } from "next/server";
// // // // // // import jwt from "jsonwebtoken";
// // // // // // import dbConnect from "@/utils/db";
// // // // // // import { GameRound } from "@/models/GameRound";
// // // // // // import { GameSetting } from "@/models/GameSetting";
// // // // // // import User from "@/models/User";

// // // // // // // রুলেটের লাল নাম্বারগুলো
// // // // // // const RED_NUMBERS = [
// // // // // //   1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // // // // // ];

// // // // // // export async function GET(req) {
// // // // // //   try {
// // // // // //     await dbConnect();

// // // // // //     let currentRound = await GameRound.findOne({ status: "active" }).sort({
// // // // // //       createdAt: -1,
// // // // // //     });
// // // // // //     const now = new Date();

// // // // // //     // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
// // // // // //     if (
// // // // // //       currentRound &&
// // // // // //       currentRound.endTime &&
// // // // // //       now > new Date(currentRound.endTime)
// // // // // //     ) {
// // // // // //       console.log("⏰ Round time over, processing smart result for 0-36...");

// // // // // //       const settings = (await GameSetting.findOne({})) || {
// // // // // //         targetProfitPercent: 20,
// // // // // //         forceMultiplier: null,
// // // // // //         singleNumberMultiplier: 36,
// // // // // //         oddEvenMultiplier: 2,
// // // // // //         dozenMultiplier: 3,
// // // // // //         redBlackMultiplier: 2,
// // // // // //       };

// // // // // //       const totalCollection = currentRound.totalBets;
// // // // // //       let winningNumber = null;

// // // // // //       // 🧠 স্মার্ট অ্যালগরিদম
// // // // // //       if (
// // // // // //         settings.forceMultiplier !== null &&
// // // // // //         settings.forceMultiplier >= 0 &&
// // // // // //         settings.forceMultiplier <= 36
// // // // // //       ) {
// // // // // //         winningNumber = settings.forceMultiplier;
// // // // // //         await GameSetting.updateOne(
// // // // // //           { _id: settings._id },
// // // // // //           { $set: { forceMultiplier: null } },
// // // // // //         );
// // // // // //       } else {
// // // // // //         const MULTIPLIERS = {
// // // // // //           single: settings.singleNumberMultiplier || 36,
// // // // // //           oddEven: settings.oddEvenMultiplier || 2,
// // // // // //           dozen: settings.dozenMultiplier || 3,
// // // // // //           redBlack: settings.redBlackMultiplier || 2,
// // // // // //         };

// // // // // //         if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
// // // // // //           const targetProfit =
// // // // // //             totalCollection * (settings.targetProfitPercent / 100);
// // // // // //           const maxPayoutAllowed = totalCollection - targetProfit;
// // // // // //           let validNumbers = [];

// // // // // //           for (let num = 0; num <= 36; num++) {
// // // // // //             let payoutIfThisWins = 0;
// // // // // //             const isRed = RED_NUMBERS.includes(num);
// // // // // //             const isBlack = num !== 0 && !isRed;

// // // // // //             currentRound.bets.forEach((bet) => {
// // // // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // //               if (bet.betType === "red" && isRed)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // //               if (bet.betType === "black" && isBlack)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // //             });

// // // // // //             if (payoutIfThisWins <= maxPayoutAllowed) {
// // // // // //               validNumbers.push(num);
// // // // // //             }
// // // // // //           }

// // // // // //           if (validNumbers.length === 0) {
// // // // // //             winningNumber = Math.floor(Math.random() * 37);
// // // // // //           } else {
// // // // // //             winningNumber =
// // // // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // // // //           }
// // // // // //         } else {
// // // // // //           let bestPayout = Infinity;
// // // // // //           let validNumbers = [];

// // // // // //           for (let num = 0; num <= 36; num++) {
// // // // // //             let payoutIfThisWins = 0;
// // // // // //             const isRed = RED_NUMBERS.includes(num);
// // // // // //             const isBlack = num !== 0 && !isRed;

// // // // // //             currentRound.bets.forEach((bet) => {
// // // // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // // //               if (bet.betType === "red" && isRed)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // //               if (bet.betType === "black" && isBlack)
// // // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // // //             });

// // // // // //             if (payoutIfThisWins < bestPayout) {
// // // // // //               bestPayout = payoutIfThisWins;
// // // // // //               validNumbers = [num];
// // // // // //             } else if (payoutIfThisWins === bestPayout) {
// // // // // //               validNumbers.push(num);
// // // // // //             }
// // // // // //           }

// // // // // //           if (totalCollection === 0 || validNumbers.length === 0) {
// // // // // //             winningNumber = Math.floor(Math.random() * 37);
// // // // // //           } else {
// // // // // //             winningNumber =
// // // // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // // // //           }
// // // // // //         }
// // // // // //       }

// // // // // //       // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
// // // // // //       currentRound.winningNumber = winningNumber;
// // // // // //       currentRound.status = "closed";
// // // // // //       currentRound.resultProcessedAt = new Date();

// // // // // //       const isRedWin = RED_NUMBERS.includes(winningNumber);
// // // // // //       const isBlackWin = winningNumber !== 0 && !isRedWin;

// // // // // //       for (let i = 0; i < currentRound.bets.length; i++) {
// // // // // //         let bet = currentRound.bets[i];
// // // // // //         let isWin = false;
// // // // // //         let multiplier = 0;

// // // // // //         if (
// // // // // //           bet.betType === "number" &&
// // // // // //           bet.selection === String(winningNumber)
// // // // // //         ) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.singleNumberMultiplier || 36;
// // // // // //         } else if (
// // // // // //           bet.betType === "odd" &&
// // // // // //           winningNumber !== 0 &&
// // // // // //           winningNumber % 2 !== 0
// // // // // //         ) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // // // //         } else if (
// // // // // //           bet.betType === "even" &&
// // // // // //           winningNumber !== 0 &&
// // // // // //           winningNumber % 2 === 0
// // // // // //         ) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // // // //         } else if (
// // // // // //           bet.betType === "1-12" &&
// // // // // //           winningNumber >= 1 &&
// // // // // //           winningNumber <= 12
// // // // // //         ) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // // //         } else if (
// // // // // //           bet.betType === "13-24" &&
// // // // // //           winningNumber >= 13 &&
// // // // // //           winningNumber <= 24
// // // // // //         ) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // // //         } else if (
// // // // // //           bet.betType === "25-36" &&
// // // // // //           winningNumber >= 25 &&
// // // // // //           winningNumber <= 36
// // // // // //         ) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // // //         } else if (bet.betType === "red" && isRedWin) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.redBlackMultiplier || 2;
// // // // // //         } else if (bet.betType === "black" && isBlackWin) {
// // // // // //           isWin = true;
// // // // // //           multiplier = settings.redBlackMultiplier || 2;
// // // // // //         }

// // // // // //         if (isWin) {
// // // // // //           const winAmount = bet.amount * multiplier;
// // // // // //           bet.status = "win";
// // // // // //           bet.multiplier = multiplier;
// // // // // //           bet.payout = winAmount;
// // // // // //           await User.updateOne(
// // // // // //             { _id: bet.userId },
// // // // // //             { $inc: { balance: winAmount } },
// // // // // //           );
// // // // // //         } else {
// // // // // //           bet.status = "loss";
// // // // // //           bet.payout = 0;
// // // // // //         }
// // // // // //       }
// // // // // //       await currentRound.save();

// // // // // //       // ৪. নতুন রাউন্ড শুরু করা
// // // // // //       const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
// // // // // //       const newEndTime = new Date(now.getTime() + 60000);

// // // // // //       currentRound = await GameRound.create({
// // // // // //         periodNumber: nextPeriodNumber,
// // // // // //         status: "active",
// // // // // //         endTime: newEndTime,
// // // // // //         totalBets: 0,
// // // // // //         bets: [],
// // // // // //       });
// // // // // //       console.log(
// // // // // //         `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
// // // // // //       );
// // // // // //     }

// // // // // //     // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে
// // // // // //     else if (!currentRound || !currentRound.endTime) {
// // // // // //       const newEndTime = new Date(now.getTime() + 60000);

// // // // // //       if (currentRound) {
// // // // // //         currentRound.endTime = newEndTime;
// // // // // //         await currentRound.save();
// // // // // //       } else {
// // // // // //         currentRound = await GameRound.create({
// // // // // //           periodNumber: "PER-10001",
// // // // // //           status: "active",
// // // // // //           endTime: newEndTime,
// // // // // //           totalBets: 0,
// // // // // //           bets: [],
// // // // // //         });
// // // // // //       }
// // // // // //     }

// // // // // //     // 🆕 টাইমার ক্যালকুলেশন
// // // // // //     const end = new Date(currentRound.endTime).getTime();
// // // // // //     const current = new Date().getTime();
// // // // // //     const diff = Math.max(0, Math.floor((end - current) / 1000));

// // // // // //     // ==========================================
// // // // // //     // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা (উইন পপআপ দেখানোর জন্য)
// // // // // //     // ==========================================
// // // // // //     let userResult = null;
// // // // // //     const token = req.cookies.get("token")?.value;

// // // // // //     if (token) {
// // // // // //       try {
// // // // // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // // // // //         const identifier = decoded.uid || decoded.phone || decoded.userId;

// // // // // //         const userDoc = await User.findOne({
// // // // // //           $or: [{ uid: identifier }, { phone: identifier }],
// // // // // //         });

// // // // // //         if (userDoc) {
// // // // // //           const lastRound = await GameRound.findOne({ status: "closed" }).sort({
// // // // // //             resultProcessedAt: -1,
// // // // // //           });

// // // // // //           if (lastRound) {
// // // // // //             const userBet = lastRound.bets.find(
// // // // // //               (b) => b.userId.toString() === userDoc._id.toString(),
// // // // // //             );

// // // // // //             if (userBet) {
// // // // // //               userResult = {
// // // // // //                 status: userBet.status,
// // // // // //                 multiplier: userBet.multiplier,
// // // // // //                 payout: userBet.payout,
// // // // // //                 round: lastRound.periodNumber,
// // // // // //                 winningNumber: lastRound.winningNumber,
// // // // // //               };
// // // // // //             }
// // // // // //           }
// // // // // //         }
// // // // // //       } catch (err) {
// // // // // //         console.error("User result fetch error:", err);
// // // // // //       }
// // // // // //     }

// // // // // //     // 🆕 সর্বশেষ ১০টি রেজাল্ট বের করা
// // // // // //     const recentRounds = await GameRound.find({ status: "closed" })
// // // // // //       .sort({ resultProcessedAt: -1 })
// // // // // //       .limit(10)
// // // // // //       .select("winningNumber")
// // // // // //       .lean();

// // // // // //     const recentResults = recentRounds.map((r) => r.winningNumber);

// // // // // //     return NextResponse.json({
// // // // // //       success: true,
// // // // // //       periodNumber: currentRound.periodNumber,
// // // // // //       endTime: currentRound.endTime,
// // // // // //       timeLeft: diff,
// // // // // //       userResult: userResult,
// // // // // //       recentResults: recentResults, // 🆕
// // // // // //     });
// // // // // //   } catch (error) {
// // // // // //     console.error("❌ State API Error:", error);
// // // // // //     return NextResponse.json(
// // // // // //       { success: false, message: error.message },
// // // // // //       { status: 500 },
// // // // // //     );
// // // // // //   }
// // // // // // }
// // // // // // ///////////////////////////////////////
// // // // // import { NextResponse } from "next/server";
// // // // // import jwt from "jsonwebtoken";
// // // // // import dbConnect from "@/utils/db";
// // // // // import { GameRound } from "@/models/GameRound";
// // // // // import { GameSetting } from "@/models/GameSetting";
// // // // // import User from "@/models/User";

// // // // // // রুলেটের লাল নাম্বারগুলো
// // // // // const RED_NUMBERS = [
// // // // //   1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // // // // ];

// // // // // export async function GET(req) {
// // // // //   try {
// // // // //     await dbConnect();

// // // // //     let currentRound = await GameRound.findOne({ status: "active" }).sort({
// // // // //       createdAt: -1,
// // // // //     });
// // // // //     const now = new Date();

// // // // //     // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
// // // // //     if (
// // // // //       currentRound &&
// // // // //       currentRound.endTime &&
// // // // //       now > new Date(currentRound.endTime)
// // // // //     ) {
// // // // //       console.log("⏰ Round time over, processing smart result for 0-36...");

// // // // //       const settings = (await GameSetting.findOne({})) || {
// // // // //         targetProfitPercent: 20,
// // // // //         forceMultiplier: null,
// // // // //         singleNumberMultiplier: 36,
// // // // //         oddEvenMultiplier: 2,
// // // // //         dozenMultiplier: 3,
// // // // //         redBlackMultiplier: 2,
// // // // //       };

// // // // //       const totalCollection = currentRound.totalBets;
// // // // //       let winningNumber = null;

// // // // //       // 🧠 স্মার্ট অ্যালগরিদম
// // // // //       if (
// // // // //         settings.forceMultiplier !== null &&
// // // // //         settings.forceMultiplier >= 0 &&
// // // // //         settings.forceMultiplier <= 36
// // // // //       ) {
// // // // //         winningNumber = settings.forceMultiplier;
// // // // //         await GameSetting.updateOne(
// // // // //           { _id: settings._id },
// // // // //           { $set: { forceMultiplier: null } },
// // // // //         );
// // // // //       } else {
// // // // //         const MULTIPLIERS = {
// // // // //           single: settings.singleNumberMultiplier || 36,
// // // // //           oddEven: settings.oddEvenMultiplier || 2,
// // // // //           dozen: settings.dozenMultiplier || 3,
// // // // //           redBlack: settings.redBlackMultiplier || 2,
// // // // //         };

// // // // //         if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
// // // // //           const targetProfit =
// // // // //             totalCollection * (settings.targetProfitPercent / 100);
// // // // //           const maxPayoutAllowed = totalCollection - targetProfit;
// // // // //           let validNumbers = [];

// // // // //           for (let num = 0; num <= 36; num++) {
// // // // //             let payoutIfThisWins = 0;
// // // // //             const isRed = RED_NUMBERS.includes(num);
// // // // //             const isBlack = num !== 0 && !isRed;

// // // // //             currentRound.bets.forEach((bet) => {
// // // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // //               if (bet.betType === "red" && isRed)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // //               if (bet.betType === "black" && isBlack)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // //             });

// // // // //             if (payoutIfThisWins <= maxPayoutAllowed) {
// // // // //               validNumbers.push(num);
// // // // //             }
// // // // //           }

// // // // //           if (validNumbers.length === 0) {
// // // // //             winningNumber = Math.floor(Math.random() * 37);
// // // // //           } else {
// // // // //             winningNumber =
// // // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // // //           }
// // // // //         } else {
// // // // //           let bestPayout = Infinity;
// // // // //           let validNumbers = [];

// // // // //           for (let num = 0; num <= 36; num++) {
// // // // //             let payoutIfThisWins = 0;
// // // // //             const isRed = RED_NUMBERS.includes(num);
// // // // //             const isBlack = num !== 0 && !isRed;

// // // // //             currentRound.bets.forEach((bet) => {
// // // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // // //               if (bet.betType === "red" && isRed)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // //               if (bet.betType === "black" && isBlack)
// // // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // // //             });

// // // // //             if (payoutIfThisWins < bestPayout) {
// // // // //               bestPayout = payoutIfThisWins;
// // // // //               validNumbers = [num];
// // // // //             } else if (payoutIfThisWins === bestPayout) {
// // // // //               validNumbers.push(num);
// // // // //             }
// // // // //           }

// // // // //           if (totalCollection === 0 || validNumbers.length === 0) {
// // // // //             winningNumber = Math.floor(Math.random() * 37);
// // // // //           } else {
// // // // //             winningNumber =
// // // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // // //           }
// // // // //         }
// // // // //       }

// // // // //       // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
// // // // //       currentRound.winningNumber = winningNumber;
// // // // //       currentRound.status = "closed";
// // // // //       currentRound.resultProcessedAt = new Date();

// // // // //       const isRedWin = RED_NUMBERS.includes(winningNumber);
// // // // //       const isBlackWin = winningNumber !== 0 && !isRedWin;

// // // // //       for (let i = 0; i < currentRound.bets.length; i++) {
// // // // //         let bet = currentRound.bets[i];
// // // // //         let isWin = false;
// // // // //         let multiplier = 0;

// // // // //         if (
// // // // //           bet.betType === "number" &&
// // // // //           bet.selection === String(winningNumber)
// // // // //         ) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.singleNumberMultiplier || 36;
// // // // //         } else if (
// // // // //           bet.betType === "odd" &&
// // // // //           winningNumber !== 0 &&
// // // // //           winningNumber % 2 !== 0
// // // // //         ) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // // //         } else if (
// // // // //           bet.betType === "even" &&
// // // // //           winningNumber !== 0 &&
// // // // //           winningNumber % 2 === 0
// // // // //         ) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // // //         } else if (
// // // // //           bet.betType === "1-12" &&
// // // // //           winningNumber >= 1 &&
// // // // //           winningNumber <= 12
// // // // //         ) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // //         } else if (
// // // // //           bet.betType === "13-24" &&
// // // // //           winningNumber >= 13 &&
// // // // //           winningNumber <= 24
// // // // //         ) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // //         } else if (
// // // // //           bet.betType === "25-36" &&
// // // // //           winningNumber >= 25 &&
// // // // //           winningNumber <= 36
// // // // //         ) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.dozenMultiplier || 3;
// // // // //         } else if (bet.betType === "red" && isRedWin) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.redBlackMultiplier || 2;
// // // // //         } else if (bet.betType === "black" && isBlackWin) {
// // // // //           isWin = true;
// // // // //           multiplier = settings.redBlackMultiplier || 2;
// // // // //         }

// // // // //         if (isWin) {
// // // // //           const winAmount = bet.amount * multiplier;
// // // // //           bet.status = "win";
// // // // //           bet.multiplier = multiplier;
// // // // //           bet.payout = winAmount;
// // // // //           await User.updateOne(
// // // // //             { _id: bet.userId },
// // // // //             { $inc: { balance: winAmount } },
// // // // //           );
// // // // //         } else {
// // // // //           bet.status = "loss";
// // // // //           bet.payout = 0;
// // // // //         }
// // // // //       }
// // // // //       await currentRound.save();

// // // // //       // ৪. নতুন রাউন্ড শুরু করা (৩০ সেকেন্ড)
// // // // //       const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
// // // // //       const newEndTime = new Date(now.getTime() + 30000); // 🆕 ৩০ সেকেন্ড

// // // // //       currentRound = await GameRound.create({
// // // // //         periodNumber: nextPeriodNumber,
// // // // //         status: "active",
// // // // //         endTime: newEndTime,
// // // // //         totalBets: 0,
// // // // //         bets: [],
// // // // //       });
// // // // //       console.log(
// // // // //         `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
// // // // //       );
// // // // //     }

// // // // //     // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে (৩০ সেকেন্ড)
// // // // //     else if (!currentRound || !currentRound.endTime) {
// // // // //       const newEndTime = new Date(now.getTime() + 30000); // 🆕 ৩০ সেকেন্ড

// // // // //       if (currentRound) {
// // // // //         currentRound.endTime = newEndTime;
// // // // //         await currentRound.save();
// // // // //       } else {
// // // // //         currentRound = await GameRound.create({
// // // // //           periodNumber: "PER-10001",
// // // // //           status: "active",
// // // // //           endTime: newEndTime,
// // // // //           totalBets: 0,
// // // // //           bets: [],
// // // // //         });
// // // // //       }
// // // // //     }

// // // // //     // 🆕 টাইমার ক্যালকুলেশন
// // // // //     const end = new Date(currentRound.endTime).getTime();
// // // // //     const current = new Date().getTime();
// // // // //     const diff = Math.max(0, Math.floor((end - current) / 1000));

// // // // //     // ==========================================
// // // // //     // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা (উইন পপআপ দেখানোর জন্য)
// // // // //     // ==========================================
// // // // //     let userResult = null;
// // // // //     const token = req.cookies.get("token")?.value;

// // // // //     if (token) {
// // // // //       try {
// // // // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // // // //         const identifier = decoded.uid || decoded.phone || decoded.userId;

// // // // //         const userDoc = await User.findOne({
// // // // //           $or: [{ uid: identifier }, { phone: identifier }],
// // // // //         });

// // // // //         if (userDoc) {
// // // // //           const lastRound = await GameRound.findOne({ status: "closed" }).sort({
// // // // //             resultProcessedAt: -1,
// // // // //           });

// // // // //           if (lastRound) {
// // // // //             const userBet = lastRound.bets.find(
// // // // //               (b) => b.userId.toString() === userDoc._id.toString(),
// // // // //             );

// // // // //             if (userBet) {
// // // // //               userResult = {
// // // // //                 status: userBet.status,
// // // // //                 multiplier: userBet.multiplier,
// // // // //                 payout: userBet.payout,
// // // // //                 round: lastRound.periodNumber,
// // // // //                 winningNumber: lastRound.winningNumber,
// // // // //               };
// // // // //             }
// // // // //           }
// // // // //         }
// // // // //       } catch (err) {
// // // // //         console.error("User result fetch error:", err);
// // // // //       }
// // // // //     }

// // // // //     // 🆕 সর্বশেষ ১০টি রেজাল্ট বের করা
// // // // //     const recentRounds = await GameRound.find({ status: "closed" })
// // // // //       .sort({ resultProcessedAt: -1 })
// // // // //       .limit(10)
// // // // //       .select("winningNumber")
// // // // //       .lean();

// // // // //     const recentResults = recentRounds.map((r) => r.winningNumber);

// // // // //     return NextResponse.json({
// // // // //       success: true,
// // // // //       periodNumber: currentRound.periodNumber,
// // // // //       endTime: currentRound.endTime,
// // // // //       timeLeft: diff,
// // // // //       userResult: userResult,
// // // // //       recentResults: recentResults,
// // // // //     });
// // // // //   } catch (error) {
// // // // //     console.error("❌ State API Error:", error);
// // // // //     return NextResponse.json(
// // // // //       { success: false, message: error.message },
// // // // //       { status: 500 },
// // // // //     );
// // // // //   }
// // // // // }
// // // // // ////////////////////////////////////////////
// // // // import { NextResponse } from "next/server";
// // // // import jwt from "jsonwebtoken";
// // // // import dbConnect from "@/utils/db";
// // // // import { GameRound } from "@/models/GameRound";
// // // // import { GameSetting } from "@/models/GameSetting";
// // // // import User from "@/models/User";

// // // // // রুলেটের লাল নাম্বারগুলো
// // // // const RED_NUMBERS = [
// // // //   1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // // // ];

// // // // export async function GET(req) {
// // // //   try {
// // // //     await dbConnect();

// // // //     let currentRound = await GameRound.findOne({ status: "active" }).sort({
// // // //       createdAt: -1,
// // // //     });
// // // //     const now = new Date();

// // // //     // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
// // // //     if (
// // // //       currentRound &&
// // // //       currentRound.endTime &&
// // // //       now > new Date(currentRound.endTime)
// // // //     ) {
// // // //       console.log("⏰ Round time over, processing smart result for 0-36...");

// // // //       const settings = (await GameSetting.findOne({})) || {
// // // //         targetProfitPercent: 20,
// // // //         forceMultiplier: null,
// // // //         singleNumberMultiplier: 36,
// // // //         oddEvenMultiplier: 2,
// // // //         dozenMultiplier: 3,
// // // //         redBlackMultiplier: 2,
// // // //       };

// // // //       const totalCollection = currentRound.totalBets;
// // // //       let winningNumber = null;

// // // //       // 🧠 স্মার্ট অ্যালগরিদম
// // // //       if (
// // // //         settings.forceMultiplier !== null &&
// // // //         settings.forceMultiplier >= 0 &&
// // // //         settings.forceMultiplier <= 36
// // // //       ) {
// // // //         winningNumber = settings.forceMultiplier;
// // // //         await GameSetting.updateOne(
// // // //           { _id: settings._id },
// // // //           { $set: { forceMultiplier: null } },
// // // //         );
// // // //       } else {
// // // //         const MULTIPLIERS = {
// // // //           single: settings.singleNumberMultiplier || 36,
// // // //           oddEven: settings.oddEvenMultiplier || 2,
// // // //           dozen: settings.dozenMultiplier || 3,
// // // //           redBlack: settings.redBlackMultiplier || 2,
// // // //         };

// // // //         if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
// // // //           const targetProfit =
// // // //             totalCollection * (settings.targetProfitPercent / 100);
// // // //           const maxPayoutAllowed = totalCollection - targetProfit;
// // // //           let validNumbers = [];

// // // //           for (let num = 0; num <= 36; num++) {
// // // //             let payoutIfThisWins = 0;
// // // //             const isRed = RED_NUMBERS.includes(num);
// // // //             const isBlack = num !== 0 && !isRed;

// // // //             currentRound.bets.forEach((bet) => {
// // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // //               if (bet.betType === "red" && isRed)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // //               if (bet.betType === "black" && isBlack)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // //             });

// // // //             if (payoutIfThisWins <= maxPayoutAllowed) {
// // // //               validNumbers.push(num);
// // // //             }
// // // //           }

// // // //           if (validNumbers.length === 0) {
// // // //             winningNumber = Math.floor(Math.random() * 37);
// // // //           } else {
// // // //             winningNumber =
// // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // //           }
// // // //         } else {
// // // //           let bestPayout = Infinity;
// // // //           let validNumbers = [];

// // // //           for (let num = 0; num <= 36; num++) {
// // // //             let payoutIfThisWins = 0;
// // // //             const isRed = RED_NUMBERS.includes(num);
// // // //             const isBlack = num !== 0 && !isRed;

// // // //             currentRound.bets.forEach((bet) => {
// // // //               if (bet.betType === "number" && bet.selection === String(num))
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // // //               if (bet.betType === "red" && isRed)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // //               if (bet.betType === "black" && isBlack)
// // // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // // //             });

// // // //             if (payoutIfThisWins < bestPayout) {
// // // //               bestPayout = payoutIfThisWins;
// // // //               validNumbers = [num];
// // // //             } else if (payoutIfThisWins === bestPayout) {
// // // //               validNumbers.push(num);
// // // //             }
// // // //           }

// // // //           if (totalCollection === 0 || validNumbers.length === 0) {
// // // //             winningNumber = Math.floor(Math.random() * 37);
// // // //           } else {
// // // //             winningNumber =
// // // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // // //           }
// // // //         }
// // // //       }

// // // //       // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
// // // //       currentRound.winningNumber = winningNumber;
// // // //       currentRound.status = "closed";
// // // //       currentRound.resultProcessedAt = new Date();

// // // //       const isRedWin = RED_NUMBERS.includes(winningNumber);
// // // //       const isBlackWin = winningNumber !== 0 && !isRedWin;

// // // //       for (let i = 0; i < currentRound.bets.length; i++) {
// // // //         let bet = currentRound.bets[i];
// // // //         let isWin = false;
// // // //         let multiplier = 0;

// // // //         if (
// // // //           bet.betType === "number" &&
// // // //           bet.selection === String(winningNumber)
// // // //         ) {
// // // //           isWin = true;
// // // //           multiplier = settings.singleNumberMultiplier || 36;
// // // //         } else if (
// // // //           bet.betType === "odd" &&
// // // //           winningNumber !== 0 &&
// // // //           winningNumber % 2 !== 0
// // // //         ) {
// // // //           isWin = true;
// // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // //         } else if (
// // // //           bet.betType === "even" &&
// // // //           winningNumber !== 0 &&
// // // //           winningNumber % 2 === 0
// // // //         ) {
// // // //           isWin = true;
// // // //           multiplier = settings.oddEvenMultiplier || 2;
// // // //         } else if (
// // // //           bet.betType === "1-12" &&
// // // //           winningNumber >= 1 &&
// // // //           winningNumber <= 12
// // // //         ) {
// // // //           isWin = true;
// // // //           multiplier = settings.dozenMultiplier || 3;
// // // //         } else if (
// // // //           bet.betType === "13-24" &&
// // // //           winningNumber >= 13 &&
// // // //           winningNumber <= 24
// // // //         ) {
// // // //           isWin = true;
// // // //           multiplier = settings.dozenMultiplier || 3;
// // // //         } else if (
// // // //           bet.betType === "25-36" &&
// // // //           winningNumber >= 25 &&
// // // //           winningNumber <= 36
// // // //         ) {
// // // //           isWin = true;
// // // //           multiplier = settings.dozenMultiplier || 3;
// // // //         } else if (bet.betType === "red" && isRedWin) {
// // // //           isWin = true;
// // // //           multiplier = settings.redBlackMultiplier || 2;
// // // //         } else if (bet.betType === "black" && isBlackWin) {
// // // //           isWin = true;
// // // //           multiplier = settings.redBlackMultiplier || 2;
// // // //         }

// // // //         if (isWin) {
// // // //           const winAmount = bet.amount * multiplier;
// // // //           bet.status = "win";
// // // //           bet.multiplier = multiplier;
// // // //           bet.payout = winAmount;
// // // //           await User.updateOne(
// // // //             { _id: bet.userId },
// // // //             { $inc: { balance: winAmount } },
// // // //           );
// // // //         } else {
// // // //           bet.status = "loss";
// // // //           bet.payout = 0;

// // // //           // 🆕 লস হলে ইউজারের লস ফিল্ডগুলো বাড়বে
// // // //           await User.updateOne(
// // // //             { _id: bet.userId },
// // // //             {
// // // //               $inc: {
// // // //                 monthlyLost: bet.amount,
// // // //                 weeklyLost: bet.amount,
// // // //                 totalLost: bet.amount,
// // // //               },
// // // //             },
// // // //           );
// // // //         }
// // // //       }
// // // //       await currentRound.save();

// // // //       // ৪. নতুন রাউন্ড শুরু করা (৩০ সেকেন্ড)
// // // //       const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
// // // //       const newEndTime = new Date(now.getTime() + 30000);

// // // //       currentRound = await GameRound.create({
// // // //         periodNumber: nextPeriodNumber,
// // // //         status: "active",
// // // //         endTime: newEndTime,
// // // //         totalBets: 0,
// // // //         bets: [],
// // // //       });
// // // //       console.log(
// // // //         `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
// // // //       );
// // // //     }

// // // //     // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে (৩০ সেকেন্ড)
// // // //     else if (!currentRound || !currentRound.endTime) {
// // // //       const newEndTime = new Date(now.getTime() + 30000);

// // // //       if (currentRound) {
// // // //         currentRound.endTime = newEndTime;
// // // //         await currentRound.save();
// // // //       } else {
// // // //         currentRound = await GameRound.create({
// // // //           periodNumber: "PER-10001",
// // // //           status: "active",
// // // //           endTime: newEndTime,
// // // //           totalBets: 0,
// // // //           bets: [],
// // // //         });
// // // //       }
// // // //     }

// // // //     // 🆕 টাইমার ক্যালকুলেশন
// // // //     const end = new Date(currentRound.endTime).getTime();
// // // //     const current = new Date().getTime();
// // // //     const diff = Math.max(0, Math.floor((end - current) / 1000));

// // // //     // ==========================================
// // // //     // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা
// // // //     // ==========================================
// // // //     let userResult = null;
// // // //     const token = req.cookies.get("token")?.value;

// // // //     if (token) {
// // // //       try {
// // // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // // //         const identifier = decoded.uid || decoded.phone || decoded.userId;

// // // //         const userDoc = await User.findOne({
// // // //           $or: [{ uid: identifier }, { phone: identifier }],
// // // //         });

// // // //         if (userDoc) {
// // // //           const lastRound = await GameRound.findOne({ status: "closed" }).sort({
// // // //             resultProcessedAt: -1,
// // // //           });

// // // //           if (lastRound) {
// // // //             const userBet = lastRound.bets.find(
// // // //               (b) => b.userId.toString() === userDoc._id.toString(),
// // // //             );

// // // //             if (userBet) {
// // // //               userResult = {
// // // //                 status: userBet.status,
// // // //                 multiplier: userBet.multiplier,
// // // //                 payout: userBet.payout,
// // // //                 round: lastRound.periodNumber,
// // // //                 winningNumber: lastRound.winningNumber,
// // // //               };
// // // //             }
// // // //           }
// // // //         }
// // // //       } catch (err) {
// // // //         console.error("User result fetch error:", err);
// // // //       }
// // // //     }

// // // //     // 🆕 সর্বশেষ ১০টি রেজাল্ট বের করা
// // // //     const recentRounds = await GameRound.find({ status: "closed" })
// // // //       .sort({ resultProcessedAt: -1 })
// // // //       .limit(10)
// // // //       .select("winningNumber")
// // // //       .lean();

// // // //     const recentResults = recentRounds.map((r) => r.winningNumber);

// // // //     return NextResponse.json({
// // // //       success: true,
// // // //       periodNumber: currentRound.periodNumber,
// // // //       endTime: currentRound.endTime,
// // // //       timeLeft: diff,
// // // //       userResult: userResult,
// // // //       recentResults: recentResults,
// // // //     });
// // // //   } catch (error) {
// // // //     console.error("❌ State API Error:", error);
// // // //     return NextResponse.json(
// // // //       { success: false, message: error.message },
// // // //       { status: 500 },
// // // //     );
// // // //   }
// // // // }
// // // // ///////////////////////////////////////////////
// // // import { NextResponse } from "next/server";
// // // import jwt from "jsonwebtoken";
// // // import dbConnect from "@/utils/db";
// // // import { GameRound } from "@/models/GameRound";
// // // import { GameSetting } from "@/models/GameSetting";
// // // import User from "@/models/User";

// // // // রুলেটের লাল নাম্বারগুলো
// // // const RED_NUMBERS = [
// // //   1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // // ];

// // // export async function GET(req) {
// // //   try {
// // //     await dbConnect();

// // //     let currentRound = await GameRound.findOne({ status: "active" }).sort({
// // //       createdAt: -1,
// // //     });
// // //     const now = new Date();

// // //     // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
// // //     if (
// // //       currentRound &&
// // //       currentRound.endTime &&
// // //       now > new Date(currentRound.endTime)
// // //     ) {
// // //       console.log("⏰ Round time over, processing smart result for 0-36...");

// // //       const settings = (await GameSetting.findOne({})) || {
// // //         targetProfitPercent: 20,
// // //         forceMultiplier: null,
// // //         singleNumberMultiplier: 36,
// // //         oddEvenMultiplier: 2,
// // //         dozenMultiplier: 3,
// // //         redBlackMultiplier: 2,
// // //       };

// // //       const totalCollection = currentRound.totalBets;
// // //       let winningNumber = null;

// // //       // 🧠 স্মার্ট অ্যালগরিদম
// // //       if (
// // //         settings.forceMultiplier !== null &&
// // //         settings.forceMultiplier >= 0 &&
// // //         settings.forceMultiplier <= 36
// // //       ) {
// // //         winningNumber = settings.forceMultiplier;
// // //         await GameSetting.updateOne(
// // //           { _id: settings._id },
// // //           { $set: { forceMultiplier: null } },
// // //         );
// // //       } else {
// // //         const MULTIPLIERS = {
// // //           single: settings.singleNumberMultiplier || 36,
// // //           oddEven: settings.oddEvenMultiplier || 2,
// // //           dozen: settings.dozenMultiplier || 3,
// // //           redBlack: settings.redBlackMultiplier || 2,
// // //         };

// // //         if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
// // //           const targetProfit =
// // //             totalCollection * (settings.targetProfitPercent / 100);
// // //           const maxPayoutAllowed = totalCollection - targetProfit;
// // //           let validNumbers = [];

// // //           for (let num = 0; num <= 36; num++) {
// // //             let payoutIfThisWins = 0;
// // //             const isRed = RED_NUMBERS.includes(num);
// // //             const isBlack = num !== 0 && !isRed;

// // //             currentRound.bets.forEach((bet) => {
// // //               if (bet.betType === "number" && bet.selection === String(num))
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // //               if (bet.betType === "red" && isRed)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // //               if (bet.betType === "black" && isBlack)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

// // //               // 🆕 নতুন বাজির হিসাব (১-১৮, ১৯-৩৬, ২:১)
// // //               if (bet.betType === "low" && num >= 1 && num <= 18)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "high" && num >= 19 && num <= 36)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "col_1" && num % 3 === 1)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "col_2" && num % 3 === 2)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //             });

// // //             if (payoutIfThisWins <= maxPayoutAllowed) {
// // //               validNumbers.push(num);
// // //             }
// // //           }

// // //           if (validNumbers.length === 0) {
// // //             winningNumber = Math.floor(Math.random() * 37);
// // //           } else {
// // //             winningNumber =
// // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // //           }
// // //         } else {
// // //           let bestPayout = Infinity;
// // //           let validNumbers = [];

// // //           for (let num = 0; num <= 36; num++) {
// // //             let payoutIfThisWins = 0;
// // //             const isRed = RED_NUMBERS.includes(num);
// // //             const isBlack = num !== 0 && !isRed;

// // //             currentRound.bets.forEach((bet) => {
// // //               if (bet.betType === "number" && bet.selection === String(num))
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// // //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// // //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// // //               if (bet.betType === "red" && isRed)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// // //               if (bet.betType === "black" && isBlack)
// // //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

// // //               // 🆕 নতুন বাজির হিসাব (১-১৮, ১৯-৩৬, ২:১)
// // //               if (bet.betType === "low" && num >= 1 && num <= 18)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "high" && num >= 19 && num <= 36)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "col_1" && num % 3 === 1)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "col_2" && num % 3 === 2)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //               if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
// // //                 payoutIfThisWins += bet.amount * 2;
// // //             });

// // //             if (payoutIfThisWins < bestPayout) {
// // //               bestPayout = payoutIfThisWins;
// // //               validNumbers = [num];
// // //             } else if (payoutIfThisWins === bestPayout) {
// // //               validNumbers.push(num);
// // //             }
// // //           }

// // //           if (totalCollection === 0 || validNumbers.length === 0) {
// // //             winningNumber = Math.floor(Math.random() * 37);
// // //           } else {
// // //             winningNumber =
// // //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// // //           }
// // //         }
// // //       }

// // //       // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
// // //       currentRound.winningNumber = winningNumber;
// // //       currentRound.status = "closed";
// // //       currentRound.resultProcessedAt = new Date();

// // //       const isRedWin = RED_NUMBERS.includes(winningNumber);
// // //       const isBlackWin = winningNumber !== 0 && !isRedWin;

// // //       for (let i = 0; i < currentRound.bets.length; i++) {
// // //         let bet = currentRound.bets[i];
// // //         let isWin = false;
// // //         let multiplier = 0;

// // //         if (
// // //           bet.betType === "number" &&
// // //           bet.selection === String(winningNumber)
// // //         ) {
// // //           isWin = true;
// // //           multiplier = settings.singleNumberMultiplier || 36;
// // //         } else if (
// // //           bet.betType === "odd" &&
// // //           winningNumber !== 0 &&
// // //           winningNumber % 2 !== 0
// // //         ) {
// // //           isWin = true;
// // //           multiplier = settings.oddEvenMultiplier || 2;
// // //         } else if (
// // //           bet.betType === "even" &&
// // //           winningNumber !== 0 &&
// // //           winningNumber % 2 === 0
// // //         ) {
// // //           isWin = true;
// // //           multiplier = settings.oddEvenMultiplier || 2;
// // //         } else if (
// // //           bet.betType === "1-12" &&
// // //           winningNumber >= 1 &&
// // //           winningNumber <= 12
// // //         ) {
// // //           isWin = true;
// // //           multiplier = settings.dozenMultiplier || 3;
// // //         } else if (
// // //           bet.betType === "13-24" &&
// // //           winningNumber >= 13 &&
// // //           winningNumber <= 24
// // //         ) {
// // //           isWin = true;
// // //           multiplier = settings.dozenMultiplier || 3;
// // //         } else if (
// // //           bet.betType === "25-36" &&
// // //           winningNumber >= 25 &&
// // //           winningNumber <= 36
// // //         ) {
// // //           isWin = true;
// // //           multiplier = settings.dozenMultiplier || 3;
// // //         } else if (bet.betType === "red" && isRedWin) {
// // //           isWin = true;
// // //           multiplier = settings.redBlackMultiplier || 2;
// // //         } else if (bet.betType === "black" && isBlackWin) {
// // //           isWin = true;
// // //           multiplier = settings.redBlackMultiplier || 2;
// // //         }
// // //         // 🆕 নতুন বাজির উইন লজিক
// // //         else if (bet.betType === "low" && winningNumber >= 1 && winningNumber <= 18) {
// // //           isWin = true;
// // //           multiplier = 2;
// // //         } else if (bet.betType === "high" && winningNumber >= 19 && winningNumber <= 36) {
// // //           isWin = true;
// // //           multiplier = 2;
// // //         } else if (bet.betType === "col_1" && winningNumber % 3 === 1) {
// // //           isWin = true;
// // //           multiplier = 2;
// // //         } else if (bet.betType === "col_2" && winningNumber % 3 === 2) {
// // //           isWin = true;
// // //           multiplier = 2;
// // //         } else if (bet.betType === "col_3" && winningNumber % 3 === 0 && winningNumber !== 0) {
// // //           isWin = true;
// // //           multiplier = 2;
// // //         }

// // //         if (isWin) {
// // //           const winAmount = bet.amount * multiplier;
// // //           bet.status = "win";
// // //           bet.multiplier = multiplier;
// // //           bet.payout = winAmount;
// // //           await User.updateOne(
// // //             { _id: bet.userId },
// // //             { $inc: { balance: winAmount } },
// // //           );
// // //         } else {
// // //           bet.status = "loss";
// // //           bet.payout = 0;

// // //           // 🆕 লস হলে ইউজারের লস ফিল্ডগুলো বাড়বে
// // //           await User.updateOne(
// // //             { _id: bet.userId },
// // //             {
// // //               $inc: {
// // //                 monthlyLost: bet.amount,
// // //                 weeklyLost: bet.amount,
// // //                 totalLost: bet.amount,
// // //               },
// // //             },
// // //           );
// // //         }
// // //       }
// // //       await currentRound.save();

// // //       // ৪. নতুন রাউন্ড শুরু করা (৩০ সেকেন্ড)
// // //       const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
// // //       const newEndTime = new Date(now.getTime() + 30000);

// // //       currentRound = await GameRound.create({
// // //         periodNumber: nextPeriodNumber,
// // //         status: "active",
// // //         endTime: newEndTime,
// // //         totalBets: 0,
// // //         bets: [],
// // //       });
// // //       console.log(
// // //         `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
// // //       );
// // //     }

// // //     // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে (৩০ সেকেন্ড)
// // //     else if (!currentRound || !currentRound.endTime) {
// // //       const newEndTime = new Date(now.getTime() + 30000);

// // //       if (currentRound) {
// // //         currentRound.endTime = newEndTime;
// // //         await currentRound.save();
// // //       } else {
// // //         currentRound = await GameRound.create({
// // //           periodNumber: "PER-10001",
// // //           status: "active",
// // //           endTime: newEndTime,
// // //           totalBets: 0,
// // //           bets: [],
// // //         });
// // //       }
// // //     }

// // //     // 🆕 টাইমার ক্যালকুলেশন
// // //     const end = new Date(currentRound.endTime).getTime();
// // //     const current = new Date().getTime();
// // //     const diff = Math.max(0, Math.floor((end - current) / 1000));

// // //     // ==========================================
// // //     // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা
// // //     // ==========================================
// // //     let userResult = null;
// // //     const token = req.cookies.get("token")?.value;

// // //     if (token) {
// // //       try {
// // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //         const identifier = decoded.uid || decoded.phone || decoded.userId;

// // //         const userDoc = await User.findOne({
// // //           $or: [{ uid: identifier }, { phone: identifier }],
// // //         });

// // //         if (userDoc) {
// // //           const lastRound = await GameRound.findOne({ status: "closed" }).sort({
// // //             resultProcessedAt: -1,
// // //           });

// // //           if (lastRound) {
// // //             const userBet = lastRound.bets.find(
// // //               (b) => b.userId.toString() === userDoc._id.toString(),
// // //             );

// // //             if (userBet) {
// // //               userResult = {
// // //                 status: userBet.status,
// // //                 multiplier: userBet.multiplier,
// // //                 payout: userBet.payout,
// // //                 round: lastRound.periodNumber,
// // //                 winningNumber: lastRound.winningNumber,
// // //               };
// // //             }
// // //           }
// // //         }
// // //       } catch (err) {
// // //         console.error("User result fetch error:", err);
// // //       }
// // //     }

// // //     // 🆕 সর্বশেষ ১০টি রেজাল্ট বের করা
// // //     const recentRounds = await GameRound.find({ status: "closed" })
// // //       .sort({ resultProcessedAt: -1 })
// // //       .limit(10)
// // //       .select("winningNumber")
// // //       .lean();

// // //     const recentResults = recentRounds.map((r) => r.winningNumber);

// // //     return NextResponse.json({
// // //       success: true,
// // //       periodNumber: currentRound.periodNumber,
// // //       endTime: currentRound.endTime,
// // //       timeLeft: diff,
// // //       userResult: userResult,
// // //       recentResults: recentResults,
// // //     });
// // //   } catch (error) {
// // //     console.error("❌ State API Error:", error);
// // //     return NextResponse.json(
// // //       { success: false, message: error.message },
// // //       { status: 500 },
// // //     );
// // //   }
// // // }
// // // ///////////////////////////////////////////////
// // import { NextResponse } from "next/server";
// // import jwt from "jsonwebtoken";
// // import dbConnect from "@/utils/db";
// // import { GameRound } from "@/models/GameRound";
// // import { GameSetting } from "@/models/GameSetting";
// // import User from "@/models/User";

// // // রুলেটের লাল নাম্বারগুলো
// // const RED_NUMBERS = [
// //   1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // ];

// // export async function GET(req) {
// //   try {
// //     await dbConnect();

// //     let currentRound = await GameRound.findOne({ status: "active" }).sort({
// //       createdAt: -1,
// //     });
// //     const now = new Date();

// //     // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
// //     if (
// //       currentRound &&
// //       currentRound.endTime &&
// //       now > new Date(currentRound.endTime)
// //     ) {
// //       console.log("⏰ Round time over, processing smart result for 0-36...");

// //       const settings = (await GameSetting.findOne({})) || {
// //         targetProfitPercent: 20,
// //         forceMultiplier: null,
// //         singleNumberMultiplier: 36,
// //         oddEvenMultiplier: 2,
// //         dozenMultiplier: 3,
// //         redBlackMultiplier: 2,
// //         lowHighMultiplier: 2, // 🆕 ডিফল্ট
// //         columnMultiplier: 2, // 🆕 ডিফল্ট
// //       };

// //       const totalCollection = currentRound.totalBets;
// //       let winningNumber = null;

// //       // 🧠 স্মার্ট অ্যালগরিদম
// //       if (
// //         settings.forceMultiplier !== null &&
// //         settings.forceMultiplier >= 0 &&
// //         settings.forceMultiplier <= 36
// //       ) {
// //         winningNumber = settings.forceMultiplier;
// //         await GameSetting.updateOne(
// //           { _id: settings._id },
// //           { $set: { forceMultiplier: null } },
// //         );
// //       } else {
// //         const MULTIPLIERS = {
// //           single: settings.singleNumberMultiplier || 36,
// //           oddEven: settings.oddEvenMultiplier || 2,
// //           dozen: settings.dozenMultiplier || 3,
// //           redBlack: settings.redBlackMultiplier || 2,
// //           lowHigh: settings.lowHighMultiplier || 2, // 🆕
// //           column: settings.columnMultiplier || 2, // 🆕
// //         };

// //         if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
// //           const targetProfit =
// //             totalCollection * (settings.targetProfitPercent / 100);
// //           const maxPayoutAllowed = totalCollection - targetProfit;
// //           let validNumbers = [];

// //           for (let num = 0; num <= 36; num++) {
// //             let payoutIfThisWins = 0;
// //             const isRed = RED_NUMBERS.includes(num);
// //             const isBlack = num !== 0 && !isRed;

// //             currentRound.bets.forEach((bet) => {
// //               if (bet.betType === "number" && bet.selection === String(num))
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// //               if (bet.betType === "red" && isRed)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// //               if (bet.betType === "black" && isBlack)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

// //               // 🆕 নতুন বাজির হিসাব (১-১৮, ১৯-৩৬, ২:১) - অ্যাডমিন সেটিংস থেকে নিবে
// //               if (bet.betType === "1-18" && num >= 1 && num <= 18)
// //                 if (bet.betType === "19-36" && num >= 19 && num <= 36)
// //                   if (bet.betType === "col_1" && num % 3 === 1)
// //                     payoutIfThisWins += bet.amount * MULTIPLIERS.column;
// //               if (bet.betType === "col_2" && num % 3 === 2)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
// //               if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
// //             });

// //             if (payoutIfThisWins <= maxPayoutAllowed) {
// //               validNumbers.push(num);
// //             }
// //           }

// //           if (validNumbers.length === 0) {
// //             winningNumber = Math.floor(Math.random() * 37);
// //           } else {
// //             winningNumber =
// //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// //           }
// //         } else {
// //           let bestPayout = Infinity;
// //           let validNumbers = [];

// //           for (let num = 0; num <= 36; num++) {
// //             let payoutIfThisWins = 0;
// //             const isRed = RED_NUMBERS.includes(num);
// //             const isBlack = num !== 0 && !isRed;

// //             currentRound.bets.forEach((bet) => {
// //               if (bet.betType === "number" && bet.selection === String(num))
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
// //               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// //               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
// //               if (bet.betType === "1-12" && num >= 1 && num <= 12)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// //               if (bet.betType === "13-24" && num >= 13 && num <= 24)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// //               if (bet.betType === "25-36" && num >= 25 && num <= 36)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
// //               if (bet.betType === "red" && isRed)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
// //               if (bet.betType === "black" && isBlack)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

// //               // 🆕 নতুন বাজির হিসাব (১-১৮, ১৯-৩৬, ২:১) - অ্যাডমিন সেটিংস থেকে নিবে
// //               if (bet.betType === "low" && num >= 1 && num <= 18)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
// //               if (bet.betType === "high" && num >= 19 && num <= 36)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
// //               if (bet.betType === "col_1" && num % 3 === 1)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
// //               if (bet.betType === "col_2" && num % 3 === 2)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
// //               if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
// //                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
// //             });

// //             if (payoutIfThisWins < bestPayout) {
// //               bestPayout = payoutIfThisWins;
// //               validNumbers = [num];
// //             } else if (payoutIfThisWins === bestPayout) {
// //               validNumbers.push(num);
// //             }
// //           }

// //           if (totalCollection === 0 || validNumbers.length === 0) {
// //             winningNumber = Math.floor(Math.random() * 37);
// //           } else {
// //             winningNumber =
// //               validNumbers[Math.floor(Math.random() * validNumbers.length)];
// //           }
// //         }
// //       }

// //       // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
// //       currentRound.winningNumber = winningNumber;
// //       currentRound.status = "closed";
// //       currentRound.resultProcessedAt = new Date();

// //       const isRedWin = RED_NUMBERS.includes(winningNumber);
// //       const isBlackWin = winningNumber !== 0 && !isRedWin;

// //       for (let i = 0; i < currentRound.bets.length; i++) {
// //         let bet = currentRound.bets[i];
// //         let isWin = false;
// //         let multiplier = 0;

// //         if (
// //           bet.betType === "number" &&
// //           bet.selection === String(winningNumber)
// //         ) {
// //           isWin = true;
// //           multiplier = settings.singleNumberMultiplier || 36;
// //         } else if (
// //           bet.betType === "odd" &&
// //           winningNumber !== 0 &&
// //           winningNumber % 2 !== 0
// //         ) {
// //           isWin = true;
// //           multiplier = settings.oddEvenMultiplier || 2;
// //         } else if (
// //           bet.betType === "even" &&
// //           winningNumber !== 0 &&
// //           winningNumber % 2 === 0
// //         ) {
// //           isWin = true;
// //           multiplier = settings.oddEvenMultiplier || 2;
// //         } else if (
// //           bet.betType === "1-12" &&
// //           winningNumber >= 1 &&
// //           winningNumber <= 12
// //         ) {
// //           isWin = true;
// //           multiplier = settings.dozenMultiplier || 3;
// //         } else if (
// //           bet.betType === "13-24" &&
// //           winningNumber >= 13 &&
// //           winningNumber <= 24
// //         ) {
// //           isWin = true;
// //           multiplier = settings.dozenMultiplier || 3;
// //         } else if (
// //           bet.betType === "25-36" &&
// //           winningNumber >= 25 &&
// //           winningNumber <= 36
// //         ) {
// //           isWin = true;
// //           multiplier = settings.dozenMultiplier || 3;
// //         } else if (bet.betType === "red" && isRedWin) {
// //           isWin = true;
// //           multiplier = settings.redBlackMultiplier || 2;
// //         } else if (bet.betType === "black" && isBlackWin) {
// //           isWin = true;
// //           multiplier = settings.redBlackMultiplier || 2;
// //         }
// //         // 🆕 নতুন বাজির উইন লজিক - অ্যাডমিন সেটিংস থেকে নিবে
// //         else if (
// //           bet.betType === "low" &&
// //           winningNumber >= 1 &&
// //           winningNumber <= 18
// //         ) {
// //           isWin = true;
// //           multiplier = settings.lowHighMultiplier || 2;
// //         } else if (
// //           bet.betType === "high" &&
// //           winningNumber >= 19 &&
// //           winningNumber <= 36
// //         ) {
// //           isWin = true;
// //           multiplier = settings.lowHighMultiplier || 2;
// //         } else if (bet.betType === "col_1" && winningNumber % 3 === 1) {
// //           isWin = true;
// //           multiplier = settings.columnMultiplier || 2;
// //         } else if (bet.betType === "col_2" && winningNumber % 3 === 2) {
// //           isWin = true;
// //           multiplier = settings.columnMultiplier || 2;
// //         } else if (
// //           bet.betType === "col_3" &&
// //           winningNumber % 3 === 0 &&
// //           winningNumber !== 0
// //         ) {
// //           isWin = true;
// //           multiplier = settings.columnMultiplier || 2;
// //         }

// //         if (isWin) {
// //           const winAmount = bet.amount * multiplier;
// //           bet.status = "win";
// //           bet.multiplier = multiplier;
// //           bet.payout = winAmount;
// //           await User.updateOne(
// //             { _id: bet.userId },
// //             { $inc: { balance: winAmount } },
// //           );
// //         } else {
// //           bet.status = "loss";
// //           bet.payout = 0;

// //           // 🆕 লস হলে ইউজারের লস ফিল্ডগুলো বাড়বে
// //           await User.updateOne(
// //             { _id: bet.userId },
// //             {
// //               $inc: {
// //                 monthlyLost: bet.amount,
// //                 weeklyLost: bet.amount,
// //                 totalLost: bet.amount,
// //               },
// //             },
// //           );
// //         }
// //       }
// //       await currentRound.save();

// //       // ৪. নতুন রাউন্ড শুরু করা (৩০ সেকেন্ড)
// //       const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
// //       const newEndTime = new Date(now.getTime() + 30000);

// //       currentRound = await GameRound.create({
// //         periodNumber: nextPeriodNumber,
// //         status: "active",
// //         endTime: newEndTime,
// //         totalBets: 0,
// //         bets: [],
// //       });
// //       console.log(
// //         `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
// //       );
// //     }

// //     // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে (৩০ সেকেন্ড)
// //     else if (!currentRound || !currentRound.endTime) {
// //       const newEndTime = new Date(now.getTime() + 30000);

// //       if (currentRound) {
// //         currentRound.endTime = newEndTime;
// //         await currentRound.save();
// //       } else {
// //         currentRound = await GameRound.create({
// //           periodNumber: "PER-10001",
// //           status: "active",
// //           endTime: newEndTime,
// //           totalBets: 0,
// //           bets: [],
// //         });
// //       }
// //     }

// //     // 🆕 টাইমার ক্যালকুলেশন
// //     const end = new Date(currentRound.endTime).getTime();
// //     const current = new Date().getTime();
// //     const diff = Math.max(0, Math.floor((end - current) / 1000));

// //     // ==========================================
// //     // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা
// //     // ==========================================
// //     let userResult = null;
// //     const token = req.cookies.get("token")?.value;

// //     if (token) {
// //       try {
// //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //         const identifier = decoded.uid || decoded.phone || decoded.userId;

// //         const userDoc = await User.findOne({
// //           $or: [{ uid: identifier }, { phone: identifier }],
// //         });

// //         if (userDoc) {
// //           const lastRound = await GameRound.findOne({ status: "closed" }).sort({
// //             resultProcessedAt: -1,
// //           });

// //           if (lastRound) {
// //             const userBet = lastRound.bets.find(
// //               (b) => b.userId.toString() === userDoc._id.toString(),
// //             );

// //             if (userBet) {
// //               userResult = {
// //                 status: userBet.status,
// //                 multiplier: userBet.multiplier,
// //                 payout: userBet.payout,
// //                 round: lastRound.periodNumber,
// //                 winningNumber: lastRound.winningNumber,
// //               };
// //             }
// //           }
// //         }
// //       } catch (err) {
// //         console.error("User result fetch error:", err);
// //       }
// //     }

// //     // 🆕 সর্বশেষ ১০টি রেজাল্ট বের করা
// //     const recentRounds = await GameRound.find({ status: "closed" })
// //       .sort({ resultProcessedAt: -1 })
// //       .limit(10)
// //       .select("winningNumber")
// //       .lean();

// //     const recentResults = recentRounds.map((r) => r.winningNumber);

// //     return NextResponse.json({
// //       success: true,
// //       periodNumber: currentRound.periodNumber,
// //       endTime: currentRound.endTime,
// //       timeLeft: diff,
// //       userResult: userResult,
// //       recentResults: recentResults,
// //     });
// //   } catch (error) {
// //     console.error("❌ State API Error:", error);
// //     return NextResponse.json(
// //       { success: false, message: error.message },
// //       { status: 500 },
// //     );
// //   }
// // }
// // //////////////////////////////////
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/db";
// import { GameRound } from "@/models/GameRound";
// import { GameSetting } from "@/models/GameSetting";
// import User from "@/models/User";

// // রুলেটের লাল নাম্বারগুলো
// const RED_NUMBERS = [
//   1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// ];

// export async function GET(req) {
//   try {
//     await dbConnect();

//     let currentRound = await GameRound.findOne({ status: "active" }).sort({
//       createdAt: -1,
//     });
//     const now = new Date();

//     // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
//     if (
//       currentRound &&
//       currentRound.endTime &&
//       now > new Date(currentRound.endTime)
//     ) {
//       console.log("⏰ Round time over, processing smart result for 0-36...");

//       const settings = (await GameSetting.findOne({})) || {
//         targetProfitPercent: 20,
//         forceMultiplier: null,
//         singleNumberMultiplier: 36,
//         oddEvenMultiplier: 2,
//         dozenMultiplier: 3,
//         redBlackMultiplier: 2,
//         lowHighMultiplier: 2, // 🆕 ডিফল্ট
//         columnMultiplier: 2, // 🆕 ডিফল্ট
//       };

//       const totalCollection = currentRound.totalBets;
//       let winningNumber = null;

//       // 🧠 স্মার্ট অ্যালগরিদম
//       if (
//         settings.forceMultiplier !== null &&
//         settings.forceMultiplier >= 0 &&
//         settings.forceMultiplier <= 36
//       ) {
//         winningNumber = settings.forceMultiplier;
//         await GameSetting.updateOne(
//           { _id: settings._id },
//           { $set: { forceMultiplier: null } },
//         );
//       } else {
//         const MULTIPLIERS = {
//           single: settings.singleNumberMultiplier || 36,
//           oddEven: settings.oddEvenMultiplier || 2,
//           dozen: settings.dozenMultiplier || 3,
//           redBlack: settings.redBlackMultiplier || 2,
//           lowHigh: settings.lowHighMultiplier || 2, // 🆕
//           column: settings.columnMultiplier || 2, // 🆕
//         };

//         if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
//           const targetProfit =
//             totalCollection * (settings.targetProfitPercent / 100);
//           const maxPayoutAllowed = totalCollection - targetProfit;
//           let validNumbers = [];

//           for (let num = 0; num <= 36; num++) {
//             let payoutIfThisWins = 0;
//             const isRed = RED_NUMBERS.includes(num);
//             const isBlack = num !== 0 && !isRed;

//             currentRound.bets.forEach((bet) => {
//               if (bet.betType === "number" && bet.selection === String(num))
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
//               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
//               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
//               if (bet.betType === "1-12" && num >= 1 && num <= 12)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
//               if (bet.betType === "13-24" && num >= 13 && num <= 24)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
//               if (bet.betType === "25-36" && num >= 25 && num <= 36)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
//               if (bet.betType === "red" && isRed)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
//               if (bet.betType === "black" && isBlack)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

//               // 🆕 নতুন বাজির হিসাব (১-১৮, ১৯-৩৬, ২:১)
//               if (bet.betType === "1-18" && num >= 1 && num <= 18)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
//               if (bet.betType === "19-36" && num >= 19 && num <= 36)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
//               if (bet.betType === "col_1" && num % 3 === 1)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
//               if (bet.betType === "col_2" && num % 3 === 2)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
//               if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
//             });

//             if (payoutIfThisWins <= maxPayoutAllowed) {
//               validNumbers.push(num);
//             }
//           }

//           if (validNumbers.length === 0) {
//             winningNumber = Math.floor(Math.random() * 37);
//           } else {
//             winningNumber =
//               validNumbers[Math.floor(Math.random() * validNumbers.length)];
//           }
//         } else {
//           let bestPayout = Infinity;
//           let validNumbers = [];

//           for (let num = 0; num <= 36; num++) {
//             let payoutIfThisWins = 0;
//             const isRed = RED_NUMBERS.includes(num);
//             const isBlack = num !== 0 && !isRed;

//             currentRound.bets.forEach((bet) => {
//               if (bet.betType === "number" && bet.selection === String(num))
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.single;
//               if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
//               if (bet.betType === "even" && num !== 0 && num % 2 === 0)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
//               if (bet.betType === "1-12" && num >= 1 && num <= 12)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
//               if (bet.betType === "13-24" && num >= 13 && num <= 24)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
//               if (bet.betType === "25-36" && num >= 25 && num <= 36)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
//               if (bet.betType === "red" && isRed)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
//               if (bet.betType === "black" && isBlack)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

//               // 🆕 নতুন বাজির হিসাব (১-১৮, ১৯-৩৬, ২:১)
//               if (bet.betType === "1-18" && num >= 1 && num <= 18)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
//               if (bet.betType === "19-36" && num >= 19 && num <= 36)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
//               if (bet.betType === "col_1" && num % 3 === 1)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
//               if (bet.betType === "col_2" && num % 3 === 2)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
//               if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
//                 payoutIfThisWins += bet.amount * MULTIPLIERS.column;
//             });

//             if (payoutIfThisWins < bestPayout) {
//               bestPayout = payoutIfThisWins;
//               validNumbers = [num];
//             } else if (payoutIfThisWins === bestPayout) {
//               validNumbers.push(num);
//             }
//           }

//           if (totalCollection === 0 || validNumbers.length === 0) {
//             winningNumber = Math.floor(Math.random() * 37);
//           } else {
//             winningNumber =
//               validNumbers[Math.floor(Math.random() * validNumbers.length)];
//           }
//         }
//       }

//       // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
//       currentRound.winningNumber = winningNumber;
//       currentRound.status = "closed";
//       currentRound.resultProcessedAt = new Date();

//       const isRedWin = RED_NUMBERS.includes(winningNumber);
//       const isBlackWin = winningNumber !== 0 && !isRedWin;

//       for (let i = 0; i < currentRound.bets.length; i++) {
//         let bet = currentRound.bets[i];
//         let isWin = false;
//         let multiplier = 0;

//         if (
//           bet.betType === "number" &&
//           bet.selection === String(winningNumber)
//         ) {
//           isWin = true;
//           multiplier = settings.singleNumberMultiplier || 36;
//         } else if (
//           bet.betType === "odd" &&
//           winningNumber !== 0 &&
//           winningNumber % 2 !== 0
//         ) {
//           isWin = true;
//           multiplier = settings.oddEvenMultiplier || 2;
//         } else if (
//           bet.betType === "even" &&
//           winningNumber !== 0 &&
//           winningNumber % 2 === 0
//         ) {
//           isWin = true;
//           multiplier = settings.oddEvenMultiplier || 2;
//         } else if (
//           bet.betType === "1-12" &&
//           winningNumber >= 1 &&
//           winningNumber <= 12
//         ) {
//           isWin = true;
//           multiplier = settings.dozenMultiplier || 3;
//         } else if (
//           bet.betType === "13-24" &&
//           winningNumber >= 13 &&
//           winningNumber <= 24
//         ) {
//           isWin = true;
//           multiplier = settings.dozenMultiplier || 3;
//         } else if (
//           bet.betType === "25-36" &&
//           winningNumber >= 25 &&
//           winningNumber <= 36
//         ) {
//           isWin = true;
//           multiplier = settings.dozenMultiplier || 3;
//         } else if (bet.betType === "red" && isRedWin) {
//           isWin = true;
//           multiplier = settings.redBlackMultiplier || 2;
//         } else if (bet.betType === "black" && isBlackWin) {
//           isWin = true;
//           multiplier = settings.redBlackMultiplier || 2;
//         }
//         // 🆕 নতুন বাজির উইন লজিক
//         else if (
//           bet.betType === "1-18" &&
//           winningNumber >= 1 &&
//           winningNumber <= 18
//         ) {
//           isWin = true;
//           multiplier = settings.lowHighMultiplier || 2;
//         } else if (
//           bet.betType === "19-36" &&
//           winningNumber >= 19 &&
//           winningNumber <= 36
//         ) {
//           isWin = true;
//           multiplier = settings.lowHighMultiplier || 2;
//         } else if (bet.betType === "col_1" && winningNumber % 3 === 1) {
//           isWin = true;
//           multiplier = settings.columnMultiplier || 2;
//         } else if (bet.betType === "col_2" && winningNumber % 3 === 2) {
//           isWin = true;
//           multiplier = settings.columnMultiplier || 2;
//         } else if (
//           bet.betType === "col_3" &&
//           winningNumber % 3 === 0 &&
//           winningNumber !== 0
//         ) {
//           isWin = true;
//           multiplier = settings.columnMultiplier || 2;
//         }

//         if (isWin) {
//           const winAmount = bet.amount * multiplier;
//           bet.status = "win";
//           bet.multiplier = multiplier;
//           bet.payout = winAmount;
//           await User.updateOne(
//             { _id: bet.userId },
//             { $inc: { balance: winAmount } },
//           );
//         } else {
//           bet.status = "loss";
//           bet.payout = 0;

//           // 🆕 লস হলে ইউজারের লস ফিল্ডগুলো বাড়বে
//           await User.updateOne(
//             { _id: bet.userId },
//             {
//               $inc: {
//                 monthlyLost: bet.amount,
//                 weeklyLost: bet.amount,
//                 totalLost: bet.amount,
//               },
//             },
//           );
//         }
//       }
//       await currentRound.save();

//       // ৪. নতুন রাউন্ড শুরু করা (৩০ সেকেন্ড)
//       const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
//       const newEndTime = new Date(now.getTime() + 30000);

//       currentRound = await GameRound.create({
//         periodNumber: nextPeriodNumber,
//         status: "active",
//         endTime: newEndTime,
//         totalBets: 0,
//         bets: [],
//       });
//       console.log(
//         `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
//       );
//     }

//     // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে (৩০ সেকেন্ড)
//     else if (!currentRound || !currentRound.endTime) {
//       const newEndTime = new Date(now.getTime() + 30000);

//       if (currentRound) {
//         currentRound.endTime = newEndTime;
//         await currentRound.save();
//       } else {
//         currentRound = await GameRound.create({
//           periodNumber: "PER-10001",
//           status: "active",
//           endTime: newEndTime,
//           totalBets: 0,
//           bets: [],
//         });
//       }
//     }

//     // 🆕 টাইমার ক্যালকুলেশন
//     const end = new Date(currentRound.endTime).getTime();
//     const current = new Date().getTime();
//     const diff = Math.max(0, Math.floor((end - current) / 1000));

//     // ==========================================
//     // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা
//     // ==========================================
//     let userResult = null;
//     const token = req.cookies.get("token")?.value;

//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const identifier = decoded.uid || decoded.phone || decoded.userId;

//         const userDoc = await User.findOne({
//           $or: [{ uid: identifier }, { phone: identifier }],
//         });

//         if (userDoc) {
//           const lastRound = await GameRound.findOne({ status: "closed" }).sort({
//             resultProcessedAt: -1,
//           });

//           if (lastRound) {
//             const userBet = lastRound.bets.find(
//               (b) => b.userId.toString() === userDoc._id.toString(),
//             );

//             if (userBet) {
//               userResult = {
//                 status: userBet.status,
//                 multiplier: userBet.multiplier,
//                 payout: userBet.payout,
//                 round: lastRound.periodNumber,
//                 winningNumber: lastRound.winningNumber,
//               };
//             }
//           }
//         }
//       } catch (err) {
//         console.error("User result fetch error:", err);
//       }
//     }

//     // 🆕 সর্বশেষ ১০টি রেজাল্ট বের করা
//     const recentRounds = await GameRound.find({ status: "closed" })
//       .sort({ resultProcessedAt: -1 })
//       .limit(10)
//       .select("winningNumber")
//       .lean();

//     const recentResults = recentRounds.map((r) => r.winningNumber);

//     return NextResponse.json({
//       success: true,
//       periodNumber: currentRound.periodNumber,
//       endTime: currentRound.endTime,
//       timeLeft: diff,
//       userResult: userResult,
//       recentResults: recentResults,
//     });
//   } catch (error) {
//     console.error("❌ State API Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 },
//     );
//   }
// }
// ////////////////////////////////////
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import { GameRound } from "@/models/GameRound";
import { GameSetting } from "@/models/GameSetting";
import User from "@/models/User";

// রুলেটের লাল নাম্বারগুলো
const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

export async function GET(req) {
  try {
    await dbConnect();

    let currentRound = await GameRound.findOne({ status: "active" }).sort({
      createdAt: -1,
    });
    const now = new Date();

    // ১. যদি রাউন্ড থাকে এবং তার সময় শেষ হয়ে যায়
    if (
      currentRound &&
      currentRound.endTime &&
      now > new Date(currentRound.endTime)
    ) {
      console.log("⏰ Round time over, processing smart result for 0-36...");

      const settings = (await GameSetting.findOne({})) || {
        targetProfitPercent: 20,
        forceMultiplier: null,
        singleNumberMultiplier: 36,
        oddEvenMultiplier: 2,
        dozenMultiplier: 3,
        redBlackMultiplier: 2,
        lowHighMultiplier: 2, // 🆕 ডিফল্ট
        columnMultiplier: 2, // 🆕 ডিফল্ট
      };

      const totalCollection = currentRound.totalBets;
      let winningNumber = null;

      // 🧠 স্মার্ট অ্যালগরিদম
      if (
        settings.forceMultiplier !== null &&
        settings.forceMultiplier >= 0 &&
        settings.forceMultiplier <= 36
      ) {
        winningNumber = settings.forceMultiplier;
        await GameSetting.updateOne(
          { _id: settings._id },
          { $set: { forceMultiplier: null } },
        );
      } else {
        const MULTIPLIERS = {
          single: settings.singleNumberMultiplier || 36,
          oddEven: settings.oddEvenMultiplier || 2,
          dozen: settings.dozenMultiplier || 3,
          redBlack: settings.redBlackMultiplier || 2,
          lowHigh: settings.lowHighMultiplier || 2, // 🆕
          column: settings.columnMultiplier || 2, // 🆕
        };

        if (settings.targetProfitPercent && settings.targetProfitPercent > 0) {
          const targetProfit =
            totalCollection * (settings.targetProfitPercent / 100);
          const maxPayoutAllowed = totalCollection - targetProfit;
          let validNumbers = [];

          for (let num = 0; num <= 36; num++) {
            let payoutIfThisWins = 0;
            const isRed = RED_NUMBERS.includes(num);
            const isBlack = num !== 0 && !isRed;

            currentRound.bets.forEach((bet) => {
              if (bet.betType === "number" && bet.selection === String(num))
                payoutIfThisWins += bet.amount * MULTIPLIERS.single;
              if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
                payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
              if (bet.betType === "even" && num !== 0 && num % 2 === 0)
                payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
              if (bet.betType === "1-12" && num >= 1 && num <= 12)
                payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
              if (bet.betType === "13-24" && num >= 13 && num <= 24)
                payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
              if (bet.betType === "25-36" && num >= 25 && num <= 36)
                payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
              if (bet.betType === "red" && isRed)
                payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
              if (bet.betType === "black" && isBlack)
                payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

              // 🆕 নতুন বাজির হিসাব (১-১৮, ১৯-৩৬, ২:১)
              if (bet.betType === "1-18" && num >= 1 && num <= 18)
                payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
              if (bet.betType === "19-36" && num >= 19 && num <= 36)
                payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
              if (bet.betType === "col_1" && num % 3 === 1)
                payoutIfThisWins += bet.amount * MULTIPLIERS.column;
              if (bet.betType === "col_2" && num % 3 === 2)
                payoutIfThisWins += bet.amount * MULTIPLIERS.column;
              if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
                payoutIfThisWins += bet.amount * MULTIPLIERS.column;
            });

            if (payoutIfThisWins <= maxPayoutAllowed) {
              validNumbers.push(num);
            }
          }

          if (validNumbers.length === 0) {
            // 🆕 টার্গেট প্রফিট পূরণ সম্ভব না হলে, সবচেয়ে কম পে-আউটের নাম্বার বেছে নেবে
            let lowestPayout = Infinity;
            let fallbackNumbers = [];

            for (let num = 0; num <= 36; num++) {
              let payoutIfThisWins = 0;
              const isRed = RED_NUMBERS.includes(num);
              const isBlack = num !== 0 && !isRed;

              currentRound.bets.forEach((bet) => {
                if (bet.betType === "number" && bet.selection === String(num))
                  payoutIfThisWins += bet.amount * MULTIPLIERS.single;
                if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
                if (bet.betType === "even" && num !== 0 && num % 2 === 0)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
                if (bet.betType === "1-12" && num >= 1 && num <= 12)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
                if (bet.betType === "13-24" && num >= 13 && num <= 24)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
                if (bet.betType === "25-36" && num >= 25 && num <= 36)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
                if (bet.betType === "red" && isRed)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
                if (bet.betType === "black" && isBlack)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

                if (bet.betType === "1-18" && num >= 1 && num <= 18)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
                if (bet.betType === "19-36" && num >= 19 && num <= 36)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
                if (bet.betType === "col_1" && num % 3 === 1)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.column;
                if (bet.betType === "col_2" && num % 3 === 2)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.column;
                if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
                  payoutIfThisWins += bet.amount * MULTIPLIERS.column;
              });

              if (payoutIfThisWins < lowestPayout) {
                lowestPayout = payoutIfThisWins;
                fallbackNumbers = [num];
              } else if (payoutIfThisWins === lowestPayout) {
                fallbackNumbers.push(num);
              }
            }

            winningNumber =
              fallbackNumbers[Math.floor(Math.random() * fallbackNumbers.length)];
          } else {
            winningNumber =
              validNumbers[Math.floor(Math.random() * validNumbers.length)];
          }
        } else {
          let bestPayout = Infinity;
          let validNumbers = [];

          for (let num = 0; num <= 36; num++) {
            let payoutIfThisWins = 0;
            const isRed = RED_NUMBERS.includes(num);
            const isBlack = num !== 0 && !isRed;

            currentRound.bets.forEach((bet) => {
              if (bet.betType === "number" && bet.selection === String(num))
                payoutIfThisWins += bet.amount * MULTIPLIERS.single;
              if (bet.betType === "odd" && num !== 0 && num % 2 !== 0)
                payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
              if (bet.betType === "even" && num !== 0 && num % 2 === 0)
                payoutIfThisWins += bet.amount * MULTIPLIERS.oddEven;
              if (bet.betType === "1-12" && num >= 1 && num <= 12)
                payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
              if (bet.betType === "13-24" && num >= 13 && num <= 24)
                payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
              if (bet.betType === "25-36" && num >= 25 && num <= 36)
                payoutIfThisWins += bet.amount * MULTIPLIERS.dozen;
              if (bet.betType === "red" && isRed)
                payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;
              if (bet.betType === "black" && isBlack)
                payoutIfThisWins += bet.amount * MULTIPLIERS.redBlack;

              if (bet.betType === "1-18" && num >= 1 && num <= 18)
                payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
              if (bet.betType === "19-36" && num >= 19 && num <= 36)
                payoutIfThisWins += bet.amount * MULTIPLIERS.lowHigh;
              if (bet.betType === "col_1" && num % 3 === 1)
                payoutIfThisWins += bet.amount * MULTIPLIERS.column;
              if (bet.betType === "col_2" && num % 3 === 2)
                payoutIfThisWins += bet.amount * MULTIPLIERS.column;
              if (bet.betType === "col_3" && num % 3 === 0 && num !== 0)
                payoutIfThisWins += bet.amount * MULTIPLIERS.column;
            });

            if (payoutIfThisWins < bestPayout) {
              bestPayout = payoutIfThisWins;
              validNumbers = [num];
            } else if (payoutIfThisWins === bestPayout) {
              validNumbers.push(num);
            }
          }

          if (totalCollection === 0 || validNumbers.length === 0) {
            winningNumber = Math.floor(Math.random() * 37);
          } else {
            winningNumber =
              validNumbers[Math.floor(Math.random() * validNumbers.length)];
          }
        }
      }

      // ৩. রাউন্ড ক্লোজ করা এবং টাকা বিতরণ
      currentRound.winningNumber = winningNumber;
      currentRound.status = "closed";
      currentRound.resultProcessedAt = new Date();

      const isRedWin = RED_NUMBERS.includes(winningNumber);
      const isBlackWin = winningNumber !== 0 && !isRedWin;

      for (let i = 0; i < currentRound.bets.length; i++) {
        let bet = currentRound.bets[i];
        let isWin = false;
        let multiplier = 0;

        if (
          bet.betType === "number" &&
          bet.selection === String(winningNumber)
        ) {
          isWin = true;
          multiplier = settings.singleNumberMultiplier || 36;
        } else if (
          bet.betType === "odd" &&
          winningNumber !== 0 &&
          winningNumber % 2 !== 0
        ) {
          isWin = true;
          multiplier = settings.oddEvenMultiplier || 2;
        } else if (
          bet.betType === "even" &&
          winningNumber !== 0 &&
          winningNumber % 2 === 0
        ) {
          isWin = true;
          multiplier = settings.oddEvenMultiplier || 2;
        } else if (
          bet.betType === "1-12" &&
          winningNumber >= 1 &&
          winningNumber <= 12
        ) {
          isWin = true;
          multiplier = settings.dozenMultiplier || 3;
        } else if (
          bet.betType === "13-24" &&
          winningNumber >= 13 &&
          winningNumber <= 24
        ) {
          isWin = true;
          multiplier = settings.dozenMultiplier || 3;
        } else if (
          bet.betType === "25-36" &&
          winningNumber >= 25 &&
          winningNumber <= 36
        ) {
          isWin = true;
          multiplier = settings.dozenMultiplier || 3;
        } else if (bet.betType === "red" && isRedWin) {
          isWin = true;
          multiplier = settings.redBlackMultiplier || 2;
        } else if (bet.betType === "black" && isBlackWin) {
          isWin = true;
          multiplier = settings.redBlackMultiplier || 2;
        }
        // 🆕 নতুন বাজির উইন লজিক
        else if (
          bet.betType === "1-18" &&
          winningNumber >= 1 &&
          winningNumber <= 18
        ) {
          isWin = true;
          multiplier = settings.lowHighMultiplier || 2;
        } else if (
          bet.betType === "19-36" &&
          winningNumber >= 19 &&
          winningNumber <= 36
        ) {
          isWin = true;
          multiplier = settings.lowHighMultiplier || 2;
        } else if (bet.betType === "col_1" && winningNumber % 3 === 1) {
          isWin = true;
          multiplier = settings.columnMultiplier || 2;
        } else if (bet.betType === "col_2" && winningNumber % 3 === 2) {
          isWin = true;
          multiplier = settings.columnMultiplier || 2;
        } else if (
          bet.betType === "col_3" &&
          winningNumber % 3 === 0 &&
          winningNumber !== 0
        ) {
          isWin = true;
          multiplier = settings.columnMultiplier || 2;
        }

        if (isWin) {
          const winAmount = bet.amount * multiplier;
          bet.status = "win";
          bet.multiplier = multiplier;
          bet.payout = winAmount;
          await User.updateOne(
            { _id: bet.userId },
            { $inc: { balance: winAmount } },
          );
        } else {
          bet.status = "loss";
          bet.payout = 0;

          // 🆕 লস হলে ইউজারের লস ফিল্ডগুলো বাড়বে
          await User.updateOne(
            { _id: bet.userId },
            {
              $inc: {
                monthlyLost: bet.amount,
                weeklyLost: bet.amount,
                totalLost: bet.amount,
              },
            },
          );
        }
      }
      await currentRound.save();

      // ৪. নতুন রাউন্ড শুরু করা (৩০ সেকেন্ড)
      const nextPeriodNumber = `PER-${Number(currentRound.periodNumber.split("-")[1]) + 1}`;
      const newEndTime = new Date(now.getTime() + 30000);

      currentRound = await GameRound.create({
        periodNumber: nextPeriodNumber,
        status: "active",
        endTime: newEndTime,
        totalBets: 0,
        bets: [],
      });
      console.log(
        `🆕 New Round: ${nextPeriodNumber} | Winner: ${winningNumber}`,
      );
    }

    // ২. যদি কোনো রাউন্ড না থাকে বা endTime ফাঁকা থাকে (৩০ সেকেন্ড)
    else if (!currentRound || !currentRound.endTime) {
      const newEndTime = new Date(now.getTime() + 30000);

      if (currentRound) {
        currentRound.endTime = newEndTime;
        await currentRound.save();
      } else {
        currentRound = await GameRound.create({
          periodNumber: "PER-10001",
          status: "active",
          endTime: newEndTime,
          totalBets: 0,
          bets: [],
        });
      }
    }

    // 🆕 টাইমার ক্যালকুলেশন
    const end = new Date(currentRound.endTime).getTime();
    const current = new Date().getTime();
    const diff = Math.max(0, Math.floor((end - current) / 1000));

    // ==========================================
    // 🆕 ইউজারের সর্বশেষ রেজাল্ট চেক করা
    // ==========================================
    let userResult = null;
    const token = req.cookies.get("token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const identifier = decoded.uid || decoded.phone || decoded.userId;

        const userDoc = await User.findOne({
          $or: [{ uid: identifier }, { phone: identifier }],
        });

        if (userDoc) {
          const lastRound = await GameRound.findOne({ status: "closed" }).sort({
            resultProcessedAt: -1,
          });

          if (lastRound) {
            const userBet = lastRound.bets.find(
              (b) => b.userId.toString() === userDoc._id.toString(),
            );

            if (userBet) {
              userResult = {
                status: userBet.status,
                multiplier: userBet.multiplier,
                payout: userBet.payout,
                round: lastRound.periodNumber,
                winningNumber: lastRound.winningNumber,
              };
            }
          }
        }
      } catch (err) {
        console.error("User result fetch error:", err);
      }
    }

    // 🆕 সর্বশেষ ১০টি রেজাল্ট বের করা
    const recentRounds = await GameRound.find({ status: "closed" })
      .sort({ resultProcessedAt: -1 })
      .limit(10)
      .select("winningNumber")
      .lean();

    const recentResults = recentRounds.map((r) => r.winningNumber);

    return NextResponse.json({
      success: true,
      periodNumber: currentRound.periodNumber,
      endTime: currentRound.endTime,
      timeLeft: diff,
      userResult: userResult,
      recentResults: recentResults,
    });
  } catch (error) {
    console.error("❌ State API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}