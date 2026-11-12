// require("dotenv").config();
// const { createServer } = require("http");
// const { parse } = require("url");
// const next = require("next");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

// const User = require("./models/User").default || require("./models/User");
// const { CrashRound } = require("./models/CrashRound");
// const { CrashGameSetting } = require("./models/CrashGameSetting");

// const dev = process.env.NODE_ENV !== "production";
// const hostname = "0.0.0.0";
// const port = parseInt(process.env.PORT || "3000", 10);
// const app = next({ dev, hostname, port });
// const handle = app.getRequestHandler();

// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/aviator";
// mongoose
//   .connect(MONGODB_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// app.prepare().then(() => {
//   const server = createServer((req, res) => {
//     const parsedUrl = parse(req.url, true);
//     handle(req, res, parsedUrl);
//   });

//   const io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_ORIGIN || "https://mitupay.tech",
//       credentials: true,
//     },
//   });

//   // 🆕 গেমের গ্লোবাল স্টেট
//   let roundCounter = 1001;
//   let gameState = null;

//   const initializeGameState = async () => {
//     try {
//       const lastRound = await CrashRound.findOne().sort({ createdAt: -1 });
//       if (lastRound && lastRound.periodNumber) {
//         const lastNum = parseInt(lastRound.periodNumber.split("-")[1]);
//         if (!isNaN(lastNum)) {
//           roundCounter = lastNum + 1;
//           console.log(`🔄 Resuming from Round: CRASH-${roundCounter}`);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching last round:", err);
//     }

//     gameState = {
//       roundId: `CRASH-${roundCounter}`,
//       status: "waiting",
//       multiplier: 1.0,
//       crashAt: 2.0,
//       nextRoundTime: Date.now() + 10000,
//       startTime: 0,
//       totalBetsAmount: 0,
//       bets: [],
//     };
//   };

//   initializeGameState();

//   let history = [];

//   const getUserFromToken = async (token) => {
//     if (!token) return null;
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const identifier = decoded.uid || decoded.phone || decoded.userId;
//       return await User.findOne({
//         $or: [{ uid: identifier }, { phone: identifier }],
//       });
//     } catch (err) {
//       return null;
//     }
//   };

//   io.on("connection", (socket) => {
//     console.log("✅ Socket Connected:", socket.id);

//     const cookieString = socket.handshake.headers.cookie || "";
//     const cookies = cookieString.split(";").reduce((acc, cookie) => {
//       const [key, value] = cookie.trim().split("=");
//       if (key && value) acc[key] = decodeURIComponent(value);
//       return acc;
//     }, {});

//     const userToken = cookies["token"] || null;

//     if (!gameState) {
//       socket.emit("betError", { message: "গেম লোড হচ্ছে, অপেক্ষা করুন..." });
//       return;
//     }

//     socket.emit("gameState", {
//       ...gameState,
//       history,
//       serverTime: Date.now(),
//     });

//     // 🆕 ক্লায়েন্ট থেকে বেট আসলে
//     socket.on("placeBet", async (data) => {
//       try {
//         if (
//           gameState.status !== "waiting" ||
//           Date.now() > gameState.nextRoundTime
//         ) {
//           return socket.emit("betError", { message: "বেট ধরার সময় শেষ!" });
//         }

//         const user = await getUserFromToken(userToken);
//         if (!user)
//           return socket.emit("betError", {
//             message: "ইউজার পাওয়া যায়নি, আবার লগইন করুন",
//           });

//         const amount = Number(data.amount);
//         const slot = Number(data.slot) || 1;

//         if (amount <= 0)
//           return socket.emit("betError", { message: "সঠিক পরিমাণ দিন", slot });
//         if (user.balance < amount)
//           return socket.emit("betError", {
//             message: "পর্যাপ্ত ব্যালেন্স নেই!",
//             slot,
//           });

//         let currentRound = await CrashRound.findOne({
//           periodNumber: gameState.roundId,
//         });
//         if (!currentRound) {
//           currentRound = await CrashRound.create({
//             periodNumber: gameState.roundId,
//             status: "active",
//             totalBets: 0,
//             bets: [],
//           });
//         }

