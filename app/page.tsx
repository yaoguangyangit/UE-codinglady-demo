"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { DEMO_IMAGES, DEMO_TAKEN_ATS, DEMO_PLACES, DEMO_PEOPLES } from "@/lib/demo";

const MAX_PHOTOS = 20;

/** 读取文件为 base64，并压到最长边 900px 的 JPEG（省存储、省上传） */
async function fileToDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("读取文件失败"));
    r.readAsDataURL(file);
  });
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("图片解析失败"));
      i.src = raw;
    });
    const scale = Math.min(1, 900 / Math.max(img.width, img.height, 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return raw;
  }
}

function toYMD(ms: number): string {
  const d = new Date(ms);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Home() {
  const router = useRouter();
  const { startScan, ready } = useStore();
  const [monthAge, setMonthAge] = useState(9);
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready) {
    return <div className="py-20 text-center text-ink-soft">加载中…</div>;
  }

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setReading(true);
    try {
      const files = Array.from(list)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, MAX_PHOTOS);
      const images: string[] = [];
      const takenAts: string[] = [];
      for (const f of files) {
        images.push(await fileToDataUrl(f));
        takenAts.push(toYMD(f.lastModified));
      }
      if (!images.length) return;
      startScan(monthAge, images, takenAts);
      router.push("/processing");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleDemo() {
    startScan(monthAge, DEMO_IMAGES, DEMO_TAKEN_ATS, DEMO_PLACES, DEMO_PEOPLES);
    router.push("/processing");
  }

  return (
    <div className="space-y-6 animate-float-up">
      {/* 产品名 + 一句话 */}
      <section className="pt-4 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-macaron-pink-soft to-macaron-blue-soft border border-white flex items-center justify-center text-4xl shadow-inner">
          🧸
        </div>
        <h1 className="font-display text-3xl mt-3 text-ink">宝宝衣橱</h1>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed px-2">
          宝宝的每一件衣服，都早已在你的相册里。授权相册，AI 自动建成宝宝衣橱——哪件常穿、哪件闲置、哪件快穿不下，还有每一份&ldquo;第一次穿&rdquo;的成长纪念。
        </p>
      </section>

      {/* 月龄选择器（唯一输入字段） */}
      <section className="card-dream rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink">宝宝现在几个月了？</label>
          <span className="text-xs text-ink-soft">唯一要填的字段 ☝️</span>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            aria-label="减少月龄"
            onClick={() => setMonthAge((m) => Math.max(0, m - 1))}
            className="w-9 h-9 rounded-full bg-macaron-pink-soft text-macaron-pink-deep text-lg font-bold active:scale-95 transition"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="font-display text-4xl text-ink">{monthAge}</span>
            <span className="text-sm text-ink-soft ml-1">个月</span>
          </div>
          <button
            type="button"
            aria-label="增加月龄"
            onClick={() => setMonthAge((m) => Math.min(48, m + 1))}
            className="w-9 h-9 rounded-full bg-macaron-blue-soft text-macaron-blue-deep text-lg font-bold active:scale-95 transition"
          >
            ＋
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={48}
          value={monthAge}
          onChange={(e) => setMonthAge(Number(e.target.value))}
          className="w-full mt-4 accent-[#f08bb0]"
          aria-label="宝宝月龄（0-48 个月）"
        />
        <div className="flex justify-between text-[10px] text-ink-soft/70">
          <span>0 个月</span>
          <span>48 个月</span>
        </div>
      </section>

      {/* 入口 ①：模拟相册授权 */}
      <button
        type="button"
        disabled={reading}
        onClick={() => fileRef.current?.click()}
        className="w-full card-dream rounded-3xl p-5 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-macaron-pink to-macaron-pink-deep flex items-center justify-center text-2xl text-white shadow">
            {reading ? "⏳" : "📷"}
          </div>
          <div className="flex-1">
            <p className="font-medium text-ink">
              {reading ? "正在读取照片…" : "模拟相册授权"}
            </p>
            <p className="text-xs text-ink-soft mt-0.5">
              选择宝宝照片（最多 {MAX_PHOTOS} 张），AI 逐张分解衣物
            </p>
          </div>
          <span className="text-macaron-pink text-xl">›</span>
        </div>
      </button>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 入口 ②：使用演示数据 */}
      <button
        type="button"
        onClick={handleDemo}
        className="w-full card-dream rounded-3xl p-5 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-macaron-blue to-macaron-blue-deep flex items-center justify-center text-2xl text-white shadow">
            ✨
          </div>
          <div className="flex-1">
            <p className="font-medium text-ink">使用演示数据</p>
            <p className="text-xs text-ink-soft mt-0.5">
              一键加载 12 张宝宝照片，从满月穿到 9 个月
            </p>
          </div>
          <span className="text-macaron-blue text-xl">›</span>
        </div>
      </button>

      <p className="text-center text-[11px] text-ink-soft/70 leading-relaxed pt-1">
        Demo 说明：照片仅在本机处理，不会上传真实相册；
        <br />
        零次手动录入，衣橱自己长出来。
      </p>
    </div>
  );
}
