// "use client";
// import { useState, useEffect } from "react";

// export default function AdminNewGamePanel() {
//   const [settings, setSettings] = useState({
//     targetProfitPercent: 0,
//     forceMultiplier: "",
//     isActive: true,
//     singleNumberMultiplier: 36, // 🆕 ডিফল্ট ৩৬ (০ এবং ১-৩৬ এর জন্য)
//     oddEvenMultiplier: 2,
//     dozenMultiplier: 3,
//     redBlackMultiplier: 2, // 🆕 Red/Black এর জন্য
//   });

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState(null);
//   const [liveStats, setLiveStats] = useState(null);

//   // ১. সেটিংস লোড
//   useEffect(() => {
//     const fetchSettings = async () => {
//       try {
//         const res = await fetch("/api/game/newgamesettings", {
//           credentials: "include",
//         });
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//         const data = await res.json();
//         if (data.success && data.settings) {
//           setSettings({
//             targetProfitPercent: data.settings.targetProfitPercent ?? 0,
//             forceMultiplier: data.settings.forceMultiplier || "",
//             isActive: data.settings.isActive ?? true,
//             singleNumberMultiplier: data.settings.singleNumberMultiplier || 36,
//             oddEvenMultiplier: data.settings.oddEvenMultiplier || 2,
//             dozenMultiplier: data.settings.dozenMultiplier || 3,
//             redBlackMultiplier: data.settings.redBlackMultiplier || 2, // 🆕
//           });
//         }
//       } catch (err) {
//         console.error("Fetch Settings Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSettings();
//   }, []);

//   // ২. লাইভ স্ট্যাটস লোড
//   useEffect(() => {
//     const fetchLiveStats = async () => {
//       try {
//         const res = await fetch("/api/game/newgame-live-stats", {
//           credentials: "include",
//         });
//         const data = await res.json();
//         if (data.success) setLiveStats(data.data);
//       } catch (err) {
//         console.error("Live stats fetch error:", err);
//       }
//     };
//     fetchLiveStats();
//     const interval = setInterval(fetchLiveStats, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   // ৩. সেটিংস সেভ
//   const handleSaveSettings = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setMessage(null);

//     try {
//       const res = await fetch("/api/game/newgamesettings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           targetProfitPercent: settings.targetProfitPercent,
//           forceMultiplier: settings.forceMultiplier
//             ? Number(settings.forceMultiplier)
//             : null,
//           isActive: settings.isActive,
//           singleNumberMultiplier: Number(settings.singleNumberMultiplier),
//           oddEvenMultiplier: Number(settings.oddEvenMultiplier),
//           dozenMultiplier: Number(settings.dozenMultiplier),
//           redBlackMultiplier: Number(settings.redBlackMultiplier), // 🆕
//         }),
//       });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//       const data = await res.json();

//       if (data.success) {
//         setMessage({ type: "success", text: "✅ সেটিংস সফলভাবে সেভ হয়েছে!" });
//         setSettings({
//           targetProfitPercent: data.settings.targetProfitPercent ?? 0,
//           forceMultiplier: data.settings.forceMultiplier || "",
//           isActive: data.settings.isActive ?? true,
//           singleNumberMultiplier: data.settings.singleNumberMultiplier || 36,
//           oddEvenMultiplier: data.settings.oddEvenMultiplier || 2,
//           dozenMultiplier: data.settings.dozenMultiplier || 3,
//           redBlackMultiplier: data.settings.redBlackMultiplier || 2, // 🆕
//         });
//       } else {
//         setMessage({ type: "error", text: data.message || "সেভ করা যায়নি!" });
//       }
//     } catch (err) {
//       console.error("Save Error:", err);
//       setMessage({ type: "error", text: "সার্ভার এরর!" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading)
//     return <div className="text-white p-10 text-center">লোড হচ্ছে...</div>;

//   return (
//     <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white flex flex-col items-center">
//       <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
//         {/* 🛠️ সেটিংস প্যানেল */}
//         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
//           <div className="border-b border-slate-800 pb-4 mb-6 text-center">
//             <h1 className="text-xl font-bold text-amber-400">
//               রুলেট গেম কন্ট্রোল
//             </h1>
//             <p className="text-xs text-slate-400 mt-1">
//               এখান থেকে গুণক ও সেটিংস কন্ট্রোল করুন
//             </p>
//           </div>

