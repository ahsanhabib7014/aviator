import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    // 🆕 ফোন নম্বর
    phone: { type: String, required: true },

    // 🆕 টাইটেল বা বিষয়
    title: { type: String, required: true },

    // 🆕 বিস্তারিত বার্তা
    message: { type: String, required: true },

    // 🆕 কে পাঠিয়েছে (রোল)
    senderRole: {
      type: String,
      enum: ["user", "agent", "sub-admin"],
      default: "user",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🆕 অ্যাসাইনমেন্ট
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["unread", "in_progress", "resolved", "closed"],
      default: "unread",
    },

    // 🆕 কে ক্লোজ করেছে
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    closedAt: { type: Date, default: null },

    // 🆕 রিপ্লাই
    replies: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderName: { type: String },
        senderRole: { type: String, default: "sub-admin" },
        message: { type: String },
        sentAt: { type: Date, default: Date.now },
      },
    ],

    // 🆕 নতুন মেসেজের জন্য নোটিফিকেশন (সাব-অ্যাডমিন/অ্যাডমিন দেখবে)
    hasNewReply: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);
