// "use client";
// import React, { useState, useEffect } from "react";

// export default function AdminCrashGame() {
//   const [settings, setSettings] = useState({ targetProfitPercent: "", forceMultiplier: "" });
//   const [liveState, setLiveState] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");

//   // 🆕 ১. পেজ লোড হওয়ার সময় শুধু একবার ডেটা আনবে (কোনো লুপ নেই)
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch("/api/admin/crash-settings");
//         const data = await res.json();
//         if (data.success) {
//           setSettings({
//             targetProfitPercent: data.settings.targetProfitPercent,
//             forceMultiplier: data.settings.forceMultiplier || "",
//           });
//           setLiveState(data.liveState);
//         }
//       } catch (err) {
//         console.error("Error fetching settings:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // 🆕 ২. সেটিংস সেভ করা (শুধু বাটনে ক্লিক করলেই কাজ করবে)
//   const handleSave = async (e) => {
//     e.preventDefault();
//     setMsg("সেভ হচ্ছে...");
    
//     try {
//       const res = await fetch("/api/admin/crash-settings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           targetProfitPercent: Number(settings.targetProfitPercent),
//           forceMultiplier: settings.forceMultiplier === "" ? "" : Number(settings.forceMultiplier),
//         }),
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         setMsg("✅ সেটিংস সফলভাবে আপডেট হয়েছে!");
//         // সেভ হওয়ার পর লাইভ স্টেট আপডেট করে নেয় (ঐচ্ছিক)
//         const stateRes = await fetch("/api/admin/crash-settings");
//         const stateData = await stateRes.json();
//         if(stateData.success) setLiveState(stateData.liveState);
        
//         setTimeout(() => setMsg(""), 3000);
//       }
//     } catch (err) {
//       setMsg("❌ আপডেট ফেইল করেছে!");
//     }
//   };

//   if (loading) return <div className="p-10 text-white">লোড হচ্ছে...</div>;

//   return (
//     <div className="min-h-screen bg-[#0a0c10] text-gray-200 p-6 font-sans">
//       <div className="max-w-4xl mx-auto space-y-6">
        
//         {/* হেডার */}
//         <div className="flex justify-between items-center bg-[#12151c] p-4 rounded-xl border border-gray-800">
//           <h1 className="text-xl font-bold text-amber-500">🎮 Aviator Admin Control</h1>
//           <div className="text-sm">
//             স্ট্যাটাস: <span className="font-bold text-emerald-400 uppercase">{liveState.status || "UNKNOWN"}</span>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* বাম পাশ: কন্ট্রোল প্যানেল */}
//           <div className="bg-[#12151c] p-6 rounded-xl border border-gray-800 shadow-lg">
//             <h2 className="text-lg font-bold mb-4 border-b border-gray-800 pb-2">⚙️ গেম সেটিংস</h2>
            
//             <form onSubmit={handleSave} className="space-y-4">
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1">অটো প্রফিট টার্গেট (%)</label>
//                 <input
//                   type="number"
//                   value={settings.targetProfitPercent}
//                   onChange={(e) => setSettings({ ...settings, targetProfitPercent: e.target.value })}
//                   className="w-full bg-[#0a0c10] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-amber-500"
//                 />
//                 <p className="text-[10px] text-gray-500 mt-1">এই পার্সেন্ট অনুযায়ী গেম নিজে থেকেই রেজাল্ট ঠিক করবে। (০ দিলে ডিফল্ট ২০% ধরবে)</p>
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-400 mb-1">ফোর্স ক্র্যাশ মাল্টিপ্লায়ার (Force)</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={settings.forceMultiplier}
//                   onChange={(e) => setSettings({ ...settings, forceMultiplier: e.target.value })}
//                   placeholder="যেমন: 2.50 (খালি রাখলে অটো কাজ করবে)"
//                   className="w-full bg-[#0a0c10] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-amber-500"
//                 />
//                 <p className="text-[10px] text-gray-500 mt-1">এখানে নাম্বার দিলে গেম ঠিক ওই নাম্বারেই ক্র্যাশ করবে।</p>
//               </div>

//               <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 rounded transition">
//                 সেভ করুন
//               </button>

//               {msg && <div className="text-center text-sm font-bold text-emerald-400 mt-2">{msg}</div>}
//             </form>
//           </div>

//           {/* ডান পাশ: লাইভ স্ট্যাটাস (আপডেট নাও হতে পারে) */}
//           <div className="bg-[#12151c] p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col">
//             <h2 className="text-lg font-bold mb-4 border-b border-gray-800 pb-2">📊 লাইভ স্ট্যাটাস</h2>
            
//             <div className="space-y-3 flex-1">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">রাউন্ড আইডি:</span>
//                 <span className="font-mono text-white">{liveState.roundId || "-"}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">বর্তমান মাল্টিপ্লায়ার:</span>
//                 <span className="font-mono text-amber-400 font-bold">{liveState.multiplier?.toFixed(2) || "1.00"}x</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-400">মোট বাজি:</span>
//                 <span className="font-mono text-emerald-400">৳ {liveState.totalBetAmount || 0}</span>
//               </div>
              
//               <div className="mt-4 pt-4 border-t border-gray-800">
//                 <p className="text-xs text-gray-400 mb-2">বাজির লিস্ট (লোডিং অবস্থায়):</p>
//                 <div className="bg-[#0a0c10] rounded p-2 max-h-48 overflow-y-auto space-y-1 text-xs">
//                   {liveState.bets && liveState.bets.length > 0 ? (
//                     liveState.bets.map((b, i) => (
//                       <div key={i} className="flex justify-between border-b border-gray-800/50 pb-1">
//                         <span className="text-gray-300">{b.user}</span>
//                         <span className="text-amber-400">৳ {b.bet}</span>
//                         <span className="text-emerald-400">{b.cashedOutAt ? `${b.cashedOutAt}x` : "—"}</span>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-gray-500 text-center py-2">কোনো বাজি নেই</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
// //////////////////////////////////////////
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 🆕 রিডাইরেক্টের জন্য

