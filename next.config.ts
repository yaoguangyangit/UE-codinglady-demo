import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 局域网/热点演示：允许任意私网 IP 访问 dev 资源（HMR、字体等），
  // 否则手机连热点访问时会因跨源被拦，页面一直停在「加载中…」。
  allowedDevOrigins: ["192.168.*.*", "172.*.*.*", "10.*.*.*"],
  // 隐藏左下角 Next.js dev 指示器（N 按钮），避免演示时误触
  devIndicators: false,
};

export default nextConfig;
