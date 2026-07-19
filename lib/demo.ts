// 宝宝衣橱 · 内置演示数据
// 12 张"宝宝照片"全部为本地内联 SVG data URI（奶油色底 + 衣物简笔画 + 日期），
// 严禁外链任何图片。时间线跨 59/66/73/80 四个尺码阶段（2025-11 满月 → 2026-07）。
import type { DecomposeResult } from "./types";

export interface DemoPhoto {
  id: string;
  taken_at: string; // YYYY-MM-DD
  image: string; // svg data uri
  expected: DecomposeResult; // 该照片固化的 AI 分解结果（mock 兜底用）
  place?: string; // 拍摄地点（元数据）
  people?: string; // 同行人物（元数据）
}

// ---------- SVG 简笔画生成 ----------

type DoodleKind = "onesie" | "hat" | "pants" | "jacket";
type PatternKind = "stripes" | "cloud" | "bear" | "flower" | "heart";

interface DoodleSpec {
  kind: DoodleKind;
  base: string; // 主色
  accent: string; // 图案色
  pattern: PatternKind;
}

function patternSvg(p: PatternKind, accent: string): string {
  switch (p) {
    case "stripes":
      return `<g clip-path="url(#bodyClip)" stroke="${accent}" stroke-width="7" opacity="0.75"><line x1="-46" y1="-24" x2="46" y2="-24"/><line x1="-46" y1="-10" x2="46" y2="-10"/><line x1="-46" y1="4" x2="46" y2="4"/><line x1="-46" y1="18" x2="46" y2="18"/></g>`;
    case "cloud":
      return `<g fill="${accent}" opacity="0.95"><g transform="translate(-13,-12)"><ellipse cx="0" cy="0" rx="11" ry="7"/><ellipse cx="8" cy="-3" rx="8" ry="6"/><ellipse cx="-8" cy="-3" rx="7" ry="5"/></g><g transform="translate(14,9) scale(0.8)"><ellipse cx="0" cy="0" rx="11" ry="7"/><ellipse cx="8" cy="-3" rx="8" ry="6"/><ellipse cx="-8" cy="-3" rx="7" ry="5"/></g></g>`;
    case "bear":
      return `<g><circle cx="-15" cy="-18" r="6.5" fill="${accent}"/><circle cx="15" cy="-18" r="6.5" fill="${accent}"/><circle cx="0" cy="0" r="15" fill="${accent}"/><circle cx="-5" cy="-3" r="1.8" fill="#5B4A42"/><circle cx="5" cy="-3" r="1.8" fill="#5B4A42"/><ellipse cx="0" cy="4.5" rx="4.5" ry="3.2" fill="#FFFDF8"/><circle cx="0" cy="3.2" r="1.4" fill="#5B4A42"/></g>`;
    case "flower":
      return `<g transform="translate(0,-1)"><g fill="${accent}"><ellipse cx="0" cy="-9" rx="4.5" ry="7"/><ellipse cx="8.5" cy="-2.5" rx="4.5" ry="7" transform="rotate(72 8.5 -2.5)"/><ellipse cx="5.5" cy="7.5" rx="4.5" ry="7" transform="rotate(144 5.5 7.5)"/><ellipse cx="-5.5" cy="7.5" rx="4.5" ry="7" transform="rotate(216 -5.5 7.5)"/><ellipse cx="-8.5" cy="-2.5" rx="4.5" ry="7" transform="rotate(288 -8.5 -2.5)"/></g><circle cx="0" cy="0" r="4" fill="#F6D97B"/></g>`;
    default:
      return `<path d="M0,3 C-9,-6 -17,3 0,13 C17,3 9,-6 0,3 Z" fill="${accent}" opacity="0.85"/>`;
  }
}

