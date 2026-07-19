import "server-only";
import type {
  AnalyzeInput,
  AnalyzeResult,
  ClothingItem,
  DecomposeResult,
  Milestone,
  Reminder,
} from "./types";
import { buildMilestones, nextSize, sizeForMonths } from "./merge";
import { buildStoryFacts, type StoryFacts } from "./story";
import { findDemoPhoto } from "./demo";

const ZHIPU_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// 模型可经环境变量覆盖，默认使用 plus 系列
const VISION_MODEL = process.env.ZHIPU_VISION_MODEL || "glm-4v-plus";
const TEXT_MODEL = process.env.ZHIPU_TEXT_MODEL || "glm-4-plus";

function hasKey() {
  return Boolean(process.env.ZHIPU_API_KEY);
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

async function chat(
  messages: ChatMessage[],
  model: string,
  jsonMode = false
): Promise<string> {
  const apiKey = process.env.ZHIPU_API_KEY!;
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.8,
    top_p: 0.9,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }
  const res = await fetch(ZHIPU_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`智谱 API ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** 从 LLM 输出里抠出 JSON（兼容被包裹在 ```json 里的情况） */
function extractJSON<T>(raw: string): T {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  return JSON.parse(s) as T;
}

// ============ ① 宝宝穿搭分解（GLM-4V）============
export async function decomposePhoto(imageBase64: string): Promise<DecomposeResult> {
  // 演示用的 SVG 简笔画 / 无 Key → 走 mock 固化结果（GLM-4V 不支持 SVG 格式）
  if (!hasKey() || imageBase64.startsWith("data:image/svg")) {
    return mockDecompose(imageBase64);
  }

  const url = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const prompt = `你是宝宝衣物分析师。这是一张宝宝照片。
请分解宝宝身上的每件衣物，只返回 JSON（不要多余文字）：
{
  "items": [
    {"type": "连体衣/哈衣/包屁衣/上衣/裤子/外套/帽子/袜子/配饰",
     "color": "主要颜色", "pattern": "图案（条纹/印花/纯色/卡通）",
     "desc": "一句话描述"}
  ],
  "season_hint": "推测季节（春/夏/秋/冬）"
}
注意：只看衣物，不分析宝宝面部与背景。看不清的衣物省略。`;

  try {
    const raw = await chat(
      [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url } },
          ],
        },
      ],
      VISION_MODEL,
      true
    );
    const r = extractJSON<DecomposeResult>(raw);
    if (!r || !Array.isArray(r.items)) return mockDecompose(imageBase64);
    const items = r.items
      .filter((i) => i && i.type && i.color)
      .map((i) => ({
        type: String(i.type),
        color: String(i.color),
        pattern: String(i.pattern || "纯色"),
        desc: String(i.desc || `${i.color}${i.type}`),
      }));
    if (!items.length) return mockDecompose(imageBase64);
    return { items, season_hint: String(r.season_hint || "") };
  } catch {
    return mockDecompose(imageBase64);
  }
}

// ============ ③ 尺码推演 + 提醒（GLM-4）============
interface GlmAnalyzeShape {
  current_size?: string;
  alerts?: { item?: string; message?: string }[];
  shopping?: string[];
}

/** 参考日期：最近一张照片的拍摄日（保证演示结果确定性） */
function refDateOf(input: AnalyzeInput): string {
  const dates = input.photos.map((p) => p.taken_at).sort();
  return dates.length ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10);
}

export async function analyzeWardrobe(input: AnalyzeInput): Promise<AnalyzeResult> {
  const refDate = refDateOf(input);
  const factsList = input.items.map((it) =>
    buildStoryFacts(it, input.photos, input.monthAge, refDate)
  );
  // "它的故事"：每件衣物默认生成（无 key 直接全 mock）
  const stories = await generateAllStories(input, factsList);

  if (!hasKey()) return mockAnalyze(input, factsList, stories);

  const timeline = input.items.map((it) => ({
    名称: it.name,
    推断尺码: it.size_stage,
    首次穿着日期: it.first_worn_at,
    末次穿着日期: it.last_worn_at,
    出现次数: it.wear_count,
  }));

  const prompt = `你是宝宝衣橱顾问。宝宝当前月龄：${input.monthAge} 个月。
衣物穿着时间线：${JSON.stringify(timeline)}
标准尺码月龄表：52≈0-1月 / 59≈1-3月 / 66≈3-6月 / 73≈6-9月 / 80≈9-12月 / 90≈12-24月
请输出 JSON：
1. current_size: 宝宝当前尺码阶段判断
2. alerts: [{item, message}] 每件临近退役的衣物"预计还能穿 X 周"的温柔提醒
3. shopping: 换季采购建议（3 条以内，具体尺码+品类）
语气：温柔、像有经验的朋友，不制造焦虑。`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], TEXT_MODEL, true);
    const r = extractJSON<GlmAnalyzeShape>(raw);
    const now = new Date().toISOString();
    const reminders: Reminder[] = [];
    let n = 0;
    for (const a of r.alerts || []) {
      if (!a?.message) continue;
      const target = input.items.find(
        (it) => a.item && (a.item.includes(it.name) || it.name.includes(a.item))
      );
      reminders.push({
        id: `rem-${++n}`,
        item_id: target?.id ?? null,
        kind: "size_alert",
        message: a.message,
        created_at: now,
      });
    }
    // 闲置清单由归并数据直接产出（拒绝也是数据，不依赖 LLM）
    reminders.push(...idleReminders(input.items, n));
    const milestones: Milestone[] = buildMilestones(input.items);
    return {
      current_size: String(r.current_size || sizeForMonths(input.monthAge)),
      reminders,
      shopping: (r.shopping || []).slice(0, 3).map(String),
      milestones,
      stories,
    };
  } catch {
    return mockAnalyze(input, factsList, stories);
  }
}

