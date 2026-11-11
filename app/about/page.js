export const metadata = {
  title: "আমাদের সম্পর্কে - Mitupay | বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম",
  description:
    "Mitupay সম্পর্কে জানুন। বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম। এভিয়েটর, ২ গুণ, ৩৬ গুণ সহ আকর্ষণীয় সব গেম। নিরাপদ লেনদেন ও ২৪/৭ সাপোর্ট।",
  keywords: [
    "Mitupay সম্পর্কে",
    "অনলাইন গেমিং",
    "এভিয়েটর গেম",
    "বাংলাদেশ গেমিং",
    "mitupay about",
    "mitupay online gaming",
    "mitupay aviator",
    "mitupay 2x",
    "mitupay",
    "বিশ্বস্ত গেমিং প্ল্যাটফর্ম",
  ],
  openGraph: {
    title: "আমাদের সম্পর্কে - Mitupay",
    description:
      "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম। নিরাপদ লেনদেন, দ্রুত পেমেন্ট ও ২৪/৭ সাপোর্ট।",
    url: "https://mitupay.tech/about",
    siteName: "Mitupay",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "About Mitupay",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "আমাদের সম্পর্কে - Mitupay",
    description:
      "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম। নিরাপদ লেনদেন ও ২৪/৭ সাপোর্ট।",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://mitupay.tech/about",
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function AboutUs() {
  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">
            আমাদের সম্পর্কে
          </h1>
          <p className="text-sm text-slate-400">
            mitupay - একটি নিরাপদ ও বিশ্বস্ত অনলাইন প্ল্যাটফর্ম
          </p>
        </div>

        <div className="space-y-6 text-sm md:text-base text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">mitupay</strong> হলো একটি আধুনিক এবং
            নিরাপদ অনলাইন গেমিং ও বিনোদন প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো
            ব্যবহারকারীদের জন্য একটি স্বচ্ছ, নিরাপদ এবং আনন্দদায়ক অভিজ্ঞতা
            নিশ্চিত করা। আমরা বিশ্বাস করি যে গেমিং শুধুমাত্র বিনোদনের জন্য হওয়া
            উচিত, এবং আমরা সবসময় দায়িত্বশীল গেমিংকে উৎসাহিত করি।
          </p>
          <p>
            আমাদের প্ল্যাটফর্মে আপনি পাবেন{" "}
            <strong className="text-emerald-400">
              এভিয়েটর, ২ গুণ, ৩৬ গুণ
            </strong>{" "}
            সহ আরও অনেক আকর্ষণীয় গেম। আমরা অত্যাধুনিক প্রযুক্তি এবং নিরাপদ
            এনক্রিপশন ব্যবহার করে আপনার প্রতিটি লেনদেন এবং তথ্য সুরক্ষিত রাখি।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
              <i className="fa-solid fa-shield-halved text-3xl text-emerald-400 mb-3"></i>
              <h3 className="font-bold text-white mb-1">১০০% নিরাপদ</h3>
              <p className="text-xs text-slate-400">
                আপনার তথ্য ও লেনদেন সম্পূর্ণ সুরক্ষিত।
              </p>
            </div>
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
              <i className="fa-solid fa-bolt text-3xl text-amber-400 mb-3"></i>
              <h3 className="font-bold text-white mb-1">দ্রুত পেমেন্ট</h3>
              <p className="text-xs text-slate-400">
                মাত্র কয়েক মিনিটে ডিপোজিট ও উইথড্র।
              </p>
            </div>
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
              <i className="fa-solid fa-headset text-3xl text-blue-400 mb-3"></i>
              <h3 className="font-bold text-white mb-1">২৪/৭ সাপোর্ট</h3>
              <p className="text-xs text-slate-400">
                যেকোনো সময় আমাদের সাপোর্ট টিম আপনার পাশে।
              </p>
            </div>
          </div>

          <p>
            আমরা সবসময় আমাদের ব্যবহারকারীদের মতামতকে গুরুত্ব দিই এবং নিয়মিত
            আমাদের প্ল্যাটফর্ম আপডেট ও উন্নত করে চলেছি। আপনার যেকোনো জিজ্ঞাসা বা
            সহায়তার জন্য আমাদের{" "}
            <strong className="text-emerald-400">সাপোর্ট টিম</strong> সর্বদা
            প্রস্তুত।
          </p>
        </div>
      </div>
    </div>
  );
}
