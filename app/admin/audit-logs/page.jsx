// // "use client";

// // import { useState, useEffect } from "react";

// // export default function AuditLogsPage() {
// //   const [logs, setLogs] = useState([]);
// //   const [groupedLogs, setGroupedLogs] = useState({});
// //   const [activeTab, setActiveTab] = useState("all");
// //   const [loading, setLoading] = useState(true);
// //   const [message, setMessage] = useState("");

// //   // 🆕 Summary state
// //   const [summary, setSummary] = useState({
// //     totalApprovedBDT: 0,
// //     totalRejectedBDT: 0,
// //     todayApprovedBDT: 0,
// //     adminApprovedBDT: 0,
// //   });
// //   const [summaryLoading, setSummaryLoading] = useState(true);

// //   // 🆕 ট্যাব লিস্টে সাপ্তাহিক ও মাসিক বোনাস যোগ করা হলো
// //   const tabList = [
// //     { key: "all", label: "সকল লগ" },
// //     { key: "weekly_bonus", label: "সাপ্তাহিক বোনাস" },
// //     { key: "monthly_bonus", label: "মাসিক বোনাস" },
// //     { key: "view_bonus_history", label: "বোনাস ইতিহাস" },
// //     { key: "manage_dashboard", label: "ড্যাশবোর্ড" },
// //     { key: "view_game_tracking", label: "ট্র্যাকিং" },
// //     { key: "manage_users", label: "ইউজার" },
// //     { key: "manage_agents", label: "এজেন্ট সিস্টেম" },
// //     { key: "manage_deposits", label: "ডিপোজিট" },
// //     { key: "manage_withdraws", label: "উইথড্র" },
// //     { key: "manage_referrals", label: "রেফারেল" },
// //     { key: "manage_payments", label: "পেমেন্ট" },
// //     { key: "manage_methods", label: "মেথডস" },
// //     { key: "manage_exchange_rate", label: "Exchange Rate" },
// //     { key: "manage_nowpayments", label: "NowPayments" },
// //     { key: "manage_auto_crypto", label: "Auto Crypto" },
// //     { key: "manage_bonus_settings", label: "বোনাস সেটিংস" },
// //     { key: "others", label: "অন্যান্য" },
// //   ];

// //   useEffect(() => {
// //     fetchAuditLogs();
// //     fetchSummary();
// //   }, []);

// //   const fetchAuditLogs = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetch("/api/admin/audit-logs");
// //       const data = await res.json();
// //       if (data.success) {
// //         setLogs(data.logs || []);
// //         setGroupedLogs(data.groupedLogs || {});
// //       } else {
// //         setMessage(data.message || "ডেটা লোড করতে ব্যর্থ হয়েছে।");
// //       }
// //     } catch (err) {
// //       setMessage("সার্ভার ত্রুটি ঘটেছে।");
// //     }
// //     setLoading(false);
// //   };

// //   const fetchSummary = async () => {
// //     setSummaryLoading(true);
// //     try {
// //       const res = await fetch("/api/admin/audit-logs/summary");
// //       const data = await res.json();
// //       if (data.success && data.summary) {
// //         setSummary(data.summary);
// //       }
// //     } catch (err) {
// //       console.error("Summary fetch error:", err);
// //     }
// //     setSummaryLoading(false);
// //   };

// //   const currentLogs = activeTab === "all" ? logs : groupedLogs[activeTab] || [];

// //   // সুন্দর ও স্পষ্ট ফরম্যাটে অবজেক্ট বা মান দেখানোর ফাংশন
// //   const renderDataValue = (val) => {
// //     if (val === null || val === undefined) {
// //       return <span className="text-slate-500 italic">N/A</span>;
// //     }

// //     // 🆕 যদি ভ্যালু অ্যারে (Array) হয় (যেমন agentPaymentAccounts)
// //     if (Array.isArray(val)) {
// //       if (val.length === 0)
// //         return <span className="text-slate-500 italic">কোনো ডেটা নেই</span>;

// //       return (
// //         <div className="space-y-1">
// //           {val.map((item, idx) => {
// //             if (typeof item === "object" && item !== null) {
// //               return (
// //                 <div key={idx} className="border-b border-white/5 pb-1 mb-1">
// //                   {Object.entries(item).map(([k, v]) => (
// //                     <div
// //                       key={k}
// //                       className="flex justify-between items-center text-[11px]"
// //                     >
// //                       <span className="text-slate-400 capitalize">{k}:</span>
// //                       <span className="font-semibold text-white">
// //                         {String(v)}
// //                       </span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               );
// //             }
// //             return (
// //               <div key={idx} className="text-[11px] text-white">
// //                 {String(item)}
// //               </div>
// //             );
// //           })}
// //         </div>
// //       );
// //     }

// //     if (typeof val === "object") {
// //       const entries = Object.entries(val);
// //       if (entries.length === 0)
// //         return <span className="text-slate-500 italic">কোনো ডেটা নেই</span>;

