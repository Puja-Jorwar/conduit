import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Conduit — API Integration Platform for Indian SaaS",
  description: "Connect Razorpay, Tally, Zoho and more. The integration layer built for Indian SaaS companies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="orb orb-purple" />
        <div className="orb orb-blue" />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <Navbar />
          <main style={{ paddingTop: '72px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
