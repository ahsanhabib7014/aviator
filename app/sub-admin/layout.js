
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import MobileSidebar from "./MobileSidebar"; // 🆕 নতুন ক্লায়েন্ট কম্পোনেন্ট

export default async function SubAdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let userRole = "";
  let userPermissions = [];
  let permissionExpiresAt = null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userRole = decoded.role || "";
    userPermissions = decoded.permissions || decoded.permission || [];
    permissionExpiresAt = decoded.permissionExpiresAt || null;

    if (userRole !== "sub-admin" && userRole !== "admin") {
      redirect("/");
    }
  } catch (err) {
    redirect("/login");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isAdmin = userRole === "admin";

  // 🆕 পারমিশন চেক
  const hasPerm = (permName) => {
    if (isAdmin) return true;
    const hasPermission = userPermissions.some(
      (p) =>
        p === permName ||
        p === permName.replace(/-/g, "_") ||
        p === permName.replace(/_/g, "-"),
    );
    if (!hasPermission) return false;
    if (permName === "manage_dashboard") return true;

    if (permissionExpiresAt) {
      const isExpired = Date.now() > new Date(permissionExpiresAt).getTime();
      if (isExpired) return false;
    }
    return true;
  };

  // 🆕 সব পারমিশন
  const canManageDashboard = hasPerm("manage_dashboard");
  const canViewGameTracking = hasPerm("view_game_tracking");
  const canManageUsers = hasPerm("manage_users");
  const canManageDeposits = hasPerm("manage_deposits");
  const canManageWithdraws = hasPerm("manage_withdraws");
  const canManageReferrals = hasPerm("manage_referrals");
  const canManagePayments = hasPerm("manage_payments");
  const canManagePaymentMethods = hasPerm("manage_methods");
  const canManageExchangeRate = hasPerm("manage_exchange_rate");
  const canManageNowPayments = hasPerm("manage_nowpayments");
  const canManageAutoCrypto = hasPerm("manage_auto_crypto");
  const canManageBonusSettings = hasPerm("manage_bonus_settings");
  const canManageBonusHistory = hasPerm("view_bonus_history");
  const canManageDollarRequests = hasPerm("agent-requests");
  const canViewLiveAviator = hasPerm("live-aviator");
  const canViewLiveStats = hasPerm("LIVE_STATS");
  const canManageNotices = hasPerm("manage_notices");
  const canManageContactsMessages = hasPerm("manage_contact-messages");

  // 🆕 সব মেনু আইটেম (সাইডবার ও বটম নেভিগেশন উভয়ের জন্য)
  const menuItems = [
    { href: "/sub-admin", label: "ড্যাশবোর্ড", show: canManageDashboard },
    {
      href: "/sub-admin/live-traking",
      label: "ট্র্যাকিং",
      show: canViewGameTracking,
    },
    {
      href: "/sub-admin/LiveAviatorStatus",
      label: "লাইভ এভিয়েটর",
      show: canViewLiveAviator,
    },
    { href: "/sub-admin/users", label: "ইউজার", show: canManageUsers },
    { href: "/sub-admin/deposits", label: "ডিপোজিট", show: canManageDeposits },
    { href: "/sub-admin/withdraws", label: "উইথড্র", show: canManageWithdraws },
    {
      href: "/sub-admin/referrals",
      label: "রেফারেল",
      show: canManageReferrals,
    },
    { href: "/sub-admin/payments", label: "পেমেন্ট", show: canManagePayments },
    {
      href: "/sub-admin/payment-methods",
      label: "মেথডস",
      show: canManagePaymentMethods,
    },
    {
      href: "/sub-admin/settings/exchange-rate",
      label: "Exchange Rate",
      show: canManageExchangeRate,
    },
    {
      href: "/sub-admin/nowpayments",
      label: "NowPayments",
      show: canManageNowPayments,
    },
    {
      href: "/sub-admin/settings/auto-crypto",
      label: "Auto Crypto",
      show: canManageAutoCrypto,
    },
    {
      href: "/sub-admin/bonus-settings",
      label: "বোনাস সেটিংস",
      show: canManageBonusSettings,
    },
    {
      href: "/sub-admin/bonus-history",
      label: "বোনাস ইতিহাস",
      show: canManageBonusHistory,
    },
    { href: "/sub-admin/notices", label: "নোটিশ", show: canManageNotices },
    {
      href: "/sub-admin/contact-messages",
      label: "কন্টাক্ট মেসেজ",
      show: canManageContactsMessages,
    },
    {
      href: "/sub-admin/live-stats",
      label: "লাইভ স্ট্যাটস",
      show: canViewLiveStats,
    },
    {
      href: "/sub-admin/dollar-requests",
      label: "ডলার রিকোয়েস্ট",
      show: canManageDollarRequests,
    },
   
  ];

  // 🆕 শুধু অনুমোদিত আইটেম ফিল্টার করুন
  const visibleMenuItems = menuItems.filter((item) => item.show);

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col justify-between pb-24">
      <AutoRefresh expiresAt={permissionExpiresAt} />

      {/* 🆕 মোবাইল সাইডবার কম্পোনেন্ট */}
      <MobileSidebar 
        menuItems={visibleMenuItems} 
        pathname={pathname}
        extraSidebarLinks={[
          { href: "/sub-admin/contact", label: "যোগাযোগ করুন" }
        ]} 
      />

      <main className="flex-1 max-w-md w-full mx-auto p-4 pt-6">
        {children}
      </main>

      {/* 🆕 নিচের নেভিগেশন বার */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-3">
        <nav className="max-w-md w-full bg-[#0b132b] border border-slate-800/80 rounded-2xl py-3 px-4 flex justify-around items-center overflow-x-auto shadow-2xl space-x-2">
          {visibleMenuItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center flex-shrink-0 transition ${
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
