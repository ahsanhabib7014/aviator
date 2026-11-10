import "./globals.css";
import { SocketProvider } from "./SocketProvider";

export const metadata = {
  title: "mitupay live",
  description: "mitupay",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <head>
        {/* CDN স্কিপ্টটি এখান থেকে সফলভাবে সরিয়ে ফেলা হয়েছে */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen font-sans">
        {/* ফুল স্ক্রিন বা রেস্পন্সিভ ভিউর জন্য max-w-md সরিয়ে w-full করা হয়েছে */}
        <div className="w-full min-h-screen p-3 md:p-6">
           <SocketProvider><main>{children}</main></SocketProvider>
          
        </div>
      </body>
    </html>
  );
}
