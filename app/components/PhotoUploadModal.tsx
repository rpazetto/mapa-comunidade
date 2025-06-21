import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelect: (photoData: string) => void;
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

  useEffect(() => {
    setPreview(currentPhoto || null);
  }, [currentPhoto]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (preview) {
      onPhotoSelect(preview);
    }
    onClose();
  };

  const handleRemove = () => {
    setPreview(null);
    if (personId) {
      onPhotoSelect(''); // Envia uma string vazia para indicar remoção
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Adicionar Foto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4">
          {preview ? (
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
          ) : (
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded mx-auto">
              <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="mb-4 w-full text-gray-900 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          {preview && (
            <button
              onClick={handleRemove}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Remover
            </button>
          )}
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={!preview}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
