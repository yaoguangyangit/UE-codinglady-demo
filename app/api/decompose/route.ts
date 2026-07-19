import { NextRequest, NextResponse } from "next/server";
import { decomposePhoto } from "@/lib/zhipu";
import { mergeWardrobe } from "@/lib/merge";
import type { ScannedPhoto } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY_MS = 86400000;

/** 用户真实上传但缺拍摄日期时：均匀铺到最近约 3 个月 */
function fallbackDate(index: number, total: number): string {
  const spanDays = 90;
  const offset = Math.round(((total - 1 - index) / Math.max(total - 1, 1)) * spanDays);
  const d = new Date(Date.now() - offset * DAY_MS);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const images: string[] = Array.isArray(body?.images)
      ? body.images.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];
    const takenAts: string[] = Array.isArray(body?.takenAts) ? body.takenAts : [];
    const places: unknown[] = Array.isArray(body?.places) ? body.places : [];
    const peoples: unknown[] = Array.isArray(body?.peoples) ? body.peoples : [];
    const monthAgeRaw = Number(body?.monthAge);
    const monthAge =
      Number.isFinite(monthAgeRaw) && monthAgeRaw >= 0 && monthAgeRaw <= 36
        ? monthAgeRaw
        : 9;

    if (!images.length) {
      return NextResponse.json({ error: "缺少照片数据" }, { status: 400 });
    }

    const limited = images.slice(0, 15);
    const total = limited.length;
    const scanned: ScannedPhoto[] = [];

    // 逐张 GLM-4V 分解，并发 3；单张失败则跳过（结果页可手动补充）
    let cursor = 0;
    async function worker() {
      while (cursor < total) {
        const i = cursor++;
        const taken =
          typeof takenAts[i] === "string" && takenAts[i]
            ? takenAts[i].slice(0, 10)
            : fallbackDate(i, total);
        try {
          const decomposed = await decomposePhoto(limited[i]);
          scanned.push({
            id: `photo-${i + 1}`,
            image_url: limited[i],
            taken_at: taken,
            decomposed,
            ...(typeof places[i] === "string" && places[i]
              ? { place: places[i] as string }
              : {}),
            ...(typeof peoples[i] === "string" && peoples[i]
              ? { people: peoples[i] as string }
              : {}),
          });
        } catch {
          /* 这张没看清，跳过 */
        }
      }
    }
    await Promise.all([worker(), worker(), worker()]);

    const { photos, items } = mergeWardrobe(scanned, monthAge);
    return NextResponse.json({ photos, items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "分解失败" },
      { status: 500 }
    );
  }
}
