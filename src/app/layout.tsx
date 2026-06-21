import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Print Studio - AI画像から3Dモデル生成",
  description: "写真をアップロードしてAIが3Dプリント用モデルを自動生成",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-dvh flex flex-col bg-[#0a0a0f] text-[#e8e8f0] antialiased">
        {children}
      </body>
    </html>
  );
}
