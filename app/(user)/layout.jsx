"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "হোম", icon: "fa-solid fa-house" },
    { href: "/game", label: "২ গুণ", icon: "fa-solid fa-dice" },
    {
      href: "/newgame",
      label: "36 গুণ",
      icon: "fa-solid fa-dice-six",
    },
        {
      href: "/aviator",
      label: "এভিয়েটর",
      icon: "fa-solid fa-plane-departure", 
    },
    { href: "/wallet", label: "ওয়ালেট", icon: "fa-solid fa-wallet" },
    { href: "/referral", label: "রেফারেল", icon: "fa-solid fa-user-group" },
    { href: "/profile", label: "প্রোফাইল", icon: "fa-solid fa-user" },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md md:max-w-5xl mx-auto p-3 md:p-6 pb-24 md:pb-8 relative">
        {/* ✅ হেডার (মোবাইল ও ডেস্কটপ উভয়ের জন্য) */}
        <header className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 mb-4 shadow-lg">
          <Link
            href="/"
            className="font-bold text-emerald-400 text-base md:text-lg flex items-center gap-2 hover:text-emerald-300 transition"
          >
            <i className="fa-solid fa-credit-card text-lg md:text-xl"></i>
            <span>mitupay</span>
          </Link>

          {/* ✅ বড় স্ক্রিনের জন্য টপ নেভিগেশন মেনু */}
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

        {/* ========================================= */}
        {/* ✅ টেলিগ্রাম ও হোয়াটসঅ্যাপ ফ্লোটিং বাটন */}
        {/* ========================================= */}
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col gap-3">
          {/* Telegram Button */}
          <a
            href="https://t.me/mitupay" // 👈 এখানে আপনার টেলিগ্রাম ইউজারনেম বা গ্রুপ লিংক দিন
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0088cc] hover:bg-[#0077b3] text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
            aria-label="Telegram"
          >
            <i className="fa-brands fa-telegram text-2xl"></i>
          </a>

          {/* WhatsApp Button */}
          {/* <a
            href="https://wa.me/+8801700000000?text=হ্যালো,%20আমি%20সাহায্য%20চাই" // 👈 এখানে আপনার হোয়াটসঅ্যাপ নম্বর দিন (কান্ট্রি কোড সহ)
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <i className="fa-brands fa-whatsapp text-2xl"></i>
          </a> */}
        </div>
        {/* ========================================= */}

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
