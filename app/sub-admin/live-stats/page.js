// "use client";
// import { useState, useEffect } from "react";

// export default function SubAdminLiveStatsPage() {
//   const [liveStats, setLiveStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // লাইভ স্ট্যাটস লোড
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
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLiveStats();
//     const interval = setInterval(fetchLiveStats, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading)
//     return <div className="text-white p-10 text-center">লোড হচ্ছে...</div>;

//   return (
//     <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white flex flex-col items-center">
//       {/* লাইভ স্ট্যাটস প্যানেল */}
//       <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-10">
//         <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
//           <h2 className="text-lg font-bold text-emerald-400">
//             লাইভ বেট স্ট্যাটস
//           </h2>
//           {liveStats && (
//             <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
//               {liveStats.periodNumber}
//             </span>
//           )}
//         </div>

//         {liveStats ? (
//           <>
//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
//                 <p className="text-xs text-slate-400">মোট বাজি</p>
//                 <p className="text-xl font-bold text-white mt-1">
//                   ৳{liveStats.totalBets}
//                 </p>
//               </div>
//               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
//                 <p className="text-xs text-slate-400">মোট খেলোয়াড়</p>
//                 <p className="text-xl font-bold text-blue-400 mt-1">
//                   {liveStats.totalUsers} জন
//                 </p>
//               </div>
//             </div>

//             {liveStats.lastResult && (
//               <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 text-center">
//                 <p className="text-xs text-slate-400 mb-1">
//                   সর্বশেষ রাউন্ডের রেজাল্ট
//                 </p>
//                 <p className="text-sm font-mono text-slate-500">
//                   {liveStats.lastResult.periodNumber}
//                 </p>
//                 <p className="text-2xl font-bold text-blue-400 mt-1">
//                   নাম্বার {liveStats.lastResult.winningNumber}
//                 </p>
//               </div>
//             )}

//             <h3 className="text-xs font-bold text-slate-300 mb-2">
//               বাহিরের বাজি (Odd/Even/দাগ):
//             </h3>
//             <div className="grid grid-cols-3 gap-2 mb-4">
//               {["odd", "even", "1-12", "13-24", "25-36"].map((type) => (
//                 <div
//                   key={type}
//                   className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center"
//                 >
//                   <p className="text-[10px] text-slate-400 uppercase">{type}</p>
//                   <p className="font-bold text-amber-400 text-xs">
//                     ৳{liveStats.betsByType?.[type] || 0}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <h3 className="text-xs font-bold text-slate-300 mb-2">
//               কোন নাম্বারে কত টাকা (১-৩৬):
//             </h3>
//             <div className="grid grid-cols-6 gap-1">
//               {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
//                 <div
//                   key={num}
//                   className="bg-slate-950 border border-slate-800 p-1.5 rounded text-center"
//                 >
//                   <p className="text-[9px] text-slate-500 font-bold">{num}</p>
//                   <p className="text-[10px] text-amber-400">
//                     ৳{liveStats.betsByNumber?.[num] || 0}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </>
//         ) : (
//           <div className="text-center text-slate-500 py-10">
//             ডেটা পাওয়া যাচ্ছে না...
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// ////////////////////////////////////
"use client";
import { useState, useEffect } from "react";

export default function SubAdminLiveStatsPage() {
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // লাইভ স্ট্যাটস লোড
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
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <div className="text-white p-10 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white flex flex-col items-center">
      {/* লাইভ স্ট্যাটস প্যানেল */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-10">
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
  );
}
