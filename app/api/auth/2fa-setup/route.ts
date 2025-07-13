import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]/route'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
const { executeQueryCM } = require('../../../../lib/db')

// POST - Gerar QR Code para setup inicial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Gerar secret único para o usuário
    const secret = authenticator.generateSecret()
    
    // Nome do serviço (aparece no app)
    const serviceName = 'Mapa Comunidade'
    const accountName = session.user.email
    
    // Gerar URI para QR Code
    const otpUri = authenticator.keyuri(accountName, serviceName, secret)
    
    // Gerar QR Code como Data URL
    const qrCodeDataURL = await QRCode.toDataURL(otpUri)
    
    // Gerar códigos de backup (caso perca o celular)
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )
    
    // Salvar secret no banco (mas ainda não ativar)
    await executeQueryCM(`
      UPDATE users 
      SET two_factor_secret = ?, two_factor_backup_codes = ?
      WHERE email = ?
    `, [secret, JSON.stringify(backupCodes), session.user.email])
    
    console.log(`✅ 2FA setup gerado para: ${session.user.email}`)
    
    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      secret: secret, // Para exibir manualmente se necessário
      backupCodes: backupCodes,
      message: 'Escaneie o QR Code com Google Authenticator'
    })
    
  } catch (error: any) {
    console.error('❌ Erro no setup 2FA:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// PUT - Ativar 2FA após verificar código
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { code } = await request.json()
    
    if (!code || code.length !== 6) {
      return NextResponse.json({ 
        error: 'Código deve ter 6 dígitos' 
      }, { status: 400 })
    }

    // Buscar secret do usuário
    const [users] = await executeQueryCM(`
      SELECT two_factor_secret FROM users WHERE email = ?
    `, [session.user.email])
    
    if (!users[0]?.two_factor_secret) {
      return NextResponse.json({ 
        error: 'Setup 2FA não encontrado. Gere um novo QR Code.' 
      }, { status: 400 })
    }

    const secret = users[0].two_factor_secret
    
    // Verificar código inserido
    const isValid = authenticator.verify({
      token: code,
      secret: secret
    })
    
    if (!isValid) {
      return NextResponse.json({ 
        error: 'Código inválido. Tente novamente.' 
      }, { status: 400 })
    }
    
    // Ativar 2FA
    await executeQueryCM(`
      UPDATE users 
      SET two_factor_enabled = TRUE, updated_at = NOW()
      WHERE email = ?
    `, [session.user.email])
    
    console.log(`✅ 2FA ativado para: ${session.user.email}`)
    
    return NextResponse.json({
      success: true,
      message: '2FA ativado com sucesso! Sua conta está mais segura.'
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao ativar 2FA:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