//           <form onSubmit={handleSaveSettings} className="space-y-4">
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs text-slate-300 mb-1">
//                   Single Number (x)
//                 </label>
//                 <input
//                   type="number"
//                   step="1"
//                   value={settings.singleNumberMultiplier}
//                   onChange={(e) =>
//                     setSettings({
//                       ...settings,
//                       singleNumberMultiplier: Number(e.target.value),
//                     })
//                   }
//                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs text-slate-300 mb-1">
//                   Odd/Even (x)
//                 </label>
//                 <input
//                   type="number"
//                   step="1"
//                   value={settings.oddEvenMultiplier}
//                   onChange={(e) =>
//                     setSettings({
//                       ...settings,
//                       oddEvenMultiplier: Number(e.target.value),
//                     })
//                   }
//                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs text-slate-300 mb-1">
//                   1-12,13-24,25-36 (x)
//                 </label>
//                 <input
//                   type="number"
//                   step="1"
//                   value={settings.dozenMultiplier}
//                   onChange={(e) =>
//                     setSettings({
//                       ...settings,
//                       dozenMultiplier: Number(e.target.value),
//                     })
//                   }
//                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs text-slate-300 mb-1">
//                   Red/Black (x) {/* 🆕 */}
//                 </label>
//                 <input
//                   type="number"
//                   step="1"
//                   value={settings.redBlackMultiplier}
//                   onChange={(e) =>
//                     setSettings({
//                       ...settings,
//                       redBlackMultiplier: Number(e.target.value),
//                     })
//                   }
//                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs text-slate-300 mb-1">
//                   টার্গেট প্রফিট (%)
//                 </label>
//                 <input
//                   type="number"
//                   step="1"
//                   min="0"
//                   max="99"
//                   value={settings.targetProfitPercent}
//                   onChange={(e) =>
//                     setSettings({
//                       ...settings,
//                       targetProfitPercent: Number(e.target.value),
//                     })
//                   }
//                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs text-slate-300 mb-1">
//                   ফোর্স রেজাল্ট (০-৩৬)
//                 </label>
//                 <input
//                   type="number"
//                   step="1"
//                   min="0"
//                   max="36"
//                   placeholder="খালি রাখলে অটো"
//                   value={settings.forceMultiplier}
//                   onChange={(e) =>
//                     setSettings({
//                       ...settings,
//                       forceMultiplier: e.target.value,
//                     })
//                   }
//                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-2 pt-2">
//               <input
//                 type="checkbox"
//                 id="isActive"
//                 checked={settings.isActive}
//                 onChange={(e) =>
//                   setSettings({ ...settings, isActive: e.target.checked })
//                 }
//                 className="w-4 h-4 accent-amber-500"
//               />
//               <label htmlFor="isActive" className="text-sm text-slate-300">
//                 গেম চালু আছে (Active)
//               </label>
//             </div>

//             {message && (
//               <div
//                 className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}
//               >
//                 {message.text}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={saving}
//               className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition"
//             >
//               {saving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
//             </button>
//           </form>
//         </div>

//         {/* 🆕 লাইভ স্ট্যাটস */}
//         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
//           <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
//             <h2 className="text-lg font-bold text-emerald-400">
//               লাইভ বেট স্ট্যাটস
//             </h2>
//             {liveStats && (
//               <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
//                 {liveStats.periodNumber}
//               </span>
//             )}
//           </div>

//           {liveStats ? (
//             <>
//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
//                   <p className="text-xs text-slate-400">মোট বাজি</p>
//                   <p className="text-xl font-bold text-white mt-1">
//                     ৳{liveStats.totalBets}
//                   </p>
//                 </div>
//                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
//                   <p className="text-xs text-slate-400">মোট খেলোয়াড়</p>
//                   <p className="text-xl font-bold text-blue-400 mt-1">
//                     {liveStats.totalUsers} জন
//                   </p>
//                 </div>
//               </div>