function doodleSvg(d: DoodleSpec): string {
  const clip = `<clipPath id="bodyClip"><rect x="-42" y="-36" width="84" height="72" rx="18"/></clipPath>`;
  if (d.kind === "hat") {
    return `<g><circle cx="-24" cy="-28" r="10" fill="${d.base}"/><circle cx="24" cy="-28" r="10" fill="${d.base}"/><circle cx="-24" cy="-28" r="4.5" fill="${d.accent}"/><circle cx="24" cy="-28" r="4.5" fill="${d.accent}"/><path d="M-42,12 A42,42 0 0 1 42,12 L42,15 L-42,15 Z" fill="${d.base}"/><rect x="-46" y="12" width="92" height="12" rx="6" fill="${d.accent}"/></g>`;
  }
  if (d.kind === "pants") {
    return `<g><rect x="-26" y="-52" width="10" height="30" rx="5" fill="${d.base}"/><rect x="16" y="-52" width="10" height="30" rx="5" fill="${d.base}"/><rect x="-34" y="-30" width="68" height="46" rx="12" fill="${d.base}"/><circle cx="-21" cy="-22" r="3" fill="${d.accent}"/><circle cx="21" cy="-22" r="3" fill="${d.accent}"/><rect x="-18" y="-13" width="36" height="19" rx="8" fill="${d.accent}" opacity="0.65"/><rect x="-32" y="12" width="26" height="40" rx="10" fill="${d.base}"/><rect x="6" y="12" width="26" height="40" rx="10" fill="${d.base}"/></g>`;
  }
  if (d.kind === "jacket") {
    return `${clip}<g><rect x="-58" y="-32" width="22" height="36" rx="10" fill="${d.base}"/><rect x="36" y="-32" width="22" height="36" rx="10" fill="${d.base}"/><rect x="-42" y="-36" width="84" height="80" rx="18" fill="${d.base}"/><path d="M-16,-36 Q0,-22 16,-36" stroke="${d.accent}" stroke-width="5" fill="none" stroke-linecap="round"/><line x1="0" y1="-21" x2="0" y2="42" stroke="${d.accent}" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/></g>`;
  }
  // onesie：连体衣 / 哈衣 / 包屁衣
  return `${clip}<g><rect x="-60" y="-32" width="22" height="32" rx="10" fill="${d.base}"/><rect x="38" y="-32" width="22" height="32" rx="10" fill="${d.base}"/><rect x="-42" y="-36" width="84" height="72" rx="18" fill="${d.base}"/><rect x="-32" y="30" width="26" height="26" rx="10" fill="${d.base}"/><rect x="6" y="30" width="26" height="26" rx="10" fill="${d.base}"/><path d="M-14,-36 Q0,-22 14,-36" stroke="${d.accent}" stroke-width="4" fill="none" stroke-linecap="round"/>${patternSvg(d.pattern, d.accent)}</g>`;
}

function photoSvg(caption: string, date: string, main: DoodleSpec): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" rx="26" fill="#FFF6E6"/><rect x="10" y="10" width="280" height="280" rx="20" fill="#FFFCF4" stroke="#F2E2C6" stroke-width="2"/><circle cx="40" cy="56" r="4" fill="#F7A8C4" opacity="0.6"/><circle cx="262" cy="50" r="5" fill="#8FC4EA" opacity="0.55"/><circle cx="264" cy="232" r="4" fill="#F6D97B" opacity="0.7"/><circle cx="36" cy="228" r="3.5" fill="#A8DCC0" opacity="0.7"/><path d="M250,82 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3 z" fill="#F6D97B" opacity="0.85"/><text x="150" y="46" text-anchor="middle" font-size="15" fill="#A68F7D" font-family="PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif">${caption}</text><g transform="translate(150,146)">${doodleSvg(main)}</g><text x="150" y="266" text-anchor="middle" font-size="14" fill="#BCA88F" font-family="PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif">${date}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ---------- 单品定义（颜色图案差异明显，规避同色同款） ----------

const DOODLES = {
  fullMoon: { kind: "onesie", base: "#E8655A", accent: "#F6D97B", pattern: "flower" } as DoodleSpec, // 满月红刺绣连体衣
  stripe: { kind: "onesie", base: "#F4F9FE", accent: "#6FA8DC", pattern: "stripes" } as DoodleSpec, // 蓝白条纹哈衣
  hat: { kind: "hat", base: "#E8D3B0", accent: "#C9A87C", pattern: "bear" } as DoodleSpec, // 米色小熊针织帽
  cloud: { kind: "onesie", base: "#F9E19B", accent: "#FFFFFF", pattern: "cloud" } as DoodleSpec, // 奶黄云朵连体衣
  grayBear: { kind: "onesie", base: "#CFC9C2", accent: "#F5F0E8", pattern: "bear" } as DoodleSpec, // 灰色小熊哈衣
  mint: { kind: "onesie", base: "#A8DCC0", accent: "#FFFFFF", pattern: "heart" } as DoodleSpec, // 薄荷绿包屁衣
  avocado: { kind: "jacket", base: "#A9C97F", accent: "#7A9B52", pattern: "heart" } as DoodleSpec, // 牛油果绿小外套
  overalls: { kind: "pants", base: "#8FC4EA", accent: "#5E9FD6", pattern: "heart" } as DoodleSpec, // 天蓝背带裤
};

