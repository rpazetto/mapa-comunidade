'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  X, Upload, Download, Trash2, Edit3, Tag, Image, FileText, 
  Film, Music, File, Search, Filter, Grid, List, Eye, Plus,
  CheckCircle, AlertCircle
} from 'lucide-react'

interface MediaFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  title: string
  description: string
  tags: string[]
  uploadedAt: string
  originalName?: string
}

interface PersonMediaVaultProps {
  personId: string
  personName: string
  onClose: () => void
}

export default function PersonMediaVault({ personId, personName, onClose }: PersonMediaVaultProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  
  // Estados para preview
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  // Estados para edição
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    loadFiles()
  }, [personId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/media?personId=${personId}`)
      if (response.ok) {
        const data = await response.json()
        setMediaFiles(data.files || [])
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 50MB')
      return
    }

    try {
      setUploading(true)
      setUploadStatus('uploading')
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('personId', personId)
      formData.append('title', file.name)
      formData.append('description', '')
      formData.append('tags', JSON.stringify([]))

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setMediaFiles(prev => [...prev, data.file])
        setUploadStatus('success')
        setUploadProgress(100)
        
        // Limpar após 2 segundos
        setTimeout(() => {
          setUploadStatus('idle')
          setUploadProgress(0)
        }, 2000)
        
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        throw new Error('Erro no upload')
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      setUploadStatus('error')
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) return

    try {
      const response = await fetch(`/api/media?personId=${personId}&fileId=${fileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMediaFiles(prev => prev.filter(f => f.id !== fileId))
        if (previewFile?.id === fileId) {
          setPreviewFile(null)
          setShowPreview(false)
        }
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      alert('Erro ao deletar arquivo')
    }
  }

  const handleUpdateMetadata = async () => {
    if (!editingFile) return

    try {
      const response = await fetch('/api/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          fileId: editingFile.id,
          title: editTitle,
          description: editDescription,
          tags: editTags
        })
      })

      if (response.ok) {
        setMediaFiles(prev => prev.map(f => 
          f.id === editingFile.id 
            ? { ...f, title: editTitle, description: editDescription, tags: editTags }
            : f
        ))
        setEditingFile(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error)
      alert('Erro ao atualizar informações do arquivo')
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag))
  }

  // Obter todas as tags únicas
  const allTags = Array.from(new Set(
    mediaFiles.flatMap(file => file.tags || [])
  ))

  // Filtrar arquivos
  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || getFileCategory(file.type) === filterType
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => file.tags.includes(tag))
    
    return matchesSearch && matchesType && matchesTags
  })

  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf') || mimeType.includes('document') || 
        mimeType.includes('sheet') || mimeType.includes('text')) return 'document'
    return 'other'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (mimeType: string) => {
    const category = getFileCategory(mimeType)
    switch (category) {
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Film className="w-5 h-5" />
      case 'audio': return <Music className="w-5 h-5" />
      case 'document': return <FileText className="w-5 h-5" />
      default: return <File className="w-5 h-5" />
    }
  }

  const renderPreview = (file: MediaFile) => {
    const category = getFileCategory(file.type)
    
    switch (category) {
      case 'image':
        return <img src={file.url} alt={file.title} className="max-w-full max-h-[60vh] object-contain mx-auto" />
      
      case 'video':
        return (
          <video controls className="max-w-full max-h-[60vh] mx-auto">
            <source src={file.url} type={file.type} />
            Seu navegador não suporta vídeo.
          </video>
        )
      
      case 'audio':
        return (
          <div className="w-full max-w-md mx-auto">
            <audio controls className="w-full">
              <source src={file.url} type={file.type} />
              Seu navegador não suporta áudio.
            </audio>
          </div>
        )
      
      case 'document':
        if (file.type === 'application/pdf') {
          return <iframe src={file.url} className="w-full h-[60vh]" title={file.title} />
        }
        // Fallthrough
      
      default:
        return (
          <div className="text-center py-12">
            {getFileIcon(file.type)}
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Preview não disponível para este tipo de arquivo
            </p>
            <a 
              href={file.url} 
              download={file.originalName || file.name}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar arquivo
            </a>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Media Vault
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{personName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
                {uploadStatus !== 'idle' && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        uploadStatus === 'success' ? 'bg-green-500' : 
                        uploadStatus === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar arquivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="all">Todos os tipos</option>
                <option value="image">Imagens</option>
                <option value="video">Vídeos</option>
                <option value="audio">Áudios</option>
                <option value="document">Documentos</option>
                <option value="other">Outros</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredFiles.length} arquivo{filteredFiles.length !== 1 ? 's' : ''} encontrado{filteredFiles.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || selectedTags.length > 0
                  ? 'Nenhum arquivo encontrado'
                  : 'Nenhum arquivo no acervo'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setPreviewFile(file)
                    setShowPreview(true)
                  }}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {getFileCategory(file.type) === 'image' ? (
                      <img src={file.url} alt={file.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(file.url, '_blank')
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingFile(file)
                          setEditTitle(file.title)
                          setEditDescription(file.description)
                          setEditTags(file.tags)
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                      >
                        <Edit3 className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(file.id)
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {file.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div 
                    className="flex items-center space-x-4 flex-1 cursor-pointer"
                    onClick={() => {
                      setPreviewFile(file)
                      setShowPreview(true)
                    }}
                  >
                    <div className="text-gray-400">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{file.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                      {file.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {file.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFile(file)
                        setEditTitle(file.title)
                        setEditDescription(file.description)
                        setEditTags(file.tags)
                      }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && previewFile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previewFile.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(previewFile.url, '_blank')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingFile(previewFile)
                      setEditTitle(previewFile.title)
                      setEditDescription(previewFile.description)
                      setEditTags(previewFile.tags)
                      setShowPreview(false)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {renderPreview(previewFile)}
                {previewFile.description && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Descrição</h4>
                    <p className="text-gray-700 dark:text-gray-300">{previewFile.description}</p>
                  </div>
                )}
                {previewFile.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {previewFile.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Editar Informações
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editTags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Adicionar tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setEditingFile(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateMetadata}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
