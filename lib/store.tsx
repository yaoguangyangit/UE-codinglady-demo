"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ClothingItem, Milestone, PhotoItem, Reminder } from "./types";

const STORAGE_KEY = "baobao_wardrobe_v2";

/** 宝宝档案（首个页面收集：头像/昵称/生日，月龄由生日反推） */
export interface BabyProfile {
  nickname: string;
  birthday: string; // YYYY-MM-DD
  avatar: string; // base64 data url（压缩小图）
}

/** 由生日反推月龄（0-48 封顶，与尺码表衔接） */
export function monthsSince(birthday: string): number {
  const b = new Date(`${birthday}T12:00:00`);
  if (isNaN(b.getTime())) return 9;
  const months = (Date.now() - b.getTime()) / (86400000 * 30.44);
  return Math.max(0, Math.min(48, Math.floor(months)));
}

/** 一次完整扫描 + 推演的结果 */
export interface ScanResult {
  photos: PhotoItem[];
  items: ClothingItem[];
  reminders: Reminder[];
  shopping: string[];
  milestones: Milestone[];
  currentSize: string;
}

interface StoreData {
  profile: BabyProfile | null; // 宝宝档案：头像/昵称/生日
  monthAge: number;
  images: string[]; // base64 data url
  takenAts: string[]; // 与 images 对齐的拍摄日期
  places: (string | undefined)[]; // 照片地点元数据（可选）
  peoples: (string | undefined)[]; // 照片人物元数据（可选）
  result: ScanResult | null;
}

interface StoreContextValue extends StoreData {
  ready: boolean;
  setProfile: (p: BabyProfile) => void;
  startScan: (
    monthAge: number,
    images: string[],
    takenAts: string[],
    places?: (string | undefined)[],
    peoples?: (string | undefined)[]
  ) => void;
  setResult: (r: ScanResult) => void;
  setItemStory: (id: string, story: string) => void;
  setItemDetail: (id: string, patch: Partial<ClothingItem>) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const EMPTY: StoreData = {
  profile: null,
  monthAge: 9,
  images: [],
  takenAts: [],
  places: [],
  peoples: [],
  result: null,
};

function load(): StoreData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as StoreData;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function persist(data: StoreData) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 真实照片过大触发配额时，丢弃原始图、保留结构化结果，保证刷新不翻车
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...data, images: [], takenAts: [], places: [], peoples: [] })
      );
    } catch {
      /* 实在存不下就算了 */
    }
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) persist(data);
  }, [data, ready]);

  const setProfile = useCallback((profile: BabyProfile) => {
    setData((d) => ({ ...d, profile }));
  }, []);

  const startScan = useCallback(
    (
      monthAge: number,
      images: string[],
      takenAts: string[],
      places: (string | undefined)[] = [],
      peoples: (string | undefined)[] = []
    ) => {
      setData((d) => ({ ...d, monthAge, images, takenAts, places, peoples, result: null }));
    },
    []
  );

  const setResult = useCallback((result: ScanResult) => {
    setData((d) => ({ ...d, result }));
  }, []);

  const setItemStory = useCallback((id: string, story: string) => {
    setData((d) =>
      d.result
        ? {
            ...d,
            result: {
              ...d.result,
              items: d.result.items.map((it) => (it.id === id ? { ...it, story } : it)),
            },
          }
        : d
    );
  }, []);

  const setItemDetail = useCallback((id: string, patch: Partial<ClothingItem>) => {
    setData((d) =>
      d.result
        ? {
            ...d,
            result: {
              ...d.result,
              items: d.result.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
            },
          }
        : d
    );
  }, []);

  const reset = useCallback(() => {
    setData(EMPTY);
    if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <StoreContext.Provider
      value={{ ...data, ready, setProfile, startScan, setResult, setItemStory, setItemDetail, reset }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore 必须在 StoreProvider 内使用");
  return ctx;
}
