"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore, monthsSince, type ScanResult } from "@/lib/store";
import type { ClothingItem, DecomposeResponse, PhotoItem } from "@/lib/types";

/** 读取文件为 base64，并压到最长边 maxSize 的 JPEG */
async function fileToDataUrl(file: File, maxSize = 900): Promise<string> {
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
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height, 1));
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

const EDIT_SIZES = ["52", "59", "66", "73", "80", "90", "100", "110"];
const EDIT_TYPES = ["连体衣", "哈衣", "包屁衣", "上衣", "裤子", "外套", "连衣裙", "帽子", "袜子", "鞋子", "配饰"];

/**
 * 手动加入衣橱（共享）：选一张穿搭照 → /api/decompose → 简化编辑弹窗 → 保存。
 * 用法：const m = useManualAdd({ onSaved }); 渲染 {m.picker}{m.modal}，按钮 onClick={m.openPicker}。
 * openPicker 必须在用户手势内直接调用（浏览器才允许打开文件选择器）。
 */
export function useManualAdd(options?: {
  onSaved?: (ctx: { item: ClothingItem; photo: PhotoItem }) => void;
}) {
  const { profile, result, setResult } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<PhotoItem | null>(null);
  const [item, setItem] = useState<ClothingItem | null>(null);

  // createPortal 需要挂载后才使用，避免 SSR 时 document 不存在
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const openPicker = () => inputRef.current?.click();

  async function handleFile(list: FileList | null) {
    const f = list?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setLoading(true);
    try {
      const image = await fileToDataUrl(f, 900);
      const takenAt = toYMD(f.lastModified);
      const monthAge = profile ? monthsSince(profile.birthday) : 9;
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: [image], takenAts: [takenAt], monthAge }),
      });
      if (!res.ok) throw new Error("识别失败");
      const data: DecomposeResponse = await res.json();
      if (!data.items.length) {
        alert("没有识别到衣物，请换一张更清晰的穿搭照片");
        return;
      }
      // 取分解出的第一件作为可编辑草稿
      const it = data.items[0];
      setPhoto(data.photos[0]);
      setItem({
        ...it,
        // 允许用户在弹窗里继续修改
        story: it.story || `${profile?.nickname || "宝宝"}的一件${it.color}${it.pattern}${it.type}。`,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "识别失败");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function save() {
    if (!item || !photo) return;
    const itemId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newItem: ClothingItem = { ...item, id: itemId };
    const newPhoto: PhotoItem = { ...photo, item_ids: [itemId] };
    const newResult: ScanResult = result
      ? {
          ...result,
          photos: [...result.photos, newPhoto],
          items: [...result.items, newItem],
        }
      : {
          photos: [newPhoto],
          items: [newItem],
          reminders: [],
          shopping: [],
          milestones: [],
          currentSize: newItem.size_stage,
        };
    setResult(newResult);
    setPhoto(null);
    setItem(null);
    options?.onSaved?.({ item: newItem, photo: newPhoto });
  }

  function cancel() {
    setItem(null);
    setPhoto(null);
  }

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => handleFile(e.target.files)}
    />
  );

  const modal =
    mounted && item && photo
      ? createPortal(
          <div
            className="fixed inset-0 z-50 bg-[#6b5a4e]/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={cancel}
          >
            <div
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image_url}
                  alt="穿搭照"
                  className="w-20 h-20 rounded-2xl object-cover bg-cream-deep shrink-0"
                />
                <div>
                  <h3 className="font-display text-lg text-ink">识别到一件衣物</h3>
                  <p className="text-[11px] text-ink-soft mt-1">
                    AI 已预填信息，请核对并保存
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-ink-soft">尺码</label>
                    <select
                      value={item.size_stage}
                      onChange={(e) => setItem({ ...item, size_stage: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    >
                      {EDIT_SIZES.map((s) => (
                        <option key={s} value={s}>{s} 码</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-soft">分类</label>
                    <select
                      value={item.type}
                      onChange={(e) => setItem({ ...item, type: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    >
                      {EDIT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-ink-soft">颜色</label>
                    <input
                      value={item.color}
                      onChange={(e) => setItem({ ...item, color: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-soft">图案</label>
                    <input
                      value={item.pattern}
                      onChange={(e) => setItem({ ...item, pattern: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-ink-soft">它的故事</label>
                  <textarea
                    value={item.story || ""}
                    onChange={(e) => setItem({ ...item, story: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink resize-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={cancel}
                  className="flex-1 py-3 rounded-full border border-[#f4e7d2] text-ink text-sm"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="flex-1 py-3 rounded-full bg-macaron-pink text-white text-sm font-medium shadow"
                >
                  保存到衣橱
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return { openPicker, picker, modal, loading };
}
