import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import Deposit from "@/models/Deposit";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Setting from "@/models/Setting";
import AuditLog from "@/models/AuditLog";
import { verifyAuth } from "@/utils/authCheck";
import { calculateVipLevel } from "@/utils/vipLevel";

export async function PATCH(req) {
  const session = await mongoose.startSession();
  try {
    await dbConnect();

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
    const { depositId, status } = body || {};

    if (!depositId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ ডেটা!" },
        { status: 400 },
      );
    }

    // ২. চেক করা হলো ডিপোজিটটি এই এজেন্টের কিনা
    const existingDeposit = await Deposit.findOne({ _id: depositId, agentId });
    if (!existingDeposit) {
      return NextResponse.json(
        { success: false, message: "ডিপোজিট পাওয়া যায়নি বা এটি আপনার নয়।" },
        { status: 404 },
      );
    }
    if (existingDeposit.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "এই ডিপোজিট ইতিমধ্যে প্রসেস করা হয়েছে।" },
        { status: 400 },
      );
    }

    const depositAmount = Number(existingDeposit.amount) || 0;
    const targetUserId = existingDeposit.uid;

    // 🆕 ব্যালেন্স ট্র্যাকিং ভেরিয়েবল
    let oldUserBalance = 0;
    let newUserBalance = 0;
    let oldAgentBalance = 0;
    let newAgentBalance = 0;
    let agentUpdateInfo = null;

    // 🆕 আগের ব্যালেন্স সেভ করা
    const userDoc = await User.findOne({ uid: targetUserId });
    if (userDoc) oldUserBalance = userDoc.balance || 0;

    const agentDoc = await User.findById(agentId);
    if (agentDoc) oldAgentBalance = agentDoc.agentMainBalance || 0;

    // ✅ ৩. ট্রানজেকশন শুরু
    await session.withTransaction(async () => {
      // ডিপোজিট স্ট্যাটাস আপডেট
      const updatedDeposit = await Deposit.findOneAndUpdate(
        { _id: depositId, status: "pending" },
        { $set: { status } },
        { returnDocument: "after", session },
      );
      if (!updatedDeposit) throw new Error("ডিপোজিট আপডেট করা যায়নি!");

      if (status === "approved") {
        // ৪. ইউজারের ব্যালেন্স, টার্নওভার, সাপ্তাহিক, মাসিক আপডেট
        const user = await User.findOneAndUpdate(
          { uid: targetUserId },
          {
            $inc: {
              balance: depositAmount,
              turnover: depositAmount,
              weeklyDeposit: depositAmount,
              weeklyTurnover: depositAmount,
              monthlyTurnover: depositAmount,
              totalDeposit: depositAmount,
            },
          },
          { returnDocument: "after", session },
        );

        if (user) {
          newUserBalance = user.balance || 0;
          const newLevel = calculateVipLevel(user.totalDeposit || 0);
          if (newLevel !== user.vipLevel) {
            await User.updateOne(
              { _id: user._id },
              { $set: { vipLevel: newLevel, vipLevelUpdatedAt: new Date() } },
              { session },
            );
          }
        }

        // 🆕 রেফারেল কমিশন
        if (user && user.referredBy) {
          try {
            const referrer = await User.findOne({
              uid: user.referredBy,
            }).session(session);
            if (referrer) {
              let commissionRate = 10;
              if (
                referrer.customCommission !== null &&
                referrer.customCommission !== undefined
              ) {
                commissionRate = Number(referrer.customCommission);
              } else {
                const globalSetting = await Setting.findOne({
                  key: {
                    $in: ["referralPercentage", "defaultReferralCommission"],
                  },
                }).session(session);
                if (globalSetting && globalSetting.value !== undefined) {
                  const parsed = Number(globalSetting.value);
                  if (!isNaN(parsed) && parsed >= 0 && parsed <= 100)
                    commissionRate = parsed;
                }
              }
              if (commissionRate < 0 || commissionRate > 100)
                commissionRate = 10;
              const commissionBonus = (depositAmount * commissionRate) / 100;
              if (commissionBonus > 0) {
                await User.updateOne(
                  { uid: referrer.uid },
                  { $inc: { referralBalance: commissionBonus } },
                  { session },
                );
              }
            }
          } catch (refErr) {
            console.error("Referral commission error", refErr);
          }
        }

        // ৫. এজেন্টের ব্যালেন্স কাটা এবং কমিশন যোগ
        const commissionToAdd = Number(updatedDeposit.agentCommission) || 0;

        const updatedAgent = await User.findOneAndUpdate(
          { _id: agentId, agentMainBalance: { $gte: depositAmount } },
          {
            $inc: {
              agentMainBalance: depositAmount,
              agentCommissionBalance: commissionToAdd,
            },
          },
          { returnDocument: "after", session },
        );

        if (!updatedAgent) {
          throw new Error("আপনার ব্যালেন্স কম! ডিপোজিট অ্যাপ্রুভ করা যাবে না।");
        }

        // 🆕 এজেন্টের পরের ব্যালেন্স সেভ
        newAgentBalance = updatedAgent.agentMainBalance || 0;

        await Deposit.updateOne(
          { _id: updatedDeposit._id },
          { $set: { agentCommissionPaid: true } },
          { session },
        );

        // ৬. কমিশন ট্রানজেকশন তৈরি
        if (commissionToAdd > 0) {
          await Transaction.create(
            [
              {
                userId: updatedAgent._id,
                agentId: updatedAgent._id,
                type: "AGENT_COMMISSION",
                method: "AGENT_COMMISSION",
                phone: updatedAgent.agentPhone || updatedAgent.phone || "",
                amount: commissionToAdd,
                trxId: updatedDeposit.transactionId || "",
                status: "ACCEPTED",
                comment: `ডিপোজিট কমিশন (৳${depositAmount} × ${updatedDeposit.agentCommissionRate}% = ৳${commissionToAdd})`,
                relatedDepositId: updatedDeposit._id,
              },
            ],
            { session },
          );
        }

        agentUpdateInfo = {
          addedToMain: depositAmount,
          commissionAdded: commissionToAdd,
        };
      } else {
        // 🆕 রিজেক্ট হলে ব্যালেন্স অপরিবর্তিত থাকবে
        newUserBalance = oldUserBalance;
        newAgentBalance = oldAgentBalance;
      }
    });

    // 🆕 ৭. Audit Log তৈরি (এখানে UserBalance এবং AgentBalance সেভ হবে)
    try {
      await AuditLog.create({
        adminId: auth.user._id,
        adminPhone: auth.user.phone || auth.user.uid,
        action:
          status === "approved"
            ? "AGENT_APPROVE_DEPOSIT"
            : "AGENT_REJECT_DEPOSIT",
        targetUser: targetUserId,
        oldData: {
          depositId: existingDeposit._id,
          amount: existingDeposit.amount,
          status: "pending",
          UserBalance: oldUserBalance, // 👈 বড় হাতের অক্ষরে সেভ
          AgentBalance: oldAgentBalance, // 👈 বড় হাতের অক্ষরে সেভ
        },
        newData: {
          depositId: depositId,
          amount: existingDeposit.amount,
          status: status,
          UserBalance: newUserBalance, // 👈 বড় হাতের অক্ষরে সেভ
          AgentBalance: newAgentBalance, // 👈 বড় হাতের অক্ষরে সেভ
        },
        details: `এজেন্ট (${auth.user.phone || auth.user.uid}) কর্তৃক ৳${depositAmount} টাকার ডিপোজিট ${status === "approved" ? "অ্যাপ্রুভ (এজেন্টের ব্যালেন্সে যোগ হয়েছে)" : "বাতিল"} করা হয়েছে।`,
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
            ? "✅ ডিপোজিট অ্যাপ্রুভ হয়েছে!"
            : "❌ ডিপোজিট বাতিল হয়েছে!",
        agentUpdate: agentUpdateInfo,
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
