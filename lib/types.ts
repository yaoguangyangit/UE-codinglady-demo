// 宝宝衣橱 · 核心数据类型（PRD 5.4 数据字典）

/** 衣物状态：在役 / 临近退役 / 已退役 / 闲置 */
export type ClothingStatus = "active" | "retiring" | "retired" | "idle";

/** 提醒类型：尺码预警 / 闲置 / 采购建议 */
export type ReminderKind = "size_alert" | "idle" | "shopping";

/** 衣物档案（clothes 表） */
export interface ClothingItem {
  id: string;
  name: string; // 名称，如"蓝白条纹哈衣"
  type: string; // 品类：连体衣/哈衣/包屁衣/上衣/裤子/外套/帽子/袜子/配饰
  color: string; // 主色
  pattern: string; // 图案：条纹/印花/纯色/卡通/刺绣
  size_stage: string; // 推断尺码阶段：52/59/66/73/80/90
  wear_count: number; // 出现次数
  first_worn_at: string; // 首次穿着日期 YYYY-MM-DD
  last_worn_at: string; // 末次穿着日期 YYYY-MM-DD
  rep_image_url: string; // 代表照片
  product_image_url?: string; // AI 合成的商品主图（CogView；无 key/失败时前端回落 SVG 简笔画）
  story?: string; // 它的故事（感性场景描述，分析阶段自动生成）
  status: ClothingStatus;
}

/** 照片（photos 表） */
export interface PhotoItem {
  id: string;
  image_url: string; // base64 data url
  taken_at: string; // 拍摄日期 YYYY-MM-DD
  item_ids: string[]; // 分解出的衣物 id 列表
  season_hint: string; // 推测季节
  place?: string; // 拍摄地点（元数据有才有，严禁编造）
  people?: string; // 同行人物（同上）
}

/** 提醒（reminders 表） */
export interface Reminder {
  id: string;
  item_id: string | null; // shopping 类提醒可不关联具体衣物
  kind: ReminderKind;
  message: string;
  created_at: string;
}

// ============ API 类型 ============

/** GLM-4V 从单张照片分解出的一件衣物（未归并） */
export interface DecomposedClothing {
  type: string;
  color: string;
  pattern: string;
  desc: string;
}

/** 穿搭分解结果（PRD 5.2 ①） */
export interface DecomposeResult {
  items: DecomposedClothing[];
  season_hint: string;
}

/** 归并前的扫描照片（服务端中间结构） */
export interface ScannedPhoto {
  id: string;
  image_url: string;
  taken_at: string;
  decomposed: DecomposeResult;
  place?: string;
  people?: string;
}

/** 尺码里程碑 */
export interface Milestone {
  date: string; // YYYY-MM-DD
  label: string; // 如"第一次穿 66 码"
  size_stage?: string;
}

/** POST /api/analyze 输入 */
export interface AnalyzeInput {
  monthAge: number;
  items: ClothingItem[];
  photos: PhotoItem[];
}

/** POST /api/analyze 输出 */
export interface AnalyzeResult {
  current_size: string; // 当前尺码阶段判断，如 "80"
  reminders: Reminder[]; // 尺码预警 + 闲置
  shopping: string[]; // 换季采购建议（≤3 条）
  milestones: Milestone[]; // 尺码里程碑
  stories: Record<string, string>; // item_id → 它的故事（分析阶段批量生成）
  product_images?: Record<string, string>; // item_id → AI 合成商品主图 URL（无 key 时缺省）
}

/** POST /api/decompose 输出 */
export interface DecomposeResponse {
  photos: PhotoItem[];
  items: ClothingItem[];
}

/** 标准尺码月龄表（PRD 4.4） */
export const SIZE_TABLE: { size: string; min: number; max: number }[] = [
  { size: "52", min: 0, max: 1 },
  { size: "59", min: 1, max: 3 },
  { size: "66", min: 3, max: 6 },
  { size: "73", min: 6, max: 9 },
  { size: "80", min: 9, max: 12 },
  { size: "90", min: 12, max: 24 },
];

export const SIZE_ORDER = SIZE_TABLE.map((s) => s.size);
