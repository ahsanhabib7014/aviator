// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import { ContactMessage } from "@/models/ContactMessage";

// // 🆕 ইউজার ইনফো চেক (পারমিশন সহ)
// const getUserInfo = async (req) => {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token) return null;

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const identifier = decoded.uid || decoded.phone || decoded.userId;

//     const user = await User.findOne({
//       $or: [{ uid: identifier }, { phone: identifier }],
//     });

//     if (!user) return null;

//     // 🆕 অ্যাডমিন হলে সরাসরি অনুমতি
//     if (user.role === "admin") return user;

//     // 🆕 সাব-অ্যাডমিন হলে পারমিশন চেক
//     if (user.role === "sub-admin") {
//       const permissions = user.permissions || [];
//       // 🆕 আপনার ডাটাবেসে থাকা কী অনুযায়ী চেক করুন
//       const hasPermission =
//         permissions.includes("manage_contact-messages") ||
//         permissions.includes("manage_contacts"); // দুটোই চেক করা হলো

//       if (!hasPermission) return null;

//       // 🆕 পারমিশনের মেয়াদ চেক
//       if (
//         user.permissionExpiresAt &&
//         Date.now() > new Date(user.permissionExpiresAt).getTime()
//       ) {
//         return null;
//       }

//       return user;
//     }

//     return null;
//   } catch (err) {
//     console.error("getUserInfo Error:", err);
//     return null;
//   }
// };

// // 🆕 GET: মেসেজ লিস্ট
// export async function GET(req) {
//   try {
//     await dbConnect();
//     const user = await getUserInfo(req);

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "অনুমতি নেই" },
//         { status: 403 },
//       );
//     }

//     let query = {};

//     // 🆕 সাব-অ্যাডমিন: নিজের অ্যাসাইন করা + নতুন (unassigned) টিকিট
//     if (user.role === "sub-admin") {
//       query = {
//         $or: [
//           { assignedTo: user._id },
//           { assignedTo: null },
//           { assignedTo: { $exists: false } },
//         ],
//       };
//     }
//     // 🆕 অ্যাডমিন: সব টিকিট দেখবে (query = {})

//     const messages = await ContactMessage.find(query)
//       .sort({ createdAt: -1 })
//       .lean();

//     // 🆕 নতুন টিকিটের কাউন্ট
//     const unreadCount = await ContactMessage.countDocuments({
//       ...query,
//       status: "unread",
//     });

//     return NextResponse.json({
//       success: true,
//       messages,
//       unreadCount,
//     });
//   } catch (error) {
//     console.error("GET Contact Messages Error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর" },
//       { status: 500 },
//     );
//   }
// }

// // 🆕 POST: টিকিট অ্যাসাইন
// export async function POST(req) {
//   try {
//     await dbConnect();
//     const user = await getUserInfo(req);

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "অনুমতি নেই" },
//         { status: 403 },
//       );
//     }

//     const { messageId } = await req.json();
//     if (!messageId) {
//       return NextResponse.json(
//         { success: false, message: "মেসেজ আইডি দিন" },
//         { status: 400 },
//       );
//     }

//     const existingMessage = await ContactMessage.findById(messageId);
//     if (!existingMessage) {
//       return NextResponse.json(
//         { success: false, message: "টিকিট পাওয়া যায়নি" },
//         { status: 404 },
//       );
//     }

//     if (existingMessage.assignedTo) {
//       return NextResponse.json(
//         { success: false, message: "এই টিকিট ইতিমধ্যে অ্যাসাইন করা হয়েছে!" },
//         { status: 400 },
//       );
//     }

//     await ContactMessage.findByIdAndUpdate(messageId, {
//       assignedTo: user._id,
//       status: "in_progress",
//     });

//     // 🆕 ইউজারের ডেডিকেটেড সাব-অ্যাডমিন সেট করুন
//     if (existingMessage.senderId) {
//       await User.findByIdAndUpdate(existingMessage.senderId, {
//         dedicatedSupportAgent: user._id,
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       message: "টিকিট আপনার কাছে অ্যাসাইন হয়েছে!",
//     });
//   } catch (error) {
//     console.error("POST Assign Error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর" },
//       { status: 500 },
//     );
//   }
// }

// // 🆕 DELETE: টিকিট ডিলিট (শুধু অ্যাডমিন)
// export async function DELETE(req) {
//   try {
//     await dbConnect();
//     const user = await getUserInfo(req);

