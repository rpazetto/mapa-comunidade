/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remover swcMinify pois é o padrão no Next.js 15
  
  // Configuração para servir arquivos estáticos do diretório externo
  async headers() {
    return [
      {
        source: '/api/media/stream',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },

  // Se você tiver outras configurações, adicione aqui
  // Por exemplo:
  // images: {
  //   domains: ['example.com'],
  // },
}

export default nextConfig
