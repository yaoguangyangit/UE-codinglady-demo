// 宝宝衣橱 · 单品归并逻辑（PRD 5.2 ②：代码逻辑，非 LLM）
// 硬匹配：type 相同 且 color 相同 且 pattern 相同 → 判为同一件；否则视为新单品。
// 尺码不靠照片猜：由宝宝月龄 × 穿着时间线 × 标准尺码月龄表推演（PRD 4.4 诚实原则）。
import type {
  ClothingItem,
  ClothingStatus,
  Milestone,
  PhotoItem,
  ScannedPhoto,
} from "./types";
import { SIZE_ORDER, SIZE_TABLE } from "./types";

const DAY_MS = 86400000;
const DAYS_PER_MONTH = 30.44;

function norm(s: string): string {
  return (s || "").trim().replace(/\s+/g, "");
}

/**
 * GLM 自由输出的同义词归组——只用于归并指纹，展示字段保留原值。
 * 原则"宁可分裂、不可误并"：颜色不做深浅合并，只做同义词对齐。
 * 对规范词表（连体衣/条纹/蓝白等 mock 输出）恒等，不影响 mock 兜底链路。
 */
const TYPE_SYNONYMS: [RegExp, string][] = [
  [/连衣裙|裙子|纱裙|公主裙|礼服裙|背带裙|芭蕾/, "连衣裙"],
  [/连体衣|连身衣|爬服/, "连体衣"],
  [/包屁衣|三角哈衣/, "包屁衣"],
  [/哈衣/, "哈衣"],
  [/T恤|短袖|长袖|衬衫|衬衣|卫衣|背心|吊带|上衣|polo/i, "上衣"],
  [/长裤|短裤|打底裤|牛仔裤|运动裤|阔腿裤|裤/, "裤子"],
  [/外套|开衫|夹克|风衣|羽绒服|马甲|大衣/, "外套"],
  [/帽/, "帽子"],
  [/袜/, "袜子"],
  [/鞋/, "鞋子"],
  [/背包|书包|发饰|围巾|手套|配饰/, "配饰"],
];

const PATTERN_SYNONYMS: [RegExp, string][] = [
  [/卡通|动画|动漫/, "卡通"],
  [/条纹|横纹|竖纹/, "条纹"],
  [/波点|圆点|点点/, "波点"],
  [/格纹|格子|棋盘/, "格纹"],
  [/刺绣|绣花/, "刺绣"],
  [/花卉|花朵|碎花|印花|图案|涂鸦|字母|数字|植物|水果/i, "印花"],
  [/纯色|净色|素色|无图案|单色|简约/, "纯色"],
];

function normGroup(s: string, table: [RegExp, string][]): string {
  const v = norm(s);
  for (const [re, target] of table) if (re.test(v)) return target;
  return v;
}

function normType(s: string): string {
  return normGroup(s, TYPE_SYNONYMS);
}

function normPattern(s: string): string {
  return normGroup(s, PATTERN_SYNONYMS);
}

/** 颜色归一：去"色"后缀，复合色取第一主色（"粉色和白色"→"粉"） */
function normColor(s: string): string {
  const v = norm(s).replace(/色$/, "");
  return v.split(/[和与、/·+\s]/)[0] || v;
}

/** 归并指纹 */
export function fingerprint(type: string, color: string, pattern: string): string {
  return `${normType(type)}|${normColor(color)}|${normPattern(pattern)}`;
}

/** 月龄（月）→ 标准尺码阶段（就近取档） */
export function sizeForMonths(months: number): string {
  const m = Math.round(months);
  if (m <= 0) return "52";
  if (m <= 2) return "59";
  if (m <= 5) return "66";
  if (m <= 8) return "73";
  if (m <= 11) return "80";
  return "90";
}

function sizeBucket(size: string): number {
  const i = SIZE_ORDER.indexOf(size);
  if (i !== -1) return i + 1; // 52→1 … 90→6
  const n = parseInt(size, 10);
  if (Number.isFinite(n) && n >= 100) return SIZE_ORDER.length + 1; // 100+ 码：当前及未来档
  return 3;
}

function statusOf(bucket: number, currentBucket: number, wearCount: number): ClothingStatus {
  if (bucket <= currentBucket - 2) return "retired"; // 尺码已过
  if (wearCount <= 1) return "idle"; // 只见过一次——吊牌可能还没拆
  if (bucket === currentBucket - 1) return "retiring"; // 临近退役
  return "active";
}