// 固化分解结果（type/color/pattern 为归并硬匹配指纹）
const C = { type: "连体衣", color: "红色", pattern: "刺绣", desc: "满月穿的红刺绣连体衣" };
const A = { type: "哈衣", color: "蓝白", pattern: "条纹", desc: "蓝白条纹哈衣" };
const G = { type: "帽子", color: "米色", pattern: "卡通", desc: "米色小熊针织帽" };
const B = { type: "连体衣", color: "奶黄", pattern: "印花", desc: "奶黄云朵印花连体衣" };
const F = { type: "哈衣", color: "灰色", pattern: "卡通", desc: "灰色小熊哈衣" };
const D = { type: "包屁衣", color: "薄荷绿", pattern: "纯色", desc: "薄荷绿纯色包屁衣" };
const E = { type: "外套", color: "牛油果绿", pattern: "纯色", desc: "牛油果绿小外套" };
const H = { type: "裤子", color: "天蓝", pattern: "纯色", desc: "天蓝色背带裤" };

// ---------- 12 张演示照片 ----------
// 时间线：2025-11-15 满月 → 2026-07-15，宝宝当前 9 个月（当前尺码 80）。
// 兜底款：蓝白条纹哈衣 ×5、奶黄云朵连体衣 ×4；闲置款：薄荷绿包屁衣、牛油果绿外套各 ×1；
// 情感锚点：满月红刺绣连体衣（它的故事：满月那天穿着它，拍下了人生第一张全家福。）

export const DEMO_PHOTOS: DemoPhoto[] = [
  { id: "demo-01", taken_at: "2025-11-15", image: photoSvg("满月纪念 · 红刺绣连体衣", "2025-11-15", DOODLES.fullMoon), expected: { items: [C], season_hint: "冬" }, people: "爸爸妈妈" },
  { id: "demo-02", taken_at: "2026-03-12", image: photoSvg("蓝白条纹哈衣", "2026-03-12", DOODLES.stripe), expected: { items: [A], season_hint: "春" } },
  { id: "demo-03", taken_at: "2026-03-20", image: photoSvg("条纹哈衣 · 小熊帽", "2026-03-20", DOODLES.stripe), expected: { items: [A, G], season_hint: "春" } },
  { id: "demo-04", taken_at: "2026-04-02", image: photoSvg("条纹哈衣 · 小熊帽", "2026-04-02", DOODLES.hat), expected: { items: [A, G], season_hint: "春" } },
  { id: "demo-05", taken_at: "2026-04-15", image: photoSvg("半岁纪念 · 蓝白条纹哈衣", "2026-04-15", DOODLES.stripe), expected: { items: [A], season_hint: "春" }, people: "爸爸妈妈" },
  { id: "demo-06", taken_at: "2026-05-03", image: photoSvg("蓝白条纹哈衣", "2026-05-03", DOODLES.stripe), expected: { items: [A], season_hint: "春" } },
  { id: "demo-07", taken_at: "2026-05-28", image: photoSvg("奶黄云朵连体衣 · 小熊哈衣", "2026-05-28", DOODLES.cloud), expected: { items: [B, F], season_hint: "夏" } },
  { id: "demo-08", taken_at: "2026-06-01", image: photoSvg("第一个六一 · 奶黄云朵连体衣", "2026-06-01", DOODLES.cloud), expected: { items: [B, F], season_hint: "夏" }, people: "爸爸妈妈" },
  { id: "demo-09", taken_at: "2026-06-15", image: photoSvg("薄荷绿包屁衣", "2026-06-15", DOODLES.mint), expected: { items: [D], season_hint: "夏" } },
  { id: "demo-10", taken_at: "2026-06-22", image: photoSvg("夏至 · 奶黄云朵连体衣", "2026-06-22", DOODLES.cloud), expected: { items: [B], season_hint: "夏" }, place: "西湖", people: "爸爸妈妈" },
  { id: "demo-11", taken_at: "2026-07-12", image: photoSvg("天蓝背带裤 · 牛油果外套", "2026-07-12", DOODLES.overalls), expected: { items: [H, E], season_hint: "夏" } },
  { id: "demo-12", taken_at: "2026-07-15", image: photoSvg("奶黄云朵连体衣 · 天蓝背带裤", "2026-07-15", DOODLES.cloud), expected: { items: [B, H], season_hint: "夏" } },
];

export const DEMO_IMAGES: string[] = DEMO_PHOTOS.map((p) => p.image);
export const DEMO_TAKEN_ATS: string[] = DEMO_PHOTOS.map((p) => p.taken_at);
export const DEMO_PLACES: (string | undefined)[] = DEMO_PHOTOS.map((p) => p.place);
export const DEMO_PEOPLES: (string | undefined)[] = DEMO_PHOTOS.map((p) => p.people);

/** 按图片内容精确匹配演示照片（mock 兜底用） */
export function findDemoPhoto(image: string): DemoPhoto | undefined {
  return DEMO_PHOTOS.find((p) => p.image === image);
}
