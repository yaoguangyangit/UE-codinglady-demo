"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

const GROUPS = [
  { key: "衣服", icon: "👕", types: ["上衣", "外套"] },
  { key: "裤子", icon: "👖", types: ["裤子"] },
  { key: "套装", icon: "🩱", types: ["连体衣", "哈衣", "包屁衣", "连衣裙"] },
  { key: "配饰", icon: "🧢", types: ["帽子", "袜子", "鞋子", "配饰"] },
];

export default function ClosetPage() {
  const router = useRouter();
  const { ready, profile, result } = useStore();
  const [hint, setHint] = useState(false);

  if (!ready) {
    return <div className="py-20 text-center text-ink-soft">加载中…</div>;
  }

  const items = result?.items ?? [];
  const countOf = (types: string[]) => items.filter((i) => types.includes(i.type)).length;

  return (
    <div className="space-y-5 animate-float-up">
      {/* 儿童衣柜：顶部头像姓名 + 多孩切换 + 分区汇总 */}
      <section className="rounded-3xl bg-gradient-to-b from-[#f7ead7] to-[#f3e2c8] border border-[#e8d5b5] p-4 shadow-inner">
        {/* 衣柜顶条：头像姓名（左）+ 衣柜切换（右） */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 text-left active:scale-[0.98] transition"
          >
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile.nickname}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/70 border-2 border-dashed border-macaron-pink flex items-center justify-center text-2xl">
                👶
              </div>
            )}
            <div>
              <p className="font-display text-ink">
                {profile?.nickname || "设置宝宝信息"}
              </p>
              <p className="text-[10px] text-ink-soft mt-0.5">
                {profile
                  ? `${result?.photos.length ?? 0} 张照片 · ${items.length} 件衣物`
                  : "点这里先认识一下宝宝 →"}
              </p>
            </div>
          </button>
          {profile && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled
                aria-label="上一个衣柜"
                className="w-8 h-8 rounded-full bg-white/60 text-ink-soft/40"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setHint(true)}
                className="h-8 px-2.5 rounded-full bg-white/80 text-[10px] text-macaron-pink-deep border border-macaron-pink active:scale-95 transition"
              >
                ＋ 添加衣柜
              </button>
            </div>
          )}
        </div>
        {hint && (
          <p className="mt-2 text-[10px] text-macaron-pink-deep text-center">
            多孩衣柜即将上线，先把这一个装满吧 🌱
          </p>
        )}

        {/* 衣柜分区 */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {GROUPS.map((g) => (
            <div
              key={g.key}
              className="rounded-2xl bg-card/90 border border-white/70 p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{g.icon}</span>
                <span className="font-display text-2xl text-ink">
                  {profile ? countOf(g.types) : "—"}
                </span>
              </div>
              <p className="text-xs font-medium text-ink mt-1.5">{g.key}</p>
              <p className="text-[10px] text-ink-soft/70 mt-0.5">
                {g.types.join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-ink-soft/80">
          {profile
            ? `共 ${items.length} 件 · 去「衣橱」查看全部卡片`
            : "设置后，这里会长出宝宝的衣柜"}
        </p>
      </section>

      {/* 底部：用户调研入口（灰色小字） */}
      <p className="text-center pt-1">
        <Link
          href="/modules"
          className="text-[11px] text-ink-soft/70 underline underline-offset-4"
        >
          你希望拾光的下一个模块是什么 →
        </Link>
      </p>
    </div>
  );
}
