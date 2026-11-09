// // // // // "use client";
// // // // // import { useState, useEffect } from "react";

// // // // // export default function CasinoRoulette() {
// // // // //   const [balance, setBalance] = useState(0);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [submitting, setSubmitting] = useState(false);
// // // // //   const [message, setMessage] = useState(null);

// // // // //   // গেম স্টেট
// // // // //   const [currentPeriod, setCurrentPeriod] = useState("PER-10001");
// // // // //   const [timeLeft, setTimeLeft] = useState(0);
// // // // //   const [winPopup, setWinPopup] = useState(null);
// // // // //   const [recentResults, setRecentResults] = useState([]);

// // // // //   // বেট স্টেট
// // // // //   const [selectedBets, setSelectedBets] = useState([]);
// // // // //   const [betAmount, setBetAmount] = useState("");

// // // // //   // হিস্ট্রি স্টেট
// // // // //   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
// // // // //   const [historyData, setHistoryData] = useState([]);
// // // // //   const [historyLoading, setHistoryLoading] = useState(false);

// // // // //   // ১. ইউজার ডেটা লোড
// // // // //   const fetchUserData = async () => {
// // // // //     try {
// // // // //       const res = await fetch("/api/user/me", { credentials: "include" });
// // // // //       if (!res.ok) return;
// // // // //       const data = await res.json();
// // // // //       if (data.success) setBalance(data.user?.balance || 0);
// // // // //     } catch (err) {
// // // // //       console.error("User fetch error:", err);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   // ২. গেম স্টেট লোড
// // // // //   const fetchGameState = async () => {
// // // // //     try {
// // // // //       const res = await fetch("/api/game/newgame-state", {
// // // // //         credentials: "include",
// // // // //       });
// // // // //       if (!res.ok) return;
// // // // //       const data = await res.json();

// // // // //       if (data.success) {
// // // // //         setCurrentPeriod(data.periodNumber);
// // // // //         const end = new Date(data.endTime).getTime();
// // // // //         const now = new Date().getTime();
// // // // //         const diff = Math.max(0, Math.floor((end - now) / 1000));
// // // // //         setTimeLeft(diff);

// // // // //         if (data.recentResults) {
// // // // //           setRecentResults(data.recentResults);
// // // // //         }

// // // // //         if (data.userResult && data.userResult.status === "win") {
// // // // //           setWinPopup(data.userResult);
// // // // //           setTimeout(() => setWinPopup(null), 5000);
// // // // //         }
// // // // //       }
// // // // //     } catch (err) {
// // // // //       console.error("State fetch error:", err);
// // // // //     }
// // // // //   };

// // // // //   // ৩. হিস্ট্রি লোড
// // // // //   const fetchHistory = async () => {
// // // // //     setIsHistoryOpen(true);
// // // // //     setHistoryLoading(true);
// // // // //     try {
// // // // //       const res = await fetch("/api/game/newgame-history", {
// // // // //         credentials: "include",
// // // // //       });
// // // // //       const data = await res.json();
// // // // //       if (data.success) setHistoryData(data.history || []);
// // // // //     } catch (err) {
// // // // //       console.error("History fetch error:", err);
// // // // //     } finally {
// // // // //       setHistoryLoading(false);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     fetchUserData();
// // // // //     fetchGameState();

// // // // //     const timer = setInterval(() => {
// // // // //       setTimeLeft((prev) => {
// // // // //         if (prev <= 1) {
// // // // //           fetchGameState();
// // // // //           fetchUserData();
// // // // //           return 0;
// // // // //         }
// // // // //         return prev - 1;
// // // // //       });
// // // // //     }, 1000);

// // // // //     return () => clearInterval(timer);
// // // // //   }, []);

// // // // //   // ৪. সিলেকশন টগল (ফ্রন্টএন্ড ভ্যালিডেশনসহ)
// // // // //   const toggleSelection = (type, selection) => {
// // // // //     // 🆕 শেষ ৫ সেকেন্ডে সিলেকশন বন্ধ
// // // // //     if (timeLeft <= 5) {
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// // // // //       });
// // // // //     }

// // // // //     if (type === "odd" && selectedBets.some((b) => b.type === "even")) {
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// // // // //       });
// // // // //     }
// // // // //     if (type === "even" && selectedBets.some((b) => b.type === "odd")) {
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// // // // //       });
// // // // //     }
// // // // //     if (type === "red" && selectedBets.some((b) => b.type === "black")) {
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// // // // //       });
// // // // //     }
// // // // //     if (type === "black" && selectedBets.some((b) => b.type === "red")) {
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// // // // //       });
// // // // //     }

// // // // //     const dozenCount = selectedBets.filter((b) =>
// // // // //       ["1-12", "13-24", "25-36"].includes(b.type),
// // // // //     ).length;
// // // // //     if (
// // // // //       ["1-12", "13-24", "25-36"].includes(type) &&
// // // // //       dozenCount >= 2 &&
// // // // //       !isSelected(type, selection)
// // // // //     ) {
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
// // // // //       });
// // // // //     }

// // // // //     setSelectedBets((prev) => {
// // // // //       const exists = prev.find(
// // // // //         (b) => b.type === type && b.selection === selection,
// // // // //       );
// // // // //       if (exists) {
// // // // //         return prev.filter(
// // // // //           (b) => !(b.type === type && b.selection === selection),
// // // // //         );
// // // // //       } else {
// // // // //         return [...prev, { type, selection }];
// // // // //       }
// // // // //     });
// // // // //   };

// // // // //   // ৫. বাজি প্লেস
// // // // //   const handleBet = async () => {
// // // // //     if (selectedBets.length === 0)
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "কমপক্ষে একটি অপশন সিলেক্ট করুন!",
// // // // //       });
// // // // //     const amount = Number(betAmount);
// // // // //     if (!amount || amount <= 0)
// // // // //       return setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন!" });

// // // // //     const totalCost = amount * selectedBets.length;
// // // // //     if (totalCost > balance)
// // // // //       return setMessage({ type: "error", text: "পর্যাপ্ত ব্যালেন্স নেই!" });
// // // // //     if (timeLeft <= 5)
// // // // //       return setMessage({
// // // // //         type: "error",
// // // // //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// // // // //       });

// // // // //     setSubmitting(true);
// // // // //     setMessage(null);

// // // // //     try {
// // // // //       const formattedBets = selectedBets.map((b) => ({
// // // // //         type: b.type,
// // // // //         selection: b.selection,
// // // // //         amount,
// // // // //       }));

// // // // //       const res = await fetch("/api/game/newgamebet", {
// // // // //         method: "POST",
// // // // //         headers: { "Content-Type": "application/json" },
// // // // //         credentials: "include",
// // // // //         body: JSON.stringify({
// // // // //           bets: formattedBets,
// // // // //           periodNumber: currentPeriod,
// // // // //         }),
// // // // //       });
// // // // //       const data = await res.json();

// // // // //       if (data.success) {
// // // // //         setMessage({ type: "success", text: data.message });
// // // // //         setBalance(data.newBalance);
// // // // //         setBetAmount("");
// // // // //         setSelectedBets([]);

// // // // //         // 🆕 ৩ সেকেন্ড পর মেসেজটি নিজে থেকে মুছে যাবে
// // // // //         setTimeout(() => {
// // // // //           setMessage(null);
// // // // //         }, 3000);
// // // // //       } else {
// // // // //         setMessage({ type: "error", text: data.message });

// // // // //         // 🆕 এরর মেসেজও ৩ সেকেন্ড পর মুছে যাবে
// // // // //         setTimeout(() => {
// // // // //           setMessage(null);
// // // // //         }, 3000);
// // // // //       }
// // // // //     } catch (err) {
// // // // //       setMessage({ type: "error", text: "সার্ভার এরর!" });
// // // // //       setTimeout(() => {
// // // // //         setMessage(null);
// // // // //       }, 3000);
// // // // //     } finally {
// // // // //       setSubmitting(false);
// // // // //     }
// // // // //   };

// // // // //   const isSelected = (type, selection) => {
// // // // //     return selectedBets.some(
// // // // //       (b) => b.type === type && b.selection === selection,
// // // // //     );
// // // // //   };

// // // // //   // রুলেট নাম্বারের রঙ (লাল/কালো) - ক্যাসিনো স্টাইল
// // // // //   const getNumberColor = (num) => {
// // // // //     const redNumbers = [
// // // // //       1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // // // //     ];
// // // // //     if (num === 0) return "#059669";
// // // // //     return redNumbers.includes(num) ? "#dc2626" : "#1e293b";
// // // // //   };

// // // // //   if (loading)
// // // // //     return (
// // // // //       <div
// // // // //         style={{
// // // // //           minHeight: "100vh",
// // // // //           backgroundColor: "#020617",
// // // // //           display: "flex",
// // // // //           alignItems: "center",
// // // // //           justifyContent: "center",
// // // // //           color: "white",
// // // // //         }}
// // // // //       >
// // // // //         <div
// // // // //           style={{
// // // // //             width: "48px",
// // // // //             height: "48px",
// // // // //             border: "4px solid #fbbf24",
// // // // //             borderTopColor: "transparent",
// // // // //             borderRadius: "50%",
// // // // //             animation: "spin 1s linear infinite",
// // // // //           }}
// // // // //         ></div>
// // // // //         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
// // // // //       </div>
// // // // //     );

// // // // //   return (
// // // // //     <div
// // // // //       style={{
// // // // //         minHeight: "100vh",
// // // // //         backgroundColor: "#020617",
// // // // //         backgroundImage:
// // // // //           "radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)",
// // // // //         padding: "16px",
// // // // //         color: "white",
// // // // //         display: "flex",
// // // // //         flexDirection: "column",
// // // // //         alignItems: "center",
// // // // //         paddingBottom: "100px",
// // // // //         fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
// // // // //       }}
// // // // //     >
// // // // //       {/* হেডার */}
// // // // //       <div
// // // // //         style={{
// // // // //           width: "100%",
// // // // //           maxWidth: "480px",
// // // // //           display: "flex",
// // // // //           justifyContent: "space-between",
// // // // //           alignItems: "center",
// // // // //           marginBottom: "16px",
// // // // //           padding: "0 8px",
// // // // //         }}
// // // // //       >
// // // // //         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
// // // // //           <div
// // // // //             style={{
// // // // //               width: "40px",
// // // // //               height: "40px",
// // // // //               borderRadius: "50%",
// // // // //               background: "linear-gradient(135deg, #fbbf24, #d97706)",
// // // // //               display: "flex",
// // // // //               alignItems: "center",
// // // // //               justifyContent: "center",
// // // // //               fontWeight: "bold",
// // // // //               color: "#000",
// // // // //               boxShadow: "0 0 15px rgba(245,158,11,0.4)",
// // // // //             }}
// // // // //           >
// // // // //             R
// // // // //           </div>
// // // // //           <div>
// // // // //             <p
// // // // //               style={{
// // // // //                 fontSize: "10px",
// // // // //                 color: "#94a3b8",
// // // // //                 margin: 0,
// // // // //                 textTransform: "uppercase",
// // // // //                 letterSpacing: "1px",
// // // // //               }}
// // // // //             >
// // // // //               পিরিয়ড
// // // // //             </p>
// // // // //             <p
// // // // //               style={{
// // // // //                 fontFamily: "monospace",
// // // // //                 color: "#fbbf24",
// // // // //                 fontWeight: "bold",
// // // // //                 fontSize: "14px",
// // // // //                 margin: 0,
// // // // //               }}
// // // // //             >
// // // // //               {currentPeriod}
// // // // //             </p>
// // // // //           </div>
// // // // //         </div>
// // // // //         <div
// // // // //           style={{
// // // // //             backgroundColor: "rgba(15, 23, 42, 0.8)",
// // // // //             padding: "8px 16px",
// // // // //             borderRadius: "12px",
// // // // //             border: "1px solid rgba(51, 65, 85, 0.5)",
// // // // //             textAlign: "right",
// // // // //           }}
// // // // //         >
// // // // //           <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// // // // //             ব্যালেন্স
// // // // //           </p>
// // // // //           <p
// // // // //             style={{
// // // // //               fontFamily: "monospace",
// // // // //               color: "#34d399",
// // // // //               fontWeight: "bold",
// // // // //               fontSize: "18px",
// // // // //               margin: 0,
// // // // //             }}
// // // // //           >
// // // // //             ৳{balance.toFixed(2)}
// // // // //           </p>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* টাইমার এবং হিস্ট্রি */}
// // // // //       <div
// // // // //         style={{
// // // // //           width: "100%",
// // // // //           maxWidth: "480px",
// // // // //           display: "flex",
// // // // //           gap: "12px",
// // // // //           marginBottom: "16px",
// // // // //         }}
// // // // //       >
// // // // //         <div
// // // // //           style={{
// // // // //             flex: 1,
// // // // //             background: "linear-gradient(90deg, #0f172a, #1e293b)",
// // // // //             padding: "12px",
// // // // //             borderRadius: "16px",
// // // // //             display: "flex",
// // // // //             alignItems: "center",
// // // // //             justifyContent: "space-between",
// // // // //             border: "1px solid rgba(51, 65, 85, 0.5)",
// // // // //           }}
// // // // //         >
// // // // //           <div>
// // // // //             <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// // // // //               টাইমার
// // // // //             </p>
// // // // //             <p
// // // // //               style={{
// // // // //                 fontFamily: "monospace",
// // // // //                 fontWeight: "900",
// // // // //                 fontSize: "24px",
// // // // //                 margin: 0,
// // // // //                 color: timeLeft <= 5 ? "#f43f5e" : "#34d399",
// // // // //                 textShadow:
// // // // //                   timeLeft <= 5 ? "0 0 10px #f43f5e" : "0 0 10px #34d399",
// // // // //               }}
// // // // //             >
// // // // //               00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
// // // // //             </p>
// // // // //           </div>
// // // // //           <button
// // // // //             onClick={fetchHistory}
// // // // //             style={{
// // // // //               backgroundColor: "rgba(51, 65, 85, 0.5)",
// // // // //               border: "none",
// // // // //               color: "#cbd5e1",
// // // // //               width: "40px",
// // // // //               height: "40px",
// // // // //               borderRadius: "10px",
// // // // //               cursor: "pointer",
// // // // //               display: "flex",
// // // // //               alignItems: "center",
// // // // //               justifyContent: "center",
// // // // //             }}
// // // // //           >
// // // // //             ⏱️
// // // // //           </button>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* বাজি ধরার ফর্ম */}
// // // // //       <div
// // // // //         style={{
// // // // //           width: "100%",
// // // // //           maxWidth: "480px",
// // // // //           backgroundColor: "rgba(15, 23, 42, 0.8)",
// // // // //           padding: "16px",
// // // // //           borderRadius: "16px",
// // // // //           border: "1px solid rgba(51, 65, 85, 0.5)",
// // // // //           marginBottom: "16px",
// // // // //           backdropFilter: "blur(10px)",
// // // // //         }}
// // // // //       >
// // // // //         <div style={{ position: "relative" }}>
// // // // //           <span
// // // // //             style={{
// // // // //               position: "absolute",
// // // // //               left: "16px",
// // // // //               top: "50%",
// // // // //               transform: "translateY(-50%)",
// // // // //               color: "#fbbf24",
// // // // //               fontSize: "18px",
// // // // //             }}
// // // // //           >
// // // // //             ৳
// // // // //           </span>
// // // // //           <input
// // // // //             type="number"
// // // // //             value={betAmount}
// // // // //             onChange={(e) => setBetAmount(e.target.value)}
// // // // //             placeholder="পরিমাণ লিখুন"
// // // // //             disabled={timeLeft <= 5}
// // // // //             style={{
// // // // //               width: "100%",
// // // // //               backgroundColor: "#020617",
// // // // //               border: "1px solid #334155",
// // // // //               borderRadius: "12px",
// // // // //               padding: "14px 16px 14px 40px",
// // // // //               color: "white",
// // // // //               fontFamily: "monospace",
// // // // //               fontSize: "18px",
// // // // //               outline: "none",
// // // // //               boxSizing: "border-box",
// // // // //             }}
// // // // //           />
// // // // //         </div>

// // // // //         {selectedBets.length > 0 && betAmount > 0 && (
// // // // //           <div
// // // // //             style={{
// // // // //               display: "flex",
// // // // //               justifyContent: "space-between",
// // // // //               alignItems: "center",
// // // // //               marginTop: "12px",
// // // // //               padding: "0 4px",
// // // // //             }}
// // // // //           >
// // // // //             <span style={{ fontSize: "12px", color: "#94a3b8" }}>
// // // // //               সিলেকশন: {selectedBets.length} টি
// // // // //             </span>
// // // // //             <span
// // // // //               style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}
// // // // //             >
// // // // //               মোট খরচ: ৳{(Number(betAmount) * selectedBets.length).toFixed(2)}
// // // // //             </span>
// // // // //           </div>
// // // // //         )}
// // // // //       </div>

// // // // //       {/* 🎯 ক্যাসিনো স্টাইল রুলেট বোর্ড */}
// // // // //       <div style={{ width: "100%", maxWidth: "480px", marginBottom: "24px" }}>
// // // // //         <div
// // // // //           style={{
// // // // //             display: "grid",
// // // // //             gridTemplateColumns: "1fr 1fr 1fr",
// // // // //             gap: "8px",
// // // // //             marginBottom: "8px",
// // // // //           }}
// // // // //         >
// // // // //           {[
// // // // //             { label: "1-12 (x3)", type: "1-12", sel: "1-12" },
// // // // //             { label: "13-24 (x3)", type: "13-24", sel: "13-24" },
// // // // //             { label: "25-36 (x3)", type: "25-36", sel: "25-36" },
// // // // //           ].map((item, idx) => {
// // // // //             const active = isSelected(item.type, item.sel);
// // // // //             return (
// // // // //               <button
// // // // //                 key={idx}
// // // // //                 onClick={() => toggleSelection(item.type, item.sel)}
// // // // //                 style={{
// // // // //                   padding: "10px",
// // // // //                   borderRadius: "8px",
// // // // //                   fontWeight: "bold",
// // // // //                   fontSize: "13px",
// // // // //                   border: "2px solid",
// // // // //                   borderColor: active ? "#fbbf24" : "rgba(51, 65, 85, 0.8)",
// // // // //                   backgroundColor: active
// // // // //                     ? "rgba(245, 158, 11, 0.9)"
// // // // //                     : "rgba(30, 41, 59, 0.8)",
// // // // //                   color: active ? "black" : "#cbd5e1",
// // // // //                   cursor: "pointer",
// // // // //                   transition: "all 0.2s",
// // // // //                   boxShadow: active ? "0 0 15px rgba(245,158,11,0.4)" : "none",
// // // // //                 }}
// // // // //               >
// // // // //                 {item.label}
// // // // //               </button>
// // // // //             );
// // // // //           })}
// // // // //         </div>

// // // // //         <div style={{ marginBottom: "8px" }}>
// // // // //           <button
// // // // //             onClick={() => toggleSelection("number", "0")}
// // // // //             style={{
// // // // //               width: "100%",
// // // // //               padding: "12px",
// // // // //               borderRadius: "8px",
// // // // //               fontWeight: "bold",
// // // // //               fontSize: "16px",
// // // // //               border: "2px solid",
// // // // //               borderColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
// // // // //               backgroundColor: isSelected("number", "0")
// // // // //                 ? "#fbbf24"
// // // // //                 : "#059669",
// // // // //               color: isSelected("number", "0") ? "black" : "white",
// // // // //               cursor: "pointer",
// // // // //               transition: "all 0.2s",
// // // // //               boxShadow: isSelected("number", "0")
// // // // //                 ? "0 0 15px rgba(245,158,11,0.6)"
// // // // //                 : "0 0 10px rgba(5,150,105,0.4)",
// // // // //             }}
// // // // //           >
// // // // //             0 (Zero)
// // // // //           </button>
// // // // //         </div>

// // // // //         <div
// // // // //           style={{
// // // // //             display: "grid",
// // // // //             gridTemplateColumns: "repeat(6, 1fr)",
// // // // //             gap: "6px",
// // // // //           }}
// // // // //         >
// // // // //           {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
// // // // //             const active = isSelected("number", String(num));
// // // // //             const bgColor = getNumberColor(num);
// // // // //             return (
// // // // //               <button
// // // // //                 key={num}
// // // // //                 onClick={() => toggleSelection("number", String(num))}
// // // // //                 style={{
// // // // //                   height: "48px",
// // // // //                   borderRadius: "8px",
// // // // //                   fontWeight: "bold",
// // // // //                   fontSize: "16px",
// // // // //                   border: active
// // // // //                     ? "3px solid #fbbf24"
// // // // //                     : "1px solid rgba(255,255,255,0.1)",
// // // // //                   backgroundColor: active ? "#fbbf24" : bgColor,
// // // // //                   color: active ? "black" : "white",
// // // // //                   cursor: "pointer",
// // // // //                   transition: "all 0.2s",
// // // // //                   boxShadow: active
// // // // //                     ? "0 0 20px rgba(245,158,11,0.6), inset 0 0 10px rgba(0,0,0,0.2)"
// // // // //                     : "inset 0 0 10px rgba(0,0,0,0.5)",
// // // // //                   display: "flex",
// // // // //                   alignItems: "center",
// // // // //                   justifyContent: "center",
// // // // //                   textShadow: active ? "none" : "1px 1px 2px rgba(0,0,0,0.8)",
// // // // //                 }}
// // // // //               >
// // // // //                 {num}
// // // // //               </button>
// // // // //             );
// // // // //           })}
// // // // //         </div>

// // // // //         <div
// // // // //           style={{
// // // // //             display: "grid",
// // // // //             gridTemplateColumns: "1fr 1fr",
// // // // //             gap: "8px",
// // // // //             marginTop: "8px",
// // // // //           }}
// // // // //         >
// // // // //           {[
// // // // //             { label: "Odd (x2)", type: "odd", sel: "odd" },
// // // // //             { label: "Even (x2)", type: "even", sel: "even" },
// // // // //             { label: "Red (x2)", type: "red", sel: "red" },
// // // // //             { label: "Black (x2)", type: "black", sel: "black" },
// // // // //           ].map((item, idx) => {
// // // // //             const active = isSelected(item.type, item.sel);
// // // // //             let activeBg = "rgba(245, 158, 11, 0.9)";
// // // // //             let activeBorder = "#fbbf24";
// // // // //             let activeShadow = "0 0 15px rgba(245,158,11,0.4)";

// // // // //             if (item.type === "red") {
// // // // //               activeBg = "#dc2626";
// // // // //               activeBorder = "#ef4444";
// // // // //               activeShadow = "0 0 15px rgba(220,38,38,0.6)";
// // // // //             } else if (item.type === "black") {
// // // // //               activeBg = "#1e293b";
// // // // //               activeBorder = "#334155";
// // // // //               activeShadow = "0 0 15px rgba(0,0,0,0.5)";
// // // // //             }

// // // // //             return (
// // // // //               <button
// // // // //                 key={idx}
// // // // //                 onClick={() => toggleSelection(item.type, item.sel)}
// // // // //                 style={{
// // // // //                   padding: "12px",
// // // // //                   borderRadius: "8px",
// // // // //                   fontWeight: "bold",
// // // // //                   fontSize: "14px",
// // // // //                   border: "2px solid",
// // // // //                   borderColor: active ? activeBorder : "rgba(51, 65, 85, 0.8)",
// // // // //                   backgroundColor: active ? activeBg : "rgba(30, 41, 59, 0.8)",
// // // // //                   color: active
// // // // //                     ? item.type === "black"
// // // // //                       ? "white"
// // // // //                       : "black"
// // // // //                     : "#cbd5e1",
// // // // //                   cursor: "pointer",
// // // // //                   transition: "all 0.2s",
// // // // //                   boxShadow: active ? activeShadow : "none",
// // // // //                 }}
// // // // //               >
// // // // //                 {item.label}
// // // // //               </button>
// // // // //             );
// // // // //           })}
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* কনফার্ম বাটন */}
// // // // //       <div style={{ width: "100%", maxWidth: "480px" }}>
// // // // //         {message && (
// // // // //           <div
// // // // //             style={{
// // // // //               padding: "12px",
// // // // //               borderRadius: "12px",
// // // // //               fontSize: "14px",
// // // // //               fontWeight: "bold",
// // // // //               textAlign: "center",
// // // // //               marginBottom: "12px",
// // // // //               backgroundColor:
// // // // //                 message.type === "success"
// // // // //                   ? "rgba(6, 78, 59, 0.9)"
// // // // //                   : "rgba(136, 19, 55, 0.9)",
// // // // //               color: message.type === "success" ? "#34d399" : "#f87171",
// // // // //               border: "1px solid",
// // // // //               borderColor: message.type === "success" ? "#059669" : "#e11d48",
// // // // //             }}
// // // // //           >
// // // // //             {message.text}
// // // // //           </div>
// // // // //         )}
// // // // //         <button
// // // // //           onClick={handleBet}
// // // // //           disabled={submitting || timeLeft <= 5}
// // // // //           style={{
// // // // //             width: "100%",
// // // // //             background:
// // // // //               timeLeft <= 5
// // // // //                 ? "#334155"
// // // // //                 : "linear-gradient(to right, #f59e0b, #d97706)",
// // // // //             color: timeLeft <= 5 ? "#94a3b8" : "black",
// // // // //             fontWeight: "900",
// // // // //             padding: "18px",
// // // // //             borderRadius: "16px",
// // // // //             border: "none",
// // // // //             cursor: timeLeft <= 5 ? "not-allowed" : "pointer",
// // // // //             transition: "transform 0.1s",
// // // // //             boxShadow:
// // // // //               timeLeft <= 5
// // // // //                 ? "none"
// // // // //                 : "0 10px 25px -5px rgba(245, 158, 11, 0.5)",
// // // // //             fontSize: "16px",
// // // // //             letterSpacing: "1px",
// // // // //           }}
// // // // //         >
// // // // //           {timeLeft <= 5
// // // // //             ? "বাজি বন্ধ (অপেক্ষা করুন)"
// // // // //             : submitting
// // // // //               ? "প্রসেসিং..."
// // // // //               : `বাজি ধরুন (${selectedBets.length} টি)`}
// // // // //         </button>
// // // // //       </div>

