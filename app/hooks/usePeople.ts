import { useState, useEffect } from 'react';

interface Person {
  id: string;
  name: string;
  nickname?: string;
  context: string;
  proximity: string;
  importance?: number;
  trust_level?: number;
  influence_level?: number;
  occupation?: string;
  company?: string;
  position?: string;
  professional_class?: string;
  political_party?: string;
  political_position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  city?: string;
  state?: string;
  notes?: string;
  last_contact?: string;
  contact_frequency?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  zip_code?: string;
  whatsapp?: string;
  political_role?: string;
  is_candidate?: boolean;
  is_elected?: boolean;
}

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar pessoas do banco
  const fetchPeople = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/people');
      
      // Melhor tratamento de erro
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Erro HTTP: ${response.status} ${response.statusText}`;
        console.error('Erro ao buscar pessoas:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Garantir que data é um array
      if (Array.isArray(data)) {
        setPeople(data);
      } else {
        console.error('Resposta inválida da API:', data);
        setPeople([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pessoas';
      setError(errorMessage);
      console.error('Erro em fetchPeople:', err);
      setPeople([]); // Garantir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Adicionar pessoa
  const addPerson = async (person: Omit<Person, 'id'>) => {
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Erro da API:', responseData);
        const errorMessage = responseData.error || responseData.message || 'Failed to create';
        throw new Error(errorMessage);
      }
      
      // Recarregar todas as pessoas para garantir sincronização
      await fetchPeople();
      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar pessoa';
      setError(errorMessage);
      console.error('Erro completo:', err);
      throw err;
    }
  };

  // Atualizar pessoa
  const updatePerson = async (person: Person) => {
    try {
      console.log('Atualizando pessoa:', person);
      
      const response = await fetch('/api/people', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...person,
          // Garantir que o ID é enviado corretamente
          id: typeof person.id === 'string' ? parseInt(person.id) : person.id
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Erro da API:', responseData);
        throw new Error(responseData.error || 'Failed to update');
      }
      
      // Recarregar todas as pessoas para garantir sincronização
      await fetchPeople();
      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar pessoa';
      setError(errorMessage);
      console.error('Erro ao atualizar:', err);
      throw err;
    }
  };

  // Deletar pessoa
  const deletePerson = async (id: string) => {
    try {
      const response = await fetch(`/api/people?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }
      
      // Recarregar todas as pessoas
      await fetchPeople();
    } catch (err) {
      setError('Erro ao deletar pessoa');
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  return {
    people,
    loading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    refreshPeople: fetchPeople
  };
}
