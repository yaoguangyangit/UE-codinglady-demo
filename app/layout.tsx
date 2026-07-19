import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "AI搬家",
  description:
    "拖延症克星：AI 管家帮你把全屋物品理清楚。从照片里长出全家的物品档案——宝宝衣橱、旧物转卖、家具家电、纪念品、念想物件、贵重物，一次数字化，全屋全时间的物品管家。",
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
            <span className="text-xl">📦</span>
            <span className="font-display text-lg text-ink">AI搬家</span>
            <span className="ml-auto text-[10px] tracking-[0.2em] text-ink-soft/70">
              AI MOVE
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
