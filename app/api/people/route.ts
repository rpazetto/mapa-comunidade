import { NextRequest, NextResponse } from 'next/server'
const { executeQueryCM } = require('../../../lib/db')

// GET - Listar pessoas (já funcionando)
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

// POST - Criar pessoa nova
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
    
    // Inserção no banco
    const result = await executeQueryCM(`
      INSERT INTO people (
        user_id, name, nickname, birth_date, gender, context, proximity,
        importance, trust_level, influence_level, occupation, company, position,
        professional_class, political_party, political_position, is_candidate, is_elected,
        political_role, phone, mobile, email, address, city, state, zip_code,
        facebook, instagram, twitter, linkedin, whatsapp, notes, photo_url,
        last_contact, contact_frequency, neighborhood, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      body.user_id || 8, // ID do usuário logado
      body.name,
      body.nickname || null,
      body.birth_date || null,
      body.gender || 'N',
      body.context,
      body.proximity,
      body.importance || 3,
      body.trust_level || 3,
      body.influence_level || 3,
      body.occupation || null,
      body.company || null,
      body.position || null,
      body.professional_class || null,
      body.political_party || null,
      body.political_position || null,
      body.is_candidate || 0,
      body.is_elected || 0,
      body.political_role || null,
      body.phone || null,
      body.mobile || null,
      body.email || null,
      body.address || null,
      body.city || null,
      body.state || null,
      body.zip_code || null,
      body.facebook || null,
      body.instagram || null,
      body.twitter || null,
      body.linkedin || null,
      body.whatsapp || null,
      body.notes || null,
      body.photo_url || null,
      body.last_contact || null,
      body.contact_frequency || null,
      body.neighborhood || null
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

// PUT - Atualizar pessoa (será criado em arquivo separado)
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Use /api/people/[id] para atualizar pessoa específica'
  }, { status: 405 })
}
