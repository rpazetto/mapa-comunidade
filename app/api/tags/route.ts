import { NextRequest, NextResponse } from 'next/server'
const { executeQueryCM } = require('../../../lib/db')

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando tags...')
    
    // Verificar se tabela tags existe
    const tags = await executeQueryCM('SELECT * FROM tags ORDER BY name')
    
    return NextResponse.json({
      success: true,
      data: tags,
      count: tags.length
    })
    
  } catch (error: any) {
    console.error('❌ Erro na API tags:', error.message)
    
    // Se tabela não existe, retornar array vazio
    if (error.message.includes("doesn't exist")) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Tabela tags não existe'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('➕ Criando tag:', body.name)
    
    const result = await executeQueryCM(`
      INSERT INTO tags (name, color, description, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
    `, [
      body.name,
      body.color || '#3B82F6',
      body.description || null
    ])
    
    return NextResponse.json({
      success: true,
      data: { id: result.insertId, ...body }
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao criar tag:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
