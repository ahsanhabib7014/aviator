// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function UserDepositPage() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [userPhone, setUserPhone] = useState("");
//   const [amount, setAmount] = useState("");
//   const [message, setMessage] = useState(null);

//   const router = useRouter();

//   // এজেন্টের বর্তমান ব্যালেন্স লোড
//   useEffect(() => {
//     const fetchMe = async () => {
//       try {
//         const res = await fetch("/api/agent/me");
//         const json = await res.json();
//         if (json.success) setData(json);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMe();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitting) return;

//     const taka = Number(amount);
//     const balance = Number(data?.agent?.agentMainBalance || 0);

//     if (!userPhone.trim()) {
//       setMessage({ type: "error", text: "ইউজারের নাম্বার দিন।" });
//       return;
//     }
//     if (!taka || taka <= 0) {
//       setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন।" });
//       return;
//     }
//     if (taka > balance) {
//       setMessage({
//         type: "error",
//         text: `আপনার ব্যালেন্স যথেষ্ট নয়। আছে: ৳${balance.toFixed(2)}`,
//       });
//       return;
//     }

//     setSubmitting(true);
//     setMessage(null);

//     try {
//       const res = await fetch("/api/agent/deposit-to-user", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           userPhone: userPhone.trim(),
//           amount: taka,
//         }),
//       });
//       const json = await res.json();

