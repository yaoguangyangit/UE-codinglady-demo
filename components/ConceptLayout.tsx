import Link from "next/link";
import type { ReactNode } from "react";

/** 概念页统一布局：返回条 + 标题 + 主视觉 + 亮点 + 引流到主 demo */
export default function ConceptLayout({
  icon,
  title,
  subtitle,
  points,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  points: string[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-5 animate-float-up">
      {/* 返回 + 状态 */}
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-ink-soft">
          ‹ AI搬家
        </Link>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-butter-soft text-[#b08a2e]">
          Coming 2026 · 概念预览
        </span>
      </div>

      {/* 标题 */}
      <section className="text-center pt-1">
        <div className="text-4xl">{icon}</div>
        <h1 className="font-display text-2xl text-ink mt-2">{title}</h1>
        <p className="text-sm text-ink-soft mt-1">{subtitle}</p>
      </section>

      {/* 主视觉 */}
      {children}

      {/* 功能亮点 */}
      <section className="card-dream rounded-3xl p-4">
        <ul className="space-y-2">
          {points.map((p) => (
            <li key={p} className="text-xs text-ink leading-relaxed flex gap-2">
              <span className="text-macaron-pink-deep">✿</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 引流 */}
      <p className="text-center pt-1">
        <Link
          href="/baby"
          className="text-xs text-macaron-pink-deep underline underline-offset-4"
        >
          先看看已上线的宝宝衣橱 →
        </Link>
      </p>
    </div>
  );
}
