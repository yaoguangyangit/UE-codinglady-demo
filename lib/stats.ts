// 宝宝衣橱 · 顶部总览统计（PRD：一眼看出哪类服饰需要增补或汰换）
import type { ClothingItem, PhotoItem } from "./types";

export interface StatChip {
  label: string;
  count: number;
}

export interface WardrobeStats {
  seasons: StatChip[]; // 春夏秋冬
  sizes: StatChip[]; // 按尺码阶段升序
  types: StatChip[]; // ≤12 月婴儿分类 / >12 月幼儿分类
  retiredCount: number; // 已退役件数（待汰换）
}

const SEASONS = ["春", "夏", "秋", "冬"] as const;

/** 衣物季节归属：出现照片的 season_hint 众数（"春/秋"这类组合拆开计票） */
function seasonOf(item: ClothingItem, photos: PhotoItem[]): string {
  const counter: Record<string, number> = {};
  for (const p of photos) {
    if (!p.item_ids.includes(item.id)) continue;
    for (const s of (p.season_hint || "").split(/[/、,\s]+/).filter(Boolean)) {
      if ((SEASONS as readonly string[]).includes(s)) {
        counter[s] = (counter[s] || 0) + 1;
      }
    }
  }
  let best = "";
  let bestN = 0;
  for (const s of SEASONS) {
    if ((counter[s] || 0) > bestN) {
      best = s;
      bestN = counter[s];
    }
  }
  return best;
}

/** 12 月龄后的幼儿分类体系（type 已归组，直接映射） */
const TODDLER_GROUPS: [string, string[]][] = [
  ["衣服", ["上衣", "连体衣", "哈衣", "包屁衣", "外套"]],
  ["裤子", ["裤子"]],
  ["裙子", ["连衣裙"]],
  ["配饰", ["帽子", "袜子", "鞋子", "配饰"]],
];

export function wardrobeStats(
  items: ClothingItem[],
  photos: PhotoItem[],
  monthAge: number
): WardrobeStats {
  // ① 季节
  const seasonCounter: Record<string, number> = { 春: 0, 夏: 0, 秋: 0, 冬: 0 };
  for (const it of items) {
    const s = seasonOf(it, photos);
    if (s) seasonCounter[s] += 1;
  }

  // ② 尺码
  const sizeCounter = new Map<string, number>();
  for (const it of items) {
    sizeCounter.set(it.size_stage, (sizeCounter.get(it.size_stage) || 0) + 1);
  }
  const sizes = [...sizeCounter.entries()]
    .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
    .map(([size, count]) => ({ label: `${size} 码`, count }));

  // ③ 类型（按宝宝当前月龄切换分类体系）
  let types: StatChip[];
  if (monthAge <= 12) {
    const c = new Map<string, number>();
    for (const it of items) c.set(it.type, (c.get(it.type) || 0) + 1);
    types = [...c.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  } else {
    const c: Record<string, number> = { 衣服: 0, 裤子: 0, 裙子: 0, 配饰: 0 };
    for (const it of items) {
      const g = TODDLER_GROUPS.find(([, members]) => members.includes(it.type));
      c[g ? g[0] : "配饰"] += 1;
    }
    types = TODDLER_GROUPS.map(([label]) => ({ label, count: c[label] }));
  }

  return {
    seasons: SEASONS.map((label) => ({ label, count: seasonCounter[label] })),
    sizes,
    types,
    retiredCount: items.filter((i) => i.status === "retired").length,
  };
}
