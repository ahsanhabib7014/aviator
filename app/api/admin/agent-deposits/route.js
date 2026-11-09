import { NextResponse } from "next/server";
import { verifyAuth } from "@/utils/authCheck";
import Transaction from "@/models/Transaction";
import dbConnect from "@/utils/db";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔐 অ্যাডমিন চেক
    const auth = await verifyAuth("admin", null, req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query = { type: "AGENT_DEPOSIT" };

    // তারিখ ফিল্টার
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // নাম্বার দিয়ে সার্চ
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ];
    }

    const list = await Transaction.find(query)
      .populate("userId", "phone uid")
      .populate("agentId", "phone agentCode")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    console.error("Admin agent-deposits error:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