// //       // ✅ বাংলা লেবেল ম্যাপ
// //       const labelMap = {
// //         balance: "ব্যালেন্স",
// //         turnover: "টার্নওভার",
// //         isBlocked: "ব্লক স্ট্যাটাস",
// //         customCommission: "কমিশন",
// //         amountBDT: "টাকা (৳)",
// //         amountUSD: "ডলার ($)",
// //         dollarRate: "ডলার রেট",
// //         paymentMethod: "পেমেন্ট মেথড",
// //         requestId: "রিকোয়েস্ট আইডি",
// //         status: "স্ট্যাটাস",
// //         adminNote: "অ্যাডমিন নোট",
// //         agentMainBalance: "এজেন্ট মূল ব্যালেন্স",
// //         agentCommissionBalance: "এজেন্ট কমিশন ব্যালেন্স",
// //         agentPhone: "এজেন্ট ফোন",
// //         agentCode: "এজেন্ট কোড",
// //         totalBonus: "মোট বোনাস",
// //         totalWinners: "বিজয়ী সংখ্যা",
// //         totalSkipped: "স্কিপ সংখ্যা",
// //         monthKey: "মাস",
// //         weekKey: "সপ্তাহ",
// //         topRankerMaxBonus: "সর্বোচ্চ বোনাস লিমিট",
// //         totalMonthlyLoss: "মোট মাসিক লস",
// //         defaultDepositCommission: "ডিফল্ট ডিপোজিট কমিশন (%)",
// //         defaultWithdrawCommission: "ডিফল্ট উইথড্র কমিশন (%)",
// //         paymentAddress: "পেমেন্ট অ্যাড্রেস",
// //         agentPaymentAccounts: "পেমেন্ট অ্যাকাউন্টস",
// //         agentCryptoAddress: "ক্রিপ্টো অ্যাড্রেস",
// //         agentIsActive: "এজেন্ট স্ট্যাটাস (Active)",
// //         agentIsBlocked: "এজেন্ট স্ট্যাটাস (Blocked)",
// //         role: "রোল",
// //       };

// //       return (
// //         <div className="space-y-1">
// //           {entries.map(([key, value]) => {
// //             // 🆕 যদি ভ্যালু আবার অ্যারে হয়, তবে রিকার্সিভলি renderDataValue কল করুন
// //             if (Array.isArray(value)) {
// //               return (
// //                 <div key={key} className="border-b border-white/5 pb-1 mb-1">
// //                   <span className="text-slate-400 capitalize block mb-1">
// //                     {labelMap[key] || key}:
// //                   </span>
// //                   {renderDataValue(value)}
// //                 </div>
// //               );
// //             }

// //             let labelName = labelMap[key] || key;
// //             let displayVal = String(value);
// //             if (value === true) displayVal = "হ্যাঁ (Blocked/True)";
// //             if (value === false) displayVal = "না (Active/False)";

// //             // টাকার ফরম্যাট
// //             if (
// //               key === "amountBDT" ||
// //               key === "agentMainBalance" ||
// //               key === "agentCommissionBalance" ||
// //               key === "totalBonus" ||
// //               key === "topRankerMaxBonus" ||
// //               key === "totalMonthlyLoss"
// //             ) {
// //               displayVal = `৳${Number(value || 0).toLocaleString("bn-BD")}`;
// //             }
// //             if (key === "amountUSD") {
// //               displayVal = `$${Number(value || 0).toLocaleString("en-US")}`;
// //             }
// //             if (key === "dollarRate") {
// //               displayVal = `৳${Number(value || 0)}`;
// //             }

// //             return (
// //               <div
// //                 key={key}
// //                 className="flex justify-between items-center text-[11px] border-b border-white/5 pb-0.5"
// //               >
// //                 <span className="text-slate-400 capitalize">{labelName}:</span>
// //                 <span className="font-semibold text-white">{displayVal}</span>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       );
// //     }

// //     return <span>{String(val)}</span>;
// //   };

// //   return (
// //     <div className="p-2 sm:p-5 text-white max-w-5xl mx-auto font-sans">
// //       <div className="mb-4">
// //         <h1 className="text-lg sm:text-xl font-bold text-emerald-400">
// //           📜 অডিট লগ ও অ্যাক্টিভিটি ট্র্যাকার
// //         </h1>
// //         <p className="text-[11px] sm:text-xs text-slate-400">
// //           কে, কখন এবং কী পরিবর্তন করেছেন তার হিস্ট্রি
// //         </p>
// //       </div>

// //       {/* Summary কার্ড */}
// //       <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
// //         <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3">
// //           <p className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-wide">
// //             মোট অ্যাপ্রুভ
// //           </p>
// //           <p className="text-lg md:text-xl font-black text-emerald-400 font-mono mt-1">
// //             {summaryLoading
// //               ? "..."
// //               : `৳${Number(summary.totalApprovedBDT || 0).toLocaleString("bn-BD")}`}
// //           </p>
// //         </div>

// //         <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3">
// //           <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-wide">
// //             আজকের অ্যাপ্রুভ
// //           </p>
// //           <p className="text-lg md:text-xl font-black text-blue-400 font-mono mt-1">
// //             {summaryLoading
// //               ? "..."
// //               : `৳${Number(summary.todayApprovedBDT || 0).toLocaleString("bn-BD")}`}
// //           </p>
// //         </div>

