import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  getTagsByUserId, 
  createTag, 
  updateTag, 
  deleteTag,
  addTagToPerson,
  removeTagFromPerson,
  getPersonTags
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');

    if (personId) {
      // Buscar tags de uma pessoa específica
      const tags = await getPersonTags(personId);
      return NextResponse.json(tags);
    } else {
      // Buscar todas as tags do usuário
      const tags = await getTagsByUserId(session.user.id);
      return NextResponse.json(tags);
    }
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    // Se tiver personId, é para adicionar tag a pessoa
    if (data.personId && data.tagId) {
      const success = await addTagToPerson(data.personId, data.tagId);
      return NextResponse.json({ success });
    }
    
    // Senão, criar nova tag
    const tag = await createTag({
      user_id: parseInt(session.user.id),
      name: data.name,
      color: data.color || '#3B82F6',
      description: data.description
    });

    if (!tag) {
      return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 });
    }

    return NextResponse.json(tag);
  } catch (error: any) {
    if (error.message === 'Tag com este nome já existe') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Erro ao criar tag:', error);
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const success = await updateTag(data.id, data);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Erro ao atualizar tag:', error);
    return NextResponse.json({ error: 'Erro ao atualizar tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');
    const personId = searchParams.get('personId');

    if (personId && tagId) {
      // Remover tag de pessoa
      const success = await removeTagFromPerson(personId, parseInt(tagId));
      return NextResponse.json({ success });
    } else if (tagId) {
      // Deletar tag
      const success = await deleteTag(parseInt(tagId));
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}
