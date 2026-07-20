"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

/** 衣柜四个储物格子：分类归组与衣橱页统计口径一致 */
const GROUPS = [
  { key: "衣服", icon: "👕", types: ["上衣", "外套"], zone: "挂衣区" },
  { key: "裤子", icon: "👖", types: ["裤子"], zone: "叠放区" },
  { key: "套装", icon: "🩱", types: ["连体衣", "哈衣", "包屁衣", "连衣裙"], zone: "挂衣区" },
  { key: "配饰", icon: "🧢", types: ["帽子", "袜子", "鞋子", "配饰"], zone: "抽屉区" },
];

export default function HomePage() {
  const router = useRouter();
  const { ready, profile, result } = useStore();

  if (!ready) {
    return <div className="py-20 text-center text-ink-soft">加载中…</div>;
  }

  const items = result?.items ?? [];
  const countOf = (types: string[]) => items.filter((i) => types.includes(i.type)).length;

  return (
    <div className="space-y-5 animate-float-up">
      {/* 儿童衣柜：木纹柜体 + 四个储物格子 + 底部切换杆 */}
      <section className="rounded-[2rem] bg-gradient-to-b from-[#e6cda3] via-[#dcbd8b] to-[#cfa96f] border-[3px] border-[#bd9260] shadow-xl p-3">
        {/* 柜顶板：宝宝头像姓名（点击进设置/授权页） */}
        <button
          type="button"
          onClick={() => router.push("/setup")}
          className="w-full flex items-center gap-2.5 rounded-2xl bg-[#fbf3e4]/90 border border-[#e8d5b5] px-3.5 py-3 shadow-inner text-left active:scale-[0.99] transition"
        >
          {profile?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.nickname}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/70 border-2 border-dashed border-macaron-pink flex items-center justify-center text-2xl shrink-0">
              👶
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display text-ink truncate">
              {profile?.nickname || "设置宝宝信息"}
            </p>
            <p className="text-[10px] text-ink-soft mt-0.5">
              {profile
                ? `${result?.photos.length ?? 0} 张照片 · ${items.length} 件衣物`
                : "点这里先认识一下宝宝 →"}
            </p>
          </div>
        </button>

        {/* 柜身：2×2 储物格子（内凹阴影做出隔层感） */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {GROUPS.map((g) => (
            <div
              key={g.key}
              className="rounded-2xl bg-[#fbf3e4] border border-[#e2cba4] shadow-[inset_0_3px_10px_rgba(120,90,50,0.30)] p-3.5"
            >
              {/* 格子顶部统一柜门扶手/挂杆，四个格子视觉一致 */}
              <div className="h-1 rounded-full bg-[#c49a63] mb-2 shadow-sm" />
              <div className="flex items-center justify-between">
                <span className="text-xl">{g.icon}</span>
                <span className="font-display text-2xl text-ink">
                  {profile ? countOf(g.types) : "—"}
                </span>
              </div>
              <p className="text-xs font-medium text-ink mt-1.5">{g.key}</p>
              <p className="text-[10px] text-ink-soft/70 mt-0.5">
                {g.zone} · {g.types.join(" · ")}
              </p>
            </div>
          ))}
        </div>

        {/* 柜底杆：左右切换衣柜 + 中间添加衣柜（不足两个时才出现添加） */}
        {profile && (
          <div className="mt-3 flex items-center justify-center gap-2.5 pb-1">
            <button
              type="button"
              disabled
              aria-label="上一个衣柜"
              className="w-9 h-9 rounded-full bg-[#fbf3e4]/70 text-ink-soft/40 shadow-inner"
            >
              ‹
            </button>
            <Link
              href="/setup?new=1"
              className="h-9 px-4 rounded-full bg-macaron-pink text-white text-xs font-medium shadow flex items-center active:scale-95 transition"
            >
              ＋ 添加衣柜
            </Link>
            <button
              type="button"
              disabled
              aria-label="下一个衣柜"
              className="w-9 h-9 rounded-full bg-[#fbf3e4]/70 text-ink-soft/40 shadow-inner"
            >
              ›
            </button>
          </div>
        )}
      </section>

      {/* 去衣橱看全部卡片 */}
      <p className="text-center text-[11px]">
        <Link
          href="/wardrobe"
          className="text-macaron-blue-deep underline underline-offset-4"
        >
          {profile ? `共 ${items.length} 件 · 去「衣橱」查看全部卡片 →` : "去「衣橱」看看 →"}
        </Link>
      </p>

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
