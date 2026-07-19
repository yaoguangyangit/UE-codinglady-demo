import ConceptLayout from "@/components/ConceptLayout";

export default function FurniturePage() {
  return (
    <ConceptLayout
      icon="🗄️"
      title="家具家电"
      subtitle="拍照 + AR 测距，先预演再决定搬不搬"
      points={[
        "拍照自动识别家具家电，AR 测距量出尺寸",
        "输入新家户型，AI 生成摆放效果图，提前看见新家",
        "放不下的提前转卖，不再白搬一趟",
      ]}
    >
      {/* 主视觉：测距标注 + 摆放结论 */}
      <section className="card-dream rounded-3xl p-4 space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-macaron-blue-soft to-cream-deep p-4">
          <p className="text-[11px] text-ink-soft">📐 AR 测距</p>
          <p className="font-display text-2xl text-ink mt-1">
            三人位沙发 <span className="text-macaron-blue-deep">2.1m</span>
          </p>
          <div className="mt-2 h-2 rounded-full bg-white/70 relative">
            <div className="absolute left-0 top-0 h-full w-[70%] rounded-full bg-macaron-blue" />
            <span className="absolute right-1 -top-5 text-[10px] text-ink-soft">
              新家客厅墙 3.0m
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-mint-soft text-[#4e9b74]">
            ✅ 放得下，靠墙还剩 0.9m 过道
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-soft">
          <div className="rounded-xl bg-cream-deep/60 p-2.5">
            旧客厅实拍 → AI 已匹配同角度
          </div>
          <div className="rounded-xl bg-macaron-pink-soft/70 p-2.5">
            新家效果图：沙发 + 边几 + 落地灯
          </div>
        </div>
      </section>
    </ConceptLayout>
  );
}