// // // // //       {/* 🆕 সাম্প্রতিক রেজাল্ট কার্সেল */}
// // // // //       {recentResults.length > 0 && (
// // // // //         <div
// // // // //           style={{
// // // // //             width: "100%",
// // // // //             maxWidth: "480px",
// // // // //             display: "flex",
// // // // //             alignItems: "center",
// // // // //             gap: "8px",
// // // // //             marginTop: "16px",
// // // // //             overflowX: "auto",
// // // // //             paddingBottom: "4px",
// // // // //             scrollbarWidth: "none",
// // // // //           }}
// // // // //         >
// // // // //           <span
// // // // //             style={{
// // // // //               fontSize: "10px",
// // // // //               color: "#94a3b8",
// // // // //               whiteSpace: "nowrap",
// // // // //               fontWeight: "bold",
// // // // //             }}
// // // // //           >
// // // // //             সাম্প্রতিক:
// // // // //           </span>
// // // // //           <div style={{ display: "flex", gap: "6px" }}>
// // // // //             {recentResults.map((num, idx) => (
// // // // //               <div
// // // // //                 key={idx}
// // // // //                 style={{
// // // // //                   width: "32px",
// // // // //                   height: "32px",
// // // // //                   borderRadius: "50%",
// // // // //                   display: "flex",
// // // // //                   alignItems: "center",
// // // // //                   justifyContent: "center",
// // // // //                   fontWeight: "bold",
// // // // //                   fontSize: "12px",
// // // // //                   flexShrink: 0,
// // // // //                   backgroundColor: getNumberColor(num),
// // // // //                   color: "white",
// // // // //                   border: "2px solid rgba(255,255,255,0.1)",
// // // // //                   boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
// // // // //                   textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
// // // // //                 }}
// // // // //               >
// // // // //                 {num}
// // // // //               </div>
// // // // //             ))}
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* 🏆 উইন পপআপ */}
// // // // //       {winPopup && (
// // // // //         <div
// // // // //           style={{
// // // // //             position: "fixed",
// // // // //             top: 0,
// // // // //             left: 0,
// // // // //             right: 0,
// // // // //             bottom: 0,
// // // // //             backgroundColor: "rgba(0,0,0,0.85)",
// // // // //             backdropFilter: "blur(5px)",
// // // // //             display: "flex",
// // // // //             alignItems: "center",
// // // // //             justifyContent: "center",
// // // // //             zIndex: 50,
// // // // //             padding: "16px",
// // // // //           }}
// // // // //         >
// // // // //           <div
// // // // //             style={{
// // // // //               background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)",
// // // // //               border: "2px solid #10b981",
// // // // //               borderRadius: "24px",
// // // // //               padding: "32px 24px",
// // // // //               maxWidth: "360px",
// // // // //               width: "100%",
// // // // //               textAlign: "center",
// // // // //               position: "relative",
// // // // //               overflow: "hidden",
// // // // //               boxShadow: "0 0 50px rgba(16,185,129,0.3)",
// // // // //             }}
// // // // //           >
// // // // //             <div
// // // // //               style={{
// // // // //                 position: "absolute",
// // // // //                 top: "-50px",
// // // // //                 left: "50%",
// // // // //                 transform: "translateX(-50%)",
// // // // //                 width: "200px",
// // // // //                 height: "200px",
// // // // //                 background:
// // // // //                   "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
// // // // //                 zIndex: 0,
// // // // //               }}
// // // // //             ></div>

// // // // //             <div style={{ position: "relative", zIndex: 1 }}>
// // // // //               <div
// // // // //                 style={{
// // // // //                   width: "90px",
// // // // //                   height: "90px",
// // // // //                   background: "linear-gradient(135deg, #34d399, #059669)",
// // // // //                   borderRadius: "50%",
// // // // //                   display: "flex",
// // // // //                   alignItems: "center",
// // // // //                   justifyContent: "center",
// // // // //                   margin: "0 auto 16px auto",
// // // // //                   border: "4px solid #020617",
// // // // //                   boxShadow: "0 0 30px rgba(16,185,129,0.5)",
// // // // //                 }}
// // // // //               >
// // // // //                 <span style={{ fontSize: "48px" }}>👑</span>
// // // // //               </div>

// // // // //               <h2
// // // // //                 style={{
// // // // //                   fontSize: "28px",
// // // // //                   fontWeight: "900",
// // // // //                   color: "#34d399",
// // // // //                   margin: "0 0 8px 0",
// // // // //                   textShadow: "0 2px 10px rgba(52,211,153,0.5)",
// // // // //                 }}
// // // // //               >
// // // // //                 অভিনন্দন!
// // // // //               </h2>
// // // // //               <p
// // // // //                 style={{
// // // // //                   color: "#cbd5e1",
// // // // //                   margin: "0 0 24px 0",
// // // // //                   fontSize: "14px",
// // // // //                 }}
// // // // //               >
// // // // //                 আপনি এই রাউন্ডে জিতেছেন!
// // // // //               </p>

// // // // //               <div
// // // // //                 style={{
// // // // //                   backgroundColor: "rgba(2, 6, 23, 0.8)",
// // // // //                   border: "1px solid #334155",
// // // // //                   borderRadius: "16px",
// // // // //                   padding: "16px",
// // // // //                   marginBottom: "24px",
// // // // //                   textAlign: "left",
// // // // //                 }}
// // // // //               >
// // // // //                 <div
// // // // //                   style={{
// // // // //                     display: "flex",
// // // // //                     justifyContent: "space-between",
// // // // //                     marginBottom: "12px",
// // // // //                     fontSize: "14px",
// // // // //                   }}
// // // // //                 >
// // // // //                   <span style={{ color: "#94a3b8" }}>উইনিং নাম্বার:</span>
// // // // //                   <span
// // // // //                     style={{
// // // // //                       fontWeight: "bold",
// // // // //                       color: "white",
// // // // //                       fontFamily: "monospace",
// // // // //                       backgroundColor: getNumberColor(
// // // // //                         Number(winPopup.winningNumber),
// // // // //                       ),
// // // // //                       padding: "2px 8px",
// // // // //                       borderRadius: "4px",
// // // // //                     }}
// // // // //                   >
// // // // //                     {winPopup.winningNumber}
// // // // //                   </span>
// // // // //                 </div>
// // // // //                 <div
// // // // //                   style={{
// // // // //                     display: "flex",
// // // // //                     justifyContent: "space-between",
// // // // //                     marginBottom: "12px",
// // // // //                     fontSize: "14px",
// // // // //                   }}
// // // // //                 >
// // // // //                   <span style={{ color: "#94a3b8" }}>মাল্টিপ্লায়ার:</span>
// // // // //                   <span
// // // // //                     style={{
// // // // //                       fontWeight: "900",
// // // // //                       color: "#fbbf24",
// // // // //                       backgroundColor: "rgba(245,158,11,0.1)",
// // // // //                       padding: "2px 8px",
// // // // //                       borderRadius: "4px",
// // // // //                     }}
// // // // //                   >
// // // // //                     {winPopup.multiplier}x
// // // // //                   </span>
// // // // //                 </div>
// // // // //                 <div
// // // // //                   style={{ borderTop: "1px solid #1e293b", margin: "12px 0" }}
// // // // //                 ></div>
// // // // //                 <div
// // // // //                   style={{
// // // // //                     display: "flex",
// // // // //                     justifyContent: "space-between",
// // // // //                     alignItems: "center",
// // // // //                   }}
// // // // //                 >
// // // // //                   <span style={{ color: "#94a3b8", fontWeight: "bold" }}>
// // // // //                     প্রাইজ মানি:
// // // // //                   </span>
// // // // //                   <span
// // // // //                     style={{
// // // // //                       fontWeight: "900",
// // // // //                       color: "#34d399",
// // // // //                       fontSize: "28px",
// // // // //                       textShadow: "0 0 15px rgba(52,211,153,0.4)",
// // // // //                     }}
// // // // //                   >
// // // // //                     ৳{winPopup.payout}
// // // // //                   </span>
// // // // //                 </div>
// // // // //               </div>

// // // // //               <button
// // // // //                 onClick={() => setWinPopup(null)}
// // // // //                 style={{
// // // // //                   width: "100%",
// // // // //                   background: "linear-gradient(to right, #059669, #047857)",
// // // // //                   color: "white",
// // // // //                   fontWeight: "bold",
// // // // //                   padding: "16px",
// // // // //                   borderRadius: "12px",
// // // // //                   border: "none",
// // // // //                   cursor: "pointer",
// // // // //                   fontSize: "16px",
// // // // //                   boxShadow: "0 5px 15px rgba(5,150,105,0.3)",
// // // // //                 }}
// // // // //               >
// // // // //                 দুর্দান্ত! ধন্যবাদ
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* বেট হিস্ট্রি পপআপ */}
// // // // //       {isHistoryOpen && (
// // // // //         <div
// // // // //           style={{
// // // // //             position: "fixed",
// // // // //             top: 0,
// // // // //             left: 0,
// // // // //             right: 0,
// // // // //             bottom: 0,
// // // // //             backgroundColor: "rgba(0,0,0,0.85)",
// // // // //             backdropFilter: "blur(5px)",
// // // // //             display: "flex",
// // // // //             alignItems: "center",
// // // // //             justifyContent: "center",
// // // // //             zIndex: 50,
// // // // //             padding: "16px",
// // // // //           }}
// // // // //         >
// // // // //           <div
// // // // //             style={{
// // // // //               backgroundColor: "#0f172a",
// // // // //               border: "1px solid #334155",
// // // // //               borderRadius: "16px",
// // // // //               width: "100%",
// // // // //               maxWidth: "420px",
// // // // //               maxHeight: "80vh",
// // // // //               display: "flex",
// // // // //               flexDirection: "column",
// // // // //               overflow: "hidden",
// // // // //               boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
// // // // //             }}
// // // // //           >
// // // // //             <div
// // // // //               style={{
// // // // //                 display: "flex",
// // // // //                 justifyContent: "space-between",
// // // // //                 alignItems: "center",
// // // // //                 padding: "16px",
// // // // //                 borderBottom: "1px solid #1e293b",
// // // // //                 backgroundColor: "rgba(2, 6, 23, 0.5)",
// // // // //               }}
// // // // //             >
// // // // //               <h2
// // // // //                 style={{
// // // // //                   fontSize: "14px",
// // // // //                   fontWeight: "bold",
// // // // //                   color: "#fbbf24",
// // // // //                   margin: 0,
// // // // //                   display: "flex",
// // // // //                   alignItems: "center",
// // // // //                   gap: "8px",
// // // // //                 }}
// // // // //               >
// // // // //                 ⏱️ বেট হিস্ট্রি
// // // // //               </h2>
// // // // //               <button
// // // // //                 onClick={() => setIsHistoryOpen(false)}
// // // // //                 style={{
// // // // //                   width: "32px",
// // // // //                   height: "32px",
// // // // //                   display: "flex",
// // // // //                   alignItems: "center",
// // // // //                   justifyContent: "center",
// // // // //                   borderRadius: "8px",
// // // // //                   backgroundColor: "#1e293b",
// // // // //                   color: "#94a3b8",
// // // // //                   border: "none",
// // // // //                   cursor: "pointer",
// // // // //                 }}
// // // // //               >
// // // // //                 ✕
// // // // //               </button>
// // // // //             </div>

// // // // //             <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
// // // // //               {historyLoading ? (
// // // // //                 <p
// // // // //                   style={{
// // // // //                     textAlign: "center",
// // // // //                     fontSize: "12px",
// // // // //                     color: "#64748b",
// // // // //                     padding: "16px 0",
// // // // //                   }}
// // // // //                 >
// // // // //                   লোড হচ্ছে...
// // // // //                 </p>
// // // // //               ) : historyData.length === 0 ? (
// // // // //                 <p
// // // // //                   style={{
// // // // //                     textAlign: "center",
// // // // //                     fontSize: "12px",
// // // // //                     color: "#64748b",
// // // // //                     padding: "16px 0",
// // // // //                   }}
// // // // //                 >
// // // // //                   কোনো বেট হিস্ট্রি নেই।
// // // // //                 </p>
// // // // //               ) : (
// // // // //                 <div
// // // // //                   style={{
// // // // //                     display: "flex",
// // // // //                     flexDirection: "column",
// // // // //                     gap: "10px",
// // // // //                   }}
// // // // //                 >
// // // // //                   {historyData.map((item, index) => (
// // // // //                     <div
// // // // //                       key={index}
// // // // //                       style={{
// // // // //                         backgroundColor: "#020617",
// // // // //                         border: "1px solid #1e293b",
// // // // //                         padding: "12px",
// // // // //                         borderRadius: "12px",
// // // // //                         display: "flex",
// // // // //                         justifyContent: "space-between",
// // // // //                         alignItems: "center",
// // // // //                       }}
// // // // //                     >
// // // // //                       <div
// // // // //                         style={{
// // // // //                           display: "flex",
// // // // //                           flexDirection: "column",
// // // // //                           gap: "4px",
// // // // //                         }}
// // // // //                       >
// // // // //                         <span
// // // // //                           style={{
// // // // //                             fontFamily: "monospace",
// // // // //                             color: "#cbd5e1",
// // // // //                             fontWeight: "bold",
// // // // //                             fontSize: "12px",
// // // // //                           }}
// // // // //                         >
// // // // //                           {item.periodNumber}
// // // // //                         </span>
// // // // //                         <div
// // // // //                           style={{
// // // // //                             display: "flex",
// // // // //                             gap: "8px",
// // // // //                             fontSize: "10px",
// // // // //                           }}
// // // // //                         >
// // // // //                           <span style={{ color: "#64748b" }}>
// // // // //                             রেজাল্ট:{" "}
// // // // //                             <span
// // // // //                               style={{ fontWeight: "bold", color: "#60a5fa" }}
// // // // //                             >
// // // // //                               {item.winningNumber}
// // // // //                             </span>
// // // // //                           </span>
// // // // //                         </div>
// // // // //                         <span
// // // // //                           style={{
// // // // //                             fontSize: "10px",
// // // // //                             color: "#94a3b8",
// // // // //                             marginTop: "4px",
// // // // //                           }}
// // // // //                         >
// // // // //                           চয়েস:{" "}
// // // // //                           <span
// // // // //                             style={{ fontWeight: "bold", color: "#fbbf24" }}
// // // // //                           >
// // // // //                             {item.userChoice}
// // // // //                           </span>
// // // // //                         </span>
// // // // //                       </div>
// // // // //                       <div
// // // // //                         style={{
// // // // //                           display: "flex",
// // // // //                           flexDirection: "column",
// // // // //                           alignItems: "flex-end",
// // // // //                           gap: "4px",
// // // // //                         }}
// // // // //                       >
// // // // //                         <p
// // // // //                           style={{
// // // // //                             fontWeight: "900",
// // // // //                             fontSize: "12px",
// // // // //                             padding: "2px 8px",
// // // // //                             borderRadius: "4px",
// // // // //                             margin: 0,
// // // // //                             backgroundColor:
// // // // //                               item.status === "win"
// // // // //                                 ? "rgba(16,185,129,0.1)"
// // // // //                                 : "rgba(244,63,94,0.1)",
// // // // //                             color:
// // // // //                               item.status === "win" ? "#34d399" : "#f43f5e",
// // // // //                           }}
// // // // //                         >
// // // // //                           {item.status === "win"
// // // // //                             ? `WIN ${item.multiplier}x`
// // // // //                             : "LOSS"}
// // // // //                         </p>
// // // // //                         <p
// // // // //                           style={{
// // // // //                             fontSize: "10px",
// // // // //                             color: "#64748b",
// // // // //                             margin: 0,
// // // // //                           }}
// // // // //                         >
// // // // //                           বাজি:{" "}
// // // // //                           <span style={{ color: "white", fontWeight: "bold" }}>
// // // // //                             ৳{item.betAmount}
// // // // //                           </span>
// // // // //                         </p>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   ))}
// // // // //                 </div>
// // // // //               )}
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // ///////////////////////////////////////////
// // // // "use client";
// // // // import { useState, useEffect } from "react";

// // // // export default function CasinoRoulette() {
// // // //   const [balance, setBalance] = useState(0);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [submitting, setSubmitting] = useState(false);
// // // //   const [message, setMessage] = useState(null);

// // // //   // গেম স্টেট
// // // //   const [currentPeriod, setCurrentPeriod] = useState("PER-10001");
// // // //   const [timeLeft, setTimeLeft] = useState(0);
// // // //   const [winPopup, setWinPopup] = useState(null);
// // // //   const [recentResults, setRecentResults] = useState([]);

// // // //   // বেট স্টেট
// // // //   const [selectedBets, setSelectedBets] = useState([]);
// // // //   const [betAmount, setBetAmount] = useState("");

// // // //   // হিস্ট্রি স্টেট
// // // //   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
// // // //   const [historyData, setHistoryData] = useState([]);
// // // //   const [historyLoading, setHistoryLoading] = useState(false);

// // // //   // ১. ইউজার ডেটা লোড
// // // //   const fetchUserData = async () => {
// // // //     try {
// // // //       const res = await fetch("/api/user/me", { credentials: "include" });
// // // //       if (!res.ok) return;
// // // //       const data = await res.json();
// // // //       if (data.success) setBalance(data.user?.balance || 0);
// // // //     } catch (err) {
// // // //       console.error("User fetch error:", err);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // ২. গেম স্টেট লোড
// // // //   const fetchGameState = async () => {
// // // //     try {
// // // //       const res = await fetch("/api/game/newgame-state", {
// // // //         credentials: "include",
// // // //       });
// // // //       if (!res.ok) return;
// // // //       const data = await res.json();

// // // //       if (data.success) {
// // // //         setCurrentPeriod(data.periodNumber);
// // // //         const end = new Date(data.endTime).getTime();
// // // //         const now = new Date().getTime();
// // // //         const diff = Math.max(0, Math.floor((end - now) / 1000));
// // // //         setTimeLeft(diff);

// // // //         if (data.recentResults) {
// // // //           setRecentResults(data.recentResults);
// // // //         }

// // // //         // 🆕 উইন পপআপ লজিক (লোকাল স্টোরেজসহ)
// // // //         if (data.userResult && data.userResult.status === "win") {
// // // //           const roundId = data.userResult.round;
// // // //           const shownRounds = JSON.parse(
// // // //             localStorage.getItem("shownWinRounds") || "[]",
// // // //           );

// // // //           if (!shownRounds.includes(roundId)) {
// // // //             setWinPopup(data.userResult);
// // // //             setTimeout(() => setWinPopup(null), 5000);
// // // //             localStorage.setItem(
// // // //               "shownWinRounds",
// // // //               JSON.stringify([...shownRounds, roundId]),
// // // //             );
// // // //           }
// // // //         }
// // // //       }
// // // //     } catch (err) {
// // // //       console.error("State fetch error:", err);
// // // //     }
// // // //   };

// // // //   // ৩. হিস্ট্রি লোড
// // // //   const fetchHistory = async () => {
// // // //     setIsHistoryOpen(true);
// // // //     setHistoryLoading(true);
// // // //     try {
// // // //       const res = await fetch("/api/game/newgame-history", {
// // // //         credentials: "include",
// // // //       });
// // // //       const data = await res.json();
// // // //       if (data.success) setHistoryData(data.history || []);
// // // //     } catch (err) {
// // // //       console.error("History fetch error:", err);
// // // //     } finally {
// // // //       setHistoryLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchUserData();
// // // //     fetchGameState();

// // // //     const timer = setInterval(() => {
// // // //       setTimeLeft((prev) => {
// // // //         if (prev <= 1) {
// // // //           fetchGameState();
// // // //           fetchUserData();
// // // //           return 0;
// // // //         }
// // // //         return prev - 1;
// // // //       });
// // // //     }, 1000);

// // // //     return () => clearInterval(timer);
// // // //   }, []);

// // // //   // ৪. সিলেকশন টগল (ফ্রন্টএন্ড ভ্যালিডেশনসহ)
// // // //   const toggleSelection = (type, selection) => {
// // // //     if (timeLeft <= 5) {
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// // // //       });
// // // //     }

// // // //     if (type === "odd" && selectedBets.some((b) => b.type === "even")) {
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// // // //       });
// // // //     }
// // // //     if (type === "even" && selectedBets.some((b) => b.type === "odd")) {
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// // // //       });
// // // //     }
// // // //     if (type === "red" && selectedBets.some((b) => b.type === "black")) {
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// // // //       });
// // // //     }
// // // //     if (type === "black" && selectedBets.some((b) => b.type === "red")) {
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// // // //       });
// // // //     }

// // // //     const dozenCount = selectedBets.filter((b) =>
// // // //       ["1-12", "13-24", "25-36"].includes(b.type),
// // // //     ).length;
// // // //     if (
// // // //       ["1-12", "13-24", "25-36"].includes(type) &&
// // // //       dozenCount >= 2 &&
// // // //       !isSelected(type, selection)
// // // //     ) {
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
// // // //       });
// // // //     }

// // // //     setSelectedBets((prev) => {
// // // //       const exists = prev.find(
// // // //         (b) => b.type === type && b.selection === selection,
// // // //       );
// // // //       if (exists) {
// // // //         return prev.filter(
// // // //           (b) => !(b.type === type && b.selection === selection),
// // // //         );
// // // //       } else {
// // // //         return [...prev, { type, selection }];
// // // //       }
// // // //     });
// // // //   };

// // // //   // ৫. বাজি প্লেস
// // // //   const handleBet = async () => {
// // // //     if (selectedBets.length === 0)
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "কমপক্ষে একটি অপশন সিলেক্ট করুন!",
// // // //       });
// // // //     const amount = Number(betAmount);
// // // //     if (!amount || amount <= 0)
// // // //       return setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন!" });

// // // //     const totalCost = amount * selectedBets.length;
// // // //     if (totalCost > balance)
// // // //       return setMessage({ type: "error", text: "পর্যাপ্ত ব্যালেন্স নেই!" });
// // // //     if (timeLeft <= 5)
// // // //       return setMessage({
// // // //         type: "error",
// // // //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// // // //       });

// // // //     setSubmitting(true);
// // // //     setMessage(null);

// // // //     try {
// // // //       const formattedBets = selectedBets.map((b) => ({
// // // //         type: b.type,
// // // //         selection: b.selection,
// // // //         amount,
// // // //       }));

// // // //       const res = await fetch("/api/game/newgamebet", {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         credentials: "include",
// // // //         body: JSON.stringify({
// // // //           bets: formattedBets,
// // // //           periodNumber: currentPeriod,
// // // //         }),
// // // //       });
// // // //       const data = await res.json();

// // // //       if (data.success) {
// // // //         setMessage({ type: "success", text: data.message });
// // // //         setBalance(data.newBalance);
// // // //         setBetAmount("");
// // // //         setSelectedBets([]);

// // // //         setTimeout(() => {
// // // //           setMessage(null);
// // // //         }, 3000);
// // // //       } else {
// // // //         setMessage({ type: "error", text: data.message });
// // // //         setTimeout(() => {
// // // //           setMessage(null);
// // // //         }, 3000);
// // // //       }
// // // //     } catch (err) {
// // // //       setMessage({ type: "error", text: "সার্ভার এরর!" });
// // // //       setTimeout(() => {
// // // //         setMessage(null);
// // // //       }, 3000);
// // // //     } finally {
// // // //       setSubmitting(false);
// // // //     }
// // // //   };

// // // //   const isSelected = (type, selection) => {
// // // //     return selectedBets.some(
// // // //       (b) => b.type === type && b.selection === selection,
// // // //     );
// // // //   };

// // // //   // রুলেট নাম্বারের রঙ (লাল/কালো) - ক্যাসিনো স্টাইল
// // // //   const getNumberColor = (num) => {
// // // //     const redNumbers = [
// // // //       1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // // //     ];
// // // //     if (num === 0) return "#059669";
// // // //     return redNumbers.includes(num) ? "#dc2626" : "#1e293b";
// // // //   };

// // // //   if (loading)
// // // //     return (
// // // //       <div
// // // //         style={{
// // // //           minHeight: "100vh",
// // // //           backgroundColor: "#020617",
// // // //           display: "flex",
// // // //           alignItems: "center",
// // // //           justifyContent: "center",
// // // //           color: "white",
// // // //         }}
// // // //       >
// // // //         <div
// // // //           style={{
// // // //             width: "48px",
// // // //             height: "48px",
// // // //             border: "4px solid #fbbf24",
// // // //             borderTopColor: "transparent",
// // // //             borderRadius: "50%",
// // // //             animation: "spin 1s linear infinite",
// // // //           }}
// // // //         ></div>
// // // //         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
// // // //       </div>
// // // //     );

// // // //   return (
// // // //     <div
// // // //       style={{
// // // //         minHeight: "100vh",
// // // //         backgroundColor: "#020617",
// // // //         backgroundImage:
// // // //           "radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)",
// // // //         padding: "16px",
// // // //         color: "white",
// // // //         display: "flex",
// // // //         flexDirection: "column",
// // // //         alignItems: "center",
// // // //         paddingBottom: "100px",
// // // //         fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
// // // //       }}
// // // //     >
// // // //       {/* হেডার */}
// // // //       <div
// // // //         style={{
// // // //           width: "100%",
// // // //           maxWidth: "480px",
// // // //           display: "flex",
// // // //           justifyContent: "space-between",
// // // //           alignItems: "center",
// // // //           marginBottom: "16px",
// // // //           padding: "0 8px",
// // // //         }}
// // // //       >
// // // //         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
// // // //           <div
// // // //             style={{
// // // //               width: "40px",
// // // //               height: "40px",
// // // //               borderRadius: "50%",
// // // //               background: "linear-gradient(135deg, #fbbf24, #d97706)",
// // // //               display: "flex",
// // // //               alignItems: "center",
// // // //               justifyContent: "center",
// // // //               fontWeight: "bold",
// // // //               color: "#000",
// // // //               boxShadow: "0 0 15px rgba(245,158,11,0.4)",
// // // //             }}
// // // //           >
// // // //             R
// // // //           </div>
// // // //           <div>
// // // //             <p
// // // //               style={{
// // // //                 fontSize: "10px",
// // // //                 color: "#94a3b8",
// // // //                 margin: 0,
// // // //                 textTransform: "uppercase",
// // // //                 letterSpacing: "1px",
// // // //               }}
// // // //             >
// // // //               পিরিয়ড
// // // //             </p>
// // // //             <p
// // // //               style={{
// // // //                 fontFamily: "monospace",
// // // //                 color: "#fbbf24",
// // // //                 fontWeight: "bold",
// // // //                 fontSize: "14px",
// // // //                 margin: 0,
// // // //               }}
// // // //             >
// // // //               {currentPeriod}
// // // //             </p>
// // // //           </div>
// // // //         </div>
// // // //         <div
// // // //           style={{
// // // //             backgroundColor: "rgba(15, 23, 42, 0.8)",
// // // //             padding: "8px 16px",
// // // //             borderRadius: "12px",
// // // //             border: "1px solid rgba(51, 65, 85, 0.5)",
// // // //             textAlign: "right",
// // // //           }}
// // // //         >
// // // //           <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// // // //             ব্যালেন্স
// // // //           </p>
// // // //           <p
// // // //             style={{
// // // //               fontFamily: "monospace",
// // // //               color: "#34d399",
// // // //               fontWeight: "bold",
// // // //               fontSize: "18px",
// // // //               margin: 0,
// // // //             }}
// // // //           >
// // // //             ৳{balance.toFixed(2)}
// // // //           </p>
// // // //         </div>
// // // //       </div>

