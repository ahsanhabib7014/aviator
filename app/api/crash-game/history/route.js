import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import { CrashRound } from "@/models/CrashRound"; // 🆕 CrashRound ইমপোর্ট

export async function GET(req) {
  try {
    await dbConnect();
    
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "লগইন করুন" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, message: "টোকেন অবৈধ" }, { status: 401 });
    }
    
    const pastRounds = await CrashRound.find({ status: "closed" })
      .sort({ updatedAt: -1 })
      .limit(15)
      .select("winningNumber")
      .lean();
      
    const history = pastRounds.map(r => Number(r.winningNumber)).filter(n => n > 0);

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}