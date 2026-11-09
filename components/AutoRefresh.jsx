"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ expiresAt }) {
  const router = useRouter();

  useEffect(() => {
    if (!expiresAt) return;

    const timeLeft = new Date(expiresAt).getTime() - Date.now();

    // যদি টাইম আগেই শেষ হয়ে যায়
    if (timeLeft <= 0) {
      router.refresh();
      return;
    }

    // টাইম শেষ হওয়ার ঠিক ১ সেকেন্ড পরে পেজ রিফ্রেশ হবে
    const timer = setTimeout(() => {
      router.refresh();
    }, timeLeft + 1000);

    return () => clearTimeout(timer);
  }, [expiresAt, router]);

  return null; // এটি স্ক্রিনে কিছু দেখাবে না
}
