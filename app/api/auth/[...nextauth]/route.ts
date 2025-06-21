import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        console.log('=== TENTATIVA DE LOGIN ===');
        console.log('Credenciais recebidas:', { 
          email: credentials?.email, 
          passwordLength: credentials?.password?.length 
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais faltando');
          return null
        }

        try {
          const user = await getUserByEmail(credentials.email)
          
          console.log('Usuário retornado do banco:', user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
          } : 'null');
          
          if (!user) {
            console.log('❌ Usuário não existe');
            return null
          }
          
          if (!user.password) {
            console.log('❌ Usuário sem senha');
            return null
          }

          console.log('Comparando senhas...');
          console.log('Senha fornecida:', credentials.password);
          console.log('Hash do banco:', user.password);
          
          const passwordMatch = await bcrypt.compare(credentials.password, user.password)
          
          console.log('Resultado da comparação:', passwordMatch);
          
          if (!passwordMatch) {
            console.log('❌ Senha não confere');
            return null
          }

          console.log('✅ Login bem sucedido!');
          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
          }
        } catch (error) {
          console.error('❌ Erro durante login:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  debug: true // Ativar modo debug
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
