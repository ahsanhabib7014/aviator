import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { ContactMessage } from "@/models/ContactMessage";

export async function GET(req) {
  try {
    await dbConnect();

    // 🆕 টোকেন থেকে ইউজার চেক
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

    // 🆕 ইউজারের সব টিকিট ফেচ করুন
    const tickets = await ContactMessage.find({ senderId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("My Tickets Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