export default function AdminCrashGame() {
  const [settings, setSettings] = useState({ targetProfitPercent: "", forceMultiplier: "" });
  const [liveState, setLiveState] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const router = useRouter(); // 🆕

  // 🆕 ১. পেজ লোড হওয়ার সময় Auth চেক + ডেটা আনবে
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/crash-settings", {
          credentials: "include", // 🆕 HttpOnly কুকি পাঠাতে হবে
        });
        
        // 🆕 যদি 401 (Unauthorized) বা 403 (Forbidden) আসে, তবে লগইন বা হোম পেজে পাঠাবে
        if (res.status === 401 || res.status === 403) {
          alert("আপনি অ্যাডমিন নন! লগইন করুন।");
          router.push("/login"); // অথবা আপনার হোম পেজ: "/"
          return;
        }

        const data = await res.json();
        if (data.success) {
          setSettings({
            targetProfitPercent: data.settings.targetProfitPercent,
            forceMultiplier: data.settings.forceMultiplier || "",
          });
          setLiveState(data.liveState);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // 🆕 ২. সেটিংস সেভ করা
  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("সেভ হচ্ছে...");
    
    try {
      const res = await fetch("/api/admin/crash-settings", {
        method: "POST",
        credentials: "include", // 🆕
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProfitPercent: Number(settings.targetProfitPercent),
          forceMultiplier: settings.forceMultiplier === "" ? "" : Number(settings.forceMultiplier),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        setMsg("❌ অ্যাডমিন অ্যাক্সেস নেই!");
        router.push("/login");
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        setMsg("✅ সেটিংস সফলভাবে আপডেট হয়েছে!");
        // সেভ হওয়ার পর লাইভ স্টেট আপডেট করে নেয়
        const stateRes = await fetch("/api/admin/crash-settings", { credentials: "include" });
        const stateData = await stateRes.json();
        if(stateData.success) setLiveState(stateData.liveState);
        
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      setMsg("❌ আপডেট ফেইল করেছে!");
    }
  };

  if (loading) return <div className="p-10 text-white">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-200 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* হেডার */}
        <div className="flex justify-between items-center bg-[#12151c] p-4 rounded-xl border border-gray-800">
          <h1 className="text-xl font-bold text-amber-500">🎮 Aviator Admin Control</h1>
          <div className="text-sm">
            স্ট্যাটাস: <span className="font-bold text-emerald-400 uppercase">{liveState.status || "UNKNOWN"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* বাম পাশ: কন্ট্রোল প্যানেল */}
          <div className="bg-[#12151c] p-6 rounded-xl border border-gray-800 shadow-lg">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-800 pb-2">⚙️ গেম সেটিংস</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">অটো প্রফিট টার্গেট (%)</label>
                <input 
                  type="number" 
                  value={settings.targetProfitPercent}
                  onChange={(e) => setSettings({ ...settings, targetProfitPercent: e.target.value })}
                  className="w-full bg-[#0a0c10] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">এই পার্সেন্ট অনুযায়ী গেম নিজে থেকেই রেজাল্ট ঠিক করবে। (০ দিলে ডিফল্ট ২০% ধরবে)</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">ফোর্স ক্র্যাশ মাল্টিপ্লায়ার (Force)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={settings.forceMultiplier}
                  onChange={(e) => setSettings({ ...settings, forceMultiplier: e.target.value })}
                  placeholder="যেমন: 2.50 (খালি রাখলে অটো কাজ করবে)"
                  className="w-full bg-[#0a0c10] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">এখানে নাম্বার দিলে গেম ঠিক ওই নাম্বারেই ক্র্যাশ করবে।</p>
              </div>

              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 rounded transition">
                সেভ করুন
              </button>

              {msg && <div className="text-center text-sm font-bold text-emerald-400 mt-2">{msg}</div>}
            </form>
          </div>

          {/* ডান পাশ: লাইভ স্ট্যাটাস */}
          <div className="bg-[#12151c] p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-800 pb-2">📊 লাইভ স্ট্যাটাস</h2>
            
            <div className="space-y-3 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">রাউন্ড আইডি:</span>
                <span className="font-mono text-white">{liveState.roundId || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">বর্তমান মাল্টিপ্লায়ার:</span>
                <span className="font-mono text-amber-400 font-bold">{liveState.multiplier?.toFixed(2) || "1.00"}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">মোট বাজি:</span>
                <span className="font-mono text-emerald-400">৳ {liveState.totalBetAmount || 0}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400 mb-2">বাজির লিস্ট (লোডিং অবস্থায়):</p>
                <div className="bg-[#0a0c10] rounded p-2 max-h-48 overflow-y-auto space-y-1 text-xs">
                  {liveState.bets && liveState.bets.length > 0 ? (
                    liveState.bets.map((b, i) => (
                      <div key={i} className="flex justify-between border-b border-gray-800/50 pb-1">
                        <span className="text-gray-300">{b.user}</span>
                        <span className="text-amber-400">৳ {b.bet}</span>
                        <span className="text-emerald-400">{b.cashedOutAt ? `${b.cashedOutAt}x` : "—"}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-2">কোনো বাজি নেই</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}