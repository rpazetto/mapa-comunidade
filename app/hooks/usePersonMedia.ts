import { useState, useEffect, useCallback } from 'react';

interface MediaItem {
  id: string;
  type: 'audio' | 'video' | 'mindmap' | 'document' | 'image' | 'meeting';
  title: string;
  description?: string;
  file_url?: string;
  file_size?: string;
  duration?: string;
  date: string;
  tags: string[];
  location?: string;
  participants?: string[];
  is_private: boolean;
  is_favorite: boolean;
  transcript?: string;
  notes?: string;
}

export function usePersonMedia(personId: string) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    if (!personId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/person-media?personId=${personId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      setMediaItems(data);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  const addMedia = async (mediaData: Omit<MediaItem, 'id'>) => {
    try {
      setError(null);
      const response = await fetch('/api/person-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mediaData, person_id: personId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add media');
      }
      
      await fetchMedia();
      return true;
    } catch (err) {
      console.error('Error adding media:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const updateMedia = async (id: string, updates: Partial<MediaItem>) => {
    try {
      setError(null);
      const response = await fetch('/api/person-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update media');
      }
      
      await fetchMedia();
      return true;
    } catch (err) {
      console.error('Error updating media:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/person-media?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }
      
      await fetchMedia();
      return true;
    } catch (err) {
      console.error('Error deleting media:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return {
    mediaItems,
    loading,
    error,
    addMedia,
    updateMedia,
    deleteMedia,
    refreshMedia: fetchMedia,
  };
}