// //         <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3">
// //           <p className="text-[10px] text-rose-400/80 font-semibold uppercase tracking-wide">
// //             মোট রিজেক্ট
// //           </p>
// //           <p className="text-lg md:text-xl font-black text-rose-400 font-mono mt-1">
// //             {summaryLoading
// //               ? "..."
// //               : `৳${Number(summary.totalRejectedBDT || 0).toLocaleString("bn-BD")}`}
// //           </p>
// //         </div>

// //         <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3">
// //           <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wide">
// //             এই অ্যাডমিনের
// //           </p>
// //           <p className="text-lg md:text-xl font-black text-amber-400 font-mono mt-1">
// //             {summaryLoading
// //               ? "..."
// //               : `৳${Number(summary.adminApprovedBDT || 0).toLocaleString("bn-BD")}`}
// //           </p>
// //         </div>
// //       </div>

// //       {/* ক্যাটাগরি ফিল্টার ট্যাব */}
// //       <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
// //         {tabList.map((tab) => (
// //           <button
// //             key={tab.key}
// //             onClick={() => setActiveTab(tab.key)}
// //             className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shadow-sm ${
// //               activeTab === tab.key
// //                 ? "bg-emerald-600 text-white shadow-emerald-900/30"
// //                 : "bg-[#0b132b] text-slate-400 border border-slate-800/80 hover:bg-slate-800"
// //             }`}
// //           >
// //             {tab.label}{" "}
// //             {tab.key !== "all" && groupedLogs[tab.key]?.length
// //               ? `(${groupedLogs[tab.key].length})`
// //               : ""}
// //           </button>
// //         ))}
// //       </div>

// //       {message && (
// //         <div className="p-2.5 mb-4 bg-slate-800 border border-slate-700 rounded-lg text-yellow-300 text-xs text-center">
// //           {message}
// //         </div>
// //       )}

// //       <div className="max-h-[620px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/40">
// //         {loading ? (
// //           <div className="p-8 text-center text-xs text-slate-400 bg-[#0b132b] border border-slate-800 rounded-xl">
// //             অডিট লগ লোড হচ্ছে...
// //           </div>
// //         ) : currentLogs.length === 0 ? (
// //           <div className="p-8 text-center text-xs text-slate-500 bg-[#0b132b] border border-slate-800 rounded-xl">
// //             কোনো লগের তথ্য পাওয়া যায়নি।
// //           </div>
// //         ) : (
// //           currentLogs.map((log) => (
// //             <div
// //               key={log._id}
// //               className="bg-[#0b132b] border border-slate-800/80 rounded-xl p-3 shadow-md hover:border-slate-700/80 transition space-y-2"
// //             >
// //               <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800/60 pb-2">
// //                 <div className="flex items-center gap-1.5 flex-wrap text-xs">
// //                   <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 font-bold text-[11px]">
// //                     {log.action}
// //                   </span>
// //                   <span className="text-slate-400 text-[11px]">
// //                     অ্যাডমিন:{" "}
// //                     <strong className="text-emerald-400">
// //                       {log.adminPhone || log.adminId || "অ্যাডমিন"}
// //                     </strong>
// //                   </span>
// //                   {log.targetUser && (
// //                     <span className="text-slate-400 text-[11px]">
// //                       | টার্গেট:{" "}
// //                       <strong className="text-slate-200">
// //                         {log.targetUser}
// //                       </strong>
// //                     </span>
// //                   )}
// //                 </div>
// //                 <div className="text-[10px] text-slate-400 font-mono">
// //                   {new Date(log.createdAt || log.timestamp).toLocaleString(
// //                     "bn-BD",
// //                   )}
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
// //                 <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-2">
// //                   <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
// //                     ❌ আগে ছিল (Old Value):
// //                   </p>
// //                   <div className="text-red-300 text-[11px] leading-tight">
// //                     {renderDataValue(log.oldData || log.oldValue)}
// //                   </div>
// //                 </div>

// //                 <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2">
// //                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
// //                     ✅ বর্তমান মান (New Value):
// //                   </p>
// //                   <div className="text-emerald-300 text-[11px] leading-tight">
// //                     {renderDataValue(log.newData || log.newValue)}
// //                   </div>
// //                 </div>
// //               </div>

// //               {log.details && (
// //                 <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/40 flex items-start gap-1.5">
// //                   <span className="text-slate-500 font-medium whitespace-nowrap">
// //                     বিস্তারিত:
// //                   </span>
// //                   <span className="break-words">{log.details}</span>
// //                 </div>
// //               )}
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// // //////////////////////////////////////////////////
// "use client";

// import { useState, useEffect } from "react";

// export default function AuditLogsPage() {
//   const [logs, setLogs] = useState([]);
//   const [groupedLogs, setGroupedLogs] = useState({});
//   const [activeTab, setActiveTab] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   // 🆕 Summary state
//   const [summary, setSummary] = useState({
//     totalApprovedBDT: 0,
//     totalRejectedBDT: 0,
//     todayApprovedBDT: 0,
//     adminApprovedBDT: 0,
//   });
//   const [summaryLoading, setSummaryLoading] = useState(true);

