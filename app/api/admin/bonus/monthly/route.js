
import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import BonusSetting from "@/models/BonusSetting";
import BonusRunLog from "@/models/BonusRunLog";
import AuditLog from "@/models/AuditLog"; // 🆕 AuditLog ইমপোর্ট
import { verifyAuth } from "@/utils/authCheck";

// 🆕 গ্লোবাল লক
let isMonthlyBonusRunning = false;

// ==========================================
// মাসের key বের করার helper
// ==========================================
function getMonthKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// ==========================================
// ✅ POST
// ==========================================
export async function POST(req) {
  const startedAt = Date.now();

  if (isMonthlyBonusRunning) {
    return NextResponse.json(
      {
        success: false,
        message: "মাসিক বোনাস বর্তমানে প্রসেস হচ্ছে, দয়া করে অপেক্ষা করুন!",
      },
      { status: 429 },
    );
  }

  try {
    await dbConnect();
    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    isMonthlyBonusRunning = true;
    // 🆕 req পাস করা হলো (IP Address বের করার জন্য)
    return await executeMonthlyBonus(startedAt, auth.userId, req);
  } catch (error) {
    console.error("Monthly Bonus POST Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  } finally {
    isMonthlyBonusRunning = false;
  }
}

// ==========================================
// ✅ GET
// ==========================================
export async function GET(req) {
  const startedAt = Date.now();

  if (isMonthlyBonusRunning) {
    return NextResponse.json(
      {
        success: false,
        message: "মাসিক বোনাস বর্তমানে প্রসেস হচ্ছে, দয়া করে অপেক্ষা করুন!",
      },
      { status: 429 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: "অরক্ষিত বা আনঅথরাইজড ক্রন রিকোয়েস্ট!" },
      { status: 401 },
    );
  }

  try {
    await dbConnect();
    isMonthlyBonusRunning = true;
    // 🆕 req পাস করা হলো
    return await executeMonthlyBonus(startedAt, "cron_system", req);
  } catch (error) {
    console.error("Monthly Bonus GET Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  } finally {
    isMonthlyBonusRunning = false;
  }
}

// ==========================================
// 🔄 মূল লজিক
// ==========================================
async function executeMonthlyBonus(startedAt, runBy, req) {
  let settings = await BonusSetting.findOne({});
  if (!settings) {
    settings = await BonusSetting.create({});
  }

  if (!settings.topRankerEnabled) {
    return NextResponse.json(
      { success: false, message: "মাসিক টপ র‍্যাংকার বন্ধ আছে!" },
      { status: 400 },
    );
  }

  const thisMonthKey = getMonthKey();

  // 🆕 লসের ওপর ফিল্টার এবং সর্ট
  const allUsersWithLoss = await User.find({
    role: "user",
    monthlyLost: { $gt: 0 },
  })
    .sort({ monthlyLost: -1 })
    .lean();

  if (allUsersWithLoss.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message:
          "এই মাসে কোনো লসকারী ইউজার নেই — টপ র‍্যাংকার দেওয়ার মতো কেউ নেই।",
      },
      { status: 400 },
    );
  }

  const topN = settings.topRankerCount || 10;
  const topUsers = allUsersWithLoss.slice(0, topN);
  const notInTop = allUsersWithLoss.slice(topN);

  const rankMap = new Map();
  topUsers.forEach((u, idx) => {
    rankMap.set(String(u._id), idx + 1);
  });

  const eligibleUsers = topUsers.filter(
    (u) =>
      !u.monthlyBonusHistory?.some(
        (h) => h.month === thisMonthKey && h.type === "top_ranker",
      ),
  );

  const alreadyGotUsers = topUsers.filter((u) =>
    u.monthlyBonusHistory?.some(
      (h) => h.month === thisMonthKey && h.type === "top_ranker",
    ),
  );

  if (eligibleUsers.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "এই মাসে সব টপ ইউজার আগেই বোনাস পেয়ে গেছে।",
      },
      { status: 400 },
    );
  }

  let totalBonus = 0;
  let raceCaught = 0;
  let failedCount = 0;
  const details = [];
  const skipped = [];

  for (const u of alreadyGotUsers) {
    skipped.push({
      uid: u.uid,
      phone: u.phone,
      reason: "already_got",
      monthlyCashback: u.monthlyCashbackReceived || 0,
      monthlyTurnover: u.monthlyTurnover || 0,
    });
  }

  for (const u of notInTop) {
    skipped.push({
      uid: u.uid,
      phone: u.phone,
      reason: `not_in_top_${topN}`,
      monthlyCashback: u.monthlyCashbackReceived || 0,
      monthlyTurnover: u.monthlyTurnover || 0,
    });
  }

  for (const user of eligibleUsers) {
    const rank = rankMap.get(String(user._id));

    if (!rank) {
      skipped.push({
        uid: user.uid,
        phone: user.phone,
        reason: "rank_not_found",
        monthlyCashback: user.monthlyCashbackReceived || 0,
        monthlyTurnover: user.monthlyTurnover || 0,
      });
      continue;
    }

    let percent = 0;
    if (rank === 1) percent = settings.rank1Percent ?? 0;
    else if (rank === 2) percent = settings.rank2Percent ?? 0;
    else if (rank === 3) percent = settings.rank3Percent ?? 0;
    else if (rank === 4) percent = settings.rank4Percent ?? 0;
    else if (rank === 5) percent = settings.rank5Percent ?? 0;
    else if (rank === 6) percent = settings.rank6Percent ?? 0;
    else if (rank === 7) percent = settings.rank7Percent ?? 0;
    else if (rank === 8) percent = settings.rank8Percent ?? 0;
    else if (rank === 9) percent = settings.rank9Percent ?? 0;
    else if (rank === 10) percent = settings.rank10Percent ?? 0;
    else if (rank >= 11) percent = settings.rank11PlusPercent ?? 0;

    if (percent <= 0) {
      skipped.push({
        uid: user.uid,
        phone: user.phone,
        reason: "no_percent_for_rank",
        monthlyCashback: user.monthlyCashbackReceived || 0,
        monthlyTurnover: user.monthlyTurnover || 0,
      });
      continue;
    }

    // 🆕 লসের ওপর শতাংশ হিসাব
    const calculatedPrize = Math.floor((user.monthlyLost * percent) / 100);

    const maxCap = settings.topRankerMaxBonus || 5000;
    const prize = Math.min(calculatedPrize, maxCap);

    if (prize <= 0) {
      skipped.push({
        uid: user.uid,
        phone: user.phone,
        reason: "prize_amount_zero",
        monthlyCashback: user.monthlyCashbackReceived || 0,
        monthlyTurnover: user.monthlyTurnover || 0,
      });
      continue;
    }

    const topRankerTurnover = prize * 3;

    try {
      const updateResult = await User.updateOne(
        {
          _id: user._id,
          monthlyBonusHistory: {
            $not: {
              $elemMatch: {
                month: thisMonthKey,
                type: "top_ranker",
              },
            },
          },
        },
        {
          $inc: { balance: prize, turnover: topRankerTurnover },
          $set: { lastMonthlyBonusAt: new Date() },
          $push: {
            monthlyBonusHistory: {
              amount: prize,
              type: "top_ranker",
              month: thisMonthKey,
              rank: rank,
              givenAt: new Date(),
            },
            monthlyTurnoverHistory: {
              month: thisMonthKey,
              monthlyTurnover: user.monthlyTurnover || 0,
              monthlyLost: user.monthlyLost || 0,
              monthlyCashbackReceived: user.monthlyCashbackReceived || 0,
              resetAt: new Date(),
            },
          },
        },
      );

      if (updateResult.modifiedCount > 0) {
        totalBonus += prize;
        details.push({
          rank,
          uid: user.uid,
          phone: user.phone,
          monthlyLost: user.monthlyLost || 0,
          percent,
          prize,
          turnover: topRankerTurnover,
        });
      } else {
        raceCaught++;
        skipped.push({
          uid: user.uid,
          phone: user.phone,
          reason: "race_caught",
          monthlyCashback: user.monthlyCashbackReceived || 0,
          monthlyTurnover: user.monthlyTurnover || 0,
        });
      }
    } catch (err) {
      failedCount++;
      console.error(`Top ranker error for ${user.uid}:`, err.message);
      skipped.push({
        uid: user.uid,
        phone: user.phone,
        reason: "error: " + err.message,
        monthlyCashback: user.monthlyCashbackReceived || 0,
        monthlyTurnover: user.monthlyTurnover || 0,
      });
    }
  }

  await BonusSetting.updateOne(
    { _id: settings._id },
    {
      $set: { lastMonthlyBonusAt: new Date() },
      $inc: { monthlyBonusGivenCount: 1 },
    },
  );

  if (details.length > 0) {
    const winnerUids = details.map((d) => d.uid);
    await User.updateMany(
      { role: "user", uid: { $in: winnerUids } },
      {
        $set: {
          monthlyCashbackReceived: 0,
          monthlyTurnover: 0,
          monthlyLost: 0,
        },
      },
    );
  }

  // ✅ ১. BonusRunLog সেভ (আগের মতোই)
  await BonusRunLog.create({
    type: "monthly",
    periodKey: thisMonthKey,
    summary: {
      totalGiven: details.length,
      totalSkipped: skipped.length,
      totalAmount: totalBonus,
      totalWinners: details.length,
      totalBonus,
      raceCaught,
      failedCount,
      durationMs: Date.now() - startedAt,
    },
    given: details,
    skipped,
    runBy: runBy,
    runAt: new Date(),
  });

  // 🆕 ২. AuditLog-এও এন্ট্রি (অ্যাডমিন প্যানেলে দেখার জন্য)
  try {
    let adminId = null;
    let adminPhone = "cron_system";

    if (runBy && runBy !== "cron_system") {
      adminId = runBy;
      // অ্যাডমিনের ফোন নাম্বার বের করা
      const adminUser = await User.findById(runBy).select("phone").lean();
      if (adminUser) {
        adminPhone = adminUser.phone;
      }
    }

    await AuditLog.create({
      adminId: adminId || null,
      adminPhone: adminPhone,
      action: "MONTHLY_BONUS",
      targetUser: `${details.length} জন ইউজার`,
      oldData: {
        totalMonthlyLoss: allUsersWithLoss.reduce(
          (sum, u) => sum + (u.monthlyLost || 0),
          0,
        ),
      },
      newData: {
        totalBonus,
        totalWinners: details.length,
        totalSkipped: skipped.length,
        monthKey: thisMonthKey,
        topRankerMaxBonus: settings.topRankerMaxBonus || 5000,
      },
      details: `মাসিক টপ র্যাংকার বোনাস দেওয়া হয়েছে — ${details.length} জন পেয়েছে, মোট ৳${totalBonus}`,
      ipAddress:
        req?.headers?.get("x-forwarded-for") ||
        req?.headers?.get("x-real-ip") ||
        "N/A",
      createdAt: new Date(),
    });
    console.log("✅ AuditLog saved successfully!");
  } catch (auditErr) {
    console.error("❌ AuditLog save error:", auditErr);
  }

  return NextResponse.json(
    {
      success: true,
      message: `✅ মাসিক টপ র্যাংকার বোনাস সফলভাবে দেওয়া হয়েছে!`,
      summary: {
        totalWinners: details.length,
        totalSkipped: skipped.length,
        totalBonus,
        monthKey: thisMonthKey,
        raceCaught,
        failedCount,
      },
      details,
      skipped,
    },
    { status: 200 },
  );
}
