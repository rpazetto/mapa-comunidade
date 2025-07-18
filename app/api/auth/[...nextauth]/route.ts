import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import mysql from 'mysql2/promise'

// Configuração Railway MySQL
const dbConfig = {
  host: 'interchange.proxy.rlwy.net',
  port: 47165,
  user: 'root',
  password: 'tfsriTGGWosBoJrJCEyUCCjISxLiQzfA',
  database: 'community_mapper',
  ssl: { rejectUnauthorized: false }
}

// Função para buscar usuário por email
async function getUserByEmail(email: string) {
  try {
    console.log('🔍 Buscando usuário:', email)
    const connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT id, email, password_hash, name, two_factor_enabled, two_factor_secret, two_factor_backup_codes FROM users WHERE email = ?',
      [email]
    )
    
    await connection.end()
    
    const users = rows as any[]
    
    if (users.length === 0) {
      console.log('❌ Usuário não encontrado:', email)
      return null
    }
    
    console.log('✅ Usuário encontrado:', users[0].email)
    
    return {
      id: users[0].id,
      email: users[0].email,
      password: users[0].password_hash,
      name: users[0].name,
      twoFactorEnabled: users[0].two_factor_enabled,
      twoFactorSecret: users[0].two_factor_secret,
      backupCodes: users[0].two_factor_backup_codes
    }
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        twoFactorCode: { label: "Código 2FA (opcional)", type: "text" }
      },
      async authorize(credentials) {
        console.log('=== TENTATIVA DE LOGIN COM 2FA ===')
        console.log('Email:', credentials?.email)
        console.log('2FA Code fornecido:', credentials?.twoFactorCode ? 'Sim' : 'Não')

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais incompletas')
          return null
        }

        try {
          // Buscar usuário no Railway
          const user = await getUserByEmail(credentials.email)
          
          if (!user) {
            console.log('❌ Usuário não encontrado:', credentials.email)
            return null
          }
          
          if (!user.password) {
            console.log('❌ Usuário sem senha configurada')
            return null
          }

          // Verificar senha
          console.log('🔐 Verificando senha...')
          const passwordMatch = await bcrypt.compare(credentials.password, user.password)
          
          if (!passwordMatch) {
            console.log('❌ Senha incorreta')
            return null
          }

          console.log('✅ Senha correta!')

          // Verificar 2FA se estiver ativado
          if (user.twoFactorEnabled) {
            console.log('🔒 2FA está ativado, verificando código...')
            
            if (!credentials.twoFactorCode) {
              console.log('❌ Código 2FA obrigatório mas não fornecido')
              return null
            }

            const code = credentials.twoFactorCode.replace(/\s/g, '') // Remove espaços
            
            // Verificar código 2FA
            const isValidCode = authenticator.verify({
              token: code,
              secret: user.twoFactorSecret
            })

            if (!isValidCode) {
              // Tentar códigos de backup
              if (user.backupCodes) {
                const backupCodes = JSON.parse(user.backupCodes)
                if (backupCodes.includes(code.toUpperCase())) {
                  console.log('✅ Código de backup válido usado')
                  // TODO: Remover código de backup usado
                } else {
                  console.log('❌ Código 2FA e backup inválidos')
                  return null
                }
              } else {
                console.log('❌ Código 2FA inválido')
                return null
              }
            } else {
              console.log('✅ Código 2FA válido!')
            }
          } else {
            console.log('ℹ️ 2FA não está ativado para este usuário')
          }

          console.log('✅ Login autorizado com sucesso!')
          
          // Atualizar último login
          try {
            const connection = await mysql.createConnection(dbConfig)
            await connection.execute(
              'UPDATE users SET updated_at = NOW() WHERE id = ?',
              [user.id]
            )
            await connection.end()
            console.log('✅ Último login atualizado')
          } catch (error) {
            console.log('⚠️ Não foi possível atualizar último login:', error)
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || 'Usuário',
            twoFactorEnabled: user.twoFactorEnabled
          }
        } catch (error) {
          console.error('❌ Erro durante autenticação:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60, // 4 horas (mais restritivo com 2FA)
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login?error=CredentialsSignin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.twoFactorEnabled = (user as any).twoFactorEnabled
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        ;(session.user as any).twoFactorEnabled = token.twoFactorEnabled
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('🎉 Usuário logado com 2FA:', user.email)
    },
    async signOut({ session, token }) {
      console.log('👋 Usuário deslogado:', token?.email || 'desconhecido')
    },
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || 'mapa-comunidade-secret-2fa-2025',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
