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
          {
            credentials: "include",
          },
        );
        const resData = await res.json();
        if (resData.success) setData(resData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [phone, uid]);

  if (loading)
    return <div className="text-white p-10 text-center">লোড হচ্ছে...</div>;
  if (!data)
    return <div className="text-white p-10 text-center">ডেটা পাওয়া যায়নি!</div>;

  const { user, deposits, withdraws, rouletteBets, bigSmallBets } = data;

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* হেডার */}
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-emerald-400">
              ইউজার ডিটেইলস
            </h1>
            <p className="text-sm text-slate-400">
              {user.phone} (UID: {user.uid})
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 px-4 py-2 rounded-lg text-sm"
          >
            ফিরে যান
          </button>
        </div>

        {/* মেইন সামারি কার্ড */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400">মোট ব্যালেন্স</p>
            <p className="text-xl font-bold text-white">৳{user.balance || 0}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400">মোট ডিপোজিট</p>
            <p className="text-xl font-bold text-emerald-400">
              ৳{user.totalDeposit || 0}
            </p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400">মোট লস</p>
            <p className="text-xl font-bold text-rose-400">
              ৳{user.totalLost || 0}
            </p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400">বর্তমান টার্নওভার</p>
            <p className="text-xl font-bold text-amber-400">
              ৳{user.turnover || 0}
            </p>
          </div>
        </div>

        {/* ডিপোজিট */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-emerald-400">সাম্প্রতিক ডিপোজিট</h2>
          </div>
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
                    <td className="p-3 text-slate-400">
                      {new Date(dep.createdAt).toLocaleString("bn-BD")}
                    </td>
                    <td className="p-3 font-bold">৳{dep.amount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${dep.status === "approved" ? "bg-emerald-900 text-emerald-400" : "bg-amber-900 text-amber-400"}`}
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

        {/* উইথড্র */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-rose-400">সাম্প্রতিক উইথড্র</h2>
          </div>
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
                    <td className="p-3 text-slate-400">
                      {new Date(wd.createdAt).toLocaleString("bn-BD")}
                    </td>
                    <td className="p-3 font-bold">৳{wd.amount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${wd.status === "approved" ? "bg-emerald-900 text-emerald-400" : wd.status === "rejected" ? "bg-rose-900 text-rose-400" : "bg-amber-900 text-amber-400"}`}
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

        {/* 🆕 ১-৩৬ রুলেট বেট হিস্ট্রি */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-blue-400">
              ১-৩৬ রুলেট বেটিং হিস্ট্রি
            </h2>
          </div>
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
                    <td className="p-3 font-mono text-slate-300">
                      {bet.periodNumber}
                    </td>
                    <td className="p-3 font-bold text-blue-400">
                      {bet.winningNumber}
                    </td>
                    <td className="p-3 text-slate-300">{bet.userChoice}</td>
                    <td className="p-3 font-bold">৳{bet.betAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${bet.status === "win" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}
                      >
                        {bet.status === "win" ? `WIN (৳${bet.payout})` : "LOSS"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🆕 বিগ-স্মল বেট হিস্ট্রি */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-purple-400">
              বিগ-স্মল বেটিং হিস্ট্রি
            </h2>
          </div>
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
                    <td className="p-3 font-mono text-slate-300">
                      {bet.periodNumber}
                    </td>
                    <td className="p-3 font-bold text-purple-400">
                      {bet.result}
                    </td>
                    <td className="p-3 text-slate-300">{bet.userChoice}</td>
                    <td className="p-3 font-bold">৳{bet.betAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${bet.status === "win" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}
                      >
                        {bet.status === "win" ? `WIN (৳${bet.payout})` : "LOSS"}
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
  );
}

export default function UserDetailsPage() {
  return (
    <Suspense
      fallback={<div className="text-white p-10 text-center">লোড হচ্ছে...</div>}
    >
      <UserDetailsContent />
    </Suspense>
  );
}
