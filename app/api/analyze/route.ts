import { NextRequest, NextResponse } from "next/server";
import { analyzeWardrobe } from "@/lib/zhipu";
import type { AnalyzeInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const monthAgeRaw = Number(body?.monthAge);
    const input: AnalyzeInput = {
      monthAge:
        Number.isFinite(monthAgeRaw) && monthAgeRaw >= 0 && monthAgeRaw <= 36
          ? monthAgeRaw
          : 9,
      items: Array.isArray(body?.items) ? body.items : [],
      photos: Array.isArray(body?.photos) ? body.photos : [],
    };
    if (!input.items.length) {
      return NextResponse.json({ error: "缺少衣物数据" }, { status: 400 });
    }
    const result = await analyzeWardrobe(input);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "推演失败" },
      { status: 500 }
    );
  }
}
