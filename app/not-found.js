"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* 🌟 ব্যাকগ্রাউন্ডে গ্লোয়িং ইফেক্ট */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 🛑 মেইন ৪০৪ কার্ড */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 md:p-12 rounded-[2rem] max-w-lg w-full text-center space-y-6 shadow-2xl">
        {/* ৪০৪ টেক্সট এনিমেশনসহ */}
        <div className="relative flex justify-center items-center">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500 drop-shadow-lg">
            404
          </h1>
          <div className="absolute -bottom-2 w-24 h-2 bg-blue-500/30 blur-md rounded-full"></div>
        </div>

        {/* মেসেজ */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            পেজটি খুঁজে পাওয়া যায়নি! <span className="text-amber-400">🔍</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            দুঃখিত, আপনি যে পেজটি খুঁজছেন লিংকটি ভুল।
            <br className="hidden md:block" />
            দয়া করে হোম পেজে ফিরে যান অথবা নিচের বাটনে ক্লিক করুন।
          </p>
        </div>

        {/* ডিভাইডার */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

        {/* হোম বাটন */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <Link
            href="/"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-house"></i>
            হোম পেজে ফিরে যান
          </Link>
        </div>

        {/* এরর কোড (ঐচ্ছিক) */}
        <p className="text-[10px] text-slate-600 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 opacity-50">
          Error Code: 404 - Not Found
        </p>
      </div>
    </div>
  );
}