// // // //       {/* টাইমার এবং হিস্ট্রি */}
// // // //       <div
// // // //         style={{
// // // //           width: "100%",
// // // //           maxWidth: "480px",
// // // //           display: "flex",
// // // //           gap: "12px",
// // // //           marginBottom: "16px",
// // // //         }}
// // // //       >
// // // //         <div
// // // //           style={{
// // // //             flex: 1,
// // // //             background: "linear-gradient(90deg, #0f172a, #1e293b)",
// // // //             padding: "12px",
// // // //             borderRadius: "16px",
// // // //             display: "flex",
// // // //             alignItems: "center",
// // // //             justifyContent: "space-between",
// // // //             border: "1px solid rgba(51, 65, 85, 0.5)",
// // // //           }}
// // // //         >
// // // //           <div>
// // // //             <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// // // //               টাইমার
// // // //             </p>
// // // //             <p
// // // //               style={{
// // // //                 fontFamily: "monospace",
// // // //                 fontWeight: "900",
// // // //                 fontSize: "24px",
// // // //                 margin: 0,
// // // //                 color: timeLeft <= 5 ? "#f43f5e" : "#34d399",
// // // //                 textShadow:
// // // //                   timeLeft <= 5 ? "0 0 10px #f43f5e" : "0 0 10px #34d399",
// // // //               }}
// // // //             >
// // // //               00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
// // // //             </p>
// // // //           </div>
// // // //           <button
// // // //             onClick={fetchHistory}
// // // //             style={{
// // // //               backgroundColor: "rgba(51, 65, 85, 0.5)",
// // // //               border: "none",
// // // //               color: "#cbd5e1",
// // // //               width: "40px",
// // // //               height: "40px",
// // // //               borderRadius: "10px",
// // // //               cursor: "pointer",
// // // //               display: "flex",
// // // //               alignItems: "center",
// // // //               justifyContent: "center",
// // // //             }}
// // // //           >
// // // //             ⏱️
// // // //           </button>
// // // //         </div>
// // // //       </div>

// // // //       {/* বাজি ধরার ফর্ম */}
// // // //       <div
// // // //         style={{
// // // //           width: "100%",
// // // //           maxWidth: "480px",
// // // //           backgroundColor: "rgba(15, 23, 42, 0.8)",
// // // //           padding: "16px",
// // // //           borderRadius: "16px",
// // // //           border: "1px solid rgba(51, 65, 85, 0.5)",
// // // //           marginBottom: "16px",
// // // //           backdropFilter: "blur(10px)",
// // // //         }}
// // // //       >
// // // //         <div style={{ position: "relative" }}>
// // // //           <span
// // // //             style={{
// // // //               position: "absolute",
// // // //               left: "16px",
// // // //               top: "50%",
// // // //               transform: "translateY(-50%)",
// // // //               color: "#fbbf24",
// // // //               fontSize: "18px",
// // // //             }}
// // // //           >
// // // //             ৳
// // // //           </span>
// // // //           <input
// // // //             type="number"
// // // //             value={betAmount}
// // // //             onChange={(e) => setBetAmount(e.target.value)}
// // // //             placeholder="পরিমাণ লিখুন"
// // // //             disabled={timeLeft <= 5}
// // // //             style={{
// // // //               width: "100%",
// // // //               backgroundColor: "#020617",
// // // //               border: "1px solid #334155",
// // // //               borderRadius: "12px",
// // // //               padding: "14px 16px 14px 40px",
// // // //               color: "white",
// // // //               fontFamily: "monospace",
// // // //               fontSize: "18px",
// // // //               outline: "none",
// // // //               boxSizing: "border-box",
// // // //             }}
// // // //           />
// // // //         </div>

// // // //         {selectedBets.length > 0 && betAmount > 0 && (
// // // //           <div
// // // //             style={{
// // // //               display: "flex",
// // // //               justifyContent: "space-between",
// // // //               alignItems: "center",
// // // //               marginTop: "12px",
// // // //               padding: "0 4px",
// // // //             }}
// // // //           >
// // // //             <span style={{ fontSize: "12px", color: "#94a3b8" }}>
// // // //               সিলেকশন: {selectedBets.length} টি
// // // //             </span>
// // // //             <span
// // // //               style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}
// // // //             >
// // // //               মোট খরচ: ৳{(Number(betAmount) * selectedBets.length).toFixed(2)}
// // // //             </span>
// // // //           </div>
// // // //         )}
// // // //       </div>

// // // //       {/* 🎯 ক্যাসিনো স্টাইল রুলেট বোর্ড */}
// // // //       <div style={{ width: "100%", maxWidth: "480px", marginBottom: "24px" }}>
// // // //         <div
// // // //           style={{
// // // //             display: "grid",
// // // //             gridTemplateColumns: "1fr 1fr 1fr",
// // // //             gap: "8px",
// // // //             marginBottom: "8px",
// // // //           }}
// // // //         >
// // // //           {[
// // // //             { label: "1-12 (x3)", type: "1-12", sel: "1-12" },
// // // //             { label: "13-24 (x3)", type: "13-24", sel: "13-24" },
// // // //             { label: "25-36 (x3)", type: "25-36", sel: "25-36" },
// // // //           ].map((item, idx) => {
// // // //             const active = isSelected(item.type, item.sel);
// // // //             return (
// // // //               <button
// // // //                 key={idx}
// // // //                 onClick={() => toggleSelection(item.type, item.sel)}
// // // //                 style={{
// // // //                   padding: "10px",
// // // //                   borderRadius: "8px",
// // // //                   fontWeight: "bold",
// // // //                   fontSize: "13px",
// // // //                   border: "2px solid",
// // // //                   borderColor: active ? "#fbbf24" : "rgba(51, 65, 85, 0.8)",
// // // //                   backgroundColor: active
// // // //                     ? "rgba(245, 158, 11, 0.9)"
// // // //                     : "rgba(30, 41, 59, 0.8)",
// // // //                   color: active ? "black" : "#cbd5e1",
// // // //                   cursor: "pointer",
// // // //                   transition: "all 0.2s",
// // // //                   boxShadow: active ? "0 0 15px rgba(245,158,11,0.4)" : "none",
// // // //                 }}
// // // //               >
// // // //                 {item.label}
// // // //               </button>
// // // //             );
// // // //           })}
// // // //         </div>

// // // //         <div style={{ marginBottom: "8px" }}>
// // // //           <button
// // // //             onClick={() => toggleSelection("number", "0")}
// // // //             style={{
// // // //               width: "100%",
// // // //               padding: "12px",
// // // //               borderRadius: "8px",
// // // //               fontWeight: "bold",
// // // //               fontSize: "16px",
// // // //               border: "2px solid",
// // // //               borderColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
// // // //               backgroundColor: isSelected("number", "0")
// // // //                 ? "#fbbf24"
// // // //                 : "#059669",
// // // //               color: isSelected("number", "0") ? "black" : "white",
// // // //               cursor: "pointer",
// // // //               transition: "all 0.2s",
// // // //               boxShadow: isSelected("number", "0")
// // // //                 ? "0 0 15px rgba(245,158,11,0.6)"
// // // //                 : "0 0 10px rgba(5,150,105,0.4)",
// // // //             }}
// // // //           >
// // // //             0 (Zero)
// // // //           </button>
// // // //         </div>

// // // //         <div
// // // //           style={{
// // // //             display: "grid",
// // // //             gridTemplateColumns: "repeat(6, 1fr)",
// // // //             gap: "6px",
// // // //           }}
// // // //         >
// // // //           {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
// // // //             const active = isSelected("number", String(num));
// // // //             const bgColor = getNumberColor(num);
// // // //             return (
// // // //               <button
// // // //                 key={num}
// // // //                 onClick={() => toggleSelection("number", String(num))}
// // // //                 style={{
// // // //                   height: "48px",
// // // //                   borderRadius: "8px",
// // // //                   fontWeight: "bold",
// // // //                   fontSize: "16px",
// // // //                   border: active
// // // //                     ? "3px solid #fbbf24"
// // // //                     : "1px solid rgba(255,255,255,0.1)",
// // // //                   backgroundColor: active ? "#fbbf24" : bgColor,
// // // //                   color: active ? "black" : "white",
// // // //                   cursor: "pointer",
// // // //                   transition: "all 0.2s",
// // // //                   boxShadow: active
// // // //                     ? "0 0 20px rgba(245,158,11,0.6), inset 0 0 10px rgba(0,0,0,0.2)"
// // // //                     : "inset 0 0 10px rgba(0,0,0,0.5)",
// // // //                   display: "flex",
// // // //                   alignItems: "center",
// // // //                   justifyContent: "center",
// // // //                   textShadow: active ? "none" : "1px 1px 2px rgba(0,0,0,0.8)",
// // // //                 }}
// // // //               >
// // // //                 {num}
// // // //               </button>
// // // //             );
// // // //           })}
// // // //         </div>

// // // //         <div
// // // //           style={{
// // // //             display: "grid",
// // // //             gridTemplateColumns: "1fr 1fr",
// // // //             gap: "8px",
// // // //             marginTop: "8px",
// // // //           }}
// // // //         >
// // // //           {[
// // // //             { label: "Odd (x2)", type: "odd", sel: "odd" },
// // // //             { label: "Even (x2)", type: "even", sel: "even" },
// // // //             { label: "Red (x2)", type: "red", sel: "red" },
// // // //             { label: "Black (x2)", type: "black", sel: "black" },
// // // //           ].map((item, idx) => {
// // // //             const active = isSelected(item.type, item.sel);
// // // //             let activeBg = "rgba(245, 158, 11, 0.9)";
// // // //             let activeBorder = "#fbbf24";
// // // //             let activeShadow = "0 0 15px rgba(245,158,11,0.4)";

// // // //             if (item.type === "red") {
// // // //               activeBg = "#dc2626";
// // // //               activeBorder = "#ef4444";
// // // //               activeShadow = "0 0 15px rgba(220,38,38,0.6)";
// // // //             } else if (item.type === "black") {
// // // //               activeBg = "#1e293b";
// // // //               activeBorder = "#334155";
// // // //               activeShadow = "0 0 15px rgba(0,0,0,0.5)";
// // // //             }

// // // //             return (
// // // //               <button
// // // //                 key={idx}
// // // //                 onClick={() => toggleSelection(item.type, item.sel)}
// // // //                 style={{
// // // //                   padding: "12px",
// // // //                   borderRadius: "8px",
// // // //                   fontWeight: "bold",
// // // //                   fontSize: "14px",
// // // //                   border: "2px solid",
// // // //                   borderColor: active ? activeBorder : "rgba(51, 65, 85, 0.8)",
// // // //                   backgroundColor: active ? activeBg : "rgba(30, 41, 59, 0.8)",
// // // //                   color: active
// // // //                     ? item.type === "black"
// // // //                       ? "white"
// // // //                       : "black"
// // // //                     : "#cbd5e1",
// // // //                   cursor: "pointer",
// // // //                   transition: "all 0.2s",
// // // //                   boxShadow: active ? activeShadow : "none",
// // // //                 }}
// // // //               >
// // // //                 {item.label}
// // // //               </button>
// // // //             );
// // // //           })}
// // // //         </div>
// // // //       </div>

// // // //       {/* কনফার্ম বাটন */}
// // // //       <div style={{ width: "100%", maxWidth: "480px" }}>
// // // //         {message && (
// // // //           <div
// // // //             style={{
// // // //               padding: "12px",
// // // //               borderRadius: "12px",
// // // //               fontSize: "14px",
// // // //               fontWeight: "bold",
// // // //               textAlign: "center",
// // // //               marginBottom: "12px",
// // // //               backgroundColor:
// // // //                 message.type === "success"
// // // //                   ? "rgba(6, 78, 59, 0.9)"
// // // //                   : "rgba(136, 19, 55, 0.9)",
// // // //               color: message.type === "success" ? "#34d399" : "#f87171",
// // // //               border: "1px solid",
// // // //               borderColor: message.type === "success" ? "#059669" : "#e11d48",
// // // //             }}
// // // //           >
// // // //             {message.text}
// // // //           </div>
// // // //         )}
// // // //         <button
// // // //           onClick={handleBet}
// // // //           disabled={submitting || timeLeft <= 5}
// // // //           style={{
// // // //             width: "100%",
// // // //             background:
// // // //               timeLeft <= 5
// // // //                 ? "#334155"
// // // //                 : "linear-gradient(to right, #f59e0b, #d97706)",
// // // //             color: timeLeft <= 5 ? "#94a3b8" : "black",
// // // //             fontWeight: "900",
// // // //             padding: "18px",
// // // //             borderRadius: "16px",
// // // //             border: "none",
// // // //             cursor: timeLeft <= 5 ? "not-allowed" : "pointer",
// // // //             transition: "transform 0.1s",
// // // //             boxShadow:
// // // //               timeLeft <= 5
// // // //                 ? "none"
// // // //                 : "0 10px 25px -5px rgba(245, 158, 11, 0.5)",
// // // //             fontSize: "16px",
// // // //             letterSpacing: "1px",
// // // //           }}
// // // //         >
// // // //           {timeLeft <= 5
// // // //             ? "বাজি বন্ধ (অপেক্ষা করুন)"
// // // //             : submitting
// // // //               ? "প্রসেসিং..."
// // // //               : `বাজি ধরুন (${selectedBets.length} টি)`}
// // // //         </button>
// // // //       </div>

// // // //       {/* 🆕 সাম্প্রতিক রেজাল্ট কার্সেল */}
// // // //       {recentResults.length > 0 && (
// // // //         <div
// // // //           style={{
// // // //             width: "100%",
// // // //             maxWidth: "480px",
// // // //             display: "flex",
// // // //             alignItems: "center",
// // // //             gap: "8px",
// // // //             marginTop: "16px",
// // // //             overflowX: "auto",
// // // //             paddingBottom: "4px",
// // // //             scrollbarWidth: "none",
// // // //           }}
// // // //         >
// // // //           <span
// // // //             style={{
// // // //               fontSize: "10px",
// // // //               color: "#94a3b8",
// // // //               whiteSpace: "nowrap",
// // // //               fontWeight: "bold",
// // // //             }}
// // // //           >
// // // //             সাম্প্রতিক:
// // // //           </span>
// // // //           <div style={{ display: "flex", gap: "6px" }}>
// // // //             {recentResults.map((num, idx) => (
// // // //               <div
// // // //                 key={idx}
// // // //                 style={{
// // // //                   width: "32px",
// // // //                   height: "32px",
// // // //                   borderRadius: "50%",
// // // //                   display: "flex",
// // // //                   alignItems: "center",
// // // //                   justifyContent: "center",
// // // //                   fontWeight: "bold",
// // // //                   fontSize: "12px",
// // // //                   flexShrink: 0,
// // // //                   backgroundColor: getNumberColor(num),
// // // //                   color: "white",
// // // //                   border: "2px solid rgba(255,255,255,0.1)",
// // // //                   boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
// // // //                   textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
// // // //                 }}
// // // //               >
// // // //                 {num}
// // // //               </div>
// // // //             ))}
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* 🏆 উইন পপআপ */}
// // // //       {winPopup && (
// // // //         <div
// // // //           style={{
// // // //             position: "fixed",
// // // //             top: 0,
// // // //             left: 0,
// // // //             right: 0,
// // // //             bottom: 0,
// // // //             backgroundColor: "rgba(0,0,0,0.85)",
// // // //             backdropFilter: "blur(5px)",
// // // //             display: "flex",
// // // //             alignItems: "center",
// // // //             justifyContent: "center",
// // // //             zIndex: 50,
// // // //             padding: "16px",
// // // //           }}
// // // //         >
// // // //           <div
// // // //             style={{
// // // //               background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)",
// // // //               border: "2px solid #10b981",
// // // //               borderRadius: "24px",
// // // //               padding: "32px 24px",
// // // //               maxWidth: "360px",
// // // //               width: "100%",
// // // //               textAlign: "center",
// // // //               position: "relative",
// // // //               overflow: "hidden",
// // // //               boxShadow: "0 0 50px rgba(16,185,129,0.3)",
// // // //             }}
// // // //           >
// // // //             <div
// // // //               style={{
// // // //                 position: "absolute",
// // // //                 top: "-50px",
// // // //                 left: "50%",
// // // //                 transform: "translateX(-50%)",
// // // //                 width: "200px",
// // // //                 height: "200px",
// // // //                 background:
// // // //                   "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
// // // //                 zIndex: 0,
// // // //               }}
// // // //             ></div>

// // // //             <div style={{ position: "relative", zIndex: 1 }}>
// // // //               <div
// // // //                 style={{
// // // //                   width: "90px",
// // // //                   height: "90px",
// // // //                   background: "linear-gradient(135deg, #34d399, #059669)",
// // // //                   borderRadius: "50%",
// // // //                   display: "flex",
// // // //                   alignItems: "center",
// // // //                   justifyContent: "center",
// // // //                   margin: "0 auto 16px auto",
// // // //                   border: "4px solid #020617",
// // // //                   boxShadow: "0 0 30px rgba(16,185,129,0.5)",
// // // //                 }}
// // // //               >
// // // //                 <span style={{ fontSize: "48px" }}>👑</span>
// // // //               </div>

// // // //               <h2
// // // //                 style={{
// // // //                   fontSize: "28px",
// // // //                   fontWeight: "900",
// // // //                   color: "#34d399",
// // // //                   margin: "0 0 8px 0",
// // // //                   textShadow: "0 2px 10px rgba(52,211,153,0.5)",
// // // //                 }}
// // // //               >
// // // //                 অভিনন্দন!
// // // //               </h2>
// // // //               <p
// // // //                 style={{
// // // //                   color: "#cbd5e1",
// // // //                   margin: "0 0 24px 0",
// // // //                   fontSize: "14px",
// // // //                 }}
// // // //               >
// // // //                 আপনি এই রাউন্ডে জিতেছেন!
// // // //               </p>

// // // //               <div
// // // //                 style={{
// // // //                   backgroundColor: "rgba(2, 6, 23, 0.8)",
// // // //                   border: "1px solid #334155",
// // // //                   borderRadius: "16px",
// // // //                   padding: "16px",
// // // //                   marginBottom: "24px",
// // // //                   textAlign: "left",
// // // //                 }}
// // // //               >
// // // //                 <div
// // // //                   style={{
// // // //                     display: "flex",
// // // //                     justifyContent: "space-between",
// // // //                     marginBottom: "12px",
// // // //                     fontSize: "14px",
// // // //                   }}
// // // //                 >
// // // //                   <span style={{ color: "#94a3b8" }}>উইনিং নাম্বার:</span>
// // // //                   <span
// // // //                     style={{
// // // //                       fontWeight: "bold",
// // // //                       color: "white",
// // // //                       fontFamily: "monospace",
// // // //                       backgroundColor: getNumberColor(
// // // //                         Number(winPopup.winningNumber),
// // // //                       ),
// // // //                       padding: "2px 8px",
// // // //                       borderRadius: "4px",
// // // //                     }}
// // // //                   >
// // // //                     {winPopup.winningNumber}
// // // //                   </span>
// // // //                 </div>
// // // //                 <div
// // // //                   style={{
// // // //                     display: "flex",
// // // //                     justifyContent: "space-between",
// // // //                     marginBottom: "12px",
// // // //                     fontSize: "14px",
// // // //                   }}
// // // //                 >
// // // //                   <span style={{ color: "#94a3b8" }}>মাল্টিপ্লায়ার:</span>
// // // //                   <span
// // // //                     style={{
// // // //                       fontWeight: "900",
// // // //                       color: "#fbbf24",
// // // //                       backgroundColor: "rgba(245,158,11,0.1)",
// // // //                       padding: "2px 8px",
// // // //                       borderRadius: "4px",
// // // //                     }}
// // // //                   >
// // // //                     {winPopup.multiplier}x
// // // //                   </span>
// // // //                 </div>
// // // //                 <div
// // // //                   style={{ borderTop: "1px solid #1e293b", margin: "12px 0" }}
// // // //                 ></div>
// // // //                 <div
// // // //                   style={{
// // // //                     display: "flex",
// // // //                     justifyContent: "space-between",
// // // //                     alignItems: "center",
// // // //                   }}
// // // //                 >
// // // //                   <span style={{ color: "#94a3b8", fontWeight: "bold" }}>
// // // //                     প্রাইজ মানি:
// // // //                   </span>
// // // //                   <span
// // // //                     style={{
// // // //                       fontWeight: "900",
// // // //                       color: "#34d399",
// // // //                       fontSize: "28px",
// // // //                       textShadow: "0 0 15px rgba(52,211,153,0.4)",
// // // //                     }}
// // // //                   >
// // // //                     ৳{winPopup.payout}
// // // //                   </span>
// // // //                 </div>
// // // //               </div>

// // // //               <button
// // // //                 onClick={() => setWinPopup(null)}
// // // //                 style={{
// // // //                   width: "100%",
// // // //                   background: "linear-gradient(to right, #059669, #047857)",
// // // //                   color: "white",
// // // //                   fontWeight: "bold",
// // // //                   padding: "16px",
// // // //                   borderRadius: "12px",
// // // //                   border: "none",
// // // //                   cursor: "pointer",
// // // //                   fontSize: "16px",
// // // //                   boxShadow: "0 5px 15px rgba(5,150,105,0.3)",
// // // //                 }}
// // // //               >
// // // //                 দুর্দান্ত! ধন্যবাদ
// // // //               </button>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* বেট হিস্ট্রি পপআপ */}
// // // //       {isHistoryOpen && (
// // // //         <div
// // // //           style={{
// // // //             position: "fixed",
// // // //             top: 0,
// // // //             left: 0,
// // // //             right: 0,
// // // //             bottom: 0,
// // // //             backgroundColor: "rgba(0,0,0,0.85)",
// // // //             backdropFilter: "blur(5px)",
// // // //             display: "flex",
// // // //             alignItems: "center",
// // // //             justifyContent: "center",
// // // //             zIndex: 50,
// // // //             padding: "16px",
// // // //           }}
// // // //         >
// // // //           <div
// // // //             style={{
// // // //               backgroundColor: "#0f172a",
// // // //               border: "1px solid #334155",
// // // //               borderRadius: "16px",
// // // //               width: "100%",
// // // //               maxWidth: "420px",
// // // //               maxHeight: "80vh",
// // // //               display: "flex",
// // // //               flexDirection: "column",
// // // //               overflow: "hidden",
// // // //               boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
// // // //             }}
// // // //           >
// // // //             <div
// // // //               style={{
// // // //                 display: "flex",
// // // //                 justifyContent: "space-between",
// // // //                 alignItems: "center",
// // // //                 padding: "16px",
// // // //                 borderBottom: "1px solid #1e293b",
// // // //                 backgroundColor: "rgba(2, 6, 23, 0.5)",
// // // //               }}
// // // //             >
// // // //               <h2
// // // //                 style={{
// // // //                   fontSize: "14px",
// // // //                   fontWeight: "bold",
// // // //                   color: "#fbbf24",
// // // //                   margin: 0,
// // // //                   display: "flex",
// // // //                   alignItems: "center",
// // // //                   gap: "8px",
// // // //                 }}
// // // //               >
// // // //                 ⏱️ বেট হিস্ট্রি
// // // //               </h2>
// // // //               <button
// // // //                 onClick={() => setIsHistoryOpen(false)}
// // // //                 style={{
// // // //                   width: "32px",
// // // //                   height: "32px",
// // // //                   display: "flex",
// // // //                   alignItems: "center",
// // // //                   justifyContent: "center",
// // // //                   borderRadius: "8px",
// // // //                   backgroundColor: "#1e293b",
// // // //                   color: "#94a3b8",
// // // //                   border: "none",
// // // //                   cursor: "pointer",
// // // //                 }}
// // // //               >
// // // //                 ✕
// // // //               </button>
// // // //             </div>

