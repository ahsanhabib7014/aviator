"use client";
import React, { useState, useEffect } from "react";

export default function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🆕 API থেকে নোটিশ লোড করা
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch("/api/notices");
        const data = await res.json();
        if (data.success) {
          setNotices(data.notices);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const getTypeStyles = (type) => {
    switch (type) {
      case "আপডেট":
        return "bg-blue-900/30 text-blue-400 border-blue-500/30";
      case "অফার":
        return "bg-emerald-900/30 text-emerald-400 border-emerald-500/30";
      case "সতর্কতা":
        return "bg-amber-900/30 text-amber-400 border-amber-500/30";
      case "জরুরি":
        return "bg-rose-900/30 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  // ডাটাবেসের তারিখকে ফরম্যাট করা
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        নোটিশ লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-emerald-400 mb-2 flex items-center gap-3">
              <i className="fa-solid fa-bullhorn text-2xl"></i> নোটিশ বোর্ড
            </h1>
            <p className="text-sm text-slate-400">
              আমাদের প্ল্যাটফর্মের সর্বশেষ খবর, আপডেট এবং অফারগুলো এখানে দেখুন।
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <div
                key={notice._id}
                className="group bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getTypeStyles(notice.type)}`}
                    >
                      {notice.type}
                    </span>
                    {notice.isNew && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-500 text-white animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <i className="fa-regular fa-calendar"></i>
                    {formatDate(notice.createdAt)}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-100 mb-2">
                  {notice.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {notice.desc}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500">
              <i className="fa-solid fa-inbox text-4xl mb-3 opacity-50"></i>
              <p>বর্তমানে কোনো নোটিশ নেই।</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 flex flex-wrap items-center justify-center gap-1">
            <span>আরো পুরনো নোটিশ দেখতে আমাদের</span>
            <span className="text-emerald-400 cursor-pointer hover:underline">
              টেলিগ্রাম চ্যানেলে
            </span>
            <span>যুক্ত হোন।</span>
          </p>
        </div>
      </div>
    </div>
  );
}
