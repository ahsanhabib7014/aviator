
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // 🆕 useState ইমপোর্ট করুন

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 🆕 সাইডবার স্টেট

  const navItems = [
    { href: "/", label: "হোম", icon: "fa-solid fa-house" },
    { href: "/game", label: "২ গুণ", icon: "fa-solid fa-dice" },
    { href: "/newgame", label: "36 গুণ", icon: "fa-solid fa-dice-six" },
    { href: "/aviator", label: "এভিয়েটর", icon: "fa-solid fa-plane-departure" },
    { href: "/wallet", label: "ওয়ালেট", icon: "fa-solid fa-wallet" },
    { href: "/referral", label: "রেফারেল", icon: "fa-solid fa-user-group" },
    { href: "/profile", label: "প্রোফাইল", icon: "fa-solid fa-user" },
  ];

  // 🆕 সাইডবারের জন্য বাড়তি মেনু আইটেম
  const sidebarItems = [
    { href: "/deposit", label: "ডিপোজিট", icon: "fa-solid fa-arrow-down" },
    { href: "/withdraw", label: "উইথড্র", icon: "fa-solid fa-arrow-up" },
    // { href: "/history", label: "গেম হিস্ট্রি", icon: "fa-solid fa-clock-rotate-left" },
    { href: "/notice", label: "নোটিশ", icon: "fa-solid fa-bullhorn" },
    // { href: "/support", label: "সাপোর্ট", icon: "fa-solid fa-headset" },
     { href: "/about", label: "আমাদের সম্পর্কে", icon: "fa-solid fa-circle-info" },
    { href: "/contact", label: "যোগাযোগ", icon: "fa-solid fa-phone" },
    { href: "/terms", label: "শর্তাবলী", icon: "fa-solid fa-file-contract" },
    { href: "/privacy", label: "গোপনীয়তা নীতি", icon: "fa-solid fa-shield-halved" },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* 🆕 সাইডবার / ড্রয়ার (সব ডিভাইজের জন্য) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)} // বাইরে ক্লিক করলে বন্ধ হবে
      >
        <div
          className={`w-72 h-full bg-[#12151c] border-r border-slate-800 p-4 flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()} // ভেতরে ক্লিক করলে বন্ধ হবে না
        >
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-emerald-400 font-bold text-lg">মেনু</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {/* মেইন নেভিগেশন */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                  pathname === item.href
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                {item.label}
              </Link>
            ))}

            <div className="my-4 border-t border-slate-800"></div>

            {/* বাড়তি মেনু আইটেম */}
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md md:max-w-5xl mx-auto p-3 md:p-6 pb-24 md:pb-8 relative">
        {/* ✅ হেডার */}
        <header className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 mb-4 shadow-lg">
          
          {/* 🆕 হ্যামবার্গার বাটন (বামে) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-300 hover:text-emerald-400 text-xl p-1 mr-2"
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          <Link
            href="/"
            className="font-bold text-emerald-400 text-base md:text-lg flex items-center gap-2 hover:text-emerald-300 transition flex-1"
          >
            <i className="fa-solid fa-credit-card text-lg md:text-xl"></i>
            <span>mitupay</span>
          </Link>

          {/* বড় স্ক্রিনের জন্য টপ নেভিগেশন মেনু */}
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-bold transition ${isActive ? "text-emerald-400" : "text-slate-400 hover:text-emerald-300"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* মূল কনটেন্ট */}
        <main>{children}</main>

        {/* টেলিগ্রাম ফ্লোটিং বাটন */}
        {/* <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col gap-3">
          <a
            href="https://t.me/mitupay"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0088cc] hover:bg-[#0077b3] text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
            aria-label="Telegram"
          >
            <i className="fa-brands fa-telegram text-2xl"></i>
          </a>
        </div> */}

        {/* ✅ বটম নেভিগেশন (শুধু মোবাইলের জন্য) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex justify-around text-slate-400 text-xs z-50 shadow-2xl md:hidden">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center transition ${isActive ? "text-emerald-400" : "hover:text-emerald-400"}`}
              >
                <i className={`${item.icon} text-lg mb-1`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}