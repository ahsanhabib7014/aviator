// import { NextResponse } from "next/server";
// import { verifyAuth } from "@/utils/authCheck";
// import User from "@/models/User";
// import Transaction from "@/models/Transaction";
// import AuditLog from "@/models/AuditLog";
// import dbConnect from "@/utils/db";

// export async function POST(req) {
//   try {
//     await dbConnect();

//     // 🔐 লগইন করা এজেন্ট
//     const auth = await verifyAuth("user", null, req);
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status || 401 },
//       );
//     }

//     const agentUser = auth.user;

//     // 🛡️ এজেন্ট কিনা চেক
//     if (agentUser.role !== "agent") {
//       return NextResponse.json(
//         { success: false, message: "শুধু এজেন্ট এই কাজ করতে পারবে" },
//         { status: 403 },
//       );
//     }

//     if (agentUser.agentIsBlocked) {
//       return NextResponse.json(
//         { success: false, message: "আপনার এজেন্ট অ্যাকাউন্ট ব্লক করা হয়েছে" },
//         { status: 403 },
//       );
//     }

//     const { userPhone, amount } = await req.json();
//     const taka = Number(amount);

//     // 📱 নাম্বার ভ্যালিডেশন
//     if (!/^01[3-9]\d{8}$/.test(String(userPhone || "").trim())) {
//       return NextResponse.json(
//         { success: false, message: "সঠিক ১১ ডিজিটের নাম্বার দিন" },
//         { status: 400 },
//       );
//     }

//     if (!taka || taka <= 0) {
//       return NextResponse.json(
//         { success: false, message: "সঠিক পরিমাণ লিখুন" },
//         { status: 400 },
//       );
//     }

//     // ১. এজেন্টের ব্যালেন্স চেক + কাটা (atomic, race-free)
//     const agent = await User.findOneAndUpdate(
//       {
//         _id: agentUser._id,
//         role: "agent",
//         agentIsBlocked: { $ne: true },
//         agentMainBalance: { $gte: taka },
//       },
//       { $inc: { agentMainBalance: -taka } },
//       { returnDocument: "after" },
//     );

//     if (!agent) {
//       return NextResponse.json(
//         { success: false, message: "ব্যালেন্স যথেষ্ট নয়" },
//         { status: 400 },
//       );
//     }

//     // ২. ইউজারের balance + সাপ্তাহিক + মাসিক turnover
//     const targetUser = await User.findOneAndUpdate(
//       { phone: userPhone.trim(), role: "user" },
//       {
//         $inc: {
//           balance: taka,
//           totalDeposit: taka,
//           weeklyDeposit: taka,
//           weeklyTurnover: taka,
//           monthlyTurnover: taka,
//         },
//       },
//       { returnDocument: "after" },
//     );

//     if (!targetUser) {
//       // ইউজার নেই → এজেন্টের টাকা ফেরত
//       await User.updateOne(
//         { _id: agent._id },
//         { $inc: { agentMainBalance: taka } },
//       );
//       return NextResponse.json(
//         { success: false, message: "এই নাম্বারে ইউজার পাওয়া যায়নি" },
//         { status: 404 },
//       );
//     }

//     // ২.৫ এজেন্টের কমিশন যোগ
//     const commissionRate = Number(agent.agentDepositCommission || 0);
//     const commission = (taka * commissionRate) / 100;

//     let newCommissionBalance = Number(agent.agentCommissionBalance || 0);

//     if (commission > 0) {
//       const updatedAgent = await User.findOneAndUpdate(
//         { _id: agent._id },
//         { $inc: { agentCommissionBalance: commission } },
//         { returnDocument: "after" },
//       );
//       if (updatedAgent) {
//         newCommissionBalance = updatedAgent.agentCommissionBalance;
//       }
//     }

//     // ৩. ট্রানজেকশন লগ
//     const trx = await Transaction.create({
//       userId: targetUser._id,
//       agentId: agentUser._id,
//       type: "AGENT_DEPOSIT",
//       method: "AGENT",
//       phone: userPhone.trim(),
//       amount: taka,
//       status: "ACCEPTED",
//       comment:
//         commission > 0
//           ? `এজেন্ট ডিপোজিট (কমিশন ৳${commission.toFixed(2)} @ ${commissionRate}%)`
//           : "এজেন্ট সরাসরি ডিপোজিট",
//     });

