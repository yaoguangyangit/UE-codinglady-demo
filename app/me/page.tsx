"use client";

import { useState } from "react";
import Link from "next/link";

export default function MePage() {
  const [authed, setAuthed] = useState(false);

  return (
    <div className="space-y-5 animate-float-up">
      <div className="flex items-center gap-2">
        <Link href="/wardrobe" className="text-sm text-ink-soft">
          ‹ 返回衣橱
        </Link>
      </div>

      <section className="text-center pt-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-mint-soft to-macaron-blue-soft border border-white flex items-center justify-center text-4xl shadow-inner">
          {authed ? "👩" : "👤"}
        </div>
        <h1 className="font-display text-2xl text-ink mt-3">
          {authed ? "微信用户 · 已授权" : "登录拾光"}
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          {authed ? "衣橱已开启云端同步" : "微信小程序 · 一键授权即达"}
        </p>
      </section>

      {!authed ? (
        <button
          type="button"
          onClick={() => setAuthed(true)}
          className="w-full py-4 rounded-full bg-[#07C160] text-white font-medium shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <span className="text-lg">💬</span> 微信一键登录
        </button>
      ) : (
        <div className="card-dream rounded-3xl p-4 text-center">
          <p className="text-sm text-[#4e9b74]">✓ 授权成功</p>
          <p className="text-[11px] text-ink-soft mt-1">
            头像与昵称已同步 · 衣橱云端备份已开启
          </p>
        </div>
      )}

      <section className="card-dream rounded-3xl p-4">
        <p className="text-sm font-medium text-ink mb-2.5">登录后你可以</p>
        <ul className="space-y-2">
          {[
            "☁️ 衣橱云端备份，换手机也不丢",
            "👨‍👩‍👧 邀请家人共建：爸爸拍的照片也能进同一个衣橱",
            "🔔 尺码预警微信提醒，不错过「还能穿的最后三周」",
            "📦 搬家季一键导出物品清单",
          ].map((t) => (
            <li key={t} className="text-xs text-ink leading-relaxed">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-[10px] text-ink-soft/60">
        小程序版本开发中 · 登录仅作演示，不获取真实微信信息
      </p>
    </div>
  );
}
