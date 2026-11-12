"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileSidebar({
  menuItems,
  pathname,
  extraSidebarLinks = [],
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 🆕 হ্যামবার্গার আইকন (বাম উপরে) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 bg-[#0b132b] border border-slate-800/80 p-2.5 rounded-xl text-slate-200 hover:text-emerald-400 transition shadow-lg"
        aria-label="Open Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* 🆕 সাইডবার ওভারলে */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-72 h-full bg-[#0b132b] border-r border-slate-800/80 p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <h2 className="text-emerald-400 font-bold text-lg">মেনু</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {/* মূল মেনু আইটেম */}
              {menuItems.map((item) => {
                const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* 🆕 শুধু সাইডবারের জন্য আলাদা লিংক */}
              {extraSidebarLinks.length > 0 && (
                <div className="my-3 border-t border-slate-800 pt-3">
                  {extraSidebarLinks.map((item) => {
                    const isActive = pathname.includes(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
