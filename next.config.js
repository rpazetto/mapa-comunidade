/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar erros de ESLint durante builds de produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