//   // 🆕 ট্যাব লিস্টে এজেন্ট ডিপোজিট যোগ করা হলো
//   const tabList = [
//     { key: "all", label: "সকল লগ" },
//     { key: "agent_deposits", label: "এজেন্ট ডিপোজিট" }, // 👈 নতুন ট্যাব
//     { key: "weekly_bonus", label: "সাপ্তাহিক বোনাস" },
//     { key: "monthly_bonus", label: "মাসিক বোনাস" },
//     { key: "view_bonus_history", label: "বোনাস ইতিহাস" },
//     { key: "manage_dashboard", label: "ড্যাশবোর্ড" },
//     { key: "view_game_tracking", label: "ট্র্যাকিং" },
//     { key: "manage_users", label: "ইউজার" },
//     { key: "manage_agents", label: "এজেন্ট সিস্টেম" },
//     { key: "manage_deposits", label: "ডিপোজিট" },
//     { key: "manage_withdraws", label: "উইথড্র" },
//     { key: "manage_referrals", label: "রেফারেল" },
//     { key: "manage_payments", label: "পেমেন্ট" },
//     { key: "manage_methods", label: "মেথডস" },
//     { key: "manage_exchange_rate", label: "Exchange Rate" },
//     { key: "manage_nowpayments", label: "NowPayments" },
//     { key: "manage_auto_crypto", label: "Auto Crypto" },
//     { key: "manage_bonus_settings", label: "বোনাস সেটিংস" },
//     { key: "others", label: "অন্যান্য" },
//   ];

//   useEffect(() => {
//     fetchAuditLogs();
//     fetchSummary();
//   }, []);

//   const fetchAuditLogs = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/admin/audit-logs");
//       const data = await res.json();
//       if (data.success) {
//         setLogs(data.logs || []);
//         setGroupedLogs(data.groupedLogs || {});
//       } else {
//         setMessage(data.message || "ডেটা লোড করতে ব্যর্থ হয়েছে।");
//       }
//     } catch (err) {
//       setMessage("সার্ভার ত্রুটি ঘটেছে।");
//     }
//     setLoading(false);
//   };

//   const fetchSummary = async () => {
//     setSummaryLoading(true);
//     try {
//       const res = await fetch("/api/admin/audit-logs/summary");
//       const data = await res.json();
//       if (data.success && data.summary) {
//         setSummary(data.summary);
//       }
//     } catch (err) {
//       console.error("Summary fetch error:", err);
//     }
//     setSummaryLoading(false);
//   };

//   // 🆕 এজেন্ট ডিপোজিট লগগুলো ফিল্টার করা
//   const agentDepositLogs = logs.filter(
//     (log) => log.action === "AGENT_DIRECT_DEPOSIT",
//   );

//   // 🆕 activeTab অনুযায়ী currentLogs আপডেট করা
//   const currentLogs =
//     activeTab === "all"
//       ? logs
//       : activeTab === "agent_deposits"
//         ? agentDepositLogs
//         : groupedLogs[activeTab] || [];

//   // সুন্দর ও স্পষ্ট ফরম্যাটে অবজেক্ট বা মান দেখানোর ফাংশন
//   const renderDataValue = (val) => {
//     if (val === null || val === undefined) {
//       return <span className="text-slate-500 italic">N/A</span>;
//     }

//     // 🆕 যদি ভ্যালু অ্যারে (Array) হয় (যেমন agentPaymentAccounts)
//     if (Array.isArray(val)) {
//       if (val.length === 0)
//         return <span className="text-slate-500 italic">কোনো ডেটা নেই</span>;

//       return (
//         <div className="space-y-1">
//           {val.map((item, idx) => {
//             if (typeof item === "object" && item !== null) {
//               return (
//                 <div key={idx} className="border-b border-white/5 pb-1 mb-1">
//                   {Object.entries(item).map(([k, v]) => (
//                     <div
//                       key={k}
//                       className="flex justify-between items-center text-[11px]"
//                     >
//                       <span className="text-slate-400 capitalize">{k}:</span>
//                       <span className="font-semibold text-white">
//                         {String(v)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               );
//             }
//             return (
//               <div key={idx} className="text-[11px] text-white">
//                 {String(item)}
//               </div>
//             );
//           })}
//         </div>
//       );
//     }

//     if (typeof val === "object") {
//       const entries = Object.entries(val);
//       if (entries.length === 0)
//         return <span className="text-slate-500 italic">কোনো ডেটা নেই</span>;

