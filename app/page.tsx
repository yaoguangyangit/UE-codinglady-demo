"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, monthsSince, type BabyProfile, type ScanResult } from "@/lib/store";
import { PRESET_RESULT } from "@/lib/preset";
import BottomTab from "@/components/BottomTab";
import type { ClothingItem, DecomposeResponse, PhotoItem } from "@/lib/types";

const MAX_PHOTOS = 20;

/** 读取文件为 base64，并压到最长边 maxSize 的 JPEG（省存储、省上传） */
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

// ---------- 第一屏：宝宝档案（头像 / 昵称 / 生日） ----------
function ProfileForm({ onDone }: { onDone: (p: BabyProfile) => void }) {
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const valid = nickname.trim().length > 0 && birthday.length > 0 && avatar.length > 0;

  async function handleAvatar(list: FileList | null) {
    const f = list?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setAvatar(await fileToDataUrl(f, 300));
  }

  return (
    <div className="space-y-6 animate-float-up">
      <section className="pt-6 text-center">
        <h1 className="font-display text-2xl text-ink">先认识一下宝宝 👋</h1>
        <p className="text-sm text-ink-soft mt-2">一次设置，之后打开就是 TA 的衣橱</p>
      </section>

      {/* 头像：用于在多孩照片中认出宝宝 */}
      <section className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => avatarRef.current?.click()}
          className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-macaron-pink-soft to-macaron-blue-soft border-2 border-white shadow flex items-center justify-center text-5xl active:scale-95 transition"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="宝宝头像" className="w-full h-full object-cover" />
          ) : (
            "👶"
          )}
        </button>
        <p className="text-xs text-ink-soft">
          {avatar ? "点击更换" : "上传宝宝正脸照"}
        </p>
        <p className="text-[10px] text-ink-soft/70">用于在多孩照片中认出 TA</p>
        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatar(e.target.files)}
        />
      </section>

      <section className="card-dream rounded-3xl p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="nickname">
            宝宝的小名
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="比如：小笼包"
            className="mt-2 w-full rounded-2xl bg-white/80 border border-[#f4e7d2] px-4 py-3 text-sm text-ink outline-none focus:border-macaron-pink"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="birthday">
            宝宝生日
          </label>
          <input
            id="birthday"
            type="date"
            value={birthday}
            max={today}
            onChange={(e) => setBirthday(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-white/80 border border-[#f4e7d2] px-4 py-3 text-sm text-ink outline-none focus:border-macaron-pink"
          />
          <p className="text-[10px] text-ink-soft/70 mt-1.5">
            月龄、尺码、成长节点都由生日自动推算，不用手填
          </p>
        </div>
      </section>

      <button
        type="button"
        disabled={!valid}
        onClick={() => onDone({ nickname: nickname.trim(), birthday, avatar })}
        className="w-full py-4 rounded-full bg-macaron-pink text-white font-medium shadow-lg disabled:opacity-40 active:scale-[0.98] transition"
      >
        开始建衣橱 →
      </button>
    </div>
  );
}

// ---------- 第二屏：相册授权（核心入口） ----------
export default function Home() {
  const router = useRouter();
  const { ready, profile, setProfile, reset, setResult, result } = useStore();
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 手动加入衣橱
  const manualRef = useRef<HTMLInputElement>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualPhoto, setManualPhoto] = useState<PhotoItem | null>(null);
  const [manualItem, setManualItem] = useState<ClothingItem | null>(null);

  // createPortal 需要挂载后才使用，避免 SSR 时 document 不存在
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!ready) {
    return <div className="py-20 text-center text-ink-soft">加载中…</div>;
  }
  if (!profile) {
    return <ProfileForm onDone={setProfile} />;
  }

  const monthAge = monthsSince(profile.birthday);

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setReading(true);
    try {
      // Demo 稳定性：真实相册授权也走提前跑好的预制结果
      setResult(PRESET_RESULT);
      router.push("/wardrobe");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleDemo() {
    // 演示数据：直达预制结果页（不经过扫描动画）
    setResult(PRESET_RESULT);
    router.push("/wardrobe");
  }

  async function handleManualFile(list: FileList | null) {
    const f = list?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setManualLoading(true);
    try {
      const image = await fileToDataUrl(f, 900);
      const takenAt = toYMD(f.lastModified);
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
      const ph = data.photos[0];
      setManualPhoto(ph);
      setManualItem({
        ...it,
        // 允许用户在弹窗里继续修改
        story: it.story || `${profile?.nickname || "宝宝"}的一件${it.color}${it.pattern}${it.type}。`,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "识别失败");
    } finally {
      setManualLoading(false);
      if (manualRef.current) manualRef.current.value = "";
    }
  }

  function saveManualItem() {
    if (!manualItem || !manualPhoto) return;
    const itemId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: ClothingItem = { ...manualItem, id: itemId };
    const photo: PhotoItem = { ...manualPhoto, item_ids: [itemId] };
    const newResult: ScanResult = result
      ? {
          ...result,
          photos: [...result.photos, photo],
          items: [...result.items, item],
        }
      : {
          photos: [photo],
          items: [item],
          reminders: [],
          shopping: [],
          milestones: [],
          currentSize: item.size_stage,
        };
    setResult(newResult);
    setManualPhoto(null);
    setManualItem(null);
    router.push("/wardrobe?view=model");
  }

  return (
    <div className="space-y-6 animate-float-up pb-20">
      {/* 宝宝信息条 */}
      <section className="card-dream rounded-3xl p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-macaron-pink-soft to-macaron-blue-soft border border-white shadow-inner shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt="宝宝头像" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg text-ink truncate">{profile.nickname}</p>
          <p className="text-xs text-ink-soft mt-0.5">
            {monthAge} 个月 · 生日 {profile.birthday}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-[10px] text-ink-soft underline underline-offset-2 shrink-0"
        >
          重新设置
        </button>
      </section>

      {/* 核心入口：相册授权 */}
      <section className="pt-2 text-center">
        <p className="text-sm text-ink-soft leading-relaxed px-2">
          {profile.nickname}的每一件衣服，都早已在你的相册里。
        </p>
      </section>
      <button
        type="button"
        disabled={reading}
        onClick={() => fileRef.current?.click()}
        className="relative w-full rounded-3xl p-6 text-left bg-gradient-to-br from-macaron-pink to-macaron-pink-deep text-white shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            {reading ? "⏳" : "📷"}
          </div>
          <div className="flex-1">
            <p className="font-display text-xl">
              {reading ? "正在读取照片…" : "相册授权"}
            </p>
            <p className="text-xs text-white/85 mt-1 leading-relaxed">
              选择宝宝照片（每次最多 {MAX_PHOTOS} 张），AI 会分析后生成衣物卡片
            </p>
          </div>
          <span className="text-2xl text-white/90">›</span>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleDemo();
          }}
          className="absolute right-5 bottom-3 text-[10px] text-white/80 underline underline-offset-2 cursor-pointer hover:text-white"
        >
          演示数据
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 次要入口：手动加入衣橱 / 导入电商平台订单 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={manualLoading}
          onClick={() => manualRef.current?.click()}
          className="card-dream rounded-3xl p-4 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-macaron-blue to-macaron-blue-soft flex items-center justify-center text-xl text-white shadow">
            ➕
          </div>
          <p className="text-sm font-medium text-ink mt-2">手动加入衣橱</p>
          <p className="text-[11px] text-ink-soft mt-0.5">
            拍一张穿搭照，AI 识别后补进衣橱
          </p>
        </button>
        <Link
          href="/orders"
          className="card-dream rounded-3xl p-4 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform block"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-butter to-macaron-pink flex items-center justify-center text-xl text-white shadow">
            🛒
          </div>
          <p className="text-sm font-medium text-ink mt-2">导入电商平台订单</p>
          <p className="text-[11px] text-ink-soft mt-0.5">
            阿里系订单主图一键入库
          </p>
        </Link>
      </div>
      <input
        ref={manualRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleManualFile(e.target.files)}
      />

      <p className="text-center text-[11px] text-ink-soft/70 leading-relaxed pt-2">
        照片仅在本机处理，不会上传真实相册；
        <br />
        零次手动录入，衣橱自己长出来。
      </p>

      {/* 底部 tab bar（与衣橱页一致；微信登录在「我的」里） */}
      <BottomTab active={null} />

      {/* 手动加入衣橱：识别后弹出的简化编辑层 */}
      {mounted && manualItem && manualPhoto &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-[#6b5a4e]/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => {
              setManualItem(null);
              setManualPhoto(null);
            }}
          >
            <div
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <img
                  src={manualPhoto.image_url}
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
                      value={manualItem.size_stage}
                      onChange={(e) => setManualItem({ ...manualItem, size_stage: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    >
                      {["52", "59", "66", "73", "80", "90", "100", "110"].map((s) => (
                        <option key={s} value={s}>{s} 码</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-soft">分类</label>
                    <select
                      value={manualItem.type}
                      onChange={(e) => setManualItem({ ...manualItem, type: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    >
                      {["连体衣", "哈衣", "包屁衣", "上衣", "裤子", "外套", "连衣裙", "帽子", "袜子", "鞋子", "配饰"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-ink-soft">颜色</label>
                    <input
                      value={manualItem.color}
                      onChange={(e) => setManualItem({ ...manualItem, color: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-soft">图案</label>
                    <input
                      value={manualItem.pattern}
                      onChange={(e) => setManualItem({ ...manualItem, pattern: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-ink-soft">它的故事</label>
                  <textarea
                    value={manualItem.story || ""}
                    onChange={(e) => setManualItem({ ...manualItem, story: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-xl bg-white/80 border border-[#f4e7d2] px-3 py-2 text-sm text-ink outline-none focus:border-macaron-pink resize-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setManualItem(null);
                    setManualPhoto(null);
                  }}
                  className="flex-1 py-3 rounded-full border border-[#f4e7d2] text-ink text-sm"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveManualItem}
                  className="flex-1 py-3 rounded-full bg-macaron-pink text-white text-sm font-medium shadow"
                >
                  保存到衣橱
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
