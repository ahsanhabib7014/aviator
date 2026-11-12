// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSocket } from "@/app/SocketProvider";

// export default function ContactMessages() {
//   const router = useRouter();
//   const { socket } = useSocket();
//   const [isAuthorized, setIsAuthorized] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [filteredMessages, setFilteredMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [replyText, setReplyText] = useState({});
//   const [messageToast, setMessageToast] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // 🆕 রোল অনুযায়ী আনরিড কাউন্ট
//   const [unreadBreakdown, setUnreadBreakdown] = useState({
//     user: 0,
//     agent: 0,
//     "sub-admin": 0,
//   });

//   // 🆕 কোন রোলের মেসেজ দেখানো হবে (all, user, agent, sub-admin)
//   const [activeRoleFilter, setActiveRoleFilter] = useState("all");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");

//   const [confirmModal, setConfirmModal] = useState({
//     isOpen: false,
//     type: null,
//     messageId: null,
//   });

//   // 🆕 JWT HttpOnly চেক (শুধু admin)
//   useEffect(() => {
//     const checkAdmin = async () => {
//       try {
//         const res = await fetch("/api/user/me", {
//           credentials: "include",
//         });
//         const data = await res.json();

//         if (!data.success || !data.user) {
//           router.push("/login");
//           return;
//         }

//         if (data.user.role === "admin") {
//           setIsAuthorized(true);
//         } else {
//           router.push("/sub-admin");
//         }
//       } catch (err) {
//         router.push("/login");
//       }
//     };
//     checkAdmin();
//   }, [router]);

