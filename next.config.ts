import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.100.114','192.168.56.1'],
  devIndicators: false,
  // 1. 极其重要：开启静态导出模式，编译后会生成纯 HTML/CSS/JS 文件
  output: 'export',
  
  // 2. 极其重要：关闭图片优化，因为静态导出不支持 Next.js 默认的图片服务器
  images: {
    unoptimized: true,
  },
  
  // 3. GitHub Pages 部署时的路径（仅构建时生效，dev 模式下不启用）
  basePath: process.env.NODE_ENV === 'production' ? '/side-by-side' : undefined,
};

export default nextConfig;
