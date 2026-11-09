
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

export async function PATCH(req) {
  const session = await mongoose.startSession();
  try {
    await clientPromise;

    // ১. এজেন্ট লগইন চেক
    const auth = await verifyAuth("user");
    if (!auth.success || auth.user.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "আপনি এজেন্ট নন!" },
        { status: 403 },
      );
    }

    const agentId = auth.user._id;
    const body = await req.json();
    const { withdrawId, status } = body || {};

    if (!withdrawId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ ডেটা!" },
        { status: 400 },
      );
    }

    // ২. উইথড্র চেক (এটি কি এই এজেন্টের?)
    const existingWithdraw = await Withdraw.findOne({
      _id: withdrawId,
      agentId,
    });
    if (!existingWithdraw) {
      return NextResponse.json(
        { success: false, message: "উইথড্র পাওয়া যায়নি বা এটি আপনার নয়।" },
        { status: 404 },
      );
    }
    if (existingWithdraw.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "এই উইথড্র ইতিমধ্যে প্রসেস করা হয়েছে।" },
        { status: 400 },
      );
    }

    const targetUserId = existingWithdraw.uid;
    const walletType = existingWithdraw.walletType || "main";
    const balanceField =
      walletType === "referral" ? "referralBalance" : "balance";

    // 🆕 ব্যালেন্স ট্র্যাকিং ভেরিয়েবল
    let oldUserBalance = 0;
    let newUserBalance = 0;
    let oldAgentBalance = 0;
    let newAgentBalance = 0;
    let agentUpdateInfo = null;
    let refundInfo = null;

    // ইউজারের আগের ব্যালেন্স
    if (targetUserId) {
      const targetUserDoc = await User.findOne({ uid: targetUserId });
      if (targetUserDoc) oldUserBalance = targetUserDoc[balanceField] || 0;
    }

    // এজেন্টের আগের ব্যালেন্স
    const agentDoc = await User.findById(agentId);
    if (agentDoc) oldAgentBalance = agentDoc.agentMainBalance || 0;

    // ✅ ৩. ট্রানজেকশন শুরু
    await session.withTransaction(async () => {
      // উইথড্র স্ট্যাটাস আপডেট
      const updatedWithdraw = await Withdraw.findOneAndUpdate(
        { _id: withdrawId, status: "pending" },
        { $set: { status } },
        { returnDocument: "after", session },
      );
      if (!updatedWithdraw) throw new Error("উইথড্র আপডেট করা যায়নি!");

      if (status === "approved") {
        // ✅ [ফিক্স] অ্যাপ্রুভ করার সময় কোনো টাকা বা কমিশন বাড়বে না (রিকোয়েস্টের সময়ই হয়ে গেছে)
        newUserBalance = oldUserBalance;
        newAgentBalance = oldAgentBalance;

        await Withdraw.updateOne(
          { _id: updatedWithdraw._id },
          { $set: { agentCommissionPaid: true } },
          { session },
        );

        agentUpdateInfo = {
          addedToMain: 0, // মেইন ব্যালেন্স বাড়েনি
          commissionAdded: 0, // কমিশনও বাড়েনি (কারণ আগেই পেয়েছে)
        };
      } else if (status === "rejected") {
        // বাতিল হলে ইউজার এবং এজেন্ট উভয়ের টাকা ফেরত দিতে হবে
        const refundAmount = calculateRefundAmount(updatedWithdraw);

        if (targetUserId && refundAmount > 0) {
          // ১. ইউজারের টাকা ফেরত
          const updatedUser = await User.findOneAndUpdate(
            { uid: targetUserId },
            { $inc: { [balanceField]: refundAmount } },
            { returnDocument: "after", session },
          );

          if (updatedUser) {
            newUserBalance = updatedUser[balanceField] || 0;
            refundInfo = { refundAmount };
          }

          // ২. এজেন্টের কাটা টাকা ফেরত এবং কমিশন বাতিল
          const updatedAgent = await User.findOneAndUpdate(
            { _id: agentId },
            {
              $inc: {
                agentMainBalance: refundAmount, // হোল্ড করা টাকা ফেরত
                agentCommissionBalance: -(
                  Number(updatedWithdraw.agentCommission) || 0
                ), // কমিশন কেটে নেওয়া (বাতিল)
              },
            },
            { returnDocument: "after", session },
          );

          if (updatedAgent) {
            newAgentBalance = updatedAgent.agentMainBalance || 0;
          }
        }
      }
    });

    // ✅ ৪. অডিট লগ তৈরি (সঠিক ব্যালেন্সসহ)
    try {
      await AuditLog.create({
        adminId: agentId,
        adminPhone: auth.user.phone || auth.user.uid,
        action:
          status === "approved"
            ? "AGENT_APPROVE_WITHDRAW"
            : "AGENT_REJECT_WITHDRAW",
        targetUser: targetUserId,
        oldData: {
          withdrawId: existingWithdraw._id,
          amount: existingWithdraw.amount,
          status: "pending",
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
        details: `এজেন্ট (${auth.user.phone || auth.user.uid}) কর্তৃক ${existingWithdraw.amount} টাকার উইথড্র ${status === "approved" ? "অ্যাপ্রুভ" : "বাতিল"} করা হয়েছে।`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          status === "approved"
            ? "✅ উইথড্র অ্যাপ্রুভ হয়েছে!"
            : "❌ উইথড্র বাতিল ও ইউজারকে রিফান্ড করা হয়েছে!",
        agentUpdate: agentUpdateInfo,
        refundInfo,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "সার্ভার এরর!" },
      { status: 400 },
    );
  } finally {
    await session.endSession();
  }
}
