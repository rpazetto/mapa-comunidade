// utils/photoStorage.ts
interface PhotoData {
  id: string;
  personId: string;
  imageData: string;
  compressed: string;
  originalSize: number;
  compressedSize: number;
  createdAt: Date;
  updatedAt: Date;
}

class PhotoStorageManager {
  private dbName = 'NodoPhotos';
  private dbVersion = 1;
  private storeName = 'photos';
  private db: IDBDatabase | null = null;

  // Inicializar IndexedDB
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('personId', 'personId', { unique: true });
        }
      };
    });
  }

  // Comprimir imagem
  async compressImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar e comprimir
        ctx.drawImage(img, 0, 0, width, height);
        
        // Tentar diferentes qualidades até ficar abaixo de 500KB
        let compressedData = canvas.toDataURL('image/jpeg', quality);
        let currentQuality = quality;
        
        while (compressedData.length > 500000 && currentQuality > 0.1) {
          currentQuality -= 0.1;
          compressedData = canvas.toDataURL('image/jpeg', currentQuality);
        }

        resolve(compressedData);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Salvar foto
  async savePhoto(personId: string, file: File): Promise<PhotoData> {
    if (!this.db) await this.initDB();

    // Comprimir imagem
    const compressedData = await this.compressImage(file);
    
    // Criar thumbnail ainda menor (100x100)
    const thumbnailData = await this.compressImage(file, 100, 100, 0.6);

    const photoData: PhotoData = {
      id: `photo_${personId}`,
      personId,
      imageData: compressedData,
      compressed: thumbnailData,
      originalSize: file.size,
      compressedSize: compressedData.length,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(photoData);

      request.onsuccess = () => {
        console.log('✅ Foto salva no IndexedDB:', personId);
        resolve(photoData);
      };
      request.onerror = () => {
        console.error('❌ Erro ao salvar foto:', request.error);
        reject(request.error);
      };
    });
  }

  // Buscar foto
  async getPhoto(personId: string): Promise<PhotoData | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(`photo_${personId}`);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error('❌ Erro ao buscar foto:', request.error);
        reject(request.error);
      };
    });
  }

  // Buscar todas as fotos
  async getAllPhotos(): Promise<Record<string, string>> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const photos: Record<string, string> = {};
        request.result.forEach((photo: PhotoData) => {
          photos[photo.personId] = photo.compressed; // Usar thumbnail para listagem
        });
        resolve(photos);
      };
      request.onerror = () => {
        console.error('❌ Erro ao buscar todas as fotos:', request.error);
        reject(request.error);
      };
    });
  }

  // Deletar foto
  async deletePhoto(personId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(`photo_${personId}`);

      request.onsuccess = () => {
        console.log('✅ Foto removida:', personId);
        resolve();
      };
      request.onerror = () => {
        console.error('❌ Erro ao remover foto:', request.error);
        reject(request.error);
      };
    });
  }

  // Limpar todas as fotos
  async clearAllPhotos(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('✅ Todas as fotos foram removidas');
        resolve();
      };
      request.onerror = () => {
        console.error('❌ Erro ao limpar fotos:', request.error);
        reject(request.error);
      };
    });
  }

  // Obter estatísticas de armazenamento
  async getStorageStats(): Promise<{count: number, totalSize: number}> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const photos = request.result;
        const stats = {
          count: photos.length,
          totalSize: photos.reduce((total: number, photo: PhotoData) => total + photo.compressedSize, 0)
        };
        resolve(stats);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Instância global
export const photoStorage = new PhotoStorageManager();

// Hook personalizado para React
export function usePhotoStorage() {
  const [photos, setPhotos] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);

  // Carregar fotos ao inicializar
  React.useEffect(() => {
    const loadPhotos = async () => {
      try {
        await photoStorage.initDB();
        const allPhotos = await photoStorage.getAllPhotos();
        setPhotos(allPhotos);
        console.log('📸 Fotos carregadas do IndexedDB:', Object.keys(allPhotos).length);
      } catch (error) {
        console.error('❌ Erro ao carregar fotos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  const savePhoto = async (personId: string, file: File) => {
    try {
      setLoading(true);
      const photoData = await photoStorage.savePhoto(personId, file);
      setPhotos(prev => ({
        ...prev,
        [personId]: photoData.compressed
      }));
      return photoData.compressed;
    } catch (error) {
      console.error('❌ Erro ao salvar foto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (personId: string) => {
    try {
      await photoStorage.deletePhoto(personId);
      setPhotos(prev => {
        const newPhotos = { ...prev };
        delete newPhotos[personId];
        return newPhotos;
      });
    } catch (error) {
      console.error('❌ Erro ao deletar foto:', error);
      throw error;
    }
  };

  const getFullSizePhoto = async (personId: string): Promise<string | null> => {
    try {
      const photoData = await photoStorage.getPhoto(personId);
      return photoData?.imageData || null;
    } catch (error) {
      console.error('❌ Erro ao buscar foto em tamanho original:', error);
      return null;
    }
  };

  return {
    photos,
    loading,
    savePhoto,
    deletePhoto,
    getFullSizePhoto
  };
}
