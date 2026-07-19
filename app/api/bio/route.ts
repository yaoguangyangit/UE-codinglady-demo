import { NextRequest, NextResponse } from "next/server";
import { generateStory } from "@/lib/zhipu";
import { buildStoryFacts } from "@/lib/story";
import type { PhotoItem } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = body?.item;
    if (!item || typeof item.name !== "string") {
      return NextResponse.json({ error: "缺少衣物数据" }, { status: 400 });
    }
    // 有照片与月龄时构建故事事实（节点/节日/地点/人物），没有也能生成
    let facts;
    const photos: PhotoItem[] = Array.isArray(body?.photos) ? body.photos : [];
    const monthAge = Number(body?.monthAge);
    if (photos.length && Number.isFinite(monthAge)) {
      const dates = photos.map((p) => p.taken_at).sort();
      const refDate = dates.length
        ? dates[dates.length - 1]
        : new Date().toISOString().slice(0, 10);
      facts = buildStoryFacts(item, photos, monthAge, refDate);
    }
    const story = await generateStory(item, facts);
    return NextResponse.json({ story });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "生成失败" },
      { status: 500 }
    );
  }
}
