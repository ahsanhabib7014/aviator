// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// export default function AgentHistoryPage() {
//   const [records, setRecords] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [pagination, setPagination] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState(null);

//   const [searchQuery, setSearchQuery] = useState("");

//   const [filters, setFilters] = useState({
//     type: "all",
//     status: "all",
//     page: 1,
//   });

//   const loadHistory = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//         type: filters.type,
//         status: filters.status,
//         page: String(filters.page),
//         limit: "20",
//       });
//       const res = await fetch(`/api/admin/agent/history?${params}`);
//       const data = await res.json();

//       if (data.success) {
//         setRecords(data.records || []);
//         setSummary(data.summary || null);
//         setPagination(data.pagination || null);
//       } else {
//         setMessage({ type: "error", text: data.message || "লোড করা যায়নি" });
//       }
//     } catch (err) {
//       setMessage({ type: "error", text: "সার্ভার এরর" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadHistory();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters.type, filters.status, filters.page]);

//   const setFilter = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
//   };

//   const filteredRecords = records.filter((r) => {
//     if (!searchQuery) return true;
//     const query = searchQuery.toLowerCase();
//     const agentCode = (r.agentId?.agentCode || "").toLowerCase();
//     const agentPhone = (
//       r.agentId?.agentPhone ||
//       r.agentId?.phone ||
//       ""
//     ).toLowerCase();
//     const uid = (r.uid || "").toLowerCase();
//     const trxId = (r.transactionId || "").toLowerCase();
//     const senderNumber = (
//       r.senderNumber ||
//       r.accountNumber ||
//       ""
//     ).toLowerCase();

//     return (
//       agentCode.includes(query) ||
//       agentPhone.includes(query) ||
//       uid.includes(query) ||
//       trxId.includes(query) ||
//       senderNumber.includes(query)
//     );
//   });

//   return (
//     <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100 bg-[#07090e]">
//       <div className="mb-6">
//         <Link
//           href="/admin/agent"
//           className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 mb-2"
//         >
//           <i className="fa-solid fa-arrow-left text-xs"></i> এজেন্ট
//           ম্যানেজমেন্টে ফিরে যান
//         </Link>
//         <h1 className="text-2xl font-bold text-purple-400">এজেন্ট হিস্ট্রি</h1>
//         <p className="text-slate-400 mt-1 text-sm">
//           এজেন্টদের সাথে সম্পর্কিত সব ডিপোজিট ও উইথড্রর হিস্ট্রি
//         </p>
//       </div>

//       {message && (
//         <div className="mb-4 p-3 rounded-xl border bg-rose-950/40 border-rose-500/50 text-rose-400 text-sm font-bold">
//           {message.text}
//         </div>
//       )}

//       {summary && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <SummaryCard
//             label="মোট ডিপোজিট"
//             value={summary.totalDeposits ?? 0}
//             icon="💰"
//             color="text-emerald-400"
//           />
//           <SummaryCard
//             label="মোট উইথড্র"
//             value={summary.totalWithdraws ?? 0}
//             icon="💸"
//             color="text-rose-400"
//           />
//           <SummaryCard
//             label="মোট রেকর্ড"
//             value={summary.totalRecords ?? 0}
//             icon="📋"
//             color="text-blue-400"
//           />
//         </div>
//       )}