//   const fetchMessages = async () => {
//     try {
//       const res = await fetch("/api/admin/contact-messages", {
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (data.success) {
//         setMessages(data.messages);
//         setUnreadCount(data.unreadCount || 0);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🆕 প্রথমবার লোড
//   useEffect(() => {
//     if (isAuthorized) {
//       fetchMessages();
//     }
//   }, [isAuthorized]);

//   // 🆕 সকেট সিগন্যাল (শুধু সকেট, কোনো ফলব্যাক পোলিং নেই)
//   useEffect(() => {
//     if (!socket || !isAuthorized) return;
//     const handleUpdate = () => {
//       console.log("📢 contactTicketUpdated — fetching messages");
//       fetchMessages();
//     };
//     socket.on("contactTicketUpdated", handleUpdate);
//     return () => socket.off("contactTicketUpdated", handleUpdate);
//   }, [socket, isAuthorized]);

//   // 🆕 রোল অনুযায়ী আনরিড কাউন্ট বের করা
//   useEffect(() => {
//     const breakdown = { user: 0, agent: 0, "sub-admin": 0 };
//     messages.forEach((msg) => {
//       if (msg.status === "unread") {
//         if (msg.senderRole === "user") breakdown.user += 1;
//         else if (msg.senderRole === "agent") breakdown.agent += 1;
//         else if (msg.senderRole === "sub-admin") breakdown["sub-admin"] += 1;
//       }
//     });
//     setUnreadBreakdown(breakdown);
//   }, [messages]);

//   // 🆕 সার্চ, স্ট্যাটাস ফিল্টার এবং রোল ফিল্টার লজিক
//   useEffect(() => {
//     let result = [...messages];

//     // ১. স্ট্যাটাস ফিল্টার (all, unread, in_progress, resolved, closed)
//     if (activeFilter !== "all") {
//       result = result.filter((msg) => msg.status === activeFilter);
//     }

//     // ২. রোল ফিল্টার (all, user, agent, sub-admin)
//     if (activeRoleFilter !== "all") {
//       result = result.filter((msg) => msg.senderRole === activeRoleFilter);
//     }

//     // ৩. সার্চ ফিল্টার
//     if (searchTerm.trim() !== "") {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(
//         (msg) =>
//           msg.title?.toLowerCase().includes(term) ||
//           msg.phone?.toLowerCase().includes(term) ||
//           msg.message?.toLowerCase().includes(term) ||
//           msg.senderRole?.toLowerCase().includes(term),
//       );
//     }

//     setFilteredMessages(result);
//   }, [searchTerm, activeFilter, activeRoleFilter, messages]);

//   const handleAssign = async (messageId) => {
//     try {
//       const res = await fetch("/api/admin/contact-messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ messageId }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setMessageToast({ type: "success", text: data.message });
//         fetchMessages();
//         setTimeout(() => setMessageToast(null), 3000);
//       } else {
//         setMessageToast({ type: "error", text: data.message });
//         setTimeout(() => setMessageToast(null), 3000);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleReply = async (messageId) => {
//     const text = replyText[messageId];
//     if (!text || text.trim().length === 0) {
//       setMessageToast({ type: "error", text: "রিপ্লাই লিখুন!" });
//       setTimeout(() => setMessageToast(null), 3000);
//       return;
//     }
//     try {
//       const res = await fetch("/api/admin/contact-messages/reply", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ messageId, replyMessage: text }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setMessageToast({ type: "success", text: data.message });
//         setReplyText((prev) => ({ ...prev, [messageId]: "" }));
//         fetchMessages();
//         setTimeout(() => setMessageToast(null), 3000);
//       } else {
//         setMessageToast({ type: "error", text: data.message });
//         setTimeout(() => setMessageToast(null), 3000);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const openConfirmModal = (type, messageId) => {
//     setConfirmModal({ isOpen: true, type, messageId });
//   };

//   const handleConfirmAction = async () => {
//     const { type, messageId } = confirmModal;
//     setConfirmModal({ isOpen: false, type: null, messageId: null });
//     if (!messageId) return;

//     try {
//       if (type === "close") {
//         const res = await fetch("/api/admin/contact-messages/close", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({ messageId }),
//         });
//         const data = await res.json();
//         if (data.success) {
//           setMessageToast({ type: "success", text: data.message });
//           fetchMessages();
//         } else {
//           setMessageToast({ type: "error", text: data.message });
//         }
//       } else if (type === "delete") {
//         const res = await fetch(`/api/admin/contact-messages?id=${messageId}`, {
//           method: "DELETE",
//           credentials: "include",
//         });
//         const data = await res.json();
//         if (data.success) {
//           setMessageToast({ type: "success", text: data.message });
//           fetchMessages();
//         } else {
//           setMessageToast({ type: "error", text: "ডিলিট করতে সমস্যা হয়েছে" });
//         }
//       }
//       setTimeout(() => setMessageToast(null), 3000);
//     } catch (err) {
//       console.error(err);
//       setMessageToast({ type: "error", text: "সার্ভার এরর" });
//       setTimeout(() => setMessageToast(null), 3000);
//     }
//   };

//   const getRoleBadge = (role) => {
//     switch (role) {
//       case "user":
//         return "bg-blue-500/10 text-blue-400 border-blue-500/20";
//       case "agent":
//         return "bg-purple-500/10 text-purple-400 border-purple-500/20";
//       case "sub-admin":
//         return "bg-amber-500/10 text-amber-400 border-amber-500/20";
//       default:
//         return "bg-slate-800 text-slate-400 border-slate-700";
//     }
//   };

//   if (isAuthorized === null) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-slate-400">
//         <div className="text-center">
//           <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
//           <p className="text-sm">যাচাই করা হচ্ছে...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-200 p-4 md:p-8 relative">
//       {confirmModal.isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
//             <div className="flex items-center gap-3 mb-4 text-amber-400">
//               <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
//               <h3 className="text-lg font-bold text-white">আপনি কি নিশ্চিত?</h3>
//             </div>
//             <p className="text-sm text-slate-300 mb-6">
//               {confirmModal.type === "close"
//                 ? "আপনি কি সত্যিই এই টিকিটটি ক্লোজ করতে চান? ক্লোজ করার পর আর রিপ্লাই দেওয়া যাবে না।"
//                 : "আপনি কি সত্যিই এই টিকিটটি ডিলিট করতে চান? ডিলিট করার পর এটি আর ফিরে পাওয়া যাবে না।"}
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleConfirmAction}
//                 className={`flex-1 text-black font-bold py-2.5 rounded-xl text-sm transition ${
//                   confirmModal.type === "close"
//                     ? "bg-emerald-500 hover:bg-emerald-400"
//                     : "bg-rose-500 hover:bg-rose-400"
//                 }`}
//               >
//                 {confirmModal.type === "close"
//                   ? "হ্যাঁ, ক্লোজ করুন"
//                   : "হ্যাঁ, ডিলিট করুন"}
//               </button>
//               <button
//                 onClick={() =>
//                   setConfirmModal({
//                     isOpen: false,
//                     type: null,
//                     messageId: null,
//                   })
//                 }
//                 className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm border border-slate-700 transition"
//               >
//                 না
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-4xl mx-auto">
//         {messageToast && (
//           <div
//             className={`mb-6 px-4 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 ${
//               messageToast.type === "success"
//                 ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
//                 : "bg-rose-900/30 border-rose-500/50 text-rose-400"
//             }`}
//           >
//             {messageToast.text}
//           </div>
//         )}