// // // //             <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
// // // //               {historyLoading ? (
// // // //                 <p
// // // //                   style={{
// // // //                     textAlign: "center",
// // // //                     fontSize: "12px",
// // // //                     color: "#64748b",
// // // //                     padding: "16px 0",
// // // //                   }}
// // // //                 >
// // // //                   লোড হচ্ছে...
// // // //                 </p>
// // // //               ) : historyData.length === 0 ? (
// // // //                 <p
// // // //                   style={{
// // // //                     textAlign: "center",
// // // //                     fontSize: "12px",
// // // //                     color: "#64748b",
// // // //                     padding: "16px 0",
// // // //                   }}
// // // //                 >
// // // //                   কোনো বেট হিস্ট্রি নেই।
// // // //                 </p>
// // // //               ) : (
// // // //                 <div
// // // //                   style={{
// // // //                     display: "flex",
// // // //                     flexDirection: "column",
// // // //                     gap: "10px",
// // // //                   }}
// // // //                 >
// // // //                   {historyData.map((item, index) => (
// // // //                     <div
// // // //                       key={index}
// // // //                       style={{
// // // //                         backgroundColor: "#020617",
// // // //                         border: "1px solid #1e293b",
// // // //                         padding: "12px",
// // // //                         borderRadius: "12px",
// // // //                         display: "flex",
// // // //                         justifyContent: "space-between",
// // // //                         alignItems: "center",
// // // //                       }}
// // // //                     >
// // // //                       <div
// // // //                         style={{
// // // //                           display: "flex",
// // // //                           flexDirection: "column",
// // // //                           gap: "4px",
// // // //                         }}
// // // //                       >
// // // //                         <span
// // // //                           style={{
// // // //                             fontFamily: "monospace",
// // // //                             color: "#cbd5e1",
// // // //                             fontWeight: "bold",
// // // //                             fontSize: "12px",
// // // //                           }}
// // // //                         >
// // // //                           {item.periodNumber}
// // // //                         </span>
// // // //                         <div
// // // //                           style={{
// // // //                             display: "flex",
// // // //                             gap: "8px",
// // // //                             fontSize: "10px",
// // // //                           }}
// // // //                         >
// // // //                           <span style={{ color: "#64748b" }}>
// // // //                             রেজাল্ট:{" "}
// // // //                             <span
// // // //                               style={{ fontWeight: "bold", color: "#60a5fa" }}
// // // //                             >
// // // //                               {item.winningNumber}
// // // //                             </span>
// // // //                           </span>
// // // //                         </div>
// // // //                         <span
// // // //                           style={{
// // // //                             fontSize: "10px",
// // // //                             color: "#94a3b8",
// // // //                             marginTop: "4px",
// // // //                           }}
// // // //                         >
// // // //                           চয়েস:{" "}
// // // //                           <span
// // // //                             style={{ fontWeight: "bold", color: "#fbbf24" }}
// // // //                           >
// // // //                             {item.userChoice}
// // // //                           </span>
// // // //                         </span>
// // // //                       </div>
// // // //                       <div
// // // //                         style={{
// // // //                           display: "flex",
// // // //                           flexDirection: "column",
// // // //                           alignItems: "flex-end",
// // // //                           gap: "4px",
// // // //                         }}
// // // //                       >
// // // //                         <p
// // // //                           style={{
// // // //                             fontWeight: "900",
// // // //                             fontSize: "12px",
// // // //                             padding: "2px 8px",
// // // //                             borderRadius: "4px",
// // // //                             margin: 0,
// // // //                             backgroundColor:
// // // //                               item.status === "win"
// // // //                                 ? "rgba(16,185,129,0.1)"
// // // //                                 : "rgba(244,63,94,0.1)",
// // // //                             color:
// // // //                               item.status === "win" ? "#34d399" : "#f43f5e",
// // // //                           }}
// // // //                         >
// // // //                           {item.status === "win"
// // // //                             ? `WIN ${item.multiplier}x`
// // // //                             : "LOSS"}
// // // //                         </p>
// // // //                         <p
// // // //                           style={{
// // // //                             fontSize: "10px",
// // // //                             color: "#64748b",
// // // //                             margin: 0,
// // // //                           }}
// // // //                         >
// // // //                           বাজি:{" "}
// // // //                           <span style={{ color: "white", fontWeight: "bold" }}>
// // // //                             ৳{item.betAmount}
// // // //                           </span>
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                   ))}
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }
// // // // /////////////////////////////////////////
// // // "use client";
// // // import { useState, useEffect } from "react";

// // // export default function CasinoRoulette() {
// // //   const [balance, setBalance] = useState(0);
// // //   const [loading, setLoading] = useState(true);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [message, setMessage] = useState(null);

// // //   // গেম স্টেট
// // //   const [currentPeriod, setCurrentPeriod] = useState("PER-10001");
// // //   const [timeLeft, setTimeLeft] = useState(0);
// // //   const [winPopup, setWinPopup] = useState(null);
// // //   const [recentResults, setRecentResults] = useState([]);

// // //   // বেট স্টেট
// // //   const [selectedBets, setSelectedBets] = useState([]);
// // //   const [betAmount, setBetAmount] = useState("");

// // //   // হিস্ট্রি স্টেট
// // //   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
// // //   const [historyData, setHistoryData] = useState([]);
// // //   const [historyLoading, setHistoryLoading] = useState(false);

// // //   // ১. ইউজার ডেটা লোড
// // //   const fetchUserData = async () => {
// // //     try {
// // //       const res = await fetch("/api/user/me", { credentials: "include" });
// // //       if (!res.ok) return;
// // //       const data = await res.json();
// // //       if (data.success) setBalance(data.user?.balance || 0);
// // //     } catch (err) {
// // //       console.error("User fetch error:", err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // ২. গেম স্টেট লোড
// // //   const fetchGameState = async () => {
// // //     try {
// // //       const res = await fetch("/api/game/newgame-state", {
// // //         credentials: "include",
// // //       });
// // //       if (!res.ok) return;
// // //       const data = await res.json();

// // //       if (data.success) {
// // //         setCurrentPeriod(data.periodNumber);
// // //         const end = new Date(data.endTime).getTime();
// // //         const now = new Date().getTime();
// // //         const diff = Math.max(0, Math.floor((end - now) / 1000));
// // //         setTimeLeft(diff);

// // //         if (data.recentResults) {
// // //           setRecentResults(data.recentResults);
// // //         }

// // //         // 🆕 উইন পপআপ লজিক (৫ সেকেন্ডের টাইমার রিমুভ করা হয়েছে)
// // //         if (data.userResult && data.userResult.status === "win") {
// // //           const roundId = data.userResult.round;
// // //           const shownRounds = JSON.parse(
// // //             localStorage.getItem("shownWinRounds") || "[]",
// // //           );

// // //           if (!shownRounds.includes(roundId)) {
// // //             setWinPopup(data.userResult);
// // //             // ❌ setTimeout(() => setWinPopup(null), 5000); -- এই লাইনটি মুছে ফেলা হয়েছে
// // //           }
// // //         }
// // //       }
// // //     } catch (err) {
// // //       console.error("State fetch error:", err);
// // //     }
// // //   };

// // //   // ৩. হিস্ট্রি লোড
// // //   const fetchHistory = async () => {
// // //     setIsHistoryOpen(true);
// // //     setHistoryLoading(true);
// // //     try {
// // //       const res = await fetch("/api/game/newgame-history", {
// // //         credentials: "include",
// // //       });
// // //       const data = await res.json();
// // //       if (data.success) setHistoryData(data.history || []);
// // //     } catch (err) {
// // //       console.error("History fetch error:", err);
// // //     } finally {
// // //       setHistoryLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchUserData();
// // //     fetchGameState();

// // //     const timer = setInterval(() => {
// // //       setTimeLeft((prev) => {
// // //         if (prev <= 1) {
// // //           fetchGameState();
// // //           fetchUserData();
// // //           return 0;
// // //         }
// // //         return prev - 1;
// // //       });
// // //     }, 1000);

// // //     return () => clearInterval(timer);
// // //   }, []);

// // //   // ৪. সিলেকশন টগল (ফ্রন্টএন্ড ভ্যালিডেশনসহ)
// // //   const toggleSelection = (type, selection) => {
// // //     if (timeLeft <= 5) {
// // //       return setMessage({
// // //         type: "error",
// // //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// // //       });
// // //     }

// // //     if (type === "odd" && selectedBets.some((b) => b.type === "even")) {
// // //       return setMessage({
// // //         type: "error",
// // //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// // //       });
// // //     }
// // //     if (type === "even" && selectedBets.some((b) => b.type === "odd")) {
// // //       return setMessage({
// // //         type: "error",
// // //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// // //       });
// // //     }
// // //     if (type === "red" && selectedBets.some((b) => b.type === "black")) {
// // //       return setMessage({
// // //         type: "error",
// // //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// // //       });
// // //     }
// // //     if (type === "black" && selectedBets.some((b) => b.type === "red")) {
// // //       return setMessage({
// // //         type: "error",
// // //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// // //       });
// // //     }

// // //     const dozenCount = selectedBets.filter((b) =>
// // //       ["1-12", "13-24", "25-36"].includes(b.type),
// // //     ).length;
// // //     if (
// // //       ["1-12", "13-24", "25-36"].includes(type) &&
// // //       dozenCount >= 2 &&
// // //       !isSelected(type, selection)
// // //     ) {
// // //       return setMessage({
// // //         type: "error",
// // //         text: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
// // //       });
// // //     }

// // //     setSelectedBets((prev) => {
// // //       const exists = prev.find(
// // //         (b) => b.type === type && b.selection === selection,
// // //       );
// // //       if (exists) {
// // //         return prev.filter(
// // //           (b) => !(b.type === type && b.selection === selection),
// // //         );
// // //       } else {
// // //         return [...prev, { type, selection }];
// // //       }
// // //     });
// // //   };

// // //   // ৫. বাজি প্লেস
// // //   const handleBet = async () => {
// // //     if (selectedBets.length === 0)
// // //       return setMessage({
// // //         type: "error",
// // //         text: "কমপক্ষে একটি অপশন সিলেক্ট করুন!",
// // //       });
// // //     const amount = Number(betAmount);
// // //     if (!amount || amount <= 0)
// // //       return setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন!" });

// // //     const totalCost = amount * selectedBets.length;
// // //     if (totalCost > balance)
// // //       return setMessage({ type: "error", text: "পর্যাপ্ত ব্যালেন্স নেই!" });
// // //     if (timeLeft <= 5)
// // //       return setMessage({
// // //         type: "error",
// // //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// // //       });

// // //     setSubmitting(true);
// // //     setMessage(null);

// // //     try {
// // //       const formattedBets = selectedBets.map((b) => ({
// // //         type: b.type,
// // //         selection: b.selection,
// // //         amount,
// // //       }));

// // //       const res = await fetch("/api/game/newgamebet", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         credentials: "include",
// // //         body: JSON.stringify({
// // //           bets: formattedBets,
// // //           periodNumber: currentPeriod,
// // //         }),
// // //       });
// // //       const data = await res.json();

// // //       if (data.success) {
// // //         setMessage({ type: "success", text: data.message });
// // //         setBalance(data.newBalance);
// // //         setBetAmount("");
// // //         setSelectedBets([]);

// // //         setTimeout(() => {
// // //           setMessage(null);
// // //         }, 3000);
// // //       } else {
// // //         setMessage({ type: "error", text: data.message });
// // //         setTimeout(() => {
// // //           setMessage(null);
// // //         }, 3000);
// // //       }
// // //     } catch (err) {
// // //       setMessage({ type: "error", text: "সার্ভার এরর!" });
// // //       setTimeout(() => {
// // //         setMessage(null);
// // //       }, 3000);
// // //     } finally {
// // //       setSubmitting(false);
// // //     }
// // //   };

// // //   const isSelected = (type, selection) => {
// // //     return selectedBets.some(
// // //       (b) => b.type === type && b.selection === selection,
// // //     );
// // //   };

// // //   // রুলেট নাম্বারের রঙ (লাল/কালো) - ক্যাসিনো স্টাইল
// // //   const getNumberColor = (num) => {
// // //     const redNumbers = [
// // //       1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// // //     ];
// // //     if (num === 0) return "#059669";
// // //     return redNumbers.includes(num) ? "#dc2626" : "#1e293b";
// // //   };

// // //   if (loading)
// // //     return (
// // //       <div
// // //         style={{
// // //           minHeight: "100vh",
// // //           backgroundColor: "#020617",
// // //           display: "flex",
// // //           alignItems: "center",
// // //           justifyContent: "center",
// // //           color: "white",
// // //         }}
// // //       >
// // //         <div
// // //           style={{
// // //             width: "48px",
// // //             height: "48px",
// // //             border: "4px solid #fbbf24",
// // //             borderTopColor: "transparent",
// // //             borderRadius: "50%",
// // //             animation: "spin 1s linear infinite",
// // //           }}
// // //         ></div>
// // //         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
// // //       </div>
// // //     );

// // //   return (
// // //     <div
// // //       style={{
// // //         minHeight: "100vh",
// // //         backgroundColor: "#020617",
// // //         backgroundImage:
// // //           "radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)",
// // //         padding: "16px",
// // //         color: "white",
// // //         display: "flex",
// // //         flexDirection: "column",
// // //         alignItems: "center",
// // //         paddingBottom: "100px",
// // //         fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
// // //       }}
// // //     >
// // //       {/* হেডার */}
// // //       <div
// // //         style={{
// // //           width: "100%",
// // //           maxWidth: "480px",
// // //           display: "flex",
// // //           justifyContent: "space-between",
// // //           alignItems: "center",
// // //           marginBottom: "16px",
// // //           padding: "0 8px",
// // //         }}
// // //       >
// // //         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
// // //           <div
// // //             style={{
// // //               width: "40px",
// // //               height: "40px",
// // //               borderRadius: "50%",
// // //               background: "linear-gradient(135deg, #fbbf24, #d97706)",
// // //               display: "flex",
// // //               alignItems: "center",
// // //               justifyContent: "center",
// // //               fontWeight: "bold",
// // //               color: "#000",
// // //               boxShadow: "0 0 15px rgba(245,158,11,0.4)",
// // //             }}
// // //           >
// // //             R
// // //           </div>
// // //           <div>
// // //             <p
// // //               style={{
// // //                 fontSize: "10px",
// // //                 color: "#94a3b8",
// // //                 margin: 0,
// // //                 textTransform: "uppercase",
// // //                 letterSpacing: "1px",
// // //               }}
// // //             >
// // //               পিরিয়ড
// // //             </p>
// // //             <p
// // //               style={{
// // //                 fontFamily: "monospace",
// // //                 color: "#fbbf24",
// // //                 fontWeight: "bold",
// // //                 fontSize: "14px",
// // //                 margin: 0,
// // //               }}
// // //             >
// // //               {currentPeriod}
// // //             </p>
// // //           </div>
// // //         </div>
// // //         <div
// // //           style={{
// // //             backgroundColor: "rgba(15, 23, 42, 0.8)",
// // //             padding: "8px 16px",
// // //             borderRadius: "12px",
// // //             border: "1px solid rgba(51, 65, 85, 0.5)",
// // //             textAlign: "right",
// // //           }}
// // //         >
// // //           <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// // //             ব্যালেন্স
// // //           </p>
// // //           <p
// // //             style={{
// // //               fontFamily: "monospace",
// // //               color: "#34d399",
// // //               fontWeight: "bold",
// // //               fontSize: "18px",
// // //               margin: 0,
// // //             }}
// // //           >
// // //             ৳{balance.toFixed(2)}
// // //           </p>
// // //         </div>
// // //       </div>

// // //       {/* টাইমার এবং হিস্ট্রি */}
// // //       <div
// // //         style={{
// // //           width: "100%",
// // //           maxWidth: "480px",
// // //           display: "flex",
// // //           gap: "12px",
// // //           marginBottom: "16px",
// // //         }}
// // //       >
// // //         <div
// // //           style={{
// // //             flex: 1,
// // //             background: "linear-gradient(90deg, #0f172a, #1e293b)",
// // //             padding: "12px",
// // //             borderRadius: "16px",
// // //             display: "flex",
// // //             alignItems: "center",
// // //             justifyContent: "space-between",
// // //             border: "1px solid rgba(51, 65, 85, 0.5)",
// // //           }}
// // //         >
// // //           <div>
// // //             <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// // //               টাইমার
// // //             </p>
// // //             <p
// // //               style={{
// // //                 fontFamily: "monospace",
// // //                 fontWeight: "900",
// // //                 fontSize: "24px",
// // //                 margin: 0,
// // //                 color: timeLeft <= 5 ? "#f43f5e" : "#34d399",
// // //                 textShadow:
// // //                   timeLeft <= 5 ? "0 0 10px #f43f5e" : "0 0 10px #34d399",
// // //               }}
// // //             >
// // //               00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
// // //             </p>
// // //           </div>
// // //           <button
// // //             onClick={fetchHistory}
// // //             style={{
// // //               backgroundColor: "rgba(51, 65, 85, 0.5)",
// // //               border: "none",
// // //               color: "#cbd5e1",
// // //               width: "40px",
// // //               height: "40px",
// // //               borderRadius: "10px",
// // //               cursor: "pointer",
// // //               display: "flex",
// // //               alignItems: "center",
// // //               justifyContent: "center",
// // //             }}
// // //           >
// // //             ⏱️
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* বাজি ধরার ফর্ম */}
// // //       <div
// // //         style={{
// // //           width: "100%",
// // //           maxWidth: "480px",
// // //           backgroundColor: "rgba(15, 23, 42, 0.8)",
// // //           padding: "16px",
// // //           borderRadius: "16px",
// // //           border: "1px solid rgba(51, 65, 85, 0.5)",
// // //           marginBottom: "16px",
// // //           backdropFilter: "blur(10px)",
// // //         }}
// // //       >
// // //         <div style={{ position: "relative" }}>
// // //           <span
// // //             style={{
// // //               position: "absolute",
// // //               left: "16px",
// // //               top: "50%",
// // //               transform: "translateY(-50%)",
// // //               color: "#fbbf24",
// // //               fontSize: "18px",
// // //             }}
// // //           >
// // //             ৳
// // //           </span>
// // //           <input
// // //             type="number"
// // //             value={betAmount}
// // //             onChange={(e) => setBetAmount(e.target.value)}
// // //             placeholder="পরিমাণ লিখুন"
// // //             disabled={timeLeft <= 5}
// // //             style={{
// // //               width: "100%",
// // //               backgroundColor: "#020617",
// // //               border: "1px solid #334155",
// // //               borderRadius: "12px",
// // //               padding: "14px 16px 14px 40px",
// // //               color: "white",
// // //               fontFamily: "monospace",
// // //               fontSize: "18px",
// // //               outline: "none",
// // //               boxSizing: "border-box",
// // //             }}
// // //           />
// // //         </div>

// // //         {selectedBets.length > 0 && betAmount > 0 && (
// // //           <div
// // //             style={{
// // //               display: "flex",
// // //               justifyContent: "space-between",
// // //               alignItems: "center",
// // //               marginTop: "12px",
// // //               padding: "0 4px",
// // //             }}
// // //           >
// // //             <span style={{ fontSize: "12px", color: "#94a3b8" }}>
// // //               সিলেকশন: {selectedBets.length} টি
// // //             </span>
// // //             <span
// // //               style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}
// // //             >
// // //               মোট খরচ: ৳{(Number(betAmount) * selectedBets.length).toFixed(2)}
// // //             </span>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* 🎯 ক্যাসিনো স্টাইল রুলেট বোর্ড */}
// // //       <div style={{ width: "100%", maxWidth: "480px", marginBottom: "24px" }}>
// // //         <div
// // //           style={{
// // //             display: "grid",
// // //             gridTemplateColumns: "1fr 1fr 1fr",
// // //             gap: "8px",
// // //             marginBottom: "8px",
// // //           }}
// // //         >
// // //           {[
// // //             { label: "1-12 (x3)", type: "1-12", sel: "1-12" },
// // //             { label: "13-24 (x3)", type: "13-24", sel: "13-24" },
// // //             { label: "25-36 (x3)", type: "25-36", sel: "25-36" },
// // //           ].map((item, idx) => {
// // //             const active = isSelected(item.type, item.sel);
// // //             return (
// // //               <button
// // //                 key={idx}
// // //                 onClick={() => toggleSelection(item.type, item.sel)}
// // //                 style={{
// // //                   padding: "10px",
// // //                   borderRadius: "8px",
// // //                   fontWeight: "bold",
// // //                   fontSize: "13px",
// // //                   border: "2px solid",
// // //                   borderColor: active ? "#fbbf24" : "rgba(51, 65, 85, 0.8)",
// // //                   backgroundColor: active
// // //                     ? "rgba(245, 158, 11, 0.9)"
// // //                     : "rgba(30, 41, 59, 0.8)",
// // //                   color: active ? "black" : "#cbd5e1",
// // //                   cursor: "pointer",
// // //                   transition: "all 0.2s",
// // //                   boxShadow: active ? "0 0 15px rgba(245,158,11,0.4)" : "none",
// // //                 }}
// // //               >
// // //                 {item.label}
// // //               </button>
// // //             );
// // //           })}
// // //         </div>

// // //         <div style={{ marginBottom: "8px" }}>
// // //           <button
// // //             onClick={() => toggleSelection("number", "0")}
// // //             style={{
// // //               width: "100%",
// // //               padding: "12px",
// // //               borderRadius: "8px",
// // //               fontWeight: "bold",
// // //               fontSize: "16px",
// // //               border: "2px solid",
// // //               borderColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
// // //               backgroundColor: isSelected("number", "0")
// // //                 ? "#fbbf24"
// // //                 : "#059669",
// // //               color: isSelected("number", "0") ? "black" : "white",
// // //               cursor: "pointer",
// // //               transition: "all 0.2s",
// // //               boxShadow: isSelected("number", "0")
// // //                 ? "0 0 15px rgba(245,158,11,0.6)"
// // //                 : "0 0 10px rgba(5,150,105,0.4)",
// // //             }}
// // //           >
// // //             0 (Zero)
// // //           </button>
// // //         </div>

// // //         <div
// // //           style={{
// // //             display: "grid",
// // //             gridTemplateColumns: "repeat(6, 1fr)",
// // //             gap: "6px",
// // //           }}
// // //         >
// // //           {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
// // //             const active = isSelected("number", String(num));
// // //             const bgColor = getNumberColor(num);
// // //             return (
// // //               <button
// // //                 key={num}
// // //                 onClick={() => toggleSelection("number", String(num))}
// // //                 style={{
// // //                   height: "48px",
// // //                   borderRadius: "8px",
// // //                   fontWeight: "bold",
// // //                   fontSize: "16px",
// // //                   border: active
// // //                     ? "3px solid #fbbf24"
// // //                     : "1px solid rgba(255,255,255,0.1)",
// // //                   backgroundColor: active ? "#fbbf24" : bgColor,
// // //                   color: active ? "black" : "white",
// // //                   cursor: "pointer",
// // //                   transition: "all 0.2s",
// // //                   boxShadow: active
// // //                     ? "0 0 20px rgba(245,158,11,0.6), inset 0 0 10px rgba(0,0,0,0.2)"
// // //                     : "inset 0 0 10px rgba(0,0,0,0.5)",
// // //                   display: "flex",
// // //                   alignItems: "center",
// // //                   justifyContent: "center",
// // //                   textShadow: active ? "none" : "1px 1px 2px rgba(0,0,0,0.8)",
// // //                 }}
// // //               >
// // //                 {num}
// // //               </button>
// // //             );
// // //           })}
// // //         </div>

// // //         <div
// // //           style={{
// // //             display: "grid",
// // //             gridTemplateColumns: "1fr 1fr",
// // //             gap: "8px",
// // //             marginTop: "8px",
// // //           }}
// // //         >
// // //           {[
// // //             { label: "Odd (x2)", type: "odd", sel: "odd" },
// // //             { label: "Even (x2)", type: "even", sel: "even" },
// // //             { label: "Red (x2)", type: "red", sel: "red" },
// // //             { label: "Black (x2)", type: "black", sel: "black" },
// // //           ].map((item, idx) => {
// // //             const active = isSelected(item.type, item.sel);
// // //             let activeBg = "rgba(245, 158, 11, 0.9)";
// // //             let activeBorder = "#fbbf24";
// // //             let activeShadow = "0 0 15px rgba(245,158,11,0.4)";

// // //             if (item.type === "red") {
// // //               activeBg = "#dc2626";
// // //               activeBorder = "#ef4444";
// // //               activeShadow = "0 0 15px rgba(220,38,38,0.6)";
// // //             } else if (item.type === "black") {
// // //               activeBg = "#1e293b";
// // //               activeBorder = "#334155";
// // //               activeShadow = "0 0 15px rgba(0,0,0,0.5)";
// // //             }

// // //             return (
// // //               <button
// // //                 key={idx}
// // //                 onClick={() => toggleSelection(item.type, item.sel)}
// // //                 style={{
// // //                   padding: "12px",
// // //                   borderRadius: "8px",
// // //                   fontWeight: "bold",
// // //                   fontSize: "14px",
// // //                   border: "2px solid",
// // //                   borderColor: active ? activeBorder : "rgba(51, 65, 85, 0.8)",
// // //                   backgroundColor: active ? activeBg : "rgba(30, 41, 59, 0.8)",
// // //                   color: active
// // //                     ? item.type === "black"
// // //                       ? "white"
// // //                       : "black"
// // //                     : "#cbd5e1",
// // //                   cursor: "pointer",
// // //                   transition: "all 0.2s",
// // //                   boxShadow: active ? activeShadow : "none",
// // //                 }}
// // //               >
// // //                 {item.label}
// // //               </button>
// // //             );
// // //           })}
// // //         </div>
// // //       </div>

// // //       {/* কনফার্ম বাটন */}
// // //       <div style={{ width: "100%", maxWidth: "480px" }}>
// // //         {message && (
// // //           <div
// // //             style={{
// // //               padding: "12px",
// // //               borderRadius: "12px",
// // //               fontSize: "14px",
// // //               fontWeight: "bold",
// // //               textAlign: "center",
// // //               marginBottom: "12px",
// // //               backgroundColor:
// // //                 message.type === "success"
// // //                   ? "rgba(6, 78, 59, 0.9)"
// // //                   : "rgba(136, 19, 55, 0.9)",
// // //               color: message.type === "success" ? "#34d399" : "#f87171",
// // //               border: "1px solid",
// // //               borderColor: message.type === "success" ? "#059669" : "#e11d48",
// // //             }}
// // //           >
// // //             {message.text}
// // //           </div>
// // //         )}
// // //         <button
// // //           onClick={handleBet}
// // //           disabled={submitting || timeLeft <= 5}
// // //           style={{
// // //             width: "100%",
// // //             background:
// // //               timeLeft <= 5
// // //                 ? "#334155"
// // //                 : "linear-gradient(to right, #f59e0b, #d97706)",
// // //             color: timeLeft <= 5 ? "#94a3b8" : "black",
// // //             fontWeight: "900",
// // //             padding: "18px",
// // //             borderRadius: "16px",
// // //             border: "none",
// // //             cursor: timeLeft <= 5 ? "not-allowed" : "pointer",
// // //             transition: "transform 0.1s",
// // //             boxShadow:
// // //               timeLeft <= 5
// // //                 ? "none"
// // //                 : "0 10px 25px -5px rgba(245, 158, 11, 0.5)",
// // //             fontSize: "16px",
// // //             letterSpacing: "1px",
// // //           }}
// // //         >
// // //           {timeLeft <= 5
// // //             ? "বাজি বন্ধ (অপেক্ষা করুন)"
// // //             : submitting
// // //               ? "প্রসেসিং..."
// // //               : `বাজি ধরুন (${selectedBets.length} টি)`}
// // //         </button>
// // //       </div>

