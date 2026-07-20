"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, monthsSince, type BabyProfile } from "@/lib/store";
import { PRESET_RESULT } from "@/lib/preset";
import BottomTab from "@/components/BottomTab";
import { useManualAdd } from "@/components/ManualAdd";

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
function SetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ?new=1：添加衣柜——无论是否已有宝宝，都重新进入信息录入
  const forceNew = searchParams.get("new") === "1";
  const { ready, profile, setProfile, reset, setResult } = useStore();
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 手动加入衣橱（共享 hook：选照片 → AI 识别 → 编辑弹窗 → 保存后跳模特图 tab）
  const manual = useManualAdd({
    onSaved: () => router.push("/wardrobe?view=model"),
  });

  if (!ready) {
    return <div className="py-20 text-center text-ink-soft">加载中…</div>;
  }
  if (!profile || forceNew) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-sm text-ink-soft">
          ‹ 首页
        </Link>
        <ProfileForm
          onDone={(p) => {
            setProfile(p);
            // 录入完新宝宝信息后，去掉 ?new=1，进入相册授权屏
            if (forceNew) router.replace("/setup");
          }}
        />
      </div>
    );
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

  return (
    <div className="space-y-6 animate-float-up pb-20">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-ink-soft">
          ‹ 首页
        </Link>
      </div>

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
          disabled={manual.loading}
          onClick={manual.openPicker}
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

      <p className="text-center text-[11px] text-ink-soft/70 leading-relaxed pt-2">
        照片仅在本机处理，不会上传真实相册；
        <br />
        零次手动录入，衣橱自己长出来。
      </p>

      {/* 底部 tab bar（与衣橱页一致；微信登录在「我的」里） */}
      <BottomTab active={null} />

      {/* 手动加入衣橱：共享 hook 的文件输入 + 识别编辑弹层 */}
      {manual.picker}
      {manual.modal}
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-soft">加载中…</div>}>
      <SetupInner />
    </Suspense>
  );
}
