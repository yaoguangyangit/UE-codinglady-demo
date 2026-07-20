"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BottomTab, { type TabKey } from "@/components/BottomTab";
import { useStore } from "@/lib/store";
import { wardrobeStats, type StatChip } from "@/lib/stats";
import { svgPhotoPlaceholder, svgProductImage } from "@/lib/product-image";
import type { ClothingItem, ClothingStatus, PhotoItem } from "@/lib/types";

type Tab = "closet" | "timeline" | "reminders";

const STATUS_META: Record<ClothingStatus, { label: string; cls: string }> = {
  active: { label: "在役", cls: "bg-mint-soft text-[#4e9b74]" },
  retiring: { label: "临近退役", cls: "bg-butter-soft text-[#b08a2e]" },
  retired: { label: "已退役", cls: "bg-[#efe9e0] text-ink-soft" },
  idle: { label: "闲置", cls: "bg-macaron-pink-soft text-macaron-pink-deep" },
};

/** 尺码色标：52-66 粉 / 73-90 蓝 */
function sizeBadgeCls(size: string): string {
  const n = parseInt(size, 10);
  return Number.isFinite(n) && n <= 66
    ? "bg-macaron-pink-soft text-macaron-pink-deep"
    : "bg-macaron-blue-soft text-macaron-blue-deep";
}

function shortDate(s: string): string {
  const parts = s.split("-");
  return parts.length === 3 ? `${Number(parts[1])}/${Number(parts[2])}` : s;
}

/** GLM 推演的 current_size 可能是长文，徽章只取尺码数字（优先"码"前的数字） */
function sizeNumber(currentSize: string): string {
  const m = currentSize.match(/(\d{2,3})\s*码/) || currentSize.match(/\d{2,3}/);
  return m ? m[1] : currentSize;
}

/** 详情弹层可编辑字段的候选值 */
const EDIT_SIZES = ["52", "59", "66", "73", "80", "90", "100", "110"];
const EDIT_TYPES = ["连体衣", "哈衣", "包屁衣", "上衣", "裤子", "外套", "连衣裙", "帽子", "袜子", "鞋子", "配饰"];

