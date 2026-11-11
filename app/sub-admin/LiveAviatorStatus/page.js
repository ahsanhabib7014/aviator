
"use client";
import React, { useEffect, useState } from "react";
import { useSocket } from "@/app/SocketProvider";

export default function LiveAviatorStatusPanel() {
  const { gameState } = useSocket();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });

        if (res.ok) {
          const data = await res.json();

          if (data.success && data.user) {
            const isAdmin = data.user.role === "admin";
            const isSubAdmin =
              data.user.role === "sub-admin" || data.user.role === "subadmin";

            const hasPermission =
              data.user.permissions &&
              (data.user.permissions.includes("live-aviator") ||
                data.user.permissions.includes("LIVE_STATS"));

            if (isAdmin || isSubAdmin || hasPermission) {
              setIsAuthorized(true);
            }
          }
        }
      } catch (err) {
        console.error("Auth Check Error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  if (loading) return null;
  if (!isAuthorized) return null;

  return (
    <div className="bg-[#12151c] p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col w-full h-full">
      <h2 className="text-lg font-bold mb-4 border-b border-gray-800 pb-2 text-gray-200">
        📊 লাইভ স্ট্যাটাস
      </h2>

      <div className="space-y-3 flex-1">
        {/* 🆕 স্ট্যাটাস ডিসপ্লে */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">স্ট্যাটাস:</span>
          <span
            className={`font-mono font-bold uppercase ${
              gameState?.status === "flying"
                ? "text-emerald-400"
                : gameState?.status === "waiting"
                  ? "text-amber-400"
                  : "text-rose-400"
            }`}
          >
            {gameState?.status || "WAITING"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">রাউন্ড আইডি:</span>
          <span className="font-mono text-white">
            {gameState?.roundId || "-"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">বর্তমান মাল্টিপ্লায়ার:</span>
          <span className="font-mono text-amber-400 font-bold">
            {Number(gameState?.multiplier || 1.0).toFixed(2)}x
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">মোট বাজি:</span>
          <span className="font-mono text-emerald-400">
            ৳ {gameState?.totalBetsAmount || 0}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 mb-2">
            বাজির লিস্ট (লোডিং অবস্থায়):
          </p>
          <div className="bg-[#0a0c10] rounded p-2 max-h-48 overflow-y-auto space-y-1 text-xs">
            {gameState?.bets && gameState.bets.length > 0 ? (
              gameState.bets.map((b, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-gray-800/50 pb-1"
                >
                  <span className="text-gray-300">{b.user || b.phone}</span>
                  <span className="text-amber-400">
                    ৳ {Number(b.amount || b.bet || 0).toFixed(2)}
                  </span>
                  <span className="text-emerald-400">
                    {b.cashedOutAt ? `${b.cashedOutAt}x` : "—"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-2">
                কোনো বাজি নেই
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}