//         const updatedRound = await CrashRound.findOneAndUpdate(
//           {
//             periodNumber: gameState.roundId,
//             bets: { $not: { $elemMatch: { userId: user._id, slot: slot } } },
//           },
//           {
//             $push: {
//               bets: {
//                 userId: user._id,
//                 phone: user.phone || "01700000000",
//                 amount: amount,
//                 slot: slot,
//                 cashedOutAt: null,
//               },
//             },
//           },
//           { returnDocument: "after" },
//         );

//         if (!updatedRound) {
//           return socket.emit("betError", {
//             message: `স্লট ${slot} এ ইতিমধ্যে বেট দেওয়া হয়েছে!`,
//             slot,
//           });
//         }

//         const updatedUser = await User.findOneAndUpdate(
//           { _id: user._id, balance: { $gte: amount } },
//           { $inc: { balance: -amount, turnover: -amount } },
//           { returnDocument: "after" },
//         );
//         if (!updatedUser) {
//           await CrashRound.updateOne(
//             { periodNumber: gameState.roundId },
//             { $pull: { bets: { userId: user._id, slot: slot } } },
//           );
//           return socket.emit("betError", {
//             message: "পর্যাপ্ত ব্যালেন্স নেই!",
//             slot,
//           });
//         }

//         gameState.bets.push({
//           userId: user._id.toString(),
//           phone: user.phone || "01700000000",
//           amount: amount,
//           slot: slot,
//           cashedOutAt: null,
//         });
//         gameState.totalBetsAmount += amount;

//         socket.emit("betSuccess", {
//           message: `৳${amount} বেট সফল হয়েছে! (স্লট ${slot})`,
//           newBalance: updatedUser.balance,
//           slot,
//         });
//         io.emit("gameState", {
//           ...gameState,
//           history,
//           serverTime: Date.now(),
//         });
//       } catch (err) {
//         console.error("Bet Error:", err);
//         socket.emit("betError", { message: "সার্ভার এরর" });
//       }
//     });

//     // 🆕 ক্যাশআউট
//     socket.on("cashout", async (data) => {
//       try {
//         if (gameState.status !== "flying") {
//           return socket.emit("cashoutError", {
//             message: "ক্যাশআউট করার সময় হয়নি!",
//           });
//         }

//         const user = await getUserFromToken(userToken);
//         if (!user)
//           return socket.emit("cashoutError", {
//             message: "ইউজার পাওয়া যায়নি",
//             slot: data.slot,
//           });

//         const slot = Number(data.slot) || 1;

//         const bet = gameState.bets.find(
//           (b) =>
//             b.userId === user._id.toString() &&
//             b.cashedOutAt === null &&
//             b.slot === slot,
//         );
//         if (!bet)
//           return socket.emit("cashoutError", {
//             message: `স্লট ${slot} এ ক্যাশআউট করার মত কোনো বেট নেই!`,
//             slot,
//           });

//         const serverMultiplier = gameState.multiplier;
//         const clientMultiplier =
//           Number(data?.targetMultiplier) || serverMultiplier;

//         let finalMultiplier = serverMultiplier;

//         if (clientMultiplier > 1.0 && clientMultiplier <= serverMultiplier) {
//           finalMultiplier = clientMultiplier;
//         }

//         const winAmount = Number((bet.amount * finalMultiplier).toFixed(2));

//         const updateResult = await CrashRound.updateOne(
//           { periodNumber: gameState.roundId },
//           { $set: { "bets.$[elem].cashedOutAt": finalMultiplier } },
//           {
//             arrayFilters: [
//               {
//                 "elem.userId": user._id,
//                 "elem.slot": slot,
//                 "elem.cashedOutAt": null,
//               },
//             ],
//           },
//         );

//         if (updateResult.modifiedCount === 0) {
//           return socket.emit("cashoutError", {
//             message: `স্লট ${slot} এ ইতিমধ্যে ক্যাশআউট করা হয়েছে!`,
//             slot,
//           });
//         }

//         const updatedUser = await User.findOneAndUpdate(
//           {
//             _id: user._id,
//             balance: { $gte: 0 },
//           },
//           { $inc: { balance: winAmount } },
//           { returnDocument: "after" },
//         );

//         bet.cashedOutAt = finalMultiplier;