// // //       {/* 🆕 সাম্প্রতিক রেজাল্ট কার্সেল */}
// // //       {recentResults.length > 0 && (
// // //         <div
// // //           style={{
// // //             width: "100%",
// // //             maxWidth: "480px",
// // //             display: "flex",
// // //             alignItems: "center",
// // //             gap: "8px",
// // //             marginTop: "16px",
// // //             overflowX: "auto",
// // //             paddingBottom: "4px",
// // //             scrollbarWidth: "none",
// // //           }}
// // //         >
// // //           <span
// // //             style={{
// // //               fontSize: "10px",
// // //               color: "#94a3b8",
// // //               whiteSpace: "nowrap",
// // //               fontWeight: "bold",
// // //             }}
// // //           >
// // //             সাম্প্রতিক:
// // //           </span>
// // //           <div style={{ display: "flex", gap: "6px" }}>
// // //             {recentResults.map((num, idx) => (
// // //               <div
// // //                 key={idx}
// // //                 style={{
// // //                   width: "32px",
// // //                   height: "32px",
// // //                   borderRadius: "50%",
// // //                   display: "flex",
// // //                   alignItems: "center",
// // //                   justifyContent: "center",
// // //                   fontWeight: "bold",
// // //                   fontSize: "12px",
// // //                   flexShrink: 0,
// // //                   backgroundColor: getNumberColor(num),
// // //                   color: "white",
// // //                   border: "2px solid rgba(255,255,255,0.1)",
// // //                   boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
// // //                   textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
// // //                 }}
// // //               >
// // //                 {num}
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* 🏆 উইন পপআপ */}
// // //       {winPopup && (
// // //         <div
// // //           style={{
// // //             position: "fixed",
// // //             top: 0,
// // //             left: 0,
// // //             right: 0,
// // //             bottom: 0,
// // //             backgroundColor: "rgba(0,0,0,0.85)",
// // //             backdropFilter: "blur(5px)",
// // //             display: "flex",
// // //             alignItems: "center",
// // //             justifyContent: "center",
// // //             zIndex: 50,
// // //             padding: "16px",
// // //           }}
// // //         >
// // //           <div
// // //             style={{
// // //               background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)",
// // //               border: "2px solid #10b981",
// // //               borderRadius: "24px",
// // //               padding: "32px 24px",
// // //               maxWidth: "360px",
// // //               width: "100%",
// // //               textAlign: "center",
// // //               position: "relative",
// // //               overflow: "hidden",
// // //               boxShadow: "0 0 50px rgba(16,185,129,0.3)",
// // //             }}
// // //           >
// // //             <div
// // //               style={{
// // //                 position: "absolute",
// // //                 top: "-50px",
// // //                 left: "50%",
// // //                 transform: "translateX(-50%)",
// // //                 width: "200px",
// // //                 height: "200px",
// // //                 background:
// // //                   "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
// // //                 zIndex: 0,
// // //               }}
// // //             ></div>

// // //             <div style={{ position: "relative", zIndex: 1 }}>
// // //               <div
// // //                 style={{
// // //                   width: "90px",
// // //                   height: "90px",
// // //                   background: "linear-gradient(135deg, #34d399, #059669)",
// // //                   borderRadius: "50%",
// // //                   display: "flex",
// // //                   alignItems: "center",
// // //                   justifyContent: "center",
// // //                   margin: "0 auto 16px auto",
// // //                   border: "4px solid #020617",
// // //                   boxShadow: "0 0 30px rgba(16,185,129,0.5)",
// // //                 }}
// // //               >
// // //                 <span style={{ fontSize: "48px" }}>👑</span>
// // //               </div>

// // //               <h2
// // //                 style={{
// // //                   fontSize: "28px",
// // //                   fontWeight: "900",
// // //                   color: "#34d399",
// // //                   margin: "0 0 8px 0",
// // //                   textShadow: "0 2px 10px rgba(52,211,153,0.5)",
// // //                 }}
// // //               >
// // //                 অভিনন্দন!
// // //               </h2>
// // //               <p
// // //                 style={{
// // //                   color: "#cbd5e1",
// // //                   margin: "0 0 24px 0",
// // //                   fontSize: "14px",
// // //                 }}
// // //               >
// // //                 আপনি এই রাউন্ডে জিতেছেন!
// // //               </p>

// // //               <div
// // //                 style={{
// // //                   backgroundColor: "rgba(2, 6, 23, 0.8)",
// // //                   border: "1px solid #334155",
// // //                   borderRadius: "16px",
// // //                   padding: "16px",
// // //                   marginBottom: "24px",
// // //                   textAlign: "left",
// // //                 }}
// // //               >
// // //                 <div
// // //                   style={{
// // //                     display: "flex",
// // //                     justifyContent: "space-between",
// // //                     marginBottom: "12px",
// // //                     fontSize: "14px",
// // //                   }}
// // //                 >
// // //                   <span style={{ color: "#94a3b8" }}>উইনিং নাম্বার:</span>
// // //                   <span
// // //                     style={{
// // //                       fontWeight: "bold",
// // //                       color: "white",
// // //                       fontFamily: "monospace",
// // //                       backgroundColor: getNumberColor(
// // //                         Number(winPopup.winningNumber),
// // //                       ),
// // //                       padding: "2px 8px",
// // //                       borderRadius: "4px",
// // //                     }}
// // //                   >
// // //                     {winPopup.winningNumber}
// // //                   </span>
// // //                 </div>
// // //                 <div
// // //                   style={{
// // //                     display: "flex",
// // //                     justifyContent: "space-between",
// // //                     marginBottom: "12px",
// // //                     fontSize: "14px",
// // //                   }}
// // //                 >
// // //                   <span style={{ color: "#94a3b8" }}>মাল্টিপ্লায়ার:</span>
// // //                   <span
// // //                     style={{
// // //                       fontWeight: "900",
// // //                       color: "#fbbf24",
// // //                       backgroundColor: "rgba(245,158,11,0.1)",
// // //                       padding: "2px 8px",
// // //                       borderRadius: "4px",
// // //                     }}
// // //                   >
// // //                     {winPopup.multiplier}x
// // //                   </span>
// // //                 </div>
// // //                 <div
// // //                   style={{ borderTop: "1px solid #1e293b", margin: "12px 0" }}
// // //                 ></div>
// // //                 <div
// // //                   style={{
// // //                     display: "flex",
// // //                     justifyContent: "space-between",
// // //                     alignItems: "center",
// // //                   }}
// // //                 >
// // //                   <span style={{ color: "#94a3b8", fontWeight: "bold" }}>
// // //                     প্রাইজ মানি:
// // //                   </span>
// // //                   <span
// // //                     style={{
// // //                       fontWeight: "900",
// // //                       color: "#34d399",
// // //                       fontSize: "28px",
// // //                       textShadow: "0 0 15px rgba(52,211,153,0.4)",
// // //                     }}
// // //                   >
// // //                     ৳{winPopup.payout}
// // //                   </span>
// // //                 </div>
// // //               </div>

// // //               {/* 🆕 এখানে ক্লিক করলেই কেবল পপআপ বন্ধ হবে এবং লোকাল স্টোরেজে সেভ হবে */}
// // //               <button
// // //                 onClick={() => {
// // //                   const roundId = winPopup.round;
// // //                   const shownRounds = JSON.parse(
// // //                     localStorage.getItem("shownWinRounds") || "[]",
// // //                   );
// // //                   localStorage.setItem(
// // //                     "shownWinRounds",
// // //                     JSON.stringify([...shownRounds, roundId]),
// // //                   );
// // //                   setWinPopup(null);
// // //                 }}
// // //                 style={{
// // //                   width: "100%",
// // //                   background: "linear-gradient(to right, #059669, #047857)",
// // //                   color: "white",
// // //                   fontWeight: "bold",
// // //                   padding: "16px",
// // //                   borderRadius: "12px",
// // //                   border: "none",
// // //                   cursor: "pointer",
// // //                   fontSize: "16px",
// // //                   boxShadow: "0 5px 15px rgba(5,150,105,0.3)",
// // //                 }}
// // //               >
// // //                 দুর্দান্ত! ধন্যবাদ
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* বেট হিস্ট্রি পপআপ */}
// // //       {isHistoryOpen && (
// // //         <div
// // //           style={{
// // //             position: "fixed",
// // //             top: 0,
// // //             left: 0,
// // //             right: 0,
// // //             bottom: 0,
// // //             backgroundColor: "rgba(0,0,0,0.85)",
// // //             backdropFilter: "blur(5px)",
// // //             display: "flex",
// // //             alignItems: "center",
// // //             justifyContent: "center",
// // //             zIndex: 50,
// // //             padding: "16px",
// // //           }}
// // //         >
// // //           <div
// // //             style={{
// // //               backgroundColor: "#0f172a",
// // //               border: "1px solid #334155",
// // //               borderRadius: "16px",
// // //               width: "100%",
// // //               maxWidth: "420px",
// // //               maxHeight: "80vh",
// // //               display: "flex",
// // //               flexDirection: "column",
// // //               overflow: "hidden",
// // //               boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
// // //             }}
// // //           >
// // //             <div
// // //               style={{
// // //                 display: "flex",
// // //                 justifyContent: "space-between",
// // //                 alignItems: "center",
// // //                 padding: "16px",
// // //                 borderBottom: "1px solid #1e293b",
// // //                 backgroundColor: "rgba(2, 6, 23, 0.5)",
// // //               }}
// // //             >
// // //               <h2
// // //                 style={{
// // //                   fontSize: "14px",
// // //                   fontWeight: "bold",
// // //                   color: "#fbbf24",
// // //                   margin: 0,
// // //                   display: "flex",
// // //                   alignItems: "center",
// // //                   gap: "8px",
// // //                 }}
// // //               >
// // //                 ⏱️ বেট হিস্ট্রি
// // //               </h2>
// // //               <button
// // //                 onClick={() => setIsHistoryOpen(false)}
// // //                 style={{
// // //                   width: "32px",
// // //                   height: "32px",
// // //                   display: "flex",
// // //                   alignItems: "center",
// // //                   justifyContent: "center",
// // //                   borderRadius: "8px",
// // //                   backgroundColor: "#1e293b",
// // //                   color: "#94a3b8",
// // //                   border: "none",
// // //                   cursor: "pointer",
// // //                 }}
// // //               >
// // //                 ✕
// // //               </button>
// // //             </div>

// // //             <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
// // //               {historyLoading ? (
// // //                 <p
// // //                   style={{
// // //                     textAlign: "center",
// // //                     fontSize: "12px",
// // //                     color: "#64748b",
// // //                     padding: "16px 0",
// // //                   }}
// // //                 >
// // //                   লোড হচ্ছে...
// // //                 </p>
// // //               ) : historyData.length === 0 ? (
// // //                 <p
// // //                   style={{
// // //                     textAlign: "center",
// // //                     fontSize: "12px",
// // //                     color: "#64748b",
// // //                     padding: "16px 0",
// // //                   }}
// // //                 >
// // //                   কোনো বেট হিস্ট্রি নেই।
// // //                 </p>
// // //               ) : (
// // //                 <div
// // //                   style={{
// // //                     display: "flex",
// // //                     flexDirection: "column",
// // //                     gap: "10px",
// // //                   }}
// // //                 >
// // //                   {/* 🆕 বেট হিস্ট্রি রেন্ডারিং সম্পূর্ণ আপডেট করা হয়েছে */}
// // //                   {historyData.map((item, index) => {
// // //                     const actualNumber =
// // //                       item.winningNumber !== undefined &&
// // //                       item.winningNumber !== null
// // //                         ? item.winningNumber
// // //                         : "N/A";

// // //                     const isWin = item.status === "win";
// // //                     const payoutAmount = item.payout || 0;
// // //                     const betAmount = item.betAmount || 0;

// // //                     return (
// // //                       <div
// // //                         key={index}
// // //                         style={{
// // //                           backgroundColor: "#020617",
// // //                           border: "1px solid #1e293b",
// // //                           padding: "12px",
// // //                           borderRadius: "12px",
// // //                           display: "flex",
// // //                           justifyContent: "space-between",
// // //                           alignItems: "center",
// // //                         }}
// // //                       >
// // //                         <div
// // //                           style={{
// // //                             display: "flex",
// // //                             flexDirection: "column",
// // //                             gap: "4px",
// // //                           }}
// // //                         >
// // //                           <span
// // //                             style={{
// // //                               fontFamily: "monospace",
// // //                               color: "#cbd5e1",
// // //                               fontWeight: "bold",
// // //                               fontSize: "12px",
// // //                             }}
// // //                           >
// // //                             {item.periodNumber}
// // //                           </span>
// // //                           <div
// // //                             style={{
// // //                               display: "flex",
// // //                               gap: "8px",
// // //                               fontSize: "10px",
// // //                             }}
// // //                           >
// // //                             <span style={{ color: "#64748b" }}>
// // //                               রেজাল্ট:{" "}
// // //                               <span
// // //                                 style={{
// // //                                   fontWeight: "bold",
// // //                                   color: "#60a5fa",
// // //                                 }}
// // //                               >
// // //                                 {actualNumber}
// // //                               </span>
// // //                             </span>
// // //                           </div>
// // //                           <span
// // //                             style={{
// // //                               fontSize: "10px",
// // //                               color: "#94a3b8",
// // //                               marginTop: "4px",
// // //                             }}
// // //                           >
// // //                             চয়েস:{" "}
// // //                             <span
// // //                               style={{ fontWeight: "bold", color: "#fbbf24" }}
// // //                             >
// // //                               {item.userChoice || "N/A"}
// // //                             </span>
// // //                           </span>
// // //                         </div>

// // //                         <div
// // //                           style={{
// // //                             display: "flex",
// // //                             flexDirection: "column",
// // //                             alignItems: "flex-end",
// // //                             gap: "4px",
// // //                           }}
// // //                         >
// // //                           <p
// // //                             style={{
// // //                               fontWeight: "900",
// // //                               fontSize: "12px",
// // //                               padding: "2px 8px",
// // //                               borderRadius: "4px",
// // //                               margin: 0,
// // //                               backgroundColor: isWin
// // //                                 ? "rgba(16,185,129,0.1)"
// // //                                 : "rgba(244,63,94,0.1)",
// // //                               color: isWin ? "#34d399" : "#f43f5e",
// // //                             }}
// // //                           >
// // //                             {isWin ? `WIN ${item.multiplier}x` : "LOSS"}
// // //                           </p>

// // //                           <div
// // //                             style={{
// // //                               display: "flex",
// // //                               gap: "8px",
// // //                               fontSize: "11px",
// // //                               margin: 0,
// // //                               alignItems: "center",
// // //                               marginTop: "4px",
// // //                             }}
// // //                           >
// // //                             <span style={{ color: "#64748b" }}>
// // //                               বাজি:{" "}
// // //                               <span
// // //                                 style={{ color: "white", fontWeight: "bold" }}
// // //                               >
// // //                                 ৳{betAmount}
// // //                               </span>
// // //                             </span>

// // //                             {isWin && (
// // //                               <span
// // //                                 style={{
// // //                                   color: "#34d399",
// // //                                   fontWeight: "bold",
// // //                                   backgroundColor: "rgba(52,211,153,0.1)",
// // //                                   padding: "2px 6px",
// // //                                   borderRadius: "4px",
// // //                                 }}
// // //                               >
// // //                                 +৳{payoutAmount}
// // //                               </span>
// // //                             )}
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                     );
// // //                   })}
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // // ////////////////////////////////////////////////
// // "use client";
// // import { useState, useEffect } from "react";

// // export default function CasinoRoulette() {
// //   const [balance, setBalance] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [message, setMessage] = useState(null);

// //   // গেম স্টেট
// //   const [currentPeriod, setCurrentPeriod] = useState("PER-10001");
// //   const [timeLeft, setTimeLeft] = useState(0);
// //   const [winPopup, setWinPopup] = useState(null);
// //   const [recentResults, setRecentResults] = useState([]);
  
// //   // 🆕 পপআপ কন্ট্রোল করার জন্য লোকাল স্টেট
// //   const [dismissedPopups, setDismissedPopups] = useState([]);

// //   // বেট স্টেট
// //   const [selectedBets, setSelectedBets] = useState([]);
// //   const [betAmount, setBetAmount] = useState("");

// //   // হিস্ট্রি স্টেট
// //   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
// //   const [historyData, setHistoryData] = useState([]);
// //   const [historyLoading, setHistoryLoading] = useState(false);

// //   // ১. ইউজার ডেটা লোড
// //   const fetchUserData = async () => {
// //     try {
// //       const res = await fetch("/api/user/me", { credentials: "include" });
// //       if (!res.ok) return;
// //       const data = await res.json();
// //       if (data.success) setBalance(data.user?.balance || 0);
// //     } catch (err) {
// //       console.error("User fetch error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ২. গেম স্টেট লোড
// //   const fetchGameState = async () => {
// //     try {
// //       const res = await fetch("/api/game/newgame-state", {
// //         credentials: "include",
// //       });
// //       if (!res.ok) return;
// //       const data = await res.json();

// //       if (data.success) {
// //         setCurrentPeriod(data.periodNumber);
// //         const end = new Date(data.endTime).getTime();
// //         const now = new Date().getTime();
// //         const diff = Math.max(0, Math.floor((end - now) / 1000));
// //         setTimeLeft(diff);

// //         if (data.recentResults) {
// //           setRecentResults(data.recentResults);
// //         }

// //         // 🆕 শতভাগ শিউর পপআপ লজিক (localStorage নেই, শুধু State)
// //         if (data.userResult && data.userResult.status === "win") {
// //           const roundId = data.userResult.round;
          
// //           // যদি ইউজার আগে "ধন্যবাদ" না চেপে থাকে, তবে পপআপ দেখাবে
// //           if (!dismissedPopups.includes(roundId)) {
// //             setWinPopup(data.userResult);
// //           }
// //         }
// //       }
// //     } catch (err) {
// //       console.error("State fetch error:", err);
// //     }
// //   };

// //   // ৩. হিস্ট্রি লোড
// //   const fetchHistory = async () => {
// //     setIsHistoryOpen(true);
// //     setHistoryLoading(true);
// //     try {
// //       const res = await fetch("/api/game/newgame-history", {
// //         credentials: "include",
// //       });
// //       const data = await res.json();
// //       if (data.success) setHistoryData(data.history || []);
// //     } catch (err) {
// //       console.error("History fetch error:", err);
// //     } finally {
// //       setHistoryLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchUserData();
// //     fetchGameState();

// //     const timer = setInterval(() => {
// //       setTimeLeft((prev) => {
// //         if (prev <= 1) {
// //           fetchGameState();
// //           fetchUserData();
// //           return 0;
// //         }
// //         return prev - 1;
// //       });
// //     }, 1000);

// //     return () => clearInterval(timer);
// //   }, [dismissedPopups]); // 🆕 dismissedPopups-এর উপর নির্ভর করবে

// //   // ৪. সিলেকশন টগল (ফ্রন্টএন্ড ভ্যালিডেশনসহ)
// //   const toggleSelection = (type, selection) => {
// //     if (timeLeft <= 5) {
// //       return setMessage({
// //         type: "error",
// //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// //       });
// //     }

// //     if (type === "odd" && selectedBets.some((b) => b.type === "even")) {
// //       return setMessage({
// //         type: "error",
// //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// //       });
// //     }
// //     if (type === "even" && selectedBets.some((b) => b.type === "odd")) {
// //       return setMessage({
// //         type: "error",
// //         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
// //       });
// //     }
// //     if (type === "red" && selectedBets.some((b) => b.type === "black")) {
// //       return setMessage({
// //         type: "error",
// //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// //       });
// //     }
// //     if (type === "black" && selectedBets.some((b) => b.type === "red")) {
// //       return setMessage({
// //         type: "error",
// //         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
// //       });
// //     }
    

// //     const dozenCount = selectedBets.filter((b) =>
// //       ["1-12", "13-24", "25-36"].includes(b.type),
// //     ).length;
// //     if (
// //       ["1-12", "13-24", "25-36"].includes(type) &&
// //       dozenCount >= 2 &&
// //       !isSelected(type, selection)
// //     ) {
// //       return setMessage({
// //         type: "error",
// //         text: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
// //       });
// //     }

// //     setSelectedBets((prev) => {
// //       const exists = prev.find(
// //         (b) => b.type === type && b.selection === selection,
// //       );
// //       if (exists) {
// //         return prev.filter(
// //           (b) => !(b.type === type && b.selection === selection),
// //         );
// //       } else {
// //         return [...prev, { type, selection }];
// //       }
// //     });
// //   };

// //   // ৫. বাজি প্লেস
// //   const handleBet = async () => {
// //     if (selectedBets.length === 0)
// //       return setMessage({
// //         type: "error",
// //         text: "কমপক্ষে একটি অপশন সিলেক্ট করুন!",
// //       });
// //     const amount = Number(betAmount);
// //     if (!amount || amount <= 0)
// //       return setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন!" });

// //     const totalCost = amount * selectedBets.length;
// //     if (totalCost > balance)
// //       return setMessage({ type: "error", text: "পর্যাপ্ত ব্যালেন্স নেই!" });
// //     if (timeLeft <= 5)
// //       return setMessage({
// //         type: "error",
// //         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
// //       });

// //     setSubmitting(true);
// //     setMessage(null);

// //     try {
// //       const formattedBets = selectedBets.map((b) => ({
// //         type: b.type,
// //         selection: b.selection,
// //         amount,
// //       }));

// //       const res = await fetch("/api/game/newgamebet", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({
// //           bets: formattedBets,
// //           periodNumber: currentPeriod,
// //         }),
// //       });
// //       const data = await res.json();

// //       if (data.success) {
// //         setMessage({ type: "success", text: data.message });
// //         setBalance(data.newBalance);
// //         setBetAmount("");
// //         setSelectedBets([]);

