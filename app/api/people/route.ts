import { NextRequest, NextResponse } from 'next/server'

// Import CommonJS correto
const { executeQueryCM, executeQueryMC } = require('../../../lib/db')

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando pessoas...')
    
    // Tenta buscar de community_mapper primeiro
    try {
      const people = await executeQueryCM('SELECT * FROM people LIMIT 10')
      return NextResponse.json({
        success: true,
        source: 'community_mapper',
        data: people,
        count: people.length
      })
    } catch (cmError) {
      console.log('⚠️ CM falhou, tentando MC...')
      
      // Se falhar, tenta mapa_comunidade
      const people = await executeQueryMC('SELECT * FROM people LIMIT 10')
      return NextResponse.json({
        success: true,
        source: 'mapa_comunidade',
        data: people,
        count: people.length
      })
    }
    
  } catch (error) {
    console.error('❌ Erro na API people:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Exemplo de inserção
    const result = await executeQueryCM(
      'INSERT INTO people (name, email) VALUES (?, ?)',
      [body.name, body.email]
    )
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar pessoa:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
