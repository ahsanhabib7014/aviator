
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactMessages() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [messageToast, setMessageToast] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🆕 সার্চ ও ফিল্টার স্টেট
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // 🆕 কাস্টম কনফার্ম মডাল স্টেট
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // "close" অথবা "delete"
    messageId: null,
  });

  // 🆕 পারমিশন চেক
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        const data = await res.json();
        if (!data.success || !data.user) {
          router.push("/login");
          return;
        }
        const user = data.user;
        const permissions = user.permissions || [];
        const isAdmin = user.role === "admin";
        const hasPermission = permissions.includes("manage_contact-messages");
        if (isAdmin || hasPermission) {
          setIsAuthorized(true);
        } else {
          router.push("/sub-admin");
        }
      } catch (err) {
        router.push("/login");
      }
    };
    checkPermission();
  }, [router]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/contact-messages");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setFilteredMessages(data.messages);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  // 🆕 সার্চ এবং ফিল্টার লজিক
  useEffect(() => {
    let result = [...messages];

    if (activeFilter !== "all") {
      result = result.filter((msg) => msg.status === activeFilter);
    }

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
  }, [searchTerm, activeFilter, messages]);

  const handleAssign = async (messageId) => {
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // 🆕 মডাল ওপেন
  const openConfirmModal = (type, messageId) => {
    setConfirmModal({ isOpen: true, type, messageId });
  };

  // 🆕 মডালে "হ্যাঁ" ক্লিক
  const handleConfirmAction = async () => {
    const { type, messageId } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, messageId: null });
    if (!messageId) return;

    try {
      if (type === "close") {
        const res = await fetch("/api/admin/contact-messages/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        });
        const data = await res.json();
        if (data.success) {
          setMessageToast({ type: "success", text: data.message });
          fetchMessages();
        } else {
          setMessageToast({
            type: "error",
            text: data.message || "ডিলিট করতে সমস্যা হয়েছে",
          });
        }
      }
      setTimeout(() => setMessageToast(null), 3000);
    } catch (err) {
      console.error(err);
      setMessageToast({ type: "error", text: "সার্ভার এরর" });
      setTimeout(() => setMessageToast(null), 3000);
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
    <div className="min-h-screen bg-[#07090e] text-slate-200 p-4 md:p-8 pb-24 relative">
      {/* 🆕 কাস্টম মডাল */}
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
            className={`mb-4 px-4 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 ${
              messageToast.type === "success"
                ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
                : "bg-rose-900/30 border-rose-500/50 text-rose-400"
            }`}
          >
            {messageToast.text}
          </div>
        )}

        {/* হেডার */}
        <div className="flex items-center justify-between mb-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
          <h1 className="text-xl md:text-2xl font-black text-emerald-400 flex items-center gap-2">
            <i className="fa-solid fa-envelope"></i> কন্টাক্ট টিকিট
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} নতুন
              </span>
            )}
          </h1>
        </div>

        {/* সার্চ বার */}
        <div className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <i className="fa-solid fa-magnifying-glass text-slate-500 text-sm"></i>
            <input
              type="text"
              placeholder="টাইটেল, ফোন নম্বর বা মেসেজ দিয়ে খুঁজুন..."
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

        {/* ফিল্টার বাটন */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === "all"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-list mr-1"></i> সব ({messages.length})
          </button>
          <button
            onClick={() => setActiveFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === "unread"
                ? "bg-red-600 border-red-600 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-circle-exclamation mr-1"></i> নতুন (
            {messages.filter((m) => m.status === "unread").length})
          </button>
          <button
            onClick={() => setActiveFilter("in_progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === "in_progress"
                ? "bg-amber-600 border-amber-600 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-clock mr-1"></i> চলমান (
            {messages.filter((m) => m.status === "in_progress").length})
          </button>
          <button
            onClick={() => setActiveFilter("resolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === "resolved"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-check mr-1"></i> সমাধান (
            {messages.filter((m) => m.status === "resolved").length})
          </button>
          <button
            onClick={() => setActiveFilter("closed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === "closed"
                ? "bg-slate-700 border-slate-700 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fa-solid fa-lock mr-1"></i> ক্লোজড (
            {messages.filter((m) => m.status === "closed").length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">লোড হচ্ছে...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900 rounded-2xl border border-dashed border-slate-800">
            <i className="fa-solid fa-inbox text-5xl mb-4 opacity-30"></i>
            <p className="text-sm">কোনো টিকিট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-slate-900 border rounded-xl p-3 md:p-4 shadow-lg ${
                  msg.status === "unread"
                    ? "border-emerald-500/40"
                    : "border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm md:text-base truncate">
                      {msg.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
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
                    {/* 🆕 ডিলিট বাটনে কাস্টম মডাল */}
                    {/* <button
                      onClick={() => openConfirmModal("delete", msg._id)}
                      className="text-rose-400 hover:text-rose-300 bg-rose-900/20 p-1.5 rounded border border-rose-500/20 transition"
                      title="ডিলিট"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button> */}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] text-slate-300">
                    রোল: {msg.senderRole}
                  </span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                    {msg.phone}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(msg.createdAt).toLocaleString("bn-BD")}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                  {msg.message}
                </p>

                {!msg.assignedTo && (
                  <button
                    onClick={() => handleAssign(msg._id)}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold py-2 rounded-lg text-xs transition shadow-lg shadow-blue-500/20"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                        rows="2"
                      ></textarea>
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] text-slate-500">
                          {(replyText[msg._id] || "").length}/400
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(msg._id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition"
                          >
                            <i className="fa-solid fa-paper-plane mr-1"></i>{" "}
                            রিপ্লাই
                          </button>
                          {/* 🆕 ক্লোজ বাটনে কাস্টম মডাল */}
                          <button
                            onClick={() => openConfirmModal("close", msg._id)}
                            className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 font-bold px-3 py-1.5 rounded-lg text-xs border border-rose-500/30 transition"
                          >
                            <i className="fa-solid fa-lock mr-1"></i> ক্লোজ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {msg.replies?.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-800 pt-2">
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <i className="fa-solid fa-comments"></i> রিপ্লাই (
                      {msg.replies.length}):
                    </p>
                    {msg.replies.map((r, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2"
                      >
                        <p className="text-[9px] text-slate-500 mb-0.5 flex items-center gap-1">
                          <i className="fa-solid fa-user-shield"></i>
                          {r.senderName} ·{" "}
                          {new Date(r.sentAt).toLocaleString("bn-BD")}
                        </p>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap">
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