//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl gap-3">
//           <div>
//             <h1 className="text-xl md:text-2xl font-black text-emerald-400 flex items-center gap-2">
//               <i className="fa-solid fa-envelope"></i> কন্টাক্ট টিকিট
//               {unreadCount > 0 && (
//                 <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full animate-pulse">
//                   {unreadCount} নতুন
//                 </span>
//               )}
//             </h1>
//             {/* 🆕 রোল অনুযায়ী ব্রেকডাউন (ক্লিকেবল) */}
//             {unreadCount > 0 && (
//               <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">
//                 <button
//                   onClick={() => setActiveRoleFilter("user")}
//                   className={`border px-2 py-0.5 rounded-full transition ${
//                     activeRoleFilter === "user"
//                       ? "bg-blue-600 border-blue-600 text-white"
//                       : "bg-blue-900/30 text-blue-400 border-blue-500/20 hover:bg-blue-900/50"
//                   }`}
//                 >
//                   ইউজার: {unreadBreakdown.user}
//                 </button>
//                 <button
//                   onClick={() => setActiveRoleFilter("agent")}
//                   className={`border px-2 py-0.5 rounded-full transition ${
//                     activeRoleFilter === "agent"
//                       ? "bg-purple-600 border-purple-600 text-white"
//                       : "bg-purple-900/30 text-purple-400 border-purple-500/20 hover:bg-purple-900/50"
//                   }`}
//                 >
//                   এজেন্ট: {unreadBreakdown.agent}
//                 </button>
//                 <button
//                   onClick={() => setActiveRoleFilter("sub-admin")}
//                   className={`border px-2 py-0.5 rounded-full transition ${
//                     activeRoleFilter === "sub-admin"
//                       ? "bg-amber-600 border-amber-600 text-white"
//                       : "bg-amber-900/30 text-amber-400 border-amber-500/20 hover:bg-amber-900/50"
//                   }`}
//                 >
//                   সাব-অ্যাডমিন: {unreadBreakdown["sub-admin"]}
//                 </button>
//                 {activeRoleFilter !== "all" && (
//                   <button
//                     onClick={() => setActiveRoleFilter("all")}
//                     className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full hover:bg-slate-700 transition"
//                   >
//                     সব দেখুন ✕
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//           <button
//             onClick={fetchMessages}
//             className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition flex items-center gap-2 self-start md:self-center"
//           >
//             <i className="fa-solid fa-rotate-right"></i> রিফ্রেশ
//           </button>
//         </div>

