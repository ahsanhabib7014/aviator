export const metadata = {
  title: "গোপনীয়তা নীতি - Mitupay",
  description:
    "আমাদের গোপনীয়তা নীতি পড়ুন এবং আপনার তথ্যের সংরক্ষণের ব্যবস্থা জানুন।",
  alternates: { canonical: "https://mitupay.tech/notice" },
};
export default function PrivacyPolicy() {
  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-black text-emerald-400 mb-2">
          গোপনীয়তা নীতি (Privacy Policy)
        </h1>
        <p className="text-sm text-slate-400 mb-8 border-b border-slate-800 pb-4">
          সর্বশেষ আপডেট: ২০২৪
        </p>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ১. তথ্য সংগ্রহ
            </h2>
            <p>
              আমরা আপনার অ্যাকাউন্ট তৈরির সময় নাম, ফোন নম্বর, ইমেইল এবং
              অন্যান্য প্রয়োজনীয় তথ্য সংগ্রহ করি। এছাড়া প্ল্যাটফর্ম ব্যবহারের
              সময় আমরা কিছু টেকনিক্যাল ডেটা (IP অ্যাড্রেস, ডিভাইস ইনফো) সংগ্রহ
              করতে পারি।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ২. তথ্যের ব্যবহার
            </h2>
            <p>
              আপনার তথ্য মূলত অ্যাকাউন্ট পরিচালনা, লেনদেন প্রসেসিং, গ্রাহক
              সহায়তা প্রদান এবং প্ল্যাটফর্মের নিরাপত্তা নিশ্চিত করার জন্য
              ব্যবহার করা হয়। আমরা আপনার সম্মতি ছাড়া কোনো তৃতীয় পক্ষের কাছে
              আপনার ব্যক্তিগত তথ্য বিক্রি বা শেয়ার করি না।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ৩. ডেটা নিরাপত্তা
            </h2>
            <p>
              আমরা আপনার তথ্য সুরক্ষিত রাখতে আধুনিক এনক্রিপশন এবং নিরাপত্তা
              ব্যবস্থা ব্যবহার করি। তবে ইন্টারনেটের মাধ্যমে কোনো তথ্য প্রেরণের
              সময় ১০০% নিরাপত্তার নিশ্চয়তা দেওয়া সম্ভব নয়।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ৪. কুকিজ (Cookies)
            </h2>
            <p>
              আপনার অভিজ্ঞতা উন্নত করতে আমরা কুকিজ ব্যবহার করি। কুকিজ আপনার
              ব্রাউজারে সংরক্ষিত ছোট ফাইল যা আমাদের প্ল্যাটফর্ম মনে রাখতে
              সাহায্য করে। আপনি চাইলে ব্রাউজার সেটিংস থেকে কুকিজ বন্ধ করতে
              পারেন।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ৫. আপনার অধিকার
            </h2>
            <p>
              আপনি যেকোনো সময় আপনার ব্যক্তিগত তথ্য দেখতে, সংশোধন করতে বা ডিলিট
              করার অনুরোধ করতে পারেন। এর জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ
              করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
