import ConceptLayout from "@/components/ConceptLayout";

export default function ValuablesPage() {
  return (
    <ConceptLayout
      icon="💎"
      title="贵重物"
      subtitle="拍照建档，收纳与理赔都有据"
      points={[
        "拍照自动建档：品牌、型号、购买凭证一处存",
        "按材质给出收纳环境建议：湿度、避光、防盗",
        "搬前拍照留档，万一损伤理赔有据",
      ]}
    >
      {/* 主视觉：收纳方案 */}
      <section className="card-dream rounded-3xl p-4 space-y-2">
        <p className="text-[11px] text-ink-soft">🧭 AI 收纳方案 · 按材质生成</p>
        <div className="rounded-2xl bg-macaron-blue-soft/70 p-3 flex items-center gap-3">
          <span className="text-xl">⌚</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-ink">机械手表 × 2</p>
            <p className="text-[10px] text-ink-soft mt-0.5">
              防潮箱第 1 层 · 湿度 45% · 远离音箱
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-mint-soft/70 p-3 flex items-center gap-3">
          <span className="text-xl">📷</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-ink">相机 + 镜头 × 3</p>
            <p className="text-[10px] text-ink-soft mt-0.5">
              防潮箱第 2 层 · 配干燥剂 · 已拍序列号
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-butter-soft/80 p-3 flex items-center gap-3">
          <span className="text-xl">💍</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-ink">首饰 + 重要证件</p>
            <p className="text-[10px] text-ink-soft mt-0.5">
              保险柜 · 证件区 · 发票已扫描归档
            </p>
          </div>
        </div>
      </section>
    </ConceptLayout>
  );
}
