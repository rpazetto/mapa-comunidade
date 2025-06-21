import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { 
  getPersonRelationships,
  getAllUserRelationships,
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getUserByEmail 
} from '@/lib/db';

// GET - Buscar relacionamentos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    
    // Se tiver personId, busca relacionamentos específicos da pessoa
    if (personId) {
      const relationships = await getPersonRelationships(personId);
      return NextResponse.json(relationships);
    }
    
    // Senão, busca todos os relacionamentos do usuário
    const allRelationships = await getAllUserRelationships(user.id);
    return NextResponse.json(allRelationships);
    
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar relacionamento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { person_a_id, person_b_id, relationship_type, strength, notes } = body;
    
    // Validação
    if (!person_a_id || !person_b_id || !relationship_type) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: person_a_id, person_b_id, relationship_type' 
      }, { status: 400 });
    }
    
    if (person_a_id === person_b_id) {
      return NextResponse.json({ 
        error: 'Uma pessoa não pode ter relacionamento consigo mesma' 
      }, { status: 400 });
    }
    
    try {
      await createRelationship({
        person_a_id: parseInt(person_a_id),
        person_b_id: parseInt(person_b_id),
        relationship_type,
        strength: strength || 3,
        notes
      });
      
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.message.includes('já existe')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating relationship:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Atualizar relacionamento
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await updateRelationship(parseInt(id), updates);
    
    if (!success) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating relationship:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Deletar relacionamento
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await deleteRelationship(parseInt(id));
    
    if (!success) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