//               {liveStats.lastResult && (
//                 <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 text-center">
//                   <p className="text-xs text-slate-400 mb-1">
//                     সর্বশেষ রাউন্ডের রেজাল্ট
//                   </p>
//                   <p className="text-sm font-mono text-slate-500">
//                     {liveStats.lastResult.periodNumber}
//                   </p>
//                   <p className="text-2xl font-bold text-blue-400 mt-1">
//                     নাম্বার {liveStats.lastResult.winningNumber}
//                   </p>
//                 </div>
//               )}

//               <h3 className="text-xs font-bold text-slate-300 mb-2">
//                 বাহিরের বাজি (Odd/Even/দাগ/Red/Black):
//               </h3>
//               <div className="grid grid-cols-3 gap-2 mb-4">
//                 {["odd", "even", "1-12", "13-24", "25-36", "red", "black"].map(
//                   (type) => (
//                     <div
//                       key={type}
//                       className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center"
//                     >
//                       <p className="text-[10px] text-slate-400 uppercase">
//                         {type}
//                       </p>
//                       <p className="font-bold text-amber-400 text-xs">
//                         ৳{liveStats.betsByType?.[type] || 0}
//                       </p>
//                     </div>
//                   ),
//                 )}
//               </div>

//               <h3 className="text-xs font-bold text-slate-300 mb-2">
//                 কোন নাম্বারে কত টাকা (০-৩৬):
//               </h3>
//               <div className="grid grid-cols-6 gap-1">
//                 {Array.from({ length: 37 }, (_, i) => i).map((num) => (
//                   <div
//                     key={num}
//                     className="bg-slate-950 border border-slate-800 p-1.5 rounded text-center"
//                   >
//                     <p className="text-[9px] text-slate-500 font-bold">{num}</p>
//                     <p className="text-[10px] text-amber-400">
//                       ৳{liveStats.betsByNumber?.[num] || 0}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div className="text-center text-slate-500 py-10">
//               ডেটা পাওয়া যাচ্ছে না...
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// ///////////////////////////////////////
"use client";
import { useState, useEffect } from "react";

