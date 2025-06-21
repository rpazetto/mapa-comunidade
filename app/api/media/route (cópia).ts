import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Configurar o diretório de upload
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Garantir que o diretório existe
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// GET - Listar arquivos de uma pessoa
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');

    if (!personId) {
      return NextResponse.json({ error: 'Person ID required' }, { status: 400 });
    }

    // Diretório específico da pessoa
    const personDir = path.join(UPLOAD_DIR, personId);
    
    try {
      await fs.access(personDir);
      const files = await fs.readdir(personDir);
      
      // Ler metadados de cada arquivo
      const filesWithMetadata = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(personDir, filename);
          const stats = await fs.stat(filePath);
          
          // Tentar ler o arquivo de metadados
          let metadata = {
            title: filename,
            description: '',
            tags: [],
            uploadedAt: stats.birthtime
          };
          
          try {
            const metadataPath = path.join(personDir, `${filename}.json`);
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            metadata = { ...metadata, ...JSON.parse(metadataContent) };
          } catch {
            // Se não houver metadados, usar padrões
          }
          
          return {
            id: filename,
            filename,
            url: `/uploads/${personId}/${filename}`,
            size: stats.size,
            type: getFileType(filename),
            ...metadata
          };
        })
      );
      
      // Filtrar apenas arquivos (não metadados .json)
      const actualFiles = filesWithMetadata.filter(f => !f.filename.endsWith('.json'));
      
      return NextResponse.json(actualFiles);
    } catch {
      // Se o diretório não existir, retornar array vazio
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Upload de arquivo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const personId = formData.get('personId') as string;
    const title = formData.get('title') as string || file.name;
    const description = formData.get('description') as string || '';
    const tags = JSON.parse(formData.get('tags') as string || '[]');

    if (!file || !personId) {
      return NextResponse.json({ error: 'File and person ID required' }, { status: 400 });
    }

    // Garantir que o diretório existe
    await ensureUploadDir();
    
    // Criar diretório específico da pessoa
    const personDir = path.join(UPLOAD_DIR, personId);
    await fs.mkdir(personDir, { recursive: true });

    // Gerar nome único para o arquivo
    const fileExt = path.extname(file.name);
    const uniqueFilename = `${randomUUID()}${fileExt}`;
    const filePath = path.join(personDir, uniqueFilename);

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // Salvar metadados
    const metadata = {
      title,
      description,
      tags,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.user?.email
    };

    await fs.writeFile(
      path.join(personDir, `${uniqueFilename}.json`),
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({
      id: uniqueFilename,
      filename: uniqueFilename,
      url: `/uploads/${personId}/${uniqueFilename}`,
      size: file.size,
      type: getFileType(file.name),
      ...metadata
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Deletar arquivo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const fileId = searchParams.get('fileId');

    if (!personId || !fileId) {
      return NextResponse.json({ error: 'Person ID and file ID required' }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, personId, fileId);
    const metadataPath = path.join(UPLOAD_DIR, personId, `${fileId}.json`);

    // Deletar arquivo e metadados
    try {
      await fs.unlink(filePath);
      await fs.unlink(metadataPath).catch(() => {}); // Ignorar erro se não existir
      
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Atualizar metadados
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { personId, fileId, title, description, tags } = body;

    if (!personId || !fileId) {
      return NextResponse.json({ error: 'Person ID and file ID required' }, { status: 400 });
    }

    const metadataPath = path.join(UPLOAD_DIR, personId, `${fileId}.json`);

    // Ler metadados existentes
    let metadata = {};
    try {
      const existingData = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(existingData);
    } catch {
      // Se não existir, criar novo
    }

    // Atualizar metadados
    metadata = {
      ...metadata,
      title: title || metadata.title,
      description: description !== undefined ? description : metadata.description,
      tags: tags || metadata.tags || [],
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error('Error updating metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Função auxiliar para determinar o tipo de arquivo
function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const videoExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
  const documentExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (documentExts.includes(ext)) return 'document';
  return 'other';
}
