import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { 
  getPeopleByUserId, 
  createPerson, 
  updatePerson, 
  deletePerson,
  getPersonById,
  type Person 
} from '@/lib/db';

// GET - Lista todas as pessoas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o ID do usuário baseado no email da sessão
    const { getUserByEmail } = await import('@/lib/db');
    const user = await getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const people = await getPeopleByUserId(user.id);
    
    // Converter IDs para string para compatibilidade com o frontend
    const peopleWithStringIds = people.map(person => ({
      ...person,
      id: person.id.toString(),
      user_id: person.user_id.toString()
    }));
    
    return NextResponse.json(peopleWithStringIds);
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    return NextResponse.json({ error: 'Erro ao buscar pessoas' }, { status: 500 });
  }
}

// POST - Cria nova pessoa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Buscar o ID do usuário
    const { getUserByEmail } = await import('@/lib/db');
    const user = await getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Preparar dados para criação
    const personData: Partial<Person> = {
      ...body,
      user_id: user.id,
      // Garantir que campos booleanos sejam tratados corretamente
      is_candidate: body.is_candidate || false,
      is_elected: body.is_elected || false,
      // Valores padrão para campos numéricos
      importance: body.importance || 3,
      trust_level: body.trust_level || 3,
      influence_level: body.influence_level || 3,
    };

    const newPerson = await createPerson(personData);
    
    // Converter IDs para string
    const personWithStringId = {
      ...newPerson,
      id: newPerson.id.toString(),
      user_id: newPerson.user_id.toString()
    };
    
    return NextResponse.json(personWithStringId, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    return NextResponse.json({ error: 'Erro ao criar pessoa' }, { status: 500 });
  }
}

// PUT - Atualiza pessoa
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Converter ID de string para número
    const personId = parseInt(body.id);
    
    if (isNaN(personId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar se a pessoa existe e pertence ao usuário
    const { getUserByEmail } = await import('@/lib/db');
    const user = await getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const existingPerson = await getPersonById(personId);
    
    if (!existingPerson) {
      return NextResponse.json({ error: 'Pessoa não encontrada' }, { status: 404 });
    }
    
    if (existingPerson.user_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Preparar dados para atualização (removendo campos que não devem ser atualizados)
    const { id, user_id, created_at, updated_at, ...updateData } = body;
    
    // Atualizar pessoa
    const success = await updatePerson(personId, updateData);
    
    if (!success) {
      return NextResponse.json({ error: 'Erro ao atualizar pessoa' }, { status: 500 });
    }

    // Buscar pessoa atualizada
    const updatedPerson = await getPersonById(personId);
    
    if (!updatedPerson) {
      return NextResponse.json({ error: 'Erro ao buscar pessoa atualizada' }, { status: 500 });
    }

    // Converter IDs para string
    const personWithStringId = {
      ...updatedPerson,
      id: updatedPerson.id.toString(),
      user_id: updatedPerson.user_id.toString()
    };
    
    return NextResponse.json(personWithStringId);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pessoa' }, { status: 500 });
  }
}

// DELETE - Remove pessoa
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Converter ID de string para número
    const personId = parseInt(id);
    
    if (isNaN(personId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar se a pessoa existe e pertence ao usuário
    const { getUserByEmail } = await import('@/lib/db');
    const user = await getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const existingPerson = await getPersonById(personId);
    
    if (!existingPerson) {
      return NextResponse.json({ error: 'Pessoa não encontrada' }, { status: 404 });
    }
    
    if (existingPerson.user_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const success = await deletePerson(personId);
    
    if (!success) {
      return NextResponse.json({ error: 'Erro ao deletar pessoa' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    return NextResponse.json({ error: 'Erro ao deletar pessoa' }, { status: 500 });
  }
}
