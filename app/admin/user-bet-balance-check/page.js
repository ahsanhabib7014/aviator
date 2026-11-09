"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function UserDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL থেকে ইনিশিয়াল ভ্যালু নেওয়া
  const initialPhone = searchParams.get("phone") || "";
  const initialUid = searchParams.get("uid") || "";

  // স্টেট
  const [searchInput, setSearchInput] = useState(
    initialPhone || initialUid || "",
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDetails = async (query) => {
    if (!query) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      // phone এবং uid দুটোতেই পাস করা হচ্ছে, যাতে যেকোনোটি দিয়েই সার্চ কাজ করে
      const res = await fetch(
        `/api/admin/user-full-details?phone=${query}&uid=${query}`,
        { credentials: "include" },
      );
      const resData = await res.json();

      if (resData.success) {
        setData(resData.data);
      } else {
        setError(resData.message || "ইউজার ডেটা পাওয়া যায়নি!");
      }
    } catch (err) {
      console.error(err);
      setError("সার্ভার এরর! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // পেজ লোড হওয়ার সময় URL-এ প্যারামিটার থাকলে অটো সার্চ হবে
  useEffect(() => {
    if (initialPhone || initialUid) {
      fetchDetails(initialPhone || initialUid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchDetails(searchInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* 🔍 সার্চ বার */}
        <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h1 className="text-xl md:text-2xl font-bold text-emerald-400 mb-4 text-center">
            ইউজার ডিটেইলস সার্চ
          </h1>
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <input
              type="text"
              maxLength={11}
              inputMode="numeric"
              placeholder="ইউজারের ফোন নাম্বার বা UID লিখুন..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 font-mono transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  খোঁজা হচ্ছে...
                </>
              ) : (
                "🔍 সার্চ করুন"
              )}
            </button>
          </form>
        </div>

        {/* এরর মেসেজ */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/50 text-rose-400 p-4 rounded-xl text-center text-sm font-bold">
            {error}
          </div>
        )}

        {/* ডাটা ডিসপ্লে সেকশন */}
        {data && (
          <div className="space-y-6 animate-fadeIn">
            {/* হেডার ও রিসেট বাটন */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
              <div>
                <h1 className="text-lg font-bold text-emerald-400">
                  ইউজার ডিটেইলস
                </h1>
                <p className="text-sm text-slate-400 font-mono">
                  {data.user.phone} (UID: {data.user.uid})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setData(null);
                    setSearchInput("");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  🔄 নতুন সার্চ
                </button>
                <button
                  onClick={() => router.back()}
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  ফিরে যান
                </button>
              </div>
            </div>

            {/* মেইন সামারি কার্ড */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-lg">
                <p className="text-[11px] md:text-xs text-slate-400">
                  মোট ব্যালেন্স
                </p>
                <p className="text-lg md:text-xl font-bold text-white mt-1">
                  ৳{Number(data.user.balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-lg">
                <p className="text-[11px] md:text-xs text-slate-400">
                  মোট ডিপোজিট
                </p>
                <p className="text-lg md:text-xl font-bold text-emerald-400 mt-1">
                  ৳{Number(data.user.totalDeposit || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-lg">
                <p className="text-[11px] md:text-xs text-slate-400">মোট লস</p>
                <p className="text-lg md:text-xl font-bold text-rose-400 mt-1">
                  ৳{Number(data.user.totalLost || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-lg">
                <p className="text-[11px] md:text-xs text-slate-400">
                  বর্তমান টার্নওভার
                </p>
                <p className="text-lg md:text-xl font-bold text-amber-400 mt-1">
                  ৳{Number(data.user.turnover || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* ডিপোজিট */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-bold text-emerald-400 text-sm">
                  সাম্প্রতিক ডিপোজিট
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">পরিমাণ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deposits.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-4 text-center text-slate-500"
                        >
                          কোনো ডিপোজিট নেই
                        </td>
                      </tr>
                    ) : (
                      data.deposits.map((dep, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30"
                        >
                          <td className="p-3 text-slate-400 text-xs">
                            {new Date(dep.createdAt).toLocaleString("bn-BD")}
                          </td>
                          <td className="p-3 font-bold font-mono">
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
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-bold text-rose-400 text-sm">
                  সাম্প্রতিক উইথড্র
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">পরিমাণ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.withdraws.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-4 text-center text-slate-500"
                        >
                          কোনো উইথড্র নেই
                        </td>
                      </tr>
                    ) : (
                      data.withdraws.map((wd, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30"
                        >
                          <td className="p-3 text-slate-400 text-xs">
                            {new Date(wd.createdAt).toLocaleString("bn-BD")}
                          </td>
                          <td className="p-3 font-bold font-mono">
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
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-bold text-blue-400 text-sm">
                  ১-৩৬ রুলেট বেটিং হিস্ট্রি
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
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
                    {data.rouletteBets.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-4 text-center text-slate-500"
                        >
                          কোনো রুলেট বেট নেই
                        </td>
                      </tr>
                    ) : (
                      data.rouletteBets.map((bet, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30"
                        >
                          <td className="p-3 font-mono text-slate-300 text-xs">
                            {bet.periodNumber}
                          </td>
                          <td className="p-3 font-bold text-blue-400">
                            {bet.winningNumber}
                          </td>
                          <td className="p-3 text-slate-300 text-xs">
                            {bet.userChoice}
                          </td>
                          <td className="p-3 font-bold font-mono">
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
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-bold text-purple-400 text-sm">
                  বিগ-স্মল বেটিং হিস্ট্রি
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
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
                    {data.bigSmallBets.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-4 text-center text-slate-500"
                        >
                          কোনো বিগ-স্মল বেট নেই
                        </td>
                      </tr>
                    ) : (
                      data.bigSmallBets.map((bet, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30"
                        >
                          <td className="p-3 font-mono text-slate-300 text-xs">
                            {bet.periodNumber}
                          </td>
                          <td className="p-3 font-bold text-purple-400">
                            {bet.result}
                          </td>
                          <td className="p-3 text-slate-300 text-xs">
                            {bet.userChoice}
                          </td>
                          <td className="p-3 font-bold font-mono">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      }
    >
      <UserDetailsContent />
    </Suspense>
  );
}