//     // ৪. অডিট লগ (oldData এবং newData ব্যবহার করে)
//     const ip =
//       req.headers.get("x-forwarded-for") ||
//       req.headers.get("x-real-ip") ||
//       "127.0.0.1";

//     await AuditLog.create({
//       adminId: agentUser._id,
//       adminPhone: agentUser.phone || agentUser.uid || "Agent",
//       action: "AGENT_DIRECT_DEPOSIT",
//       targetUser: targetUser.phone,

//       // 👇 এখানে oldData এবং newData (Object আকারে) পাঠানো হলো
//       oldData: {
//         agentBalanceBefore: `৳${Number(agent.agentMainBalance) + taka}`,
//         userBalanceBefore: `৳${Number(targetUser.balance) - taka}`,
//       },
//       newData: {
//         agentBalanceAfter: `৳${agent.agentMainBalance}`,
//         userBalanceAfter: `৳${targetUser.balance}`,
//         depositAmount: `৳${taka}`,
//       },

//       details: `এজেন্ট (${agentUser.phone}) ইউজার ${targetUser.phone}-কে ৳${taka} ডিপোজিট দিয়েছে। কমিশন: ৳${commission.toFixed(2)} (${commissionRate}%)। TrxID: ${trx._id}`,
//       ipAddress: ip,
//     });

//     return NextResponse.json({
//       success: true,
//       newBalance: agent.agentMainBalance,
//       commissionEarned: commission,
//       newCommissionBalance,
//       transactionId: trx._id,
//       message:
//         commission > 0
//           ? `ডিপোজিট সফল! কমিশন ৳${commission.toFixed(2)} যোগ হয়েছে`
//           : "ডিপোজিট সফল হয়েছে",
//     });
//   } catch (err) {
//     console.error("Agent deposit error:", err);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর" },
//       { status: 500 },
//     );
//   }
// }
// ///////////////////////////////////////////////
import { NextResponse } from "next/server";
import { verifyAuth } from "@/utils/authCheck";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";
import dbConnect from "@/utils/db";