//       // ✅ বাংলা লেবেল ম্যাপ
//       const labelMap = {
//         balance: "ব্যালেন্স",
//         turnover: "টার্নওভার",
//         isBlocked: "ব্লক স্ট্যাটাস",
//         customCommission: "কমিশন",
//         amountBDT: "টাকা (৳)",
//         amountUSD: "ডলার ($)",
//         dollarRate: "ডলার রেট",
//         paymentMethod: "পেমেন্ট মেথড",
//         requestId: "রিকোয়েস্ট আইডি",
//         status: "স্ট্যাটাস",
//         adminNote: "অ্যাডমিন নোট",
//         agentMainBalance: "এজেন্ট মূল ব্যালেন্স",
//         agentCommissionBalance: "এজেন্ট কমিশন ব্যালেন্স",
//         agentPhone: "এজেন্ট ফোন",
//         agentCode: "এজেন্ট কোড",
//         totalBonus: "মোট বোনাস",
//         totalWinners: "বিজয়ী সংখ্যা",
//         totalSkipped: "স্কিপ সংখ্যা",
//         monthKey: "মাস",
//         weekKey: "সপ্তাহ",
//         topRankerMaxBonus: "সর্বোচ্চ বোনাস লিমিট",
//         totalMonthlyLoss: "মোট মাসিক লস",
//         defaultDepositCommission: "ডিফল্ট ডিপোজিট কমিশন (%)",
//         defaultWithdrawCommission: "ডিফল্ট উইথড্র কমিশন (%)",
//         paymentAddress: "পেমেন্ট অ্যাড্রেস",
//         agentPaymentAccounts: "পেমেন্ট অ্যাকাউন্টস",
//         agentCryptoAddress: "ক্রিপ্টো অ্যাড্রেস",
//         agentIsActive: "এজেন্ট স্ট্যাটাস (Active)",
//         agentIsBlocked: "এজেন্ট স্ট্যাটাস (Blocked)",
//         role: "রোল",
//         agentBalanceBefore: "এজেন্ট আগের ব্যালেন্স",
//         userBalanceBefore: "ইউজারের আগের ব্যালেন্স",
//         agentBalanceAfter: "এজেন্ট বর্তমান ব্যালেন্স",
//         userBalanceAfter: "ইউজারের বর্তমান ব্যালেন্স",
//         depositAmount: "ডিপোজিট পরিমাণ",
//       };

//       return (
//         <div className="space-y-1">
//           {entries.map(([key, value]) => {
//             // 🆕 যদি ভ্যালু আবার অ্যারে হয়, তবে রিকার্সিভলি renderDataValue কল করুন
//             if (Array.isArray(value)) {
//               return (
//                 <div key={key} className="border-b border-white/5 pb-1 mb-1">
//                   <span className="text-slate-400 capitalize block mb-1">
//                     {labelMap[key] || key}:
//                   </span>
//                   {renderDataValue(value)}
//                 </div>
//               );
//             }

//             let labelName = labelMap[key] || key;
//             let displayVal = String(value);
//             if (value === true) displayVal = "হ্যাঁ (Blocked/True)";
//             if (value === false) displayVal = "না (Active/False)";

//             return (
//               <div
//                 key={key}
//                 className="flex justify-between items-center text-[11px] border-b border-white/5 pb-0.5"
//               >
//                 <span className="text-slate-400 capitalize">{labelName}:</span>
//                 <span className="font-semibold text-white">{displayVal}</span>
//               </div>
//             );
//           })}
//         </div>
//       );
//     }

//     return <span>{String(val)}</span>;
//   };

//   return (
//     <div className="p-2 sm:p-5 text-white max-w-5xl mx-auto font-sans">
//       <div className="mb-4">
//         <h1 className="text-lg sm:text-xl font-bold text-emerald-400">
//           📜 অডিট লগ ও অ্যাক্টিভিটি ট্র্যাকার
//         </h1>
//         <p className="text-[11px] sm:text-xs text-slate-400">
//           কে, কখন এবং কী পরিবর্তন করেছেন তার হিস্ট্রি
//         </p>
//       </div>

//       {/* Summary কার্ড */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
//         <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3">
//           <p className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-wide">
//             মোট অ্যাপ্রুভ
//           </p>
//           <p className="text-lg md:text-xl font-black text-emerald-400 font-mono mt-1">
//             {summaryLoading
//               ? "..."
//               : `৳${Number(summary.totalApprovedBDT || 0).toLocaleString("bn-BD")}`}
//           </p>
//         </div>

//         <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3">
//           <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-wide">
//             আজকের অ্যাপ্রুভ
//           </p>
//           <p className="text-lg md:text-xl font-black text-blue-400 font-mono mt-1">
//             {summaryLoading
//               ? "..."
//               : `৳${Number(summary.todayApprovedBDT || 0).toLocaleString("bn-BD")}`}
//           </p>
//         </div>

//         <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3">
//           <p className="text-[10px] text-rose-400/80 font-semibold uppercase tracking-wide">
//             মোট রিজেক্ট
//           </p>
//           <p className="text-lg md:text-xl font-black text-rose-400 font-mono mt-1">
//             {summaryLoading
//               ? "..."
//               : `৳${Number(summary.totalRejectedBDT || 0).toLocaleString("bn-BD")}`}
//           </p>
//         </div>

//         <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3">
//           <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wide">
//             এই অ্যাডমিনের
//           </p>
//           <p className="text-lg md:text-xl font-black text-amber-400 font-mono mt-1">
//             {summaryLoading
//               ? "..."
//               : `৳${Number(summary.adminApprovedBDT || 0).toLocaleString("bn-BD")}`}
//           </p>
//         </div>
//       </div>

//       {/* ক্যাটাগরি ফিল্টার ট্যাব */}
//       <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
//         {tabList.map((tab) => {
//           // 🆕 এজেন্ট ডিপোজিট ট্যাবের জন্য সংখ্যা হিসাব
//           const count =
//             tab.key === "agent_deposits"
//               ? agentDepositLogs.length
//               : groupedLogs[tab.key]?.length;

