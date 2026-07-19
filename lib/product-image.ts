// 宝宝衣橱 · 商品主图生成（无 key 兜底：SVG 简笔画商品图，前后端通用）
// 有 key 时由 zhipu.ts 的 CogView 生成实拍感商品图；本模块保证任何情况下
// 「仅查看服饰」Tab 都有统一的商品图可展示。

/** 中文颜色词 → 主色 hex（先全词后包含匹配） */
const COLOR_MAP: [string, string][] = [
  ["奶黄", "#F9E19B"],
  ["薄荷绿", "#A8DCC0"],
  ["牛油果绿", "#A9C97F"],
  ["天蓝", "#8FC4EA"],
  ["浅蓝", "#B9D9F2"],
  ["深蓝", "#5B7BA6"],
  ["藏青", "#3D4E6B"],
  ["蓝白", "#DCEAF7"],
  ["米白", "#F5EFE4"],
  ["浅灰", "#DCD8D2"],
  ["深灰", "#8A8580"],
  ["卡其", "#C9B48A"],
  ["咖啡", "#8A6B52"],
  ["白", "#F8F6F2"],
  ["粉", "#F5B8CD"],
  ["红", "#E8655A"],
  ["橙", "#F2A65A"],
  ["黄", "#F6D97B"],
  ["绿", "#A8DCC0"],
  ["蓝", "#8FC4EA"],
  ["紫", "#C5A8DC"],
  ["灰", "#CFC9C2"],
  ["黑", "#4A4543"],
  ["米", "#E8D3B0"],
  ["棕", "#A98A6B"],
];

function colorHex(color: string): string {
  const c = (color || "").trim();
  for (const [k, v] of COLOR_MAP) if (c === k) return v;
  for (const [k, v] of COLOR_MAP) if (c.includes(k)) return v;
  return "#EDE4D3";
}

/** 简单加深（图案点缀色） */
function darken(hex: string, f = 0.72): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

type DoodleKind = "onesie" | "hat" | "pants" | "jacket" | "dress";

function kindOf(type: string): DoodleKind {
  if (/裤/.test(type)) return "pants";
  if (/帽/.test(type)) return "hat";
  if (/外套|夹克|开衫/.test(type)) return "jacket";
  if (/裙/.test(type)) return "dress";
  return "onesie"; // 连体衣/哈衣/包屁衣/上衣/袜子/鞋子/配饰统一用连体衣示意
}

function patternDoodle(pattern: string, accent: string): string {
  if (/条纹/.test(pattern)) {
    return `<g stroke="${accent}" stroke-width="7" opacity="0.7"><line x1="-38" y1="-22" x2="38" y2="-22"/><line x1="-38" y1="-8" x2="38" y2="-8"/><line x1="-38" y1="6" x2="38" y2="6"/><line x1="-38" y1="20" x2="38" y2="20"/></g>`;
  }
  if (/印花|花|植物|水果/.test(pattern)) {
    return `<g transform="translate(0,-4)"><g fill="${accent}" opacity="0.9"><ellipse cx="0" cy="-12" rx="5" ry="8"/><ellipse cx="11" cy="-3" rx="5" ry="8" transform="rotate(72 11 -3)"/><ellipse cx="7" cy="10" rx="5" ry="8" transform="rotate(144 7 10)"/><ellipse cx="-7" cy="10" rx="5" ry="8" transform="rotate(216 -7 10)"/><ellipse cx="-11" cy="-3" rx="5" ry="8" transform="rotate(288 -11 -3)"/></g><circle cx="0" cy="0" r="4.5" fill="#F6D97B"/></g>`;
  }
  if (/卡通|动物|动漫/.test(pattern)) {
    return `<g opacity="0.95"><circle cx="-15" cy="-16" r="6.5" fill="${accent}"/><circle cx="15" cy="-16" r="6.5" fill="${accent}"/><circle cx="0" cy="0" r="15" fill="${accent}"/><circle cx="-5" cy="-3" r="1.8" fill="#5B4A42"/><circle cx="5" cy="-3" r="1.8" fill="#5B4A42"/><ellipse cx="0" cy="4.5" rx="4.5" ry="3.2" fill="#FFFDF8"/><circle cx="0" cy="3.2" r="1.4" fill="#5B4A42"/></g>`;
  }
  if (/纯色|净色|素色/.test(pattern)) {
    return ""; // 净版无图案
  }
  // 其他图案用小爱心点缀
  return `<path d="M0,3 C-9,-6 -17,3 0,13 C17,3 9,-6 0,3 Z" fill="${accent}" opacity="0.8"/>`;
}