//       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 shadow-lg space-y-4">
//         <div>
//           <div className="relative">
//             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
//               <i className="fa-solid fa-search"></i>
//             </span>
//             <input
//               type="text"
//               placeholder="এজেন্ট কোড, ফোন নাম্বার, UID, TrxID বা সেন্ডার নাম্বার দিয়ে সার্চ করুন..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition"
//             />
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-6 pt-2">
//           <div>
//             <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
//               টাইপ
//             </label>
//             <div className="flex gap-2">
//               {[
//                 { key: "all", label: "সব" },
//                 { key: "deposit", label: "ডিপোজিট" },
//                 { key: "withdraw", label: "উইথড্র" },
//               ].map((t) => (
//                 <button
//                   key={t.key}
//                   onClick={() => setFilter("type", t.key)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
//                     filters.type === t.key
//                       ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
//                       : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800"
//                   }`}
//                 >
//                   {t.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
//               স্ট্যাটাস
//             </label>
//             <div className="flex gap-2 flex-wrap">
//               {[
//                 { key: "all", label: "সব" },
//                 { key: "pending", label: "পেন্ডিং" },
//                 { key: "approved", label: "অ্যাপ্রুভড" },
//                 { key: "rejected", label: "রিজেক্টেড" },
//                 { key: "partial", label: "পার্শিয়াল" },
//               ].map((s) => (
//                 <button
//                   key={s.key}
//                   onClick={() => setFilter("status", s.key)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
//                     filters.status === s.key
//                       ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30"
//                       : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800"
//                   }`}
//                 >
//                   {s.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
//         {loading ? (
//           <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
//         ) : filteredRecords.length === 0 ? (
//           <p className="p-5 text-slate-400 text-sm">
//             কোনো রেকর্ড পাওয়া যায়নি।
//           </p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm whitespace-nowrap">
//               <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
//                 <tr>
//                   <th className="px-4 py-3 text-left">টাইপ</th>
//                   <th className="px-4 py-3 text-left">এজেন্ট</th>
//                   <th className="px-4 py-3 text-left">ইউজার UID</th>
//                   <th className="px-4 py-3 text-left">সেন্ডার নাম্বার</th>
//                   <th className="px-4 py-3 text-left">TrxID</th>
//                   <th className="px-4 py-3 text-right">পরিমাণ</th>
//                   <th className="px-4 py-3 text-right">কমিশন</th>
//                   <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
//                   <th className="px-4 py-3 text-center">কমিশন পেইড</th>
//                   <th className="px-4 py-3 text-left">সময়</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800">
//                 {filteredRecords.map((r) => {
//                   const agent = r.agentId || {};
//                   const isDeposit = r.recordType === "deposit";
//                   const senderAccount =
//                     r.senderNumber || r.accountNumber || "-";

