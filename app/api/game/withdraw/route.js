
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import Withdraw from "@/models/Withdraw";
import User from "@/models/User";
import Setting from "@/models/Setting";
import AgentSettings from "@/models/AgentSettings";
import bcrypt from "bcryptjs";
import { verifyAuth } from "@/utils/authCheck";

const getAccountValidation = (method) => {
  const upper = String(method || "").toUpperCase();

  if (upper.includes("TRC20")) {
    return {
      minLength: 34,
      maxLength: 34,
      onlyDigits: false,
      label: "USDT (TRC20) Wallet Address",
    };
  }

  if (
    upper.includes("BEP20") ||
    upper.includes("BSC") ||
    upper.includes("BNB")
  ) {
    return {
      minLength: 42,
      maxLength: 42,
      onlyDigits: false,
      label: "BNB/BEP20 Wallet Address",
    };
  }

  if (upper.includes("TRX") || upper.includes("TRON")) {
    return {
      minLength: 34,
      maxLength: 34,
      onlyDigits: false,
      label: "TRX Wallet Address",
    };
  }

  if (upper.includes("BINANCE")) {
    return {
      minLength: 5,
      maxLength: 15,
      onlyDigits: true,
      label: "Binance Pay ID",
    };
  }

  if (upper.includes("BTC") || upper.includes("BITCOIN")) {
    return {
      minLength: 26,
      maxLength: 50,
      onlyDigits: false,
      label: "Bitcoin Address",
    };
  }

  if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
    return {
      minLength: 42,
      maxLength: 42,
      onlyDigits: false,
      label: "ETH Address",
    };
  }

  return {
    minLength: 11,
    maxLength: 11,
    onlyDigits: true,
    label: "Mobile Banking Number",
  };
};

