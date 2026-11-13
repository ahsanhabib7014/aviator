"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function UserDetailsContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const uid = searchParams.get("uid");
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone && !uid) return;
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `/api/admin/user-full-details?phone=${phone || ""}&uid=${uid || ""}`,
          { credentials: "include" },
        );
        const resData = await res.json();
        if (resData.success) setData(resData.data);
        else {
          alert(resData.message);
          router.back();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [phone, uid, router]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-center text-slate-400">
        ডেটা পাওয়া যায়নি!
      </div>
    );

  const { user, deposits, withdraws, rouletteBets, bigSmallBets, aviatorBets } =
    data;

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* হেডার */}
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
          <div>
            <h1 className="text-lg font-bold text-emerald-400">
              ইউজার ডিটেইলস
            </h1>
            <p className="text-sm text-slate-400">
              {user.phone} (UID: {user.uid})
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition"
          >
            ফিরে যান
          </button>
        </div>

        {/* মেইন সামারি কার্ড */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] md:text-xs text-slate-400">
              মোট ব্যালেন্স
            </p>
            <p className="text-lg font-bold text-white mt-1">
              ৳{Number(user.balance || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] md:text-xs text-slate-400">মোট ডিপোজিট</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">
              ৳{Number(user.totalDeposit || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] md:text-xs text-slate-400">মোট লস</p>
            <p className="text-lg font-bold text-rose-400 mt-1">
              ৳{Number(user.totalLost || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
            <p className="text-[10px] md:text-xs text-slate-400">
              বর্তমান টার্নওভার
            </p>
            <p className="text-lg font-bold text-amber-400 mt-1">
              ৳{Number(user.turnover || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* ডিপোজিট */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-emerald-400 text-sm">
              সাম্প্রতিক ডিপোজিট
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">পরিমাণ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-3 text-center text-slate-500">
                      কোনো ডিপোজিট নেই
                    </td>
                  </tr>
                ) : (
                  deposits.map((dep, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="p-3 text-slate-400 text-xs">
                        {new Date(dep.createdAt).toLocaleString("bn-BD")}
                      </td>
                      <td className="p-3 font-bold">
                        ৳{Number(dep.amount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${dep.status === "approved" ? "bg-emerald-900/50 text-emerald-400" : dep.status === "rejected" ? "bg-rose-900/50 text-rose-400" : "bg-amber-900/50 text-amber-400"}`}
                        >
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* উইথড্র */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-rose-400 text-sm">
              সাম্প্রতিক উইথড্র
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">পরিমাণ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {withdraws.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-3 text-center text-slate-500">
                      কোনো উইথড্র নেই
                    </td>
                  </tr>
                ) : (
                  withdraws.map((wd, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="p-3 text-slate-400 text-xs">
                        {new Date(wd.createdAt).toLocaleString("bn-BD")}
                      </td>
                      <td className="p-3 font-bold">
                        ৳{Number(wd.amount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${wd.status === "approved" ? "bg-emerald-900/50 text-emerald-400" : wd.status === "rejected" ? "bg-rose-900/50 text-rose-400" : "bg-amber-900/50 text-amber-400"}`}
                        >
                          {wd.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ১-৩৬ রুলেট বেটিং হিস্ট্রি */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-blue-400 text-sm">
              ১-৩৬ রুলেট বেটিং হিস্ট্রি
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">পিরিয়ড</th>
                  <th className="p-3">রেজাল্ট</th>
                  <th className="p-3">চয়েস</th>
                  <th className="p-3">বাজি</th>
                  <th className="p-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {rouletteBets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-slate-500">
                      কোনো রুলেট বেট নেই
                    </td>
                  </tr>
                ) : (
                  rouletteBets.map((bet, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="p-3 font-mono text-slate-300 text-xs">
                        {bet.periodNumber}
                      </td>
                      <td className="p-3 font-bold text-blue-400">
                        {bet.winningNumber}
                      </td>
                      <td className="p-3 text-slate-300 text-xs">
                        {bet.userChoice}
                      </td>
                      <td className="p-3 font-bold">
                        ৳{Number(bet.betAmount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${bet.status === "win" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}
                        >
                          {bet.status === "win"
                            ? `WIN (৳${bet.payout})`
                            : "LOSS"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* বিগ-স্মল বেটিং হিস্ট্রি */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-purple-400 text-sm">
              বিগ-স্মল বেটিং হিস্ট্রি
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">পিরিয়ড</th>
                  <th className="p-3">রেজাল্ট</th>
                  <th className="p-3">চয়েস</th>
                  <th className="p-3">বাজি</th>
                  <th className="p-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {bigSmallBets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-slate-500">
                      কোনো বিগ-স্মল বেট নেই
                    </td>
                  </tr>
                ) : (
                  bigSmallBets.map((bet, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="p-3 font-mono text-slate-300 text-xs">
                        {bet.periodNumber}
                      </td>
                      <td className="p-3 font-bold text-purple-400">
                        {bet.result}
                      </td>
                      <td className="p-3 text-slate-300 text-xs">
                        {bet.userChoice}
                      </td>
                      <td className="p-3 font-bold">
                        ৳{Number(bet.betAmount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        {/* <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${bet.status === "win" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}
                        >
                          {bet.status === "win"
                            ? `WIN (৳${bet.payout})`
                            : "LOSS"}
                        </span> */}
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            String(bet.status).toLowerCase().includes("win")
                              ? "bg-emerald-900/50 text-emerald-400"
                              : "bg-rose-900/50 text-rose-400"
                          }`}
                        >
                          {String(bet.status).toLowerCase().includes("win")
                            ? `WIN (৳${Number(bet.payout) > 0 ? bet.payout : bet.returnAmount || 0})` // 👈 এখানে returnAmount যোগ করলাম
                            : "LOSS"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* 🆕 Aviator (Crash) বেটিং হিস্ট্রি */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-amber-400 text-sm">
              Aviator গেমিং হিস্ট্রি
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3">পিরিয়ড</th>
                  <th className="p-3">রেজাল্ট (মাল্টিপ্লায়ার)</th>
                  <th className="p-3">স্লট</th>
                  <th className="p-3">বাজি</th>
                  <th className="p-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {!aviatorBets || aviatorBets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-slate-500">
                      কোনো গেমের হিস্ট্রি নেই
                    </td>
                  </tr>
                ) : (
                  aviatorBets.map((bet, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="p-3 font-mono text-slate-300 text-xs">
                        {bet.periodNumber}
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {bet.winningNumber}x
                      </td>
                      <td className="p-3 text-slate-300 text-xs">
                        {bet.userChoice}
                      </td>
                      <td className="p-3 font-bold">
                        ৳{Number(bet.betAmount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${bet.status === "win" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}
                        >
                          {bet.status === "win"
                            ? `WIN (৳${Number(bet.payout).toFixed(2)})`
                            : "LOSS"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentUserDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">
          লোড হচ্ছে...
        </div>
      }
    >
      <UserDetailsContent />
    </Suspense>
  );
}
