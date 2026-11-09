import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import { GameRound } from "@/models/GameRound";
import { verifyAuth } from "@/utils/authCheck";
import User from "@/models/User"; // 🆕 ইউজার মডেল
import jwt from "jsonwebtoken"; // 🆕 টোকেন ভেরিফাই

export async function GET(req) {
  try {
    await dbConnect();

    // 🆕 টোকেন থেকে ইউজার চেক করা
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

    // 🆕 পারমিশন চেক: অ্যাডমিন, সাব-অ্যাডমিন, এজেন্ট অথবা LIVE_STATS পারমিশন থাকতে হবে
    const hasPermission =
      user.role === "admin" ||
      user.role === "sub-admin" ||
      user.role === "agent" ||
      user.permissions?.includes("LIVE_STATS");

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "অননুমোদিত" },
        { status: 403 },
      );
    }

    const currentRound = await GameRound.findOne({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();
    const lastRound = await GameRound.findOne({ status: "closed" })
      .sort({ resultProcessedAt: -1 })
      .lean();

    if (!currentRound) {
      return NextResponse.json({ success: true, data: null });
    }

    // নতুন রুলেট গেমের জন্য ডেটা ফরম্যাট
    const betsByType = { odd: 0, even: 0, "1-12": 0, "13-24": 0, "25-36": 0 };
    const betsByNumber = {};
    for (let i = 1; i <= 36; i++) betsByNumber[i] = 0;

    currentRound.bets.forEach((b) => {
      if (b.betType === "number") {
        betsByNumber[b.selection] = (betsByNumber[b.selection] || 0) + b.amount;
      } else {
        betsByType[b.betType] = (betsByType[b.betType] || 0) + b.amount;
      }
    });

    // ইউনিক ইউজার কাউন্ট (একজন ইউজার একাধিক বাজি ধরলেও সে একবারই গণ্য হবে)
    const uniqueUsers = new Set(
      currentRound.bets.map((b) => b.userId.toString()),
    ).size;

    let lastResult = null;
    if (lastRound) {
      lastResult = {
        periodNumber: lastRound.periodNumber,
        winningNumber: lastRound.winningNumber || "N/A",
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        periodNumber: currentRound.periodNumber,
        totalBets: currentRound.totalBets,
        totalUsers: uniqueUsers,
        betsByType,
        betsByNumber,
        lastResult,
      },
    });
  } catch (error) {
    console.error("Live Stats API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
