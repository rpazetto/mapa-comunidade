// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'rodrigo',
  password: '884422',
  database: 'community_mapper'
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Conectar ao banco
          const connection = await mysql.createConnection(dbConfig)
          
          // Buscar usuário por email
          const [rows] = await connection.execute(
            'SELECT id, email, password_hash, name FROM users WHERE email = ?',
            [credentials.email]
          )
          
          await connection.end()
          
          const users = rows as any[]
          if (users.length === 0) {
            return null
          }
          
          const user = users[0]
          
          // Verificar senha
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!isValidPassword) {
            return null
          }
          
          // Retornar dados do usuário
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
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
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'mapa-comunidade-secret-key-2025'
}
