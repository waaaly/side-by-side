import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const basePath = process.env.NODE_ENV === 'production' ? '/side-by-side' : ''

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SideBySide',
    short_name: 'SideBySide',
    description: '属于我们的小世界',
    start_url: `${basePath}/`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF5E4',
    theme_color: '#FF8FA3',
    icons: [
      { src: `${basePath}/icons/icon-192x192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${basePath}/icons/icon-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${basePath}/icons/apple-icon.png`, sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  }
}
