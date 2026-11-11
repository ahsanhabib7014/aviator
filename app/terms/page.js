
export const metadata = {
  title: "শর্তাবলী - Mitupay",
  description: "আমাদের শর্তাবলী পড়ুন এবং আপনার অধিকার এবং দায়িত্ব জানুন।",
  alternates: { canonical: "https://mitupay.tech/notice" },
};

export default function TermsConditions() {
  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-black text-emerald-400 mb-2">
          শর্তাবলী (Terms & Conditions)
        </h1>
        <p className="text-sm text-slate-400 mb-8 border-b border-slate-800 pb-4">
          সর্বশেষ আপডেট: ২০২৪
        </p>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ১. শর্তাবলীর স্বীকৃতি
            </h2>
            <p>
              mitupay প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলীর সাথে
              সম্পূর্ণভাবে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে
              একমত না হন, তবে অনুগ্রহ করে প্ল্যাটফর্মটি ব্যবহার করা থেকে বিরত
              থাকুন।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ২. অ্যাকাউন্ট এবং নিরাপত্তা
            </h2>
            <p>
              আপনার অ্যাকাউন্টের পাসওয়ার্ড এবং অন্যান্য লগইন তথ্য গোপন রাখা
              আপনার দায়িত্ব। আপনার অ্যাকাউন্টে কোনো অননুমোদিত কার্যকলাপ ঘটলে
              অবিলম্বে আমাদের সাপোর্ট টিমকে জানান।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ৩. আর্থিক লেনদেন
            </h2>
            <p>
              সমস্ত ডিপোজিট এবং উইথড্র আপনার নিজের বৈধ অর্থ বা অ্যাকাউন্ট থেকে
              করতে হবে। কোনো প্রকার অবৈধ বা লন্ড্রিংয়ের অর্থ ব্যবহার করা হলে
              অ্যাকাউন্টটি স্থায়ীভাবে ব্লক করা হবে।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ৪. দায়িত্বশীল গেমিং
            </h2>
            <p>
              এই প্ল্যাটফর্মটি শুধুমাত্র বিনোদনের জন্য। আপনার সামর্থ্যের বাইরে
              বাজি ধরবেন না। ১৮ বছরের কম বয়সীদের এই প্ল্যাটফর্ম ব্যবহার
              সম্পূর্ণ নিষিদ্ধ।
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              ৫. শর্তাবলীর পরিবর্তন
            </h2>
            <p>
              mitupay যেকোনো সময় পূর্ব নোটিশ ছাড়াই এই শর্তাবলী পরিবর্তন বা
              আপডেট করার অধিকার সংরক্ষণ করে। আপডেটের পর প্ল্যাটফর্ম ব্যবহার
              চালিয়ে গেলে আপনি নতুন শর্তাবলীর সাথে সম্মত হয়েছেন বলে ধরে নেওয়া
              হবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
