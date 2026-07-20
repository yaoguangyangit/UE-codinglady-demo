import Link from "next/link";

const MODULES = [
  {
    href: "/",
    icon: "🍼",
    title: "宝宝衣橱",
    desc: "相册授权，AI 自动建衣橱",
    live: true,
  },
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

export default function ModulesPage() {
  return (
    <div className="space-y-4 animate-float-up">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-ink-soft">
          ‹ 首页
        </Link>
        <span className="ml-auto text-[10px] text-ink-soft/70">拾光 · 完整构想</span>
      </div>

      {/* 六模块统一宫格：宝宝衣橱首位（粉色高亮 · 立即体验） */}
      <section className="grid grid-cols-2 gap-3">
        {MODULES.map((m) =>
          m.live ? (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-3xl p-4 bg-gradient-to-br from-macaron-pink to-macaron-pink-deep text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{m.icon}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/25">
                  立即体验
                </span>
              </div>
              <p className="font-medium text-[13px] mt-1.5">{m.title}</p>
              <p className="text-[10px] text-white/85 mt-0.5 leading-snug">{m.desc}</p>
            </Link>
          ) : (
            <Link
              key={m.href}
              href={m.href}
              className="card-dream rounded-3xl p-4 hover:scale-[1.02] active:scale-[0.98] transition-transform"
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
          )
        )}
      </section>

      <p className="text-center text-[11px] text-ink-soft/70 leading-relaxed pt-1">
        同一个"从照片长出物品档案"的引擎——
        <br />
        你最期待哪个模块？告诉我们 →
      </p>
    </div>
  );
}
