// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import { verifyAuth } from "@/utils/authCheck";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth("admin");
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status },
//       );
//     }

//     const { targetUid, newRole } = await request.json();
//     if (!targetUid) {
//       return NextResponse.json(
//         { success: false, message: "ইউজার আইডি পাওয়া যায়নি!" },
//         { status: 400 },
//       );
//     }

//     // ইউজার খুঁজে রোল 'user' করা এবং পারমিশন ক্লিয়ার বা ফাঁকা করে দেওয়া
//     const updatedUser = await User.findOneAndUpdate(
//       { $or: [{ uid: targetUid }, { phone: targetUid }] },
//       {
//         $set: { role: newRole || "user" },
//         $unset: { permissions: "" }, // পারমিশন ফিল্ড রিমুভ করে সাধারণ ইউজার করা
//       },
//       { returnDocument: "after" },
//     );

//     if (!updatedUser) {
//       return NextResponse.json(
//         { success: false, message: "টার্গেট ইউজার পাওয়া যায়নি!" },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json(
//       { success: true, message: "সফলভাবে সাধারণ ইউজার করা হয়েছে!" },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Update role error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর!" },
//       { status: 500 },
//     );
//   }
// }
// /////////////////////////////////////////////////////////
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog"; // ✅ নতুন — অডিট লগ মডেল
import { NextResponse } from "next/server";

export async function POST(request) {
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

    const adminUser = auth.user;
    const { targetUid, newRole } = await request.json();

    if (!targetUid) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি পাওয়া যায়নি!" },
        { status: 400 },
      );
    }

    // ✅ ২. আপডেটের আগে পুরনো ডাটা ধরে রাখা (অডিট লগে "আগে কী ছিল" দেখানোর জন্য)
    const existingUser = await User.findOne({
      $or: [{ uid: targetUid }, { phone: targetUid }],
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "টার্গেট ইউজার পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    // ✅ ৩. রোল আপডেট + পারমিশন রিমুভ
    const updatedUser = await User.findOneAndUpdate(
      { _id: existingUser._id },
      {
        $set: { role: newRole || "user" },
        $unset: { permissions: "" },
      },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "রোল আপডেট করতে সমস্যা হয়েছে!" },
        { status: 500 },
      );
    }

    // ==========================================
    // ✅ ৪. অডিট লগ সেভ করা (মূল অংশ!)
    // ==========================================
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    await AuditLog.create({
      adminId: adminUser._id,
      adminPhone: adminUser.phone || adminUser.uid,
      action: "UPDATE_USER_PERMISSIONS", // ✅ বিদ্যমান action — এপিআই এটাকে চিনবে
      targetUser: updatedUser.uid || updatedUser.phone,
      oldData: {
        role: existingUser.role,
        permissions: existingUser.permissions || [],
      },
      newData: {
        role: updatedUser.role,
        permissions: updatedUser.permissions || [],
      },
      details: `সুপার অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ইউজার (${updatedUser.uid || updatedUser.phone}) কে "${existingUser.role}" থেকে "${updatedUser.role}" রোলে পরিবর্তন করা হয়েছে।`,
      ipAddress: ip,
    });

    return NextResponse.json(
      { success: true, message: "সফলভাবে সাধারণ ইউজার করা হয়েছে!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর!" },
      { status: 500 },
    );
  }
}
