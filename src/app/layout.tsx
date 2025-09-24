import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

export const metadata: Metadata = {
  title: "CryptoVault - AI-Powered Portfolio Management",
  description: "Transform your crypto trading with advanced AI analytics, real-time market insights, and intelligent portfolio optimization. Make informed decisions with confidence.",
  keywords: "cryptocurrency, portfolio management, AI trading, crypto analytics, blockchain, investment",
  authors: [{ name: "CryptoVault Team" }],
  creator: "CryptoVault",
  publisher: "CryptoVault",
  openGraph: {
    title: "CryptoVault - AI-Powered Portfolio Management",
    description: "Transform your crypto trading with advanced AI analytics and intelligent portfolio optimization.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CryptoVault - AI-Powered Portfolio Management",
    description: "Transform your crypto trading with advanced AI analytics and intelligent portfolio optimization.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