//         <div className="mb-3 bg-slate-900 border border-slate-800 rounded-xl p-2">
//           <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
//             <i className="fa-solid fa-magnifying-glass text-slate-500 text-sm"></i>
//             <input
//               type="text"
//               maxLength="11"
//               pattern="[0-9]*"
//               inputMode="numeric"
//               placeholder="টাইটেল, ফোন বা মেসেজ দিয়ে খুঁজুন..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
//             />
//             {searchTerm && (
//               <button
//                 onClick={() => setSearchTerm("")}
//                 className="text-slate-500 hover:text-slate-300"
//               >
//                 <i className="fa-solid fa-xmark"></i>
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-2 mb-4">
//           {[
//             { key: "all", label: "সব", color: "emerald" },
//             { key: "unread", label: "নতুন", color: "red" },
//             { key: "in_progress", label: "চলমান", color: "amber" },
//             { key: "resolved", label: "সমাধান", color: "emerald" },
//             { key: "closed", label: "ক্লোজড", color: "slate" },
//           ].map((f) => (
//             <button
//               key={f.key}
//               onClick={() => setActiveFilter(f.key)}
//               className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
//                 activeFilter === f.key
//                   ? `bg-${f.color}-600 border-${f.color}-600 text-white`
//                   : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
//               }`}
//             >
//               {f.label} (
//               {f.key === "all"
//                 ? messages.length
//                 : messages.filter((m) => m.status === f.key).length}
//               )
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="text-center py-10 text-slate-500">লোড হচ্ছে...</div>
//         ) : filteredMessages.length === 0 ? (
//           <div className="text-center py-12 text-slate-500 bg-slate-900 rounded-xl border border-dashed border-slate-800">
//             <i className="fa-solid fa-inbox text-5xl mb-4 opacity-30"></i>
//             <p className="text-sm">কোনো টিকিট পাওয়া যায়নি।</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredMessages.map((msg) => (
//               <div
//                 key={msg._id}
//                 className={`bg-slate-900 border rounded-xl p-4 shadow-lg ${msg.status === "unread" ? "border-emerald-500/40" : "border-slate-800"}`}
//               >
//                 <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-3 flex-wrap gap-2">
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-bold text-white text-base md:text-lg">
//                       {msg.title}
//                     </h3>
//                     <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
//                       <span
//                         className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(msg.senderRole)}`}
//                       >
//                         {msg.senderRole === "user"
//                           ? "ইউজার"
//                           : msg.senderRole === "agent"
//                             ? "এজেন্ট"
//                             : msg.senderRole === "sub-admin"
//                               ? "সাব-অ্যাডমিন"
//                               : msg.senderRole}
//                       </span>
//                       <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[10px]">
//                         ফোন: {msg.phone}
//                       </span>
//                       <span className="text-slate-500 font-mono text-[10px]">
//                         {new Date(msg.createdAt).toLocaleString("bn-BD")}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span
//                       className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
//                         msg.status === "resolved"
//                           ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
//                           : msg.status === "in_progress"
//                             ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
//                             : msg.status === "closed"
//                               ? "bg-slate-700/50 text-slate-400 border-slate-600"
//                               : "bg-slate-800 text-slate-400 border-slate-700"
//                       }`}
//                     >
//                       {msg.status === "resolved"
//                         ? "সমাধান"
//                         : msg.status === "in_progress"
//                           ? "চলমান"
//                           : msg.status === "closed"
//                             ? "ক্লোজড"
//                             : "নতুন"}
//                     </span>
//                     <button
//                       onClick={() => openConfirmModal("delete", msg._id)}
//                       className="text-rose-400 hover:text-rose-300 bg-rose-900/20 p-1.5 rounded border border-rose-500/20 transition"
//                       title="ডিলিট"
//                     >
//                       <i className="fa-solid fa-trash text-xs"></i>
//                     </button>
//                   </div>
//                 </div>

//                 <p className="text-sm text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
//                   {msg.message}
//                 </p>

//                 {!msg.assignedTo && (
//                   <button
//                     onClick={() => handleAssign(msg._id)}
//                     className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
//                   >
//                     <i className="fa-solid fa-hand-paper mr-1"></i> নিজের কাছে
//                     অ্যাসাইন করুন
//                   </button>
//                 )}