//           return (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shadow-sm ${
//                 activeTab === tab.key
//                   ? "bg-emerald-600 text-white shadow-emerald-900/30"
//                   : "bg-[#0b132b] text-slate-400 border border-slate-800/80 hover:bg-slate-800"
//               }`}
//             >
//               {tab.label} {tab.key !== "all" && count ? `(${count})` : ""}
//             </button>
//           );
//         })}
//       </div>

//       {message && (
//         <div className="p-2.5 mb-4 bg-slate-800 border border-slate-700 rounded-lg text-yellow-300 text-xs text-center">
//           {message}
//         </div>
//       )}

//       <div className="max-h-[620px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/40">
//         {loading ? (
//           <div className="p-8 text-center text-xs text-slate-400 bg-[#0b132b] border border-slate-800 rounded-xl">
//             অডিট লগ লোড হচ্ছে...
//           </div>
//         ) : currentLogs.length === 0 ? (
//           <div className="p-8 text-center text-xs text-slate-500 bg-[#0b132b] border border-slate-800 rounded-xl">
//             কোনো লগের তথ্য পাওয়া যায়নি।
//           </div>
//         ) : (
//           currentLogs.map((log) => (
//             <div
//               key={log._id}
//               className="bg-[#0b132b] border border-slate-800/80 rounded-xl p-3 shadow-md hover:border-slate-700/80 transition space-y-2"
//             >
//               <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800/60 pb-2">
//                 <div className="flex items-center gap-1.5 flex-wrap text-xs">
//                   <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 font-bold text-[11px]">
//                     {log.action}
//                   </span>
//                   <span className="text-slate-400 text-[11px]">
//                     অ্যাডমিন:{" "}
//                     <strong className="text-emerald-400">
//                       {log.adminPhone || log.adminId || "অ্যাডমিন"}
//                     </strong>
//                   </span>
//                   {log.targetUser && (
//                     <span className="text-slate-400 text-[11px]">
//                       | টার্গেট:{" "}
//                       <strong className="text-slate-200">
//                         {log.targetUser}
//                       </strong>
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-[10px] text-slate-400 font-mono">
//                   {new Date(log.createdAt || log.timestamp).toLocaleString(
//                     "bn-BD",
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
//                 <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-2">
//                   <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
//                     ❌ আগে ছিল (Old Value):
//                   </p>
//                   <div className="text-red-300 text-[11px] leading-tight">
//                     {renderDataValue(log.oldData || log.oldValue)}
//                   </div>
//                 </div>

//                 <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2">
//                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
//                     ✅ বর্তমান মান (New Value):
//                   </p>
//                   <div className="text-emerald-300 text-[11px] leading-tight">
//                     {renderDataValue(log.newData || log.newValue)}
//                   </div>
//                 </div>
//               </div>

//               {log.details && (
//                 <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/40 flex items-start gap-1.5">
//                   <span className="text-slate-500 font-medium whitespace-nowrap">
//                     বিস্তারিত:
//                   </span>
//                   <span className="break-words">{log.details}</span>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
// //////////////////////////////////////////////
"use client";

