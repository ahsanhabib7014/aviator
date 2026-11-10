"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/app/SocketProvider";

export default function HighFlyerGame() {
  // --- STATE ---
  const [userBalance, setUserBalance] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("WAITING");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [countdownTimer, setCountdownTimer] = useState(10);
  const [roundId, setRoundId] = useState("...");
  const [multiplierHistory, setMultiplierHistory] = useState([]);

  const [panels, setPanels] = useState({
    1: {
      bet: 10,
      hasBet: false,
      cashedOut: false,
      autoCash: false,
      autoVal: 1.01,
    },
    2: {
      bet: 10,
      hasBet: false,
      cashedOut: false,
      autoCash: false,
      autoVal: 1.01,
    },
  });

  const [liveBets, setLiveBets] = useState([]);
  const [totalBetsCount, setTotalBetsCount] = useState(0);
  const [totalBetsAmount, setTotalBetsAmount] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("bets");
  const [userHistory, setUserHistory] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🆕 গ্লোবাল টোস্ট নোটিফিকেশন
  const [toast, setToast] = useState(null);

  const router = useRouter();

  // --- REFS ---
  const canvasRef = useRef(null);
  const phaseRef = useRef("WAITING");
  const multiplierRef = useRef(1.0);
  const crashMultiplierRef = useRef(2.0);
  const animationFrameId = useRef(null);
  const panelsRef = useRef(panels);
  const hasFetchedCrash = useRef(false);

  // 🆕 সার্ভার টাইম ট্র্যাকিং
  const serverStartTimeRef = useRef(0);
  const serverNextRoundTimeRef = useRef(0);

  // 🆕 রাউন্ড ট্র্যাকিং (বাটন রিসেটের জন্য)
  const roundIdRef = useRef("");

  // 🆕 Socket.io কানেকশন
  const { socket, gameState } = useSocket();

  useEffect(() => {
    panelsRef.current = panels;
  }, [panels]);

  // ==========================================
  // ১. Auth চেক
  // ==========================================
  const checkAuth = useCallback(async () => {
    try {
      let res = await fetch("/api/user/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUserBalance(Number(data.user.balance) || 0);
          setIsAuthenticated(true);
          setLoading(false);
          return true;
        }
      }
      let retries = 2;
      while (retries > 0 && (res.status === 401 || res.status >= 500)) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        res = await fetch("/api/user/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const retryData = await res.json();
          if (retryData.success && retryData.user) {
            setUserBalance(Number(retryData.user.balance) || 0);
            setIsAuthenticated(true);
            setLoading(false);
            return true;
          }
        }
        retries -= 1;
      }
      if (res.status === 401) {
        setIsAuthenticated(false);
        router.push("/login");
      }
      setLoading(false);
      return false;
    } catch (err) {
      setLoading(false);
      return false;
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ==========================================
  // ২. Socket.io থেকে আসা ডাটা আপডেট
  // ==========================================
  useEffect(() => {
    if (!gameState) return;

    if (gameState.status !== phaseRef.current) {
      setCurrentPhase(gameState.status.toUpperCase());
      phaseRef.current = gameState.status.toLowerCase();
    }

    if (gameState.roundId) setRoundId(gameState.roundId);
    if (gameState.crashAt) crashMultiplierRef.current = gameState.crashAt;

    if (gameState.startTime) serverStartTimeRef.current = gameState.startTime;
    if (gameState.nextRoundTime)
      serverNextRoundTimeRef.current = gameState.nextRoundTime;

    if (gameState.status === "flying") {
      if (gameState.multiplier > multiplierRef.current) {
        setCurrentMultiplier(gameState.multiplier);
        multiplierRef.current = gameState.multiplier;
      }
    }

    if (gameState.history) {
      setMultiplierHistory(gameState.history);
    }

    if (gameState.bets) {
      setLiveBets(gameState.bets);
      setTotalBetsCount(gameState.totalBetsCount || gameState.bets.length || 0);
      setTotalBetsAmount(gameState.totalBetsAmount || 0);
    }

    // 🆕 শুধুমাত্র নতুন রাউন্ড শুরু হলেই প্যানেল রিসেট হবে
    if (gameState.roundId && gameState.roundId !== roundIdRef.current) {
      roundIdRef.current = gameState.roundId;
      setPanels((prev) => ({
        1: { ...prev[1], hasBet: false, cashedOut: false },
        2: { ...prev[2], hasBet: false, cashedOut: false },
      }));
    }
  }, [gameState]);

  // ==========================================
  // ৩. Socket ইভেন্ট লিসেনার
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    socket.on("betSuccess", (data) => {
      setUserBalance(Number(data.newBalance).toFixed(2));
      setToast({ type: "success", message: data.message });
      setTimeout(() => setToast(null), 3000);
    });

    socket.on("betError", (data) => {
      setToast({ type: "error", message: data.message });
      setTimeout(() => setToast(null), 3000);
      setPanels((prev) => ({
        1: { ...prev[1], hasBet: false },
        2: { ...prev[2], hasBet: false },
      }));
    });

    socket.on("cashoutSuccess", (data) => {
      setUserBalance(Number(data.newBalance).toFixed(2));
      setLastResult({
        type: "win",
        multiplier: data.multiplier,
        amount: data.winAmount,
      });
      setToast({ type: "success", message: data.message });
      setTimeout(() => setLastResult(null), 4000);
      setTimeout(() => setToast(null), 3000);
    });

    socket.on("cashoutError", (data) => {
      setToast({ type: "error", message: data.message });
      setTimeout(() => setToast(null), 3000);
    });

    return () => {
      socket.off("betSuccess");
      socket.off("betError");
      socket.off("cashoutSuccess");
      socket.off("cashoutError");
    };
  }, [socket]);

  // ==========================================
  // ৪. লোকাল গেম লুপ (মাল্টিপ্লায়ার স্মুথ আপডেট)
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) return;

    let animationFrameId;
    let lastSec = -1;

    const gameLoop = () => {
      const now = Date.now();

      if (phaseRef.current === "waiting") {
        const diff = serverNextRoundTimeRef.current - now;
        const secs = Math.ceil(diff / 1000);
        if (secs !== lastSec && secs >= 0) {
          lastSec = secs;
          setCountdownTimer(secs);
        }
      } else if (phaseRef.current === "flying") {
        const timePassed = (now - serverStartTimeRef.current) / 1000;
        let calcMultiplier = 1.0 + Math.pow(timePassed * 0.55, 1.45);
        if (calcMultiplier < 1) calcMultiplier = 1;

        // Auto Cashout চেক
        if (calcMultiplier < crashMultiplierRef.current) {
          [1, 2].forEach((pId) => {
            const p = panelsRef.current[pId];
            if (p.hasBet && !p.cashedOut && p.autoCash) {
              const autoVal = Number(p.autoVal);
              if (calcMultiplier >= autoVal) {
                handleCashout(pId, autoVal);
              }
            }
          });
        }

        if (calcMultiplier >= crashMultiplierRef.current) {
          calcMultiplier = crashMultiplierRef.current;
          setCurrentMultiplier(calcMultiplier);
          multiplierRef.current = calcMultiplier;
        } else {
          setCurrentMultiplier(calcMultiplier);
          multiplierRef.current = calcMultiplier;
        }
      } else if (phaseRef.current === "crashed") {
        const diff = serverNextRoundTimeRef.current - now;
        const secs = Math.ceil(diff / 1000);
        if (secs !== lastSec && secs >= 0) {
          lastSec = secs;
          setCountdownTimer(secs > 0 ? secs : 3);
        }
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAuthenticated]);

  // ==========================================
  // ৫. হিস্ট্রি (Socket থেকে আসছে, API পোলিং নেই)
  // ==========================================
  const fetchUserHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/crash-game/user-history", {
        credentials: "include",
      });
      if (res.status === 401) return;
      const data = await res.json();
      if (data.success) setUserHistory(data.history);
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated || sidebarTab !== "history") return;
    fetchUserHistory();
  }, [sidebarTab, isAuthenticated, fetchUserHistory]);

  useEffect(() => {
    if (sidebarTab === "history" && gameState?.roundId) {
      fetchUserHistory();
    }
  }, [gameState?.roundId, sidebarTab, fetchUserHistory]);

  // ==========================================
  // ৬. ক্যানভাস অ্যানিমেশন
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const planeImg = new Image();
    planeImg.src = "/plane.png";

    const draw = () => {
      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#0a0c10";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (phaseRef.current === "flying") {
        const progress = Math.min((multiplierRef.current - 1) / 10, 1);
        const px = 90 + progress * w * 0.7;
        const py = h - 60 - Math.pow(progress, 0.7) * (h * 0.7);

        ctx.beginPath();
        ctx.moveTo(40, h - 30);
        ctx.quadraticCurveTo(w * 0.3, h - 40, px, py);
        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 4;
        ctx.stroke();

        if (planeImg.complete && planeImg.naturalHeight !== 0) {
          ctx.drawImage(planeImg, px - 30, py - 30, 60, 60);
        }
      } else if (phaseRef.current === "waiting") {
        if (planeImg.complete && planeImg.naturalHeight !== 0) {
          ctx.drawImage(planeImg, 60, h - 90, 60, 60);
        }
      }
      animationFrameId.current = requestAnimationFrame(draw);
    };
    animationFrameId.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isAuthenticated]);

  // ==========================================
  // ৭. হ্যান্ডলারস (Socket.io)
  // ==========================================
  const handleCashout = (pId, mult) => {
    const p = panelsRef.current[pId];
    if (!p.hasBet || p.cashedOut || phaseRef.current !== "flying") return;

    // 🆕 সার্ভারে পাঠানোর জন্য টার্গেট মাল্টিপ্লায়ার নির্ধারণ
    let targetMultiplier = mult;
    if (p.autoCash && p.autoVal) {
      targetMultiplier = Number(p.autoVal);
    }

    setPanels((prev) => ({
      ...prev,
      [pId]: { ...prev[pId], cashedOut: true, hasBet: false },
    }));

    if (socket) {
      // 🆕 সার্ভারে টার্গেট মাল্টিপ্লায়ার পাঠানো হলো
      socket.emit("cashout", { targetMultiplier: targetMultiplier });
    }
  };

  const handleBetClick = async (pId) => {
    const p = panels[pId];

    if (currentPhase === "FLYING" && p.hasBet && !p.cashedOut) {
      handleCashout(pId, multiplierRef.current);
      return;
    }

    if (!p.hasBet) {
      const amount = Number(p.bet);
      // 🆕 সার্ভারে চেক হবে, তাই এখানে alert বাদ দেওয়া হলো
      if (isNaN(amount) || amount <= 0) {
        setToast({ type: "error", message: "সঠিক পরিমাণ লিখুন!" });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      if (userBalance < amount) {
        setToast({ type: "error", message: "পর্যাপ্ত ব্যালেন্স নেই!" });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      setPanels((prev) => ({
        ...prev,
        [pId]: { ...prev[pId], hasBet: true, cashedOut: false },
      }));

      if (socket) {
        socket.emit("placeBet", { amount: amount });
      }
    }
  };

  const adjustBet = (pId, delta) => {
    setPanels((prev) => {
      const currentBet = Number(prev[pId].bet) || 0;
      const newVal = Math.max(1, Math.min(500000, currentBet + delta));
      return { ...prev, [pId]: { ...prev[pId], bet: newVal } };
    });
  };

  const addBetAmount = (pId, amount) => {
    setPanels((prev) => {
      // 🆕 সরাসরি ভ্যালু সেট হবে, আগের সাথে যোগ হবে না
      return { ...prev, [pId]: { ...prev[pId], bet: amount } };
    });
  };

  const toggleAutoCash = (pId) => {
    setPanels((prev) => ({
      ...prev,
      [pId]: { ...prev[pId], autoCash: !prev[pId].autoCash },
    }));
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#090d16] text-white">
        {/* 🆕 সবুজ রঙের ঘুরন্ত রিং */}
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>

        {/* 🆕 নিচের লেখা */}
        <div className="text-sm font-medium text-gray-300 tracking-wider animate-pulse">
          যাচাই করা হচ্ছে...
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER UI (আপনার আগের UI হুবহু একই)
  // ==========================================
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0c10] text-gray-200 font-sans select-none">
      {/* 🆕 সুন্দর কাস্টম টোস্ট নোটিফিকেশন (উপরে মাঝখানে) */}
      {toast && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300">
          <div
            className={`${
              toast.type === "success"
                ? "bg-emerald-900/90 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-red-900/90 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            } border text-white px-6 py-3 rounded-xl flex items-center space-x-3 backdrop-blur-md`}
          >
            <span className="text-xl">
              {toast.type === "success" ? "✅" : "⚠️"}
            </span>
            <span className="font-medium text-sm">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-gray-300 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <header className="h-12 bg-[#12151c] border-b border-gray-800/60 px-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold px-2 py-0.5 rounded text-xs tracking-wider uppercase flex items-center">
            <span className="mr-1">✈</span> HIGH FLYER
          </div>
          <div className="h-4 w-[1px] bg-gray-700/50"></div>
          <div className="text-[11px] text-gray-400 font-mono flex items-center space-x-1">
            <span>Round:</span>
            <span className="text-amber-400 font-bold">{roundId}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        <aside className="w-full md:w-72 bg-[#12151c] border-r border-gray-800/60 flex flex-col shrink-0 z-10 h-48 md:h-auto">
          <div className="grid grid-cols-4 bg-[#0a0c10] p-1 gap-1 text-[11px] font-semibold text-gray-400 border-b border-gray-800/60">
            <button
              onClick={() => setSidebarTab("bets")}
              className={`py-1.5 text-center rounded transition ${sidebarTab === "bets" ? "bg-[#1e2330] text-white" : "hover:text-white"}`}
            >
              Bets
            </button>
            <button
              onClick={() => setSidebarTab("history")}
              className={`py-1.5 text-center rounded transition ${sidebarTab === "history" ? "bg-[#1e2330] text-white" : "hover:text-white"}`}
            >
              History
            </button>
          </div>

          {sidebarTab === "bets" && (
            <>
              <div className="p-2.5 bg-[#171b26] border-b border-gray-800/60 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px] pt-1">
                  <div className="text-gray-400">
                    Total bets:{" "}
                    <span className="text-white font-mono font-semibold">
                      {totalBetsCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    ৳{" "}
                    <span className="text-amber-400 font-mono font-bold">
                      {Number(totalBetsAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] font-medium text-gray-400 border-b border-gray-800/40 bg-[#12151c]">
                <div>User</div>
                <div className="text-right">Bet ৳</div>
                <div className="text-right">Cashed ৳</div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-800/30 text-[11px]">
                {liveBets.length > 0 ? (
                  liveBets.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 px-3 py-2 items-center hover:bg-white/5 transition"
                    >
                      <div className="truncate text-gray-300 font-medium">
                        {item.user
                          ? item.user
                          : item.phone
                            ? item.phone.slice(0, 3) +
                              "****" +
                              item.phone.slice(-3)
                            : ""}
                      </div>
                      <div className="text-right font-mono text-gray-200">
                        {Number(item.amount || item.bet).toFixed(2)}
                      </div>
                      <div className="text-right">
                        {item.cashedOutAt ? (
                          <div className="flex flex-col items-end">
                            <span className="text-emerald-400 font-bold">
                              {Number(item.cashedOutAt).toFixed(2)}x
                            </span>
                            <span className="text-[9px] text-emerald-500/70 font-mono">
                              ৳
                              {Number(item.amount * item.cashedOutAt).toFixed(
                                2,
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    কোনো বাজি নেই
                  </div>
                )}
              </div>
            </>
          )}

          {sidebarTab === "history" && (
            <>
              <div className="grid grid-cols-2 px-3 py-1.5 text-[10px] font-medium text-gray-400 border-b border-gray-800/40 bg-[#12151c]">
                <div>Round / Bet</div>
                <div className="text-right">Result</div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-800/30 text-[11px]">
                {userHistory.length > 0 ? (
                  userHistory.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col px-3 py-2 hover:bg-white/5 transition gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-[10px]">
                          {item.roundId}
                        </span>
                        <span
                          className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${item.isWin ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}
                        >
                          {item.isWin ? "WIN" : "LOSS"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-300">
                          বেট:{" "}
                          <span className="font-mono text-white">
                            ৳{Number(item.betAmount).toFixed(2)}
                          </span>
                        </div>
                        {item.isWin ? (
                          <div className="text-right">
                            <span className="text-amber-400 font-mono text-xs">
                              {Number(item.multiplier).toFixed(2)}x
                            </span>
                            <div className="text-emerald-400 font-bold font-mono text-[11px]">
                              +৳{Number(item.payout).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-red-400 font-bold font-mono text-[11px]">
                            -৳
                            {Number(item.lossAmount || item.betAmount).toFixed(
                              2,
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    কোনো হিস্ট্রি নেই
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-[#0c0e14] relative overflow-hidden">
          <div className="flex-1 relative min-h-[250px] flex items-center justify-center bg-[#0e1118]">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full block"
            ></canvas>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-2">
              {currentPhase === "WAITING" && (
                <div className="flex flex-col items-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider text-white drop-shadow-lg text-center">
                    NEXT GAME IN{" "}
                    <span className="text-amber-400 ml-1">
                      {countdownTimer}s
                    </span>
                  </div>
                  <div className="w-40 sm:w-48 h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdownTimer / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {currentPhase === "FLYING" && (
                <div className="flex flex-col items-center">
                  <div className="text-4xl sm:text-6xl md:text-7xl font-black font-mono text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    {Number(currentMultiplier).toFixed(2)}x
                  </div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-amber-400 mt-2 bg-black/40 px-3 py-1 rounded-full border border-amber-500/30">
                    FLEW OFF!
                  </div>
                </div>
              )}
              {currentPhase === "CRASHED" && (
                <div className="flex flex-col items-center bg-red-950/20 p-4 rounded-xl">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-red-500 mb-1">
                    FLEW AWAY AT
                  </div>
                  <div className="text-4xl sm:text-6xl md:text-7xl font-black font-mono text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]">
                    {Number(crashMultiplierRef.current).toFixed(2)}x
                  </div>
                </div>
              )}
            </div>
            {lastResult && lastResult.type === "win" && (
              <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
                <div className="p-5 sm:p-8 rounded-3xl border-2 bg-emerald-950/90 border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.6)] text-center animate-bounce w-full max-w-sm">
                  <div className="text-5xl sm:text-7xl mb-2 sm:mb-4">🎉</div>
                  <h2 className="text-2xl sm:text-4xl font-black mb-2 text-emerald-400">
                    আপনি জিতেছেন!
                  </h2>
                  <div className="mt-2 sm:mt-4 p-3 sm:p-4 bg-black/40 rounded-xl border border-emerald-500/30">
                    <p className="text-gray-300 text-xs sm:text-sm mb-1">
                      ক্যাশআউট
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {Number(lastResult.multiplier).toFixed(2)}x
                    </p>
                    <p className="text-base sm:text-lg font-bold text-emerald-400 mt-2">
                      ৳ {Number(lastResult.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#12151c] border-t border-gray-800/80 p-2 md:p-3 z-10">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {[1, 2].map((pId) => {
                const p = panels[pId];
                return (
                  <div
                    key={pId}
                    className="bg-[#181c27] border border-gray-800 rounded-xl p-2 md:p-2.5 flex flex-col justify-between shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex-1 bg-[#0f1118] border border-gray-700/60 rounded-lg p-1.5 flex items-center justify-between">
                        <button
                          onClick={() => adjustBet(pId, -1)}
                          className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <div className="text-center flex-1">
                          <input
                            type="number"
                            value={p.bet}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setPanels((prev) => ({
                                ...prev,
                                [pId]: {
                                  ...prev[pId],
                                  bet: isNaN(val) ? "" : val,
                                },
                              }));
                            }}
                            className="w-full bg-transparent text-center font-mono font-bold text-white text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <button
                          onClick={() => adjustBet(pId, 1)}
                          className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex-1 h-full min-h-[48px]">
                        <button
                          onClick={() => handleBetClick(pId)}
                          className={`w-full h-full rounded-lg font-black text-xs sm:text-sm uppercase tracking-wider flex flex-col items-center justify-center transition ${currentPhase === "FLYING" && p.hasBet && !p.cashedOut ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.5)]" : p.hasBet ? "bg-red-700 text-white" : "bg-gradient-to-r from-emerald-500 to-green-600 text-black"}`}
                        >
                          {currentPhase === "FLYING" &&
                          p.hasBet &&
                          !p.cashedOut ? (
                            <>
                              <span>CASHOUT</span>
                              <span className="font-mono text-[10px] sm:text-[11px]">
                                ৳{" "}
                                {(Number(p.bet) * currentMultiplier).toFixed(2)}
                              </span>
                            </>
                          ) : p.hasBet ? (
                            "CANCEL BET"
                          ) : (
                            "BET"
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-2">
                      {[10, 30, 50, 100, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => addBetAmount(pId, amt)}
                          className="bg-[#212634] hover:bg-[#2b3245] text-white font-mono text-[10px] sm:text-[11px] py-1.5 rounded font-bold border border-gray-700/40 transition active:scale-95"
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-gray-800/60 gap-y-1">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <button className="hover:text-gray-200">
                          <i className="fa-solid fa-rotate-right"></i>
                        </button>
                        <button className="hover:text-gray-200">
                          <i className="fa-solid fa-arrows-spin"></i>
                        </button>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <span className="text-gray-400 text-[9px] sm:text-[10px]">
                          Auto Cashout
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.autoCash}
                            onChange={() => toggleAutoCash(pId)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={p.autoVal}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setPanels((prev) => ({
                                ...prev,
                                [pId]: {
                                  ...prev[pId],
                                  autoVal: isNaN(val) ? "" : val,
                                },
                              }));
                            }}
                            className="w-14 sm:w-16 bg-[#0f1118] border border-gray-700 rounded px-1.5 sm:px-2 py-1 text-right font-mono text-[11px] sm:text-xs text-white focus:outline-none"
                          />
                          <span className="text-gray-400 text-[10px] ml-0.5">
                            x
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="h-9 bg-[#0b0d12] border-t border-gray-800/80 px-2 flex items-center justify-between shrink-0 overflow-hidden">
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {multiplierHistory.slice(0, 20).map((val, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border shrink-0 cursor-pointer hover:scale-105 transition ${val >= 100 ? "bg-pink-900/60 text-pink-300 border-pink-500/50" : val >= 10 ? "bg-purple-900/50 text-purple-300 border-purple-500/40" : val >= 2 ? "bg-indigo-900/40 text-indigo-300 border-indigo-500/30" : "bg-blue-900/40 text-cyan-400 border-blue-500/30"}`}
                >
                  {Number(val).toFixed(2)}x
                </span>
              ))}
            </div>
          </footer>

          <div className="bg-[#0b0d12] border-t border-gray-800/60 px-3 sm:px-4 py-1.5 flex items-center space-x-4 sm:space-x-6 text-xs z-10">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                BALANCE
              </span>
              <span className="font-mono font-extrabold text-white text-xs sm:text-sm">
                ৳ {Number(userBalance).toFixed(2)}
              </span>
            </div>
            <div className="h-3 w-[1px] bg-gray-800"></div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                TOTAL BET
              </span>
              <span className="font-mono font-bold text-gray-300">
                ৳{" "}
                {(
                  (panels[1]?.hasBet ? Number(panels[1].bet) : 0) +
                  (panels[2]?.hasBet ? Number(panels[2].bet) : 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
