import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';

// GET - Listar mídias de uma pessoa
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const personId = searchParams.get('personId');

  if (!personId) {
    return NextResponse.json({ error: 'Person ID required' }, { status: 400 });
  }

  try {
    // Buscar mídias
    const mediaItems = await query(`
      SELECT 
        pm.*,
        GROUP_CONCAT(DISTINCT mt.tag) as tags,
        GROUP_CONCAT(DISTINCT mp.participant_name) as participants
      FROM person_media pm
      LEFT JOIN media_tags mt ON pm.id = mt.media_id
      LEFT JOIN media_participants mp ON pm.id = mp.media_id
      WHERE pm.person_id = ? AND pm.user_id = ?
      GROUP BY pm.id
      ORDER BY pm.date DESC
    `, [personId, session.user.id]);

    // Processar resultados
    const processedItems = mediaItems.map((item: any) => ({
      id: item.id.toString(),
      type: item.type,
      title: item.title,
      description: item.description,
      file_url: item.file_url,
      file_size: item.file_size,
      duration: item.duration,
      date: item.date,
      location: item.location,
      is_private: item.is_private === 1,
      is_favorite: item.is_favorite === 1,
      transcript: item.transcript,
      notes: item.notes,
      tags: item.tags ? item.tags.split(',') : [],
      participants: item.participants ? item.participants.split(',') : []
    }));

    return NextResponse.json(processedItems);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST - Adicionar nova mídia
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      person_id,
      type,
      title,
      description,
      file_url,
      file_size,
      duration,
      date,
      location,
      is_private,
      is_favorite,
      transcript,
      notes,
      tags,
      participants
    } = body;

    // Inserir mídia
    const result = await query(`
      INSERT INTO person_media (
        person_id, user_id, type, title, description, file_url,
        file_size, duration, date, location, is_private, is_favorite,
        transcript, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      person_id, session.user.id, type, title, description, file_url,
      file_size, duration, date, location, is_private || false, is_favorite || false,
      transcript, notes
    ]);

    const mediaId = (result as any).insertId;

    // Inserir tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await query('INSERT INTO media_tags (media_id, tag) VALUES (?, ?)', [mediaId, tag]);
      }
    }

    // Inserir participantes
    if (participants && participants.length > 0) {
      for (const participant of participants) {
        await query('INSERT INTO media_participants (media_id, participant_name) VALUES (?, ?)', 
          [mediaId, participant]);
      }
    }

    return NextResponse.json({ id: mediaId, ...body });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}

// PUT - Atualizar mídia
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // Verificar se a mídia pertence ao usuário
    const existing = await query(
      'SELECT id FROM person_media WHERE id = ? AND user_id = ?',
      [id, session.user.id]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Atualizar mídia
    await query(`
      UPDATE person_media 
      SET title = ?, description = ?, is_private = ?, is_favorite = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `, [
      updateData.title,
      updateData.description,
      updateData.is_private || false,
      updateData.is_favorite || false,
      updateData.notes,
      id,
      session.user.id
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

// DELETE - Deletar mídia
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
  }

  try {
    await query(
      'DELETE FROM person_media WHERE id = ? AND user_id = ?',
      [id, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