//         socket.emit("cashoutSuccess", {
//           message: `৳${winAmount} ক্যাশআউট সফল! (স্লট ${slot})`,
//           newBalance: updatedUser.balance,
//           multiplier: finalMultiplier,
//           winAmount,
//           slot,
//         });
//         io.emit("gameState", {
//           ...gameState,
//           history,
//           serverTime: Date.now(),
//         });
//       } catch (err) {
//         console.error("Cashout Error:", err);
//         socket.emit("cashoutError", { message: "সার্ভার এরর" });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Socket Disconnected:", socket.id);
//     });
//   });

//   // 🆕 মূল গেম লুপ
//   setInterval(async () => {
//     if (!gameState) return;

//     const now = Date.now();

//     if (gameState.status === "waiting" && now > gameState.nextRoundTime) {
//       gameState.status = "flying";
//       gameState.multiplier = 1.0;
//       gameState.startTime = now;

//       try {
//         const settings = (await CrashGameSetting.findOne({}).lean()) || {
//           targetProfitPercent: 0,
//           forceMultiplier: null,
//         };

//         let finalCrashPoint = 2.0;
//         const forceVal = settings.forceMultiplier
//           ? Number(settings.forceMultiplier)
//           : null;

//         if (forceVal && forceVal > 0) {
//           finalCrashPoint = forceVal;
//           if (settings._id) {
//             await CrashGameSetting.updateOne(
//               { _id: settings._id },
//               { $set: { forceMultiplier: null } },
//             );
//           }
//         } else {
//           const profitPercent = Number(settings.targetProfitPercent) || 0;
//           if (profitPercent === 0) {
//             const rand = Math.random();
//             if (rand < 0.15)
//               finalCrashPoint = parseFloat(
//                 (1.05 + Math.random() * 0.5).toFixed(2),
//               );
//             else if (rand < 0.65)
//               finalCrashPoint = parseFloat(
//                 (1.5 + Math.random() * 2.5).toFixed(2),
//               );
//             else if (rand < 0.9)
//               finalCrashPoint = parseFloat(
//                 (4.0 + Math.random() * 10).toFixed(2),
//               );
//             else
//               finalCrashPoint = parseFloat(
//                 (14.0 + Math.random() * 50).toFixed(2),
//               );
//           } else {
//             const totalCollection =
//               gameState.bets.reduce(
//                 (sum, b) => sum + Number(b.amount || 0),
//                 0,
//               ) || 100;
//             const targetProfit = totalCollection * (profitPercent / 100);
//             const maxPayoutAllowed = totalCollection - targetProfit;
//             let randomMultiplier = parseFloat(
//               (Math.random() * 15 + 1.01).toFixed(2),
//             );
//             if (totalCollection * randomMultiplier <= maxPayoutAllowed) {
//               finalCrashPoint = randomMultiplier;
//             } else {
//               finalCrashPoint = Math.max(
//                 1.01,
//                 parseFloat((maxPayoutAllowed / totalCollection).toFixed(2)),
//               );
//             }
//           }
//         }
//         gameState.crashAt = finalCrashPoint;
//       } catch (err) {
//         console.error("Settings Error:", err);
//         gameState.crashAt = parseFloat((Math.random() * 10 + 1.5).toFixed(2));
//       }

//       io.emit("gameState", {
//         ...gameState,
//         history,
//         serverTime: Date.now(),
//       });
//     } else if (gameState.status === "flying") {
//       const timePassed = (now - gameState.startTime) / 1000;
//       gameState.multiplier = parseFloat(
//         (1.0 + Math.pow(timePassed * 0.55, 1.45)).toFixed(2),
//       );

//       if (gameState.multiplier >= gameState.crashAt) {
//         gameState.multiplier = gameState.crashAt;
//         gameState.status = "crashed";
//         gameState.nextRoundTime = now + 3200;

//         try {
//           await CrashRound.findOneAndUpdate(
//             { periodNumber: gameState.roundId },
//             {
//               $set: {
//                 status: "closed",
//                 winningNumber: gameState.crashAt,
//               },
//             },
//           );
//         } catch (err) {
//           console.error("Round Close Error:", err);
//         }

//         history.unshift(gameState.crashAt);
//         if (history.length > 20) history.pop();

//         io.emit("gameState", {
//           ...gameState,
//           history,
//           serverTime: Date.now(),
//         });

//         setTimeout(() => {
//           gameState.status = "waiting";
//           gameState.multiplier = 1.0;
//           gameState.nextRoundTime = Date.now() + 10000;
//           gameState.startTime = 0;