// ============ ④ 它的故事（GLM-4，批量 + 单件）============

/** 批量：一次 GLM 调用为所有衣物生成故事；解析失败逐件回落 mock */
async function generateAllStories(
  input: AnalyzeInput,
  factsList: StoryFacts[]
): Promise<Record<string, string>> {
  const fallback: Record<string, string> = {};
  input.items.forEach((it, i) => {
    fallback[it.id] = mockStory(it, factsList[i]);
  });
  if (!hasKey()) return fallback;

  const factsPayload = factsList.map((f) => ({
    名称: f.name,
    描述: f.desc,
    首次穿着: f.first_worn_at,
    末次穿着: f.last_worn_at,
    穿着次数: f.wear_count,
    第一次穿时宝宝月龄: f.age_at_first,
    命中成长节点: f.node,
    纪念照片日期: f.best_date,
    命中节日节气: f.best_festival,
    照片地点: f.place,
    照片人物: f.people,
    是否兜底款: f.is_staple,
  }));

  const prompt = `你是宝宝衣橱的温柔记录者。宝宝当前月龄：${input.monthAge} 个月。
请为每件衣物写一句"它的故事"：20-40 字，感性但具体，像"2026年夏至，和爸爸妈妈一起在西湖穿的。"——有时间、有场景、有纪念意义，避免空洞煽情。
规则：地点/人物来自照片元数据，没有就不提，严禁编造具体地名；命中成长节点（满月/百天/半岁/周岁）要强调；兜底款写出高出镜率的日常感；只穿过 1 次的，用"还没来得及出门"的口吻。
衣物事实：${JSON.stringify(factsPayload)}
只返回 JSON（不要多余文字）：{"stories": [{"item": "衣物名称", "story": "..."}]}`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], TEXT_MODEL, true);
    const r = extractJSON<{ stories?: { item?: string; story?: string }[] }>(raw);
    const out = { ...fallback };
    for (const s of r.stories || []) {
      if (!s?.item || !s.story) continue;
      const target = input.items.find(
        (it) => s.item!.includes(it.name) || it.name.includes(s.item!)
      );
      if (target) out[target.id] = s.story.trim();
    }
    return out;
  } catch {
    return fallback;
  }
}

/** 单件：详情页"让 AI 换一句"入口（/api/bio） */
export async function generateStory(
  item: ClothingItem,
  facts?: StoryFacts
): Promise<string> {
  if (!hasKey()) return mockStory(item, facts);

  const meta = [
    facts?.node ? `其中 ${facts.node_date} 命中${facts.node}。` : "",
    facts?.best_festival ? `拍摄当天是${facts.best_festival}。` : "",
    facts?.place ? `拍摄地点：${facts.place}。` : "",
    facts?.people ? `同行人物：${facts.people}。` : "",
  ].join("");

  const prompt = `这件${item.color}${item.pattern}${item.type}（${item.name}），陪伴宝宝从${item.first_worn_at}到${item.last_worn_at}，共出现${item.wear_count}次。${meta}
请为它写一句"它的故事"：20-40 字，感性但具体，有时间、有场景、有纪念意义，避免空洞煽情。地点人物没有就不提，严禁编造。
只返回这句话本身，不要引号，不要多余文字。`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], TEXT_MODEL);
    const story = raw.trim().replace(/^[“"']|[”"']$/g, "").split("\n")[0].trim();
    return story || mockStory(item, facts);
  } catch {
    return mockStory(item, facts);
  }
}

// ============ Mock 兜底（无 API Key 或调用失败时全流程可演示）============

