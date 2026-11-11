import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { ContactMessage } from "@/models/ContactMessage";

export async function POST(req) {
  try {
    await dbConnect();

    // 🆕 ইউজার সেশন চেক
    const token = req.cookies.get("token")?.value;
    let loggedInUser = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const identifier = decoded.uid || decoded.phone || decoded.userId;
        loggedInUser = await User.findOne({
          $or: [{ uid: identifier }, { phone: identifier }],
        });
      } catch (err) {}
    }

    const body = await req.json();
    const { phone, title, message, role } = body;

    // 🆕 ভ্যালিডেশন
    if (!phone || !/^[0-9]{11}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "সঠিক ১১ ডিজিটের ফোন নম্বর দিন!" },
        { status: 400 },
      );
    }
    if (!title || title.trim().length === 0 || title.length > 30) {
      return NextResponse.json(
        { success: false, message: "টাইটেল ১-৩০ অক্ষরের মধ্যে দিন!" },
        { status: 400 },
      );
    }
    if (!message || message.trim().length === 0 || message.length > 400) {
      return NextResponse.json(
        { success: false, message: "বার্তা ১-৪০০ অক্ষরের মধ্যে দিন!" },
        { status: 400 },
      );
    }

    // 🆕 স্যানিটাইজ
    const sanitize = (s) =>
      s
        .replace(/<[^>]*>?/gm, "")
        .replace(/[<>]/g, "")
        .trim();
    const cleanTitle = sanitize(title);
    const cleanMessage = sanitize(message);

    // 🆕 রেট লিমিট (৫ মিনিটে ৩টি)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCount = await ContactMessage.countDocuments({
      phone,
      createdAt: { $gte: fiveMinutesAgo },
    });
    if (recentCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          message: "৫ মিনিটে সর্বোচ্চ ৩টি টিকিট পাঠাতে পারবেন!",
        },
        { status: 429 },
      );
    }

    // 🆕 রোল অনুযায়ী assignedTo ঠিক করা
    const admin = await User.findOne({ role: "admin" });
    let assignedTo = null;
    let status = "unread";

    const senderRole = loggedInUser?.role || role || "user";

    if (senderRole === "user") {
      // 🆕 ইউজার: ডেডিকেটেড সাব-অ্যাডমিনের কাছে যাবে
      if (loggedInUser?.dedicatedSupportAgent) {
        const subAdmin = await User.findById(
          loggedInUser.dedicatedSupportAgent,
        );
        if (subAdmin && subAdmin.role === "sub-admin" && !subAdmin.isBlocked) {
          assignedTo = subAdmin._id;
          status = "in_progress";
        }
      }
      // ডেডিকেটেড সাব-অ্যাডমিন না থাকলে unread থাকবে
      if (!assignedTo) {
        assignedTo = null;
        status = "unread";
      }
    } else if (senderRole === "agent" || senderRole === "sub-admin") {
      // 🆕 এজেন্ট/সাব-অ্যাডমিন: শুধু অ্যাডমিনের কাছে যাবে
      assignedTo = admin?._id || null;
      status = assignedTo ? "in_progress" : "unread";
    }

    // 🆕 নতুন টিকিট তৈরি
    const newTicket = await ContactMessage.create({
      phone,
      title: cleanTitle,
      message: cleanMessage,
      senderRole,
      senderId: loggedInUser?._id || null,
      assignedTo,
      status,
    });

    return NextResponse.json({
      success: true,
      message: "টিকিট সফলভাবে তৈরি হয়েছে!",
      ticketId: newTicket._id,
    });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
