// import { NextResponse } from "next/server";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import { verifyAuth } from "@/utils/authCheck";
// import AuditLog from "@/models/AuditLog";

// // ১. ইউজার সার্চ করার জন্য GET এপিআই
// export async function GET(req) {
//   try {
//     await dbConnect();

//     // অথেন্টিকেশন চেক (সুপার অ্যাডমিন বা সাব-অ্যাডমিন)
//     const auth = await verifyAuth("admin");
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status },
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get("query");

//     if (!query) {
//       return NextResponse.json(
//         { success: false, message: "অনুগ্রহ করে ইউজার আইডি বা ফোন নম্বর দিন।" },
//         { status: 400 },
//       );
//     }

//     // UID অথবা Phone দিয়ে ইউজার খোঁজা
//     const users = await User.find({
//       $or: [
//         { uid: { $regex: query, $options: "i" } },
//         { phone: { $regex: query, $options: "i" } },
//       ],
//     }).select("uid phone role permissions");

//     return NextResponse.json({ success: true, users }, { status: 200 });
//   } catch (error) {
//     console.error("Search User Error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার অভ্যন্তরীণ ত্রুটি ঘটেছে!" },
//       { status: 500 },
//     );
//   }
// }

// // ২. ইউজারের রোল ও পারমিশন আপডেট করার জন্য PUT এপিআই
// export async function PUT(req) {
//   try {
//     await dbConnect();

//     // ✅ ১. অথেন্টিকেশন চেক
//     const auth = await verifyAuth("admin");
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status },
//       );
//     }

//     // ✅ ২. শুধুমাত্র সুপার অ্যাডমিন এই কাজ করতে পারবে
//     if (auth.user.role !== "admin") {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "শুধুমাত্র সুপার অ্যাডমিন রোল ও পারমিশন পরিবর্তন করতে পারবেন!",
//         },
//         { status: 403 },
//       );
//     }

//     const adminUser = auth.user;
//     const { userId, role, permissions } = await req.json();

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "ইউজার আইডি পাওয়া যায়নি!" },
//         { status: 400 },
//       );
//     }

//     // ✅ ৩. নিজের রোল বা পারমিশন পরিবর্তন আটকানো
//     if (userId === adminUser._id.toString()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "আপনি নিজের রোল বা পারমিশন পরিবর্তন করতে পারবেন না!",
//         },
//         { status: 400 },
//       );
//     }

//     // আপডেট করার আগে ইউজারের আগের তথ্য ধরে রাখা
//     const existingUser = await User.findById(userId);
//     if (!existingUser) {
//       return NextResponse.json(
//         { success: false, message: "ইউজার ডাটাবেজে খুঁজে পাওয়া যায়নি!" },
//         { status: 404 },
//       );
//     }

//     // ডাটাবেজে ইউজার আপডেট করা
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { role, permissions },
//       { returnDocument: "after" },
//     );

//     if (!updatedUser) {
//       return NextResponse.json(
//         { success: false, message: "ইউজার আপডেট করতে সমস্যা হয়েছে!" },
//         { status: 500 },
//       );
//     }

//     // ==========================================
//     // ✅ রোল ও পারমিশন আপডেটের অডিট লগ সেভ করা
//     // ==========================================
//     if (adminUser) {
//       const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
//       await AuditLog.create({
//         adminId: adminUser._id,
//         adminPhone: adminUser.phone || adminUser.uid,
//         action: "UPDATE_USER_PERMISSIONS",
//         targetUser: updatedUser.uid || updatedUser.phone,
//         oldData: {
//           role: existingUser.role,
//           permissions: existingUser.permissions,
//         },
//         newData: {
//           role: updatedUser.role,
//           permissions: updatedUser.permissions,
//         },
//         details: `সুপার অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ইউজার (${updatedUser.uid || updatedUser.phone}) এর রোল ও পারমিশন আপডেট করা হয়েছে।`,
//         ipAddress: ip,
//       });
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "পারমিশন সফলভাবে আপডেট করা হয়েছে!",
//         user: updatedUser,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Update Permission Error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার অভ্যন্তরীণ ত্রুটি ঘটেছে!" },
//       { status: 500 },
//     );
//   }
// }
// /////////////////////////////////////////
import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog";

