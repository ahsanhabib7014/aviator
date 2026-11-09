
"use client";

import { useState, useEffect } from "react";

export default function AdminPaymentAddressesPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ method: "", accountNumber: "" });
  const [editingAddress, setEditingAddress] = useState(null);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-addresses", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setAddresses(data.addresses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!form.method.trim() || !form.accountNumber.trim()) {
      setMessage({ type: "error", text: "মেথড এবং অ্যাড্রেস দুটোই দিতে হবে!" });
      return;
    }
    setSaving(true);
    try {
      if (editingAddress) {
        await fetch("/api/admin/payment-addresses", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accountNumber: editingAddress.accountNumber }),
        });
      }
      const res = await fetch("/api/admin/payment-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          method: form.method.trim(),
          accountNumber: form.accountNumber.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setForm({ method: "", accountNumber: "" });
        setEditingAddress(null);
        loadAddresses();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (accountNumber) => {
    if (!confirm("আপনি কি এই অ্যাড্রেসটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch("/api/admin/payment-addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accountNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        loadAddresses();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setForm({ method: addr.method, accountNumber: addr.accountNumber });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", text: "কপি হয়েছে!" });
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <i className="fa-solid fa-wallet"></i> পেমেন্ট অ্যাড্রেস
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            এজেন্টরা এই অ্যাড্রেসে টাকা পাঠাবে।
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl border text-sm font-bold ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                : "bg-rose-950/40 border-rose-500/50 text-rose-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSaveAddress}
          className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4"
        >
          <h2 className="font-bold text-slate-200 border-b border-slate-800 pb-3">
            {editingAddress ? "অ্যাড্রেস এডিট করুন" : "নতুন অ্যাড্রেস যোগ করুন"}
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
              মেথড
            </label>
            <input
              type="text"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              placeholder="USDT"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
              অ্যাড্রেস
            </label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              placeholder="ওয়ালেট অ্যাড্রেস"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-50"
            >
              {saving
                ? "সেভ হচ্ছে..."
                : editingAddress
                  ? "এডিট করুন"
                  : "সেভ করুন"}
            </button>
            {editingAddress && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setForm({ method: "", accountNumber: "" });
                }}
                className="bg-slate-700 text-white font-bold text-sm px-6 py-3 rounded-xl"
              >
                বাতিল
              </button>
            )}
          </div>
        </form>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <h2 className="font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4">
            সেভ করা অ্যাড্রেস
          </h2>
          {loading ? (
            <p className="text-slate-400 text-sm">লোড হচ্ছে...</p>
          ) : addresses.length === 0 ? (
            <p className="text-slate-400 text-sm">কোনো অ্যাড্রেস নেই।</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((acc, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {acc.method}
                    </p>
                    <p className="text-xs text-cyan-400 font-mono break-all mt-0.5">
                      {acc.accountNumber}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(acc.accountNumber)}
                      className="bg-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold"
                    >
                      কপি
                    </button>
                    <button
                      onClick={() => handleEditAddress(acc)}
                      className="bg-amber-600 px-2 py-1.5 rounded-lg text-xs font-bold"
                    >
                      এডিট
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(acc.accountNumber)}
                      className="bg-rose-600 px-2 py-1.5 rounded-lg text-xs font-bold"
                    >
                      ডিলিট
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
