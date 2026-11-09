// import { NextResponse } from "next/server";
// import dbConnect from "@/utils/db";
// import { GameSetting } from "@/models/GameSetting";
// import { verifyAuth } from "@/utils/authCheck";

// export async function GET(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth("admin");
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message || "অননুমোদিত" },
//         { status: auth.status || 403 },
//       );
//     }

//     let settings = await GameSetting.findOne({});
//     if (!settings) settings = await GameSetting.create({});

//     return NextResponse.json({ success: true, settings });
//   } catch (error) {
//     console.error("GET Settings Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth("admin");
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message || "অননুমোদিত" },
//         { status: auth.status || 403 },
//       );
//     }

//     const body = await req.json();
//     const {
//       targetProfitPercent,
//       forceMultiplier,
//       isActive,
//       singleNumberMultiplier,
//       oddEvenMultiplier,
//       dozenMultiplier,
//       redBlackMultiplier, // 🆕 Red/Black এর গুণক
//     } = body;

//     let settings = await GameSetting.findOne({});
//     if (!settings) settings = new GameSetting();

//     // টার্গেট প্রফিট ০ সেভ করার পারফেক্ট লজিক
//     const parsedProfit = Number(targetProfitPercent);
//     if (
//       !isNaN(parsedProfit) &&
//       targetProfitPercent !== "" &&
//       targetProfitPercent !== null &&
//       targetProfitPercent !== undefined
//     ) {
//       settings.targetProfitPercent = parsedProfit;
//     } else {
//       settings.targetProfitPercent = 20;
//     }

//     const parsedSingle = Number(singleNumberMultiplier);
//     settings.singleNumberMultiplier =
//       !isNaN(parsedSingle) && singleNumberMultiplier !== "" ? parsedSingle : 36;

//     const parsedOddEven = Number(oddEvenMultiplier);
//     settings.oddEvenMultiplier =
//       !isNaN(parsedOddEven) && oddEvenMultiplier !== "" ? parsedOddEven : 2;

//     const parsedDozen = Number(dozenMultiplier);
//     settings.dozenMultiplier =
//       !isNaN(parsedDozen) && dozenMultiplier !== "" ? parsedDozen : 3;

//     // 🆕 Red/Black গুণক সেভ করা
//     const parsedRedBlack = Number(redBlackMultiplier);
//     settings.redBlackMultiplier =
//       !isNaN(parsedRedBlack) && redBlackMultiplier !== "" ? parsedRedBlack : 2;

//     // ফোর্স রেজাল্ট ০ বা খালি হলে null হবে
//     const parsedForce = Number(forceMultiplier);
//     settings.forceMultiplier =
//       forceMultiplier !== "" &&
//       forceMultiplier !== null &&
//       forceMultiplier !== undefined &&
//       !isNaN(parsedForce) &&
//       parsedForce >= 0
//         ? parsedForce
//         : null;

//     settings.isActive = isActive;

//     await settings.save();

//     return NextResponse.json({
//       success: true,
//       message: "সেটিংস আপডেট হয়েছে",
//       settings,
//     });
//   } catch (error) {
//     console.error("POST Settings Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 },
//     );
//   }
// }
// /////////////////////////////////////////////////////
import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import { GameSetting } from "@/models/GameSetting";
import { verifyAuth } from "@/utils/authCheck";

export async function GET(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message || "অননুমোদিত" },
        { status: auth.status || 403 },
      );
    }

    let settings = await GameSetting.findOne({});
    if (!settings) settings = await GameSetting.create({});

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("GET Settings Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message || "অননুমোদিত" },
        { status: auth.status || 403 },
      );
    }

    const body = await req.json();
    const {
      targetProfitPercent,
      forceMultiplier,
      isActive,
      singleNumberMultiplier,
      oddEvenMultiplier,
      dozenMultiplier,
      redBlackMultiplier,
      lowHighMultiplier,  // 🆕
      columnMultiplier,   // 🆕
    } = body;

    let settings = await GameSetting.findOne({});
    if (!settings) settings = new GameSetting();

    // টার্গেট প্রফিট ০ সেভ করার পারফেক্ট লজিক
    const parsedProfit = Number(targetProfitPercent);
    if (
      !isNaN(parsedProfit) &&
      targetProfitPercent !== "" &&
      targetProfitPercent !== null &&
      targetProfitPercent !== undefined
    ) {
      settings.targetProfitPercent = parsedProfit;
    } else {
      settings.targetProfitPercent = 20;
    }

    const parsedSingle = Number(singleNumberMultiplier);
    settings.singleNumberMultiplier =
      !isNaN(parsedSingle) && singleNumberMultiplier !== "" ? parsedSingle : 36;

    const parsedOddEven = Number(oddEvenMultiplier);
    settings.oddEvenMultiplier =
      !isNaN(parsedOddEven) && oddEvenMultiplier !== "" ? parsedOddEven : 2;

    const parsedDozen = Number(dozenMultiplier);
    settings.dozenMultiplier =
      !isNaN(parsedDozen) && dozenMultiplier !== "" ? parsedDozen : 3;

    const parsedRedBlack = Number(redBlackMultiplier);
    settings.redBlackMultiplier =
      !isNaN(parsedRedBlack) && redBlackMultiplier !== "" ? parsedRedBlack : 2;

    // 🆕 1-18, 19-36 গুণক সেভ করা
    const parsedLowHigh = Number(lowHighMultiplier);
    settings.lowHighMultiplier =
      !isNaN(parsedLowHigh) && lowHighMultiplier !== "" ? parsedLowHigh : 2;

    // 🆕 2:1 Column গুণক সেভ করা
    const parsedColumn = Number(columnMultiplier);
    settings.columnMultiplier =
      !isNaN(parsedColumn) && columnMultiplier !== "" ? parsedColumn : 2;

    // ফোর্স রেজাল্ট ০ বা খালি হলে null হবে
    const parsedForce = Number(forceMultiplier);
    settings.forceMultiplier =
      forceMultiplier !== "" &&
      forceMultiplier !== null &&
      forceMultiplier !== undefined &&
      !isNaN(parsedForce) &&
      parsedForce >= 0
        ? parsedForce
        : null;

    settings.isActive = isActive;

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "সেটিংস আপডেট হয়েছে",
      settings,
    });
  } catch (error) {
    console.error("POST Settings Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}