import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getServerSession } from 'next-auth/next';

// Configuração da conexão MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'community_mapper',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criar pool de conexões
let pool: mysql.Pool;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Função para obter user_id da sessão
const getUserId = async (request: NextRequest): Promise<number> => {
  // Para desenvolvimento, usar user_id fixo
  // Em produção, você deve implementar autenticação adequada
  const session = await getServerSession();
  
  // Por enquanto, retornar user_id = 1 (você pode ajustar conforme sua autenticação)
  return 1;
};

// GET - Listar todas as pessoas do usuário
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const userId = await getUserId(request);
    
    const [rows] = await pool.execute(`
      SELECT 
        id,
        user_id,
        name,
        nickname,
        birth_date,
        gender,
        context,
        proximity,
        importance,
        trust_level,
        influence_level,
        occupation,
        company,
        position,
        professional_class,
        education_level,
        income_range,
        political_party,
        political_position,
        political_role,
        is_candidate,
        is_elected,
        phone,
        mobile,
        email,
        address,
        city,
        state,
        zip_code,
        facebook,
        instagram,
        twitter,
        linkedin,
        whatsapp,
        notes,
        photo_url,
        last_contact,
        contact_frequency,
        neighborhood,
        created_at,
        updated_at
      FROM people 
      WHERE user_id = ?
      ORDER BY name ASC
    `, [userId]);

    return NextResponse.json({
      success: true,
      people: rows
    });

  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// POST - Adicionar nova pessoa
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const data = await request.json();
    const userId = await getUserId(request);

    // Validar campos obrigatórios
    if (!data.name || !data.context || !data.proximity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nome, contexto e proximidade são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Inserir pessoa no banco
    const [result] = await pool.execute(`
      INSERT INTO people (
        user_id, name, nickname, birth_date, gender, context, proximity,
        importance, trust_level, influence_level, occupation, company, position,
        professional_class, education_level, income_range, political_party, 
        political_position, political_role, is_candidate, is_elected, phone, 
        mobile, email, address, city, state, zip_code, facebook, instagram, 
        twitter, linkedin, whatsapp, notes, photo_url, last_contact, 
        contact_frequency, neighborhood, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `, [
      userId,
      data.name,
      data.nickname,
      data.birth_date,
      data.gender || 'N',
      data.context,
      data.proximity,
      data.importance || 3,
      data.trust_level || 3,
      data.influence_level || 3,
      data.occupation,
      data.company,
      data.position,
      data.professional_class,
      data.education_level,
      data.income_range,
      data.political_party,
      data.political_position,
      data.political_role,
      Boolean(data.is_candidate),
      Boolean(data.is_elected),
      data.phone,
      data.mobile,
      data.email,
      data.address,
      data.city || 'Gramado',
      data.state || 'RS',
      data.zip_code,
      data.facebook,
      data.instagram,
      data.twitter,
      data.linkedin,
      data.whatsapp,
      data.notes,
      data.photo_url,
      data.last_contact,
      data.contact_frequency,
      data.neighborhood
    ]);

    const insertResult = result as mysql.ResultSetHeader;

    return NextResponse.json({
      success: true,
      id: insertResult.insertId,
      message: 'Pessoa adicionada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao adicionar pessoa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar pessoa existente
export async function PUT(request: NextRequest) {
  try {
    const pool = getPool();
    const data = await request.json();
    const userId = await getUserId(request);

    // Validar ID
    if (!data.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID da pessoa é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    if (!data.name || !data.context || !data.proximity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nome, contexto e proximidade são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Atualizar pessoa no banco (apenas se pertencer ao usuário)
    const [result] = await pool.execute(`
      UPDATE people SET
        name = ?, nickname = ?, birth_date = ?, gender = ?, context = ?, proximity = ?,
        importance = ?, trust_level = ?, influence_level = ?, occupation = ?, company = ?, 
        position = ?, professional_class = ?, education_level = ?, income_range = ?,
        political_party = ?, political_position = ?, political_role = ?, is_candidate = ?, 
        is_elected = ?, phone = ?, mobile = ?, email = ?, address = ?, city = ?, state = ?, 
        zip_code = ?, facebook = ?, instagram = ?, twitter = ?, linkedin = ?, whatsapp = ?, 
        notes = ?, photo_url = ?, last_contact = ?, contact_frequency = ?, neighborhood = ?,
        updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [
      data.name,
      data.nickname,
      data.birth_date,
      data.gender || 'N',
      data.context,
      data.proximity,
      data.importance || 3,
      data.trust_level || 3,
      data.influence_level || 3,
      data.occupation,
      data.company,
      data.position,
      data.professional_class,
      data.education_level,
      data.income_range,
      data.political_party,
      data.political_position,
      data.political_role,
      Boolean(data.is_candidate),
      Boolean(data.is_elected),
      data.phone,
      data.mobile,
      data.email,
      data.address,
      data.city || 'Gramado',
      data.state || 'RS',
      data.zip_code,
      data.facebook,
      data.instagram,
      data.twitter,
      data.linkedin,
      data.whatsapp,
      data.notes,
      data.photo_url,
      data.last_contact,
      data.contact_frequency,
      data.neighborhood,
      data.id,
      userId
    ]);

    const updateResult = result as mysql.ResultSetHeader;

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Pessoa não encontrada ou não autorizada' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pessoa atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Deletar pessoa
export async function DELETE(request: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = await getUserId(request);

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID da pessoa é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Deletar pessoa do banco (apenas se pertencer ao usuário)
    const [result] = await pool.execute(
      'DELETE FROM people WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const deleteResult = result as mysql.ResultSetHeader;

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Pessoa não encontrada ou não autorizada' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pessoa deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
