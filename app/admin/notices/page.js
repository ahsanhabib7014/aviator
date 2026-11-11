"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminNotices() {
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    desc: "",
    type: "আপডেট",
    isNew: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);

  // 🆕 নোটিশ লোড করা
  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      if (data.success) setNotices(data.notices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 🆕 ফর্ম সাবমিট (তৈরি বা আপডেট)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const method = isEditing ? "PUT" : "POST";
    const url = "/api/admin/notices";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: isEditing ? "নোটিশ আপডেট হয়েছে!" : "নতুন নোটিশ তৈরি হয়েছে!",
        });
        setFormData({
          id: null,
          title: "",
          desc: "",
          type: "আপডেট",
          isNew: true,
        });
        setIsEditing(false);
        fetchNotices();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "সমস্যা হয়েছে" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    }
  };

  // 🆕 এডিট মোড চালু করা
  const handleEdit = (notice) => {
    setFormData({
      id: notice._id,
      title: notice.title,
      desc: notice.desc,
      type: notice.type,
      isNew: notice.isNew,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🆕 নোটিশ ডিলিট করা
  const handleDelete = async (id) => {
    if (!confirm("আপনি কি নিশ্চিত এই নোটিশটি ডিলিট করতে চান?")) return;

    try {
      const res = await fetch(`/api/admin/notices?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "নোটিশ ডিলিট হয়েছে!" });
        fetchNotices();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "ডিলিট করতে সমস্যা হয়েছে" });
    }
  };

  // 🆕 এডিট ক্যানসেল
  const handleCancelEdit = () => {
    setFormData({ id: null, title: "", desc: "", type: "আপডেট", isNew: true });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* হেডার */}
        <div className="flex items-center justify-between mb-8 bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-400">
              অ্যাডমিন - নোটিশ ম্যানেজমেন্ট
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              নোটিশ তৈরি, এডিট এবং ডিলিট করুন
            </p>
          </div>
          <button
            onClick={() => router.push("/notice")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm px-4 py-2 rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-eye"></i> নোটিশ দেখুন
          </button>
        </div>

        {/* নোটিফিকেশন মেসেজ */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl border text-sm font-bold ${
              message.type === "success"
                ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
                : "bg-rose-900/30 border-rose-500/50 text-rose-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 🆕 বাম দিক: ফর্ম */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <i
                  className={`fa-solid ${isEditing ? "fa-pen-to-square" : "fa-plus-circle"} text-emerald-400`}
                ></i>
                {isEditing ? "নোটিশ এডিট করুন" : "নতুন নোটিশ যোগ করুন"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">
                    শিরোনাম
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    placeholder="নোটিশের শিরোনাম লিখুন..."
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">
                    ধরন
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  >
                    <option value="আপডেট">আপডেট</option>
                    <option value="অফার">অফার</option>
                    <option value="সতর্কতা">সতর্কতা</option>
                    <option value="জরুরি">জরুরি</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">
                    বিবরণ
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.desc}
                    onChange={(e) =>
                      setFormData({ ...formData, desc: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white resize-none"
                    placeholder="নোটিশের বিস্তারিত লিখুন..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={formData.isNew}
                    onChange={(e) =>
                      setFormData({ ...formData, isNew: e.target.checked })
                    }
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <label
                    htmlFor="isNew"
                    className="text-xs text-slate-300 cursor-pointer"
                  >
                    এটি নতুন নোটিশ (NEW ব্যাজ দেখাবে)
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg transition text-sm"
                  >
                    {isEditing ? "আপডেট করুন" : "তৈরি করুন"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg text-sm font-bold border border-slate-700 transition"
                    >
                      বাতিল
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* 🆕 ডান দিক: নোটিশ লিস্ট */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <i className="fa-solid fa-list text-emerald-400"></i>
                বর্তমান নোটিশসমূহ ({notices.length})
              </h2>

              {loading ? (
                <div className="text-center py-10 text-slate-500">
                  লোড হচ্ছে...
                </div>
              ) : notices.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <i className="fa-solid fa-inbox text-4xl mb-3 opacity-50"></i>
                  <p>কোনো নোটিশ নেই। বাম দিকের ফর্ম থেকে তৈরি করুন।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div
                      key={notice._id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-3 hover:border-emerald-500/30 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {notice.type}
                          </span>
                          {notice.isNew && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-500 text-white">
                              NEW
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(notice.createdAt).toLocaleDateString(
                              "bn-BD",
                            )}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-100 text-sm mb-1 truncate">
                          {notice.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {notice.desc}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 p-2 rounded-lg border border-blue-500/30 transition"
                          title="এডিট করুন"
                        >
                          <i className="fa-solid fa-pen text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 p-2 rounded-lg border border-rose-500/30 transition"
                          title="ডিলিট করুন"
                        >
                          <i className="fa-solid fa-trash text-sm"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
