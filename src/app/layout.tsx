import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF8FA3",
  userScalable: false,
  viewportFit: "cover",
};

const basePath = process.env.NODE_ENV === 'production' ? '/side-by-side' : ''

export const metadata: Metadata = {
  title: "Side by Side",
  description: "属于我们的小世界",
  icons: {
    icon: [
      { url: `${basePath}/icons/icon-192x192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icons/icon-512x512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: `${basePath}/icons/apple-icon.png`, sizes: "180x180", type: "image/png" },
      { url: `${basePath}/icons/icon-192x192.png`, sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Side by Side",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="bg-brand-cream text-brand-text font-nunito antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
