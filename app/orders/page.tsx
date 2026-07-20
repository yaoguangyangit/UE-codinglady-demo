import Link from "next/link";

const STEPS = [
  {
    icon: "🔐",
    title: "一键授权绑定",
    desc: "平台官方授权，只读订单，不涉及支付密码",
  },
  {
    icon: "🔄",
    title: "订单自动同步",
    desc: "自动筛出近 2 年的宝宝服饰订单，不用手选",
  },
  {
    icon: "🧺",
    title: "主图尺码自动入库",
    desc: "商品主图、尺码、店铺信息直接长成衣橱卡片",
  },
];

const PLATFORMS = [
  { name: "淘宝", icon: "🟠", bg: "from-[#ff8a3d] to-[#ff6a00]" },
  { name: "抖音", icon: "⬛", bg: "from-[#3b3b3b] to-[#161616]" },
  { name: "唯品会", icon: "🌸", bg: "from-[#f7a8c4] to-[#e75480]" },
];

export default function OrdersPage() {
  return (
    <div className="space-y-5 animate-float-up">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-ink-soft">
          ‹ 首页
        </Link>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-butter-soft text-[#b08a2e]">
          即将上线 · 流程预览
        </span>
      </div>

      <section className="text-center pt-1">
        <div className="text-4xl">🛒</div>
        <h1 className="font-display text-2xl text-ink mt-2">导入电商平台订单</h1>
        <p className="text-sm text-ink-soft mt-1">
          订单里的商品主图，一键搬进衣橱
        </p>
      </section>

      {/* 三步流程（整合为一张卡片，与绑定入口区分） */}
      <section className="card-dream rounded-3xl p-4">
        <p className="text-[11px] text-ink-soft mb-3">📦 三步完成，不用手选</p>
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-macaron-blue-soft to-macaron-pink-soft flex items-center justify-center text-base shrink-0">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink">
                  <span className="text-macaron-pink-deep font-display mr-1">{i + 1}</span>
                  {s.title}
                </p>
                <p className="text-[10px] text-ink-soft mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 绑定入口 */}
      <section className="space-y-2.5">
        {PLATFORMS.map((p) => (
          <button
            key={p.name}
            type="button"
            className={`w-full rounded-3xl p-4 bg-gradient-to-r ${p.bg} text-white flex items-center gap-3 shadow hover:scale-[1.01] active:scale-[0.99] transition-transform`}
          >
            <span className="text-xl">{p.icon}</span>
            <span className="flex-1 text-left font-medium">绑定{p.name}账号</span>
            <span className="text-[11px] text-white/80">一键授权 →</span>
          </button>
        ))}
      </section>

      <p className="text-center text-[11px] text-ink-soft/80">
        其他平台：
        <span className="underline underline-offset-2 mx-1">京东</span>·
        <span className="underline underline-offset-2 mx-1">拼多多</span>·
        <span className="underline underline-offset-2 mx-1">得物</span>·
        <span className="underline underline-offset-2 mx-1">闲鱼</span>
      </p>

      <p className="text-center text-[10px] text-ink-soft/60 leading-relaxed">
        授权仅用于读取订单商品信息，数据保存在本机
      </p>
    </div>
  );
}
