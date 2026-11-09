
import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/utils/db";
import Deposit from "@/models/Deposit";
import User from "@/models/User";
import Setting from "@/models/Setting";
import AuditLog from "@/models/AuditLog"; // 🆕 AuditLog ইমপোর্ট

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// ✅ Recursive sort — NOWPayments official নিয়ম
function sortObject(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObject(obj[key]);
      return result;
    }, {});
}

// ✅ IPN signature verify (timing-safe)
function verifyIPN(body, signature) {
  try {
    const sortedBody = JSON.stringify(sortObject(body));
    const hmac = crypto.createHmac("sha512", IPN_SECRET);
    hmac.update(sortedBody);
    const expectedSig = hmac.digest("hex");
    const a = Buffer.from(expectedSig, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error("verifyIPN error:", err);
    return false;
  }
}

// ✅ NowPayments status → Deposit status mapping
function mapPaymentStatus(npStatus) {
  switch (npStatus) {
    case "finished":
      return "approved";
    case "partially_paid":
      return "partial";
    case "failed":
    case "refunded":
    case "expired":
      return "rejected";
    case "waiting":
    case "confirming":
    case "confirmed":
    case "sending":
    default:
      return "pending";
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // ✅ ১. Signature header check
    const signature = req.headers.get("x-nowpayments-sig");
    if (!signature) {
      console.error("❌ No signature header");
      return NextResponse.json(
        { success: false, message: "No signature" },
        { status: 401 },
      );
    }

    // ✅ ২. Body parse
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 },
      );
    }

    // ✅ ৩. Signature verify
    if (!verifyIPN(body, signature)) {
      console.error("❌ Invalid IPN signature");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 },
      );
    }

    // ✅ ৪. তথ্য extract
    const {
      payment_status,
      price_amount,
      actually_paid,
      order_id,
      payment_id,
      pay_address,
      pay_currency,
    } = body;

    console.log("✅ IPN received:", {
      payment_status,
      order_id,
      payment_id,
      price_amount,
      actually_paid,
    });

    // ✅ ৫. order_id validate
    if (
      !order_id ||
      typeof order_id !== "string" ||
      !order_id.startsWith("DEP-")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order_id" },
        { status: 400 },
      );
    }

    // ✅ ৬. uid extract (hyphen-safe)
    const rest = order_id.slice(4);
    const lastDash = rest.lastIndexOf("-");
    if (lastDash === -1) {
      return NextResponse.json(
        { success: false, message: "Invalid order_id format" },
        { status: 400 },
      );
    }
    const userUid = rest.slice(0, lastDash);

    // ✅ ৭. transactionId = order_id
    const txnId = order_id;

    // ✅ ৮. Status map
    const depositStatus = mapPaymentStatus(payment_status);

    // ✅ ৯. Rate fetch
    const rateSetting = await Setting.findOne({ key: "usdToBdtRate" });
    const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;

    // ✅ ১০. Amount নির্বাচন
    const invoiceUsd = Number(price_amount) || 0;
    const actualUsd = Number(actually_paid) || invoiceUsd;
    const MAX_MULTIPLIER = 2;
    const maxAllowed = invoiceUsd * MAX_MULTIPLIER;

    let paidUsd = actualUsd;
    if (actualUsd > maxAllowed) {
      console.warn(
        `⚠️ Overpayment detected: $${actualUsd} > $${maxAllowed}, capping`,
      );
      paidUsd = maxAllowed;
    }

    if (!paidUsd || paidUsd <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 },
      );
    }

    const bdtAmount = Math.round(paidUsd * USD_TO_BDT_RATE);

    // ✅ ১১. Deposit record খুঁজুন বা তৈরি করুন (duplicate-safe)
    let deposit = await Deposit.findOne({ transactionId: txnId });
    const wasAlreadyProcessedBefore = deposit
      ? ["approved", "partial"].includes(deposit.status)
      : false;

    if (!deposit) {
      console.warn(`⚠️ No pending record found for ${txnId}, creating new`);
      deposit = await Deposit.create({
        uid: userUid,
        amount: bdtAmount,
        originalAmount: paidUsd,
        originalCurrency: "USD",
        exchangeRate: USD_TO_BDT_RATE,
        method: "NowPayments",
        senderNumber: pay_address || "NOW",
        transactionId: txnId,
        status: depositStatus,
        adminNote: `NowPayments: ${payment_status} (${pay_currency || "crypto"})`,
      });
    } else {
      // ✅ Existing record — duplicate check
      const wasAlreadyProcessed = ["approved", "partial"].includes(
        deposit.status,
      );
      const nowProcessed = ["approved", "partial"].includes(depositStatus);

      if (wasAlreadyProcessed && nowProcessed) {
        console.log("⚠️ Already processed — ignoring duplicate");
        return NextResponse.json(
          { success: true, message: "Already processed" },
          { status: 200 },
        );
      }

      // ✅ Update existing record
      deposit.status = depositStatus;
      deposit.amount = bdtAmount;
      deposit.originalAmount = paidUsd;
      deposit.senderNumber = pay_address || deposit.senderNumber;
      deposit.adminNote = `NowPayments: ${payment_status} (${pay_currency || "crypto"})`;
      await deposit.save();
    }

    // ✅ ১২. pending/rejected হলে balance দেব না
    if (depositStatus === "pending" || depositStatus === "rejected") {
      console.log(`⏳ Status: ${depositStatus} — no balance added`);

      // 🆕 rejected হলে AuditLog-এ এন্ট্রি (রিজেক্টের হিসাব)
      if (depositStatus === "rejected" && !wasAlreadyProcessedBefore) {
        try {
          await AuditLog.create({
            adminId: null,
            adminPhone: "nowpayments_ipn",
            action: "NOWPAYMENTS_DEPOSIT_REJECT",
            targetUser: userUid,
            oldData: {
              status: "pending",
              depositId: deposit._id,
              amount: deposit.amount,
            },
            newData: {
              status: "rejected",
              depositId: deposit._id,
              amount: bdtAmount,
              transactionId: txnId,
              paymentStatus: payment_status,
            },
            details: `NowPayments IPN — ${userUid} এর ডিপোজিট বাতিল হয়েছে (${payment_status})`,
            ipAddress: req.headers.get("x-forwarded-for") || "N/A",
            createdAt: new Date(),
          });
        } catch (auditErr) {
          console.error("❌ AuditLog (Reject) save error:", auditErr);
        }
      }

      return NextResponse.json(
        { success: true, message: `Status: ${depositStatus}` },
        { status: 200 },
      );
    }

    // ✅ ১৩. approved বা partial — proportionate balance যোগ
    const user = await User.findOne({ uid: userUid });
    if (!user) {
      console.error("❌ User not found:", userUid);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const oldUserBalance = user.balance || 0;

    const updatedUser = await User.findOneAndUpdate(
      { uid: userUid },
      {
        $inc: {
          balance: bdtAmount,
          turnover: bdtAmount,
        },
      },
      { returnDocument: "after" },
    );

    const newUserBalance = updatedUser?.balance || oldUserBalance + bdtAmount;

    const statusEmoji = depositStatus === "approved" ? "✅" : "⚠️";
    console.log(
      `${statusEmoji} Balance added: ৳${bdtAmount} to ${userUid} (${depositStatus})`,
    );

    // 🆕 ১৪. AuditLog-এ এন্ট্রি (NowPayments IPN থেকে অ্যাপ্রুভ হলে)
    try {
      await AuditLog.create({
        adminId: null,
        adminPhone: "nowpayments_ipn",
        action: "NOWPAYMENTS_DEPOSIT_APPROVE", // 🆕 নির্দিষ্ট অ্যাকশন
        targetUser: userUid,
        oldData: {
          status: "pending",
          depositId: deposit._id,
          amount: deposit.amount,
          userBalance: oldUserBalance,
        },
        newData: {
          status: depositStatus,
          depositId: deposit._id,
          amount: bdtAmount,
          transactionId: txnId,
          paymentStatus: payment_status,
          userBalance: newUserBalance,
        },
        details: `NowPayments IPN — ${userUid} এর ৳${bdtAmount} ডিপোজিট ${depositStatus} হয়েছে (${payment_status})। ব্যালেন্স ৳${oldUserBalance} → ৳${newUserBalance}`,
        ipAddress: req.headers.get("x-forwarded-for") || "N/A",
        createdAt: new Date(),
      });
      console.log("✅ AuditLog (NowPayments) saved successfully!");
    } catch (auditErr) {
      console.error("❌ AuditLog (NowPayments) save error:", auditErr);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("IPN Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}