// //         setTimeout(() => {
// //           setMessage(null);
// //         }, 3000);
// //       } else {
// //         setMessage({ type: "error", text: data.message });
// //         setTimeout(() => {
// //           setMessage(null);
// //         }, 3000);
// //       }
// //     } catch (err) {
// //       setMessage({ type: "error", text: "সার্ভার এরর!" });
// //       setTimeout(() => {
// //         setMessage(null);
// //       }, 3000);
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const isSelected = (type, selection) => {
// //     return selectedBets.some(
// //       (b) => b.type === type && b.selection === selection,
// //     );
// //   };

// //   // রুলেট নাম্বারের রঙ (লাল/কালো) - ক্যাসিনো স্টাইল
// //   const getNumberColor = (num) => {
// //     const redNumbers = [
// //       1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
// //     ];
// //     if (num === 0) return "#059669";
// //     return redNumbers.includes(num) ? "#dc2626" : "#1e293b";
// //   };

// //   if (loading)
// //     return (
// //       <div
// //         style={{
// //           minHeight: "100vh",
// //           backgroundColor: "#020617",
// //           display: "flex",
// //           alignItems: "center",
// //           justifyContent: "center",
// //           color: "white",
// //         }}
// //       >
// //         <div
// //           style={{
// //             width: "48px",
// //             height: "48px",
// //             border: "4px solid #fbbf24",
// //             borderTopColor: "transparent",
// //             borderRadius: "50%",
// //             animation: "spin 1s linear infinite",
// //           }}
// //         ></div>
// //         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
// //       </div>
// //     );

// //   return (
// //     <div
// //       style={{
// //         minHeight: "100vh",
// //         backgroundColor: "#020617",
// //         backgroundImage:
// //           "radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)",
// //         padding: "16px",
// //         color: "white",
// //         display: "flex",
// //         flexDirection: "column",
// //         alignItems: "center",
// //         paddingBottom: "100px",
// //         fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
// //       }}
// //     >
// //       {/* হেডার */}
// //       <div
// //         style={{
// //           width: "100%",
// //           maxWidth: "480px",
// //           display: "flex",
// //           justifyContent: "space-between",
// //           alignItems: "center",
// //           marginBottom: "16px",
// //           padding: "0 8px",
// //         }}
// //       >
// //         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
// //           <div
// //             style={{
// //               width: "40px",
// //               height: "40px",
// //               borderRadius: "50%",
// //               background: "linear-gradient(135deg, #fbbf24, #d97706)",
// //               display: "flex",
// //               alignItems: "center",
// //               justifyContent: "center",
// //               fontWeight: "bold",
// //               color: "#000",
// //               boxShadow: "0 0 15px rgba(245,158,11,0.4)",
// //             }}
// //           >
// //             R
// //           </div>
// //           <div>
// //             <p
// //               style={{
// //                 fontSize: "10px",
// //                 color: "#94a3b8",
// //                 margin: 0,
// //                 textTransform: "uppercase",
// //                 letterSpacing: "1px",
// //               }}
// //             >
// //               পিরিয়ড
// //             </p>
// //             <p
// //               style={{
// //                 fontFamily: "monospace",
// //                 color: "#fbbf24",
// //                 fontWeight: "bold",
// //                 fontSize: "14px",
// //                 margin: 0,
// //               }}
// //             >
// //               {currentPeriod}
// //             </p>
// //           </div>
// //         </div>
// //         <div
// //           style={{
// //             backgroundColor: "rgba(15, 23, 42, 0.8)",
// //             padding: "8px 16px",
// //             borderRadius: "12px",
// //             border: "1px solid rgba(51, 65, 85, 0.5)",
// //             textAlign: "right",
// //           }}
// //         >
// //           <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// //             ব্যালেন্স
// //           </p>
// //           <p
// //             style={{
// //               fontFamily: "monospace",
// //               color: "#34d399",
// //               fontWeight: "bold",
// //               fontSize: "18px",
// //               margin: 0,
// //             }}
// //           >
// //             ৳{balance.toFixed(2)}
// //           </p>
// //         </div>
// //       </div>

// //       {/* টাইমার এবং হিস্ট্রি */}
// //       <div
// //         style={{
// //           width: "100%",
// //           maxWidth: "480px",
// //           display: "flex",
// //           gap: "12px",
// //           marginBottom: "16px",
// //         }}
// //       >
// //         <div
// //           style={{
// //             flex: 1,
// //             background: "linear-gradient(90deg, #0f172a, #1e293b)",
// //             padding: "12px",
// //             borderRadius: "16px",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "space-between",
// //             border: "1px solid rgba(51, 65, 85, 0.5)",
// //           }}
// //         >
// //           <div>
// //             <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
// //               টাইমার
// //             </p>
// //             <p
// //               style={{
// //                 fontFamily: "monospace",
// //                 fontWeight: "900",
// //                 fontSize: "24px",
// //                 margin: 0,
// //                 color: timeLeft <= 5 ? "#f43f5e" : "#34d399",
// //                 textShadow:
// //                   timeLeft <= 5 ? "0 0 10px #f43f5e" : "0 0 10px #34d399",
// //               }}
// //             >
// //               00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
// //             </p>
// //           </div>
// //           <button
// //             onClick={fetchHistory}
// //             style={{
// //               backgroundColor: "rgba(51, 65, 85, 0.5)",
// //               border: "none",
// //               color: "#cbd5e1",
// //               width: "40px",
// //               height: "40px",
// //               borderRadius: "10px",
// //               cursor: "pointer",
// //               display: "flex",
// //               alignItems: "center",
// //               justifyContent: "center",
// //             }}
// //           >
// //             ⏱️
// //           </button>
// //         </div>
// //       </div>

// //       {/* বাজি ধরার ফর্ম */}
// //       <div
// //         style={{
// //           width: "100%",
// //           maxWidth: "480px",
// //           backgroundColor: "rgba(15, 23, 42, 0.8)",
// //           padding: "16px",
// //           borderRadius: "16px",
// //           border: "1px solid rgba(51, 65, 85, 0.5)",
// //           marginBottom: "16px",
// //           backdropFilter: "blur(10px)",
// //         }}
// //       >
// //         <div style={{ position: "relative" }}>
// //           <span
// //             style={{
// //               position: "absolute",
// //               left: "16px",
// //               top: "50%",
// //               transform: "translateY(-50%)",
// //               color: "#fbbf24",
// //               fontSize: "18px",
// //             }}
// //           >
// //             ৳
// //           </span>
// //           <input
// //             type="number"
// //             value={betAmount}
// //             onChange={(e) => setBetAmount(e.target.value)}
// //             placeholder="পরিমাণ লিখুন"
// //             disabled={timeLeft <= 5}
// //             style={{
// //               width: "100%",
// //               backgroundColor: "#020617",
// //               border: "1px solid #334155",
// //               borderRadius: "12px",
// //               padding: "14px 16px 14px 40px",
// //               color: "white",
// //               fontFamily: "monospace",
// //               fontSize: "18px",
// //               outline: "none",
// //               boxSizing: "border-box",
// //             }}
// //           />
// //         </div>

// //         {selectedBets.length > 0 && betAmount > 0 && (
// //           <div
// //             style={{
// //               display: "flex",
// //               justifyContent: "space-between",
// //               alignItems: "center",
// //               marginTop: "12px",
// //               padding: "0 4px",
// //             }}
// //           >
// //             <span style={{ fontSize: "12px", color: "#94a3b8" }}>
// //               সিলেকশন: {selectedBets.length} টি
// //             </span>
// //             <span
// //               style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}
// //             >
// //               মোট খরচ: ৳{(Number(betAmount) * selectedBets.length).toFixed(2)}
// //             </span>
// //           </div>
// //         )}
// //       </div>

// //       {/* 🎯 ক্যাসিনো স্টাইল রুলেট বোর্ড
// //       <div style={{ width: "100%", maxWidth: "480px", marginBottom: "24px" }}>
// //         <div
// //           style={{
// //             display: "grid",
// //             gridTemplateColumns: "1fr 1fr 1fr",
// //             gap: "8px",
// //             marginBottom: "8px",
// //           }}
// //         >
// //           {[
// //             { label: "1-12 (x3)", type: "1-12", sel: "1-12" },
// //             { label: "13-24 (x3)", type: "13-24", sel: "13-24" },
// //             { label: "25-36 (x3)", type: "25-36", sel: "25-36" },
// //           ].map((item, idx) => {
// //             const active = isSelected(item.type, item.sel);
// //             return (
// //               <button
// //                 key={idx}
// //                 onClick={() => toggleSelection(item.type, item.sel)}
// //                 style={{
// //                   padding: "10px",
// //                   borderRadius: "8px",
// //                   fontWeight: "bold",
// //                   fontSize: "13px",
// //                   border: "2px solid",
// //                   borderColor: active ? "#fbbf24" : "rgba(51, 65, 85, 0.8)",
// //                   backgroundColor: active
// //                     ? "rgba(245, 158, 11, 0.9)"
// //                     : "rgba(30, 41, 59, 0.8)",
// //                   color: active ? "black" : "#cbd5e1",
// //                   cursor: "pointer",
// //                   transition: "all 0.2s",
// //                   boxShadow: active ? "0 0 15px rgba(245,158,11,0.4)" : "none",
// //                 }}
// //               >
// //                 {item.label}
// //               </button>
// //             );
// //           })}
// //         </div>

// //         <div style={{ marginBottom: "8px" }}>
// //           <button
// //             onClick={() => toggleSelection("number", "0")}
// //             style={{
// //               width: "100%",
// //               padding: "12px",
// //               borderRadius: "8px",
// //               fontWeight: "bold",
// //               fontSize: "16px",
// //               border: "2px solid",
// //               borderColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
// //               backgroundColor: isSelected("number", "0")
// //                 ? "#fbbf24"
// //                 : "#059669",
// //               color: isSelected("number", "0") ? "black" : "white",
// //               cursor: "pointer",
// //               transition: "all 0.2s",
// //               boxShadow: isSelected("number", "0")
// //                 ? "0 0 15px rgba(245,158,11,0.6)"
// //                 : "0 0 10px rgba(5,150,105,0.4)",
// //             }}
// //           >
// //             0 (Zero)
// //           </button>
// //         </div>

// //         <div
// //           style={{
// //             display: "grid",
// //             gridTemplateColumns: "repeat(6, 1fr)",
// //             gap: "6px",
// //           }}
// //         >
// //           {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
// //             const active = isSelected("number", String(num));
// //             const bgColor = getNumberColor(num);
// //             return (
// //               <button
// //                 key={num}
// //                 onClick={() => toggleSelection("number", String(num))}
// //                 style={{
// //                   height: "48px",
// //                   borderRadius: "8px",
// //                   fontWeight: "bold",
// //                   fontSize: "16px",
// //                   border: active
// //                     ? "3px solid #fbbf24"
// //                     : "1px solid rgba(255,255,255,0.1)",
// //                   backgroundColor: active ? "#fbbf24" : bgColor,
// //                   color: active ? "black" : "white",
// //                   cursor: "pointer",
// //                   transition: "all 0.2s",
// //                   boxShadow: active
// //                     ? "0 0 20px rgba(245,158,11,0.6), inset 0 0 10px rgba(0,0,0,0.2)"
// //                     : "inset 0 0 10px rgba(0,0,0,0.5)",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "center",
// //                   textShadow: active ? "none" : "1px 1px 2px rgba(0,0,0,0.8)",
// //                 }}
// //               >
// //                 {num}
// //               </button>
// //             );
// //           })}
// //         </div>

// //         <div
// //           style={{
// //             display: "grid",
// //             gridTemplateColumns: "1fr 1fr",
// //             gap: "8px",
// //             marginTop: "8px",
// //           }}
// //         >
// //           {[
// //             { label: "Odd (x2)", type: "odd", sel: "odd" },
// //             { label: "Even (x2)", type: "even", sel: "even" },
// //             { label: "Red (x2)", type: "red", sel: "red" },
// //             { label: "Black (x2)", type: "black", sel: "black" },
// //           ].map((item, idx) => {
// //             const active = isSelected(item.type, item.sel);
// //             let activeBg = "rgba(245, 158, 11, 0.9)";
// //             let activeBorder = "#fbbf24";
// //             let activeShadow = "0 0 15px rgba(245,158,11,0.4)";

// //             if (item.type === "red") {
// //               activeBg = "#dc2626";
// //               activeBorder = "#ef4444";
// //               activeShadow = "0 0 15px rgba(220,38,38,0.6)";
// //             } else if (item.type === "black") {
// //               activeBg = "#1e293b";
// //               activeBorder = "#334155";
// //               activeShadow = "0 0 15px rgba(0,0,0,0.5)";
// //             }

// //             return (
// //               <button
// //                 key={idx}
// //                 onClick={() => toggleSelection(item.type, item.sel)}
// //                 style={{
// //                   padding: "12px",
// //                   borderRadius: "8px",
// //                   fontWeight: "bold",
// //                   fontSize: "14px",
// //                   border: "2px solid",
// //                   borderColor: active ? activeBorder : "rgba(51, 65, 85, 0.8)",
// //                   backgroundColor: active ? activeBg : "rgba(30, 41, 59, 0.8)",
// //                   color: active
// //                     ? item.type === "black"
// //                       ? "white"
// //                       : "black"
// //                     : "#cbd5e1",
// //                   cursor: "pointer",
// //                   transition: "all 0.2s",
// //                   boxShadow: active ? activeShadow : "none",
// //                 }}
// //               >
// //                 {item.label}
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div> */}
// //       {/* 🎯 হুবহু ছবির মতো রুলেট বোর্ড */}
// // <div style={{ width: "100%", maxWidth: "480px", marginBottom: "24px", backgroundColor: "#0d0d11", padding: "10px", borderRadius: "12px" }}>
  
// //   {/* ১. সবার উপরে ০ (Zero) */}
// //   <div style={{ marginBottom: "4px" }}>
// //     <button
// //       onClick={() => toggleSelection("number", "0")}
// //       style={{
// //         width: "100%", padding: "10px", borderRadius: "6px", fontWeight: "bold", fontSize: "18px",
// //         border: "2px solid", borderColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
// //         backgroundColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
// //         color: isSelected("number", "0") ? "black" : "white", cursor: "pointer",
// //       }}
// //     >
// //       0
// //     </button>
// //   </div>

// //   {/* ২. মূল গ্রিড (বাম দিক থেকে যথাক্রমে: সাইড বেট, ডজন, এবং ১-৩৬ নম্বর ও 2:1 বাটন) */}
// //   <div 
// //     style={{ 
// //       display: "grid", 
// //       gridTemplateColumns: "1fr 1fr 3fr", 
// //       gap: "4px" 
// //     }}
// //   >
    
// //     {/* --- কলাম ১: বাম দিকের ৬টি বাটন (1-18, EVEN, Red, Black, ODD, 19-36) --- */}
// //     <div style={{ display: "grid", gridTemplateRows: "repeat(6, 1fr)", gap: "4px" }}>
// //       <button onClick={() => toggleSelection("low", "1-18")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("low", "1-18") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("low", "1-18") ? "black" : "#cbd5e1", cursor: "pointer" }}>1-18</button>
// //       <button onClick={() => toggleSelection("even", "even")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("even", "even") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("even", "even") ? "black" : "#cbd5e1", cursor: "pointer" }}>EVEN</button>
// //       <button onClick={() => toggleSelection("red", "red")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "18px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("red", "red") ? "#dc2626" : "rgba(30, 41, 59, 0.8)", color: "white", cursor: "pointer" }}>♦️</button>
// //       <button onClick={() => toggleSelection("black", "black")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "18px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("black", "black") ? "#1e293b" : "rgba(30, 41, 59, 0.8)", color: "white", cursor: "pointer" }}>♠️</button>
// //       <button onClick={() => toggleSelection("odd", "odd")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("odd", "odd") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("odd", "odd") ? "black" : "#cbd5e1", cursor: "pointer" }}>ODD</button>
// //       <button onClick={() => toggleSelection("high", "19-36")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("high", "19-36") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("high", "19-36") ? "black" : "#cbd5e1", cursor: "pointer" }}>19-36</button>
// //     </div>

// //     {/* --- কলাম ২: লম্বা ৩টি ডজন (1st 12, 2nd 12, 3rd 12) --- */}
// //     <div style={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)", gap: "4px" }}>
// //       <button onClick={() => toggleSelection("1-12", "1-12")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("1-12", "1-12") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("1-12", "1-12") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>1st 12</button>
// //       <button onClick={() => toggleSelection("13-24", "13-24")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("13-24", "13-24") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("13-24", "13-24") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>2nd 12</button>
// //       <button onClick={() => toggleSelection("25-36", "25-36")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("25-36", "25-36") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("25-36", "25-36") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>3rd 12</button>
// //     </div>

// //     {/* --- কলাম ৩: ১-৩৬ নাম্বার গ্রিড এবং নিচে ৩টি 2:1 বাটন --- */}
// //     <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      
// //       {/* ১-৩৬ নাম্বার (Row-ভিত্তিক ৩ কলাম গ্রিড) */}
// //       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
// //         {Array.from({ length: 12 }).map((_, rowIndex) => {
// //           // ছবির মতো ১, ২, ৩ ক্রম ক্রমানুসারে সাজানো
// //           const nums = [rowIndex * 3 + 1, rowIndex * 3 + 2, rowIndex * 3 + 3];
// //           return nums.map((num) => {
// //             const active = isSelected("number", String(num));
// //             const bgColor = getNumberColor(num);
// //             return (
// //               <button
// //                 key={num}
// //                 onClick={() => toggleSelection("number", String(num))}
// //                 style={{
// //                   padding: "8px 2px",
// //                   borderRadius: "4px",
// //                   fontWeight: "bold",
// //                   fontSize: "14px",
// //                   border: active ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
// //                   backgroundColor: active ? "#fbbf24" : bgColor,
// //                   color: active ? "black" : "white",
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 {num}
// //               </button>
// //             );
// //           });
// //         })}
// //       </div>

// //       {/* --- নিচে ৩টি 2:1 বাটন --- */}
// //       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
// //         {[1, 2, 3].map((colNum) => {
// //           const type = `col_${colNum}`;
// //           const selection = `col_${colNum}`;
// //           const active = isSelected(type, selection);
// //           return (
// //             <button
// //               key={colNum}
// //               onClick={() => toggleSelection(type, selection)}
// //               style={{
// //                 padding: "8px 2px",
// //                 borderRadius: "4px",
// //                 fontWeight: "bold",
// //                 fontSize: "11px",
// //                 border: "1px solid rgba(255,255,255,0.1)",
// //                 backgroundColor: active ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)",
// //                 color: active ? "black" : "#cbd5e1",
// //                 cursor: "pointer",
// //               }}
// //             >
// //               2:1
// //             </button>
// //           );
// //         })}
// //       </div>

// //     </div>

// //   </div>
// // </div>

// //       {/* কনফার্ম বাটন */}
// //       <div style={{ width: "100%", maxWidth: "480px" }}>
// //         {message && (
// //           <div
// //             style={{
// //               padding: "12px",
// //               borderRadius: "12px",
// //               fontSize: "14px",
// //               fontWeight: "bold",
// //               textAlign: "center",
// //               marginBottom: "12px",
// //               backgroundColor:
// //                 message.type === "success"
// //                   ? "rgba(6, 78, 59, 0.9)"
// //                   : "rgba(136, 19, 55, 0.9)",
// //               color: message.type === "success" ? "#34d399" : "#f87171",
// //               border: "1px solid",
// //               borderColor: message.type === "success" ? "#059669" : "#e11d48",
// //             }}
// //           >
// //             {message.text}
// //           </div>
// //         )}
// //         <button
// //           onClick={handleBet}
// //           disabled={submitting || timeLeft <= 5}
// //           style={{
// //             width: "100%",
// //             background:
// //               timeLeft <= 5
// //                 ? "#334155"
// //                 : "linear-gradient(to right, #f59e0b, #d97706)",
// //             color: timeLeft <= 5 ? "#94a3b8" : "black",
// //             fontWeight: "900",
// //             padding: "18px",
// //             borderRadius: "16px",
// //             border: "none",
// //             cursor: timeLeft <= 5 ? "not-allowed" : "pointer",
// //             transition: "transform 0.1s",
// //             boxShadow:
// //               timeLeft <= 5
// //                 ? "none"
// //                 : "0 10px 25px -5px rgba(245, 158, 11, 0.5)",
// //             fontSize: "16px",
// //             letterSpacing: "1px",
// //           }}
// //         >
// //           {timeLeft <= 5
// //             ? "বাজি বন্ধ (অপেক্ষা করুন)"
// //             : submitting
// //               ? "প্রসেসিং..."
// //               : `বাজি ধরুন (${selectedBets.length} টি)`}
// //         </button>
// //       </div>

// //       {/* 🆕 সাম্প্রতিক রেজাল্ট কার্সেল */}
// //       {recentResults.length > 0 && (
// //         <div
// //           style={{
// //             width: "100%",
// //             maxWidth: "480px",
// //             display: "flex",
// //             alignItems: "center",
// //             gap: "8px",
// //             marginTop: "16px",
// //             overflowX: "auto",
// //             paddingBottom: "4px",
// //             scrollbarWidth: "none",
// //           }}
// //         >
// //           <span
// //             style={{
// //               fontSize: "10px",
// //               color: "#94a3b8",
// //               whiteSpace: "nowrap",
// //               fontWeight: "bold",
// //             }}
// //           >
// //             সাম্প্রতিক:
// //           </span>
// //           <div style={{ display: "flex", gap: "6px" }}>
// //             {recentResults.map((num, idx) => (
// //               <div
// //                 key={idx}
// //                 style={{
// //                   width: "32px",
// //                   height: "32px",
// //                   borderRadius: "50%",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "center",
// //                   fontWeight: "bold",
// //                   fontSize: "12px",
// //                   flexShrink: 0,
// //                   backgroundColor: getNumberColor(num),
// //                   color: "white",
// //                   border: "2px solid rgba(255,255,255,0.1)",
// //                   boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
// //                   textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
// //                 }}
// //               >
// //                 {num}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       {/* 🏆 উইন পপআপ */}
// //       {winPopup && (
// //         <div
// //           style={{
// //             position: "fixed",
// //             top: 0,
// //             left: 0,
// //             right: 0,
// //             bottom: 0,
// //             backgroundColor: "rgba(0,0,0,0.85)",
// //             backdropFilter: "blur(5px)",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "center",
// //             zIndex: 50,
// //             padding: "16px",
// //           }}
// //         >
// //           <div
// //             style={{
// //               background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)",
// //               border: "2px solid #10b981",
// //               borderRadius: "24px",
// //               padding: "32px 24px",
// //               maxWidth: "360px",
// //               width: "100%",
// //               textAlign: "center",
// //               position: "relative",
// //               overflow: "hidden",
// //               boxShadow: "0 0 50px rgba(16,185,129,0.3)",
// //             }}
// //           >
// //             <div
// //               style={{
// //                 position: "absolute",
// //                 top: "-50px",
// //                 left: "50%",
// //                 transform: "translateX(-50%)",
// //                 width: "200px",
// //                 height: "200px",
// //                 background:
// //                   "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
// //                 zIndex: 0,
// //               }}
// //             ></div>

// //             <div style={{ position: "relative", zIndex: 1 }}>
// //               <div
// //                 style={{
// //                   width: "90px",
// //                   height: "90px",
// //                   background: "linear-gradient(135deg, #34d399, #059669)",
// //                   borderRadius: "50%",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "center",
// //                   margin: "0 auto 16px auto",
// //                   border: "4px solid #020617",
// //                   boxShadow: "0 0 30px rgba(16,185,129,0.5)",
// //                 }}
// //               >
// //                 <span style={{ fontSize: "48px" }}>👑</span>
// //               </div>

// //               <h2
// //                 style={{
// //                   fontSize: "28px",
// //                   fontWeight: "900",
// //                   color: "#34d399",
// //                   margin: "0 0 8px 0",
// //                   textShadow: "0 2px 10px rgba(52,211,153,0.5)",
// //                 }}
// //               >
// //                 অভিনন্দন!
// //               </h2>
// //               <p
// //                 style={{
// //                   color: "#cbd5e1",
// //                   margin: "0 0 24px 0",
// //                   fontSize: "14px",
// //                 }}
// //               >
// //                 আপনি এই রাউন্ডে জিতেছেন!
// //               </p>

// //               <div
// //                 style={{
// //                   backgroundColor: "rgba(2, 6, 23, 0.8)",
// //                   border: "1px solid #334155",
// //                   borderRadius: "16px",
// //                   padding: "16px",
// //                   marginBottom: "24px",
// //                   textAlign: "left",
// //                 }}
// //               >
// //                 <div
// //                   style={{
// //                     display: "flex",
// //                     justifyContent: "space-between",
// //                     marginBottom: "12px",
// //                     fontSize: "14px",
// //                   }}
// //                 >
// //                   <span style={{ color: "#94a3b8" }}>উইনিং নাম্বার:</span>
// //                   <span
// //                     style={{
// //                       fontWeight: "bold",
// //                       color: "white",
// //                       fontFamily: "monospace",
// //                       backgroundColor: getNumberColor(
// //                         Number(winPopup.winningNumber),
// //                       ),
// //                       padding: "2px 8px",
// //                       borderRadius: "4px",
// //                     }}
// //                   >
// //                     {winPopup.winningNumber}
// //                   </span>
// //                 </div>
// //                 <div
// //                   style={{
// //                     display: "flex",
// //                     justifyContent: "space-between",
// //                     marginBottom: "12px",
// //                     fontSize: "14px",
// //                   }}
// //                 >
// //                   <span style={{ color: "#94a3b8" }}>মাল্টিপ্লায়ার:</span>
// //                   <span
// //                     style={{
// //                       fontWeight: "900",
// //                       color: "#fbbf24",
// //                       backgroundColor: "rgba(245,158,11,0.1)",
// //                       padding: "2px 8px",
// //                       borderRadius: "4px",
// //                     }}
// //                   >
// //                     {winPopup.multiplier}x
// //                   </span>
// //                 </div>
// //                 <div
// //                   style={{ borderTop: "1px solid #1e293b", margin: "12px 0" }}
// //                 ></div>
// //                 <div
// //                   style={{
// //                     display: "flex",
// //                     justifyContent: "space-between",
// //                     alignItems: "center",
// //                   }}
// //                 >
// //                   <span style={{ color: "#94a3b8", fontWeight: "bold" }}>
// //                     প্রাইজ মানি:
// //                   </span>
// //                   <span
// //                     style={{
// //                       fontWeight: "900",
// //                       color: "#34d399",
// //                       fontSize: "28px",
// //                       textShadow: "0 0 15px rgba(52,211,153,0.4)",
// //                     }}
// //                   >
// //                     ৳{winPopup.payout}
// //                   </span>
// //                 </div>
// //               </div>

// //               {/* 🆕 এখানে ক্লিক করলে স্টেটে সেভ হবে, পপআপ বন্ধ হবে */}
// //               <button
// //                 onClick={() => {
// //                   const roundId = winPopup.round;
// //                   setDismissedPopups((prev) => [...prev, roundId]);
// //                   setWinPopup(null);
// //                 }}
// //                 style={{
// //                   width: "100%",
// //                   background: "linear-gradient(to right, #059669, #047857)",
// //                   color: "white",
// //                   fontWeight: "bold",
// //                   padding: "16px",
// //                   borderRadius: "12px",
// //                   border: "none",
// //                   cursor: "pointer",
// //                   fontSize: "16px",
// //                   boxShadow: "0 5px 15px rgba(5,150,105,0.3)",
// //                 }}
// //               >
// //                 দুর্দান্ত! ধন্যবাদ
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* বেট হিস্ট্রি পপআপ */}
// //       {isHistoryOpen && (
// //         <div
// //           style={{
// //             position: "fixed",
// //             top: 0,
// //             left: 0,
// //             right: 0,
// //             bottom: 0,
// //             backgroundColor: "rgba(0,0,0,0.85)",
// //             backdropFilter: "blur(5px)",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "center",
// //             zIndex: 50,
// //             padding: "16px",
// //           }}
// //         >
// //           <div
// //             style={{
// //               backgroundColor: "#0f172a",
// //               border: "1px solid #334155",
// //               borderRadius: "16px",
// //               width: "100%",
// //               maxWidth: "420px",
// //               maxHeight: "80vh",
// //               display: "flex",
// //               flexDirection: "column",
// //               overflow: "hidden",
// //               boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
// //             }}
// //           >
// //             <div
// //               style={{
// //                 display: "flex",
// //                 justifyContent: "space-between",
// //                 alignItems: "center",
// //                 padding: "16px",
// //                 borderBottom: "1px solid #1e293b",
// //                 backgroundColor: "rgba(2, 6, 23, 0.5)",
// //               }}
// //             >
// //               <h2
// //                 style={{
// //                   fontSize: "14px",
// //                   fontWeight: "bold",
// //                   color: "#fbbf24",
// //                   margin: 0,
// //                   display: "flex",
// //                   alignItems: "center",
// //                   gap: "8px",
// //                 }}
// //               >
// //                 ⏱️ বেট হিস্ট্রি
// //               </h2>
// //               <button
// //                 onClick={() => setIsHistoryOpen(false)}
// //                 style={{
// //                   width: "32px",
// //                   height: "32px",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "center",
// //                   borderRadius: "8px",
// //                   backgroundColor: "#1e293b",
// //                   color: "#94a3b8",
// //                   border: "none",
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 ✕
// //               </button>
// //             </div>

// //             <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
// //               {historyLoading ? (
// //                 <p
// //                   style={{
// //                     textAlign: "center",
// //                     fontSize: "12px",
// //                     color: "#64748b",
// //                     padding: "16px 0",
// //                   }}
// //                 >
// //                   লোড হচ্ছে...
// //                 </p>
// //               ) : historyData.length === 0 ? (
// //                 <p
// //                   style={{
// //                     textAlign: "center",
// //                     fontSize: "12px",
// //                     color: "#64748b",
// //                     padding: "16px 0",
// //                   }}
// //                 >
// //                   কোনো বেট হিস্ট্রি নেই।
// //                 </p>
// //               ) : (
// //                 <div
// //                   style={{
// //                     display: "flex",
// //                     flexDirection: "column",
// //                     gap: "10px",
// //                   }}
// //                 >
// //                   {historyData.map((item, index) => {
// //                     const actualNumber =
// //                       item.winningNumber !== undefined &&
// //                       item.winningNumber !== null
// //                         ? item.winningNumber
// //                         : "N/A";

