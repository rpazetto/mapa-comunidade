import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Diretório para salvar as fotos
const UPLOAD_DIR = join(process.cwd(), 'public/uploads/photos');

// Garantir que o diretório existe
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST - Upload de foto
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const personId = formData.get('personId') as string;

    if (!file || !personId) {
      return NextResponse.json(
        { error: 'Arquivo e ID da pessoa são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      );
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `person_${personId}_${timestamp}.${extension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Deletar foto anterior se existir
    try {
      const files = await import('fs').then(fs => fs.readdirSync(UPLOAD_DIR));
      const oldFile = files.find(f => f.startsWith(`person_${personId}_`));
      if (oldFile) {
        await unlink(join(UPLOAD_DIR, oldFile));
      }
    } catch (error) {
      // Ignorar erro se não encontrar arquivo anterior
      console.log('Nenhuma foto anterior encontrada');
    }

    // Salvar novo arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL pública da foto
    const photoUrl = `/uploads/photos/${fileName}`;

    return NextResponse.json({
      success: true,
      photoUrl,
      message: 'Foto carregada com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload da foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar foto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');

    if (!personId) {
      return NextResponse.json(
        { error: 'ID da pessoa é obrigatório' },
        { status: 400 }
      );
    }

    // Encontrar e deletar arquivo da foto
    try {
      const files = await import('fs').then(fs => fs.readdirSync(UPLOAD_DIR));
      const photoFile = files.find(f => f.startsWith(`person_${personId}_`));
      
      if (photoFile) {
        await unlink(join(UPLOAD_DIR, photoFile));
        return NextResponse.json({
          success: true,
          message: 'Foto deletada com sucesso'
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Nenhuma foto encontrada para deletar'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar arquivo' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro na deleção da foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Opcional: Listar fotos de uma pessoa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');

    if (!personId) {
      return NextResponse.json(
        { error: 'ID da pessoa é obrigatório' },
        { status: 400 }
      );
    }

    // Encontrar foto da pessoa
    try {
      const files = await import('fs').then(fs => fs.readdirSync(UPLOAD_DIR));
      const photoFile = files.find(f => f.startsWith(`person_${personId}_`));
      
      if (photoFile) {
        const photoUrl = `/uploads/photos/${photoFile}`;
        return NextResponse.json({
          success: true,
          photoUrl
        });
      } else {
        return NextResponse.json({
          success: true,
          photoUrl: null
        });
      }
    } catch (error) {
      console.error('Erro ao buscar foto:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar arquivo' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro na busca da foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