function doodle(kind: DoodleKind, base: string, accent: string, pattern: string): string {
  const inner = patternDoodle(pattern, accent);
  if (kind === "hat") {
    return `<g><circle cx="-24" cy="-28" r="10" fill="${base}"/><circle cx="24" cy="-28" r="10" fill="${base}"/><circle cx="-24" cy="-28" r="4.5" fill="${accent}"/><circle cx="24" cy="-28" r="4.5" fill="${accent}"/><path d="M-42,12 A42,42 0 0 1 42,12 L42,15 L-42,15 Z" fill="${base}"/><rect x="-46" y="12" width="92" height="12" rx="6" fill="${accent}"/></g>`;
  }
  if (kind === "pants") {
    return `<g><rect x="-34" y="-52" width="12" height="34" rx="6" fill="${base}"/><rect x="22" y="-52" width="12" height="34" rx="6" fill="${base}"/><rect x="-36" y="-26" width="72" height="30" rx="10" fill="${base}"/>${inner}<rect x="-32" y="0" width="26" height="48" rx="10" fill="${base}"/><rect x="6" y="0" width="26" height="48" rx="10" fill="${base}"/></g>`;
  }
  if (kind === "jacket") {
    return `<g><rect x="-58" y="-32" width="22" height="38" rx="10" fill="${base}"/><rect x="36" y="-32" width="22" height="38" rx="10" fill="${base}"/><rect x="-42" y="-36" width="84" height="82" rx="18" fill="${base}"/>${inner}<path d="M-16,-36 Q0,-22 16,-36" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round"/><line x1="0" y1="-21" x2="0" y2="44" stroke="${accent}" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/></g>`;
  }
  if (kind === "dress") {
    return `<g><rect x="-60" y="-34" width="20" height="30" rx="9" fill="${base}"/><rect x="40" y="-34" width="20" height="30" rx="9" fill="${base}"/><path d="M-32,-36 L32,-36 L46,40 Q0,52 -46,40 Z" fill="${base}"/>${inner}<path d="M-32,-36 Q0,-24 32,-36" stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
  }
  // onesie 系
  return `<g><rect x="-60" y="-32" width="22" height="32" rx="10" fill="${base}"/><rect x="38" y="-32" width="22" height="32" rx="10" fill="${base}"/><rect x="-42" y="-36" width="84" height="72" rx="18" fill="${base}"/>${inner}<rect x="-32" y="30" width="26" height="26" rx="10" fill="${base}"/><rect x="6" y="30" width="26" height="26" rx="10" fill="${base}"/><path d="M-14,-36 Q0,-22 14,-36" stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 照片占位图（线上无真实照片时的优雅降级）：奶油底 + 标签 */
export function svgPhotoPlaceholder(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" rx="20" fill="#FFF6E6"/><circle cx="150" cy="128" r="34" fill="#FCE7F0"/><text x="150" y="141" text-anchor="middle" font-size="34">🍼</text><text x="150" y="200" text-anchor="middle" font-size="15" fill="#A68F7D" font-family="PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif">${esc(label)}</text><text x="150" y="228" text-anchor="middle" font-size="11" fill="#C9B7A0" font-family="PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif">宝宝照片</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** 生成商品主图（SVG data url）：奶油底 + 衣物简笔画 + 品名，电商主图版式 */
export function svgProductImage(item: {
  name: string;
  type: string;
  color: string;
  pattern: string;
}): string {
  const base = colorHex(item.color);
  const accent = darken(base);
  const kind = kindOf(item.type);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" rx="20" fill="#FFFDF8"/><rect x="8" y="8" width="284" height="284" rx="16" fill="#FFFDF8" stroke="#F2E2C6" stroke-width="1.5"/><g transform="translate(150,138)">${doodle(kind, base, accent, item.pattern)}</g><rect x="0" y="252" width="300" height="48" rx="0" fill="#FFF6E6"/><text x="150" y="281" text-anchor="middle" font-size="14" fill="#A68F7D" font-family="PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif">${esc(item.color)}${esc(item.pattern)}${esc(item.type)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