// //                     const isWin = item.status === "win";
// //                     const payoutAmount = item.payout || 0;
// //                     const betAmount = item.betAmount || 0;

// //                     return (
// //                       <div
// //                         key={index}
// //                         style={{
// //                           backgroundColor: "#020617",
// //                           border: "1px solid #1e293b",
// //                           padding: "12px",
// //                           borderRadius: "12px",
// //                           display: "flex",
// //                           justifyContent: "space-between",
// //                           alignItems: "center",
// //                         }}
// //                       >
// //                         <div
// //                           style={{
// //                             display: "flex",
// //                             flexDirection: "column",
// //                             gap: "4px",
// //                           }}
// //                         >
// //                           <span
// //                             style={{
// //                               fontFamily: "monospace",
// //                               color: "#cbd5e1",
// //                               fontWeight: "bold",
// //                               fontSize: "12px",
// //                             }}
// //                           >
// //                             {item.periodNumber}
// //                           </span>
// //                           <div
// //                             style={{
// //                               display: "flex",
// //                               gap: "8px",
// //                               fontSize: "10px",
// //                             }}
// //                           >
// //                             <span style={{ color: "#64748b" }}>
// //                               রেজাল্ট:{" "}
// //                               <span
// //                                 style={{
// //                                   fontWeight: "bold",
// //                                   color: "#60a5fa",
// //                                 }}
// //                               >
// //                                 {actualNumber}
// //                               </span>
// //                             </span>
// //                           </div>
// //                           <span
// //                             style={{
// //                               fontSize: "10px",
// //                               color: "#94a3b8",
// //                               marginTop: "4px",
// //                             }}
// //                           >
// //                             চয়েস:{" "}
// //                             <span
// //                               style={{ fontWeight: "bold", color: "#fbbf24" }}
// //                             >
// //                               {item.userChoice || "N/A"}
// //                             </span>
// //                           </span>
// //                         </div>

// //                         <div
// //                           style={{
// //                             display: "flex",
// //                             flexDirection: "column",
// //                             alignItems: "flex-end",
// //                             gap: "4px",
// //                           }}
// //                         >
// //                           <p
// //                             style={{
// //                               fontWeight: "900",
// //                               fontSize: "12px",
// //                               padding: "2px 8px",
// //                               borderRadius: "4px",
// //                               margin: 0,
// //                               backgroundColor: isWin
// //                                 ? "rgba(16,185,129,0.1)"
// //                                 : "rgba(244,63,94,0.1)",
// //                               color: isWin ? "#34d399" : "#f43f5e",
// //                             }}
// //                           >
// //                             {isWin ? `WIN ${item.multiplier}x` : "LOSS"}
// //                           </p>

// //                           <div
// //                             style={{
// //                               display: "flex",
// //                               gap: "8px",
// //                               fontSize: "11px",
// //                               margin: 0,
// //                               alignItems: "center",
// //                               marginTop: "4px",
// //                             }}
// //                           >
// //                             <span style={{ color: "#64748b" }}>
// //                               বাজি:{" "}
// //                               <span
// //                                 style={{ color: "white", fontWeight: "bold" }}
// //                               >
// //                                 ৳{betAmount}
// //                               </span>
// //                             </span>

// //                             {isWin && (
// //                               <span
// //                                 style={{
// //                                   color: "#34d399",
// //                                   fontWeight: "bold",
// //                                   backgroundColor: "rgba(52,211,153,0.1)",
// //                                   padding: "2px 6px",
// //                                   borderRadius: "4px",
// //                                 }}
// //                               >
// //                                 +৳{payoutAmount}
// //                               </span>
// //                             )}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// // ////////////////////////////////////////////
// "use client";
// import { useState, useEffect } from "react";

// export default function CasinoRoulette() {
//   const [balance, setBalance] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState(null);

//   // গেম স্টেট
//   const [currentPeriod, setCurrentPeriod] = useState("PER-10001");
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [winPopup, setWinPopup] = useState(null);
//   const [recentResults, setRecentResults] = useState([]);
  
//   // 🆕 পপআপ কন্ট্রোল করার জন্য লোকাল স্টেট
//   const [dismissedPopups, setDismissedPopups] = useState([]);

//   // বেট স্টেট
//   const [selectedBets, setSelectedBets] = useState([]);
//   const [betAmount, setBetAmount] = useState("");

//   // হিস্ট্রি স্টেট
//   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
//   const [historyData, setHistoryData] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);

//   // ১. ইউজার ডেটা লোড
//   const fetchUserData = async () => {
//     try {
//       const res = await fetch("/api/user/me", { credentials: "include" });
//       if (!res.ok) return;
//       const data = await res.json();
//       if (data.success) setBalance(data.user?.balance || 0);
//     } catch (err) {
//       console.error("User fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ২. গেম স্টেট লোড
//   const fetchGameState = async () => {
//     try {
//       const res = await fetch("/api/game/newgame-state", {
//         credentials: "include",
//       });
//       if (!res.ok) return;
//       const data = await res.json();

//       if (data.success) {
//         setCurrentPeriod(data.periodNumber);
//         const end = new Date(data.endTime).getTime();
//         const now = new Date().getTime();
//         const diff = Math.max(0, Math.floor((end - now) / 1000));
//         setTimeLeft(diff);

//         if (data.recentResults) {
//           setRecentResults(data.recentResults);
//         }

//         // 🆕 শতভাগ শিউর পপআপ লজিক (localStorage নেই, শুধু State)
//         if (data.userResult && data.userResult.status === "win") {
//           const roundId = data.userResult.round;
          
//           // যদি ইউজার আগে "ধন্যবাদ" না চেপে থাকে, তবে পপআপ দেখাবে
//           if (!dismissedPopups.includes(roundId)) {
//             setWinPopup(data.userResult);
//           }
//         }
//       }
//     } catch (err) {
//       console.error("State fetch error:", err);
//     }
//   };

//   // ৩. হিস্ট্রি লোড
//   const fetchHistory = async () => {
//     setIsHistoryOpen(true);
//     setHistoryLoading(true);
//     try {
//       const res = await fetch("/api/game/newgame-history", {
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (data.success) setHistoryData(data.history || []);
//     } catch (err) {
//       console.error("History fetch error:", err);
//     } finally {
//       setHistoryLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserData();
//     fetchGameState();

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           fetchGameState();
//           fetchUserData();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [dismissedPopups]); // 🆕 dismissedPopups-এর উপর নির্ভর করবে

//   // ৪. সিলেকশন টগল (ফ্রন্টএন্ড ভ্যালিডেশনসহ)
//   const toggleSelection = (type, selection) => {
//     if (timeLeft <= 5) {
//       return setMessage({
//         type: "error",
//         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
//       });
//     }

//     if (type === "odd" && selectedBets.some((b) => b.type === "even")) {
//       return setMessage({
//         type: "error",
//         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
//       });
//     }
//     if (type === "even" && selectedBets.some((b) => b.type === "odd")) {
//       return setMessage({
//         type: "error",
//         text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
//       });
//     }
//     if (type === "red" && selectedBets.some((b) => b.type === "black")) {
//       return setMessage({
//         type: "error",
//         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
//       });
//     }
//     if (type === "black" && selectedBets.some((b) => b.type === "red")) {
//       return setMessage({
//         type: "error",
//         text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
//       });
//     }

//     // 🆕 ১-১৮ এবং ১৯-৩৬ একসাথে নয়
//     if (type === "1-18" && selectedBets.some((b) => b.type === "19-36")) {
//       return setMessage({ type: "error", text: "1-18 এবং 19-36 একসাথে বাজি ধরা যাবে না!" });
//     }
//     if (type === "19-36" && selectedBets.some((b) => b.type === "1-18")) {
//       return setMessage({ type: "error", text: "1-18 এবং 19-36 একসাথে বাজি ধরা যাবে না!" });
//     }

//     const dozenCount = selectedBets.filter((b) =>
//       ["1-12", "13-24", "25-36"].includes(b.type),
//     ).length;
//     if (
//       ["1-12", "13-24", "25-36"].includes(type) &&
//       dozenCount >= 2 &&
//       !isSelected(type, selection)
//     ) {
//       return setMessage({
//         type: "error",
//         text: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
//       });
//     }

//     // 🆕 সর্বোচ্চ ২টি 2:1 কলাম বাজি ধরা যাবে
//     const colCount = selectedBets.filter((b) =>
//       ["col_1", "col_2", "col_3"].includes(b.type),
//     ).length;
//     if (
//       ["col_1", "col_2", "col_3"].includes(type) &&
//       colCount >= 2 &&
//       !isSelected(type, selection)
//     ) {
//       return setMessage({ type: "error", text: "একসাথে সর্বোচ্চ ২টি 2:1 কলাম বাজি ধরা যাবে!" });
//     }

//     setSelectedBets((prev) => {
//       const exists = prev.find(
//         (b) => b.type === type && b.selection === selection,
//       );
//       if (exists) {
//         return prev.filter(
//           (b) => !(b.type === type && b.selection === selection),
//         );
//       } else {
//         return [...prev, { type, selection }];
//       }
//     });
//   };

//   // ৫. বাজি প্লেস
//   const handleBet = async () => {
//     if (selectedBets.length === 0)
//       return setMessage({
//         type: "error",
//         text: "কমপক্ষে একটি অপশন সিলেক্ট করুন!",
//       });
//     const amount = Number(betAmount);
//     if (!amount || amount <= 0)
//       return setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন!" });

//     const totalCost = amount * selectedBets.length;
//     if (totalCost > balance)
//       return setMessage({ type: "error", text: "পর্যাপ্ত ব্যালেন্স নেই!" });
//     if (timeLeft <= 5)
//       return setMessage({
//         type: "error",
//         text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
//       });

//     setSubmitting(true);
//     setMessage(null);

//     try {
//       const formattedBets = selectedBets.map((b) => ({
//         type: b.type,
//         selection: b.selection,
//         amount,
//       }));

//       const res = await fetch("/api/game/newgamebet", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           bets: formattedBets,
//           periodNumber: currentPeriod,
//         }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         setMessage({ type: "success", text: data.message });
//         setBalance(data.newBalance);
//         setBetAmount("");
//         setSelectedBets([]);

//         setTimeout(() => {
//           setMessage(null);
//         }, 3000);
//       } else {
//         setMessage({ type: "error", text: data.message });
//         setTimeout(() => {
//           setMessage(null);
//         }, 3000);
//       }
//     } catch (err) {
//       setMessage({ type: "error", text: "সার্ভার এরর!" });
//       setTimeout(() => {
//         setMessage(null);
//       }, 3000);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const isSelected = (type, selection) => {
//     return selectedBets.some(
//       (b) => b.type === type && b.selection === selection,
//     );
//   };

//   // রুলেট নাম্বারের রঙ (লাল/কালো) - ক্যাসিনো স্টাইল
//   const getNumberColor = (num) => {
//     const redNumbers = [
//       1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
//     ];
//     if (num === 0) return "#059669";
//     return redNumbers.includes(num) ? "#dc2626" : "#1e293b";
//   };

//   if (loading)
//     return (
//       <div
//         style={{
//           minHeight: "100vh",
//           backgroundColor: "#020617",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           color: "white",
//         }}
//       >
//         <div
//           style={{
//             width: "48px",
//             height: "48px",
//             border: "4px solid #fbbf24",
//             borderTopColor: "transparent",
//             borderRadius: "50%",
//             animation: "spin 1s linear infinite",
//           }}
//         ></div>
//         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
//       </div>
//     );

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         backgroundColor: "#020617",
//         backgroundImage:
//           "radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)",
//         padding: "16px",
//         color: "white",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         paddingBottom: "100px",
//         fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
//       }}
//     >
//       {/* হেডার */}
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "480px",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "16px",
//           padding: "0 8px",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//           <div
//             style={{
//               width: "40px",
//               height: "40px",
//               borderRadius: "50%",
//               background: "linear-gradient(135deg, #fbbf24, #d97706)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontWeight: "bold",
//               color: "#000",
//               boxShadow: "0 0 15px rgba(245,158,11,0.4)",
//             }}
//           >
//             R
//           </div>
//           <div>
//             <p
//               style={{
//                 fontSize: "10px",
//                 color: "#94a3b8",
//                 margin: 0,
//                 textTransform: "uppercase",
//                 letterSpacing: "1px",
//               }}
//             >
//               পিরিয়ড
//             </p>
//             <p
//               style={{
//                 fontFamily: "monospace",
//                 color: "#fbbf24",
//                 fontWeight: "bold",
//                 fontSize: "14px",
//                 margin: 0,
//               }}
//             >
//               {currentPeriod}
//             </p>
//           </div>
//         </div>
//         <div
//           style={{
//             backgroundColor: "rgba(15, 23, 42, 0.8)",
//             padding: "8px 16px",
//             borderRadius: "12px",
//             border: "1px solid rgba(51, 65, 85, 0.5)",
//             textAlign: "right",
//           }}
//         >
//           <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
//             ব্যালেন্স
//           </p>
//           <p
//             style={{
//               fontFamily: "monospace",
//               color: "#34d399",
//               fontWeight: "bold",
//               fontSize: "18px",
//               margin: 0,
//             }}
//           >
//             ৳{balance.toFixed(2)}
//           </p>
//         </div>
//       </div>

//       {/* টাইমার এবং হিস্ট্রি */}
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "480px",
//           display: "flex",
//           gap: "12px",
//           marginBottom: "16px",
//         }}
//       >
//         <div
//           style={{
//             flex: 1,
//             background: "linear-gradient(90deg, #0f172a, #1e293b)",
//             padding: "12px",
//             borderRadius: "16px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             border: "1px solid rgba(51, 65, 85, 0.5)",
//           }}
//         >
//           <div>
//             <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
//               টাইমার
//             </p>
//             <p
//               style={{
//                 fontFamily: "monospace",
//                 fontWeight: "900",
//                 fontSize: "24px",
//                 margin: 0,
//                 color: timeLeft <= 5 ? "#f43f5e" : "#34d399",
//                 textShadow:
//                   timeLeft <= 5 ? "0 0 10px #f43f5e" : "0 0 10px #34d399",
//               }}
//             >
//               00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
//             </p>
//           </div>
//           <button
//             onClick={fetchHistory}
//             style={{
//               backgroundColor: "rgba(51, 65, 85, 0.5)",
//               border: "none",
//               color: "#cbd5e1",
//               width: "40px",
//               height: "40px",
//               borderRadius: "10px",
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             ⏱️
//           </button>
//         </div>
//       </div>

//       {/* বাজি ধরার ফর্ম */}
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "480px",
//           backgroundColor: "rgba(15, 23, 42, 0.8)",
//           padding: "16px",
//           borderRadius: "16px",
//           border: "1px solid rgba(51, 65, 85, 0.5)",
//           marginBottom: "16px",
//           backdropFilter: "blur(10px)",
//         }}
//       >
//         <div style={{ position: "relative" }}>
//           <span
//             style={{
//               position: "absolute",
//               left: "16px",
//               top: "50%",
//               transform: "translateY(-50%)",
//               color: "#fbbf24",
//               fontSize: "18px",
//             }}
//           >
//             ৳
//           </span>
//           <input
//             type="number"
//             value={betAmount}
//             onChange={(e) => setBetAmount(e.target.value)}
//             placeholder="পরিমাণ লিখুন"
//             disabled={timeLeft <= 5}
//             style={{
//               width: "100%",
//               backgroundColor: "#020617",
//               border: "1px solid #334155",
//               borderRadius: "12px",
//               padding: "14px 16px 14px 40px",
//               color: "white",
//               fontFamily: "monospace",
//               fontSize: "18px",
//               outline: "none",
//               boxSizing: "border-box",
//             }}
//           />
//         </div>

//         {selectedBets.length > 0 && betAmount > 0 && (
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginTop: "12px",
//               padding: "0 4px",
//             }}
//           >
//             <span style={{ fontSize: "12px", color: "#94a3b8" }}>
//               সিলেকশন: {selectedBets.length} টি
//             </span>
//             <span
//               style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}
//             >
//               মোট খরচ: ৳{(Number(betAmount) * selectedBets.length).toFixed(2)}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* 🎯 হুবহু ছবির মতো রুলেট বোর্ড */}
//       <div style={{ width: "100%", maxWidth: "480px", marginBottom: "24px", backgroundColor: "#0d0d11", padding: "10px", borderRadius: "12px" }}>
        
//         {/* ১. সবার উপরে ০ (Zero) */}
//         <div style={{ marginBottom: "4px" }}>
//           <button
//             onClick={() => toggleSelection("number", "0")}
//             style={{
//               width: "100%", padding: "10px", borderRadius: "6px", fontWeight: "bold", fontSize: "18px",
//               border: "2px solid", borderColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
//               backgroundColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
//               color: isSelected("number", "0") ? "black" : "white", cursor: "pointer",
//             }}
//           >
//             0
//           </button>
//         </div>

//         {/* ২. মূল গ্রিড */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 3fr", gap: "4px" }}>
          
//           {/* --- কলাম ১: বাম দিকের ৬টি বাটন --- */}
//           <div style={{ display: "grid", gridTemplateRows: "repeat(6, 1fr)", gap: "4px" }}>
//             {/* 🆕 low এর বদলে 1-18 */}
//             <button onClick={() => toggleSelection("1-18", "1-18")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("1-18", "1-18") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("1-18", "1-18") ? "black" : "#cbd5e1", cursor: "pointer" }}>1-18</button>
//             <button onClick={() => toggleSelection("even", "even")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("even", "even") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("even", "even") ? "black" : "#cbd5e1", cursor: "pointer" }}>EVEN</button>
//             <button onClick={() => toggleSelection("red", "red")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "18px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("red", "red") ? "#dc2626" : "rgba(30, 41, 59, 0.8)", color: "white", cursor: "pointer" }}>♦️</button>
//             <button onClick={() => toggleSelection("black", "black")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "18px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("black", "black") ? "#1e293b" : "rgba(30, 41, 59, 0.8)", color: "white", cursor: "pointer" }}>♠️</button>
//             <button onClick={() => toggleSelection("odd", "odd")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("odd", "odd") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("odd", "odd") ? "black" : "#cbd5e1", cursor: "pointer" }}>ODD</button>
//             {/* 🆕 high এর বদলে 19-36 */}
//             <button onClick={() => toggleSelection("19-36", "19-36")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("19-36", "19-36") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("19-36", "19-36") ? "black" : "#cbd5e1", cursor: "pointer" }}>19-36</button>
//           </div>

//           {/* --- কলাম ২: লম্বা ৩টি ডজন --- */}
//           <div style={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)", gap: "4px" }}>
//             <button onClick={() => toggleSelection("1-12", "1-12")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("1-12", "1-12") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("1-12", "1-12") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>1st 12</button>
//             <button onClick={() => toggleSelection("13-24", "13-24")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("13-24", "13-24") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("13-24", "13-24") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>2nd 12</button>
//             <button onClick={() => toggleSelection("25-36", "25-36")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("25-36", "25-36") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("25-36", "25-36") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>3rd 12</button>
//           </div>

//           {/* --- কলাম ৩: ১-৩৬ নাম্বার গ্রিড এবং নিচে ৩টি 2:1 বাটন --- */}
//           <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
//               {Array.from({ length: 12 }).map((_, rowIndex) => {
//                 const nums = [rowIndex * 3 + 1, rowIndex * 3 + 2, rowIndex * 3 + 3];
//                 return nums.map((num) => {
//                   const active = isSelected("number", String(num));
//                   const bgColor = getNumberColor(num);
//                   return (
//                     <button
//                       key={num}
//                       onClick={() => toggleSelection("number", String(num))}
//                       style={{
//                         padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "14px",
//                         border: active ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
//                         backgroundColor: active ? "#fbbf24" : bgColor,
//                         color: active ? "black" : "white", cursor: "pointer",
//                       }}
//                     >
//                       {num}
//                     </button>
//                   );
//                 });
//               })}
//             </div>

//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
//               {[1, 2, 3].map((colNum) => {
//                 const type = `col_${colNum}`;
//                 const selection = `col_${colNum}`;
//                 const active = isSelected(type, selection);
//                 return (
//                   <button
//                     key={colNum}
//                     onClick={() => toggleSelection(type, selection)}
//                     style={{
//                       padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px",
//                       border: "1px solid rgba(255,255,255,0.1)",
//                       backgroundColor: active ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)",
//                       color: active ? "black" : "#cbd5e1", cursor: "pointer",
//                     }}
//                   >
//                     2:1
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* কনফার্ম বাটন */}
//       <div style={{ width: "100%", maxWidth: "480px" }}>
//         {message && (
//           <div
//             style={{
//               padding: "12px",
//               borderRadius: "12px",
//               fontSize: "14px",
//               fontWeight: "bold",
//               textAlign: "center",
//               marginBottom: "12px",
//               backgroundColor:
//                 message.type === "success"
//                   ? "rgba(6, 78, 59, 0.9)"
//                   : "rgba(136, 19, 55, 0.9)",
//               color: message.type === "success" ? "#34d399" : "#f87171",
//               border: "1px solid",
//               borderColor: message.type === "success" ? "#059669" : "#e11d48",
//             }}
//           >
//             {message.text}
//           </div>
//         )}
//         <button
//           onClick={handleBet}
//           disabled={submitting || timeLeft <= 5}
//           style={{
//             width: "100%",
//             background:
//               timeLeft <= 5
//                 ? "#334155"
//                 : "linear-gradient(to right, #f59e0b, #d97706)",
//             color: timeLeft <= 5 ? "#94a3b8" : "black",
//             fontWeight: "900",
//             padding: "18px",
//             borderRadius: "16px",
//             border: "none",
//             cursor: timeLeft <= 5 ? "not-allowed" : "pointer",
//             transition: "transform 0.1s",
//             boxShadow:
//               timeLeft <= 5
//                 ? "none"
//                 : "0 10px 25px -5px rgba(245, 158, 11, 0.5)",
//             fontSize: "16px",
//             letterSpacing: "1px",
//           }}
//         >
//           {timeLeft <= 5
//             ? "বাজি বন্ধ (অপেক্ষা করুন)"
//             : submitting
//               ? "প্রসেসিং..."
//               : `বাজি ধরুন (${selectedBets.length} টি)`}
//         </button>
//       </div>

//       {/* 🆕 সাম্প্রতিক রেজাল্ট কার্সেল */}
//       {recentResults.length > 0 && (
//         <div
//           style={{
//             width: "100%",
//             maxWidth: "480px",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             marginTop: "16px",
//             overflowX: "auto",
//             paddingBottom: "4px",
//             scrollbarWidth: "none",
//           }}
//         >
//           <span
//             style={{
//               fontSize: "10px",
//               color: "#94a3b8",
//               whiteSpace: "nowrap",
//               fontWeight: "bold",
//             }}
//           >
//             সাম্প্রতিক:
//           </span>
//           <div style={{ display: "flex", gap: "6px" }}>
//             {recentResults.map((num, idx) => (
//               <div
//                 key={idx}
//                 style={{
//                   width: "32px",
//                   height: "32px",
//                   borderRadius: "50%",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontWeight: "bold",
//                   fontSize: "12px",
//                   flexShrink: 0,
//                   backgroundColor: getNumberColor(num),
//                   color: "white",
//                   border: "2px solid rgba(255,255,255,0.1)",
//                   boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
//                   textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
//                 }}
//               >
//                 {num}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* 🏆 উইন পপআপ */}
//       {winPopup && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.85)",
//             backdropFilter: "blur(5px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 50,
//             padding: "16px",
//           }}
//         >
//           <div
//             style={{
//               background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)",
//               border: "2px solid #10b981",
//               borderRadius: "24px",
//               padding: "32px 24px",
//               maxWidth: "360px",
//               width: "100%",
//               textAlign: "center",
//               position: "relative",
//               overflow: "hidden",
//               boxShadow: "0 0 50px rgba(16,185,129,0.3)",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 top: "-50px",
//                 left: "50%",
//                 transform: "translateX(-50%)",
//                 width: "200px",
//                 height: "200px",
//                 background:
//                   "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
//                 zIndex: 0,
//               }}
//             ></div>

//             <div style={{ position: "relative", zIndex: 1 }}>
//               <div
//                 style={{
//                   width: "90px",
//                   height: "90px",
//                   background: "linear-gradient(135deg, #34d399, #059669)",
//                   borderRadius: "50%",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   margin: "0 auto 16px auto",
//                   border: "4px solid #020617",
//                   boxShadow: "0 0 30px rgba(16,185,129,0.5)",
//                 }}
//               >
//                 <span style={{ fontSize: "48px" }}>👑</span>
//               </div>

//               <h2
//                 style={{
//                   fontSize: "28px",
//                   fontWeight: "900",
//                   color: "#34d399",
//                   margin: "0 0 8px 0",
//                   textShadow: "0 2px 10px rgba(52,211,153,0.5)",
//                 }}
//               >
//                 অভিনন্দন!
//               </h2>
//               <p
//                 style={{
//                   color: "#cbd5e1",
//                   margin: "0 0 24px 0",
//                   fontSize: "14px",
//                 }}
//               >
//                 আপনি এই রাউন্ডে জিতেছেন!
//               </p>

//               <div
//                 style={{
//                   backgroundColor: "rgba(2, 6, 23, 0.8)",
//                   border: "1px solid #334155",
//                   borderRadius: "16px",
//                   padding: "16px",
//                   marginBottom: "24px",
//                   textAlign: "left",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "12px",
//                     fontSize: "14px",
//                   }}
//                 >
//                   <span style={{ color: "#94a3b8" }}>উইনিং নাম্বার:</span>
//                   <span
//                     style={{
//                       fontWeight: "bold",
//                       color: "white",
//                       fontFamily: "monospace",
//                       backgroundColor: getNumberColor(
//                         Number(winPopup.winningNumber),
//                       ),
//                       padding: "2px 8px",
//                       borderRadius: "4px",
//                     }}
//                   >
//                     {winPopup.winningNumber}
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "12px",
//                     fontSize: "14px",
//                   }}
//                 >
//                   <span style={{ color: "#94a3b8" }}>মাল্টিপ্লায়ার:</span>
//                   <span
//                     style={{
//                       fontWeight: "900",
//                       color: "#fbbf24",
//                       backgroundColor: "rgba(245,158,11,0.1)",
//                       padding: "2px 8px",
//                       borderRadius: "4px",
//                     }}
//                   >
//                     {winPopup.multiplier}x
//                   </span>
//                 </div>
//                 <div
//                   style={{ borderTop: "1px solid #1e293b", margin: "12px 0" }}
//                 ></div>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                   }}
//                 >
//                   <span style={{ color: "#94a3b8", fontWeight: "bold" }}>
//                     প্রাইজ মানি:
//                   </span>
//                   <span
//                     style={{
//                       fontWeight: "900",
//                       color: "#34d399",
//                       fontSize: "28px",
//                       textShadow: "0 0 15px rgba(52,211,153,0.4)",
//                     }}
//                   >
//                     ৳{winPopup.payout}
//                   </span>
//                 </div>
//               </div>