// ১. ইউজার সার্চ করার জন্য GET এপিআই
export async function GET(req) {
  try {
    await dbConnect();

    // অথেন্টিকেশন চেক (সুপার অ্যাডমিন বা সাব-অ্যাডমিন)
    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { success: false, message: "অনুগ্রহ করে ইউজার আইডি বা ফোন নম্বর দিন।" },
        { status: 400 },
      );
    }

    // UID অথবা Phone দিয়ে ইউজার খোঁজা
    const users = await User.find({
      $or: [
        { uid: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    }).select("uid phone role permissions permissionExpiresAt"); // 🆕 permissionExpiresAt যুক্ত করা হলো

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Search User Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার অভ্যন্তরীণ ত্রুটি ঘটেছে!" },
      { status: 500 },
    );
  }
}

// ২. ইউজারের রোল ও পারমিশন আপডেট করার জন্য PUT এপিআই
export async function PUT(req) {
  try {
    await dbConnect();

    // ✅ ১. অথেন্টিকেশন চেক
    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    // ✅ ২. শুধুমাত্র সুপার অ্যাডমিন এই কাজ করতে পারবে
    if (auth.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "শুধুমাত্র সুপার অ্যাডমিন রোল ও পারমিশন পরিবর্তন করতে পারবেন!",
        },
        { status: 403 },
      );
    }

    const adminUser = auth.user;
    // 🆕 expiresInMinutes রিসিভ করা হলো
    const { userId, role, permissions, expiresInMinutes } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি পাওয়া যায়নি!" },
        { status: 400 },
      );
    }

    // ✅ ৩. নিজের রোল বা পারমিশন পরিবর্তন আটকানো
    if (userId === adminUser._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "আপনি নিজের রোল বা পারমিশন পরিবর্তন করতে পারবেন না!",
        },
        { status: 400 },
      );
    }

    // আপডেট করার আগে ইউজারের আগের তথ্য ধরে রাখা
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার ডাটাবেজে খুঁজে পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    // 🆕 টাইম এক্সপায়ারি লজিক (মিনিট থেকে ডেট ক্যালকুলেশন)
    let permissionExpiresAt = null;
    if (expiresInMinutes && Number(expiresInMinutes) > 0) {
      permissionExpiresAt = new Date(
        Date.now() + Number(expiresInMinutes) * 60 * 1000,
      );
    }

    // ডাটাবেজে ইউজার আপডেট করা
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role,
        permissions,
        permissionExpiresAt, // 🆕 ডাটাবেজে সেভ করা হচ্ছে
      },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার আপডেট করতে সমস্যা হয়েছে!" },
        { status: 500 },
      );
    }

    // ==========================================
    // ✅ রোল ও পারমিশন আপডেটের অডিট লগ সেভ করা
    // ==========================================
    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "UPDATE_USER_PERMISSIONS",
        targetUser: updatedUser.uid || updatedUser.phone,
        oldData: {
          role: existingUser.role,
          permissions: existingUser.permissions,
        },
        newData: {
          role: updatedUser.role,
          permissions: updatedUser.permissions,
          permissionExpiresAt: updatedUser.permissionExpiresAt, // 🆕 অডিট লগেও যোগ হলো
        },
        details: `সুপার অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ইউজার (${updatedUser.uid || updatedUser.phone}) এর রোল ও পারমিশন আপডেট করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "পারমিশন সফলভাবে আপডেট করা হয়েছে!",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update Permission Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার অভ্যন্তরীণ ত্রুটি ঘটেছে!" },
      { status: 500 },
    );
  }
}
