"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export type TabKey = "closet" | "timeline" | "reminders" | "me";

const ITEMS: { key: TabKey; label: string; icon: string; href: string }[] = [
  { key: "closet", label: "衣橱", icon: "🧺", href: "/wardrobe" },
  { key: "timeline", label: "时间线", icon: "🌱", href: "/wardrobe?tab=timeline" },
  { key: "reminders", label: "提醒", icon: "🔔", href: "/wardrobe?tab=reminders" },
  { key: "me", label: "我的", icon: "👤", href: "/me" },
];

/**
 * 小程序式底部 tab bar（portal 挂 body：transform 祖先会让 fixed 失效）。
 * onSelect 提供时页内切换（"我的"始终走链接）；否则整排 Link 跳转（首页用）。
 */
export default function BottomTab({
  active,
  onSelect,
}: {
  active: TabKey | null;
  onSelect?: (key: TabKey) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-[#f4e7d2]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {ITEMS.map((t) => {
          const cls = "py-2.5 flex flex-col items-center gap-0.5";
          const inner = (
            <>
              <span className="text-lg leading-none">{t.icon}</span>
              <span
                className={`text-[10px] ${
                  active === t.key
                    ? "text-macaron-pink-deep font-medium"
                    : "text-ink-soft"
                }`}
              >
                {t.label}
              </span>
            </>
          );
          return onSelect && t.key !== "me" ? (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect(t.key)}
              className={cls}
            >
              {inner}
            </button>
          ) : (
            <Link key={t.key} href={t.href} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body
  );
}
