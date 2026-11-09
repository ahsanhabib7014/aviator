"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminAgentDepositsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ফিল্টার
  const [search, setSearch] = useState(""); // এজেন্ট/ইউজার নাম্বার
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchDeposits = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(
        `/api/admin/agent-deposits?${params.toString()}`,
        { credentials: "include" },
      );
      const json = await res.json();

      if (json.success) {
        setList(json.data || []);
      } else {
        setError(json.message || "ডাটা আনতে সমস্যা হয়েছে");
      }
    } catch (err) {
      console.error(err);
      setError("সার্ভার এরর!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalAmount = list.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100">
      {/* হেডার */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-emerald-400">
          এজেন্ট ডিপোজিট
        </h1>
      </div>

      {/* সারাংশ কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500">মোট ট্রানজেকশন</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {list.length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500">মোট পরিমাণ</p>
          <p className="text-2xl font-black text-blue-400 font-mono mt-1">
            ৳{totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ফিল্টার */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="এজেন্ট/ইউজার নাম্বার"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <button
          onClick={fetchDeposits}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-3 py-2 text-sm transition"
        >
          <i className="fa-solid fa-magnifying-glass mr-2"></i>
          খুঁজুন
        </button>
      </div>

      {/* লিস্ট */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-rose-400 text-sm">{error}</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            কোনো ডিপোজিট পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">এজেন্ট</th>
                  <th className="px-4 py-3 text-left">ইউজার</th>
                  <th className="px-4 py-3 text-right">পরিমাণ</th>
                  <th className="px-4 py-3 text-left">TrxID</th>
                  <th className="px-4 py-3 text-left">তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="border-t border-slate-800 hover:bg-slate-950/50"
                  >
                    <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {item.agentId?.agentCode || item.agentId?.phone || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {item.phone || item.userId?.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-400">
                      ৳{Number(item.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {item._id?.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(item.createdAt).toLocaleString("bn-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
