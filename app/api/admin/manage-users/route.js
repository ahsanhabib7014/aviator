import { NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog";

// ==========================================
// ✅ GET — ইউজার লিস্ট
// ==========================================
export async function GET(request) {
  try {
    await clientPromise;
    const auth = await verifyAuth("admin");
    if (
      !auth.success ||
      (auth.user.role !== "admin" && auth.user.role !== "sub-admin")
    ) {
      return NextResponse.json(
        { success: false, message: "অনুমোদিত নয়!" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query = {};
    if (search) {
      query = {
        $or: [
          { uid: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { ipAddress: { $regex: search, $options: "i" } },
          { agentCode: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select("-password -pin")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ PATCH — ইউজার এডিট (সব ফিল্ড)
// ==========================================
export async function PATCH(request) {
  try {
    await clientPromise;
    const auth = await verifyAuth("admin");
    if (
      !auth.success ||
      (auth.user.role !== "admin" && auth.user.role !== "sub-admin")
    ) {
      return NextResponse.json(
        { success: false, message: "অনুমোদিত নয়!" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি প্রয়োজন!" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ uid: userId }).lean();
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    const allowedUpdates = [
      "balance",
      "turnover",
      "ipAddress",
      "role",
      "vipLevel",
      "referralBalance",
      "agentMainBalance",
      "agentCommissionBalance",
      "agentDepositCommission",
      "agentWithdrawCommission",
      "agentCode",
      "agentPhone",
      "agentCryptoAddress",
      "isBlocked",
      "agentIsActive",
      "agentIsBlocked",
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        // নাম্বার টাইপ ফিল্ডগুলোকে নাম্বারে কনভার্ট করা
        if (
          [
            "balance",
            "turnover",
            "referralBalance",
            "agentMainBalance",
            "agentCommissionBalance",
            "agentDepositCommission",
            "agentWithdrawCommission",
          ].includes(key)
        ) {
          updateData[key] = Number(updates[key]);
        } else {
          // 🆕 agentCode ফাঁকা থাকলে null সেট করুন (ডুপ্লিকেট এরর এড়াতে)
          if (
            key === "agentCode" &&
            (!updates[key] || updates[key].trim() === "")
          ) {
            updateData[key] = null;
          } else {
            updateData[key] = updates[key];
          }
        }
      }
    }

    // ২. ডাটাবেসে আপডেট করা
    const updatedUser = await User.findOneAndUpdate(
      { uid: userId },
      { $set: updateData },
      { returnDocument: "after" },
    ).select("-password -pin");

    // ৩. অডিট লগ তৈরি
    try {
      await AuditLog.create({
        adminId: auth.user._id,
        adminPhone: auth.user.phone || auth.user.uid,
        action: "UPDATE_USER",
        targetUser: userId,
        oldData: {
          balance: existingUser.balance,
          turnover: existingUser.turnover,
          role: existingUser.role,
          agentMainBalance: existingUser.agentMainBalance,
          agentCommissionBalance: existingUser.agentCommissionBalance,
          agentCode: existingUser.agentCode || "N/A", // 🆕 আগের agentCode
        },
        newData: {
          ...updateData,
          agentCode: updateData.agentCode || "N/A", // 🆕 পরের agentCode
        },
        details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক ইউজার ${userId} এর তথ্য আপডেট করা হয়েছে।`,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit Log Error:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "✅ তথ্য সফলভাবে আপডেট হয়েছে!",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ DELETE — ইউজার ডিলিট
// ==========================================
export async function DELETE(request) {
  try {
    await clientPromise;
    const auth = await verifyAuth("admin");
    if (
      !auth.success ||
      (auth.user.role !== "admin" && auth.user.role !== "sub-admin")
    ) {
      return NextResponse.json(
        { success: false, message: "অনুমোদিত নয়!" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি প্রয়োজন!" },
        { status: 400 },
      );
    }

    const deletedUser = await User.findOneAndDelete({ uid: userId });
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    try {
      await AuditLog.create({
        adminId: auth.user._id,
        adminPhone: auth.user.phone || auth.user.uid,
        action: "DELETE_USER",
        targetUser: userId,
        details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক ইউজার ${userId} ডিলিট করা হয়েছে।`,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit Log Error:", auditErr);
    }

    return NextResponse.json(
      { success: true, message: "✅ ইউজার ডিলিট হয়েছে!" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
