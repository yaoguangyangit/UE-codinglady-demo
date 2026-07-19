import ConceptLayout from "@/components/ConceptLayout";

export default function MemoriesPage() {
  return (
    <ConceptLayout
      icon="🎙️"
      title="念想物件"
      subtitle="口述 30 秒，AI 替物件立小传"
      points={[
        "对着物件说一段话，语音转写成物件小传",
        "声音里的记忆，比照片留得更久",
        "每件老物件，都值得一段话送行",
      ]}
    >
      {/* 主视觉：物件小传 */}
      <section className="card-dream rounded-3xl p-4">
        <div className="flex items-center gap-2 text-[11px] text-ink-soft">
          <span className="w-2 h-2 rounded-full bg-macaron-pink animate-pulse-soft" />
          口述 00:32 · 已转写
        </div>
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-macaron-pink-soft to-butter-soft p-4">
          <p className="text-sm font-display text-ink">外婆的缝纫机 · 1982</p>
          <p className="text-xs text-ink leading-relaxed mt-2">
            它陪外婆缝过全家的衣裳，也缝过我的第一条裙子。踩起来咯噔咯噔的声音，
            是我童年的背景音。2026 年搬家这天，我给它留了新家靠窗的位置——
            阳光好的下午，还能听见它转起来。
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-end gap-0.5 h-5" aria-hidden>
            {[6, 12, 8, 16, 10, 14, 7, 12, 9, 15, 6, 11].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-macaron-pink/70"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-macaron-pink-deep">继续说 →</span>
        </div>
      </section>
    </ConceptLayout>
  );
}