//       if (json.success) {
//         setMessage({
//           type: "success",
//           text: `সফল! ৳${taka} ডিপোজিট হয়েছে। আপনার নতুন ব্যালেন্স: ৳${Number(
//             json.newBalance,
//           ).toFixed(2)}`,
//         });
//         setUserPhone("");
//         setAmount("");
//         // ব্যালেন্স রিফ্রেশ
//         const meRes = await fetch("/api/agent/me");
//         const meJson = await meRes.json();
//         if (meJson.success) setData(meJson);
//         router.refresh();
//       } else {
//         setMessage({
//           type: "error",
//           text: json.message || "ডিপোজিট ব্যর্থ হয়েছে।",
//         });
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage({ type: "error", text: "সার্ভার এরর!" });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-slate-400 bg-[#07090e]">
//         <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (!data?.agent) {
//     return (
//       <div className="p-6 text-slate-400 bg-[#07090e] min-h-screen">
//         তথ্য পাওয়া যায়নি।
//       </div>
//     );
//   }

//   const { agent } = data;
//   const balance = Number(agent.agentMainBalance || 0);

//   return (
//     <div className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen text-slate-100">
//       {/* হেডার */}
//       <div className="flex items-center gap-3 mb-6">
//         <Link
//           href="/agent"
//           className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800"
//         >
//           <i className="fa-solid fa-arrow-left"></i>
//         </Link>
//         <h1 className="text-xl md:text-2xl font-bold text-emerald-400">
//           ইউজারকে ডিপোজিট
//         </h1>
//       </div>

//       {/* বর্তমান ব্যালেন্স */}
//       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
//         <p className="text-xs text-slate-500">আপনার মূল ব্যালেন্স</p>
//         <p className="text-3xl font-black text-blue-400 font-mono mt-1">
//           ৳{balance.toFixed(2)}
//         </p>
//       </div>

//       {/* ফর্ম */}
//       <form
//         onSubmit={handleSubmit}
//         className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5"
//       >
//         <div>
//           <label className="block text-sm font-semibold text-slate-300 mb-2">
//             ইউজারের নাম্বার
//           </label>
//           <input
//             type="tel"
//             maxLength={11}
//             value={userPhone}
//             onChange={(e) => setUserPhone(e.target.value)}
//             placeholder="যেমন: 01XXXXXXXXX"
//             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-semibold text-slate-300 mb-2">
//             পরিমাণ (৳)
//           </label>
//           <input
//             type="number"
//             min="1"
//             max={balance}
//             step="0.01"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             placeholder="যেমন: 500"
//             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
//             required
//           />
//           <p className="text-[11px] text-slate-500 mt-1">
//             সর্বোচ্চ: ৳{balance.toFixed(2)}
//           </p>
//         </div>

//         {message && (
//           <div
//             className={`p-3 rounded-xl text-sm font-semibold ${
//               message.type === "success"
//                 ? "bg-emerald-950/50 border border-emerald-500/40 text-emerald-400"
//                 : "bg-rose-950/50 border border-rose-500/40 text-rose-400"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={submitting}
//           className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           {submitting ? (
//             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//           ) : (
//             <>
//               <i className="fa-solid fa-paper-plane"></i> ডিপোজিট নিশ্চিত করুন
//             </>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// }
// //////////////////////////////////////////
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserDepositPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [userPhone, setUserPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);

  // 🆕 ডিপোজিট হিস্ট্রি স্টেট
  const [depositHistory, setDepositHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // 🆕 মোডাল ওপেন/ক্লোজ স্টেট
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const router = useRouter();

  // 🆕 হিস্ট্রি ফেচ করার ফাংশন
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/agent/deposit-to-user");
      const json = await res.json();
      if (json.success) {
        setDepositHistory(json.deposits || []);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // এজেন্টের বর্তমান ব্যালেন্স লোড
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/agent/me");
        const json = await res.json();
        if (json.success) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const taka = Number(amount);
    const balance = Number(data?.agent?.agentMainBalance || 0);

    if (!userPhone.trim()) {
      setMessage({ type: "error", text: "ইউজারের নাম্বার দিন।" });
      return;
    }
    if (!taka || taka <= 0) {
      setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন।" });
      return;
    }
    if (taka > balance) {
      setMessage({
        type: "error",
        text: `আপনার ব্যালেন্স যথেষ্ট নয়। আছে: ৳${balance.toFixed(2)}`,
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/agent/deposit-to-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userPhone: userPhone.trim(),
          amount: taka,
        }),
      });
      const json = await res.json();

      if (json.success) {
        let successMsg = `সফল! ৳${taka} ডিপোজিট হয়েছে।`;

        if (json.commissionEarned > 0) {
          successMsg += ` আপনি কমিশন পেয়েছেন ৳${json.commissionEarned.toFixed(2)}।`;
        }

        successMsg += ` আপনার নতুন ব্যালেন্স: ৳${Number(json.newBalance).toFixed(2)}`;

        setMessage({
          type: "success",
          text: successMsg,
        });

        setUserPhone("");
        setAmount("");

        const meRes = await fetch("/api/agent/me");
        const meJson = await meRes.json();
        if (meJson.success) setData(meJson);

        fetchHistory();
        router.refresh();
      } else {
        setMessage({
          type: "error",
          text: json.message || "ডিপোজিট ব্যর্থ হয়েছে।",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "সার্ভার এরর!" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 bg-[#07090e]">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data?.agent) {
    return (
      <div className="p-6 text-slate-400 bg-[#07090e] min-h-screen">
        তথ্য পাওয়া যায়নি।
      </div>
    );
  }

  const { agent } = data;
  const balance = Number(agent.agentMainBalance || 0);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen text-slate-100 pb-20 relative">
      {/* হেডার */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/agent"
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-emerald-400">
          ইউজারকে ডিপোজিট
        </h1>
      </div>

      {/* বর্তমান ব্যালেন্স */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
        <p className="text-xs text-slate-500">আপনার মূল ব্যালেন্স</p>
        <p className="text-3xl font-black text-blue-400 font-mono mt-1">
          ৳{balance.toFixed(2)}
        </p>
      </div>

      {/* ফর্ম */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 mb-6"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            ইউজারের নাম্বার
          </label>
          <input
            type="tel"
            maxLength={11}
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            placeholder="যেমন: 01XXXXXXXXX"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            পরিমাণ (৳)
          </label>
          <input
            type="number"
            min="1"
            max={balance}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="যেমন: 500"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-emerald-500"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            সর্বোচ্চ: ৳{balance.toFixed(2)}
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl text-sm font-semibold ${
              message.type === "success"
                ? "bg-emerald-950/50 border border-emerald-500/40 text-emerald-400"
                : "bg-rose-950/50 border border-rose-500/40 text-rose-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane"></i> ডিপোজিট নিশ্চিত করুন
            </>
          )}
        </button>
      </form>

      {/* 🆕 হিস্ট্রি দেখার বাটন */}
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
      >
        <i className="fa-solid fa-clock-rotate-left"></i> ডিপোজিট হিস্ট্রি দেখুন
      </button>

      {/* 🆕 হিস্ট্রি মোডাল (ক্লিক করলে পপআপ আকারে আসবে) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* মোডাল হেডার */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-sm font-bold text-emerald-400">
                সাম্প্রতিক ডিপোজিট সমূহ
              </h2>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* মোডাল বডি (স্ক্রল হবে) */}
            <div className="p-4 overflow-y-auto flex-1">
              {historyLoading ? (
                <p className="text-center text-xs text-slate-500 py-4 animate-pulse">
                  লোড হচ্ছে...
                </p>
              ) : depositHistory.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-4">
                  কোনো ডিপোজিট হিস্ট্রি নেই।
                </p>
              ) : (
                <div className="space-y-3">
                  {depositHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-slate-950 border border-slate-800/60 p-3 rounded-xl text-xs"
                    >
                      {/* বাম দিক: নাম্বার এবং তারিখ */}
                      <div>
                        <p className="font-mono text-emerald-400 font-bold">
                          {item.userPhone}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(item.createdAt).toLocaleString("bn-BD", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>

                      {/* ডান দিক: টাকা এবং কমিশন */}
                      <div className="text-right">
                        <p className="font-bold text-white text-sm">
                          ৳{item.amount}
                        </p>
                        <p className="text-[10px] text-amber-500 font-bold mt-0.5">
                          কমিশন: ৳{item.commission || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
