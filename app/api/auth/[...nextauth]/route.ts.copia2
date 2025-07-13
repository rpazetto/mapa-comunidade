import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'

// Configuração Railway MySQL (CORRIGIDA)
const dbConfig = {
  host: 'interchange.proxy.rlwy.net',
  port: 47165,
  user: 'root',
  password: 'tfsriTGGWosBoJrJCEyUCCjISxLiQzfA',
  database: 'community_mapper',
  ssl: { rejectUnauthorized: false }
}

// Função para buscar usuário por email (CORRIGIDA)
async function getUserByEmail(email: string) {
  try {
    console.log('🔍 Buscando usuário:', email)
    const connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?',
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
      password: users[0].password_hash, // Campo correto!
      name: users[0].name
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
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        console.log('=== TENTATIVA DE LOGIN (Railway) ===')
        console.log('Email:', credentials?.email)
        console.log('Senha fornecida:', credentials?.password ? 'Sim' : 'Não')

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
          
          console.log('✅ Usuário encontrado:', {
            id: user.id,
            email: user.email,
            name: user.name
          })
          
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
    maxAge: 24 * 60 * 60, // 24 horas
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
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('🎉 Usuário logado:', user.email)
    },
    async signOut({ session, token }) {
      console.log('👋 Usuário deslogado:', token?.email || 'desconhecido')
    },
  },
  debug: true, // Ativar debug sempre
  secret: process.env.NEXTAUTH_SECRET || 'mapa-comunidade-secret-railway-2025',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
