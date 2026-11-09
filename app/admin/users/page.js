
"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ডিটেইলস ও এডিট মোডাল স্টেট
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // সমস্ত ফিল্ড এডিট করার জন্য ফর্ম স্টেট
  const [editFormData, setEditFormData] = useState({
    balance: "",
    turnover: "",
    ipAddress: "",
    role: "user",
    vipLevel: "bronze",
    referralBalance: "",
    agentMainBalance: "",
    agentCommissionBalance: "",
    agentDepositCommission: "",
    agentWithdrawCommission: "",
    agentCode: "",
  });

  const [confirmData, setConfirmData] = useState(null);
  const [toasts, setToasts] = useState([]);

  const searchQueryRef = useRef("");
  const fetchDataRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchData = useCallback(async (search = "") => {
    try {
      const usersRes = await fetch(
        `/api/admin/manage-users?search=${search}&t=${Date.now()}`,
      );
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    fetchDataRef.current?.("");
    const interval = setInterval(() => {
      fetchDataRef.current?.(searchQueryRef.current);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(searchQuery);
  };

  const askConfirm = ({
    title,
    message,
    icon = "⚠️",
    iconColor = "amber",
    confirmText = "হ্যাঁ, নিশ্চিত",
    confirmClass = "emerald",
    onYes,
  }) => {
    setConfirmData({
      title,
      message,
      icon,
      iconColor,
      confirmText,
      confirmClass,
      onYes,
    });
  };

  const performUpdateUser = async (userId, updateData) => {
    try {
      // ✅ ফাঁকা ভ্যালু ("" বা null) ফিল্টার করে পাঠানো হচ্ছে
      const cleanData = {};
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== "" && updateData[key] !== null) {
          cleanData[key] = updateData[key];
        }
      });

      const res = await fetch("/api/admin/manage-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...cleanData }),
      });
      const data = await res.json();
      showToast(data.message || "সফলভাবে আপডেট হয়েছে", "success");
      setEditingUser(null);
      fetchData(searchQuery);
    } catch (err) {
      showToast("আপডেট করতে সমস্যা হয়েছে", "error");
    }
  };

  const performDeleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/manage-users?userId=${userId}`, {
        method: "DELETE",
      });
      showToast(`ইউজার ${userId} ডিলিট হয়েছে`, "success");
      fetchData(searchQuery);
    } catch (err) {
      showToast("ডিলিট করতে সমস্যা হয়েছে", "error");
    }
  };

  const handleUpdateUser = (userId, updateData) => {
    let title = "তথ্য আপডেট নিশ্চিত করুন";
    let message = "আপনি কি এই ইউজারের তথ্য আপডেট করতে চান?";
    let icon = "✏️";
    let iconColor = "blue";
    let confirmText = "হ্যাঁ, আপডেট";
    let confirmClass = "blue";

    if (updateData.isBlocked === true) {
      title = "ইউজার ব্লক নিশ্চিত করুন";
      message = "আপনি কি এই ইউজারকে ব্লক করতে চান?";
      icon = "🚫";
      iconColor = "rose";
      confirmText = "হ্যাঁ, ব্লক";
      confirmClass = "rose";
    }
    if (updateData.isBlocked === false) {
      title = "ইউজার আনব্লক নিশ্চিত করুন";
      message = "আপনি কি এই ইউজারকে আনব্লক করতে চান?";
      icon = "✅";
      iconColor = "emerald";
      confirmText = "হ্যাঁ, আনব্লক";
      confirmClass = "emerald";
    }

    askConfirm({
      title,
      message,
      icon,
      iconColor,
      confirmText,
      confirmClass,
      onYes: () => performUpdateUser(userId, updateData),
    });
  };

  const handleDeleteUser = (userId) => {
    askConfirm({
      title: "ইউজার ডিলিট নিশ্চিত করুন",
      message: `ইউজার ${userId} কে স্থায়ীভাবে ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`,
      icon: "🗑️",
      iconColor: "rose",
      confirmText: "হ্যাঁ, ডিলিট",
      confirmClass: "rose",
      onYes: () => performDeleteUser(userId),
    });
  };

  const handleEditClick = (u) => {
    askConfirm({
      title: "ইউজার এডিট নিশ্চিত করুন",
      message: `ইউজার ${u.uid} এর তথ্য এডিট করতে চান?`,
      icon: "✏️",
      iconColor: "blue",
      confirmText: "হ্যাঁ, এডিট",
      confirmClass: "blue",
      onYes: () => {
        setConfirmData(null); // কনফার্ম মডাল বন্ধ করা হলো
        setEditingUser(u.uid);
        setEditFormData({
          balance: u.balance ?? 0,
          turnover: u.turnover ?? 0,
          ipAddress: u.ipAddress || "",
          role: u.role || "user",
          vipLevel: u.vipLevel || "bronze",
          referralBalance: u.referralBalance ?? 0,
          agentMainBalance: u.agentMainBalance ?? 0,
          agentCommissionBalance: u.agentCommissionBalance ?? 0,
          agentDepositCommission: u.agentDepositCommission ?? 0,
          agentWithdrawCommission: u.agentWithdrawCommission ?? 0,
          agentCode: u.agentCode || "",
        });
      },
    });
  };

  const fmtMoney = (n) => Number(n || 0).toFixed(2);

  const iconColorMap = {
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const confirmBtnMap = {
    emerald:
      "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40",
    rose: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40",
    blue: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40",
  };

  const toastStyleMap = {
    success: {
      bg: "bg-emerald-950/95 border-emerald-500/40",
      icon: "✅",
      iconBg: "bg-emerald-500/20 text-emerald-400",
    },
    error: {
      bg: "bg-rose-950/95 border-rose-500/40",
      icon: "❌",
      iconBg: "bg-rose-500/20 text-rose-400",
    },
  };

  return (
    <div className="space-y-4 font-sans">
      {/* টোস্ট নোটিফিকেশন */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const s = toastStyleMap[t.type] || toastStyleMap.success;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg}`}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.iconBg}`}
              >
                {s.icon}
              </div>
              <p className="flex-1 text-xs font-semibold text-white leading-relaxed">
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* সার্চ ও হেডার */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-200">
              📋 ইউজার লিস্ট ও তথ্য এডিটর
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
              {users.length} জন
            </span>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="ফোন, আইডি বা আইপি..."
              value={searchQuery}
              onChange={(e) => {
                if (e.target.value.length <= 11) setSearchQuery(e.target.value);
              }}
              maxLength={11}
              className="bg-slate-950 border border-slate-700 px-3.5 py-2 rounded-xl text-xs flex-1 sm:w-60 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl font-bold text-xs text-white transition-all active:scale-95"
            >
              সার্চ
            </button>
          </form>
        </div>

        {/* মোবাইল ফ্রেন্ডলি ভিউ (Card View) */}
        <div className="block md:hidden space-y-3 mt-3">
          {users.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
              {loading ? "ডেটা লোড হচ্ছে..." : "কোনো ইউজার পাওয়া যায়নি"}
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id || u.uid}
                className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5"
              >
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <div>
                    <span className="font-mono font-bold text-white text-xs">
                      {u.uid}
                    </span>
                    <span className="ml-2 text-[9px] uppercase bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-semibold">
                      {u.role || "user"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isBlocked ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"}`}
                  >
                    {u.isBlocked ? "ব্লকড" : "অ্যাক্টিভ"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      ফোন:
                    </span>{" "}
                    <span className="text-slate-200">{u.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      ব্যালেন্স:
                    </span>{" "}
                    <span className="text-amber-400 font-bold">
                      ৳{fmtMoney(u.balance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      টার্নওভার:
                    </span>{" "}
                    <span className="text-slate-300">
                      ৳{fmtMoney(u.turnover)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      VIP Level:
                    </span>{" "}
                    <span className="text-blue-400 uppercase font-bold">
                      {u.vipLevel || "bronze"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1.5 flex-wrap">
                  <button
                    onClick={() => setSelectedUserDetail(u)}
                    className="flex-1 bg-purple-950 text-purple-300 py-1.5 rounded-lg text-[10px] font-medium border border-purple-800 text-center"
                  >
                    সব ডেটা
                  </button>

                  {u.role !== "admin" && (
                    <>
                      <button
                        onClick={() => handleEditClick(u)}
                        className="flex-1 bg-blue-950 text-blue-300 py-1.5 rounded-lg text-[10px] font-medium border border-blue-800 text-center"
                      >
                        এডিট
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })
                        }
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border text-center ${u.isBlocked ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-rose-950 text-rose-300 border-rose-800"}`}
                      >
                        {u.isBlocked ? "আনব্লক" : "ব্লক"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-slate-700"
                      >
                        ডিলিট
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ডেসকটপ ভিউ (Table View) */}
        <div
          className="hidden md:block rounded-xl border border-slate-800 bg-slate-950/60 overflow-x-auto overflow-y-auto"
          style={{ maxHeight: "550px" }}
        >
          <table className="w-full min-w-[1100px] text-left text-xs text-slate-300 border-collapse">
            <thead className="text-[11px] uppercase text-slate-400 bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">
                  UID / রোল
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">
                  ফোন / এজেন্ট কোড
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">
                  ব্যালেন্স / টার্নওভার
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">
                  এজেন্ট ব্যালেন্স
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">
                  রেফারেল
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">VIP</th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">
                  স্ট্যাটাস
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-900">IP</th>
                <th className="p-3.5 text-center sticky top-0 z-20 bg-slate-900">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="p-8 text-center text-slate-500 text-xs"
                  >
                    {loading ? "ডেটা লোড হচ্ছে..." : "কোনো ইউজার পাওয়া যায়নি"}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id || u.uid}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-semibold text-white font-mono">
                        {u.uid}
                      </div>
                      <span className="text-[9px] uppercase bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5">
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div>{u.phone}</div>
                      {u.agentCode && (
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {u.agentCode}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="text-amber-400 font-bold">
                        ৳{fmtMoney(u.balance)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        টান: ৳{fmtMoney(u.turnover)}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      {u.role === "agent" ? (
                        <div>
                          <div className="text-teal-400 font-bold">
                            ৳{fmtMoney(u.agentMainBalance)}
                          </div>
                          <div className="text-[10px] text-cyan-400">
                            Comm: ৳{fmtMoney(u.agentCommissionBalance)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="text-purple-400 font-bold">
                        ৳{fmtMoney(u.referralBalance)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ref: {u.referralCode || "নেই"}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="uppercase bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {u.vipLevel || "bronze"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${u.isBlocked ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"}`}
                      >
                        {u.isBlocked ? "ব্লকড" : "অ্যাক্টিভ"}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] font-mono text-slate-400">
                      {u.ipAddress || "নেই"}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setSelectedUserDetail(u)}
                          className="bg-purple-950 text-purple-300 hover:bg-purple-900 hover:text-white px-2.5 py-1 rounded-lg text-[11px] border border-purple-800"
                        >
                          সব ডেটা
                        </button>

                        {u.role !== "admin" && (
                          <>
                            <button
                              onClick={() => handleEditClick(u)}
                              className="bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-white px-2.5 py-1 rounded-lg text-[11px] border border-blue-800"
                            >
                              এডিট
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateUser(u.uid, {
                                  isBlocked: !u.isBlocked,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] border ${u.isBlocked ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-rose-950 text-rose-300 border-rose-800"}`}
                            >
                              {u.isBlocked ? "আনব্লক" : "ব্লক"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.uid)}
                              className="bg-slate-800 text-slate-400 hover:bg-rose-900 hover:text-white px-2.5 py-1 rounded-lg text-[11px] border border-slate-700"
                            >
                              ডিলিট
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ইউজারের সমস্ত কালেকশন ডেটা দেখার মোডাল */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400">
                ইউজার কালেকশন তথ্য:{" "}
                <span className="font-mono text-white">
                  {selectedUserDetail.uid}
                </span>
              </h3>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Role</span>{" "}
                  <span className="text-white font-bold">
                    {selectedUserDetail.role}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Phone
                  </span>{" "}
                  {selectedUserDetail.phone}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Balance
                  </span>{" "}
                  ৳{selectedUserDetail.balance}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Turnover
                  </span>{" "}
                  ৳{selectedUserDetail.turnover}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Status
                  </span>{" "}
                  {selectedUserDetail.isBlocked ? "Blocked" : "Active"}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">IP</span>{" "}
                  {selectedUserDetail.ipAddress}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Agent Code
                  </span>{" "}
                  {selectedUserDetail.agentCode || "N/A"}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Main Bal
                  </span>{" "}
                  ৳{selectedUserDetail.agentMainBalance ?? 0}
                </div>
              </div>

              {selectedUserDetail.agentPaymentAccounts &&
                selectedUserDetail.agentPaymentAccounts.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-bold text-emerald-400 text-[11px]">
                      এজেন্ট পেমেন্ট অ্যাকাউন্টস:
                    </p>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      {selectedUserDetail.agentPaymentAccounts.map(
                        (acc, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between border-b border-slate-900/50 pb-1 text-[10px]"
                          >
                            <span className="text-amber-300 font-semibold">
                              {acc.method}:
                            </span>
                            <span className="text-white font-mono">
                              {acc.accountNumber}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ সমস্ত তথ্য এডিট করার অল-ইন-ওয়ান মোডাল (শুধু সাধারণ ইউজার ও এজেন্টদের জন্য) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>✏️</span> ইউজার তথ্য এডিটর:{" "}
                <span className="text-emerald-400 font-mono">
                  {editingUser}
                </span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* রোল সিলেক্টর */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  রোল (Role):
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                >
                  <option value="user">USER</option>
                  <option value="agent">AGENT</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>

              {/* ভিআইপি লেভেল */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  ভিআইপি লেভেল (VIP Level):
                </label>
                <select
                  value={editFormData.vipLevel}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      vipLevel: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                >
                  <option value="bronze">BRONZE</option>
                  <option value="silver">SILVER</option>
                  <option value="gold">GOLD</option>
                  <option value="platinum">PLATINUM</option>
                  <option value="diamond">DIAMOND</option>
                </select>
              </div>

              {/* প্রধান ব্যালেন্স */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  ব্যালেন্স (৳):
                </label>
                <input
                  type="number"
                  value={editFormData.balance}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      balance: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                />
              </div>

              {/* টার্নওভার */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  টার্নওভার (৳):
                </label>
                <input
                  type="number"
                  value={editFormData.turnover}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      turnover: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                />
              </div>

              {/* রেফারেল ব্যালেন্স */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  রেফারেল ব্যালেন্স (৳):
                </label>
                <input
                  type="number"
                  value={editFormData.referralBalance}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      referralBalance: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                />
              </div>

              {/* আইপি অ্যাড্রেস */}
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  আইপি অ্যাড্রেস:
                </label>
                <input
                  type="text"
                  value={editFormData.ipAddress}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      ipAddress: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                />
              </div>

              {/* এজেন্ট সম্পর্কিত তথ্য (যদি এজেন্ট হয়) */}
              {editFormData.role === "agent" && (
                <>
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-800">
                    <p className="text-teal-400 font-bold mb-2">
                      💼 এজেন্ট সংক্রান্ত সেটিংস:
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">
                      এজেন্ট কোড:
                    </label>
                    <input
                      type="text"
                      value={editFormData.agentCode}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          agentCode: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">
                      এজেন্ট মেইন ব্যালেন্স (৳):
                    </label>
                    <input
                      type="number"
                      value={editFormData.agentMainBalance}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          agentMainBalance: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">
                      কমিশন ব্যালেন্স (৳):
                    </label>
                    <input
                      type="number"
                      value={editFormData.agentCommissionBalance}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          agentCommissionBalance: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">
                      ডিপোজিট কমিশন (%):
                    </label>
                    <input
                      type="number"
                      value={editFormData.agentDepositCommission}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          agentDepositCommission: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">
                      উইথড্র কমিশন (%):
                    </label>
                    <input
                      type="number"
                      value={editFormData.agentWithdrawCommission}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          agentWithdrawCommission: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() =>
                  handleUpdateUser(editingUser, {
                    balance: Number(editFormData.balance),
                    turnover: Number(editFormData.turnover),
                    ipAddress: editFormData.ipAddress,
                    role: editFormData.role,
                    vipLevel: editFormData.vipLevel,
                    referralBalance: Number(editFormData.referralBalance),
                    agentMainBalance: Number(editFormData.agentMainBalance),
                    agentCommissionBalance: Number(
                      editFormData.agentCommissionBalance,
                    ),
                    agentDepositCommission: Number(
                      editFormData.agentDepositCommission,
                    ),
                    agentWithdrawCommission: Number(
                      editFormData.agentWithdrawCommission,
                    ),
                    // ✅ agentCode ফাঁকা থাকলে null বা "" না পাঠিয়ে undefined পাঠানো হচ্ছে
                    agentCode: editFormData.agentCode.trim() || undefined,
                  })
                }
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95"
              >
                সব সেভ করুন
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* কনফার্মেশন মোডাল */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${iconColorMap[confirmData.iconColor] || iconColorMap.amber}`}
              >
                {confirmData.icon}
              </div>
              <h3 className="text-sm font-bold text-white">
                {confirmData.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {confirmData.message}
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmData(null)}
                className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
              >
                না
              </button>
              <button
                onClick={() => {
                  confirmData.onYes?.();
                  setConfirmData(null);
                }}
                className={`flex-1 bg-gradient-to-r text-white py-2.5 rounded-xl font-bold text-xs shadow-md ${confirmBtnMap[confirmData.confirmClass] || confirmBtnMap.emerald}`}
              >
                {confirmData.confirmText || "হ্যাঁ, নিশ্চিত"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}