// ---------- 统计行（季节/尺码/类型；0 件标「可增补」可点击补录） ----------
function StatRow({
  title,
  chips,
  onGapClick,
}: {
  title: string;
  chips: StatChip[];
  onGapClick?: (c: StatChip) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-9 shrink-0 pt-1 text-[10px] text-ink-soft">{title}</span>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) =>
          c.count > 0 ? (
            <span
              key={c.label}
              className="text-[10px] px-2 py-0.5 rounded-full bg-macaron-blue-soft text-macaron-blue-deep"
            >
              {c.label} ×{c.count}
            </span>
          ) : (
            <button
              key={c.label}
              type="button"
              onClick={() => onGapClick?.(c)}
              title="点我补录一件"
              className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-macaron-pink text-macaron-pink-deep bg-macaron-pink-soft/40 active:scale-95 transition"
            >
              {c.label} · 可增补 ＋
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ---------- 补录弹层（「可增补」点击唤起：引导用户主动输入） ----------
function GapUploadModal({
  label,
  onClose,
}: {
  label: string;
  onClose: () => void;
}) {
  const [fileName, setFileName] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[#6b5a4e]/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-5 animate-float-up"
        onClick={(e) => e.stopPropagation()}
      >
        {!fileName ? (
          <>
            <h3 className="font-display text-lg text-ink">给「{label}」添一件 🌱</h3>
            <p className="text-xs text-ink-soft mt-2 leading-relaxed">
              这一类还没有记录。拍一张它现在的样子（或从相册选一张），AI
              会认出它并补进衣橱。
            </p>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="w-full mt-4 py-3.5 rounded-2xl bg-macaron-pink text-white text-sm font-medium shadow active:scale-[0.98] transition"
            >
              📷 选择一张照片
            </button>
            <input
              ref={ref}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFileName(f.name);
              }}
            />
          </>
        ) : (
          <>
            <div className="text-center py-3">
              <div className="text-3xl">✓</div>
              <p className="text-sm text-ink mt-2">已收到「{fileName}」</p>
              <p className="text-[11px] text-ink-soft mt-1 leading-relaxed">
                AI 会在下次扫描时认出它，补进「{label}」这一类
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2 py-3 rounded-2xl bg-card text-ink text-sm border border-[#f4e7d2]"
            >
              完成
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// ---------- 衣物详情弹层 ----------
function ItemModal({
  items,
  photos,
  monthAge,
  viewMode,
  initialItemId,
  entryPhotoId,
  onClose,
  onStory,
}: {
  items: ClothingItem[];
  photos: PhotoItem[];
  monthAge: number;
  viewMode: "model" | "product";
  initialItemId: string;
  entryPhotoId?: string;
  onClose: () => void;
  onStory: (id: string, story: string) => void;
}) {
  const [currentId, setCurrentId] = useState(initialItemId);
  const item = items.find((i) => i.id === currentId) ?? items[0];
  const [story, setStory] = useState(item.story || "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const { setItemDetail } = useStore();
  // 顶部标签编辑态：尺码选择 / 品类·颜色·图案编辑
  const [editingSize, setEditingSize] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState({ type: item.type, color: item.color, pattern: item.pattern });
  // 「今天更好看 / 添加单品」上传模拟
  const [uploadMsg, setUploadMsg] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  // 单品切换时同步故事与编辑草稿
  useEffect(() => {
    setStory(item.story || "");
    setMetaDraft({ type: item.type, color: item.color, pattern: item.pattern });
    setEditing(false);
    setEditingSize(false);
    setEditingMeta(false);
  }, [currentId, item.story, item.type, item.color, item.pattern]);

  // 弹层打开期间锁定背景滚动
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // 模特图模式：入口照片固定为顶部主图（不随单品切换改变）
  const entryPhoto = viewMode === "model" ? photos.find((p) => p.id === entryPhotoId) : undefined;
  const mates = entryPhoto
    ? entryPhoto.item_ids
        .map((id) => items.find((i) => i.id === id))
        .filter((i): i is ClothingItem => Boolean(i))
    : [];
  const topImage = entryPhoto
    ? entryPhoto.image_url
    : viewMode === "product"
      ? item.product_image_url || svgProductImage(item)
      : item.rep_image_url;

  const wornPhotos = photos
    .filter((p) => p.item_ids.includes(item.id))
    .sort((a, b) => a.taken_at.localeCompare(b.taken_at));

  function saveMeta() {
    const t = metaDraft.type.trim() || item.type;
    const c = metaDraft.color.trim() || item.color;
    const p = metaDraft.pattern.trim() || item.pattern;
    setItemDetail(item.id, { type: t, color: c, pattern: p, name: `${c}${p}${t}` });
    setEditingMeta(false);
  }

  // 次要入口：让 AI 换一句（调 /api/bio）
  const regenerate = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, photos, monthAge }),
      });
      const d = await r.json();
      if (d?.story) {
        setStory(d.story);
        onStory(item.id, d.story);
      }
    } catch {
      /* 静默失败，可再点 */
    } finally {
      setLoading(false);
    }
  }, [item, photos, monthAge, onStory]);

  function startEdit() {
    setDraft(story);
    setEditing(true);
  }
  function saveEdit() {
    const text = draft.trim();
    if (text) {
      setStory(text);
      onStory(item.id, text);
    }
    setEditing(false);
  }

  // portal 到 body：脱离任何带 transform 的祖先（否则 fixed 会相对祖先定位，弹层"跑出视口"）
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[#6b5a4e]/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto animate-float-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={topImage}
            alt={item.name}
            className="w-20 h-20 rounded-2xl object-cover border border-[#f4e7d2]"
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.startsWith("data:")) el.src = svgProductImage(item);
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg text-ink">{item.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setEditingSize((v) => !v)}
                title="点击修改尺码"
                className={`text-[10px] px-2 py-0.5 rounded-full ${sizeBadgeCls(item.size_stage)}`}
              >
                {item.size_stage} 码 ✎
              </button>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_META[item.status].cls}`}
              >
                {STATUS_META[item.status].label}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMetaDraft({ type: item.type, color: item.color, pattern: item.pattern });
                  setEditingMeta((v) => !v);
                }}
                title="点击修改品类/颜色/图案"
                className="text-[10px] px-2 py-0.5 rounded-full bg-cream-deep text-ink-soft"
              >
                {item.type} · {item.color} · {item.pattern} ✎
              </button>
            </div>
            {/* 尺码选择 */}
            {editingSize && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {EDIT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setItemDetail(item.id, { size_stage: s });
                      setEditingSize(false);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      s === item.size_stage
                        ? "bg-macaron-blue text-white border-macaron-blue"
                        : "bg-white/70 text-ink-soft border-[#e8d9c3]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {/* 品类/颜色/图案编辑 */}
            {editingMeta && (
              <div className="mt-2 flex items-center gap-1.5">
                <select
                  value={metaDraft.type}
                  onChange={(e) => setMetaDraft((d) => ({ ...d, type: e.target.value }))}
                  className="text-[11px] rounded-lg bg-white/80 border border-[#e8d9c3] px-1.5 py-1 text-ink"
                >
                  {EDIT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={metaDraft.color}
                  onChange={(e) => setMetaDraft((d) => ({ ...d, color: e.target.value }))}
                  placeholder="颜色"
                  className="w-14 text-[11px] rounded-lg bg-white/80 border border-[#e8d9c3] px-1.5 py-1 text-ink"
                />
                <input
                  value={metaDraft.pattern}
                  onChange={(e) => setMetaDraft((d) => ({ ...d, pattern: e.target.value }))}
                  placeholder="图案"
                  className="w-14 text-[11px] rounded-lg bg-white/80 border border-[#e8d9c3] px-1.5 py-1 text-ink"
                />
                <button
                  type="button"
                  onClick={saveMeta}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-macaron-pink text-white"
                >
                  保存
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="text-ink-soft text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        {/* 它的故事（分析阶段自动生成，可编辑） */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-macaron-pink-soft to-butter-soft p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-ink-soft">🌸 它的故事</p>
            {!editing && story && !loading && (
              <button
                type="button"
                onClick={regenerate}
                className="text-[10px] text-ink-soft/80 underline underline-offset-2"
              >
                让 AI 换一句
              </button>
            )}
          </div>
          {loading ? (
            <div className="shimmer h-4 rounded-full w-3/4" />
          ) : editing ? (
            <div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={80}
                autoFocus
                className="w-full text-sm text-ink leading-relaxed bg-white/80 rounded-xl p-2.5 border border-macaron-pink outline-none resize-none"
                placeholder="写下你和它的故事…"
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/70 text-ink-soft border border-[#f4e7d2]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="text-xs px-3 py-1.5 rounded-full bg-macaron-pink text-white"
                >
                  保存
                </button>
              </div>
            </div>
          ) : story ? (
            <p className="text-sm text-ink leading-relaxed">「{story}」</p>
          ) : (
            <button
              type="button"
              onClick={regenerate}
              className="text-xs px-3 py-1.5 rounded-full bg-white/80 text-macaron-pink-deep border border-macaron-pink"
            >
              让 AI 写一句它的故事 ✍️
            </button>
          )}
          {!editing && story && !loading && (
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={startEdit}
                className="text-[11px] px-3 py-1.5 rounded-full bg-white/80 text-macaron-pink-deep border border-macaron-pink"
              >
                编辑它的故事
              </button>
            </div>
          )}
        </div>

        {/* 底部：模特图模式=我的单品 / 服饰图模式=穿着记录 */}
        {entryPhoto ? (
          <div className="mt-4">
            <p className="text-[11px] text-ink-soft mb-2">
              👕 我的单品 · 这张照片里的 {mates.length} 件
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mates.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setCurrentId(it.id)}
                  className={`shrink-0 text-center rounded-xl p-1 transition ${
                    it.id === currentId ? "bg-macaron-pink-soft ring-1 ring-macaron-pink" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.product_image_url || svgProductImage(it)}
                    alt={it.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#f4e7d2]"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.src.startsWith("data:")) el.src = svgProductImage(it);
                    }}
                  />
                  <p className="text-[9px] text-ink-soft mt-0.5 w-16 truncate">{it.name}</p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="shrink-0 w-16 h-16 self-center rounded-xl border border-dashed border-macaron-pink text-macaron-pink-deep text-[10px] leading-tight active:scale-95 transition"
              >
                ＋<br />添加单品
              </button>
            </div>
            <p className="text-[9px] text-ink-soft/70 mt-1">
              点单品切换详情 · 添加单品：补充 AI 没识别出来的
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-[11px] text-ink-soft mb-2">
              📅 穿着记录 · 共 {item.wear_count} 次（{shortDate(item.first_worn_at)} →{" "}
              {shortDate(item.last_worn_at)}）
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {wornPhotos.map((p) => (
                <div key={p.id} className="shrink-0 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt={p.taken_at}
                    title="点击设为封面图"
                    onClick={() => setItemDetail(item.id, { rep_image_url: p.image_url })}
                    className={`w-16 h-16 rounded-xl object-cover border cursor-pointer active:scale-95 transition ${
                      p.image_url === item.rep_image_url
                        ? "border-macaron-pink ring-2 ring-macaron-pink"
                        : "border-[#f4e7d2]"
                    }`}
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.src.startsWith("data:")) el.src = svgPhotoPlaceholder(p.taken_at);
                    }}
                  />
                  <p className="text-[9px] text-ink-soft mt-0.5 w-16 truncate">
                    {p.caption || shortDate(p.taken_at)}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="shrink-0 w-16 h-16 self-center rounded-xl border border-dashed border-macaron-blue text-macaron-blue-deep text-[10px] leading-tight active:scale-95 transition"
              >
                📷
                <br />
                今天更好看
              </button>
            </div>
            <p className="text-[9px] text-ink-soft/70 mt-1">
              点照片可设为封面 · 今天更好看：给它补一张新照片
            </p>
          </div>
        )}
        {uploadMsg && (
          <p className="text-[10px] text-[#4e9b74] mt-2">✓ {uploadMsg}</p>
        )}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setUploadMsg(`已收到「${f.name}」，AI 会把它补进衣橱（演示）`);
            e.target.value = "";
          }}
        />
      </div>
    </div>,
    document.body
  );
}