//           roundCounter += 1;
//           gameState.roundId = `CRASH-${roundCounter}`;

//           gameState.totalBetsAmount = 0;
//           gameState.bets = [];
//           io.emit("gameState", {
//             ...gameState,
//             history,
//             serverTime: Date.now(),
//           });
//         }, 3200);
//       } else {
//         io.emit("gameState", {
//           ...gameState,
//           history,
//           serverTime: Date.now(),
//         });
//       }
//     }
//   }, 50);

//   // 🆕 MongoDB Change Stream — ContactMessage পরিবর্তনে সকেট সিগন্যাল
//   try {
//     const contactChangeStream = mongoose.connection
//       .collection("contactmessages")
//       .watch([], { fullDocument: "updateLookup" });

//     contactChangeStream.on("change", (change) => {
//       console.log("📢 ContactMessage Changed:", change.operationType);
//       io.emit("contactTicketUpdated");
//     });

//     contactChangeStream.on("error", (err) => {
//       console.error("❌ Contact Change Stream Error:", err);
//     });

//     console.log("✅ Contact Change Stream Started");
//   } catch (err) {
//     console.error("❌ Change Stream Failed:", err.message);
//   }

//   server.listen(port, (err) => {
//     if (err) throw err;
//     console.log(`> Ready on http://${hostname}:${port}`);
//   });
// });
// ///////////////////////////////////////////////
require("dotenv").config();
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("./models/User").default || require("./models/User");
const { CrashRound } = require("./models/CrashRound");
const { CrashGameSetting } = require("./models/CrashGameSetting");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/aviator";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "https://mitupay.tech",
      credentials: true,
    },
  });

  // 🆕 গেমের গ্লোবাল স্টেট
  let roundCounter = 1001;
  let gameState = null;

  const initializeGameState = async () => {
    try {
      const lastRound = await CrashRound.findOne().sort({ createdAt: -1 });
      if (lastRound && lastRound.periodNumber) {
        const lastNum = parseInt(lastRound.periodNumber.split("-")[1]);
        if (!isNaN(lastNum)) {
          roundCounter = lastNum + 1;
          console.log(`🔄 Resuming from Round: CRASH-${roundCounter}`);
        }
      }
    } catch (err) {
      console.error("Error fetching last round:", err);
    }

    gameState = {
      roundId: `CRASH-${roundCounter}`,
      status: "waiting",
      multiplier: 1.0,
      crashAt: 2.0,
      nextRoundTime: Date.now() + 10000,
      startTime: 0,
      totalBetsAmount: 0,
      bets: [],
    };
  };

  initializeGameState();

  let history = [];

  const getUserFromToken = async (token) => {
    if (!token) return null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const identifier = decoded.uid || decoded.phone || decoded.userId;
      return await User.findOne({
        $or: [{ uid: identifier }, { phone: identifier }],
      });
    } catch (err) {
      return null;
    }
  };

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    const cookieString = socket.handshake.headers.cookie || "";
    const cookies = cookieString.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

    const userToken = cookies["token"] || null;

    if (!gameState) {
      socket.emit("betError", { message: "গেম লোড হচ্ছে, অপেক্ষা করুন..." });
      return;
    }

    socket.emit("gameState", {
      ...gameState,
      history,
      serverTime: Date.now(),
    });

    // 🆕 ক্লায়েন্ট থেকে বেট আসলে
    socket.on("placeBet", async (data) => {
      try {
        if (
          gameState.status !== "waiting" ||
          Date.now() > gameState.nextRoundTime
        ) {
          return socket.emit("betError", { message: "বেট ধরার সময় শেষ!" });
        }

        const user = await getUserFromToken(userToken);
        if (!user)
          return socket.emit("betError", {
            message: "ইউজার পাওয়া যায়নি, আবার লগইন করুন",
          });

        const amount = Number(data.amount);
        const slot = Number(data.slot) || 1;

        if (amount <= 0)
          return socket.emit("betError", { message: "সঠিক পরিমাণ দিন", slot });
        if (user.balance < amount)
          return socket.emit("betError", {
            message: "পর্যাপ্ত ব্যালেন্স নেই!",
            slot,
          });

        let currentRound = await CrashRound.findOne({
          periodNumber: gameState.roundId,
        });
        if (!currentRound) {
          currentRound = await CrashRound.create({
            periodNumber: gameState.roundId,
            status: "active",
            totalBets: 0,
            bets: [],
          });
        }

        const updatedRound = await CrashRound.findOneAndUpdate(
          {
            periodNumber: gameState.roundId,
            bets: { $not: { $elemMatch: { userId: user._id, slot: slot } } },
          },
          {
            $push: {
              bets: {
                userId: user._id,
                phone: user.phone || "01700000000",
                amount: amount,
                slot: slot,
                cashedOutAt: null,
              },
            },
          },
          { returnDocument: "after" },
        );

        if (!updatedRound) {
          return socket.emit("betError", {
            message: `স্লট ${slot} এ ইতিমধ্যে বেট দেওয়া হয়েছে!`,
            slot,
          });
        }

        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id, balance: { $gte: amount } },
          { $inc: { balance: -amount, turnover: -amount } },
          { returnDocument: "after" },
        );
        if (!updatedUser) {
          await CrashRound.updateOne(
            { periodNumber: gameState.roundId },
            { $pull: { bets: { userId: user._id, slot: slot } } },
          );
          return socket.emit("betError", {
            message: "পর্যাপ্ত ব্যালেন্স নেই!",
            slot,
          });
        }

        gameState.bets.push({
          userId: user._id.toString(),
          phone: user.phone || "01700000000",
          amount: amount,
          slot: slot,
          cashedOutAt: null,
        });
        gameState.totalBetsAmount += amount;

        socket.emit("betSuccess", {
          message: `৳${amount} বেট সফল হয়েছে! (স্লট ${slot})`,
          newBalance: updatedUser.balance,
          slot,
        });
        io.emit("gameState", {
          ...gameState,
          history,
          serverTime: Date.now(),
        });
      } catch (err) {
        console.error("Bet Error:", err);
        socket.emit("betError", { message: "সার্ভার এরর" });
      }
    });

    // 🆕 ক্যাশআউট
    socket.on("cashout", async (data) => {
      try {
        if (gameState.status !== "flying") {
          return socket.emit("cashoutError", {
            message: "ক্যাশআউট করার সময় হয়নি!",
          });
        }

        const user = await getUserFromToken(userToken);
        if (!user)
          return socket.emit("cashoutError", {
            message: "ইউজার পাওয়া যায়নি",
            slot: data.slot,
          });

        const slot = Number(data.slot) || 1;

        const bet = gameState.bets.find(
          (b) =>
            b.userId === user._id.toString() &&
            b.cashedOutAt === null &&
            b.slot === slot,
        );
        if (!bet)
          return socket.emit("cashoutError", {
            message: `স্লট ${slot} এ ক্যাশআউট করার মত কোনো বেট নেই!`,
            slot,
          });

        const serverMultiplier = gameState.multiplier;
        const clientMultiplier =
          Number(data?.targetMultiplier) || serverMultiplier;

        let finalMultiplier = serverMultiplier;

        if (clientMultiplier > 1.0 && clientMultiplier <= serverMultiplier) {
          finalMultiplier = clientMultiplier;
        }

        const winAmount = Number((bet.amount * finalMultiplier).toFixed(2));

        const updateResult = await CrashRound.updateOne(
          { periodNumber: gameState.roundId },
          { $set: { "bets.$[elem].cashedOutAt": finalMultiplier } },
          {
            arrayFilters: [
              {
                "elem.userId": user._id,
                "elem.slot": slot,
                "elem.cashedOutAt": null,
              },
            ],
          },
        );

        if (updateResult.modifiedCount === 0) {
          return socket.emit("cashoutError", {
            message: `স্লট ${slot} এ ইতিমধ্যে ক্যাশআউট করা হয়েছে!`,
            slot,
          });
        }

        const updatedUser = await User.findOneAndUpdate(
          {
            _id: user._id,
            balance: { $gte: 0 },
          },
          { $inc: { balance: winAmount } },
          { returnDocument: "after" },
        );

        bet.cashedOutAt = finalMultiplier;

        socket.emit("cashoutSuccess", {
          message: `৳${winAmount} ক্যাশআউট সফল! (স্লট ${slot})`,
          newBalance: updatedUser.balance,
          multiplier: finalMultiplier,
          winAmount,
          slot,
        });
        io.emit("gameState", {
          ...gameState,
          history,
          serverTime: Date.now(),
        });
      } catch (err) {
        console.error("Cashout Error:", err);
        socket.emit("cashoutError", { message: "সার্ভার এরর" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);
    });
  });

  // 🆕 মূল গেম লুপ
  setInterval(async () => {
    if (!gameState) return;

    const now = Date.now();

    if (gameState.status === "waiting" && now > gameState.nextRoundTime) {
      gameState.status = "flying";
      gameState.multiplier = 1.0;
      gameState.startTime = now;

      try {
        const settings = (await CrashGameSetting.findOne({}).lean()) || {
          targetProfitPercent: 0,
          forceMultiplier: null,
        };

        let finalCrashPoint = 2.0;
        const forceVal = settings.forceMultiplier
          ? Number(settings.forceMultiplier)
          : null;

        if (forceVal && forceVal > 0) {
          finalCrashPoint = forceVal;
          if (settings._id) {
            await CrashGameSetting.updateOne(
              { _id: settings._id },
              { $set: { forceMultiplier: null } },
            );
          }
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
              finalCrashPoint = parseFloat(
                (4.0 + Math.random() * 10).toFixed(2),
              );
            else
              finalCrashPoint = parseFloat(
                (14.0 + Math.random() * 50).toFixed(2),
              );
          } else {
            const totalCollection =
              gameState.bets.reduce(
                (sum, b) => sum + Number(b.amount || 0),
                0,
              ) || 100;
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
        gameState.crashAt = finalCrashPoint;
      } catch (err) {
        console.error("Settings Error:", err);
        gameState.crashAt = parseFloat((Math.random() * 10 + 1.5).toFixed(2));
      }

      io.emit("gameState", {
        ...gameState,
        history,
        serverTime: Date.now(),
      });
    } else if (gameState.status === "flying") {
      const timePassed = (now - gameState.startTime) / 1000;
      gameState.multiplier = parseFloat(
        (1.0 + Math.pow(timePassed * 0.55, 1.45)).toFixed(2),
      );

      if (gameState.multiplier >= gameState.crashAt) {
        gameState.multiplier = gameState.crashAt;
        gameState.status = "crashed";
        gameState.nextRoundTime = now + 3200;

        try {
          await CrashRound.findOneAndUpdate(
            { periodNumber: gameState.roundId },
            {
              $set: {
                status: "closed",
                winningNumber: gameState.crashAt,
              },
            },
          );
        } catch (err) {
          console.error("Round Close Error:", err);
        }

        history.unshift(gameState.crashAt);
        if (history.length > 20) history.pop();

        io.emit("gameState", {
          ...gameState,
          history,
          serverTime: Date.now(),
        });

        setTimeout(() => {
          gameState.status = "waiting";
          gameState.multiplier = 1.0;
          gameState.nextRoundTime = Date.now() + 10000;
          gameState.startTime = 0;

          roundCounter += 1;
          gameState.roundId = `CRASH-${roundCounter}`;

          gameState.totalBetsAmount = 0;
          gameState.bets = [];
          io.emit("gameState", {
            ...gameState,
            history,
            serverTime: Date.now(),
          });
        }, 3200);
      } else {
        io.emit("gameState", {
          ...gameState,
          history,
          serverTime: Date.now(),
        });
      }
    }
  }, 50);

  // MongoDB Change Stream — ContactMessage পরিবর্তনে socket signal
  const startContactChangeStream = async () => {
    try {
      await mongoose.connection.asPromise();

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("MongoDB database is not ready");
      }

      const contactChangeStream = db
        .collection("contactmessages")
        .watch([], { fullDocument: "updateLookup" });

      contactChangeStream.on("change", (change) => {
        console.log("📢 ContactMessage Changed:", change.operationType);
        io.emit("contactTicketUpdated");
      });

      contactChangeStream.on("error", (err) => {
        console.error("❌ Contact Change Stream Error:", err);
      });

      contactChangeStream.on("close", () => {
        console.warn("⚠️ Contact Change Stream Closed");
      });

      console.log("✅ Contact Change Stream Started");
    } catch (err) {
      console.error("❌ Contact Change Stream Failed:", err.message);
    }
  };

  startContactChangeStream();

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
