import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OfflineIndicator from "@/components/OfflineIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. 极其重要：适配 iOS 状态栏、刘海屏以及禁止手势缩放
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF8FA3",
  userScalable: false, // 禁止双击或双指缩放，提供更纯粹的 App 触感
  viewportFit: "cover", // 让网页延伸到全屏幕（包括刘海屏和底部黑条区）
};
// 2. 苹果专用 PWA 增强标签
export const metadata: Metadata = {
  title: "Side by Side",
  description: "属于我们的小世界",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // 让 iOS 状态栏变成透明沉浸式
    title: "Side by Side",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-brand-cream text-brand-text font-sans antialiased">
        <OfflineIndicator />
        {children}
      </body>
    </html>
  );
}
