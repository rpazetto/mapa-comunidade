import { useState, useEffect } from 'react';

interface Relationship {
  id: number;
  person_a_id: number;
  person_b_id: number;
  relationship_type: string;
  strength: number;
  notes?: string;
  related_person_id?: number;
  related_person_name?: string;
  related_person_context?: string;
  related_person_proximity?: string;
}

export function useRelationships(personId?: string) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar relacionamentos
  const fetchRelationships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = personId 
        ? `/api/relationships?personId=${personId}`
        : '/api/relationships';
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setRelationships(data);
    } catch (err) {
      setError('Erro ao carregar relacionamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Criar relacionamento
  const createRelationship = async (data: {
    person_a_id: number;
    person_b_id: number;
    relationship_type: string;
    strength?: number;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create');
      }
      
      // Recarregar lista
      await fetchRelationships();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar relacionamento');
      throw err;
    }
  };

  // Atualizar relacionamento
  const updateRelationship = async (id: number, updates: Partial<Relationship>) => {
    try {
      const response = await fetch('/api/relationships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update');
      }
      
      await fetchRelationships();
      return true;
    } catch (err) {
      setError('Erro ao atualizar relacionamento');
      throw err;
    }
  };

  // Deletar relacionamento
  const deleteRelationship = async (id: number) => {
    try {
      const response = await fetch(`/api/relationships?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      
      await fetchRelationships();
      return true;
    } catch (err) {
      setError('Erro ao deletar relacionamento');
      throw err;
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, [personId]);

  return {
    relationships,
    loading,
    error,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    refreshRelationships: fetchRelationships
  };
}