export async function POST(req) {
  const session = await mongoose.startSession();
  try {
    await dbConnect();
    const auth = await verifyAuth("user");
    if (!auth.success)
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );

    const body = await req.json();
    const {
      amount,
      method,
      pin,
      accountNumber: userProvidedAccount,
    } = body || {};

    if (!amount || !method || !pin)
      return NextResponse.json(
        { success: false, message: "তথ্য অসম্পূর্ণ!" },
        { status: 400 },
      );

    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0)
      return NextResponse.json(
        { success: false, message: "অবৈধ পরিমাণ!" },
        { status: 400 },
      );

    const rateSetting = await Setting.findOne({ key: "usdToBdtRate" });
    const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;

    const methodUpper = String(method).toUpperCase();
    const isCryptoWithdraw =
      methodUpper.includes("USDT") ||
      methodUpper.includes("BINANCE") ||
      methodUpper.includes("TRX") ||
      methodUpper.includes("TRON") ||
      methodUpper.includes("CRYPTO") ||
      methodUpper.includes("BTC") ||
      methodUpper.includes("ETH") ||
      methodUpper.includes("BNB") ||
      methodUpper.includes("BEP20");

    const originalAmount = cleanAmount;
    const balanceDeduction = isCryptoWithdraw
      ? Math.round(cleanAmount * USD_TO_BDT_RATE)
      : cleanAmount;

    if (isCryptoWithdraw && cleanAmount < 5)
      return NextResponse.json(
        { success: false, message: "সর্বনিম্ন উইথড্র $5!" },
        { status: 400 },
      );
    if (!isCryptoWithdraw && cleanAmount < 500)
      return NextResponse.json(
        { success: false, message: "সর্বনিম্ন উইথড্র ৳500!" },
        { status: 400 },
      );

    const verifiedMethodName = String(method).trim();
    if (!verifiedMethodName)
      return NextResponse.json(
        { success: false, message: "সঠিক মেথড নির্বাচন করুন!" },
        { status: 400 },
      );

    const cleanPin = String(pin).trim();
    if (!/^\d{4}$/.test(cleanPin))
      return NextResponse.json(
        { success: false, message: "পিন ৪ সংখ্যার হতে হবে!" },
        { status: 400 },
      );

    const user = await User.findById(auth.user._id || auth.user.userId);
    if (!user || user.isBlocked)
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি বা ব্লকড!" },
        { status: 403 },
      );

    const isPinMatch = await bcrypt.compare(cleanPin, user.pin);
    if (!isPinMatch)
      return NextResponse.json(
        { success: false, message: "পিন সঠিক নয়!" },
        { status: 400 },
      );

    if ((Number(user.turnover) || 0) > 0)
      return NextResponse.json(
        { success: false, message: `টার্নওভার বাকি: ৳${user.turnover}` },
        { status: 400 },
      );

    const accountRule = getAccountValidation(method);
    let finalAccountNumber;
    if (accountRule.onlyDigits && accountRule.maxLength === 11) {
      finalAccountNumber = user.phone;
    } else {
      finalAccountNumber = String(userProvidedAccount || "").trim();
      if (
        !finalAccountNumber ||
        finalAccountNumber.length < accountRule.minLength
      )
        return NextResponse.json(
          { success: false, message: `${accountRule.label} সঠিক নয়!` },
          { status: 400 },
        );
    }

    let agentUpdateInfo = null;
    let newBalance = 0;

    await session.withTransaction(async () => {
      const walletType = "main";
      const balanceField =
        walletType === "referral" ? "referralBalance" : "balance";

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id, [balanceField]: { $gte: balanceDeduction } },
        { $inc: { [balanceField]: -balanceDeduction } },
        { returnDocument: "after", session },
      );
      if (!updatedUser)
        throw new Error("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!");

      newBalance = updatedUser[balanceField];

      const availableAgents = await User.find({
        role: "agent",
        agentIsActive: true,
        agentIsBlocked: false,
        agentPhone: { $ne: "" },
        agentPaymentAccounts: {
          $elemMatch: {
            method: { $regex: new RegExp(`^${verifiedMethodName}$`, "i") },
          },
        },
      })
        .select("_id agentMainBalance agentWithdrawCommission")
        .session(session);

      if (!availableAgents || availableAgents.length === 0) {
        throw new Error(
          `দুঃখিত! এই মেথডে (${verifiedMethodName}) উইথড্র করার জন্য কোনো এজেন্ট নেই।`,
        );
      }

      // ✅ [মূল ফিক্স] পেন্ডিং টাকা বাদ দেওয়ার লজিক পুরোপুরি বাদ দেওয়া হলো
      let selectedAgent = null;
      for (const agent of availableAgents) {
        // 🆕 শুধু মেইন ব্যালেন্স চেক করবে (কারণ রিকোয়েস্টের সময়ই টাকা কাটা হয়েছে)
        const availableBalance = Number(agent.agentMainBalance) || 0;

        if (availableBalance >= balanceDeduction) {
          selectedAgent = agent;
          break;
        }
      }

      if (!selectedAgent) {
        throw new Error(
          `দুঃখিত! এই মেথডে (${verifiedMethodName}) উইথড্র করার জন্য পর্যাপ্ত এভেইলেবল ব্যালেন্সওয়ালা এজেন্ট নেই।`,
        );
      }

      const agentSettings = await AgentSettings.getSettings();
      const withdrawCommissionRate =
        selectedAgent.agentWithdrawCommission ??
        agentSettings.defaultWithdrawCommission ??
        0;
      const agentCommission = Math.round(
        (balanceDeduction * withdrawCommissionRate) / 100,
      );

      const updatedAgent = await User.findOneAndUpdate(
        {
          _id: selectedAgent._id,
          agentMainBalance: { $gte: balanceDeduction },
        },
        {
          $inc: {
            agentMainBalance: -balanceDeduction,
            agentCommissionBalance: agentCommission,
          },
        },
        { session },
      );
      if (!updatedAgent)
        throw new Error("এজেন্টের ব্যালেন্স আপডেট করতে সমস্যা হয়েছে!");

      agentUpdateInfo = {
        agentId: selectedAgent._id,
        agentCommissionRate: withdrawCommissionRate,
        agentCommission: agentCommission,
      };

      await Withdraw.create(
        [
          {
            uid: user.uid,
            amount: originalAmount,
            deductedBDT: balanceDeduction,
            originalAmount: originalAmount,
            originalCurrency: isCryptoWithdraw ? "USD" : "BDT",
            exchangeRate: isCryptoWithdraw ? USD_TO_BDT_RATE : 1,
            method: verifiedMethodName,
            accountNumber: finalAccountNumber,
            walletType: walletType,
            status: "pending",
            agentId: agentUpdateInfo.agentId,
            agentCommissionRate: agentUpdateInfo.agentCommissionRate,
            agentCommission: agentUpdateInfo.agentCommission,
            agentCommissionPaid: true,
          },
        ],
        { session },
      );
    });

    return NextResponse.json(
      { success: true, message: "✅ উইথড্র রিকোয়েস্ট সফল!", newBalance },
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
