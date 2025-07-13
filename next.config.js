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
  env: {
    // URLs das duas databases (Railway já configurou corretamente)
    DATABASE_URL_CM: process.env.DATABASE_URL_CM,
    DATABASE_URL_MC: process.env.DATABASE_URL_MC,
    
    // Variáveis MySQL individuais (backup/fallback)
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    
    // Variáveis do ambiente
    NODE_ENV: process.env.NODE_ENV,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    
    // NextAuth
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    
    // Porta da aplicação
    PORT: process.env.PORT,
  },
}

module.exports = nextConfig
