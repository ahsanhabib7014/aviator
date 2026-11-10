// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/db";
// import { CrashGameSetting } from "@/models/CrashGameSetting";
// import { CrashRound } from "@/models/CrashRound"; // 🆕 CrashRound ইমপোর্ট
// import User from "@/models/User";

// const generateNextRoundId = () => {
//   if (!global.crashRoundCounter) global.crashRoundCounter = 1000;
//   global.crashRoundCounter += 1;
//   return `CRASH-${global.crashRoundCounter}`;
// };

// if (!global.crashGameState) {
//   global.crashGameState = {
//     roundId: generateNextRoundId(),
//     status: "waiting",
//     multiplier: 1.0,
//     crashAt: 2.0,
//     nextRoundTime: Date.now() + 10000,
//     totalBetAmount: 0,
//     startTime: 0,
//     lastResult: null,
//   };
// }

// export async function GET(req) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json({ success: false, message: "লগইন করুন" }, { status: 401 });
//     }

//     try {
//       jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       return NextResponse.json({ success: false, message: "টোকেন অবৈধ" }, { status: 401 });
//     }

//     await dbConnect();
//     const state = global.crashGameState;
//     const now = Date.now();

//     if (state.status === "waiting" && now > state.nextRoundTime) {
//       const settings = (await CrashGameSetting.findOne({}).lean()) || { targetProfitPercent: 0, forceMultiplier: null };
//       state.status = "flying";
//       state.multiplier = 1.0;
//       state.startTime = now;
//       state.lastResult = null;

//       let finalCrashPoint = 1.0;
//       const forceVal = settings.forceMultiplier ? Number(settings.forceMultiplier) : null;

//       if (forceVal && forceVal > 0) {
//         finalCrashPoint = forceVal;
//         if (settings._id) await CrashGameSetting.updateOne({ _id: settings._id }, { $set: { forceMultiplier: null } });
//       } else {
//         const profitPercent = Number(settings.targetProfitPercent) || 0;
//         if (profitPercent === 0) {
//           const rand = Math.random();
//           if (rand < 0.15) finalCrashPoint = parseFloat((1.05 + Math.random() * 0.5).toFixed(2));
//           else if (rand < 0.65) finalCrashPoint = parseFloat((1.5 + Math.random() * 2.5).toFixed(2));
//           else if (rand < 0.90) finalCrashPoint = parseFloat((4.0 + Math.random() * 10).toFixed(2));
//           else finalCrashPoint = parseFloat((14.0 + Math.random() * 50).toFixed(2));
//         } else {
//           const totalCollection = state.totalBetAmount || 100;
//           const targetProfit = totalCollection * (profitPercent / 100);
//           const maxPayoutAllowed = totalCollection - targetProfit;
//           let randomMultiplier = parseFloat((Math.random() * 15 + 1.01).toFixed(2));
//           if ((totalCollection * randomMultiplier) <= maxPayoutAllowed) {
//             finalCrashPoint = randomMultiplier;
//           } else {
//             finalCrashPoint = Math.max(1.01, parseFloat((maxPayoutAllowed / totalCollection).toFixed(2)));
//           }
//         }
//       }
//       state.crashAt = finalCrashPoint;

//       try {
//         await CrashRound.findOneAndUpdate(
//           { periodNumber: state.roundId },
//           { $setOnInsert: { status: "active", totalBets: 0, bets: [], createdAt: new Date() } },
//           { upsert: true, new: true }
//         );
//       } catch (dbErr) {}
//     }
//     else if (state.status === "flying") {
//       const timePassed = (now - state.startTime) / 1000;
//       state.multiplier = parseFloat((1.00 + Math.pow(timePassed * 0.55, 1.45)).toFixed(2));

//       if (state.multiplier >= state.crashAt) {
//         state.status = "crashed";
//         state.nextRoundTime = now + 3200;

//         try {
//           const currentRound = await CrashRound.findOne({ periodNumber: state.roundId });
//           if (currentRound && currentRound.bets) {
//             let winMultiplier = 0;
//             let winAmountTotal = 0;

//             for (let bet of currentRound.bets) {
//               if (!bet.cashedOutAt) {
//                 await User.updateOne({ _id: bet.userId }, { $inc: { monthlyLost: bet.amount, weeklyLost: bet.amount, totalLost: bet.amount } });
//               } else {
//                 winMultiplier = bet.cashedOutAt;
//                 winAmountTotal += Number(bet.amount) * Number(bet.cashedOutAt);
//               }
//             }
//             currentRound.status = "closed";
//             currentRound.winningNumber = state.crashAt;
//             await currentRound.save();