export default function AdminNewGamePanel() {
  const [settings, setSettings] = useState({
    targetProfitPercent: 0,
    forceMultiplier: "",
    isActive: true,
    singleNumberMultiplier: 36,
    oddEvenMultiplier: 2,
    dozenMultiplier: 3,
    redBlackMultiplier: 2,
    lowHighMultiplier: 2, // 🆕 নতুন
    columnMultiplier: 2,  // 🆕 নতুন
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [liveStats, setLiveStats] = useState(null);

  // ১. সেটিংস লোড
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/game/newgamesettings", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings({
            targetProfitPercent: data.settings.targetProfitPercent ?? 0,
            forceMultiplier: data.settings.forceMultiplier || "",
            isActive: data.settings.isActive ?? true,
            singleNumberMultiplier: data.settings.singleNumberMultiplier || 36,
            oddEvenMultiplier: data.settings.oddEvenMultiplier || 2,
            dozenMultiplier: data.settings.dozenMultiplier || 3,
            redBlackMultiplier: data.settings.redBlackMultiplier || 2,
            lowHighMultiplier: data.settings.lowHighMultiplier || 2, // 🆕
            columnMultiplier: data.settings.columnMultiplier || 2,    // 🆕
          });
        }
      } catch (err) {
        console.error("Fetch Settings Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ২. লাইভ স্ট্যাটস লোড
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch("/api/game/newgame-live-stats", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setLiveStats(data.data);
      } catch (err) {
        console.error("Live stats fetch error:", err);
      }
    };
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // ৩. সেটিংস সেভ
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/game/newgamesettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetProfitPercent: settings.targetProfitPercent,
          forceMultiplier: settings.forceMultiplier
            ? Number(settings.forceMultiplier)
            : null,
          isActive: settings.isActive,
          singleNumberMultiplier: Number(settings.singleNumberMultiplier),
          oddEvenMultiplier: Number(settings.oddEvenMultiplier),
          dozenMultiplier: Number(settings.dozenMultiplier),
          redBlackMultiplier: Number(settings.redBlackMultiplier),
          lowHighMultiplier: Number(settings.lowHighMultiplier), // 🆕
          columnMultiplier: Number(settings.columnMultiplier),   // 🆕
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "✅ সেটিংস সফলভাবে সেভ হয়েছে!" });
        setSettings({
          targetProfitPercent: data.settings.targetProfitPercent ?? 0,
          forceMultiplier: data.settings.forceMultiplier || "",
          isActive: data.settings.isActive ?? true,
          singleNumberMultiplier: data.settings.singleNumberMultiplier || 36,
          oddEvenMultiplier: data.settings.oddEvenMultiplier || 2,
          dozenMultiplier: data.settings.dozenMultiplier || 3,
          redBlackMultiplier: data.settings.redBlackMultiplier || 2,
          lowHighMultiplier: data.settings.lowHighMultiplier || 2, // 🆕
          columnMultiplier: data.settings.columnMultiplier || 2,    // 🆕
        });
      } else {
        setMessage({ type: "error", text: data.message || "সেভ করা যায়নি!" });
      }
    } catch (err) {
      console.error("Save Error:", err);
      setMessage({ type: "error", text: "সার্ভার এরর!" });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-white p-10 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white flex flex-col items-center">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* 🛠️ সেটিংস প্যানেল */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <div className="border-b border-slate-800 pb-4 mb-6 text-center">
            <h1 className="text-xl font-bold text-amber-400">
              রুলেট গেম কন্ট্রোল
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              এখান থেকে গুণক ও সেটিংস কন্ট্রোল করুন
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Single Number (x)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.singleNumberMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      singleNumberMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Odd/Even (x)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.oddEvenMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      oddEvenMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  1-12,13-24,25-36 (x)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.dozenMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dozenMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Red/Black (x)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.redBlackMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      redBlackMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
              {/* 🆕 নতুন ইনপুট ফিল্ড */}
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  1-18, 19-36 (x)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.lowHighMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      lowHighMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  2:1 Column (x)
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.columnMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      columnMultiplier: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  টার্গেট প্রফিট (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="99"
                  value={settings.targetProfitPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      targetProfitPercent: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  ফোর্স রেজাল্ট (০-৩৬)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="36"
                  placeholder="খালি রাখলে অটো"
                  value={settings.forceMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      forceMultiplier: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={settings.isActive}
                onChange={(e) =>
                  setSettings({ ...settings, isActive: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">
                গেম চালু আছে (Active)
              </label>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition"
            >
              {saving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
            </button>
          </form>
        </div>

        {/* 🆕 লাইভ স্ট্যাটস */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-lg font-bold text-emerald-400">
              লাইভ বেট স্ট্যাটস
            </h2>
            {liveStats && (
              <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
                {liveStats.periodNumber}
              </span>
            )}
          </div>

          {liveStats ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">মোট বাজি</p>
                  <p className="text-xl font-bold text-white mt-1">
                    ৳{liveStats.totalBets}
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">মোট খেলোয়াড়</p>
                  <p className="text-xl font-bold text-blue-400 mt-1">
                    {liveStats.totalUsers} জন
                  </p>
                </div>
              </div>

              {liveStats.lastResult && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">
                    সর্বশেষ রাউন্ডের রেজাল্ট
                  </p>
                  <p className="text-sm font-mono text-slate-500">
                    {liveStats.lastResult.periodNumber}
                  </p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    নাম্বার {liveStats.lastResult.winningNumber}
                  </p>
                </div>
              )}

              <h3 className="text-xs font-bold text-slate-300 mb-2">
                বাহিরের বাজি (Odd/Even/দাগ/Red/Black):
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["odd", "even", "1-12", "13-24", "25-36", "red", "black"].map(
                  (type) => (
                    <div
                      key={type}
                      className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center"
                    >
                      <p className="text-[10px] text-slate-400 uppercase">
                        {type}
                      </p>
                      <p className="font-bold text-amber-400 text-xs">
                        ৳{liveStats.betsByType?.[type] || 0}
                      </p>
                    </div>
                  ),
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-300 mb-2">
                কোন নাম্বারে কত টাকা (০-৩৬):
              </h3>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 37 }, (_, i) => i).map((num) => (
                  <div
                    key={num}
                    className="bg-slate-950 border border-slate-800 p-1.5 rounded text-center"
                  >
                    <p className="text-[9px] text-slate-500 font-bold">{num}</p>
                    <p className="text-[10px] text-amber-400">
                      ৳{liveStats.betsByNumber?.[num] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-10">
              ডেটা পাওয়া যাচ্ছে না...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}