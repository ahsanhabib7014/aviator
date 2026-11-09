
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import AuditLog from "@/models/AuditLog";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "অনুমোদন নেই (Unauthorized)" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "আপনার এই পেজ দেখার অনুমতি নেই" },
        { status: 403 },
      );
    }

    await dbConnect();

    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const groupedLogs = {
      manage_dashboard: [],
      view_game_tracking: [],
      manage_users: [],
      manage_agents: [],
      manage_deposits: [],
      manage_withdraws: [],
      manage_referrals: [],
      manage_payments: [],
      manage_methods: [],
      manage_exchange_rate: [],
      manage_nowpayments: [],
      manage_auto_crypto: [],
      manage_bonus_settings: [],
      view_bonus_history: [],
      weekly_bonus: [],
      monthly_bonus: [],
      others: [],
    };

    logs.forEach((log) => {
      const act = String(log.action || "").toUpperCase();
      const details = String(log.details || "").toLowerCase();
      const combined = `${act.toLowerCase()} ${details}`;

      // ১. সাপ্তাহিক বোনাস
      if (act === "WEEKLY_BONUS") {
        groupedLogs.weekly_bonus.push(log);
        groupedLogs.view_bonus_history.push(log);
        return;
      }

      // ২. মাসিক বোনাস
      if (act === "MONTHLY_BONUS") {
        groupedLogs.monthly_bonus.push(log);
        groupedLogs.view_bonus_history.push(log);
        return;
      }

      // 🆕 ৩. পেমেন্ট অ্যাড্রেস (এজেন্ট সিস্টেমে দেখাবে)
      if (act.includes("PAYMENT_ADDRESS")) {
        groupedLogs.manage_agents.push(log);
        return;
      }

      // ৪. NowPayments
      if (combined.includes("nowpayment") || combined.includes("nowpayments")) {
        groupedLogs.manage_nowpayments.push(log);
        groupedLogs.manage_deposits.push(log);
        return;
      }

      // ৫. এজেন্ট
      if (act.startsWith("AGENT_") || combined.includes("এজেন্ট")) {
        groupedLogs.manage_agents.push(log);
        return;
      }

      // ৬. ড্যাশবোর্ড
      if (combined.includes("dashboard") || combined.includes("ড্যাশবোর্ড")) {
        groupedLogs.manage_dashboard.push(log);
        return;
      }

      // ৭. ট্র্যাকিং
      if (
        combined.includes("track") ||
        combined.includes("game") ||
        combined.includes("ট্র্যাকিং")
      ) {
        groupedLogs.view_game_tracking.push(log);
        return;
      }

      // ৮. ডিপোজিট (user চেকের আগে)
      if (act.includes("DEPOSIT")) {
        groupedLogs.manage_deposits.push(log);
        return;
      }

      // ৯. উইথড্র (user চেকের আগে)
      if (
        act.includes("WITHDRAW") ||
        combined.includes("withdraw") ||
        combined.includes("উইথড্র")
      ) {
        groupedLogs.manage_withdraws.push(log);
        return;
      }

      // ১০. ইউজার
      if (
        combined.includes("user") ||
        combined.includes("balance") ||
        combined.includes("commission") ||
        combined.includes("ইউজার") ||
        combined.includes("ব্যালেন্স")
      ) {
        groupedLogs.manage_users.push(log);
        return;
      }

      // ১১. রেফারেল
      if (combined.includes("referral") || combined.includes("রেফারেল")) {
        groupedLogs.manage_referrals.push(log);
        return;
      }

      // ১২. মেথড (payment চেকের আগে)
      if (combined.includes("method") || combined.includes("মেথড")) {
        groupedLogs.manage_methods.push(log);
        return;
      }

      // ১৩. পেমেন্ট (মেথড চেকের পরে)
      if (combined.includes("payment") || combined.includes("পেমেন্ট")) {
        groupedLogs.manage_payments.push(log);
        return;
      }

      // ১৪. এক্সচেঞ্জ রেট
      if (combined.includes("exchange") || combined.includes("rate")) {
        groupedLogs.manage_exchange_rate.push(log);
        return;
      }

      // ১৫. Auto Crypto
      if (combined.includes("crypto")) {
        groupedLogs.manage_auto_crypto.push(log);
        return;
      }

      // ১৬. বোনাস সেটিংস
      if (
        combined.includes("bonus_setting") ||
        combined.includes("বোনাস সেটিংস")
      ) {
        groupedLogs.manage_bonus_settings.push(log);
        return;
      }

      // ১৭. অন্যান্য বোনাস
      if (combined.includes("bonus") || combined.includes("বোনাস")) {
        groupedLogs.view_bonus_history.push(log);
        return;
      }

      // ১৮. বাকি সব
      groupedLogs.others.push(log);
    });

    // Summary
    let totalApprovedBDT = 0;
    let totalRejectedBDT = 0;
    let todayApprovedBDT = 0;

    try {
      const totalApprovedResult = await AuditLog.aggregate([
        { $match: { action: "AGENT_DOLLAR_REQUEST_APPROVE" } },
        { $group: { _id: null, totalBDT: { $sum: "$newData.amountBDT" } } },
      ]);
      totalApprovedBDT = totalApprovedResult[0]?.totalBDT || 0;

      const totalRejectedResult = await AuditLog.aggregate([
        { $match: { action: "AGENT_DOLLAR_REQUEST_REJECT" } },
        { $group: { _id: null, totalBDT: { $sum: "$newData.amountBDT" } } },
      ]);
      totalRejectedBDT = totalRejectedResult[0]?.totalBDT || 0;

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
      todayApprovedBDT = todayApprovedResult[0]?.totalBDT || 0;
    } catch (aggErr) {
      console.error("Audit summary aggregate error:", aggErr);
    }

    return NextResponse.json({
      success: true,
      logs,
      groupedLogs,
      summary: {
        totalApprovedBDT,
        totalRejectedBDT,
        todayApprovedBDT,
      },
    });
  } catch (err) {
    console.error("Fetch audit logs error:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভারে ত্রুটি ঘটেছে" },
      { status: 500 },
    );
  }
}
