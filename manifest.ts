import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    // App 在桌面图标下显示的简短名称（建议4个字以内，防止被 iOS 截断）
    name: 'SideBySide',
    short_name: 'SideBySide',
    description: '面如霜下雪，吻如雪上霜',
    
    // 启动页面的根路径
    start_url: '/',
    
    // 隐藏 Safari 浏览器地址栏和底部工具栏的关键配置
    display: 'standalone', 
    
    // 强制应用以竖屏模式运行
    orientation: 'portrait',
    
    // 应用启动页的背景颜色（建议与你的 UI 主色调一致，这里采用温馨的浅燕麦色）
    background_color: '#fdfbf7',
    
    // iOS 状态栏与顶部下拉回弹区的背景颜色
    theme_color: '#fda4af', // Tailwind 中的 rose-300
    
    // 桌面图标配置（请将对应尺寸的图片放入 public/ 文件夹中）
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // 专为支持遮罩图标（如部分 Android 系统）准备的图标
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
