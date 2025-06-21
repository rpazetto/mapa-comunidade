import { useState, useEffect, useCallback } from 'react';

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as tags
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Erro ao buscar tags');
      
      const data = await response.json();
      setTags(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar tags');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova tag
  const createTag = async (tag: Omit<Tag, 'id'>) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar tag');
      }
      
      const newTag = await response.json();
      setTags([...tags, newTag]);
      return newTag;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao criar tag');
    }
  };

  // Atualizar tag
  const updateTag = async (id: number, updates: Partial<Tag>) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar tag');
      
      setTags(tags.map(t => t.id === id ? { ...t, ...updates } : t));
      return true;
    } catch (err) {
      console.error('Erro ao atualizar tag:', err);
      return false;
    }
  };

  // Deletar tag
  const deleteTag = async (id: number) => {
    try {
      const response = await fetch(`/api/tags?tagId=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao deletar tag');
      
      setTags(tags.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao deletar tag:', err);
      return false;
    }
  };

  // Adicionar tag a pessoa
  const addTagToPerson = async (personId: string, tagId: number) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, tagId })
      });
      
      if (!response.ok) throw new Error('Erro ao adicionar tag');
      
      return true;
    } catch (err) {
      console.error('Erro ao adicionar tag à pessoa:', err);
      return false;
    }
  };

  // Remover tag de pessoa
  const removeTagFromPerson = async (personId: string, tagId: number) => {
    try {
      const response = await fetch(`/api/tags?personId=${personId}&tagId=${tagId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao remover tag');
      
      return true;
    } catch (err) {
      console.error('Erro ao remover tag da pessoa:', err);
      return false;
    }
  };

  // Buscar tags de uma pessoa
  const getPersonTags = async (personId: string): Promise<Tag[]> => {
    try {
      const response = await fetch(`/api/tags?personId=${personId}`);
      if (!response.ok) throw new Error('Erro ao buscar tags da pessoa');
      
      return await response.json();
    } catch (err) {
      console.error('Erro ao buscar tags da pessoa:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    addTagToPerson,
    removeTagFromPerson,
    getPersonTags,
    refreshTags: fetchTags
  };
}
