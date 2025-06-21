import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import { writeFile, unlink } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

// Configuração do diretório de uploads externo
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || '/public/uploads'

// Função para garantir que o diretório existe
async function ensureUploadDir(personId: string) {
  const uploadDir = path.join(UPLOAD_BASE_DIR, personId)
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }
  return uploadDir
}

// GET - Lista arquivos de uma pessoa
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const personId = searchParams.get('personId')

  if (!personId) {
    return NextResponse.json({ error: 'Person ID required' }, { status: 400 })
  }

  try {
    const uploadDir = path.join(UPLOAD_BASE_DIR, personId)
    
    try {
      await fs.access(uploadDir)
    } catch {
      return NextResponse.json({ files: [] })
    }

    const files = await fs.readdir(uploadDir)
    const mediaFiles = []

    for (const file of files) {
      if (file.endsWith('.json')) continue
      
      const filePath = path.join(uploadDir, file)
      const stats = await fs.stat(filePath)
      
      // Ler metadados
      let metadata = {
        title: file,
        description: '',
        tags: []
      }
      
      try {
        const metadataPath = path.join(uploadDir, `${file}.json`)
        const metadataContent = await fs.readFile(metadataPath, 'utf-8')
        metadata = { ...metadata, ...JSON.parse(metadataContent) }
      } catch {
        // Se não houver metadados, usar padrões
      }

      // Determinar tipo MIME
      const ext = path.extname(file).toLowerCase()
      let mimeType = 'application/octet-stream'
      
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
      
      if (mimeTypes[ext]) {
        mimeType = mimeTypes[ext]
      }

      mediaFiles.push({
        id: file,
        name: file,
        // URL para acessar via API de streaming
        url: `/api/media/stream?personId=${personId}&file=${encodeURIComponent(file)}`,
        size: stats.size,
        type: mimeType,
        uploadedAt: stats.birthtime.toISOString(),
        ...metadata
      })
    }

    return NextResponse.json({ files: mediaFiles })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}

// POST - Upload de arquivo
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const personId = formData.get('personId') as string
    const title = formData.get('title') as string || file.name
    const description = formData.get('description') as string || ''
    const tags = JSON.parse(formData.get('tags') as string || '[]')

    if (!file || !personId) {
      return NextResponse.json({ error: 'File and person ID required' }, { status: 400 })
    }

    // Verificar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    const uploadDir = await ensureUploadDir(personId)
    
    // Gerar nome único
    const ext = path.extname(file.name)
    const uniqueName = `${uuidv4()}${ext}`
    const filePath = path.join(uploadDir, uniqueName)
    
    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Salvar metadados
    const metadata = {
      originalName: file.name,
      title,
      description,
      tags,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type
    }
    
    const metadataPath = path.join(uploadDir, `${uniqueName}.json`)
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    return NextResponse.json({
      success: true,
      file: {
        id: uniqueName,
        name: uniqueName,
        url: `/api/media/stream?personId=${personId}&file=${encodeURIComponent(uniqueName)}`,
        ...metadata
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

// DELETE - Remover arquivo
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')
    const fileId = searchParams.get('fileId')

    if (!personId || !fileId) {
      return NextResponse.json({ error: 'Person ID and file ID required' }, { status: 400 })
    }

    const uploadDir = path.join(UPLOAD_BASE_DIR, personId)
    const filePath = path.join(uploadDir, fileId)
    const metadataPath = path.join(uploadDir, `${fileId}.json`)

    // Verificar se o arquivo existe e está dentro do diretório permitido
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    await unlink(filePath)
    
    // Tentar remover metadados (pode não existir)
    try {
      await unlink(metadataPath)
    } catch {
      // Ignorar se não existir
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}

// PUT - Atualizar metadados
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { personId, fileId, title, description, tags } = body

    if (!personId || !fileId) {
      return NextResponse.json({ error: 'Person ID and file ID required' }, { status: 400 })
    }

    const uploadDir = path.join(UPLOAD_BASE_DIR, personId)
    const metadataPath = path.join(uploadDir, `${fileId}.json`)

    // Ler metadados existentes
    let metadata = {}
    try {
      const existing = await fs.readFile(metadataPath, 'utf-8')
      metadata = JSON.parse(existing)
    } catch {
      // Se não existir, criar novo
    }

    // Atualizar metadados
    metadata = {
      ...metadata,
      title: title || metadata.title || fileId,
      description: description || metadata.description || '',
      tags: tags || metadata.tags || [],
      updatedAt: new Date().toISOString()
    }

    await writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    return NextResponse.json({ success: true, metadata })
  } catch (error) {
    console.error('Error updating metadata:', error)
    return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 })
  }
}
