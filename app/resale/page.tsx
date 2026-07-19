import ConceptLayout from "@/components/ConceptLayout";

export default function ResalePage() {
  return (
    <ConceptLayout
      icon="📱"
      title="旧物转卖"
      subtitle="拍 SN 码和外观，AI 一键写好转卖帖"
      points={[
        "拍 SN 码/型号标签，自动识别配置与保修",
        "AI 参考成交行情给出估价区间，不再纠结定价",
        "标题、成色描述、卖点文案一次生成，一键复制去闲鱼发布",
      ]}
    >
      {/* 主视觉：AI 已生成的转卖帖 */}
      <section className="card-dream rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-macaron-blue-soft to-macaron-blue flex items-center justify-center text-3xl shrink-0">
            📱
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">iPhone 15 Pro 256GB 白色</p>
            <p className="text-[11px] text-ink-soft mt-0.5">
              电池 91% · 成色 95 新 · 在保至 2026-11
            </p>
            <p className="text-sm font-display text-macaron-pink-deep mt-1">
              ¥5,200 – 5,600
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-cream-deep/60 p-3 text-[11px] text-ink leading-relaxed">
          「自用一手 iPhone 15 Pro，全程戴壳贴膜无划痕，配件齐全带发票。
          因换新机诚意出，支持当面验机。」
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-ink-soft">
          <span>已从 3 张照片识别：SN 码 / 型号 / 外观成色</span>
          <span className="text-macaron-pink-deep">一键复制 →</span>
        </div>
      </section>
    </ConceptLayout>
  );
}
