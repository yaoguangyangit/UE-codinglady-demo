import { redirect } from "next/navigation";

/** 衣柜首页已迁移到 /，旧链接重定向 */
export default function ClosetPage() {
  redirect("/");
}
