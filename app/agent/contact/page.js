
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactUs() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    title: "",
    message: "",
  });
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [userTickets, setUserTickets] = useState([]);

  // 🆕 Auth চেক এবং ইউজারের রোল + টিকিট ফেচ
  useEffect(() => {
    const fetchUserAndTickets = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        const data = await res.json();

        if (!data.success || !data.user) {
          router.push("/login");
          return;
        }

        setUserRole(data.user.role || "user");

        const ticketRes = await fetch("/api/user/my-tickets", {
          credentials: "include",
        });
        const ticketData = await ticketRes.json();
        if (ticketData.success) {
          setUserTickets(ticketData.tickets || []);
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndTickets();
  }, [router]);

  // 🆕 রোল অনুযায়ী শিরোনাম
  const getRoleDetails = () => {
    switch (userRole) {
      case "sub-admin":
        return {
          title: "সাব-অ্যাডমিন সাপোর্ট",
          desc: "আপনার পারমিশন বা টেকনিক্যাল সমস্যার জন্য সরাসরি সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।",
          color: "text-purple-400",
        };
      case "agent":
        return {
          title: "এজেন্ট সাপোর্ট",
          desc: "ডিপোজিট, উইথড্র বা কমিশন সংক্রান্ত সমস্যার জন্য যোগাযোগ করুন।",
          color: "text-blue-400",
        };
      default:
        return {
          title: "যোগাযোগ করুন",
          desc: "যেকোনো সমস্যা বা জিজ্ঞাসায় আমাদের সাব-অ্যাডমিন টিম সহায়তা করবে।",
          color: "text-emerald-400",
        };
    }
  };

  const roleDetails = getRoleDetails();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: userRole }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setFormData({ phone: "", title: "", message: "" });
        const ticketRes = await fetch("/api/user/my-tickets", {
          credentials: "include",
        });
        const ticketData = await ticketRes.json();
        if (ticketData.success) setUserTickets(ticketData.tickets || []);
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("error");
        setErrorMessage(data.message || "সমস্যা হয়েছে!");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("সার্ভার এরর, আবার চেষ্টা করুন!");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-slate-400">লোড হচ্ছে...</div>;

  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <h1
          className={`text-2xl md:text-3xl font-black mb-2 ${roleDetails.color}`}
        >
          {roleDetails.title}
        </h1>
        <p className="text-sm text-slate-400 mb-8">{roleDetails.desc}</p>

        {/* 🆕 ডেস্কটপেও উপরে-নিচে লেআউট */}
        <div className="flex flex-col gap-8">
          {/* 🆕 টিকিট ফর্ম */}
          <div>
            <h2 className="font-bold text-white mb-4 border-b border-slate-800 pb-2">
              নতুন টিকিট তৈরি করুন
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="tel"
                  required
                  placeholder="আপনার ১১ ডিজিটের ফোন নম্বর"
                  value={formData.phone}
                  maxLength={11}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="টাইটেল বা বিষয়"
                  value={formData.title}
                  maxLength={30}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1 text-right">
                  {formData.title.length}/30
                </p>
              </div>
              <div>
                <textarea
                  rows="4"
                  required
                  placeholder="আপনার বিস্তারিত বার্তা..."
                  value={formData.message}
                  maxLength={400}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white resize-none"
                ></textarea>
                <p className="text-[10px] text-slate-500 mt-1 text-right">
                  {formData.message.length}/400
                </p>
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {status === "sending" ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
              </button>
              {status === "success" && (
                <p className="text-emerald-400 text-sm text-center font-bold">
                  সফলভাবে টিকিট তৈরি হয়েছে!
                </p>
              )}
              {status === "error" && (
                <p className="text-rose-400 text-sm text-center font-bold">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>

          {/* 🆕 ইউজারের টিকিট লিস্ট ও রিপ্লাই */}
          <div>
            <h2 className="font-bold text-white mb-4 border-b border-slate-800 pb-2">
              আপনার টিকিটসমূহ
            </h2>
            {userTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                কোনো টিকিট নেই।
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {userTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">
                          {ticket.title}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          {new Date(ticket.createdAt).toLocaleString("bn-BD")}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          ticket.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : ticket.status === "in_progress"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : ticket.status === "closed"
                                ? "bg-slate-700/50 text-slate-400 border-slate-600"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {ticket.status === "resolved"
                          ? "সমাধান"
                          : ticket.status === "in_progress"
                            ? "চলমান"
                            : ticket.status === "closed"
                              ? "ক্লোজড"
                              : "নতুন"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {ticket.message}
                    </p>
                    {ticket.replies?.length > 0 && (
                      <div className="space-y-2 border-t border-slate-800 pt-2 mt-2">
                        <p className="text-[10px] font-bold text-slate-500">
                          রিপ্লাই:
                        </p>
                        {ticket.replies.map((r, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2"
                          >
                            <p className="text-[9px] text-slate-500 mb-1">
                              {r.senderName} ·{" "}
                              {new Date(r.sentAt).toLocaleString("bn-BD")}
                            </p>
                            <p className="text-xs text-slate-300">
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
      </div>
    </div>
  );
}
