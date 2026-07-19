// 宝宝衣橱 · "它的故事"事实提取（纯函数，客户端/服务端共用）
// 故事生成依据：照片日期 → 季节/节气/节日；月龄+日期 → 成长节点；
// 照片地点/人物元数据（有就用，没有就不提，严禁编造）。
import type { ClothingItem, PhotoItem } from "./types";

const DAY_MS = 86400000;
const DAYS_PER_MONTH = 30.44;

/** 2025–2026 演示时间线覆盖的节日/节气（±1 天容差） */
const SPECIAL_DAYS: { date: string; name: string }[] = [
  { date: "2025-12-21", name: "冬至" },
  { date: "2025-12-25", name: "圣诞节" },
  { date: "2026-01-01", name: "元旦" },
  { date: "2026-02-17", name: "春节" },
  { date: "2026-03-20", name: "春分" },
  { date: "2026-04-04", name: "清明" },
  { date: "2026-06-01", name: "六一儿童节" },
  { date: "2026-06-21", name: "夏至" },
];

function toDate(s: string): Date {
  const d = new Date(`${s}T12:00:00`);
  return isNaN(d.getTime()) ? new Date() : d;
}

function diffDays(a: string, b: string): number {
  return Math.abs(toDate(a).getTime() - toDate(b).getTime()) / DAY_MS;
}

/** 忽略年份的"月-日"环形差（天，±7 天容差内判定临近生日） */
function mdDiffDays(a: string, bMD: string): number {
  const [am, ad] = a.slice(5).split("-").map(Number);
  const [bm, bd] = bMD.split("-").map(Number);
  const da = (am - 1) * 31 + ad;
  const db = (bm - 1) * 31 + bd;
  const diff = Math.abs(da - db);
  return Math.min(diff, 372 - diff);
}

/** 日期 → 节日/节气（±1 天），无则 null */
export function specialDayOf(date: string): string | null {
  for (const s of SPECIAL_DAYS) {
    if (diffDays(date, s.date) <= 1) return s.name;
  }
  return null;
}

/** 拍照时宝宝月龄（由参考日期与当前月龄反推出生日期） */
export function ageMonthsAt(birthISO: string, date: string): number {
  return (toDate(date).getTime() - toDate(birthISO).getTime()) / (DAY_MS * DAYS_PER_MONTH);
}

/** 月龄 → 成长节点：满月/百天/半岁/周岁 */
export function growthNodeOf(ageMonths: number): string | null {
  if (Math.abs(ageMonths - 1) <= 0.35) return "满月";
  if (Math.abs(ageMonths - 3.3) <= 0.45) return "百天";
  if (Math.abs(ageMonths - 6) <= 0.45) return "半岁";
  if (Math.abs(ageMonths - 12) <= 0.45) return "周岁";
  return null;
}

/** 一件衣物的故事素材（喂给 GLM 的事实，也是 mock 模板的依据） */
export interface StoryFacts {
  name: string;
  desc: string; // 颜色+图案+品类
  type: string;
  wear_count: number;
  first_worn_at: string;
  last_worn_at: string;
  is_staple: boolean; // 兜底款：出现 ≥3 次
  age_at_first: number | null; // 第一次穿时宝宝月龄
  node: string | null; // 命中的成长节点（任一穿着日）
  node_date: string | null;
  best_date: string; // 最有纪念意义的一张照片日期
  best_festival: string | null; // 该照片命中的节日/节气
  near_birthday: string | null; // 穿着日临近宝宝生日（±7 天）——"像是为这个日子准备的"
  place: string | null; // 元数据地点（可空）
  people: string | null; // 元数据人物（可空）
}

/** 为一件衣物挑选"最有纪念意义"的穿着照片：节点 > 节日 > 有元数据 > 末次 */
export function buildStoryFacts(
  item: ClothingItem,
  photos: PhotoItem[],
  monthAge: number,
  refDateISO: string
): StoryFacts {
  const worn = photos
    .filter((p) => p.item_ids.includes(item.id))
    .sort((a, b) => a.taken_at.localeCompare(b.taken_at));
  const birth = toDate(refDateISO);
  birth.setTime(birth.getTime() - monthAge * DAYS_PER_MONTH * DAY_MS);
  const birthISO = `${birth.getFullYear()}-${`${birth.getMonth() + 1}`.padStart(2, "0")}-${`${birth.getDate()}`.padStart(2, "0")}`;

  let node: string | null = null;
  let nodeDate: string | null = null;
  for (const p of worn) {
    const n = growthNodeOf(ageMonthsAt(birthISO, p.taken_at));
    if (n) {
      node = n;
      nodeDate = p.taken_at;
      break;
    }
  }

  // 穿着日是否临近宝宝生日（±7 天）：生日礼物/纪念日准备的线索
  const birthdayMD = birthISO.slice(5);
  const near_birthday =
    worn.find((p) => mdDiffDays(p.taken_at, birthdayMD) <= 7)?.taken_at ?? null;

  const scored = worn.map((p) => {
    let s = 0;
    if (nodeDate === p.taken_at) s += 8;
    if (near_birthday === p.taken_at) s += 6;
    if (specialDayOf(p.taken_at)) s += 4;
    if (p.place) s += 2;
    if (p.people) s += 1;
    return { p, s };
  });
  scored.sort((a, b) => b.s - a.s || b.p.taken_at.localeCompare(a.p.taken_at));
  const best = scored[0]?.p ?? null;

  return {
    name: item.name,
    desc: `${item.color}${item.pattern}${item.type}`,
    type: item.type,
    wear_count: item.wear_count,
    first_worn_at: item.first_worn_at,
    last_worn_at: item.last_worn_at,
    is_staple: item.wear_count >= 3,
    age_at_first:
      worn.length > 0 ? Math.round(ageMonthsAt(birthISO, item.first_worn_at) * 10) / 10 : null,
    node,
    node_date: nodeDate,
    best_date: best?.taken_at ?? item.last_worn_at,
    best_festival: best ? specialDayOf(best.taken_at) : null,
    near_birthday,
    place: best?.place ?? null,
    people: best?.people ?? null,
  };
}
