import ConceptLayout from "@/components/ConceptLayout";

export default function MementosPage() {
  return (
    <ConceptLayout
      icon="🖼️"
      title="纪念品"
      subtitle="心爱之物，在新家各有其位"
      points={[
        "拍照识别每件纪念品，自动建档归类",
        "提前录入新家储物格局，AI 分配陈列位置",
        "谁的心爱之物，都有自己的一格",
      ]}
    >
      {/* 主视觉：新家陈列格分配 */}
      <section className="card-dream rounded-3xl p-4">
        <p className="text-[11px] text-ink-soft mb-2.5">
          🏠 新家展示柜 · 已录入 3 个储物空间
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-macaron-pink-soft/70 p-3">
            <p className="text-[10px] text-ink-soft">第 1 格</p>
            <p className="text-xs text-ink font-medium mt-0.5">她的 Labubu × 6</p>
          </div>
          <div className="rounded-2xl bg-macaron-blue-soft/70 p-3">
            <p className="text-[10px] text-ink-soft">第 2 格</p>
            <p className="text-xs text-ink font-medium mt-0.5">旅行冰箱贴 × 12</p>
          </div>
          <div className="rounded-2xl bg-mint-soft/70 p-3">
            <p className="text-[10px] text-ink-soft">第 3 格</p>
            <p className="text-xs text-ink font-medium mt-0.5">他的 3D 打印模型</p>
          </div>
          <div className="rounded-2xl bg-butter-soft/80 p-3">
            <p className="text-[10px] text-ink-soft">抽屉 A</p>
            <p className="text-xs text-ink font-medium mt-0.5">演唱会票根册</p>
          </div>
        </div>
        <p className="text-[10px] text-ink-soft/80 mt-2.5 text-center">
          按尺寸与材质自动排布，亚克力防尘区已优先分配
        </p>
      </section>
    </ConceptLayout>
  );
}
