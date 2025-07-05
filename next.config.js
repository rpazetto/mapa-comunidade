/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar erros de ESLint durante builds de produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Se necessário, também ignorar erros de TypeScript
    // ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