//                   return (
//                     <tr
//                       key={`${r.recordType}-${r._id}`}
//                       className="hover:bg-slate-800/50 transition"
//                     >
//                       <td className="px-4 py-3">
//                         <span
//                           className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
//                             isDeposit
//                               ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30"
//                               : "bg-rose-950/50 text-rose-400 border-rose-500/30"
//                           }`}
//                         >
//                           {isDeposit ? "ডিপোজিট" : "উইথড্র"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div>
//                           <p className="font-bold text-slate-200">
//                             {agent.agentCode || "-"}
//                           </p>
//                           <p className="text-[10px] text-slate-500 font-mono">
//                             {agent.agentPhone || agent.phone || "-"}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-slate-300 font-mono">
//                         {r.uid}
//                       </td>
//                       <td className="px-4 py-3">
//                         {senderAccount !== "-" ? (
//                           <span className="font-mono text-xs text-amber-300 select-all">
//                             {senderAccount}
//                           </span>
//                         ) : (
//                           <span className="text-slate-600">-</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         {r.transactionId ? (
//                           <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">
//                             <span className="font-mono text-xs text-slate-300 select-all">
//                               {r.transactionId}
//                             </span>
//                           </div>
//                         ) : (
//                           <span className="text-slate-600">-</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 text-right font-mono">
//                         {r.originalCurrency === "USD" && r.originalAmount ? (
//                           <div>
//                             <p className="text-blue-300">
//                               ${Number(r.originalAmount).toFixed(2)}
//                             </p>
//                             <p className="text-[10px] text-slate-500">
//                               ৳{Number(r.amount).toFixed(2)}
//                             </p>
//                           </div>
//                         ) : (
//                           <p className="text-slate-200">
//                             ৳{Number(r.amount).toFixed(2)}
//                           </p>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 text-right font-mono">
//                         {r.agentCommission > 0 ? (
//                           <div>
//                             <p className="text-emerald-400 font-bold">
//                               ৳{Number(r.agentCommission).toFixed(2)}
//                             </p>
//                             <p className="text-[10px] text-slate-500">
//                               ({r.agentCommissionRate}%)
//                             </p>
//                           </div>
//                         ) : (
//                           <span className="text-slate-600">-</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <StatusBadge status={r.status} />
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         {r.agentCommissionPaid ? (
//                           <span className="text-emerald-400 font-bold">✅</span>
//                         ) : (
//                           <span className="text-slate-600">⏳</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">
//                         {new Date(r.createdAt).toLocaleString("bn-BD")}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {pagination && pagination.totalPages > 1 && (
//         <div className="mt-6 flex items-center justify-center gap-3">
//           <button
//             onClick={() =>
//               setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
//             }
//             disabled={filters.page === 1}
//             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
//           >
//             ←
//           </button>
//           <span className="text-xs font-bold text-slate-400">
//             পেজ {filters.page} / {pagination.totalPages}
//           </span>
//           <button
//             onClick={() =>
//               setFilters((p) => ({
//                 ...p,
//                 page: Math.min(pagination.totalPages, p.page + 1),
//               }))
//             }
//             disabled={filters.page === pagination.totalPages}
//             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
//           >
//             →
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function StatusBadge({ status }) {
//   const styles = {
//     pending: "bg-yellow-950/50 text-yellow-400 border-yellow-500/30",
//     approved: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
//     rejected: "bg-rose-950/50 text-rose-400 border-rose-500/30",
//     partial: "bg-blue-950/50 text-blue-400 border-blue-500/30",
//   };
//   const labels = {
//     pending: "পেন্ডিং",
//     approved: "অ্যাপ্রুভড",
//     rejected: "রিজেক্টেড",
//     partial: "পার্শিয়াল",
//   };
//   return (
//     <span
//       className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status] || "bg-slate-800 text-slate-400"}`}
//     >
//       {labels[status] || status}
//     </span>
//   );
// }

// function SummaryCard({ label, value, icon, color }) {
//   return (
//     <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
//       <div className="flex items-center justify-between">
//         <span className="text-xs font-semibold text-slate-400">{label}</span>
//         <span className="text-lg opacity-80">{icon}</span>
//       </div>
//       <p className={`text-2xl font-black mt-2 font-mono ${color}`}>{value}</p>
//     </div>
//   );
// }
// //////////////////////////////////////////////////////////////////////////////
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AgentHistoryPage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    page: 1,
  });

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filters.type,
        status: filters.status,
        page: String(filters.page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/agent/history?${params}`);
      const data = await res.json();

      if (data.success) {
        setRecords(data.records || []);
        setSummary(data.summary || null);
        setPagination(data.pagination || null);
      } else {
        setMessage({ type: "error", text: data.message || "লোড করা যায়নি" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.status, filters.page]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const agentCode = (r.agentId?.agentCode || "").toLowerCase();
    const agentPhone = (
      r.agentId?.agentPhone ||
      r.agentId?.phone ||
      ""
    ).toLowerCase();
    const uid = (r.uid || "").toLowerCase();
    const trxId = (r.transactionId || "").toLowerCase();
    const senderNumber = (
      r.senderNumber ||
      r.accountNumber ||
      ""
    ).toLowerCase();

    return (
      agentCode.includes(query) ||
      agentPhone.includes(query) ||
      uid.includes(query) ||
      trxId.includes(query) ||
      senderNumber.includes(query)
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100 bg-[#07090e]">
      <div className="mb-6">
        <Link
          href="/admin/agent"
          className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 mb-2"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i> এজেন্ট
          ম্যানেজমেন্টে ফিরে যান
        </Link>
        <h1 className="text-2xl font-bold text-purple-400">এজেন্ট হিস্ট্রি</h1>
        <p className="text-slate-400 mt-1 text-sm">
          এজেন্টদের সাথে সম্পর্কিত সব ডিপোজিট ও উইথড্রর হিস্ট্রি
        </p>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl border bg-rose-950/40 border-rose-500/50 text-rose-400 text-sm font-bold">
          {message.text}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            label="মোট ডিপোজিট"
            value={summary.totalDeposits ?? 0}
            icon="💰"
            color="text-emerald-400"
          />
          <SummaryCard
            label="মোট উইথড্র"
            value={summary.totalWithdraws ?? 0}
            icon="💸"
            color="text-rose-400"
          />
          <SummaryCard
            label="মোট রেকর্ড"
            value={summary.totalRecords ?? 0}
            icon="📋"
            color="text-blue-400"
          />
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 shadow-lg space-y-4">
        <div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <i className="fa-solid fa-search"></i>
            </span>
            <input
              type="text"
              placeholder="এজেন্ট কোড, ফোন নাম্বার, UID, TrxID বা সেন্ডার নাম্বার দিয়ে সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
              টাইপ
            </label>
            <div className="flex gap-2">
              {[
                { key: "all", label: "সব" },
                { key: "deposit", label: "ডিপোজিট" },
                { key: "withdraw", label: "উইথড্র" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter("type", t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    filters.type === t.key
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
                      : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
              স্ট্যাটাস
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "সব" },
                { key: "pending", label: "পেন্ডিং" },
                { key: "approved", label: "অ্যাপ্রুভড" },
                { key: "rejected", label: "রিজেক্টেড" },
                { key: "partial", label: "পার্শিয়াল" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFilter("status", s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    filters.status === s.key
                      ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30"
                      : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="p-5 text-slate-400 text-sm">
            কোনো রেকর্ড পাওয়া যায়নি।
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left">টাইপ</th>
                  <th className="px-4 py-3 text-left">এজেন্ট</th>
                  <th className="px-4 py-3 text-left">ইউজার UID</th>
                  <th className="px-4 py-3 text-left">সেন্ডার নাম্বার</th>
                  <th className="px-4 py-3 text-left">TrxID</th>
                  <th className="px-4 py-3 text-right">পরিমাণ</th>
                  <th className="px-4 py-3 text-right">কমিশন</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-center">কমিশন পেইড</th>
                  <th className="px-4 py-3 text-left">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.map((r) => {
                  const agent = r.agentId || {};
                  const isDeposit = r.recordType === "deposit";
                  const senderAccount =
                    r.senderNumber || r.accountNumber || "-";

                  return (
                    <tr
                      key={`${r.recordType}-${r._id}`}
                      className="hover:bg-slate-800/50 transition"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                            isDeposit
                              ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-950/50 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {isDeposit ? "ডিপোজিট" : "উইথড্র"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-slate-200">
                            {agent.agentCode || "-"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {agent.agentPhone || agent.phone || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono">
                        {r.uid}
                      </td>
                      <td className="px-4 py-3">
                        {senderAccount !== "-" ? (
                          <span className="font-mono text-xs text-amber-300 select-all">
                            {senderAccount}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.transactionId ? (
                          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">
                            <span className="font-mono text-xs text-slate-300 select-all">
                              {r.transactionId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {r.originalCurrency === "USD" && r.originalAmount ? (
                          <div>
                            <p className="text-blue-300">
                              ${Number(r.originalAmount).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              ৳{Number(r.amount).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-200">
                            ৳{Number(r.amount).toFixed(2)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {r.agentCommission > 0 ? (
                          <div>
                            <p className="text-emerald-400 font-bold">
                              ৳{Number(r.agentCommission).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              ({r.agentCommissionRate}%)
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {/* 🆕 শুধু approved হলে কমিশন পেইড দেখাবে */}
                        {r.status === "approved" && r.agentCommissionPaid ? (
                          <span className="text-emerald-400 font-bold">✅</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">
                        {new Date(r.createdAt).toLocaleString("bn-BD")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() =>
              setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
            }
            disabled={filters.page === 1}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
          >
            ←
          </button>
          <span className="text-xs font-bold text-slate-400">
            পেজ {filters.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: Math.min(pagination.totalPages, p.page + 1),
              }))
            }
            disabled={filters.page === pagination.totalPages}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-950/50 text-yellow-400 border-yellow-500/30",
    approved: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-950/50 text-rose-400 border-rose-500/30",
    partial: "bg-blue-950/50 text-blue-400 border-blue-500/30",
  };
  const labels = {
    pending: "পেন্ডিং",
    approved: "অ্যাপ্রুভড",
    rejected: "রিজেক্টেড",
    partial: "পার্শিয়াল",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status] || "bg-slate-800 text-slate-400"}`}
    >
      {labels[status] || status}
    </span>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <span className="text-lg opacity-80">{icon}</span>
      </div>
      <p className={`text-2xl font-black mt-2 font-mono ${color}`}>{value}</p>
    </div>
  );
}
