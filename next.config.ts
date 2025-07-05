/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar erros de ESLint durante o build de produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build (se necessário)
    // ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
