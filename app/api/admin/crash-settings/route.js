// import { NextResponse } from "next/server";
// import dbConnect from "@/utils/db";
// import { CrashGameSetting } from "@/models/CrashGameSetting";

// export async function GET() {
//   try {
//     await dbConnect();
//     const settings = await CrashGameSetting.findOne({});
//     const liveState = global.crashGameState;
    
//     return NextResponse.json({
//       success: true,
//       settings: settings || { targetProfitPercent: 0, forceMultiplier: null },
//       liveState: liveState || {}
//     });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   try {
//     await dbConnect();
//     const body = await req.json();
    
//     const targetProfitPercent = Number(body.targetProfitPercent);
//     let forceMultiplier = body.forceMultiplier;
    
//     if (forceMultiplier === "" || forceMultiplier === null || forceMultiplier === undefined) {
//       forceMultiplier = null;
//     } else {
//       forceMultiplier = Number(forceMultiplier);
//     }

//     let settings = await CrashGameSetting.findOne({});
    
//     if (!settings) {
//       settings = new CrashGameSetting({
//         targetProfitPercent: isNaN(targetProfitPercent) ? 0 : targetProfitPercent,
//         forceMultiplier: forceMultiplier
//       });
//     } else {
//       if (!isNaN(targetProfitPercent)) settings.targetProfitPercent = targetProfitPercent;
//       settings.forceMultiplier = forceMultiplier;
//     }

//     await settings.save();
//     return NextResponse.json({ success: true, message: "সেটিংস সেভ হয়েছে!" });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
//   }
// }
// //////////////////////////////////////////
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // 🆕 JWT ইমপোর্ট
import dbConnect from "@/utils/db";
import User from "@/models/User"; // 🆕 User মডেল ইমপোর্ট
import { CrashGameSetting } from "@/models/CrashGameSetting";

// 🆕 অ্যাডমিন চেক করার হেল্পার ফাংশন
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return { error: "লগইন করুন", status: 401 };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const identifier = decoded.uid || decoded.phone || decoded.userId;

    const user = await User.findOne({ $or: [{ uid: identifier }, { phone: identifier }] });
    
    if (!user || user.role !== "admin") {
      return { error: "অ্যাডমিন অ্যাক্সেস নেই", status: 403 };
    }
    return { user };
  } catch (err) {
    return { error: "টোকেন অবৈধ", status: 401 };
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    // 🆕 ১. অ্যাডমিন চেক
    const auth = await verifyAdmin(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const settings = await CrashGameSetting.findOne({});
    const liveState = global.crashGameState;
    
    return NextResponse.json({ 
      success: true, 
      settings: settings || { targetProfitPercent: 0, forceMultiplier: null },
      liveState: liveState || {}
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // 🆕 ১. অ্যাডমিন চেক
    const auth = await verifyAdmin(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    
    const targetProfitPercent = Number(body.targetProfitPercent);
    let forceMultiplier = body.forceMultiplier;
    
    if (forceMultiplier === "" || forceMultiplier === null || forceMultiplier === undefined) {
      forceMultiplier = null;
    } else {
      forceMultiplier = Number(forceMultiplier);
    }

    let settings = await CrashGameSetting.findOne({});
    
    if (!settings) {
      settings = new CrashGameSetting({
        targetProfitPercent: isNaN(targetProfitPercent) ? 0 : targetProfitPercent,
        forceMultiplier: forceMultiplier
      });
    } else {
      if (!isNaN(targetProfitPercent)) settings.targetProfitPercent = targetProfitPercent;
      settings.forceMultiplier = forceMultiplier;
    }

    await settings.save();
    return NextResponse.json({ success: true, message: "সেটিংস সেভ হয়েছে!" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "সার্ভার এরর" }, { status: 500 });
  }
}