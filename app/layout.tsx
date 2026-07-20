import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "拾光 · 宝宝衣橱",
  description:
    "宝宝的每一件衣服，都早已在你的相册里。授权相册，AI 自动建成宝宝衣橱——哪件常穿、哪件闲置、哪件快穿不下，还有每一份第一次穿的成长纪念。拾光：从照片里长出全家的物品档案。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff6e6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream-grad">
        <StoreProvider>
          {/* 极简品牌条 */}
          <header className="w-full max-w-md mx-auto px-5 pt-5 flex items-center gap-2">
            <span className="text-xl">🍼</span>
            <span className="font-display text-lg text-ink">拾光 · 宝宝衣橱</span>
            <span className="ml-auto text-[10px] tracking-[0.2em] text-ink-soft/70">
              SHIGUANG
            </span>
          </header>
          <main className="flex-1 w-full max-w-md mx-auto px-5 pb-10 pt-4">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