export async function POST(req) {
  try {
    await dbConnect();

    // 🔐 লগইন করা এজেন্ট
    const auth = await verifyAuth("user", null, req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    const agentUser = auth.user;

    // 🛡️ এজেন্ট কিনা চেক
    if (agentUser.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "শুধু এজেন্ট এই কাজ করতে পারবে" },
        { status: 403 },
      );
    }

    if (agentUser.agentIsBlocked) {
      return NextResponse.json(
        { success: false, message: "আপনার এজেন্ট অ্যাকাউন্ট ব্লক করা হয়েছে" },
        { status: 403 },
      );
    }

    const { userPhone, amount } = await req.json();
    const taka = Number(amount);

    // 📱 নাম্বার ভ্যালিডেশন
    if (!/^01[3-9]\d{8}$/.test(String(userPhone || "").trim())) {
      return NextResponse.json(
        { success: false, message: "সঠিক ১১ ডিজিটের নাম্বার দিন" },
        { status: 400 },
      );
    }

    if (!taka || taka <= 0) {
      return NextResponse.json(
        { success: false, message: "সঠিক পরিমাণ লিখুন" },
        { status: 400 },
      );
    }

    // ১. এজেন্টের ব্যালেন্স চেক + কাটা (atomic, race-free)
    const agent = await User.findOneAndUpdate(
      {
        _id: agentUser._id,
        role: "agent",
        agentIsBlocked: { $ne: true },
        agentMainBalance: { $gte: taka },
      },
      { $inc: { agentMainBalance: -taka } },
      { returnDocument: "after" },
    );

    if (!agent) {
      return NextResponse.json(
        { success: false, message: "ব্যালেন্স যথেষ্ট নয়" },
        { status: 400 },
      );
    }

    // ২. ইউজারের balance + সাপ্তাহিক + মাসিক turnover
    const targetUser = await User.findOneAndUpdate(
      { phone: userPhone.trim(), role: "user" },
      {
        $inc: {
          balance: taka,
          totalDeposit: taka,
          turnover: taka,
          weeklyDeposit: taka,
          weeklyTurnover: taka,
          monthlyTurnover: taka,
        },
      },
      { returnDocument: "after" },
    );

    if (!targetUser) {
      // ইউজার নেই → এজেন্টের টাকা ফেরত
      await User.updateOne(
        { _id: agent._id },
        { $inc: { agentMainBalance: taka } },
      );
      return NextResponse.json(
        { success: false, message: "এই নাম্বারে ইউজার পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    // ২.৫ এজেন্টের কমিশন যোগ
    const commissionRate = Number(agent.agentDepositCommission || 0);
    const commission = (taka * commissionRate) / 100;

    let newCommissionBalance = Number(agent.agentCommissionBalance || 0);

    if (commission > 0) {
      const updatedAgent = await User.findOneAndUpdate(
        { _id: agent._id },
        { $inc: { agentCommissionBalance: commission } },
        { returnDocument: "after" },
      );
      if (updatedAgent) {
        newCommissionBalance = updatedAgent.agentCommissionBalance;
      }
    }

    // ৩. ট্রানজেকশন লগ
    const trx = await Transaction.create({
      userId: targetUser._id,
      agentId: agentUser._id,
      type: "AGENT_DEPOSIT",
      method: "AGENT",
      phone: userPhone.trim(),
      amount: taka,
      status: "ACCEPTED",
      comment:
        commission > 0
          ? `এজেন্ট ডিপোজিট (কমিশন ৳${commission.toFixed(2)} @ ${commissionRate}%)`
          : "এজেন্ট সরাসরি ডিপোজিট",
    });

    // ৪. অডিট লগ (oldData এবং newData ব্যবহার করে)
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    await AuditLog.create({
      adminId: agentUser._id,
      adminPhone: agentUser.phone || agentUser.uid || "Agent",
      action: "AGENT_DIRECT_DEPOSIT",
      targetUser: targetUser.phone,

      // 👇 এখানে oldData এবং newData (Object আকারে) পাঠানো হলো
      oldData: {
        agentBalanceBefore: `৳${Number(agent.agentMainBalance) + taka}`,
        userBalanceBefore: `৳${Number(targetUser.balance) - taka}`,
      },
      newData: {
        agentBalanceAfter: `৳${agent.agentMainBalance}`,
        userBalanceAfter: `৳${targetUser.balance}`,
        depositAmount: `৳${taka}`,
      },

      details: `এজেন্ট (${agentUser.phone}) ইউজার ${targetUser.phone}-কে ৳${taka} ডিপোজিট দিয়েছে। কমিশন: ৳${commission.toFixed(2)} (${commissionRate}%)। TrxID: ${trx._id}`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      newBalance: agent.agentMainBalance,
      commissionEarned: commission,
      newCommissionBalance,
      transactionId: trx._id,
      message:
        commission > 0
          ? `ডিপোজিট সফল! কমিশন ৳${commission.toFixed(2)} যোগ হয়েছে`
          : "ডিপোজিট সফল হয়েছে",
    });
  } catch (err) {
    console.error("Agent deposit error:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}

// 🆕 এই GET ফাংশনটি ডিপোজিট হিস্ট্রি দেখানোর জন্য যোগ করা হলো
export async function GET(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("user", null, req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    const agentUser = auth.user;

    if (agentUser.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "শুধু এজেন্ট এই কাজ করতে পারবে" },
        { status: 403 },
      );
    }

    // এজেন্টের করা সব AGENT_DEPOSIT ট্রানজেকশন খোঁজা
    const transactions = await Transaction.find({
      agentId: agentUser._id,
      type: "AGENT_DEPOSIT",
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // ডেটা ফরম্যাট করা
    const deposits = transactions.map((trx) => {
      // comment থেকে কমিশনের পরিমাণ বের করা
      let commission = 0;
      if (trx.comment && trx.comment.includes("কমিশন ৳")) {
        const match = trx.comment.match(/কমিশন ৳([\d.]+)/);
        if (match) commission = parseFloat(match[1]);
      }

      return {
        _id: trx._id,
        userPhone: trx.phone,
        amount: trx.amount,
        commission: commission,
        createdAt: trx.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      deposits: deposits || [],
    });
  } catch (err) {
    console.error("Agent deposit history error:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
