// 预处理固化结果（2026-07-19 由 20 张真实照片全链路跑批生成；2026-07-20 升级：
// 真实商品主图优先 + AI 渲染补缺 + 手工补录 6 件（奶奶手编挎包/小恐龙防晒衣/蝴蝶结发卡/
// 条纹小兔上衣/运动套装/小鸭遮阳帽），全部本地化于 /demo-product-pic/）。
// 两条演示路径（相册授权 / 演示数据）默认使用本结果，保证现场稳定性；
// 实时链路仍可通过 processing 页 ?live=1 调用。
// 照片在 public/preset-photos/（隐私红线：不进 git），商品图在 public/demo-product-pic/。
import type { ScanResult } from "./store";

export const PRESET_RESULT: ScanResult = {
  "photos": [
    {
      "id": "photo-1",
      "image_url": "/preset-photos/20260719-160222.jpeg",
      "taken_at": "2023-09-19",
      "item_ids": [
        "item-1"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-2",
      "image_url": "/preset-photos/20260719-160243.jpeg",
      "taken_at": "2023-11-12",
      "item_ids": [
        "item-2",
        "item-3"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-3",
      "image_url": "/preset-photos/20260719-160250.jpeg",
      "taken_at": "2024-01-05",
      "item_ids": [
        "item-4",
        "item-5"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-4",
      "image_url": "/preset-photos/20260719-160256.jpeg",
      "taken_at": "2024-02-29",
      "item_ids": [
        "item-6",
        "item-7"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-5",
      "image_url": "/preset-photos/20260719-160301.jpeg",
      "taken_at": "2024-04-23",
      "item_ids": [
        "item-6",
        "item-8",
        "item-9",
        "item-10"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-6",
      "image_url": "/preset-photos/20260719-160306.jpeg",
      "taken_at": "2024-06-16",
      "item_ids": [
        "item-11",
        "item-34"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-7",
      "image_url": "/preset-photos/20260719-160311.jpeg",
      "taken_at": "2024-08-09",
      "item_ids": [
        "item-12",
        "item-32"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-8",
      "image_url": "/preset-photos/20260719-160317.jpeg",
      "taken_at": "2024-10-02",
      "item_ids": [
        "item-13",
        "item-14"
      ],
      "season_hint": "秋"
    },
    {
      "id": "photo-9",
      "image_url": "/preset-photos/20260719-160322.jpeg",
      "taken_at": "2024-11-26",
      "item_ids": [
        "item-15"
      ],
      "season_hint": "春"
    },
    {
      "id": "photo-10",
      "image_url": "/preset-photos/20260719-160329.jpeg",
      "taken_at": "2025-01-19",
      "item_ids": [
        "item-16",
        "item-17",
        "item-18"
      ],
      "season_hint": "春"
    },
    {
      "id": "photo-11",
      "image_url": "/preset-photos/20260719-160335.jpeg",
      "taken_at": "2025-03-14",
      "item_ids": [
        "item-19",
        "item-20"
      ],
      "season_hint": "秋季"
    },
    {
      "id": "photo-12",
      "image_url": "/preset-photos/20260719-160342.jpeg",
      "taken_at": "2025-05-07",
      "item_ids": [
        "item-21",
        "item-7"
      ],
      "season_hint": "秋"
    },
    {
      "id": "photo-13",
      "image_url": "/preset-photos/20260719-160348.jpeg",
      "taken_at": "2025-07-01",
      "item_ids": [
        "item-22",
        "item-23"
      ],
      "season_hint": "春/夏"
    },
    {
      "id": "photo-14",
      "image_url": "/preset-photos/20260719-160356.jpeg",
      "taken_at": "2025-08-24",
      "item_ids": [
        "item-24"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-15",
      "image_url": "/preset-photos/20260719-160404.jpeg",
      "taken_at": "2025-10-17",
      "item_ids": [
        "item-25",
        "item-20"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-16",
      "image_url": "/preset-photos/20260719-160411.jpeg",
      "taken_at": "2025-12-10",
      "item_ids": [
        "item-26",
        "item-27"
      ],
      "season_hint": "秋"
    },
    {
      "id": "photo-17",
      "image_url": "/preset-photos/20260719-160420.jpeg",
      "taken_at": "2026-02-02",
      "item_ids": [
        "item-28",
        "item-29",
        "item-10"
      ],
      "season_hint": "春"
    },
    {
      "id": "photo-18",
      "image_url": "/preset-photos/20260719-160425.jpeg",
      "taken_at": "2026-03-29",
      "item_ids": [
        "item-21",
        "item-8"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-19",
      "image_url": "/preset-photos/20260719-160429.jpeg",
      "taken_at": "2026-05-22",
      "item_ids": [
        "item-30",
        "item-31"
      ],
      "season_hint": "夏"
    },
    {
      "id": "photo-20",
      "image_url": "/preset-photos/20260719-160434.jpeg",
      "taken_at": "2026-07-15",
      "item_ids": [
        "item-26"
      ],
      "season_hint": "春"
    },
    {
      "id": "photo-21",
      "image_url": "/preset-photos/20260720-085641.jpeg",
      "taken_at": "2026-05-15",
      "item_ids": [
        "item-33"
      ],
      "season_hint": "夏"
    }
  ],
  "items": [
    {
      "id": "item-6",
      "name": "白色纯色上衣",
      "type": "上衣",
      "color": "白色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 2,
      "first_worn_at": "2024-02-29",
      "last_worn_at": "2024-04-23",
      "rep_image_url": "/preset-photos/20260719-160301.jpeg",
      "status": "active",
      "story": "2024年2月29日首次穿上，在4月23日最后一次出现，陪伴了两个重要时刻。",
      "product_image_url": "/demo-product-pic/20260720-085750.png"
    },
    {
      "id": "item-7",
      "name": "蓝色卡通裤子",
      "type": "裤子",
      "color": "蓝色",
      "pattern": "卡通",
      "size_stage": "90",
      "wear_count": 2,
      "first_worn_at": "2024-02-29",
      "last_worn_at": "2025-05-07",
      "rep_image_url": "/preset-photos/20260719-160342.jpeg",
      "status": "active",
      "story": "2024年2月29日首次穿上，在2025年5月7日最后一次出现，跨越了一年多的时光。",
      "product_image_url": "/demo-product-pic/20260720-085838.jpeg"
    },
    {
      "id": "item-8",
      "name": "蓝色纯色裤子",
      "type": "裤子",
      "color": "蓝色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 2,
      "first_worn_at": "2024-04-23",
      "last_worn_at": "2026-03-29",
      "rep_image_url": "/preset-photos/20260719-160425.jpeg",
      "status": "active",
      "story": "2024年4月23日首次穿上，在2026年3月29日最后一次出现，见证了近两年的成长。",
      "product_image_url": "/demo-product-pic/ai-item-8.jpg"
    },
    {
      "id": "item-10",
      "name": "白色纯色鞋子",
      "type": "鞋子",
      "color": "白色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 2,
      "first_worn_at": "2024-04-23",
      "last_worn_at": "2026-02-02",
      "rep_image_url": "/preset-photos/20260719-160420.jpeg",
      "status": "active",
      "story": "2024年4月23日首次穿上，在2026年2月2日最后一次出现，陪伴了多个重要场合。",
      "product_image_url": "/demo-product-pic/ai-item-10.jpg"
    },
    {
      "id": "item-20",
      "name": "白色纯色裤子",
      "type": "裤子",
      "color": "白色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 2,
      "first_worn_at": "2025-03-14",
      "last_worn_at": "2025-10-17",
      "rep_image_url": "/preset-photos/20260719-160404.jpeg",
      "status": "active",
      "story": "生日前一周专门穿上的，像是专门为这个日子准备的，记录了特别的时刻。",
      "product_image_url": "/demo-product-pic/ai-item-20.jpg"
    },
    {
      "id": "item-21",
      "name": "橙色纯色上衣",
      "type": "上衣",
      "color": "橙色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 2,
      "first_worn_at": "2025-05-07",
      "last_worn_at": "2026-03-29",
      "rep_image_url": "/preset-photos/20260719-160425.jpeg",
      "status": "active",
      "story": "2025年5月7日首次穿上，在2026年3月29日最后一次出现，陪伴了将近一年的时光。",
      "product_image_url": "/demo-product-pic/20260720-085835.jpeg"
    },
    {
      "id": "item-26",
      "name": "蓝色纯色连体衣",
      "type": "连体衣",
      "color": "蓝色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 2,
      "first_worn_at": "2025-12-10",
      "last_worn_at": "2026-07-15",
      "rep_image_url": "/preset-photos/20260719-160434.jpeg",
      "status": "active",
      "story": "2025年12月10日首次穿上，在2026年7月15日最后一次出现，见证了冬春交替。",
      "product_image_url": "/demo-product-pic/20260720-085759.jpeg"
    },
    {
      "id": "item-1",
      "name": "深蓝色纯色连衣裙",
      "type": "连衣裙",
      "color": "深蓝色",
      "pattern": "纯色",
      "size_stage": "73",
      "wear_count": 1,
      "first_worn_at": "2023-09-19",
      "last_worn_at": "2023-09-19",
      "rep_image_url": "/preset-photos/20260719-160222.jpeg",
      "status": "retired",
      "story": "2024年6月16日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/20260720-085754.jpeg"
    },
    {
      "id": "item-2",
      "name": "白色印花裤子",
      "type": "裤子",
      "color": "白色",
      "pattern": "印花",
      "size_stage": "73",
      "wear_count": 1,
      "first_worn_at": "2023-11-12",
      "last_worn_at": "2023-11-12",
      "rep_image_url": "/preset-photos/20260719-160243.jpeg",
      "status": "retired",
      "story": "2023年11月12日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/20260720-085813.jpeg"
    },
    {
      "id": "item-3",
      "name": "蓝色纯色配饰",
      "type": "配饰",
      "color": "蓝色",
      "pattern": "纯色",
      "size_stage": "73",
      "wear_count": 1,
      "first_worn_at": "2023-11-12",
      "last_worn_at": "2023-11-12",
      "rep_image_url": "/preset-photos/20260719-160243.jpeg",
      "status": "retired",
      "story": "2023年11月12日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-3.jpg"
    },
    {
      "id": "item-4",
      "name": "紫色卡通上衣",
      "type": "上衣",
      "color": "紫色",
      "pattern": "卡通",
      "size_stage": "80",
      "wear_count": 1,
      "first_worn_at": "2024-01-05",
      "last_worn_at": "2024-01-05",
      "rep_image_url": "/preset-photos/20260719-160250.jpeg",
      "status": "idle",
      "story": "2024年1月5日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/20260720-085809.jpeg"
    },
    {
      "id": "item-5",
      "name": "紫色卡通裤子",
      "type": "裤子",
      "color": "紫色",
      "pattern": "卡通",
      "size_stage": "80",
      "wear_count": 1,
      "first_worn_at": "2024-01-05",
      "last_worn_at": "2024-01-05",
      "rep_image_url": "/preset-photos/20260719-160250.jpeg",
      "status": "idle",
      "story": "2024年1月5日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-5.jpg"
    },
    {
      "id": "item-9",
      "name": "蓝色卡通配饰",
      "type": "配饰",
      "color": "蓝色",
      "pattern": "卡通",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2024-04-23",
      "last_worn_at": "2024-04-23",
      "rep_image_url": "/preset-photos/20260719-160301.jpeg",
      "status": "idle",
      "story": "2024年4月23日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。"
    },
    {
      "id": "item-11",
      "name": "蓝色纯色连衣裙",
      "type": "连衣裙",
      "color": "蓝色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2024-06-16",
      "last_worn_at": "2024-06-16",
      "rep_image_url": "/preset-photos/20260719-160306.jpeg",
      "status": "idle",
      "story": "2026年2月2日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-11.jpg"
    },
    {
      "id": "item-12",
      "name": "白色条纹连体衣",
      "type": "连体衣",
      "color": "白色",
      "pattern": "条纹",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2024-08-09",
      "last_worn_at": "2024-08-09",
      "rep_image_url": "/preset-photos/20260719-160311.jpeg",
      "status": "idle",
      "story": "2024年8月9日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-12.jpg"
    },
    {
      "id": "item-13",
      "name": "粉色花卉连体衣",
      "type": "连体衣",
      "color": "粉色",
      "pattern": "花卉",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2024-10-02",
      "last_worn_at": "2024-10-02",
      "rep_image_url": "/preset-photos/20260719-160317.jpeg",
      "status": "idle",
      "story": "2024年10月2日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-13.jpg"
    },
    {
      "id": "item-14",
      "name": "黄色纯色袜子",
      "type": "袜子",
      "color": "黄色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2024-10-02",
      "last_worn_at": "2024-10-02",
      "rep_image_url": "/preset-photos/20260719-160317.jpeg",
      "status": "idle",
      "story": "2024年10月2日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-14.jpg"
    },
    {
      "id": "item-15",
      "name": "白色花卉连衣裙",
      "type": "连衣裙",
      "color": "白色",
      "pattern": "花卉",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2024-11-26",
      "last_worn_at": "2024-11-26",
      "rep_image_url": "/preset-photos/20260719-160322.jpeg",
      "status": "idle",
      "story": "2024年11月26日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/20260720-085745.png"
    },
    {
      "id": "item-16",
      "name": "粉色纯色上衣",
      "type": "上衣",
      "color": "粉色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-01-19",
      "last_worn_at": "2025-01-19",
      "rep_image_url": "/preset-photos/20260719-160329.jpeg",
      "status": "idle",
      "story": "2025年1月19日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-16.jpg"
    },
    {
      "id": "item-17",
      "name": "白色卡通裤子",
      "type": "裤子",
      "color": "白色",
      "pattern": "卡通",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-01-19",
      "last_worn_at": "2025-01-19",
      "rep_image_url": "/preset-photos/20260719-160329.jpeg",
      "status": "idle",
      "story": "2025年1月19日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-17.jpg"
    },
    {
      "id": "item-18",
      "name": "米色卡通鞋子",
      "type": "鞋子",
      "color": "米色",
      "pattern": "卡通",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-01-19",
      "last_worn_at": "2025-01-19",
      "rep_image_url": "/preset-photos/20260719-160329.jpeg",
      "status": "idle",
      "story": "2025年1月19日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-18.jpg"
    },
    {
      "id": "item-19",
      "name": "棕色和白色卡通上衣",
      "type": "上衣",
      "color": "棕色和白色",
      "pattern": "卡通",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-03-14",
      "last_worn_at": "2025-03-14",
      "rep_image_url": "/preset-photos/20260719-160335.jpeg",
      "status": "idle",
      "story": "生日前一周专门穿上的，像是专门为这个日子准备的，记录了特别的时刻。",
      "product_image_url": "/demo-product-pic/20260720-085802.jpeg"
    },
    {
      "id": "item-22",
      "name": "粉色纯色连衣裙",
      "type": "连衣裙",
      "color": "粉色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-07-01",
      "last_worn_at": "2025-07-01",
      "rep_image_url": "/preset-photos/20260719-160348.jpeg",
      "status": "idle",
      "story": "2025年7月1日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/20260720-085820.jpeg"
    },
    {
      "id": "item-23",
      "name": "米色纯色连衣裙",
      "type": "连衣裙",
      "color": "米色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-07-01",
      "last_worn_at": "2025-07-01",
      "rep_image_url": "/preset-photos/20260719-160348.jpeg",
      "status": "idle",
      "story": "2025年7月1日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-23.jpg"
    },
    {
      "id": "item-24",
      "name": "黑色印花上衣",
      "type": "上衣",
      "color": "黑色",
      "pattern": "印花",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-08-24",
      "last_worn_at": "2025-08-24",
      "rep_image_url": "/preset-photos/20260719-160356.jpeg",
      "status": "idle",
      "story": "2025年8月24日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-24.jpg"
    },
    {
      "id": "item-25",
      "name": "黑色卡通上衣",
      "type": "上衣",
      "color": "黑色",
      "pattern": "卡通",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-10-17",
      "last_worn_at": "2025-10-17",
      "rep_image_url": "/preset-photos/20260719-160404.jpeg",
      "status": "idle",
      "story": "2025年10月17日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-25.jpg"
    },
    {
      "id": "item-27",
      "name": "绿色条纹袜子",
      "type": "袜子",
      "color": "绿色",
      "pattern": "条纹",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2025-12-10",
      "last_worn_at": "2025-12-10",
      "rep_image_url": "/preset-photos/20260719-160411.jpeg",
      "status": "idle",
      "story": "2025年12月10日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-27.jpg"
    },
    {
      "id": "item-28",
      "name": "浅蓝色纯色连衣裙",
      "type": "连衣裙",
      "color": "浅蓝色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2026-02-02",
      "last_worn_at": "2026-02-02",
      "rep_image_url": "/preset-photos/20260719-160420.jpeg",
      "status": "idle",
      "story": "从2026-02-02到2026-02-02，它陪宝宝留下了1次笑脸。",
      "product_image_url": "/demo-product-pic/ai-item-28.jpg"
    },
    {
      "id": "item-29",
      "name": "白色纯色袜子",
      "type": "袜子",
      "color": "白色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2026-02-02",
      "last_worn_at": "2026-02-02",
      "rep_image_url": "/preset-photos/20260719-160420.jpeg",
      "status": "idle",
      "story": "2026年2月2日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-29.jpg"
    },
    {
      "id": "item-30",
      "name": "黑色纯色连体衣",
      "type": "连体衣",
      "color": "黑色",
      "pattern": "纯色",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2026-05-22",
      "last_worn_at": "2026-05-22",
      "rep_image_url": "/preset-photos/20260719-160429.jpeg",
      "status": "idle",
      "story": "2026年5月22日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-30.jpg"
    },
    {
      "id": "item-31",
      "name": "蓝色牛仔布裤子",
      "type": "裤子",
      "color": "蓝色",
      "pattern": "牛仔布",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2026-05-22",
      "last_worn_at": "2026-05-22",
      "rep_image_url": "/preset-photos/20260719-160429.jpeg",
      "status": "idle",
      "story": "2026年5月22日唯一一次穿着，还没来得及出门，就成为了珍贵的回忆。",
      "product_image_url": "/demo-product-pic/ai-item-31.jpg"
    },
    {
      "id": "item-32",
      "name": "橘色手工编织挎包",
      "type": "配饰",
      "color": "橘色",
      "pattern": "条纹",
      "size_stage": "59",
      "wear_count": 1,
      "first_worn_at": "2024-08-09",
      "last_worn_at": "2024-08-09",
      "rep_image_url": "/preset-photos/20260719-160311.jpeg",
      "product_image_url": "/demo-product-pic/ai-item-32.jpg",
      "story": "奶奶亲手钩的它，橘色小包包装过出门的每一样小零碎。",
      "status": "retired"
    },
    {
      "id": "item-33",
      "name": "白色卡通防晒衣",
      "type": "外套",
      "color": "白色",
      "pattern": "卡通",
      "size_stage": "100",
      "wear_count": 1,
      "first_worn_at": "2026-05-15",
      "last_worn_at": "2026-05-15",
      "rep_image_url": "/preset-photos/20260720-085641.jpeg",
      "product_image_url": "/demo-product-pic/ai-item-33.jpg",
      "story": "2026 年初夏，小恐龙第一次陪宝宝出门晒太阳。",
      "status": "active"
    },
    {
      "id": "item-34",
      "name": "蓝色蝴蝶结发卡",
      "type": "配饰",
      "color": "蓝色",
      "pattern": "纯色",
      "size_stage": "73",
      "wear_count": 1,
      "first_worn_at": "2024-10-02",
      "last_worn_at": "2024-10-02",
      "rep_image_url": "/preset-photos/20260719-160306.jpeg",
      "product_image_url": "/demo-product-pic/ai-item-34.jpg",
      "story": "艺术照那天别在头上的小蓝花，照片里都是春天的样子。",
      "status": "retired"
    },
    {
      "id": "item-35",
      "name": "红白条纹卡通上衣",
      "type": "上衣",
      "color": "红白",
      "pattern": "卡通",
      "size_stage": "90",
      "wear_count": 1,
      "first_worn_at": "2026-02-15",
      "last_worn_at": "2026-02-15",
      "rep_image_url": "/demo-product-pic/20260720-085805.jpeg",
      "product_image_url": "/demo-product-pic/20260720-085805.jpeg",
      "story": "红白条纹上趴着一只小兔子，2026 年春天的出镜款。",
      "status": "active"
    },
    {
      "id": "item-36",
      "name": "深藏青运动套装",
      "type": "外套",
      "color": "深藏青",
      "pattern": "条纹",
      "size_stage": "100",
      "wear_count": 1,
      "first_worn_at": "2026-03-31",
      "last_worn_at": "2026-03-31",
      "rep_image_url": "/demo-product-pic/20260720-085817.png",
      "product_image_url": "/demo-product-pic/20260720-085817.png",
      "story": "深藏青的运动套装，是随时准备出门跑跳的样子。",
      "status": "active"
    },
    {
      "id": "item-37",
      "name": "浅蓝色卡通遮阳帽",
      "type": "帽子",
      "color": "浅蓝",
      "pattern": "卡通",
      "size_stage": "80",
      "wear_count": 1,
      "first_worn_at": "2025-02-01",
      "last_worn_at": "2025-02-01",
      "rep_image_url": "/demo-product-pic/20260720-085831.jpeg",
      "product_image_url": "/demo-product-pic/20260720-085831.jpeg",
      "story": "浅蓝色的遮阳帽，等着下一个大太阳的日子。",
      "status": "active"
    }
  ],
  "reminders": [
    {
      "id": "rem-1",
      "item_id": "item-8",
      "kind": "size_alert",
      "message": "这件蓝色纯色裤子已经陪伴宝宝很久了，预计还能穿约10周，可以开始考虑准备替换款式了",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-2",
      "item_id": "item-26",
      "kind": "size_alert",
      "message": "蓝色连体衣穿着频率很高，预计还能穿约12周，是时候考虑为宝宝准备新的连体衣了",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-3",
      "item_id": "item-21",
      "kind": "size_alert",
      "message": "橙色上衣是宝宝常穿的款式之一，预计还能穿约8周，可以开始留意新的上衣款式了",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-4",
      "item_id": "item-4",
      "kind": "idle",
      "message": "紫色卡通上衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-5",
      "item_id": "item-5",
      "kind": "idle",
      "message": "紫色卡通裤子只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-6",
      "item_id": "item-9",
      "kind": "idle",
      "message": "蓝色卡通配饰只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-7",
      "item_id": "item-11",
      "kind": "idle",
      "message": "蓝色纯色连衣裙只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-8",
      "item_id": "item-12",
      "kind": "idle",
      "message": "白色条纹连体衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-9",
      "item_id": "item-13",
      "kind": "idle",
      "message": "粉色花卉连体衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-10",
      "item_id": "item-14",
      "kind": "idle",
      "message": "黄色纯色袜子只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-11",
      "item_id": "item-15",
      "kind": "idle",
      "message": "白色花卉连衣裙只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-12",
      "item_id": "item-16",
      "kind": "idle",
      "message": "粉色纯色上衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-13",
      "item_id": "item-17",
      "kind": "idle",
      "message": "白色卡通裤子只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-14",
      "item_id": "item-18",
      "kind": "idle",
      "message": "米色卡通鞋子只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-15",
      "item_id": "item-19",
      "kind": "idle",
      "message": "棕色和白色卡通上衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-16",
      "item_id": "item-22",
      "kind": "idle",
      "message": "粉色纯色连衣裙只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-17",
      "item_id": "item-23",
      "kind": "idle",
      "message": "米色纯色连衣裙只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-18",
      "item_id": "item-24",
      "kind": "idle",
      "message": "黑色印花上衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-19",
      "item_id": "item-25",
      "kind": "idle",
      "message": "黑色卡通上衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-20",
      "item_id": "item-27",
      "kind": "idle",
      "message": "绿色条纹袜子只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-21",
      "item_id": "item-28",
      "kind": "idle",
      "message": "浅蓝色纯色连衣裙只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-22",
      "item_id": "item-29",
      "kind": "idle",
      "message": "白色纯色袜子只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-23",
      "item_id": "item-30",
      "kind": "idle",
      "message": "黑色纯色连体衣只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    },
    {
      "id": "rem-24",
      "item_id": "item-31",
      "kind": "idle",
      "message": "蓝色牛仔布裤子只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。",
      "created_at": "2026-07-19T16:13:32.657Z"
    }
  ],
  "shopping": [
    "建议购买100码的夏季连衣裙，宝宝即将进入更炎热的季节，轻薄透气的连衣裙会非常舒适",
    "考虑为宝宝准备100码的夏季短裤和T恤组合，方便活动且适合即将到来的 warmer 天气",
    "建议购买100码的运动鞋，宝宝活动量增大，舒适的鞋子对脚部发育很重要"
  ],
  "milestones": [
    {
      "date": "2023-09-19",
      "label": "第一次穿 73 码",
      "size_stage": "73"
    },
    {
      "date": "2024-01-05",
      "label": "第一次穿 80 码",
      "size_stage": "80"
    },
    {
      "date": "2024-02-29",
      "label": "第一次穿 90 码",
      "size_stage": "90"
    },
    {
      "date": "2026-03-31",
      "label": "第一次穿 100 码",
      "size_stage": "100"
    }
  ],
  "currentSize": "宝宝当前40个月，已经超出标准尺码表范围，但根据穿着记录，90码衣物仍在使用中，建议考虑购买更大尺码（如100码）的衣物"
};

/** 演示数据入口：直接复用固化结果的照片与日期 */
export const PRESET_DEMO_IMAGES: string[] = PRESET_RESULT.photos.map((p) => p.image_url);
export const PRESET_DEMO_TAKEN_ATS: string[] = PRESET_RESULT.photos.map((p) => p.taken_at);