//             state.lastResult = {
//               type: winMultiplier > 0 ? "win" : "loss",
//               multiplier: winMultiplier,
//               amount: winAmountTotal
//             };
//           }
//         } catch (err) {}
//       }
//     }
//     else if (state.status === "crashed" && now > state.nextRoundTime) {
//       state.status = "waiting";
//       state.multiplier = 1.0;
//       state.nextRoundTime = now + 10000;
//       state.totalBetAmount = 0;
//       state.roundId = generateNextRoundId();

//       try {
//         await CrashRound.findOneAndUpdate(
//           { periodNumber: state.roundId },
//           { $setOnInsert: { status: "waiting", totalBets: 0, bets: [], createdAt: new Date() } },
//           { upsert: true, new: true }
//         );
//       } catch (dbErr) {}
//     }

//     let liveBetsData = [];
//     let totalBetsCount = 0;
//     let totalBetsAmount = 0;

//     try {
//       const currentRound = await CrashRound.findOne({ periodNumber: state.roundId });
//       if (currentRound && currentRound.bets && currentRound.bets.length > 0) {
//         totalBetsCount = currentRound.bets.length;
//         totalBetsAmount = currentRound.bets.reduce((sum, b) => sum + Number(b.amount || 0), 0);

//         liveBetsData = currentRound.bets.map((b) => {
//           const phoneStr = String(b.phone || "01700000000");
//           return {
//             user: "****" + phoneStr.slice(-4),
//             bet: Number(b.amount || 0),
//             cashedOutAt: b.cashedOutAt || null,
//             payout: b.cashedOutAt ? (Number(b.amount) * b.cashedOutAt).toFixed(2) : null,
//           };
//         });
//       }
//     } catch (err) {
//       console.error("Live bets fetch error:", err);
//     }

//     let recentHistory = [];
//     try {
//       const pastRounds = await CrashRound.find({ status: "closed" })
//         .sort({ updatedAt: -1 })
//         .limit(15)
//         .select("winningNumber")
//         .lean();

//       recentHistory = pastRounds.map(r => Number(r.winningNumber)).filter(n => n > 0);
//     } catch (err) {
//       console.error("History fetch error:", err);
//     }

//     return NextResponse.json({
//       ...state,
//       bets: liveBetsData,
//       totalBetsCount: totalBetsCount,
//       totalBetsAmount: totalBetsAmount,
//       history: recentHistory
//     });

//   } catch (error) {
//     console.error("State API Error:", error);
//     return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
//   }
// }
// ////////////////////////////////////
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import { CrashGameSetting } from "@/models/CrashGameSetting";
import { CrashRound } from "@/models/CrashRound";
import User from "@/models/User";

const generateNextRoundId = () => {
  if (!global.crashRoundCounter) global.crashRoundCounter = 1000;
  global.crashRoundCounter += 1;
  return `CRASH-${global.crashRoundCounter}`;
};

