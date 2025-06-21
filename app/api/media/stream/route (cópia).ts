import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// Usar o mesmo diretório externo
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || '/public/uploads'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const personId = searchParams.get('personId')
  const fileName = searchParams.get('file')

  if (!personId || !fileName) {
    return NextResponse.json({ error: 'Person ID and file name required' }, { status: 400 })
  }

  try {
    const filePath = path.join(UPLOAD_BASE_DIR, personId, fileName)
    
    // Verificar se o arquivo existe e está dentro do diretório permitido
    if (!filePath.startsWith(UPLOAD_BASE_DIR)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(filePath)
    
    // Determinar o tipo MIME
    const ext = path.extname(fileName).toLowerCase()
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
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream'

    // Criar resposta com headers apropriados
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error streaming file:', error)
    return NextResponse.json({ error: 'Failed to stream file' }, { status: 500 })
  }
}
