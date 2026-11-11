import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    type: {
      type: String,
      enum: ["আপডেট", "অফার", "সতর্কতা", "জরুরি"],
      default: "আপডেট",
    },
    isNew: { type: Boolean, default: true }, // নতুন নোটিশ কিনা
    isActive: { type: Boolean, default: true }, // নোটিশটি অ্যাক্টিভ কিনা
  },
  { timestamps: true },
);

export const Notice =
  mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
