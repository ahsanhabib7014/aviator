import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import AuditLog from "@/models/AuditLog";
import { verifyAuth } from "@/utils/authCheck";

export async function GET(req) {
  try {
    // ✅ Auth check (আপনার বর্তমান route.js-এর মতো)
    const auth = await verifyAuth("admin", "audit-logs", req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 }
      );
    }

    await dbConnect();

    // ১. মোট অ্যাপ্রুভ করা টাকা
    const totalApprovedResult = await AuditLog.aggregate([
      { $match: { action: "AGENT_DOLLAR_REQUEST_APPROVE" } },
      { $group: { _id: null, totalBDT: { $sum: "$newData.amountBDT" } } },
    ]);

    // ২. মোট রিজেক্ট করা টাকা
    const totalRejectedResult = await AuditLog.aggregate([
      { $match: { action: "AGENT_DOLLAR_REQUEST_REJECT" } },
      { $group: { _id: null, totalBDT: { $sum: "$newData.amountBDT" } } },
    ]);

    // ৩. আজকের অ্যাপ্রুভ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayApprovedResult = await AuditLog.aggregate([
      {
        $match: {
          action: "AGENT_DOLLAR_REQUEST_APPROVE",
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, totalBDT: { $sum: "$newData.amountBDT" } } },
    ]);

    // ৪. নির্দিষ্ট অ্যাডমিনের মোট (URL-এ adminId দিলে)
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    let adminApprovedBDT = 0;
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      const adminResult = await AuditLog.aggregate([
        {
          $match: {
            action: "AGENT_DOLLAR_REQUEST_APPROVE",
            adminId: new mongoose.Types.ObjectId(adminId),
          },
        },
        { $group: { _id: null, totalBDT: { $sum: "$newData.amountBDT" } } },
      ]);
      adminApprovedBDT = adminResult[0]?.totalBDT || 0;
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalApprovedBDT: totalApprovedResult[0]?.totalBDT || 0,
        totalRejectedBDT: totalRejectedResult[0]?.totalBDT || 0,
        todayApprovedBDT: todayApprovedResult[0]?.totalBDT || 0,
        adminApprovedBDT,
      },
    });
  } catch (error) {
    console.error("Audit summary error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 }
    );
  }
}