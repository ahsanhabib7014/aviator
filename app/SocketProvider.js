// "use client";
// import { createContext, useContext, useEffect, useState, useRef } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext(null);

// export function SocketProvider({ children }) {
//   const [socket, setSocket] = useState(null);
//   const [gameState, setGameState] = useState(null);

//   // 🆕 ফলব্যাক পোলিং ট্র্যাক করার জন্য রেফ
//   const pollingIntervalRef = useRef(null);

//   useEffect(() => {
//     // 🆕 Socket.io কানেকশন (অটো রিকানেক্ট সহ)
//     const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;

//     const newSocket = io(socketUrl, {
//       path: "/socket.io",
//       transports: ["websocket"],
//       withCredentials: true,
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//     });

//     // 🆕 সার্ভার থেকে আসা ডাটা
//     newSocket.on("gameState", (state) => {
//       setGameState(state);
//     });

//     // 🆕 কানেক্ট হলে ফলব্যাক পোলিং বন্ধ করা
//     newSocket.on("connect", () => {
//       console.log("✅ Socket Connected");
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//         pollingIntervalRef.current = null;
//       }
//     });

//     // 🆕 ডিসকানেক্ট হলে ফলব্যাক পোলিং চালু করা
//     newSocket.on("disconnect", (reason) => {
//       console.warn("❌ Socket Disconnected:", reason);
//       startFallbackPolling();
//     });

//     // 🆕 কানেকশন এরর হলে ফলব্যাক চালু করা
//     newSocket.on("connect_error", (error) => {
//       console.warn("⚠️ Socket Connect Error:", error.message);
//       startFallbackPolling();
//     });

//     setSocket(newSocket);

//     // 🆕 ফলব্যাক পোলিং ফাংশন
//     const startFallbackPolling = () => {
//       // যদি ইতিমধ্যে চালু থাকে, তবে আবার শুরু করবে না
//       if (pollingIntervalRef.current) return;

//       pollingIntervalRef.current = setInterval(async () => {
//         try {
//           const res = await fetch("/api/crash-game/state", {
//             credentials: "include",
//           });
//           if (!res.ok) return;

//           const data = await res.json();
//           if (data && data.status) {
//             // 🆕 Socket থেকে আসা ডাটার মতোই ফরম্যাট করে সেট করা
//             setGameState({
//               ...data,
//               bets: data.bets || [],
//               totalBetsAmount: data.totalBetsAmount || 0,
//             });
//           }
//         } catch (err) {
//           console.error("Fallback Polling Error:", err);
//         }
//       }, 3000); // প্রতি ৩ সেকেন্ডে একবার
//     };

//     // ক্লিনআপ ফাংশন
//     return () => {
//       newSocket.disconnect();
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket, gameState }}>
//       {children}
//     </SocketContext.Provider>
//   );
// }

// export function useSocket() {
//   return useContext(SocketContext);
// }
// ////////////////////////////////////////////
