import Link from "next/link";

const MODULES = [
  {
    href: "/resale",
    icon: "📱",
    title: "旧物转卖",
    desc: "拍 SN 码，AI 生成转卖帖",
  },
  {
    href: "/furniture",
    icon: "🗄️",
    title: "家具家电",
    desc: "拍照测距，预演新家",
  },
  {
    href: "/mementos",
    icon: "🖼️",
    title: "纪念品",
    desc: "心爱之物，各有其位",
  },
  {
    href: "/memories",
    icon: "🎙️",
    title: "念想物件",
    desc: "口述 30 秒，物件立小传",
  },
  {
    href: "/valuables",
    icon: "💎",
    title: "贵重物",
    desc: "拍照建档，收纳有据",
  },
];

export default function Home() {
  return (
    <div className="space-y-5 animate-float-up">
      {/* 品牌区 */}
      <section className="pt-4 text-center">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-macaron-pink-soft to-macaron-blue-soft border border-white flex items-center justify-center text-4xl shadow-inner">
          📦
        </div>
        <h1 className="font-display text-3xl mt-3 text-ink">拾光</h1>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed px-4">
          拖延症克星：AI 管家帮你把全屋物品理清楚
        </p>
      </section>

      {/* 主模块：宝宝衣橱（可体验 Demo） */}
      <Link
        href="/"
        className="block w-full rounded-3xl p-6 bg-gradient-to-br from-macaron-pink to-macaron-pink-deep text-white shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            🍼
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-xl">宝宝衣橱</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25">
                主 Demo · 可体验
              </span>
            </div>
            <p className="text-xs text-white/85 mt-1 leading-relaxed">
              相册授权，AI 自动建成宝宝衣橱：常穿/闲置/快穿不下，和每一份"第一次穿"
            </p>
          </div>
          <span className="text-2xl text-white/90">›</span>
        </div>
      </Link>

      {/* 规划中模块（视觉减重，突出主 Demo） */}
      <section className="grid grid-cols-2 gap-3 opacity-80">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="card-dream rounded-3xl p-3.5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{m.icon}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-butter-soft text-[#b08a2e]">
                Coming 2026
              </span>
            </div>
            <p className="font-medium text-ink text-[13px] mt-1.5">{m.title}</p>
            <p className="text-[10px] text-ink-soft mt-0.5 leading-snug">{m.desc}</p>
          </Link>
        ))}
      </section>

      <p className="text-center text-[11px] text-ink-soft/70 leading-relaxed pt-1">
        同一个"从照片长出物品档案"的引擎——
        <br />
        宝宝衣橱是第一步，人生物品流转最快的三年在这里。
      </p>
    </div>
  );
}