import { useState, useEffect } from "react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🆕 Summary state
  const [summary, setSummary] = useState({
    totalApprovedBDT: 0,
    totalRejectedBDT: 0,
    todayApprovedBDT: 0,
    adminApprovedBDT: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  // 🆕 ট্যাব লিস্টে এজেন্ট ডিপোজিট যোগ করা হলো
  const tabList = [
    { key: "all", label: "সকল লগ" },
    { key: "agent_deposits", label: "এজেন্ট ডিপোজিট" },
    { key: "weekly_bonus", label: "সাপ্তাহিক বোনাস" },
    { key: "monthly_bonus", label: "মাসিক বোনাস" },
    { key: "view_bonus_history", label: "বোনাস ইতিহাস" },
    { key: "manage_dashboard", label: "ড্যাশবোর্ড" },
    { key: "view_game_tracking", label: "ট্র্যাকিং" },
    { key: "manage_users", label: "ইউজার" },
    { key: "manage_agents", label: "এজেন্ট সিস্টেম" },
    { key: "manage_deposits", label: "ডিপোজিট" },
    { key: "manage_withdraws", label: "উইথড্র" },
    { key: "manage_referrals", label: "রেফারেল" },
    { key: "manage_payments", label: "পেমেন্ট" },
    { key: "manage_methods", label: "মেথডস" },
    { key: "manage_exchange_rate", label: "Exchange Rate" },
    { key: "manage_nowpayments", label: "NowPayments" },
    { key: "manage_auto_crypto", label: "Auto Crypto" },
    { key: "manage_bonus_settings", label: "বোনাস সেটিংস" },
    { key: "others", label: "অন্যান্য" },
  ];

  useEffect(() => {
    fetchAuditLogs();
    fetchSummary();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setGroupedLogs(data.groupedLogs || {});
      } else {
        setMessage(data.message || "ডেটা লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setMessage("সার্ভার ত্রুটি ঘটেছে।");
    }
    setLoading(false);
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs/summary");
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Summary fetch error:", err);
    }
    setSummaryLoading(false);
  };

  // 🆕 এজেন্ট ডিপোজিট লগগুলো ফিল্টার করা
  const agentDepositLogs = logs.filter(
    (log) => log.action === "AGENT_DIRECT_DEPOSIT",
  );

  // 🆕 activeTab অনুযায়ী currentLogs আপডেট করা
  const currentLogs =
    activeTab === "all"
      ? logs
      : activeTab === "agent_deposits"
        ? agentDepositLogs
        : groupedLogs[activeTab] || [];

  // সুন্দর ও স্পষ্ট ফরম্যাটে অবজেক্ট বা মান দেখানোর ফাংশন
  const renderDataValue = (val) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-500 italic">N/A</span>;
    }

    // 🆕 যদি ভ্যালু অ্যারে (Array) হয়
    if (Array.isArray(val)) {
      if (val.length === 0)
        return <span className="text-slate-500 italic">কোনো ডেটা নেই</span>;

      return (
        <div className="space-y-1">
          {val.map((item, idx) => {
            if (typeof item === "object" && item !== null) {
              return (
                <div key={idx} className="border-b border-white/5 pb-1 mb-1">
                  {Object.entries(item).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between items-center text-[11px]"
                    >
                      <span className="text-slate-400 capitalize">{k}:</span>
                      <span className="font-semibold text-white">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div key={idx} className="text-[11px] text-white">
                {String(item)}
              </div>
            );
          })}
        </div>
      );
    }

    if (typeof val === "object") {
      const entries = Object.entries(val);
      if (entries.length === 0)
        return <span className="text-slate-500 italic">কোনো ডেটা নেই</span>;

      // ✅ বাংলা লেবেল ম্যাপ (নতুন ফিল্ডগুলো যোগ করা হলো)
      const labelMap = {
        balance: "ব্যালেন্স",
        turnover: "টার্নওভার",
        isBlocked: "ব্লক স্ট্যাটাস",
        customCommission: "কমিশন",
        amountBDT: "টাকা (৳)",
        amountUSD: "ডলার ($)",
        dollarRate: "ডলার রেট",
        paymentMethod: "পেমেন্ট মেথড",
        requestId: "রিকোয়েস্ট আইডি",
        status: "স্ট্যাটাস",
        adminNote: "অ্যাডমিন নোট",
        agentMainBalance: "এজেন্ট মূল ব্যালেন্স",
        agentCommissionBalance: "এজেন্ট কমিশন ব্যালেন্স",
        agentPhone: "এজেন্ট ফোন",
        agentCode: "এজেন্ট কোড",
        totalBonus: "মোট বোনাস",
        totalWinners: "বিজয়ী সংখ্যা",
        totalSkipped: "স্কিপ সংখ্যা",
        monthKey: "মাস",
        weekKey: "সপ্তাহ",
        topRankerMaxBonus: "সর্বোচ্চ বোনাস লিমিট",
        totalMonthlyLoss: "মোট মাসিক লস",
        defaultDepositCommission: "ডিফল্ট ডিপোজিট কমিশন (%)",
        defaultWithdrawCommission: "ডিফল্ট উইথড্র কমিশন (%)",
        paymentAddress: "পেমেন্ট অ্যাড্রেস",
        agentPaymentAccounts: "পেমেন্ট অ্যাকাউন্টস",
        agentCryptoAddress: "ক্রিপ্টো অ্যাড্রেস",
        agentIsActive: "এজেন্ট স্ট্যাটাস (Active)",
        agentIsBlocked: "এজেন্ট স্ট্যাটাস (Blocked)",
        role: "রোল",
        // 👇 নতুন ফিল্ডের বাংলা লেবেল
        targetPhone: "ইউজারের নাম্বার",
        agentBalanceBefore: "এজেন্ট আগের ব্যালেন্স",
        userBalanceBefore: "ইউজারের আগের ব্যালেন্স",
        agentBalanceAfter: "এজেন্ট বর্তমান ব্যালেন্স",
        userBalanceAfter: "ইউজারের বর্তমান ব্যালেন্স",
        depositAmount: "ডিপোজিট পরিমাণ",
      };

      return (
        <div className="space-y-1">
          {entries.map(([key, value]) => {
            if (Array.isArray(value)) {
              return (
                <div key={key} className="border-b border-white/5 pb-1 mb-1">
                  <span className="text-slate-400 capitalize block mb-1">
                    {labelMap[key] || key}:
                  </span>
                  {renderDataValue(value)}
                </div>
              );
            }

            let labelName = labelMap[key] || key;
            let displayVal = String(value);
            if (value === true) displayVal = "হ্যাঁ (Blocked/True)";
            if (value === false) displayVal = "না (Active/False)";

            // টাকার ফরম্যাট ঠিক করা হলো
            if (
              key === "amountBDT" ||
              key === "agentMainBalance" ||
              key === "agentCommissionBalance" ||
              key === "totalBonus" ||
              key === "topRankerMaxBonus" ||
              key === "totalMonthlyLoss" ||
              key === "userBalanceBefore" ||
              key === "userBalanceAfter" ||
              key === "agentBalanceBefore" ||
              key === "agentBalanceAfter" ||
              key === "depositAmount"
            ) {
              // ডাটাতে আগে থেকেই ৳ থাকলে সেটা রিমুভ করে নতুন করে ৳ বসানো হচ্ছে
              const numVal = String(value).replace("৳", "");
              displayVal = `৳${Number(numVal || 0).toLocaleString("bn-BD")}`;
            }
            if (key === "amountUSD") {
              displayVal = `$${Number(value || 0).toLocaleString("en-US")}`;
            }
            if (key === "dollarRate") {
              displayVal = `৳${Number(value || 0)}`;
            }

            return (
              <div
                key={key}
                className="flex justify-between items-center text-[11px] border-b border-white/5 pb-0.5"
              >
                <span className="text-slate-400 capitalize">{labelName}:</span>
                <span className="font-semibold text-white">{displayVal}</span>
              </div>
            );
          })}
        </div>
      );
    }

    return <span>{String(val)}</span>;
  };

  return (
    <div className="p-2 sm:p-5 text-white max-w-5xl mx-auto font-sans">
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-emerald-400">
          📜 অডিট লগ ও অ্যাক্টিভিটি ট্র্যাকার
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400">
          কে, কখন এবং কী পরিবর্তন করেছেন তার হিস্ট্রি
        </p>
      </div>

      {/* Summary কার্ড */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3">
          <p className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-wide">
            মোট অ্যাপ্রুভ
          </p>
          <p className="text-lg md:text-xl font-black text-emerald-400 font-mono mt-1">
            {summaryLoading
              ? "..."
              : `৳${Number(summary.totalApprovedBDT || 0).toLocaleString("bn-BD")}`}
          </p>
        </div>

        <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3">
          <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-wide">
            আজকের অ্যাপ্রুভ
          </p>
          <p className="text-lg md:text-xl font-black text-blue-400 font-mono mt-1">
            {summaryLoading
              ? "..."
              : `৳${Number(summary.todayApprovedBDT || 0).toLocaleString("bn-BD")}`}
          </p>
        </div>

        <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3">
          <p className="text-[10px] text-rose-400/80 font-semibold uppercase tracking-wide">
            মোট রিজেক্ট
          </p>
          <p className="text-lg md:text-xl font-black text-rose-400 font-mono mt-1">
            {summaryLoading
              ? "..."
              : `৳${Number(summary.totalRejectedBDT || 0).toLocaleString("bn-BD")}`}
          </p>
        </div>

        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3">
          <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wide">
            এই অ্যাডমিনের
          </p>
          <p className="text-lg md:text-xl font-black text-amber-400 font-mono mt-1">
            {summaryLoading
              ? "..."
              : `৳${Number(summary.adminApprovedBDT || 0).toLocaleString("bn-BD")}`}
          </p>
        </div>
      </div>

      {/* ক্যাটাগরি ফিল্টার ট্যাব */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {tabList.map((tab) => {
          const count =
            tab.key === "agent_deposits"
              ? agentDepositLogs.length
              : groupedLogs[tab.key]?.length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                activeTab === tab.key
                  ? "bg-emerald-600 text-white shadow-emerald-900/30"
                  : "bg-[#0b132b] text-slate-400 border border-slate-800/80 hover:bg-slate-800"
              }`}
            >
              {tab.label} {tab.key !== "all" && count ? `(${count})` : ""}
            </button>
          );
        })}
      </div>

      {message && (
        <div className="p-2.5 mb-4 bg-slate-800 border border-slate-700 rounded-lg text-yellow-300 text-xs text-center">
          {message}
        </div>
      )}

      <div className="max-h-[620px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/40">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#0b132b] border border-slate-800 rounded-xl">
            অডিট লগ লোড হচ্ছে...
          </div>
        ) : currentLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-[#0b132b] border border-slate-800 rounded-xl">
            কোনো লগের তথ্য পাওয়া যায়নি।
          </div>
        ) : (
          currentLogs.map((log) => (
            <div
              key={log._id}
              className="bg-[#0b132b] border border-slate-800/80 rounded-xl p-3 shadow-md hover:border-slate-700/80 transition space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 font-bold text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    অ্যাডমিন:{" "}
                    <strong className="text-emerald-400">
                      {log.adminPhone || log.adminId || "অ্যাডমিন"}
                    </strong>
                  </span>
                  {log.targetUser && (
                    <span className="text-slate-400 text-[11px]">
                      | টার্গেট:{" "}
                      <strong className="text-slate-200">
                        {log.targetUser}
                      </strong>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt || log.timestamp).toLocaleString(
                    "bn-BD",
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
                    ❌ আগে ছিল (Old Value):
                  </p>
                  <div className="text-red-300 text-[11px] leading-tight">
                    {renderDataValue(log.oldData || log.oldValue)}
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                    ✅ বর্তমান মান (New Value):
                  </p>
                  <div className="text-emerald-300 text-[11px] leading-tight">
                    {renderDataValue(log.newData || log.newValue)}
                  </div>
                </div>
              </div>

              {log.details && (
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/40 flex items-start gap-1.5">
                  <span className="text-slate-500 font-medium whitespace-nowrap">
                    বিস্তারিত:
                  </span>
                  <span className="break-words">{log.details}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