//               <button
//                 onClick={() => {
//                   const roundId = winPopup.round;
//                   setDismissedPopups((prev) => [...prev, roundId]);
//                   setWinPopup(null);
//                 }}
//                 style={{
//                   width: "100%",
//                   background: "linear-gradient(to right, #059669, #047857)",
//                   color: "white",
//                   fontWeight: "bold",
//                   padding: "16px",
//                   borderRadius: "12px",
//                   border: "none",
//                   cursor: "pointer",
//                   fontSize: "16px",
//                   boxShadow: "0 5px 15px rgba(5,150,105,0.3)",
//                 }}
//               >
//                 দুর্দান্ত! ধন্যবাদ
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* বেট হিস্ট্রি পপআপ */}
//       {isHistoryOpen && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.85)",
//             backdropFilter: "blur(5px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 50,
//             padding: "16px",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "#0f172a",
//               border: "1px solid #334155",
//               borderRadius: "16px",
//               width: "100%",
//               maxWidth: "420px",
//               maxHeight: "80vh",
//               display: "flex",
//               flexDirection: "column",
//               overflow: "hidden",
//               boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: "16px",
//                 borderBottom: "1px solid #1e293b",
//                 backgroundColor: "rgba(2, 6, 23, 0.5)",
//               }}
//             >
//               <h2
//                 style={{
//                   fontSize: "14px",
//                   fontWeight: "bold",
//                   color: "#fbbf24",
//                   margin: 0,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                 }}
//               >
//                 ⏱️ বেট হিস্ট্রি
//               </h2>
//               <button
//                 onClick={() => setIsHistoryOpen(false)}
//                 style={{
//                   width: "32px",
//                   height: "32px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   borderRadius: "8px",
//                   backgroundColor: "#1e293b",
//                   color: "#94a3b8",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
//               {historyLoading ? (
//                 <p
//                   style={{
//                     textAlign: "center",
//                     fontSize: "12px",
//                     color: "#64748b",
//                     padding: "16px 0",
//                   }}
//                 >
//                   লোড হচ্ছে...
//                 </p>
//               ) : historyData.length === 0 ? (
//                 <p
//                   style={{
//                     textAlign: "center",
//                     fontSize: "12px",
//                     color: "#64748b",
//                     padding: "16px 0",
//                   }}
//                 >
//                   কোনো বেট হিস্ট্রি নেই।
//                 </p>
//               ) : (
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: "10px",
//                   }}
//                 >
//                   {historyData.map((item, index) => {
//                     const actualNumber =
//                       item.winningNumber !== undefined &&
//                       item.winningNumber !== null
//                         ? item.winningNumber
//                         : "N/A";

//                     const isWin = item.status === "win";
//                     const payoutAmount = item.payout || 0;
//                     const betAmount = item.betAmount || 0;

//                     return (
//                       <div
//                         key={index}
//                         style={{
//                           backgroundColor: "#020617",
//                           border: "1px solid #1e293b",
//                           padding: "12px",
//                           borderRadius: "12px",
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                         }}
//                       >
//                         <div
//                           style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             gap: "4px",
//                           }}
//                         >
//                           <span
//                             style={{
//                               fontFamily: "monospace",
//                               color: "#cbd5e1",
//                               fontWeight: "bold",
//                               fontSize: "12px",
//                             }}
//                           >
//                             {item.periodNumber}
//                           </span>
//                           <div
//                             style={{
//                               display: "flex",
//                               gap: "8px",
//                               fontSize: "10px",
//                             }}
//                           >
//                             <span style={{ color: "#64748b" }}>
//                               রেজাল্ট:{" "}
//                               <span
//                                 style={{
//                                   fontWeight: "bold",
//                                   color: "#60a5fa",
//                                 }}
//                               >
//                                 {actualNumber}
//                               </span>
//                             </span>
//                           </div>
//                           <span
//                             style={{
//                               fontSize: "10px",
//                               color: "#94a3b8",
//                               marginTop: "4px",
//                             }}
//                           >
//                             চয়েস:{" "}
//                             <span
//                               style={{ fontWeight: "bold", color: "#fbbf24" }}
//                             >
//                               {item.userChoice || "N/A"}
//                             </span>
//                           </span>
//                         </div>

//                         <div
//                           style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             alignItems: "flex-end",
//                             gap: "4px",
//                           }}
//                         >
//                           <p
//                             style={{
//                               fontWeight: "900",
//                               fontSize: "12px",
//                               padding: "2px 8px",
//                               borderRadius: "4px",
//                               margin: 0,
//                               backgroundColor: isWin
//                                 ? "rgba(16,185,129,0.1)"
//                                 : "rgba(244,63,94,0.1)",
//                               color: isWin ? "#34d399" : "#f43f5e",
//                             }}
//                           >
//                             {isWin ? `WIN ${item.multiplier}x` : "LOSS"}
//                           </p>

//                           <div
//                             style={{
//                               display: "flex",
//                               gap: "8px",
//                               fontSize: "11px",
//                               margin: 0,
//                               alignItems: "center",
//                               marginTop: "4px",
//                             }}
//                           >
//                             <span style={{ color: "#64748b" }}>
//                               বাজি:{" "}
//                               <span
//                                 style={{ color: "white", fontWeight: "bold" }}
//                               >
//                                 ৳{betAmount}
//                               </span>
//                             </span>

//                             {isWin && (
//                               <span
//                                 style={{
//                                   color: "#34d399",
//                                   fontWeight: "bold",
//                                   backgroundColor: "rgba(52,211,153,0.1)",
//                                   padding: "2px 6px",
//                                   borderRadius: "4px",
//                                 }}
//                               >
//                                 +৳{payoutAmount}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// ////////////////////////////////////////////////////
"use client";
import { useState, useEffect } from "react";

export default function CasinoRoulette() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // গেম স্টেট
  const [currentPeriod, setCurrentPeriod] = useState("PER-10001");
  const [timeLeft, setTimeLeft] = useState(0);
  const [winPopup, setWinPopup] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  
  // 🆕 পপআপ কন্ট্রোল করার জন্য লোকাল স্টেট
  const [dismissedPopups, setDismissedPopups] = useState([]);

  // বেট স্টেট
  const [selectedBets, setSelectedBets] = useState([]);
  const [betAmount, setBetAmount] = useState("");

  // হিস্ট্রি স্টেট
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ১. ইউজার ডেটা লোড
  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setBalance(data.user?.balance || 0);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ২. গেম স্টেট লোড
  const fetchGameState = async () => {
    try {
      const res = await fetch("/api/game/newgame-state", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.success) {
        setCurrentPeriod(data.periodNumber);
        const end = new Date(data.endTime).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        setTimeLeft(diff);

        if (data.recentResults) {
          setRecentResults(data.recentResults);
        }

        // 🆕 শতভাগ শিউর পপআপ লজিক (localStorage নেই, শুধু State)
        if (data.userResult && data.userResult.status === "win") {
          const roundId = data.userResult.round;
          
          // যদি ইউজার আগে "ধন্যবাদ" না চেপে থাকে, তবে পপআপ দেখাবে
          if (!dismissedPopups.includes(roundId)) {
            setWinPopup(data.userResult);
          }
        }
      }
    } catch (err) {
      console.error("State fetch error:", err);
    }
  };

  // ৩. হিস্ট্রি লোড
  const fetchHistory = async () => {
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/game/newgame-history", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setHistoryData(data.history || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchGameState();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchGameState();
          fetchUserData();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dismissedPopups]); // 🆕 dismissedPopups-এর উপর নির্ভর করবে

  // ৪. সিলেকশন টগল (ফ্রন্টএন্ড ভ্যালিডেশনসহ)
  const toggleSelection = (type, selection) => {
    if (timeLeft <= 5) {
      return setMessage({
        type: "error",
        text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
      });
    }

    if (type === "odd" && selectedBets.some((b) => b.type === "even")) {
      return setMessage({
        type: "error",
        text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
      });
    }
    if (type === "even" && selectedBets.some((b) => b.type === "odd")) {
      return setMessage({
        type: "error",
        text: "Odd এবং Even একসাথে বাজি ধরা যাবে না!",
      });
    }
    if (type === "red" && selectedBets.some((b) => b.type === "black")) {
      return setMessage({
        type: "error",
        text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
      });
    }
    if (type === "black" && selectedBets.some((b) => b.type === "red")) {
      return setMessage({
        type: "error",
        text: "Red এবং Black একসাথে বাজি ধরা যাবে না!",
      });
    }

    // 🆕 ১-১৮ এবং ১৯-৩৬ একসাথে নয়
    if (type === "1-18" && selectedBets.some((b) => b.type === "19-36")) {
      return setMessage({ type: "error", text: "1-18 এবং 19-36 একসাথে বাজি ধরা যাবে না!" });
    }
    if (type === "19-36" && selectedBets.some((b) => b.type === "1-18")) {
      return setMessage({ type: "error", text: "1-18 এবং 19-36 একসাথে বাজি ধরা যাবে না!" });
    }

    const dozenCount = selectedBets.filter((b) =>
      ["1-12", "13-24", "25-36"].includes(b.type),
    ).length;
    if (
      ["1-12", "13-24", "25-36"].includes(type) &&
      dozenCount >= 2 &&
      !isSelected(type, selection)
    ) {
      return setMessage({
        type: "error",
        text: "একসাথে সর্বোচ্চ ২টি ডজন বাজি ধরা যাবে!",
      });
    }

    // 🆕 সর্বোচ্চ ২টি 2:1 কলাম বাজি ধরা যাবে
    const colCount = selectedBets.filter((b) =>
      ["col_1", "col_2", "col_3"].includes(b.type),
    ).length;
    if (
      ["col_1", "col_2", "col_3"].includes(type) &&
      colCount >= 2 &&
      !isSelected(type, selection)
    ) {
      return setMessage({ type: "error", text: "একসাথে সর্বোচ্চ ২টি 2:1 কলাম বাজি ধরা যাবে!" });
    }

    setSelectedBets((prev) => {
      const exists = prev.find(
        (b) => b.type === type && b.selection === selection,
      );
      if (exists) {
        return prev.filter(
          (b) => !(b.type === type && b.selection === selection),
        );
      } else {
        return [...prev, { type, selection }];
      }
    });
  };

  // ৫. বাজি প্লেস
  const handleBet = async () => {
    if (selectedBets.length === 0)
      return setMessage({
        type: "error",
        text: "কমপক্ষে একটি অপশন সিলেক্ট করুন!",
      });
    const amount = Number(betAmount);
    if (!amount || amount <= 0)
      return setMessage({ type: "error", text: "সঠিক পরিমাণ লিখুন!" });

    const totalCost = amount * selectedBets.length;
    if (totalCost > balance)
      return setMessage({ type: "error", text: "পর্যাপ্ত ব্যালেন্স নেই!" });
    if (timeLeft <= 5)
      return setMessage({
        type: "error",
        text: "শেষ ৫ সেকেন্ডে বাজি ধরা যাবে না!",
      });

    setSubmitting(true);
    setMessage(null);

    try {
      const formattedBets = selectedBets.map((b) => ({
        type: b.type,
        selection: b.selection,
        amount,
      }));

      const res = await fetch("/api/game/newgamebet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bets: formattedBets,
          periodNumber: currentPeriod,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setBalance(data.newBalance);
        setBetAmount("");
        setSelectedBets([]);

        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: "error", text: data.message });
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর!" });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const isSelected = (type, selection) => {
    return selectedBets.some(
      (b) => b.type === type && b.selection === selection,
    );
  };

  // রুলেট নাম্বারের রঙ (লাল/কালো) - ক্যাসিনো স্টাইল
  const getNumberColor = (num) => {
    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    if (num === 0) return "#059669";
    return redNumbers.includes(num) ? "#dc2626" : "#1e293b";
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #fbbf24",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%)",
        padding: "16px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "100px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* হেডার */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          padding: "0 8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fbbf24, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#000",
              boxShadow: "0 0 15px rgba(245,158,11,0.4)",
            }}
          >
            R
          </div>
          <div>
            <p
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              পিরিয়ড
            </p>
            <p
              style={{
                fontFamily: "monospace",
                color: "#fbbf24",
                fontWeight: "bold",
                fontSize: "14px",
                margin: 0,
              }}
            >
              {currentPeriod}
            </p>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            padding: "8px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(51, 65, 85, 0.5)",
            textAlign: "right",
          }}
        >
          <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
            ব্যালেন্স
          </p>
          <p
            style={{
              fontFamily: "monospace",
              color: "#34d399",
              fontWeight: "bold",
              fontSize: "18px",
              margin: 0,
            }}
          >
            ৳{balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* টাইমার এবং হিস্ট্রি */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "linear-gradient(90deg, #0f172a, #1e293b)",
            padding: "12px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid rgba(51, 65, 85, 0.5)",
          }}
        >
          <div>
            <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
              টাইমার
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontWeight: "900",
                fontSize: "24px",
                margin: 0,
                color: timeLeft <= 5 ? "#f43f5e" : "#34d399",
                textShadow:
                  timeLeft <= 5 ? "0 0 10px #f43f5e" : "0 0 10px #34d399",
              }}
            >
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </p>
          </div>
          <button
            onClick={fetchHistory}
            style={{
              backgroundColor: "rgba(51, 65, 85, 0.5)",
              border: "none",
              color: "#cbd5e1",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⏱️
          </button>
        </div>
      </div>

      {/* বাজি ধরার ফর্ম */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          marginBottom: "16px",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#fbbf24",
              fontSize: "18px",
            }}
          >
            ৳
          </span>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="পরিমাণ লিখুন"
            disabled={timeLeft <= 5}
            style={{
              width: "100%",
              backgroundColor: "#020617",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "14px 16px 14px 40px",
              color: "white",
              fontFamily: "monospace",
              fontSize: "18px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {selectedBets.length > 0 && betAmount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              padding: "0 4px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              সিলেকশন: {selectedBets.length} টি
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}
            >
              মোট খরচ: ৳{(Number(betAmount) * selectedBets.length).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* 🎯 হুবহু ছবির মতো রুলেট বোর্ড */}
      <div style={{ width: "100%", maxWidth: "480px", marginBottom: "24px", backgroundColor: "#0d0d11", padding: "10px", borderRadius: "12px" }}>
        
        {/* ১. সবার উপরে ০ (Zero) */}
        <div style={{ marginBottom: "4px" }}>
          <button
            onClick={() => toggleSelection("number", "0")}
            style={{
              width: "100%", padding: "10px", borderRadius: "6px", fontWeight: "bold", fontSize: "18px",
              border: "2px solid", borderColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
              backgroundColor: isSelected("number", "0") ? "#fbbf24" : "#059669",
              color: isSelected("number", "0") ? "black" : "white", cursor: "pointer",
            }}
          >
            0
          </button>
        </div>

        {/* ২. মূল গ্রিড */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 3fr", gap: "4px" }}>
          
          {/* --- কলাম ১: বাম দিকের ৬টি বাটন --- */}
          <div style={{ display: "grid", gridTemplateRows: "repeat(6, 1fr)", gap: "4px" }}>
            {/* 🆕 low এর বদলে 1-18 */}
            <button onClick={() => toggleSelection("1-18", "1-18")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("1-18", "1-18") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("1-18", "1-18") ? "black" : "#cbd5e1", cursor: "pointer" }}>1-18</button>
            <button onClick={() => toggleSelection("even", "even")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("even", "even") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("even", "even") ? "black" : "#cbd5e1", cursor: "pointer" }}>EVEN</button>
            <button onClick={() => toggleSelection("red", "red")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "18px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("red", "red") ? "#dc2626" : "rgba(30, 41, 59, 0.8)", color: "white", cursor: "pointer" }}>♦️</button>
            <button onClick={() => toggleSelection("black", "black")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "18px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("black", "black") ? "#1e293b" : "rgba(30, 41, 59, 0.8)", color: "white", cursor: "pointer" }}>♠️</button>
            <button onClick={() => toggleSelection("odd", "odd")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("odd", "odd") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("odd", "odd") ? "black" : "#cbd5e1", cursor: "pointer" }}>ODD</button>
            {/* 🆕 high এর বদলে 19-36 */}
            <button onClick={() => toggleSelection("19-36", "19-36")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("19-36", "19-36") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("19-36", "19-36") ? "black" : "#cbd5e1", cursor: "pointer" }}>19-36</button>
          </div>

          {/* --- কলাম ২: লম্বা ৩টি ডজন --- */}
          <div style={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)", gap: "4px" }}>
            <button onClick={() => toggleSelection("1-12", "1-12")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("1-12", "1-12") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("1-12", "1-12") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>1st 12</button>
            <button onClick={() => toggleSelection("13-24", "13-24")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("13-24", "13-24") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("13-24", "13-24") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>2nd 12</button>
            <button onClick={() => toggleSelection("25-36", "25-36")} style={{ padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: isSelected("25-36", "25-36") ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)", color: isSelected("25-36", "25-36") ? "black" : "#cbd5e1", cursor: "pointer", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>3rd 12</button>
          </div>

          {/* --- কলাম ৩: ১-৩৬ নাম্বার গ্রিড এবং নিচে ৩টি 2:1 বাটন --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
              {Array.from({ length: 12 }).map((_, rowIndex) => {
                const nums = [rowIndex * 3 + 1, rowIndex * 3 + 2, rowIndex * 3 + 3];
                return nums.map((num) => {
                  const active = isSelected("number", String(num));
                  const bgColor = getNumberColor(num);
                  return (
                    <button
                      key={num}
                      onClick={() => toggleSelection("number", String(num))}
                      style={{
                        padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "14px",
                        border: active ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: active ? "#fbbf24" : bgColor,
                        color: active ? "black" : "white", cursor: "pointer",
                      }}
                    >
                      {num}
                    </button>
                  );
                });
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
              {[1, 2, 3].map((colNum) => {
                const type = `col_${colNum}`;
                const selection = `col_${colNum}`;
                const active = isSelected(type, selection);
                return (
                  <button
                    key={colNum}
                    onClick={() => toggleSelection(type, selection)}
                    style={{
                      padding: "8px 2px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: active ? "rgba(245, 158, 11, 0.9)" : "rgba(30, 41, 59, 0.8)",
                      color: active ? "black" : "#cbd5e1", cursor: "pointer",
                    }}
                  >
                    2:1
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* কনফার্ম বাটন */}
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {message && (
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "12px",
              backgroundColor:
                message.type === "success"
                  ? "rgba(6, 78, 59, 0.9)"
                  : "rgba(136, 19, 55, 0.9)",
              color: message.type === "success" ? "#34d399" : "#f87171",
              border: "1px solid",
              borderColor: message.type === "success" ? "#059669" : "#e11d48",
            }}
          >
            {message.text}
          </div>
        )}
        <button
          onClick={handleBet}
          disabled={submitting || timeLeft <= 5}
          style={{
            width: "100%",
            background:
              timeLeft <= 5
                ? "#334155"
                : "linear-gradient(to right, #f59e0b, #d97706)",
            color: timeLeft <= 5 ? "#94a3b8" : "black",
            fontWeight: "900",
            padding: "18px",
            borderRadius: "16px",
            border: "none",
            cursor: timeLeft <= 5 ? "not-allowed" : "pointer",
            transition: "transform 0.1s",
            boxShadow:
              timeLeft <= 5
                ? "none"
                : "0 10px 25px -5px rgba(245, 158, 11, 0.5)",
            fontSize: "16px",
            letterSpacing: "1px",
          }}
        >
          {timeLeft <= 5
            ? "বাজি বন্ধ (অপেক্ষা করুন)"
            : submitting
              ? "প্রসেসিং..."
              : `বাজি ধরুন (${selectedBets.length} টি)`}
        </button>
      </div>

      {/* 🆕 সাম্প্রতিক রেজাল্ট কার্সেল */}
      {recentResults.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "16px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "none",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              whiteSpace: "nowrap",
              fontWeight: "bold",
            }}
          >
            সাম্প্রতিক:
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {recentResults.map((num, idx) => (
              <div
                key={idx}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "12px",
                  flexShrink: 0,
                  backgroundColor: getNumberColor(num),
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🏆 উইন পপআপ */}
      {winPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #1e293b 0%, #020617 100%)",
              border: "2px solid #10b981",
              borderRadius: "24px",
              padding: "32px 24px",
              maxWidth: "360px",
              width: "100%",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 50px rgba(16,185,129,0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "200px",
                height: "200px",
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
                zIndex: 0,
              }}
            ></div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  background: "linear-gradient(135deg, #34d399, #059669)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  border: "4px solid #020617",
                  boxShadow: "0 0 30px rgba(16,185,129,0.5)",
                }}
              >
                <span style={{ fontSize: "48px" }}>👑</span>
              </div>

              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  color: "#34d399",
                  margin: "0 0 8px 0",
                  textShadow: "0 2px 10px rgba(52,211,153,0.5)",
                }}
              >
                অভিনন্দন!
              </h2>
              <p
                style={{
                  color: "#cbd5e1",
                  margin: "0 0 24px 0",
                  fontSize: "14px",
                }}
              >
                আপনি এই রাউন্ডে জিতেছেন!
              </p>

              <div
                style={{
                  backgroundColor: "rgba(2, 6, 23, 0.8)",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "24px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>উইনিং নাম্বার:</span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "white",
                      fontFamily: "monospace",
                      backgroundColor: getNumberColor(
                        Number(winPopup.winningNumber),
                      ),
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {winPopup.winningNumber}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>মাল্টিপ্লায়ার:</span>
                  <span
                    style={{
                      fontWeight: "900",
                      color: "#fbbf24",
                      backgroundColor: "rgba(245,158,11,0.1)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {winPopup.multiplier}x
                  </span>
                </div>
                <div
                  style={{ borderTop: "1px solid #1e293b", margin: "12px 0" }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#94a3b8", fontWeight: "bold" }}>
                    প্রাইজ মানি:
                  </span>
                  <span
                    style={{
                      fontWeight: "900",
                      color: "#34d399",
                      fontSize: "28px",
                      textShadow: "0 0 15px rgba(52,211,153,0.4)",
                    }}
                  >
                    ৳{winPopup.payout}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const roundId = winPopup.round;
                  setDismissedPopups((prev) => [...prev, roundId]);
                  setWinPopup(null);
                }}
                style={{
                  width: "100%",
                  background: "linear-gradient(to right, #059669, #047857)",
                  color: "white",
                  fontWeight: "bold",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  boxShadow: "0 5px 15px rgba(5,150,105,0.3)",
                }}
              >
                দুর্দান্ত! ধন্যবাদ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* বেট হিস্ট্রি পপআপ */}
      {isHistoryOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                borderBottom: "1px solid #1e293b",
                backgroundColor: "rgba(2, 6, 23, 0.5)",
              }}
            >
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#fbbf24",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ⏱️ বেট হিস্ট্রি
              </h2>
              <button
                onClick={() => setIsHistoryOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  backgroundColor: "#1e293b",
                  color: "#94a3b8",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
              {historyLoading ? (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#64748b",
                    padding: "16px 0",
                  }}
                >
                  লোড হচ্ছে...
                </p>
              ) : historyData.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#64748b",
                    padding: "16px 0",
                  }}
                >
                  কোনো বেট হিস্ট্রি নেই।
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {historyData.map((item, index) => {
                    const actualNumber =
                      item.winningNumber !== undefined &&
                      item.winningNumber !== null
                        ? item.winningNumber
                        : "N/A";

                    const isWin = item.status === "win";
                    const payoutAmount = item.payout || 0;
                    const betAmount = item.betAmount || 0;

                    return (
                      <div
                        key={index}
                        style={{
                          backgroundColor: "#020617",
                          border: "1px solid #1e293b",
                          padding: "12px",
                          borderRadius: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              color: "#cbd5e1",
                              fontWeight: "bold",
                              fontSize: "12px",
                            }}
                          >
                            {item.periodNumber}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              fontSize: "10px",
                            }}
                          >
                            <span style={{ color: "#64748b" }}>
                              রেজাল্ট:{" "}
                              <span
                                style={{
                                  fontWeight: "bold",
                                  color: "#60a5fa",
                                }}
                              >
                                {actualNumber}
                              </span>
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "#94a3b8",
                              marginTop: "4px",
                            }}
                          >
                            চয়েস:{" "}
                            <span
                              style={{ fontWeight: "bold", color: "#fbbf24" }}
                            >
                              {item.userChoice || "N/A"}
                            </span>
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "4px",
                          }}
                        >
                          <p
                            style={{
                              fontWeight: "900",
                              fontSize: "12px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              margin: 0,
                              backgroundColor: isWin
                                ? "rgba(16,185,129,0.1)"
                                : "rgba(244,63,94,0.1)",
                              color: isWin ? "#34d399" : "#f43f5e",
                            }}
                          >
                            {isWin ? `WIN ${item.multiplier}x` : "LOSS"}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              fontSize: "11px",
                              margin: 0,
                              alignItems: "center",
                              marginTop: "4px",
                            }}
                          >
                            <span style={{ color: "#64748b" }}>
                              বাজি:{" "}
                              <span
                                style={{ color: "white", fontWeight: "bold" }}
                              >
                                ৳{betAmount}
                              </span>
                            </span>

                            {isWin && (
                              <span
                                style={{
                                  color: "#34d399",
                                  fontWeight: "bold",
                                  backgroundColor: "rgba(52,211,153,0.1)",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                +৳{payoutAmount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}