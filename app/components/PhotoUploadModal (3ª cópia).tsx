import React, { useState, useEffect } from 'react';
import { Camera, X, Info, Database } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelect: (photoData: string | File) => void;
  currentPhoto?: string;
  personId?: string;
}

export default function PhotoUploadModal({
  isOpen,
  onClose,
  onPhotoSelect,
  currentPhoto,
  personId,
}: PhotoUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setPreview(currentPhoto || null);
    setSelectedFile(null);
  }, [currentPhoto]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 Arquivo selecionado');
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        console.warn('⚠️ Arquivo muito grande:', file.size);
        alert('Por favor, selecione uma imagem menor que 5MB.');
        return;
      }
      console.log('✅ Arquivo válido:', file.name, file.type, file.size);
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('📖 Arquivo lido com sucesso, tamanho:', result.length);
        setPreview(result);
      };
      reader.onerror = (e) => {
        console.error('❌ Erro ao ler arquivo:', e);
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('⚠️ Arquivo inválido ou não selecionado:', file?.name);
    }
  };

  const handleSave = () => {
    console.log('🔥 === BOTÃO SALVAR CLICADO ===');
    console.log('Estado:', { preview: !!preview, selectedFile: !!selectedFile, isProcessing });
    
    if (!preview) {
      console.log('❌ Sem preview - abortando');
      return;
    }
    
    if (isProcessing) {
      console.log('⏳ Já processando - abortando');
      return;
    }
    
    console.log('🚀 Iniciando processo de salvamento');
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        console.log('📤 Enviando preview para onPhotoSelect');
        onPhotoSelect(preview); // Sempre passar a string base64
        console.log('✅ onPhotoSelect chamado com sucesso');
      } catch (error) {
        console.error('❌ Erro:', error);
      } finally {
        setTimeout(() => {
          console.log('🔚 Fechando modal');
          setIsProcessing(false);
          onClose();
        }, 1000);
      }
    }, 100);
  };

  const handleRemove = () => {
    console.log('🗑️ Botão remover clicado para pessoa:', personId);
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        console.log('📤 Enviando comando de remoção para onPhotoSelect');
        onPhotoSelect(''); // String vazia indica remoção
        console.log('✅ Comando de remoção enviado');
      } catch (error) {
        console.error('❌ Erro ao remover:', error);
      } finally {
        setTimeout(() => {
          console.log('🔚 Fechando modal após remoção');
          setPreview(null);
          setSelectedFile(null);
          setIsProcessing(false);
          onClose();
        }, 500);
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Foto Permanente
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-4">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded mx-auto">
              <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="w-full text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 disabled:opacity-50"
          />
          
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <div className="font-semibold mb-1">Sistema de Alta Capacidade:</div>
                <ul className="space-y-1">
                  <li>• Armazenamento permanente no IndexedDB</li>
                  <li>• Compressão inteligente automática</li>
                  <li>• Capacidade: centenas de fotos</li>
                  <li>• Persistência garantida</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Removendo...' : 'Remover'}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!preview || isProcessing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </div>
            ) : (
              'Salvar Permanente'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