if (!global.crashGameState) {
  global.crashGameState = {
    roundId: generateNextRoundId(),
    status: "waiting",
    multiplier: 1.0,
    crashAt: 2.0,
    nextRoundTime: Date.now() + 10000,
    totalBetAmount: 0,
    startTime: 0,
    lastResult: null,
  };
}

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "লগইন করুন" },
        { status: 401 },
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "টোকেন অবৈধ" },
        { status: 401 },
      );
    }

    await dbConnect();
    const state = global.crashGameState;
    const now = Date.now();

    // 🆕 চলতি রাউন্ডের মোট বেট বের করা (সেটিংসের জন্য)
    let liveBetsData = [];
    let totalBetsCount = 0;
    let totalBetsAmount = 0;

    try {
      const currentRound = await CrashRound.findOne({
        periodNumber: state.roundId,
      });
      if (currentRound && currentRound.bets && currentRound.bets.length > 0) {
        totalBetsCount = currentRound.bets.length;
        totalBetsAmount = currentRound.bets.reduce(
          (sum, b) => sum + Number(b.amount || 0),
          0,
        );

        liveBetsData = currentRound.bets.map((b) => {
          const phoneStr = String(b.phone || "01700000000");
          return {
            user: "****" + phoneStr.slice(-4),
            bet: Number(b.amount || 0),
            cashedOutAt: b.cashedOutAt || null,
            payout: b.cashedOutAt
              ? (Number(b.amount) * b.cashedOutAt).toFixed(2)
              : null,
          };
        });
      }
    } catch (err) {
      console.error("Live bets fetch error:", err);
    }

    if (state.status === "waiting" && now > state.nextRoundTime) {
      const settings = (await CrashGameSetting.findOne({}).lean()) || {
        targetProfitPercent: 0,
        forceMultiplier: null,
      };
      state.status = "flying";
      state.multiplier = 1.0;
      state.startTime = now;
      state.lastResult = null;

      let finalCrashPoint = 1.0;
      const forceVal = settings.forceMultiplier
        ? Number(settings.forceMultiplier)
        : null;

      if (forceVal && forceVal > 0) {
        finalCrashPoint = forceVal;
        if (settings._id)
          await CrashGameSetting.updateOne(
            { _id: settings._id },
            { $set: { forceMultiplier: null } },
          );
      } else {
        const profitPercent = Number(settings.targetProfitPercent) || 0;
        if (profitPercent === 0) {
          const rand = Math.random();
          if (rand < 0.15)
            finalCrashPoint = parseFloat(
              (1.05 + Math.random() * 0.5).toFixed(2),
            );
          else if (rand < 0.65)
            finalCrashPoint = parseFloat(
              (1.5 + Math.random() * 2.5).toFixed(2),
            );
          else if (rand < 0.9)
            finalCrashPoint = parseFloat((4.0 + Math.random() * 10).toFixed(2));
          else
            finalCrashPoint = parseFloat(
              (14.0 + Math.random() * 50).toFixed(2),
            );
        } else {
          // 🆕 ডাটাবেস থেকে পাওয়া totalBetsAmount ব্যবহার করা হলো
          const totalCollection = totalBetsAmount > 0 ? totalBetsAmount : 100;
          const targetProfit = totalCollection * (profitPercent / 100);
          const maxPayoutAllowed = totalCollection - targetProfit;
          let randomMultiplier = parseFloat(
            (Math.random() * 15 + 1.01).toFixed(2),
          );
          if (totalCollection * randomMultiplier <= maxPayoutAllowed) {
            finalCrashPoint = randomMultiplier;
          } else {
            finalCrashPoint = Math.max(
              1.01,
              parseFloat((maxPayoutAllowed / totalCollection).toFixed(2)),
            );
          }
        }
      }
      state.crashAt = finalCrashPoint;

      try {
        await CrashRound.findOneAndUpdate(
          { periodNumber: state.roundId },
          {
            $setOnInsert: {
              status: "active",
              totalBets: 0,
              bets: [],
              createdAt: new Date(),
            },
          },
          { upsert: true, new: true },
        );
      } catch (dbErr) {}
    } else if (state.status === "flying") {
      const timePassed = (now - state.startTime) / 1000;
      state.multiplier = parseFloat(
        (1.0 + Math.pow(timePassed * 0.55, 1.45)).toFixed(2),
      );

      if (state.multiplier >= state.crashAt) {
        state.status = "crashed";
        state.nextRoundTime = now + 3200;

        try {
          const currentRound = await CrashRound.findOne({
            periodNumber: state.roundId,
          });
          if (currentRound && currentRound.bets) {
            let winMultiplier = 0;
            let winAmountTotal = 0;

            for (let bet of currentRound.bets) {
              if (!bet.cashedOutAt) {
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
              } else {
                winMultiplier = bet.cashedOutAt;
                winAmountTotal += Number(bet.amount) * Number(bet.cashedOutAt);
              }
            }
            currentRound.status = "closed";
            currentRound.winningNumber = state.crashAt;
            await currentRound.save();

            state.lastResult = {
              type: winMultiplier > 0 ? "win" : "loss",
              multiplier: winMultiplier,
              amount: winAmountTotal,
            };
          }
        } catch (err) {}
      }
    } else if (state.status === "crashed" && now > state.nextRoundTime) {
      state.status = "waiting";
      state.multiplier = 1.0;
      state.nextRoundTime = now + 10000;
      state.totalBetAmount = 0;
      state.roundId = generateNextRoundId();

      try {
        await CrashRound.findOneAndUpdate(
          { periodNumber: state.roundId },
          {
            $setOnInsert: {
              status: "waiting",
              totalBets: 0,
              bets: [],
              createdAt: new Date(),
            },
          },
          { upsert: true, new: true },
        );
      } catch (dbErr) {}
    }

    let recentHistory = [];
    try {
      const pastRounds = await CrashRound.find({ status: "closed" })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("winningNumber")
        .lean();

      recentHistory = pastRounds
        .map((r) => Number(r.winningNumber))
        .filter((n) => n > 0);
    } catch (err) {
      console.error("History fetch error:", err);
    }

    return NextResponse.json({
      ...state,
      bets: liveBetsData,
      totalBetsCount: totalBetsCount,
      totalBetsAmount: totalBetsAmount,
      history: recentHistory,
    });
  } catch (error) {
    console.error("State API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
