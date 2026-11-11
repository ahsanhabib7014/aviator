import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { Notice } from "@/models/Notice";

// 🆕 অ্যাডমিন অথেন্টিকেশন চেক ফাংশন (role চেক)
const checkAdmin = async (req) => {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const identifier = decoded.uid || decoded.phone || decoded.userId;
    const user = await User.findOne({
      $or: [{ uid: identifier }, { phone: identifier }],
    });

    // 🆕 role ফিল্ড চেক করা হচ্ছে (admin বা sub-admin)
    return user && (user.role === "admin" || user.role === "sub-admin");
  } catch (err) {
    return false;
  }
};

// 🆕 নতুন নোটিশ তৈরি করা (POST)
export async function POST(req) {
  try {
    await dbConnect();
    const isAdmin = await checkAdmin(req);
    if (!isAdmin)
      return NextResponse.json(
        { success: false, message: "অনুমতি নেই" },
        { status: 403 },
      );

    const body = await req.json();
    const { title, desc, type, isNew } = body;

    if (!title || !desc) {
      return NextResponse.json(
        { success: false, message: "শিরোনাম এবং বিবরণ দিন" },
        { status: 400 },
      );
    }

    const newNotice = await Notice.create({ title, desc, type, isNew });
    return NextResponse.json({ success: true, notice: newNotice });
  } catch (error) {
    console.error("Notice POST Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}

// 🆕 নোটিশ আপডেট করা (PUT)
export async function PUT(req) {
  try {
    await dbConnect();
    const isAdmin = await checkAdmin(req);
    if (!isAdmin)
      return NextResponse.json(
        { success: false, message: "অনুমতি নেই" },
        { status: 403 },
      );

    const body = await req.json();
    const { id, title, desc, type, isActive } = body;

    const updated = await Notice.findByIdAndUpdate(
      id,
      { title, desc, type, isActive },
      { new: true },
    );
    return NextResponse.json({ success: true, notice: updated });
  } catch (error) {
    console.error("Notice PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}

// 🆕 নোটিশ ডিলিট করা (DELETE)
export async function DELETE(req) {
  try {
    await dbConnect();
    const isAdmin = await checkAdmin(req);
    if (!isAdmin)
      return NextResponse.json(
        { success: false, message: "অনুমতি নেই" },
        { status: 403 },
      );

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await Notice.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "নোটিশ ডিলিট হয়েছে" });
  } catch (error) {
    console.error("Notice DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
