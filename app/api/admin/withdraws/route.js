
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import Withdraw from "@/models/Withdraw";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog";

const calculateRefundAmount = (withdraw) => {
  if (withdraw.deductedBDT && Number(withdraw.deductedBDT) > 0) {
    return Number(withdraw.deductedBDT);
  }
  if (
    withdraw.originalCurrency === "USD" &&
    withdraw.exchangeRate &&
    Number(withdraw.exchangeRate) > 0
  ) {
    return Math.round(Number(withdraw.amount) * Number(withdraw.exchangeRate));
  }
  return Number(withdraw.amount) || 0;
};

const checkAdminAuth = async () => {
  try {
    const auth = await verifyAuth("admin");
    if (auth.success && auth.user) {
      const role = auth.user.role;
      if (role === "admin" || role === "sub-admin") {
        return { success: true, user: auth.user };
      }
    }
  } catch (e) {}
  return { success: false, message: "অনুমোদিত নয়! দয়া করে আবার লগইন করুন।" };
};

// ==========================================
// ✅ GET — উইথড্র লিস্ট এবং অডিট ডেটা
// ==========================================
export async function GET(request) {
  try {
    await clientPromise;
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: 401 },
      );
    }

    let withdraws = await Withdraw.find({})
      .populate("agentId", "agentCode phone uid")
      .lean();

    withdraws.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

    const withdrawsWithAudit = await Promise.all(
      withdraws.map(async (w) => {
        const audit = await AuditLog.findOne({
          $or: [
            { "newData.withdrawId": w._id.toString() },
            { "newData.withdrawId": w._id },
            { "oldData.withdrawId": w._id.toString() },
            { "oldData.withdrawId": w._id },
          ],
          action: {
            $in: [
              "APPROVE_WITHDRAW",
              "REJECT_WITHDRAW",
              "AGENT_APPROVE_WITHDRAW",
              "AGENT_REJECT_WITHDRAW",
            ],
          },
        })
          .sort({ createdAt: -1 })
          .lean();

        if (audit) {
          return {
            ...w,
            auditInfo: {
              oldUserBalance:
                audit.oldData?.UserBalance ?? audit.oldData?.userBalance ?? 0,
              newUserBalance:
                audit.newData?.UserBalance ?? audit.newData?.userBalance ?? 0,
              oldAgentBalance:
                audit.oldData?.AgentBalance ?? audit.oldData?.agentBalance ?? 0,
              newAgentBalance:
                audit.newData?.AgentBalance ?? audit.newData?.agentBalance ?? 0,
              oldStatus: audit.oldData?.status || "pending",
              newStatus: audit.newData?.status || w.status,
              auditTime: audit.createdAt,
            },
          };
        }
        return w;
      }),
    );

    return NextResponse.json(
      { success: true, withdraws: withdrawsWithAudit },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, withdraws: [], error: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ PATCH — উইথড্র অ্যাপ্রুভ / রিজেক্ট
// ==========================================
export async function PATCH(request) {
  try {
    await clientPromise;
    const authCheck = await checkAdminAuth();
    if (!authCheck.success)
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: 401 },
      );

    const adminUser = authCheck.user;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 },
      );
    }

    const { withdrawId, status, adminNote } = body || {};
    if (!withdrawId)
      return NextResponse.json(
        { success: false, message: "Withdraw ID প্রয়োজন!" },
        { status: 400 },
      );

    const cleanNote =
      typeof adminNote === "string" ? adminNote.trim().slice(0, 200) : "";

    // শুধু নোট আপডেট
    if (!status) {
      const existingWithdraw = await Withdraw.findById(withdrawId);
      const updated = await Withdraw.findByIdAndUpdate(
        withdrawId,
        { $set: { adminNote: cleanNote } },
        { returnDocument: "after" },
      );
      if (adminUser && updated) {
        await AuditLog.create({
          adminId: adminUser._id,
          adminPhone: adminUser.phone || adminUser.uid,
          action: "UPDATE_WITHDRAW_NOTE",
          targetUser: updated.uid || updated.userId,
          oldData: { adminNote: existingWithdraw?.adminNote || "" },
          newData: { adminNote: cleanNote },
          details: `${adminUser.role === "sub-admin" ? "সাব-অ্যাডমিন" : "অ্যাডমিন"} (${adminUser.phone || adminUser.uid}) উইথড্রতে নোট আপডেট করেছেন।`,
          ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        });
      }
      return NextResponse.json(
        { success: true, message: "✅ নোট আপডেট হয়েছে!", withdraw: updated },
        { status: 200 },
      );
    }

    const existingWithdraw = await Withdraw.findById(withdrawId);
    if (!existingWithdraw)
      return NextResponse.json(
        { success: false, message: "Withdraw not found" },
        { status: 404 },
      );

    const targetUserId = existingWithdraw.uid || existingWithdraw.userId;
    let oldUserBalance = 0;
    let newUserBalance = 0;
    let oldAgentBalance = 0;
    let newAgentBalance = 0;

    const walletType = existingWithdraw.walletType || "main";
    const balanceField =
      walletType === "referral" ? "referralBalance" : "balance";

    // ইউজারের আগের ব্যালেন্স
    if (targetUserId) {
      const targetUserDoc = await User.findOne({ uid: targetUserId });
      if (targetUserDoc) oldUserBalance = targetUserDoc[balanceField] || 0;
    }

    // এজেন্টের আগের ব্যালেন্স
    if (existingWithdraw.agentId) {
      const agentDoc = await User.findById(existingWithdraw.agentId);
      if (agentDoc) oldAgentBalance = agentDoc.agentMainBalance || 0;
    }

    let refundInfo = null;
    let agentUpdateInfo = null;

    // ✅ MongoDB Transaction শুরু
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const updateData = { status };
        if (cleanNote) updateData.adminNote = cleanNote;

        // ১. উইথড্র স্ট্যাটাস আপডেট
        const updatedWithdraw = await Withdraw.findOneAndUpdate(
          { _id: withdrawId, status: "pending" },
          { $set: updateData },
          { returnDocument: "after", session },
        );
        if (!updatedWithdraw)
          throw new Error(`ইতিমধ্যে ${existingWithdraw.status} অবস্থায় আছে`);

        if (status === "rejected") {
          // ২. রিজেক্ট হলে ইউজারকে টাকা ফেরত
          const refundAmount = calculateRefundAmount(updatedWithdraw);

          if (targetUserId && refundAmount > 0) {
            // (ক) ইউজারের টাকা ফেরত
            const updatedUser = await User.findOneAndUpdate(
              { uid: targetUserId },
              { $inc: { [balanceField]: refundAmount } },
              { returnDocument: "after", session },
            );
            if (updatedUser) {
              newUserBalance = updatedUser[balanceField] || 0;
              refundInfo = {
                refundAmount,
                newBalance: updatedUser.balance,
                newReferralBalance: updatedUser.referralBalance,
              };
            }

            // (খ) এজেন্টের কাটা মেইন টাকা ফেরত এবং কমিশন বাতিল
            if (updatedWithdraw.agentId) {
              const commissionToRefund =
                Number(updatedWithdraw.agentCommission) || 0;
              const updatedAgent = await User.findOneAndUpdate(
                { _id: updatedWithdraw.agentId },
                {
                  $inc: {
                    agentMainBalance: refundAmount, // মেইন টাকা ফেরত
                    agentCommissionBalance: -commissionToRefund, // কমিশন বাতিল
                  },
                },
                { returnDocument: "after", session },
              );
              if (updatedAgent) {
                newAgentBalance = updatedAgent.agentMainBalance || 0;
              }
            }
          } else {
            newAgentBalance = oldAgentBalance;
          }
        } else if (status === "approved") {
          // ✅ [সবচেয়ে গুরুত্বপূর্ণ ফিক্স] অ্যাপ্রুভ করার সময় কোনো টাকা বা কমিশন বাড়বে না।
          newUserBalance = oldUserBalance;
          newAgentBalance = oldAgentBalance;

          await Withdraw.updateOne(
            { _id: updatedWithdraw._id },
            { $set: { agentCommissionPaid: true } },
            { session },
          );

          agentUpdateInfo = {
            addedToMain: 0,
            commissionAdded: 0,
          };
        }
      });

      // ✅ অডিট লগ তৈরি
      if (adminUser) {
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const actionType =
          status === "approved"
            ? "APPROVE_WITHDRAW"
            : status === "rejected"
              ? "REJECT_WITHDRAW"
              : "UPDATE_WITHDRAW";
        const roleText =
          adminUser.role === "sub-admin" ? "সাব-অ্যাডমিন" : "অ্যাডমিন";

        await AuditLog.create({
          adminId: adminUser._id,
          adminPhone: adminUser.phone || adminUser.uid,
          action: actionType,
          targetUser: targetUserId,
          oldData: {
            withdrawId: existingWithdraw._id,
            amount: existingWithdraw.amount,
            status: existingWithdraw.status,
            UserBalance: oldUserBalance,
            AgentBalance: oldAgentBalance,
          },
          newData: {
            withdrawId: withdrawId,
            amount: existingWithdraw.amount,
            status: status,
            UserBalance: newUserBalance,
            AgentBalance: newAgentBalance,
          },
          details: `${roleText} (${adminUser.phone || adminUser.uid}) কর্তৃক ${existingWithdraw.amount} টাকার উইথড্র ${status === "approved" ? `এপ্রুভ করা হয়েছে।` : `বাতিল ও ৳${refundInfo?.refundAmount || 0} রিফান্ড করা হয়েছে। এজেন্টের কাটা টাকা ও কমিশন ফেরত দেওয়া হয়েছে।`}`,
          ipAddress: ip,
        });
      }

      return NextResponse.json(
        {
          success: true,
          message:
            status === "rejected"
              ? `✅ উইথড্র বাতিল হয়েছে এবং ৳${refundInfo?.refundAmount || 0} ফেরত দেওয়া হয়েছে`
              : "✅ উইথড্র কনফার্ম হয়েছে",
          refundInfo,
          agentUpdate: agentUpdateInfo,
        },
        { status: 200 },
      );
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 400 },
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ POST — (আগের মতোই থাকবে)
// ==========================================
export async function POST(request) {
  try {
    await clientPromise;
    const authCheck = await checkAdminAuth();
    if (!authCheck.success)
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: 401 },
      );

    const adminUser = authCheck.user;
    const { withdrawId, action } = await request.json();
    if (!withdrawId || !action)
      return NextResponse.json(
        { success: false, message: "প্রয়োজনীয় তথ্য নেই" },
        { status: 400 },
      );

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const withdraw = await Withdraw.findById(withdrawId).session(session);
        if (!withdraw || withdraw.status !== "pending")
          throw new Error("পাওয়া যায়নি বা প্রসেস হয়েছে");

        const oldStatus = withdraw.status;
        const targetUserId = withdraw.uid || withdraw.userId;
        const walletType = withdraw.walletType || "main";
        const balanceField =
          walletType === "referral" ? "referralBalance" : "balance";

        let oldUserBalance = 0;
        let newUserBalance = 0;
        let oldAgentBalance = 0;
        let newAgentBalance = 0;
        let refundInfo = null;
        let agentUpdateInfo = null;

        if (targetUserId) {
          const userDoc = await User.findOne({ uid: targetUserId }).session(
            session,
          );
          if (userDoc) oldUserBalance = userDoc[balanceField] || 0;
        }

        if (withdraw.agentId) {
          const agentDoc = await User.findById(withdraw.agentId).session(
            session,
          );
          if (agentDoc) oldAgentBalance = agentDoc.agentMainBalance || 0;
        }

        const roleText =
          adminUser.role === "sub-admin" ? "সাব-অ্যাডমিন" : "অ্যাডমিন";

        if (action === "approve") {
          // ✅ অ্যাপ্রুভে কিছুই বাড়বে না বা কমবে না
          newUserBalance = oldUserBalance;
          newAgentBalance = oldAgentBalance;

          await Withdraw.updateOne(
            { _id: withdraw._id },
            { $set: { agentCommissionPaid: true } },
            { session },
          );

          withdraw.status = "approved";
          await withdraw.save({ session });

          agentUpdateInfo = {
            addedToMain: 0,
            commissionAdded: 0,
          };
        } else if (action === "reject") {
          withdraw.status = "rejected";
          await withdraw.save({ session });

          const refundAmount = calculateRefundAmount(withdraw);
          if (refundAmount > 0 && targetUserId) {
            const updatedUser = await User.findOneAndUpdate(
              { uid: targetUserId },
              { $inc: { [balanceField]: refundAmount } },
              { returnDocument: "after", session },
            );
            if (updatedUser) {
              newUserBalance = updatedUser[balanceField] || 0;
              refundInfo = {
                refundAmount,
                newBalance: updatedUser.balance,
                newReferralBalance: updatedUser.referralBalance,
              };
            }

            // এজেন্টের কাটা টাকা ফেরত এবং কমিশন বাতিল
            if (withdraw.agentId) {
              const commissionToRefund = Number(withdraw.agentCommission) || 0;
              const updatedAgent = await User.findOneAndUpdate(
                { _id: withdraw.agentId },
                {
                  $inc: {
                    agentMainBalance: refundAmount,
                    agentCommissionBalance: -commissionToRefund,
                  },
                },
                { returnDocument: "after", session },
              );
              if (updatedAgent) {
                newAgentBalance = updatedAgent.agentMainBalance || 0;
              }
            }
          } else {
            newAgentBalance = oldAgentBalance;
          }
        }

        // অডিট লগ
        if (adminUser) {
          const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
          const actionType =
            action === "approve" ? "APPROVE_WITHDRAW" : "REJECT_WITHDRAW";
          await AuditLog.create(
            [
              {
                adminId: adminUser._id,
                adminPhone: adminUser.phone || adminUser.uid,
                action: actionType,
                targetUser: targetUserId,
                oldData: {
                  withdrawId: withdraw._id,
                  amount: withdraw.amount,
                  status: oldStatus,
                  UserBalance: oldUserBalance,
                  AgentBalance: oldAgentBalance,
                },
                newData: {
                  withdrawId: withdraw._id,
                  amount: withdraw.amount,
                  status: withdraw.status,
                  UserBalance: newUserBalance,
                  AgentBalance: newAgentBalance,
                },
                details: `${roleText} (${adminUser.phone || adminUser.uid}) কর্তৃক ${withdraw.amount} টাকার উইথড্র ${action === "approve" ? `এপ্রুভ করা হয়েছে।` : `বাতিল ও ৳${refundInfo?.refundAmount || 0} রিফান্ড করা হয়েছে। এজেন্টের টাকা ও কমিশন ফেরত দেওয়া হয়েছে।`}`,
                ipAddress: ip,
              },
            ],
            { session },
          );
        }

        return NextResponse.json(
          {
            success: true,
            message:
              action === "approve"
                ? "✅ অ্যাপ্রুভ"
                : `✅ ৳${refundInfo?.refundAmount || 0} রিফান্ড`,
            refundInfo,
            agentUpdate: agentUpdateInfo,
          },
          { status: 200 },
        );
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 400 },
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
