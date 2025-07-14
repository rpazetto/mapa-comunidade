import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
const { executeQueryCM } = require('../../../../lib/db')

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const [users] = await executeQueryCM(
      'SELECT two_factor_enabled FROM users WHERE email = ?',
      [session.user.email]
    )

    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      enabled: !!users[0].two_factor_enabled
    })
    
  } catch (error: any) {
    console.error('Erro ao verificar 2FA:', error)
    return NextResponse.json({
      error: 'Erro ao verificar status 2FA'
    }, { status: 500 })
  }
}
