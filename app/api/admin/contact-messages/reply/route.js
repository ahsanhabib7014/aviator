import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { ContactMessage } from "@/models/ContactMessage";

export async function POST(req) {
  try {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "অনুমতি নেই" },
        { status: 403 },
      );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const identifier = decoded.uid || decoded.phone || decoded.userId;
    const user = await User.findOne({
      $or: [{ uid: identifier }, { phone: identifier }],
    });
    if (!user)
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি" },
        { status: 404 },
      );

    const { messageId, replyMessage } = await req.json();
    if (!messageId || !replyMessage) {
      return NextResponse.json(
        { success: false, message: "সব ঘর পূরণ করুন" },
        { status: 400 },
      );
    }

    const message = await ContactMessage.findById(messageId);
    if (!message)
      return NextResponse.json(
        { success: false, message: "টিকিট পাওয়া যায়নি" },
        { status: 404 },
      );

    if (
      user.role === "sub-admin" &&
      message.assignedTo?.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, message: "এই টিকিটে রিপ্লাই দেওয়ার অনুমতি নেই!" },
        { status: 403 },
      );
    }

    message.replies.push({
      senderId: user._id,
      senderName: user.role === "admin" ? "সুপার অ্যাডমিন" : "সাব-অ্যাডমিন",
      senderRole: user.role,
      message: replyMessage,
    });
    message.status = "resolved";
    message.hasNewReply = true; // 🆕 নতুন রিপ্লাই ফ্ল্যাগ
    await message.save();

    return NextResponse.json({
      success: true,
      message: "রিপ্লাই পাঠানো হয়েছে!",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
