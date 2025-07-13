import { NextRequest, NextResponse } from 'next/server'
const { executeQueryCM } = require('../../../lib/db')

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando pessoas...')
    
    const people = await executeQueryCM('SELECT * FROM people ORDER BY name')
    
    return NextResponse.json({
      success: true,
      source: 'community_mapper',
      data: people,
      count: people.length
    })
    
  } catch (error: any) {
    console.error('❌ Erro na API people GET:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('➕ Criando pessoa:', body.name)
    
    // Validação básica
    if (!body.name || !body.context || !body.proximity) {
      return NextResponse.json({
        success: false,
        error: 'Nome, contexto e proximidade são obrigatórios'
      }, { status: 400 })
    }
    
    // Query simplificada com apenas campos essenciais
    const result = await executeQueryCM(`
      INSERT INTO people (
        user_id, name, nickname, context, proximity, importance, 
        trust_level, influence_level, occupation, company, phone, 
        mobile, email, city, state, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      body.user_id || 8,
      body.name,
      body.nickname || null,
      body.context,
      body.proximity,
      body.importance || 3,
      body.trust_level || 3,
      body.influence_level || 3,
      body.occupation || null,
      body.company || null,
      body.phone || null,
      body.mobile || null,
      body.email || null,
      body.city || 'Gramado',
      body.state || 'RS',
      body.notes || null
    ])
    
    console.log(`✅ Pessoa criada com ID: ${result.insertId}`)
    
    return NextResponse.json({
      success: true,
      data: { 
        id: result.insertId.toString(), 
        ...body 
      },
      message: 'Pessoa criada com sucesso'
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao criar pessoa:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Erro ao inserir pessoa na database'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Use /api/people/[id] para atualizar pessoa específica'
  }, { status: 405 })
}
