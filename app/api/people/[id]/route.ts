import { NextRequest, NextResponse } from 'next/server'
const { executeQueryCM } = require('../../../../lib/db')

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Buscar pessoa específica
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    console.log('🔍 Buscando pessoa ID:', id)
    
    const people = await executeQueryCM(
      'SELECT * FROM people WHERE id = ?',
      [id]
    )
    
    if (people.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pessoa não encontrada'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: people[0]
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar pessoa:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// PUT - Atualizar pessoa
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const body = await request.json()
    console.log('✏️ Atualizando pessoa ID:', id, 'Nome:', body.name)
    
    // Montar query de update dinâmica
    const updateFields = []
    const updateValues = []
    
    // Lista de campos permitidos para update
    const allowedFields = [
      'name', 'nickname', 'birth_date', 'gender', 'context', 'proximity',
      'importance', 'trust_level', 'influence_level', 'occupation', 'company', 
      'position', 'professional_class', 'political_party', 'political_position',
      'is_candidate', 'is_elected', 'political_role', 'phone', 'mobile', 'email',
      'address', 'city', 'state', 'zip_code', 'facebook', 'instagram', 'twitter',
      'linkedin', 'whatsapp', 'notes', 'photo_url', 'last_contact', 
      'contact_frequency', 'neighborhood'
    ]
    
    // Adicionar campos que existem no body
    allowedFields.forEach(field => {
      if (body.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`)
        updateValues.push(body[field])
      }
    })
    
    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum campo válido para atualizar'
      }, { status: 400 })
    }
    
    // Adicionar updated_at e ID
    updateFields.push('updated_at = NOW()')
    updateValues.push(id)
    
    const query = `
      UPDATE people 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `
    
    const result = await executeQueryCM(query, updateValues)
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pessoa não encontrada ou nenhuma alteração feita'
      }, { status: 404 })
    }
    
    console.log(`✅ Pessoa ID ${id} atualizada com sucesso`)
    
    // Buscar dados atualizados
    const updatedPeople = await executeQueryCM(
      'SELECT * FROM people WHERE id = ?',
      [id]
    )
    
    return NextResponse.json({
      success: true,
      data: updatedPeople[0],
      message: 'Pessoa atualizada com sucesso'
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao atualizar pessoa:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Erro ao atualizar pessoa na database'
    }, { status: 500 })
  }
}

// DELETE - Deletar pessoa
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    console.log('🗑️ Deletando pessoa ID:', id)
    
    const result = await executeQueryCM(
      'DELETE FROM people WHERE id = ?',
      [id]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pessoa não encontrada'
      }, { status: 404 })
    }
    
    console.log(`✅ Pessoa ID ${id} deletada com sucesso`)
    
    return NextResponse.json({
      success: true,
      message: 'Pessoa deletada com sucesso'
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao deletar pessoa:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
