"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, type ScanResult } from "@/lib/store";
import { PRESET_RESULT } from "@/lib/preset";
import { svgPhotoPlaceholder } from "@/lib/product-image";

type Phase = "scanning" | "error";

function ProcessingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ?live=1：实时调用 GLM 全链路（验证真 AI）；默认走预处理固化结果（演示稳定优先）
  const live = searchParams.get("live") === "1";
  const { ready, images, takenAts, places, peoples, monthAge, setResult } = useStore();
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<Phase>("scanning");
  const [jobData, setJobData] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fast, setFast] = useState(false);
  const startedRef = useRef(false);
  const pushedRef = useRef(false);

  const total = images.length;

  // 没有待处理照片（比如直接访问）→ 回授权页
  useEffect(() => {
    if (ready && total === 0) router.replace("/");
  }, [ready, total, router]);

  // 处理管线：默认直接产出固化结果；?live=1 时实时调用 /api/decompose → /api/analyze
  useEffect(() => {
    if (!ready || total === 0 || startedRef.current) return;
    startedRef.current = true;
    if (!live) {
      // 固化路径：保持"正在分析"的节奏感，稍后直接产出预处理结果
      const t = setTimeout(() => setJobData(PRESET_RESULT), 2600);
      return () => clearTimeout(t);
    }
    (async () => {
      try {
        const r1 = await fetch("/api/decompose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images, takenAts, places, peoples, monthAge }),
        });
        const d1 = await r1.json();
        if (!r1.ok) throw new Error(d1?.error || "穿搭分解失败");
        const r2 = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monthAge, items: d1.items, photos: d1.photos }),
        });
        const d2 = await r2.json();
        if (!r2.ok) throw new Error(d2?.error || "尺码推演失败");
        // 把 analyze 批量生成的"它的故事"与商品主图合并进衣物档案
        const itemsWithStories = (d1.items as ScanResult["items"]).map((it) => ({
          ...it,
          story: d2.stories?.[it.id] ?? it.story,
          product_image_url: d2.product_images?.[it.id],
        }));
        setJobData({
          photos: d1.photos,
          items: itemsWithStories,
          reminders: d2.reminders,
          shopping: d2.shopping,
          milestones: d2.milestones,
          currentSize: d2.current_size,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "处理失败");
        setPhase("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, total, live]);

  // 卡片节奏化浮现：首张 0.6s，之后每张 0.9s；加速处理后 0.15s/张
  useEffect(() => {
    if (!ready || total === 0 || shown >= total) return;
    const delay = shown === 0 ? 600 : fast ? 150 : 900;
    const t = setTimeout(() => setShown((s) => Math.min(s + 1, total)), delay);
    return () => clearTimeout(t);
  }, [ready, total, shown, fast]);

  // 完成条件：卡片全部浮现 + 结果就绪 → 写入 store 并跳结果页
  useEffect(() => {
    if (total === 0 || shown < total || !jobData || pushedRef.current) return;
    const t = setTimeout(() => {
      pushedRef.current = true;
      setResult(jobData);
      router.push("/wardrobe");
    }, 1100);
    return () => clearTimeout(t);
  }, [total, shown, jobData, router, setResult]);

  if (!ready || total === 0) {
    return <div className="py-20 text-center text-ink-soft">加载中…</div>;
  }

  if (phase === "error") {
    return (
      <div className="py-16 text-center space-y-4 animate-float-up">
        <div className="text-4xl">😴</div>
        <p className="text-ink font-medium">AI 打了个盹：{error}</p>
        <p className="text-xs text-ink-soft">别担心，演示数据随时可以再跑一遍</p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full bg-macaron-pink text-white text-sm font-medium shadow"
          >
            再试一次
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-full bg-card text-ink text-sm border border-[#f4e7d2]"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const allShown = shown >= total;
  // 仅 live 模式逐张显示分解出的衣物名（固化路径照片顺序与结果不对应，不显示避免穿帮）
  const itemNameOf = (photoIndex: number): string[] => {
    if (!live || !jobData) return [];
    const photo = jobData.photos.find((p) => p.id === `photo-${photoIndex + 1}`);
    if (!photo) return [];
    return photo.item_ids
      .map((id) => jobData.items.find((it) => it.id === id)?.name)
      .filter((n): n is string => Boolean(n));
  };

  return (
    <div className="space-y-5 animate-float-up">
      {/* 进度标题 */}
      <section className="text-center pt-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-macaron-pink-soft flex items-center justify-center text-2xl animate-pulse-soft">
          🔍
        </div>
        <h1 className="font-display text-xl mt-3 text-ink">
          {!allShown ? (
            <>
              AI 正在看第 {Math.min(shown + 1, total)}/{total} 张照片
              <span className="inline-flex ml-1">
                <span className="dot-bounce">.</span>
                <span className="dot-bounce">.</span>
                <span className="dot-bounce">.</span>
              </span>
            </>
          ) : jobData ? (
            "衣橱建好啦 ✨"
          ) : (
            "照片看完啦，正在努力分析整理中…"
          )}
        </h1>
        <p className="text-xs text-ink-soft mt-1">
          分解穿搭 → 归并同一件 → 连成成长时间线
        </p>
        {/* 进度条 */}
        <div className="mt-4 h-2.5 rounded-full bg-cream-deep overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-macaron-pink to-macaron-blue transition-all duration-500"
            style={{ width: `${Math.round((shown / total) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-soft">
          <span>
            已分解 {shown}/{total} 张
          </span>
        </div>
      </section>

      {/* 逐张浮现的照片卡片 */}
      <section className="grid grid-cols-3 gap-3">
        {Array.from({ length: shown }).map((_, i) => {
          const names = itemNameOf(i);
          return (
            <div
              key={i}
              className="card-dream rounded-2xl overflow-hidden animate-pop-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[i]}
                alt={`宝宝照片 ${i + 1}`}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (!el.src.startsWith("data:"))
                    el.src = svgPhotoPlaceholder(takenAts[i] || "");
                }}
              />
              <div className="p-2">
                <p className="text-[10px] text-ink-soft">{takenAts[i] || ""}</p>
                {jobData && live ? (
                  names.length ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {names.map((n) => (
                        <span
                          key={n}
                          className="text-[9px] px-1.5 py-0.5 rounded-full bg-macaron-blue-soft text-macaron-blue-deep"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-ink-soft/70 mt-1">
                      这张没看清，可手动补充
                    </p>
                  )
                ) : !jobData ? (
                  <div className="shimmer h-3.5 rounded-full mt-1.5" />
                ) : (
                  <p className="text-[9px] text-[#4e9b74] mt-1">✓ 已分解</p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <p className="text-center text-[11px] text-ink-soft/70">
        零次手动录入——宝宝的衣橱正在自己长出来 🌱
      </p>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-soft">加载中…</div>}>
      <ProcessingInner />
    </Suspense>
  );
}