function toDate(s: string): Date {
  const d = new Date(`${s}T12:00:00`);
  return isNaN(d.getTime()) ? new Date() : d;
}

function fmt(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * 逐照片归并分解结果，生成衣橱档案。
 * 纯函数：同构输入（mock 或真实 GLM）产出同构衣橱。
 */
export function mergeWardrobe(
  scanned: ScannedPhoto[],
  monthAge: number
): { photos: PhotoItem[]; items: ClothingItem[] } {
  const sorted = [...scanned].sort((a, b) => a.taken_at.localeCompare(b.taken_at));
  const refDate = sorted.length ? toDate(sorted[sorted.length - 1].taken_at) : new Date();
  const birth = new Date(refDate.getTime() - monthAge * DAYS_PER_MONTH * DAY_MS);
  const currentBucket = sizeBucket(sizeForMonths(monthAge));

  const items: ClothingItem[] = [];
  const byFp = new Map<string, ClothingItem>();
  const photos: PhotoItem[] = [];

  for (const ph of sorted) {
    const ids: string[] = [];
    for (const d of ph.decomposed.items) {
      if (!d || !d.type) continue;
      const fp = fingerprint(d.type, d.color, d.pattern);
      let it = byFp.get(fp);
      if (!it) {
        // 尺码推演：出生日期 = 最近照片日期 - 当前月龄；尺码取首次穿着时的月龄档
        const ageMonths =
          (toDate(ph.taken_at).getTime() - birth.getTime()) / (DAY_MS * DAYS_PER_MONTH);
        const size = sizeForMonths(Math.max(0, ageMonths));
        it = {
          id: `item-${items.length + 1}`,
          name: `${norm(d.color)}${norm(d.pattern)}${normType(d.type)}`,
          type: normType(d.type), // 展示也用归组值，避免"连体衣/哈衣/上衣"这类原样照抄
          color: norm(d.color),
          pattern: norm(d.pattern),
          size_stage: size,
          wear_count: 0,
          first_worn_at: ph.taken_at,
          last_worn_at: ph.taken_at,
          rep_image_url: ph.image_url,
          status: "active",
        };
        byFp.set(fp, it);
        items.push(it);
      }
      it.wear_count += 1;
      if (ph.taken_at < it.first_worn_at) it.first_worn_at = ph.taken_at;
      if (ph.taken_at >= it.last_worn_at) {
        it.last_worn_at = ph.taken_at;
        it.rep_image_url = ph.image_url; // 代表照片取最近一次穿着
      }
      if (!ids.includes(it.id)) ids.push(it.id);
    }
    photos.push({
      id: ph.id,
      image_url: ph.image_url,
      taken_at: ph.taken_at,
      item_ids: ids,
      season_hint: ph.decomposed.season_hint || "",
      ...(ph.place ? { place: ph.place } : {}),
      ...(ph.people ? { people: ph.people } : {}),
    });
  }

  for (const it of items) {
    it.status = statusOf(sizeBucket(it.size_stage), currentBucket, it.wear_count);
  }
  // 衣橱总览按出现频次降序
  items.sort(
    (a, b) => b.wear_count - a.wear_count || a.first_worn_at.localeCompare(b.first_worn_at)
  );
  return { photos, items };
}

/** 尺码里程碑：每个尺码阶段最早一次穿着（如"第一次穿 66 码"） */
export function buildMilestones(items: ClothingItem[]): Milestone[] {
  const earliest = new Map<string, ClothingItem>();
  for (const it of items) {
    const cur = earliest.get(it.size_stage);
    if (!cur || it.first_worn_at < cur.first_worn_at) earliest.set(it.size_stage, it);
  }
  return [...earliest.entries()]
    .sort((a, b) => (parseInt(a[0], 10) || 0) - (parseInt(b[0], 10) || 0)) // 数字升序，兼容 100+ 码
    .map(([size, it]) => ({
      date: it.first_worn_at,
      label:
        size === "52" || size === "59"
          ? `满月纪念 · 第一次穿 ${size} 码`
          : `第一次穿 ${size} 码`,
      size_stage: size,
    }));
}

/** 下一个尺码阶段（采购建议用） */
export function nextSize(size: string): string {
  const i = SIZE_TABLE.findIndex((s) => s.size === size);
  return i === -1 || i === SIZE_TABLE.length - 1 ? size : SIZE_TABLE[i + 1].size;
}

export { fmt as formatDate };