/** 无 key 时：演示照片命中固化结果；其他图片按内容哈希给出稳定结果 */
function mockDecompose(imageBase64: string): DecomposeResult {
  const hit = findDemoPhoto(imageBase64);
  if (hit) return hit.expected;

  const pool: DecomposeResult[] = [
    { items: [{ type: "连体衣", color: "粉色", pattern: "印花", desc: "粉色印花连体衣" }], season_hint: "春" },
    { items: [{ type: "哈衣", color: "鹅黄", pattern: "卡通", desc: "鹅黄卡通哈衣" }], season_hint: "夏" },
    { items: [{ type: "包屁衣", color: "米白", pattern: "纯色", desc: "米白纯棉包屁衣" }], season_hint: "夏" },
    { items: [{ type: "上衣", color: "浅蓝", pattern: "条纹", desc: "浅蓝条纹小上衣" }, { type: "裤子", color: "米白", pattern: "纯色", desc: "米白休闲裤" }], season_hint: "秋" },
  ];
  let h = 0;
  for (let i = 0; i < Math.min(imageBase64.length, 2000); i++) {
    h = (h * 31 + imageBase64.charCodeAt(i)) >>> 0;
  }
  return pool[h % pool.length];
}

function idleReminders(items: ClothingItem[], startIndex: number): Reminder[] {
  const now = new Date().toISOString();
  let n = startIndex;
  // 只提醒"闲置"状态的衣物——满月服这类只穿一次但已退役的纪念衣物不在其列
  return items
    .filter((it) => it.status === "idle")
    .map((it) => ({
      id: `rem-${++n}`,
      item_id: it.id,
      kind: "idle" as const,
      message: `${it.name}只见过一次——吊牌可能还没拆，这周给宝宝一个上身的机会吧。`,
      created_at: now,
    }));
}

function mockAnalyze(
  input: AnalyzeInput,
  _factsList: StoryFacts[],
  stories: Record<string, string>
): AnalyzeResult {
  const now = new Date().toISOString();
  const current = sizeForMonths(input.monthAge);
  const next = nextSize(current);

  const reminders: Reminder[] = [];
  let n = 0;
  for (const it of input.items) {
    if (it.status === "retiring") {
      reminders.push({
        id: `rem-${++n}`,
        item_id: it.id,
        kind: "size_alert",
        message: `${it.name}（${it.size_stage} 码）进入倒计时啦——按现在的长速，预计还能陪宝宝约 3 周，且穿且珍惜。`,
        created_at: now,
      });
    }
  }
  reminders.push(...idleReminders(input.items, n));

  return {
    current_size: current,
    reminders,
    shopping: [
      `${current} 码的换季连体衣 2~3 件（当季正合身，别多囤）`,
      `${next} 码的哈衣、包屁衣可以开始看了，宝宝长得比想象快`,
      "一顶软檐遮阳帽 + 一件薄外套，出门遛弯刚刚好",
    ],
    milestones: buildMilestones(input.items),
    stories,
  };
}

/** "它的故事"固化文案（20-40 字，感性但具体：有时间、有场景、有纪念意义） */
const STORY_TABLE: Record<string, string> = {
  "连体衣|红色|刺绣": "满月那天穿着它，拍下了人生第一张全家福。",
  "哈衣|蓝白|条纹": "半岁纪念照里穿的是它，春天出镜最多的兜底款。",
  "帽子|米色|卡通": "早春出门的两只小耳朵，陪宝宝迎了第一场春风。",
  "连体衣|奶黄|印花": "2026年夏至，和爸爸妈妈一起在西湖穿的。",
  "哈衣|灰色|卡通": "第一个六一儿童节，它陪宝宝在家滚了一下午。",
  "包屁衣|薄荷绿|纯色": "还没来得及出门的它，吊牌在等一个太阳好的日子。",
  "外套|牛油果绿|纯色": "提前买好的小外套，还没等到宝宝穿上它的那天。",
  "裤子|天蓝|纯色": "七月新上身的背带裤，装着宝宝刚学会的扶站。",
};

function mockStory(item: ClothingItem, facts?: StoryFacts): string {
  const key = `${item.type}|${item.color}|${item.pattern}`;
  if (STORY_TABLE[key]) return STORY_TABLE[key];
  // 模板兜底：只用 facts 里真实存在的地点/人物/节点，绝不编造
  if (facts?.place) {
    return `${facts.best_date}${facts.best_festival ?? ""}，和${facts.people ?? "家人"}在${facts.place}穿的。`;
  }
  if (facts?.node) {
    return `${facts.node}那天穿上它，留下了值得记住的一张照片。`;
  }
  if (item.wear_count >= 3) {
    return `从${item.first_worn_at}穿到${item.last_worn_at}，出镜 ${item.wear_count} 次的兜底款。`;
  }
  return `从${item.first_worn_at}到${item.last_worn_at}，它陪宝宝留下了${item.wear_count}次笑脸。`;
}
