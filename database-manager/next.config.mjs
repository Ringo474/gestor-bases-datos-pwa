/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para PWA
  experimental: {
    appDir: true,
  },
  // Configuración para generar archivos estáticos
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
