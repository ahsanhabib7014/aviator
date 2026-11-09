"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // কনসোলে এরর লগ করা (ডিবাগিংয়ের জন্য)
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* 🌟 ব্যাকগ্রাউন্ডে গ্লোয়িং ইফেক্ট (সুন্দর দেখানোর জন্য) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 🛑 মেইন এরর কার্ড */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 md:p-10 rounded-[2rem] max-w-lg w-full text-center space-y-6 shadow-2xl">
        {/* এরর আইকন এনিমেশনসহ */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-rose-500/20 to-red-600/20 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/30 shadow-inner">
            <i className="fa-solid fa-bug text-4xl"></i>
          </div>
        </div>

        {/* মেসেজ */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            হঠাৎ একটি সমস্যা হয়েছে! <span className="text-rose-500">⚠️</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            সার্ভারে সাময়িক সমস্যা দেখা দিয়েছে অথবা ইন্টারনেট সংযোগে বিঘ্ন
            ঘটেছে।
            <br className="hidden md:block" />
            দয়া করে পেজটি রিলোড করে আবার চেষ্টা করুন।
          </p>
        </div>

        {/* ডিভাইডার */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

        {/* বাটনসমূহ */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right"></i>
            পেজ রিলোড করুন
          </button>

          <button
            onClick={() => reset()}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-slate-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-house"></i>
            আবার চেষ্টা করুন
          </button>
        </div>

        {/* এরর মেসেজের ছোট প্রিভিউ (ঐচ্ছিক) */}
        <p className="text-[10px] text-slate-600 font-mono break-all bg-slate-950 p-2 rounded-lg border border-slate-800 opacity-50">
          {error?.message || "Unknown Error Occurred"}
        </p>
      </div>
    </div>
  );
}
