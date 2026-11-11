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

    const { messageId } = await req.json();
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
        { success: false, message: "এই টিকিট ক্লোজ করার অনুমতি নেই!" },
        { status: 403 },
      );
    }

    message.status = "closed";
    message.closedBy = user._id;
    message.closedAt = new Date();
    await message.save();

    return NextResponse.json({
      success: true,
      message: "টিকিট সফলভাবে ক্লোজ হয়েছে!",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