//                 {msg.assignedTo &&
//                   msg.status !== "resolved" &&
//                   msg.status !== "closed" && (
//                     <div className="space-y-2">
//                       <textarea
//                         placeholder="আপনার রিপ্লাই লিখুন..."
//                         value={replyText[msg._id] || ""}
//                         maxLength={400}
//                         onChange={(e) =>
//                           setReplyText({
//                             ...replyText,
//                             [msg._id]: e.target.value,
//                           })
//                         }
//                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
//                         rows="3"
//                       ></textarea>
//                       <p className="text-[10px] text-slate-500 text-right">
//                         {(replyText[msg._id] || "").length}/400
//                       </p>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleReply(msg._id)}
//                           className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
//                         >
//                           <i className="fa-solid fa-paper-plane mr-1"></i>{" "}
//                           রিপ্লাই পাঠান
//                         </button>
//                         <button
//                           onClick={() => openConfirmModal("close", msg._id)}
//                           className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 font-bold px-4 py-2 rounded-xl text-sm border border-rose-500/30 transition"
//                         >
//                           <i className="fa-solid fa-lock mr-1"></i> ক্লোজ
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                 {msg.replies?.length > 0 && (
//                   <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
//                     <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
//                       <i className="fa-solid fa-comments"></i> রিপ্লাইসমূহ (
//                       {msg.replies.length}):
//                     </p>
//                     {msg.replies.map((r, idx) => (
//                       <div
//                         key={idx}
//                         className="bg-slate-950 border border-slate-800 rounded-xl p-3"
//                       >
//                         <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
//                           <i className="fa-solid fa-user-shield"></i>{" "}
//                           {r.senderName} ·{" "}
//                           {new Date(r.sentAt).toLocaleString("bn-BD")}
//                         </p>
//                         <p className="text-sm text-slate-300 whitespace-pre-wrap">
//                           {r.message}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// /////////////////////////////////
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/app/SocketProvider";

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();

const isUnreadMessage = (message) =>
  message?.status === "unread" ||
  message?.unread === true ||
  message?.isRead === false ||
  message?.read === false;

export default function ContactMessages() {
  const router = useRouter();
  const { socket } = useSocket();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [messageToast, setMessageToast] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🆕 রোল অনুযায়ী আনরিড কাউন্ট
  const [unreadBreakdown, setUnreadBreakdown] = useState({
    user: 0,
    agent: 0,
    "sub-admin": 0,
  });

  // 🆕 কোন রোলের মেসেজ দেখানো হবে (all, user, agent, sub-admin)
  const [activeRoleFilter, setActiveRoleFilter] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    messageId: null,
  });

  // 🆕 JWT HttpOnly চেক (শুধু admin)
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.success || !data.user) {
          router.push("/login");
          return;
        }

        if (data.user.role === "admin") {
          setIsAuthorized(true);
        } else {
          router.push("/sub-admin");
        }
      } catch (err) {
        router.push("/login");
      }
    };
    checkAdmin();
  }, [router]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/contact-messages", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const messageList = Array.isArray(data.messages) ? data.messages : [];
        setMessages(messageList);
        setUnreadCount(messageList.filter(isUnreadMessage).length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 প্রথমবার লোড
  useEffect(() => {
    if (isAuthorized) {
      fetchMessages();
    }
  }, [isAuthorized]);

  // 🆕 সকেট সিগন্যাল (শুধু সকেট, কোনো ফলব্যাক পোলিং নেই)
  useEffect(() => {
    if (!socket || !isAuthorized) return;
    const handleUpdate = () => {
      console.log("📢 contactTicketUpdated - fetching messages");
      fetchMessages();
    };
    socket.on("contactTicketUpdated", handleUpdate);
    return () => socket.off("contactTicketUpdated", handleUpdate);
  }, [socket, isAuthorized]);

  // রোল অনুযায়ী unread count বের করা
  useEffect(() => {
    const breakdown = { user: 0, agent: 0, "sub-admin": 0 };

    messages.forEach((msg) => {
      if (!isUnreadMessage(msg)) return;

      const role = normalizeRole(
        msg.senderRole || msg.sender?.role || msg.role,
      );

      if (role === "user" || role === "customer") {
        breakdown.user += 1;
      } else if (role === "agent") {
        breakdown.agent += 1;
      } else if (role === "sub-admin" || role === "subadmin") {
        breakdown["sub-admin"] += 1;
      }
    });

    setUnreadBreakdown(breakdown);
  }, [messages]);

  // 🆕 সার্চ, স্ট্যাটাস ফিল্টার এবং রোল ফিল্টার লজিক
  useEffect(() => {
    let result = [...messages];

    // ১. স্ট্যাটাস ফিল্টার (all, unread, in_progress, resolved, closed)
    if (activeFilter !== "all") {
      result = result.filter((msg) => msg.status === activeFilter);
    }

    // ২. রোল ফিল্টার (all, user, agent, sub-admin)
    if (activeRoleFilter !== "all") {
      result = result.filter((msg) => {
        const role = normalizeRole(
          msg.senderRole || msg.sender?.role || msg.role,
        );
        return role === activeRoleFilter;
      });
    }

    // ৩. সার্চ ফিল্টার
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (msg) =>
          msg.title?.toLowerCase().includes(term) ||
          msg.phone?.toLowerCase().includes(term) ||
          msg.message?.toLowerCase().includes(term) ||
          msg.senderRole?.toLowerCase().includes(term),
      );
    }

    setFilteredMessages(result);
  }, [searchTerm, activeFilter, activeRoleFilter, messages]);

  const handleAssign = async (messageId) => {
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessageToast({ type: "success", text: data.message });
        fetchMessages();
        setTimeout(() => setMessageToast(null), 3000);
      } else {
        setMessageToast({ type: "error", text: data.message });
        setTimeout(() => setMessageToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (messageId) => {
    const text = replyText[messageId];
    if (!text || text.trim().length === 0) {
      setMessageToast({ type: "error", text: "রিপ্লাই লিখুন!" });
      setTimeout(() => setMessageToast(null), 3000);
      return;
    }
    try {
      const res = await fetch("/api/admin/contact-messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId, replyMessage: text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessageToast({ type: "success", text: data.message });
        setReplyText((prev) => ({ ...prev, [messageId]: "" }));
        fetchMessages();
        setTimeout(() => setMessageToast(null), 3000);
      } else {
        setMessageToast({ type: "error", text: data.message });
        setTimeout(() => setMessageToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openConfirmModal = (type, messageId) => {
    setConfirmModal({ isOpen: true, type, messageId });
  };

  const handleConfirmAction = async () => {
    const { type, messageId } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, messageId: null });
    if (!messageId) return;

    try {
      if (type === "close") {
        const res = await fetch("/api/admin/contact-messages/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ messageId }),
        });
        const data = await res.json();
        if (data.success) {
          setMessageToast({ type: "success", text: data.message });
          fetchMessages();
        } else {
          setMessageToast({ type: "error", text: data.message });
        }
      } else if (type === "delete") {
        const res = await fetch(`/api/admin/contact-messages?id=${messageId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setMessageToast({ type: "success", text: data.message });
          fetchMessages();
        } else {
          setMessageToast({ type: "error", text: "ডিলিট করতে সমস্যা হয়েছে" });
        }
      }
      setTimeout(() => setMessageToast(null), 3000);
    } catch (err) {
      console.error(err);
      setMessageToast({ type: "error", text: "সার্ভার এরর" });
      setTimeout(() => setMessageToast(null), 3000);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "user":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "agent":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "sub-admin":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 p-4 md:p-8 relative">
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              <h3 className="text-lg font-bold text-white">আপনি কি নিশ্চিত?</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              {confirmModal.type === "close"
                ? "আপনি কি সত্যিই এই টিকিটটি ক্লোজ করতে চান? ক্লোজ করার পর আর রিপ্লাই দেওয়া যাবে না।"
                : "আপনি কি সত্যিই এই টিকিটটি ডিলিট করতে চান? ডিলিট করার পর এটি আর ফিরে পাওয়া যাবে না।"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAction}
                className={`flex-1 text-black font-bold py-2.5 rounded-xl text-sm transition ${
                  confirmModal.type === "close"
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-rose-500 hover:bg-rose-400"
                }`}
              >
                {confirmModal.type === "close"
                  ? "হ্যাঁ, ক্লোজ করুন"
                  : "হ্যাঁ, ডিলিট করুন"}
              </button>
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    type: null,
                    messageId: null,
                  })
                }
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm border border-slate-700 transition"
              >
                না
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {messageToast && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 ${
              messageToast.type === "success"
                ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
                : "bg-rose-900/30 border-rose-500/50 text-rose-400"
            }`}
          >
            {messageToast.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-400 flex items-center gap-2">
              <i className="fa-solid fa-envelope"></i> কন্টাক্ট টিকিট
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full animate-pulse">
                  {unreadCount} নতুন
                </span>
              )}
            </h1>
            {/* 🆕 রোল অনুযায়ী ব্রেকডাউন (ক্লিকেবল) */}
            {unreadCount > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">
                <button
                  onClick={() => setActiveRoleFilter("user")}
                  className={`border px-2 py-0.5 rounded-full transition ${
                    activeRoleFilter === "user"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-blue-900/30 text-blue-400 border-blue-500/20 hover:bg-blue-900/50"
                  }`}
                >
                  ইউজার: {unreadBreakdown.user}
                </button>
                <button
                  onClick={() => setActiveRoleFilter("agent")}
                  className={`border px-2 py-0.5 rounded-full transition ${
                    activeRoleFilter === "agent"
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-purple-900/30 text-purple-400 border-purple-500/20 hover:bg-purple-900/50"
                  }`}
                >
                  এজেন্ট: {unreadBreakdown.agent}
                </button>
                <button
                  onClick={() => setActiveRoleFilter("sub-admin")}
                  className={`border px-2 py-0.5 rounded-full transition ${
                    activeRoleFilter === "sub-admin"
                      ? "bg-amber-600 border-amber-600 text-white"
                      : "bg-amber-900/30 text-amber-400 border-amber-500/20 hover:bg-amber-900/50"
                  }`}
                >
                  সাব-অ্যাডমিন: {unreadBreakdown["sub-admin"]}
                </button>
                {activeRoleFilter !== "all" && (
                  <button
                    onClick={() => setActiveRoleFilter("all")}
                    className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full hover:bg-slate-700 transition"
                  >
                    সব দেখুন ✕
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            onClick={fetchMessages}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition flex items-center gap-2 self-start md:self-center"
          >
            <i className="fa-solid fa-rotate-right"></i> রিফ্রেশ
          </button>
        </div>

        <div className="mb-3 bg-slate-900 border border-slate-800 rounded-xl p-2">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <i className="fa-solid fa-magnifying-glass text-slate-500 text-sm"></i>
            <input
              type="text"
              maxLength="11"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="টাইটেল, ফোন বা মেসেজ দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-slate-500 hover:text-slate-300"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "all", label: "সব", color: "emerald" },
            { key: "unread", label: "নতুন", color: "red" },
            { key: "in_progress", label: "চলমান", color: "amber" },
            { key: "resolved", label: "সমাধান", color: "emerald" },
            { key: "closed", label: "ক্লোজড", color: "slate" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                activeFilter === f.key
                  ? `bg-${f.color}-600 border-${f.color}-600 text-white`
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.label} (
              {f.key === "all"
                ? messages.length
                : messages.filter((m) => m.status === f.key).length}
              )
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">লোড হচ্ছে...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900 rounded-xl border border-dashed border-slate-800">
            <i className="fa-solid fa-inbox text-5xl mb-4 opacity-30"></i>
            <p className="text-sm">কোনো টিকিট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-slate-900 border rounded-xl p-4 shadow-lg ${msg.status === "unread" ? "border-emerald-500/40" : "border-slate-800"}`}
              >
                <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base md:text-lg">
                      {msg.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(msg.senderRole)}`}
                      >
                        {msg.senderRole === "user"
                          ? "ইউজার"
                          : msg.senderRole === "agent"
                            ? "এজেন্ট"
                            : msg.senderRole === "sub-admin"
                              ? "সাব-অ্যাডমিন"
                              : msg.senderRole}
                      </span>
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                        ফোন: {msg.phone}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(msg.createdAt).toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        msg.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : msg.status === "in_progress"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : msg.status === "closed"
                              ? "bg-slate-700/50 text-slate-400 border-slate-600"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {msg.status === "resolved"
                        ? "সমাধান"
                        : msg.status === "in_progress"
                          ? "চলমান"
                          : msg.status === "closed"
                            ? "ক্লোজড"
                            : "নতুন"}
                    </span>
                    <button
                      onClick={() => openConfirmModal("delete", msg._id)}
                      className="text-rose-400 hover:text-rose-300 bg-rose-900/20 p-1.5 rounded border border-rose-500/20 transition"
                      title="ডিলিট"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>

                {!msg.assignedTo && (
                  <button
                    onClick={() => handleAssign(msg._id)}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
                  >
                    <i className="fa-solid fa-hand-paper mr-1"></i> নিজের কাছে
                    অ্যাসাইন করুন
                  </button>
                )}

                {msg.assignedTo &&
                  msg.status !== "resolved" &&
                  msg.status !== "closed" && (
                    <div className="space-y-2">
                      <textarea
                        placeholder="আপনার রিপ্লাই লিখুন..."
                        value={replyText[msg._id] || ""}
                        maxLength={400}
                        onChange={(e) =>
                          setReplyText({
                            ...replyText,
                            [msg._id]: e.target.value,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                        rows="3"
                      ></textarea>
                      <p className="text-[10px] text-slate-500 text-right">
                        {(replyText[msg._id] || "").length}/400
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(msg._id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
                        >
                          <i className="fa-solid fa-paper-plane mr-1"></i>{" "}
                          রিপ্লাই পাঠান
                        </button>
                        <button
                          onClick={() => openConfirmModal("close", msg._id)}
                          className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 font-bold px-4 py-2 rounded-xl text-sm border border-rose-500/30 transition"
                        >
                          <i className="fa-solid fa-lock mr-1"></i> ক্লোজ
                        </button>
                      </div>
                    </div>
                  )}

                {msg.replies?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <i className="fa-solid fa-comments"></i> রিপ্লাইসমূহ (
                      {msg.replies.length}):
                    </p>
                    {msg.replies.map((r, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3"
                      >
                        <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                          <i className="fa-solid fa-user-shield"></i>{" "}
                          {r.senderName} ·{" "}
                          {new Date(r.sentAt).toLocaleString("bn-BD")}
                        </p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">
                          {r.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