//     if (!user || user.role !== "admin") {
//       return NextResponse.json(
//         { success: false, message: "শুধু অ্যাডমিন ডিলিট করতে পারবে!" },
//         { status: 403 },
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "টিকিট আইডি দিন" },
//         { status: 400 },
//       );
//     }

//     await ContactMessage.findByIdAndDelete(id);

//     return NextResponse.json({
//       success: true,
//       message: "টিকিট ডিলিট হয়েছে!",
//     });
//   } catch (error) {
//     console.error("DELETE Error:", error);
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর" },
//       { status: 500 },
//     );
//   }
// }
// ////////////////////////////////////////
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { ContactMessage } from "@/models/ContactMessage";

// 🆕 ইউজার ইনফো চেক (পারমিশন সহ)
const getUserInfo = async (req) => {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const identifier = decoded.uid || decoded.phone || decoded.userId;

    const user = await User.findOne({
      $or: [{ uid: identifier }, { phone: identifier }],
    });

    if (!user) return null;

    // 🆕 অ্যাডমিন হলে সরাসরি অনুমতি
    if (user.role === "admin") return user;

    // 🆕 সাব-অ্যাডমিন হলে পারমিশন চেক
    if (user.role === "sub-admin") {
      const permissions = user.permissions || [];
      const hasPermission =
        permissions.includes("manage_contact-messages") ||
        permissions.includes("manage_contacts");

      if (!hasPermission) return null;

      // 🆕 পারমিশনের মেয়াদ চেক
      if (
        user.permissionExpiresAt &&
        Date.now() > new Date(user.permissionExpiresAt).getTime()
      ) {
        return null;
      }

      return user;
    }

    return null;
  } catch (err) {
    console.error("getUserInfo Error:", err);
    return null;
  }
};

// 🆕 GET: মেসেজ লিস্ট
export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUserInfo(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "অনুমতি নেই" },
        { status: 403 },
      );
    }

    let query = {};

    // 🆕 সাব-অ্যাডমিন: সব টিকিট দেখবে (নিজের, নতুন, আগের resolved/closed)
    if (user.role === "sub-admin") {
      query = {
        $or: [
          { assignedTo: user._id }, // নিজের অ্যাসাইন করা
          { assignedTo: null, status: "unread" }, // নতুন unread টিকিট
          { status: "resolved" }, // 🆕 আগের সব resolved
          { status: "closed" }, // 🆕 আগের সব closed
        ],
      };
    }
    // 🆕 অ্যাডমিন: সব টিকিট দেখবে (query = {})

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // 🆕 নতুন টিকিটের কাউন্ট
    const unreadCount = await ContactMessage.countDocuments({
      ...query,
      status: "unread",
    });

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
    });
  } catch (error) {
    console.error("GET Contact Messages Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}

// 🆕 POST: টিকিট অ্যাসাইন
export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUserInfo(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "অনুমতি নেই" },
        { status: 403 },
      );
    }

    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json(
        { success: false, message: "মেসেজ আইডি দিন" },
        { status: 400 },
      );
    }

    const existingMessage = await ContactMessage.findById(messageId);
    if (!existingMessage) {
      return NextResponse.json(
        { success: false, message: "টিকিট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    if (existingMessage.assignedTo) {
      return NextResponse.json(
        { success: false, message: "এই টিকিট ইতিমধ্যে অ্যাসাইন করা হয়েছে!" },
        { status: 400 },
      );
    }

    // 🆕 টিকিট অ্যাসাইন করুন
    await ContactMessage.findByIdAndUpdate(messageId, {
      assignedTo: user._id,
      status: "in_progress",
    });

    // 🆕 ইউজারের ডেডিকেটেড সাব-অ্যাডমিন সেট করুন
    if (existingMessage.senderId) {
      await User.findByIdAndUpdate(existingMessage.senderId, {
        dedicatedSupportAgent: user._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "টিকিট আপনার কাছে অ্যাসাইন হয়েছে!",
    });
  } catch (error) {
    console.error("POST Assign Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}

// 🆕 DELETE: টিকিট ডিলিট (শুধু অ্যাডমিন)
export async function DELETE(req) {
  try {
    await dbConnect();
    const user = await getUserInfo(req);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "শুধু অ্যাডমিন ডিলিট করতে পারবে!" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "টিকিট আইডি দিন" },
        { status: 400 },
      );
    }

    await ContactMessage.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "টিকিট ডিলিট হয়েছে!",
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
