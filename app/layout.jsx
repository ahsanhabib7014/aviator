// import "./globals.css";
// import { SocketProvider } from "./SocketProvider";

// export const metadata = {
//   title: {
//     default: "Mitupay - অনলাইন গেমিং প্ল্যাটফর্ম",
//     template: "%s | Mitupay",
//   },
//   description: "Mitupay - বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম। এভিয়েটর, ২ গুণ, ৩৬ গুণ সহ আরও অনেক গেম।",
//   keywords: ["অনলাইন গেম", "এভিয়েটর","mitupay", "মিতুপে", "গেমিং", "betting", "Bangladesh"],
//   authors: [{ name: "Mitupay" }],
//   creator: "Mitupay",
//   publisher: "Mitupay",
//   metadataBase: new URL("https://mitupay.tech"),
//   openGraph: {
//     type: "website",
//     locale: "bn_BD",
//     url: "https://mitupay.tech",
//     siteName: "Mitupay",
//     title: "Mitupay - অনলাইন গেমিং প্ল্যাটফর্ম",
//     description: "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম।",
//     images: [
//       {
//         url: "/og-image.jpg", // public ফোল্ডারে একটি ছবি রাখুন
//         width: 1200,
//         height: 630,
//         alt: "Mitupay",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Mitupay - অনলাইন গেমিং প্ল্যাটফর্ম",
//     description: "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম।",
//     images: ["/og-image.jpg"],
//   },
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-video-preview": -1,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//     },
//   },
//   verification: {
//     google: "আপনার-গুগল-সার্চ-কনসোল-ভেরিফিকেশন-কোড", // পরে যোগ করবেন
//   },
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="bn" data-scroll-behavior="smooth">
//       <head>
//         {/* CDN স্কিপ্টটি এখান থেকে সফলভাবে সরিয়ে ফেলা হয়েছে */}
//         <link
//           rel="stylesheet"
//           href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
//         />
//       </head>
//       <body className="bg-[#090d16] text-slate-100 min-h-screen font-sans">
//             <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "Organization",
//               name: "Mitupay",
//               url: "https://mitupay.tech",
//               logo: "https://mitupay.tech/logo.png",
//               description:
//                 "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম। এভিয়েটর, ২ গুণ, ৩৬ গুণ সহ আরও অনেক গেম।",
//               sameAs: [
//                 "https://t.me/mitupay",
//                 "https://facebook.com/mitupay",
//               ],
//             }),
//           }}
//         />
//         {/* ফুল স্ক্রিন বা রেস্পন্সিভ ভিউর জন্য max-w-md সরিয়ে w-full করা হয়েছে */}
//         <div className="w-full min-h-screen p-3 md:p-6">
//            <SocketProvider><main>{children}</main></SocketProvider>
          
//         </div>
//       </body>
//     </html>
//   );
// }
// //////////////////////////////////
import "./globals.css";
import { SocketProvider } from "./SocketProvider";

export const metadata = {
  title: {
    default: "Mitupay - অনলাইন গেমিং প্ল্যাটফর্ম",
    template: "%s | Mitupay",
  },
  description: "Mitupay - বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম। এভিয়েটর, ২ গুণ, ৩৬ গুণ সহ আরও অনেক গেম।",
  keywords: ["অনলাইন গেম", "এভিয়েটর","mitupay", "মিতুপে", "গেমিং", "betting", "Bangladesh"],
  authors: [{ name: "Mitupay" }],
  creator: "Mitupay",
  publisher: "Mitupay",
  metadataBase: new URL("https://mitupay.tech"),
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "https://mitupay.tech",
    siteName: "Mitupay",
    title: "Mitupay - অনলাইন গেমিং প্ল্যাটফর্ম",
    description: "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম।",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mitupay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitupay - অনলাইন গেমিং প্ল্যাটফর্ম",
    description: "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম।",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "আপনার-গুগল-সার্চ-কনসোল-ভেরিফিকেশন-কোড",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* 🆕 Structured Data (JSON-LD) — head-এ রাখা হয়েছে */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Mitupay",
              url: "https://mitupay.tech",
              logo: "https://mitupay.tech/logo.png",
              description:
                "বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গেমিং প্ল্যাটফর্ম। এভিয়েটর, ২ গুণ, ৩৬ গুণ সহ আরও অনেক গেম।",
              sameAs: [
                // "https://t.me/mitupay",
                "https://facebook.com/mitupay",
              ],
            }),
          }}
        />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen font-sans">
        <div className="w-full min-h-screen p-3 md:p-6">
          <SocketProvider>
            <main>{children}</main>
          </SocketProvider>
        </div>
      </body>
    </html>
  );
}