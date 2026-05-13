import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. 极其重要：开启静态导出模式，编译后会生成纯 HTML/CSS/JS 文件
  output: 'export',
  
  // 2. 极其重要：关闭图片优化，因为静态导出不支持 Next.js 默认的图片服务器
  images: {
    unoptimized: true,
  },
  
  // 3. 注意（如果遇到样式路径失效再配置）：
  // 如果你的 GitHub 仓库名字叫 "our-app"，那么编译后的访问路径是 username.github.io/our-app/
  // 这时需要解除下方两行的注释，把 "/our-app" 改成你的真实仓库名
  basePath: '/side-by-side',
};

export default nextConfig;
