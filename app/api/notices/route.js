import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import { Notice } from "@/models/Notice";

// 🆕 সমস্ত অ্যাক্টিভ নোটিশ দেখার জন্য (Frontend কল করবে)
export async function GET(req) {
  try {
    await dbConnect();

    // শুধু অ্যাক্টিভ নোটিশগুলো দেখাবে, নতুনগুলো আগে
    const notices = await Notice.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, notices });
  } catch (error) {
    console.error("Notice Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