// ---------- 结果页 ----------
function WardrobeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, result, monthAge, profile, setItemStory, reset } = useStore();
  const initialTab = (searchParams.get("tab") as Tab) || "closet";
  const [tab, setTab] = useState<Tab>(
    ["closet", "timeline", "reminders"].includes(initialTab) ? initialTab : "closet"
  );
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [showAllIdle, setShowAllIdle] = useState(false);
  const [gapLabel, setGapLabel] = useState<string | null>(null); // 「可增补」补录弹层
  // 衣橱图片模式：默认服饰图（商品图每件唯一，避免同一张生活照在多件卡片重复）；
  // model=宝宝穿着原图（模特图）/ product=商品图
  const [viewMode, setViewMode] = useState<"model" | "product">("product");

  if (!ready) {
    return <div className="py-20 text-center text-ink-soft">加载中…</div>;
  }
  if (!result) {
    return (
      <div className="py-16 text-center space-y-4 animate-float-up">
        <div className="text-4xl">🧺</div>
        <p className="text-ink font-medium">衣橱还是空的</p>
        <p className="text-xs text-ink-soft">先回去授权一次相册吧</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-full bg-macaron-pink text-white text-sm font-medium shadow"
        >
          去建衣橱
        </button>
      </div>
    );
  }

  const { items, photos, reminders, shopping, milestones, currentSize } = result;
  const sizeAlerts = reminders.filter((r) => r.kind === "size_alert");
  const idleList = reminders.filter((r) => r.kind === "idle");
  const itemOf = (id: string | null) => items.find((it) => it.id === id);
  const milestoneOn = (date: string) => milestones.filter((m) => m.date === date);
  const timelinePhotos = [...photos].sort((a, b) => b.taken_at.localeCompare(a.taken_at));
  const stats = wardrobeStats(items, photos, monthAge);
  const aiSizeNote = currentSize.length > 4 ? currentSize : ""; // GLM 长文尺码解读，挪到提醒 Tab
  // 当前模式下的卡片图：商品图缺失时回落 SVG 简笔画（兜底不破）
  const imageOf = (it: ClothingItem) =>
    viewMode === "product" ? it.product_image_url || svgProductImage(it) : it.rep_image_url;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "closet", label: "衣橱", icon: "🧺" },
    { key: "timeline", label: "时间线", icon: "🌱" },
    { key: "reminders", label: "提醒", icon: "🔔" },
  ];

  return (
    <div className="space-y-4 animate-float-up pb-20">
      {/* 概要头：宝宝 + 月龄尺码 + 收录统计 */}
      <section className="card-dream rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-macaron-pink to-macaron-blue flex items-center justify-center text-xl text-white shrink-0">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              "👶"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">
              <span className="font-display">{profile?.nickname || "宝宝"}</span>{" "}
              <span className="font-display">{monthAge}</span> 个月 · 当前尺码{" "}
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${sizeBadgeCls(sizeNumber(currentSize))}`}
              >
                {sizeNumber(currentSize)} 码
              </span>
            </p>
            <p className="text-[11px] text-ink-soft mt-0.5">
              从 {photos.length} 张照片里长出 {items.length} 件衣物 · 零次手动录入
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="text-[10px] text-ink-soft underline underline-offset-2 shrink-0"
          >
            重扫
          </button>
        </div>
        {/* 收录统计：一眼看出哪类需要增补或汰换（可增补可点击补录） */}
        <div className="mt-3 pt-3 border-t border-[#f7ecd9] space-y-1.5">
          <StatRow title="季节" chips={stats.seasons} onGapClick={(c) => setGapLabel(c.label)} />
          <StatRow title="尺码" chips={stats.sizes} onGapClick={(c) => setGapLabel(c.label)} />
          <StatRow
            title={monthAge <= 12 ? "分类" : "类型"}
            chips={stats.types}
            onGapClick={(c) => setGapLabel(c.label)}
          />
          {stats.retiredCount > 0 && (
            <p className="text-[10px] text-ink-soft/80 pt-1">
              🧺 {stats.retiredCount} 件已退役的衣物，可以洗净收进纪念箱啦
            </p>
          )}
        </div>
      </section>

      {/* Tab 切换（底部固定 tab bar，小程序式） */}

      {/* ① 衣橱总览 */}
      {tab === "closet" && (
        <section className="space-y-3">
          {/* 服饰图 ⇄ 模特图：并列分段控件，当前高亮、未选置灰（默认服饰图） */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-cream-deep p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("product")}
                className={`text-xs px-4 py-1.5 rounded-full transition ${
                  viewMode === "product"
                    ? "bg-card text-ink font-medium shadow border border-[#f4e7d2]"
                    : "text-ink-soft/60"
                }`}
              >
                👕 服饰图
              </button>
              <button
                type="button"
                onClick={() => setViewMode("model")}
                className={`text-xs px-4 py-1.5 rounded-full transition ${
                  viewMode === "model"
                    ? "bg-card text-ink font-medium shadow border border-[#f4e7d2]"
                    : "text-ink-soft/60"
                }`}
              >
                👶 模特图
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {items.map((it, idx) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelected(it)}
                className="card-dream rounded-3xl overflow-hidden text-left animate-pop-in hover:scale-[1.02] transition-transform"
                style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageOf(it)}
                    alt={it.name}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.src.startsWith("data:")) el.src = svgProductImage(it);
                    }}
                  />
                  <span
                    className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full ${sizeBadgeCls(it.size_stage)} bg-opacity-95`}
                  >
                    {it.size_stage} 码
                  </span>
                  <span
                    className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full ${STATUS_META[it.status].cls} bg-opacity-95`}
                  >
                    {STATUS_META[it.status].label}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-ink truncate">{it.name}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">
                    穿过 {it.wear_count} 次 · {shortDate(it.first_worn_at)} →{" "}
                    {shortDate(it.last_worn_at)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ② 成长时间线 */}
      {tab === "timeline" && (
        <section className="relative pl-5">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-macaron-pink via-butter to-macaron-blue rounded-full" />
          <div className="space-y-4">
            {timelinePhotos.map((p) => {
              const worn = p.item_ids
                .map((id) => itemOf(id))
                .filter((it): it is ClothingItem => Boolean(it));
              const mss = milestoneOn(p.taken_at);
              return (
                <div key={p.id} className="relative">
                  <div className="absolute -left-5 top-3 w-3.5 h-3.5 rounded-full bg-card border-2 border-macaron-pink" />
                  {mss.map((m) => (
                    <div
                      key={m.label}
                      className="mb-2 rounded-2xl bg-gradient-to-r from-butter-soft to-macaron-pink-soft border border-butter px-3 py-2 text-xs text-ink animate-pop-in"
                    >
                      🎖 {m.label}
                    </div>
                  ))}
                  <div className="card-dream rounded-2xl p-3 flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_url}
                      alt={p.taken_at}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                      onError={(e) => {
                        const el = e.currentTarget;
                        if (!el.src.startsWith("data:"))
                          el.src = svgPhotoPlaceholder(p.taken_at);
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-ink-soft">
                        {p.taken_at}
                        {p.season_hint ? ` · ${p.season_hint}` : ""}
                        {p.place ? ` · 📍${p.place}` : ""}
                        {p.people ? ` · 👨‍👩‍👦${p.people}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {worn.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => setSelected(it)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-macaron-blue-soft text-macaron-blue-deep"
                          >
                            {it.name} · {it.size_stage}码
                          </button>
                        ))}
                        {!worn.length && (
                          <span className="text-[10px] text-ink-soft/70">
                            这张没看清，可手动补充
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ③ 提醒 */}
      {tab === "reminders" && (
        <section className="space-y-4">
          {aiSizeNote && (
            <div className="card-dream rounded-3xl p-4">
              <p className="text-sm font-medium text-ink mb-1.5">🤖 AI 尺码解读</p>
              <p className="text-xs text-ink leading-relaxed">{aiSizeNote}</p>
            </div>
          )}
          <div className="card-dream rounded-3xl p-4">
            <p className="text-sm font-medium text-ink mb-2">🌱 尺码预警</p>
            {sizeAlerts.length ? (
              <ul className="space-y-2">
                {sizeAlerts.map((r) => (
                  <li key={r.id} className="text-xs text-ink leading-relaxed">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => {
                        const it = itemOf(r.item_id);
                        if (it) setSelected(it);
                      }}
                    >
                      {r.message}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ink-soft">所有衣物尺码都还很合身，放心穿～</p>
            )}
          </div>

          <div className="card-dream rounded-3xl p-4">
            <p className="text-sm font-medium text-ink mb-2">🏷 闲置清单</p>
            {idleList.length ? (
              <>
                <ul className="space-y-2">
                  {(showAllIdle ? idleList : idleList.slice(0, 3)).map((r) => (
                    <li key={r.id} className="text-xs text-ink leading-relaxed">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => {
                          const it = itemOf(r.item_id);
                          if (it) setSelected(it);
                        }}
                      >
                        {r.message}
                      </button>
                    </li>
                  ))}
                </ul>
                {idleList.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllIdle((v) => !v)}
                    className="mt-2 text-[11px] text-macaron-blue-deep underline underline-offset-2"
                  >
                    {showAllIdle ? "收起 ↑" : `更多（还有 ${idleList.length - 3} 条）↓`}
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs text-ink-soft">没有闲置，件件都上场，厉害的妈妈！</p>
            )}
          </div>

          <div className="card-dream rounded-3xl p-4">
            <p className="text-sm font-medium text-ink mb-2">🛒 换季采购建议</p>
            <ul className="space-y-2">
              {shopping.map((s, i) => (
                <li key={i} className="text-xs text-ink leading-relaxed flex gap-2">
                  <span className="text-macaron-pink-deep">✿</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-ink-soft/70 mt-3">
              尺码由月龄 × 穿着时间线 × 标准尺码月龄表推演，不靠照片猜。
            </p>
          </div>
        </section>
      )}

      {/* 衣物详情弹层（双模式：服饰图进详情 / 模特图进详情） */}
      {selected && (
        <ItemModal
          items={items}
          photos={photos}
          monthAge={monthAge}
          viewMode={viewMode}
          initialItemId={selected.id}
          entryPhotoId={
            photos.find(
              (p) =>
                p.image_url ===
                (items.find((it) => it.id === selected.id) || selected).rep_image_url
            )?.id
          }
          onClose={() => setSelected(null)}
          onStory={setItemStory}
        />
      )}

      {/* 补录弹层（可增补 chip 点击唤起） */}
      {gapLabel && <GapUploadModal label={gapLabel} onClose={() => setGapLabel(null)} />}

      {/* 底部固定 tab bar（公共组件，portal 悬浮） */}
      <BottomTab
        active={tab}
        onSelect={(k: TabKey) => {
          if (k !== "me") setTab(k);
        }}
      />
    </div>
  );
}

export default function WardrobePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-soft">加载中…</div>}>
      <WardrobeInner />
    </Suspense>
  );
}
